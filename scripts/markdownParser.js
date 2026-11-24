import fs from 'fs';
import path from 'path';

// Parse rag_data markdown files directly into structured chunks
export function parseMarkdownFiles() {
  const schedulePath = path.resolve('rag_data/schedule.md');
  const pricePath = path.resolve('rag_data/price_list.md');
  const faqPath = path.resolve('rag_data/faq.md');

  const scheduleContent = fs.existsSync(schedulePath) ? fs.readFileSync(schedulePath, 'utf-8') : '';
  const priceContent = fs.existsSync(pricePath) ? fs.readFileSync(pricePath, 'utf-8') : '';
  const faqContent = fs.existsSync(faqPath) ? fs.readFileSync(faqPath, 'utf-8') : '';

  const chunks = [];

  // 1. Parse Schedule
  if (scheduleContent) {
    // Campus general schedule
    const campusMatch = scheduleContent.match(/## 1\. Общий режим работы кампуса[\s\S]*?(?=## 2)/);
    const contactsMatch = scheduleContent.match(/## [345]\.[\s\S]*/);
    const generalText = [campusMatch?.[0], contactsMatch?.[0]].filter(Boolean).join('\n\n');
    if (generalText) {
      chunks.push({
        id: 'sched-campus',
        category: 'schedule',
        title: 'График работы кампуса, адрес и контакты',
        text: generalText.trim(),
      });
    }

    // Teacher sections: ### 2.x.
    const teacherBlocks = scheduleContent.split(/### 2\.\d+\.\s+/).slice(1);
    for (const block of teacherBlocks) {
      const lines = block.trim().split('\n');
      const headerLine = lines[0].trim();
      const content = lines.slice(1).join('\n').trim();
      
      const teacherName = headerLine.split('(')[0].trim();
      const cleanId = `sched-${teacherName.toLowerCase().replace(/[^a-zа-я0-9]+/gi, '-')}`;

      chunks.push({
        id: cleanId,
        category: 'schedule',
        title: `Расписание преподавателя ${headerLine}`,
        text: `${headerLine}:\n${content}`,
      });
    }
  }

  // 2. Parse Price List
  if (priceContent) {
    // Course sections: ### X.Y.
    const courseBlocks = priceContent.split(/### \d+\.\d+\.\s+/).slice(1);
    for (const block of courseBlocks) {
      const lines = block.trim().split('\n');
      const headerLine = lines[0].trim();
      const content = lines.slice(1).join('\n').trim();

      const courseTitle = headerLine.split(':')[0].trim();
      const cleanId = `price-${courseTitle.toLowerCase().replace(/[^a-zа-я0-9]+/gi, '-')}`;

      chunks.push({
        id: cleanId,
        category: 'price',
        title: `Курс ${headerLine}`,
        text: `${headerLine}\n${content}`,
      });
    }

    // Discounts section
    const discountsMatch = priceContent.match(/## Сводная таблица скидок и льгот[\s\S]*/);
    if (discountsMatch) {
      chunks.push({
        id: 'price-discounts',
        category: 'price',
        title: 'Скидки, акции и условия оплаты',
        text: discountsMatch[0].trim(),
      });
    }
  }

  // 3. Parse FAQ
  if (faqContent) {
    const faqBlocks = faqContent.split(/### Вопрос \d+:\s+/).slice(1);
    for (let i = 0; i < faqBlocks.length; i++) {
      const block = faqBlocks[i].trim();
      const [qLine, ...aLines] = block.split('\n');
      const question = qLine.trim();
      const answer = aLines.join('\n').trim();

      chunks.push({
        id: `faq-${i + 1}`,
        category: 'faq',
        title: `FAQ: ${question}`,
        text: `Вопрос: ${question}\n${answer}`,
      });
    }
  }

  return chunks;
}
