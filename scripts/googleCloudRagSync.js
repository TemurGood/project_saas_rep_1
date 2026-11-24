import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import { parseMarkdownFiles } from './markdownParser.js';

// Helper to parse .env dynamically so changes to .env are picked up immediately
function getEnvVars() {
  const envFile = fs.existsSync('.env') ? fs.readFileSync('.env', 'utf-8') : '';
  const vars = { ...process.env };
  for (const line of envFile.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const k = trimmed.slice(0, eqIdx).trim();
      const v = trimmed.slice(eqIdx + 1).trim();
      vars[k] = v;
    }
  }
  return vars;
}

async function getEmbedding(text, apiKey, embeddingModel) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${embeddingModel}:embedContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: `models/${embeddingModel}`,
      content: { parts: [{ text }] },
      taskType: 'RETRIEVAL_DOCUMENT',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Embedding API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data?.embedding?.values;
}

/**
 * Parse a .docx buffer into semantic RAG chunks
 */
async function parseDocxBufferToChunks(buffer, category, prefix) {
  const result = await mammoth.extractRawText({ buffer });
  const rawText = result.value || '';
  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);

  const chunks = [];
  let currentTitle = `${prefix} (Общая информация)`;
  let currentLines = [];

  // Split by numbered sections (e.g. "1.1. ", "Вопрос 1:", "1. ")
  const sectionRegex = /^(\d+\.\d+\.?\s+|Вопрос\s+\d+:|Сводная таблица|\d+\.\s+[А-ЯA-Z])/;

  for (const line of lines) {
    if (sectionRegex.test(line) && currentLines.length > 0) {
      const text = currentLines.join('\n').trim();
      if (text.length > 40) {
        chunks.push({
          id: `${prefix}-${chunks.length + 1}`,
          category,
          title: currentTitle,
          text,
        });
      }
      currentTitle = line;
      currentLines = [line];
    } else {
      if (currentLines.length === 0 && line.length < 100) {
        currentTitle = line;
      }
      currentLines.push(line);
    }
  }

  if (currentLines.length > 0) {
    const text = currentLines.join('\n').trim();
    if (text.length > 40) {
      chunks.push({
        id: `${prefix}-${chunks.length + 1}`,
        category,
        title: currentTitle,
        text,
      });
    }
  }

  return chunks;
}

/**
 * Parse an .xlsx buffer (Teachers & Schedule) into semantic RAG chunks
 */
function parseExcelBufferToChunks(buffer) {
  const wb = XLSX.read(buffer, { type: 'buffer' });
  const chunks = [];

  // Sheet 1: Teachers & Schedule
  const firstSheetName = wb.SheetNames[0];
  if (firstSheetName) {
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[firstSheetName]);
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const name = row['ФИО'] || row['Имя'] || row['Name'] || row['Преподаватель'];
      if (!name) continue;

      const role = row['Должность'] || row['Направление'] || row['Role'] || '';
      const lines = Object.entries(row)
        .filter(([k, v]) => k !== 'ID' && v !== undefined && String(v).trim() !== '')
        .map(([k, v]) => `- ${k}: ${v}`);

      chunks.push({
        id: `excel-teacher-${i + 1}`,
        category: 'schedule',
        title: `Расписание преподавателя ${name}${role ? ` (${role})` : ''}`,
        text: `Преподаватель ${name}${role ? ` — ${role}` : ''}:\n${lines.join('\n')}`,
      });
    }
  }

  // Sheet 2 (if exists): Campus & Contacts
  if (wb.SheetNames.length > 1) {
    const secondSheetName = wb.SheetNames[1];
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[secondSheetName]);
    if (rows.length > 0) {
      const infoLines = rows.map((r) => {
        const vals = Object.values(r).filter(Boolean);
        return `- ${vals.join(': ')}`;
      });
      chunks.push({
        id: 'excel-campus-contacts',
        category: 'schedule',
        title: 'График работы кампуса, адрес и контакты',
        text: `График работы, адрес и контакты Apex IT Academy:\n${infoLines.join('\n')}`,
      });
    }
  }

  return chunks;
}

/**
 * Fetch file metadata and buffer from Google Drive API v3 (Service Account)
 */
