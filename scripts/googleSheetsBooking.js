import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import * as XLSX from 'xlsx';

function getEnvVars() {
  const envFile = fs.existsSync('.env') ? fs.readFileSync('.env', 'utf-8') : '';
  const vars = { ...process.env };
  for (const line of envFile.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      vars[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim();
    }
  }
  return vars;
}

function extractDriveId(val) {
  if (!val) return '';
  const match = val.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : val.trim();
}

export const BOOKING_HEADERS = [
  '№',
  'Дата записи',
  'ФИО студента',
  'Телефон',
  'Email',
  'Направление / Курс',
  'Преподаватель',
  'День недели',
  'Время',
  'Формат',
  'Статус',
  'Комментарий',
];

export const DAYS_OF_WEEK = [
  'Понедельник',
  'Вторник',
  'Среда',
  'Четверг',
  'Пятница',
  'Суббота',
];

export const TIME_SLOTS = [
  '10:00',
  '12:00',
  '14:00',
  '16:00',
  '17:30',
  '19:00',
];

export const DEFAULT_TEACHERS = [
  { name: 'Тимур Алимов', track: 'Frontend' },
  { name: 'Мадина Каримова', track: 'Backend' },
  { name: 'Сардор Рахимов', track: 'UI/UX Дизайн' },
  { name: 'Жасур Усманов', track: 'Mobile (Flutter & iOS)' },
  { name: 'Елена Волкова', track: 'Data Science & AI' },
  { name: 'Бобур Мирзаев', track: 'DevOps & Cloud' },
];

function getAuth() {
  const env = getEnvVars();
  const credPath = path.resolve(env.GOOGLE_SERVICE_ACCOUNT_PATH || 'google-credentials.json');
  return new google.auth.GoogleAuth({
    keyFile: credPath,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive',
    ],
  });
}

function getSpreadsheetId() {
  const env = getEnvVars();
  return extractDriveId(
    env.GOOGLE_SHEET_BOOKINGS_ID || '13p_1kXURLoi0MJyoFc7VPGpenkzSahjCf6pSPTPIUSo'
  );
}

/**
 * Read all existing rows from the Google Sheet
 */
export async function readBookingsFromSheet() {
  const auth = getAuth();
  const spreadsheetId = getSpreadsheetId();
  const sheets = google.sheets({ version: 'v4', auth });

  try {
    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetTitle = meta.data.sheets?.[0]?.properties?.title || 'Лист1';

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetTitle}!A1:L1000`,
    });

    const rows = (res.data.values || []).filter((r) =>
      r.some((cell) => String(cell || '').trim() !== '')
    );
    if (rows.length === 0) {
      // Initialize headers if sheet is completely empty
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetTitle}!A1:L1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [BOOKING_HEADERS] },
      });
      return { sheetTitle, headers: BOOKING_HEADERS, rows: [], method: 'sheets-api' };
    }

    const headers = rows[0];
    const dataRows = rows.slice(1).map((r) => {
      const obj = {};
      BOOKING_HEADERS.forEach((h, idx) => {
        obj[h] = r[idx] || '';
      });
      return obj;
    });

    return { sheetTitle, headers, rows: dataRows, rawRows: rows, method: 'sheets-api' };
  } catch (err) {
    // Fallback to Google Drive API export if Sheets API v4 is not yet enabled in Cloud Console
    if (err.message?.includes('has not been used in project') || err.code === 403) {
      console.warn('[Bookings] Sheets API v4 disabled, falling back to Drive API export...');
      const drive = google.drive({ version: 'v3', auth });
      const res = await drive.files.export(
        {
          fileId: spreadsheetId,
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
        { responseType: 'arraybuffer' }
      );
      const wb = XLSX.read(Buffer.from(res.data), { type: 'buffer' });
      const sheetTitle = wb.SheetNames[0] || 'Лист1';
      const rawRows = XLSX.utils.sheet_to_json(wb.Sheets[sheetTitle], { header: 1 }).filter((r) =>
        Array.isArray(r) && r.some((cell) => String(cell || '').trim() !== '')
      );

      if (rawRows.length === 0) {
        return { sheetTitle, headers: BOOKING_HEADERS, rows: [], rawRows: [BOOKING_HEADERS], method: 'drive-fallback' };
      }

      const dataRows = rawRows.slice(1).map((r) => {
        const obj = {};
        BOOKING_HEADERS.forEach((h, idx) => {
          obj[h] = r[idx] || '';
        });
        return obj;
      });
      return { sheetTitle, headers: rawRows[0], rows: dataRows, rawRows, method: 'drive-fallback' };
    }
    throw err;
  }
}

export function normalizePhone(phone) {
  return String(phone || '').replace(/\D/g, '');
}

/**
 * Append a new student booking or UPDATE existing booking if the same user (phone / session) already exists.
 * Prevents creating duplicate records for the same user.
 */
export async function appendBookingToSheet(booking) {
  const auth = getAuth();
  const spreadsheetId = getSpreadsheetId();
  const current = await readBookingsFromSheet();
  const nowStr = new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Tashkent' });

  const targetPhoneNorm = normalizePhone(booking.phone);
  const existingIdx = current.rows.findIndex((r) => {
    const rPhoneNorm = normalizePhone(r['Телефон']);
    if (targetPhoneNorm && rPhoneNorm && rPhoneNorm === targetPhoneNorm) {
      return true;
    }
    if (booking.existingRowNumber && String(r['№']) === String(booking.existingRowNumber)) {
      return true;
    }
    return false;
  });

  if (existingIdx >= 0) {
    // Update existing row in-place instead of creating a duplicate
    const existingRow = current.rows[existingIdx];
    const sheetRowNum = existingIdx + 2; // +1 for 1-based, +1 for header row
    const recordNum = existingRow['№'] || String(existingIdx + 1);

    const updatedRowValues = [
      String(recordNum),
      nowStr,
      booking.name || existingRow['ФИО студента'] || '',
      booking.phone || existingRow['Телефон'] || '',
      booking.email && booking.email !== '—' ? booking.email : (existingRow['Email'] || '—'),
      booking.course || existingRow['Направление / Курс'] || 'Общая консультация',
      booking.teacher || existingRow['Преподаватель'] || 'Любой свободный ментор',
      booking.day || existingRow['День недели'] || 'По согласованию',
      booking.time || existingRow['Время'] || 'По согласованию',
      booking.format || existingRow['Формат'] || 'Офлайн (кампус)',
      'Обновлена',
      booking.comment || existingRow['Комментарий'] || '',
    ];

    if (current.method === 'sheets-api') {
      const sheets = google.sheets({ version: 'v4', auth });
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${current.sheetTitle}!A${sheetRowNum}:L${sheetRowNum}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [updatedRowValues],
        },
      });
    } else {
      const drive = google.drive({ version: 'v3', auth });
      const updatedAllRows = [...current.rawRows];
      updatedAllRows[existingIdx + 1] = updatedRowValues;

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(updatedAllRows);
      XLSX.utils.book_append_sheet(wb, ws, current.sheetTitle || 'Лист1');
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      const { Readable } = await import('stream');
      await drive.files.update({
        fileId: spreadsheetId,
        media: {
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          body: Readable.from(buffer),
        },
      });
    }

    return {
      success: true,
      updated: true,
      rowNumber: Number(recordNum),
      message: 'Существующая запись пользователя обновлена (дубликат не создан).',
      booking: Object.fromEntries(BOOKING_HEADERS.map((h, i) => [h, updatedRowValues[i]])),
    };
  }

  // Create new row
  const nextNumber = current.rows.length + 1;
  const newRowValues = [
    String(nextNumber),
    nowStr,
    booking.name || '',
    booking.phone || '',
    booking.email || '—',
    booking.course || 'Общая консультация',
    booking.teacher || 'Любой свободный ментор',
    booking.day || 'По согласованию',
    booking.time || 'По согласованию',
    booking.format || 'Офлайн (кампус)',
    'Новая запись',
    booking.comment || '',
  ];

  if (current.method === 'sheets-api') {
    const sheets = google.sheets({ version: 'v4', auth });
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${current.sheetTitle}!A:L`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [newRowValues],
      },
    });
  } else {
    const drive = google.drive({ version: 'v3', auth });
    const updatedRows =
      current.rawRows && current.rawRows.length > 0
        ? [...current.rawRows, newRowValues]
        : [BOOKING_HEADERS, newRowValues];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(updatedRows);
    XLSX.utils.book_append_sheet(wb, ws, current.sheetTitle || 'Лист1');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    const { Readable } = await import('stream');
    await drive.files.update({
      fileId: spreadsheetId,
      media: {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        body: Readable.from(buffer),
      },
    });
  }

  return {
    success: true,
    updated: false,
    rowNumber: nextNumber,
    booking: Object.fromEntries(BOOKING_HEADERS.map((h, i) => [h, newRowValues[i]])),
  };
}

