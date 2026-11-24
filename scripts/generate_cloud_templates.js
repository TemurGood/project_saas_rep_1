import fs from 'fs';
import path from 'path';
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from 'docx';
import * as XLSX from 'xlsx';

const exportDir = path.resolve('rag_data/export');
if (!fs.existsSync(exportDir)) {
  fs.mkdirSync(exportDir, { recursive: true });
}

function markdownToDocxParagraphs(mdContent) {
  const lines = mdContent.split('\n');
  const paragraphs = [];

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (!line.trim() || line.trim() === '---') {
      paragraphs.push(new Paragraph({ text: '' }));
      continue;
    }
    if (line.startsWith('# ')) {
      paragraphs.push(
        new Paragraph({
          text: line.replace(/^#\s+/, ''),
          heading: HeadingLevel.HEADING_1,
        })
      );
    } else if (line.startsWith('## ')) {
      paragraphs.push(
        new Paragraph({
          text: line.replace(/^##\s+/, ''),
          heading: HeadingLevel.HEADING_2,
        })
      );
    } else if (line.startsWith('### ')) {
      paragraphs.push(
        new Paragraph({
          text: line.replace(/^###\s+/, ''),
          heading: HeadingLevel.HEADING_3,
        })
      );
    } else {
      const cleanLine = line.replace(/\*\*/g, '').replace(/^>\s*/, '');
      paragraphs.push(
        new Paragraph({
          children: [new TextRun(cleanLine)],
        })
      );
    }
  }
  return paragraphs;
}

async function generateDocx(mdPath, outPath, title) {
  const md = fs.readFileSync(mdPath, 'utf-8');
  const doc = new Document({
    title,
    sections: [
      {
        properties: {},
        children: markdownToDocxParagraphs(md),
      },
    ],
  });
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outPath, buffer);
  console.log(`Generated DOCX: ${outPath}`);
}

function generateExcelSchedule() {
  const teachersData = [
    {
      ID: 'teacher-1',
      'ФИО': 'Тимур Алимов',
      'Направление': 'Frontend',
      'Должность': 'Руководитель Frontend-направления / Senior Architect',
      'Компания': 'Ex-EPAM & Fintech Tech Lead',
      'Опыт (лет)': 9,
      'Навыки / Стек': 'HTML5, CSS3, JavaScript (ES6+), TypeScript, React 19, Next.js 15, TailwindCSS',
      'Дни лекций': 'Понедельник, Среда, Пятница',
      'Время лекций': '19:00 - 21:00',
      'Группа и Аудитория': 'Группа FE-101, Аудитория 401',
      'Консультации': 'Суббота 14:00 - 17:00 (Коворкинг, стол менторов №1)',
      'Биография': '9+ лет в коммерческой разработке высоконагруженных веб-приложений. Эксперт по React, Next.js и TypeScript.'
    },
    {
      ID: 'teacher-2',
      'ФИО': 'Мадина Каримова',
      'Направление': 'Backend',
      'Должность': 'Principal Backend & Cloud Engineer',
      'Компания': 'Uzum FinTech',
      'Опыт (лет)': 8,
      'Навыки / Стек': 'Python 3.12, FastAPI, PostgreSQL, SQLAlchemy, Docker, Kubernetes, Redis, Kafka',
      'Дни лекций': 'Вторник, Четверг, Суббота',
      'Время лекций': 'Вт/Чт 19:00 - 21:00; Сб 10:00 - 12:30',
      'Группа и Аудитория': 'Группа PY-202, Аудитория 402 / Онлайн-стрим',
      'Консультации': 'Вторник и Четверг 17:30 - 18:45 (по записи)',
      'Биография': 'Специализируется на микросервисной архитектуре и распределенных базах данных. Обучила более 450 разработчиков.'
    },
    {
      ID: 'teacher-3',
      'ФИО': 'Сардор Рахимов',
      'Направление': 'UI/UX Дизайн',
      'Должность': 'Lead Product & UI/UX Designer',
      'Компания': 'TBC Bank Digital Design Team',
      'Опыт (лет)': 7,
      'Навыки / Стек': 'Figma Pro, Design Systems, Auto Layout, UX Research, CJM, Motion Design',
      'Дни лекций': 'Вторник, Четверг, Суббота',
      'Время лекций': 'Вт/Чт 17:00 - 19:00; Сб 14:00 - 16:30',
      'Группа и Аудитория': 'Группа UX-301, Лаборатория дизайна 405',
      'Консультации': 'Пятница 16:00 - 18:30 (Портфолио-ревью Behance/Dribbble)',
      'Биография': 'Создатель дизайн-систем для мобильного и веб-банкинга. Преподает UX-исследования и UI в Figma.'
    },
    {
      ID: 'teacher-4',
      'ФИО': 'Жасур Усманов',
      'Направление': 'Mobile (Flutter & iOS)',
      'Должность': 'Mobile Tech Lead (Flutter & iOS)',
      'Компания': 'Ex-Payme Mobile Lead',
      'Опыт (лет)': 7,
      'Навыки / Стек': 'Flutter, Dart, Swift, Kotlin, Firebase, BLoC, CI/CD Mobile',
      'Дни лекций': 'Понедельник, Среда, Пятница',
      'Время лекций': '17:00 - 19:00',
      'Группа и Аудитория': 'Группа MOB-104, Аудитория 403',
      'Консультации': 'Воскресенье 11:00 - 14:00 (Mobile Device Testing Lab)',
      'Биография': 'Автор 15+ коммерческих мобильных приложений в App Store и Google Play с аудиторией более 2 млн пользователей.'
    },
    {
      ID: 'teacher-5',
      'ФИО': 'Елена Волкова',
      'Направление': 'Data Science & AI',
      'Должность': 'Senior AI & Data Science Researcher',
      'Компания': 'AI Solutions Lab',
      'Опыт (лет)': 8,
      'Навыки / Стек': 'Python, PyTorch, TensorFlow, LLMs, RAG, Pandas, Scikit-Learn, OpenCV',
      'Дни лекций': 'Понедельник, Среда, Пятница',
      'Время лекций': '19:30 - 21:30',
      'Группа и Аудитория': 'Группа DS-501, Аудитория 404 / GPU Server Lab',
      'Консультации': 'Суббота 12:00 - 15:00 (Discord / Офлайн)',
      'Биография': 'Исследователь в области NLP и генеративных языковых моделей. Реализовала более 30 корпоративных ML-пайплайнов.'
    },
    {
      ID: 'teacher-6',
      'ФИО': 'Бобур Мирзаев',
      'Направление': 'DevOps & Cloud',
      'Должность': 'DevOps & Cloud Solutions Architect',
      'Компания': 'CloudScale Infrastructure',
      'Опыт (лет)': 8,
      'Навыки / Стек': 'Linux, Docker, Kubernetes (K8s), Terraform, AWS, GitLab CI, Prometheus',
      'Дни лекций': 'Вторник, Четверг, Суббота',
      'Время лекций': 'Вт/Чт 19:30 - 21:30; Сб 17:00 - 19:30',
      'Группа и Аудитория': 'Группа DO-601, Аудитория 403',
      'Консультации': 'Воскресенье 14:00 - 17:00 (Cloud Lab)',
      'Биография': 'Эксперт по автоматизации развертывания, отказоустойчивости инфраструктур в AWS/GCP и настройке мониторинга.'
    }
  ];

  const campusInfoData = [
    { 'Параметр': 'Режим работы (Пн-Пт)', 'Значение': '09:00 - 22:00' },
    { 'Параметр': 'Режим работы (Суббота)', 'Значение': '09:00 - 21:00' },
    { 'Параметр': 'Режим работы (Воскресенье)', 'Значение': '10:00 - 18:00 (дни открытых дверей, хакатоны)' },
    { 'Параметр': 'Адрес кампуса', 'Значение': 'г. Ташкент, Мирзо-Улугбекский р-н, ул. Темур Малик, IT Park Plaza, 4-й этаж, офисы 401-410' },
    { 'Параметр': 'Телефон для записи (Call-центр)', 'Значение': '+998 (71) 200-55-44' },
    { 'Параметр': 'Мобильный / WhatsApp', 'Значение': '+998 (90) 012-34-56' },
    { 'Параметр': 'Telegram поддержки', 'Значение': '@ApexAcademy_Support' },
    { 'Параметр': 'Telegram канал', 'Значение': '@ApexAcademy_UZ' },
    { 'Параметр': 'Instagram', 'Значение': '@apex.academy.uz' }
  ];

  const wb = XLSX.utils.book_new();
  const wsTeachers = XLSX.utils.json_to_sheet(teachersData);
  const wsCampus = XLSX.utils.json_to_sheet(campusInfoData);

  XLSX.utils.book_append_sheet(wb, wsTeachers, 'Преподаватели и Расписание');
  XLSX.utils.book_append_sheet(wb, wsCampus, 'Кампус и Контакты');

  const outPath = path.join(exportDir, 'Apex_Teachers_Schedule.xlsx');
  XLSX.writeFile(wb, outPath);
  console.log(`Generated XLSX: ${outPath}`);
}

async function run() {
  await generateDocx(path.resolve('rag_data/price_list.md'), path.join(exportDir, 'Apex_Price_List.docx'), 'Прайс-лист Apex IT Academy');
  await generateDocx(path.resolve('rag_data/faq.md'), path.join(exportDir, 'Apex_FAQ.docx'), 'FAQ Apex IT Academy');
  generateExcelSchedule();
}

run();