async function fetchFromGoogleDrive(drive, fileId, expectedType) {
  const meta = await drive.files.get({
    fileId,
    fields: 'id, name, modifiedTime, mimeType',
  });

  const { mimeType, modifiedTime, name } = meta.data;
  let buffer;

  if (mimeType === 'application/vnd.google-apps.document') {
    const res = await drive.files.export(
      {
        fileId,
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      },
      { responseType: 'arraybuffer' }
    );
    buffer = Buffer.from(res.data);
  } else if (mimeType === 'application/vnd.google-apps.spreadsheet') {
    const res = await drive.files.export(
      {
        fileId,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
      { responseType: 'arraybuffer' }
    );
    buffer = Buffer.from(res.data);
  } else {
    // Raw .docx or .xlsx uploaded directly to Google Drive
    const res = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'arraybuffer' }
    );
    buffer = Buffer.from(res.data);
  }

  return { name, modifiedTime, mimeType, buffer, expectedType };
}

/**
 * Main synchronized RAG check & rebuild function
 */
function extractDriveId(val) {
  if (!val) return '';
  const match = val.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : val.trim();
}

export async function syncAndReindexRag() {
  const env = getEnvVars();
  const apiKey = env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY;
  const embeddingModel = env.VITE_GEMINI_EMBEDDING_MODEL || 'gemini-embedding-001';

  const credPath = path.resolve(env.GOOGLE_SERVICE_ACCOUNT_PATH || 'google-credentials.json');
  let docPriceId = extractDriveId(env.GOOGLE_DOC_PRICE_ID);
  let docFaqId = extractDriveId(env.GOOGLE_DOC_FAQ_ID);
  let sheetScheduleId = extractDriveId(env.GOOGLE_SHEET_SCHEDULE_ID);

  const vectorStorePath = path.resolve('src/data/vectorKnowledgeBase.json');
  const statePath = path.resolve('.google_rag_state.json');

  let prevState = {};
  if (fs.existsSync(statePath)) {
    try {
      prevState = JSON.parse(fs.readFileSync(statePath, 'utf-8'));
    } catch {}
  }

  let drive = null;
  let useGoogleCloud = false;

  if (fs.existsSync(credPath)) {
    const auth = new google.auth.GoogleAuth({
      keyFile: credPath,
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });
    drive = google.drive({ version: 'v3', auth });

    // Auto-discover shared files if IDs are not explicitly set in .env
    if (!docPriceId && !docFaqId && !sheetScheduleId) {
      try {
        const listRes = await drive.files.list({
          q: 'trashed = false',
          fields: 'files(id, name, mimeType, modifiedTime)',
        });
        const files = listRes.data.files || [];
        for (const f of files) {
          const lname = (f.name || '').toLowerCase();
          if (lname.includes('price') || lname.includes('прайс')) docPriceId = f.id;
          else if (lname.includes('faq') || lname.includes('вопрос')) docFaqId = f.id;
          else if (
            lname.includes('schedule') ||
            lname.includes('teacher') ||
            lname.includes('распис') ||
            lname.includes('преподав') ||
            f.mimeType === 'application/vnd.google-apps.spreadsheet' ||
            lname.endsWith('.xlsx')
          ) {
            sheetScheduleId = f.id;
          }
        }
      } catch (err) {
        console.warn('[Google Cloud RAG] Auto-discovery warning:', err.message);
      }
    }

    useGoogleCloud = Boolean(docPriceId || docFaqId || sheetScheduleId);
  }

  let allChunks = [];
  let sourceMode = 'local';
  let needsReindex = !fs.existsSync(vectorStorePath);
  const nextState = {};

  if (useGoogleCloud && drive) {
    sourceMode = 'google-cloud';

    // Check modifiedTime for each configured Google Drive document
    const targets = [
      { key: 'price', id: docPriceId, type: 'docx' },
      { key: 'faq', id: docFaqId, type: 'docx' },
      { key: 'schedule', id: sheetScheduleId, type: 'xlsx' },
    ].filter((t) => Boolean(t.id));

    const fetchedDocs = {};

    for (const target of targets) {
      const meta = await drive.files.get({
        fileId: target.id,
        fields: 'id, name, modifiedTime, mimeType',
      });
      const modTime = meta.data.modifiedTime;
      nextState[target.key] = modTime;

      if (prevState[target.key] !== modTime) {
        needsReindex = true;
      }
    }

    if (!needsReindex && fs.existsSync(vectorStorePath)) {
      const existing = JSON.parse(fs.readFileSync(vectorStorePath, 'utf-8'));
      return { reindexed: false, sourceMode, chunks: existing };
    }

    console.log('[Google Cloud RAG] Modification detected in Google Drive documents. Fetching & re-indexing...');
    for (const target of targets) {
      const docData = await fetchFromGoogleDrive(drive, target.id, target.type);
      fetchedDocs[target.key] = docData;
    }

    if (fetchedDocs.price) {
      const priceChunks = await parseDocxBufferToChunks(fetchedDocs.price.buffer, 'price', 'gdoc-price');
      allChunks.push(...priceChunks);
    }
    if (fetchedDocs.faq) {
      const faqChunks = await parseDocxBufferToChunks(fetchedDocs.faq.buffer, 'faq', 'gdoc-faq');
      allChunks.push(...faqChunks);
    }
    if (fetchedDocs.schedule) {
      const schedChunks = parseExcelBufferToChunks(fetchedDocs.schedule.buffer);
      allChunks.push(...schedChunks);
    }
  } else {
    // Local fallback: check rag_data/export/*.docx & *.xlsx AND rag_data/*.md
    const exportPrice = path.resolve('rag_data/export/Apex_Price_List.docx');
    const exportFaq = path.resolve('rag_data/export/Apex_FAQ.docx');
    const exportExcel = path.resolve('rag_data/export/Apex_Teachers_Schedule.xlsx');
    const mdFiles = ['rag_data/price_list.md', 'rag_data/faq.md', 'rag_data/schedule.md'];

    // Compare modification timestamps
    let maxLocalMtime = 0;
    for (const f of [exportPrice, exportFaq, exportExcel, ...mdFiles.map((m) => path.resolve(m))]) {
      if (fs.existsSync(f)) {
        const m = fs.statSync(f).mtimeMs;
        if (m > maxLocalMtime) maxLocalMtime = m;
      }
    }
    const storeMtime = fs.existsSync(vectorStorePath) ? fs.statSync(vectorStorePath).mtimeMs : 0;
    nextState.localMtime = maxLocalMtime;

    if (maxLocalMtime <= storeMtime && fs.existsSync(vectorStorePath)) {
      const existing = JSON.parse(fs.readFileSync(vectorStorePath, 'utf-8'));
      return { reindexed: false, sourceMode: 'local-cache', chunks: existing };
    }

    needsReindex = true;
    console.log('[Local RAG Sync] Local document modification detected. Rebuilding vector store...');

    // Prioritize .md if newer than export, else use .docx and .xlsx
    const mdMax = Math.max(...mdFiles.map((m) => (fs.existsSync(path.resolve(m)) ? fs.statSync(path.resolve(m)).mtimeMs : 0)));
    const exportMax = Math.max(
      fs.existsSync(exportPrice) ? fs.statSync(exportPrice).mtimeMs : 0,
      fs.existsSync(exportExcel) ? fs.statSync(exportExcel).mtimeMs : 0
    );

    if (mdMax >= exportMax) {
      allChunks = parseMarkdownFiles();
    } else {
      if (fs.existsSync(exportPrice)) {
        allChunks.push(...(await parseDocxBufferToChunks(fs.readFileSync(exportPrice), 'price', 'docx-price')));
      }
      if (fs.existsSync(exportFaq)) {
        allChunks.push(...(await parseDocxBufferToChunks(fs.readFileSync(exportFaq), 'faq', 'docx-faq')));
      }
      if (fs.existsSync(exportExcel)) {
        allChunks.push(...parseExcelBufferToChunks(fs.readFileSync(exportExcel)));
      }
    }
  }

  // Load existing vectors by exact text to avoid unnecessary API calls for unchanged chunks
  let existingVectors = [];
  if (fs.existsSync(vectorStorePath)) {
    try {
      existingVectors = JSON.parse(fs.readFileSync(vectorStorePath, 'utf-8'));
    } catch {}
  }

  const vectorByTextMap = new Map();
  for (const v of existingVectors) {
    if (v.text && v.vector) vectorByTextMap.set(v.text, v.vector);
  }

  const finalChunks = [];
  for (const chunk of allChunks) {
    let vector = vectorByTextMap.get(chunk.text);
    if (!vector && apiKey) {
      console.log(`[RAG Vectorizer] Embedding new/changed chunk: "${chunk.title}"...`);
      try {
        vector = await getEmbedding(chunk.text, apiKey, embeddingModel);
        await new Promise((r) => setTimeout(r, 150));
      } catch (err) {
        console.error(`[RAG Vectorizer] Failed for "${chunk.title}":`, err.message);
      }
    }
    if (vector) {
      finalChunks.push({ ...chunk, vector });
    }
  }

  fs.writeFileSync(vectorStorePath, JSON.stringify(finalChunks, null, 2), 'utf-8');
  fs.writeFileSync(statePath, JSON.stringify(nextState, null, 2), 'utf-8');
  console.log(`[RAG Sync] Complete (${sourceMode}). Saved ${finalChunks.length} chunks.`);

  return { reindexed: true, sourceMode, chunks: finalChunks };
}