/**
 * Find available (free) time slots by comparing standard schedule slots against booked rows in Google Sheet
 */
export async function findAvailableSlots({ day, teacher, course, excludePhone } = {}) {
  const { rows } = await readBookingsFromSheet();
  const excludeNorm = normalizePhone(excludePhone);

  // Filter out cancelled bookings (and optionally user's own booking when updating)
  const activeBookings = rows.filter((r) => {
    if (String(r['Статус'] || '').toLowerCase().includes('отмен')) return false;
    if (excludeNorm && normalizePhone(r['Телефон']) === excludeNorm) return false;
    return true;
  });

  const targetDays = day
    ? DAYS_OF_WEEK.filter((d) => d.toLowerCase().includes(day.toLowerCase()))
    : DAYS_OF_WEEK;

  const daysToSearch = targetDays.length > 0 ? targetDays : DAYS_OF_WEEK;

  let teachersToSearch = DEFAULT_TEACHERS;
  if (teacher) {
    const matched = DEFAULT_TEACHERS.filter((t) =>
      t.name.toLowerCase().includes(teacher.toLowerCase())
    );
    if (matched.length > 0) teachersToSearch = matched;
  } else if (course) {
    const matched = DEFAULT_TEACHERS.filter(
      (t) =>
        t.track.toLowerCase().includes(course.toLowerCase()) ||
        course.toLowerCase().includes(t.track.toLowerCase().split(' ')[0])
    );
    if (matched.length > 0) teachersToSearch = matched;
  }

  const freeSlotsByDay = [];

  for (const d of daysToSearch) {
    const dayFreeSlots = [];

    for (const time of TIME_SLOTS) {
      for (const t of teachersToSearch) {
        const isBooked = activeBookings.some((b) => {
          const bDay = String(b['День недели'] || '').toLowerCase();
          const bTime = String(b['Время'] || '').toLowerCase();
          const bTeacher = String(b['Преподаватель'] || '').toLowerCase();

          return (
            bDay === d.toLowerCase() &&
            bTime.includes(time) &&
            (bTeacher.includes(t.name.toLowerCase()) || bTeacher === 'любой свободный ментор')
          );
        });

        if (!isBooked) {
          dayFreeSlots.push({
            day: d,
            time,
            teacher: t.name,
            track: t.track,
          });
        }
      }
    }

    freeSlotsByDay.push({
      day: d,
      availableCount: dayFreeSlots.length,
      slots: dayFreeSlots,
    });
  }

  return {
    totalActiveBookings: activeBookings.length,
    schedule: freeSlotsByDay,
  };
}
