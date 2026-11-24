// Transform RAG markdown data into vector-indexed chunks using Google AI Studio gemini-embedding-001
import fs from 'fs';
import path from 'path';

// Read environment variables from .env if present
const envFile = fs.existsSync('.env') ? fs.readFileSync('.env', 'utf-8') : '';
const parseEnv = (key) => {
  const match = envFile.match(new RegExp(`^${key}=(.*)$`, 'm'));
  return match ? match[1].trim() : process.env[key] || '';
};

const API_KEY = parseEnv('VITE_GEMINI_API_KEY') || parseEnv('GEMINI_API_KEY');
const EMBEDDING_MODEL = parseEnv('VITE_GEMINI_EMBEDDING_MODEL') || 'gemini-embedding-001';

const rawChunks = [
  // Price List
  {
    id: 'price-frontend',
    category: 'price',
    title: 'Курс Frontend-разработчик (React & Next.js)',
    text: `Курс "Frontend-разработчик: с нуля до React & Next.js":
Длительность: 6 месяцев (72 занятия по 2 часа + 120 часов практики).
Стек: HTML5, CSS3, JavaScript (ES6+), TypeScript, React 19, Next.js 15, Tailwind CSS, Redux Toolkit, Git.
Формат: Офлайн в кампусе или онлайн.
Стоимость: 1 750 000 UZS в месяц (полная стоимость курса — 10 500 000 UZS).
Оплата: Доступна помесячная оплата (1 750 000 UZS/мес). Предоставляется бесплатный пробный урок перед заключением договора.`
  },
  {
    id: 'price-backend',
    category: 'price',
    title: 'Курс Backend-разработчик (Python, FastAPI, PostgreSQL)',
    text: `Курс "Backend-разработчик: Python, FastAPI & PostgreSQL":
Длительность: 6 месяцев (72 занятия + командный дипломный проект).
Стек: Python 3.12, ООП, FastAPI, PostgreSQL, SQLAlchemy 2.0, Redis, Docker, Celery, JWT.
Стоимость: 1 800 000 UZS в месяц (полная стоимость — 10 800 000 UZS).
Условия рассрочки: Доступна беспроцентная рассрочка на 6 или 12 месяцев (от 900 000 UZS/мес через партнерскую рассрочку Uzum Nasiya, Anorbank, TBC Bank).`
  },
  {
    id: 'price-fullstack',
    category: 'price',
    title: 'Курс Fullstack JavaScript / TypeScript',
    text: `Курс "Fullstack JavaScript / TypeScript Инженер":
Длительность: 8 месяцев (96 занятий + 2 коммерческих проекта в портфолио).
Стек: React, Next.js, Node.js, Express, NestJS, Prisma, PostgreSQL, Docker, AWS.
Стоимость: 1 950 000 UZS в месяц (полная стоимость — 15 600 000 UZS).
Условия рассрочки: Возможна рассрочка от академии помесячно либо через банк на 6–12 месяцев без переплат и первоначального взноса.`
  },
  {
    id: 'price-java',
    category: 'price',
    title: 'Курс Java Enterprise & Spring Boot',
    text: `Курс "Java Enterprise & Spring Boot Разработчик":
Длительность: 7 месяцев (84 занятия).
Стек: Java Core 21, Spring Boot 3, Spring Security, Hibernate, PostgreSQL, Kafka, Microservices.
Стоимость: 1 900 000 UZS в месяц (полная стоимость — 13 300 000 UZS).
Условия рассрочки: Доступна рассрочка до 12 месяцев от 1 108 000 UZS/мес.`
  },
  {
    id: 'price-mobile-flutter',
    category: 'price',
    title: 'Курс Мобильный разработчик (Flutter & Dart)',
    text: `Курс "Мобильный разработчик: Flutter & Dart для iOS и Android":
Длительность: 5 месяцев (60 занятий + 3 готовых приложения в Google Play и App Store).
Стек: Dart, Flutter, BLoC / Cubit, REST API, Firebase, Hive, Clean Architecture.
Стоимость: 1 650 000 UZS в месяц (полная стоимость — 8 250 000 UZS).
Условия оплаты: Помесячная оплата 1 650 000 UZS или скидка 10% при оплате всего курса сразу (7 425 000 UZS).`
  },
  {
    id: 'price-mobile-ios',
    category: 'price',
    title: 'Курс iOS Разработка на Swift & SwiftUI',
    text: `Курс "iOS Разработка на Swift & SwiftUI":
Длительность: 6 месяцев (72 занятия).
Стек: Swift 6, SwiftUI, UIKit, CoreData, Combine, URLSession, TestFlight deploy. Предоставляются компьютеры Mac mini в аудитории.
Стоимость: 1 900 000 UZS в месяц (полная стоимость — 11 400 000 UZS).
Условия рассрочки: Возможна банковская рассрочка на 6–12 месяцев.`
  },
  {
    id: 'price-uiux',
    category: 'price',
    title: 'Курс UI/UX & Product Design в Figma',
    text: `Курс "UI/UX & Product Design: от идеи до прототипа в Figma":
Длительность: 4 месяца (48 занятий + 2 оформленных кейса на Behance/Dribbble).
Стек: Figma Pro, Auto Layout, Variables, Design Systems, UX-исследования, CJM, Motion Prototyping.
Стоимость: 1 500 000 UZS в месяц (полная стоимость — 6 000 000 UZS).
Оплата: Помесячно по 1 500 000 UZS либо 5 400 000 UZS при единоразовой оплате (скидка 10%).`
  },
  {
    id: 'price-graphic',
    category: 'price',
    title: 'Курс Графический дизайн, брендинг и айдентика',
    text: `Курс "Графический дизайн, брендинг и айдентика":
Длительность: 3 месяца (36 занятий).
Стек: Adobe Photoshop, Adobe Illustrator, брендинг, типографика, допечатная подготовка.
Стоимость: 1 300 000 UZS в месяц (полная стоимость — 3 900 000 UZS). Помесячная оплата.`
  },
  {
    id: 'price-datascience',
    category: 'price',
    title: 'Курс Data Science & Machine Learning (AI)',
    text: `Курс "Data Science & Machine Learning: Машинное обучение и нейросети":
Длительность: 7 месяцев (84 занятия).
Стек: Python, NumPy, Pandas, Scikit-learn, PyTorch, Компьютерное зрение (OpenCV), LLM, RAG.
Стоимость: 2 100 000 UZS в месяц (полная стоимость — 14 700 000 UZS).
Условия рассрочки: Дорогостоящий курс повышенной сложности — доступна беспроцентная рассрочка на 6, 9 или 12 месяцев (от 1 225 000 UZS/мес) без первого взноса.`
  },
  {
    id: 'price-data-analyst',
    category: 'price',
    title: 'Курс Аналитик данных (SQL, Power BI, Python)',
    text: `Курс "Аналитик данных (Data Analyst: SQL, Power BI, Python)":
Длительность: 4 месяца (48 занятий).
Стек: SQL (сложные выборки, оконные функции), Power BI, Excel Advanced, Python для аналитики.
Стоимость: 1 600 000 UZS в месяц (полная стоимость — 6 400 000 UZS). Помесячная оплата.`
  },
  {
    id: 'price-devops',
    category: 'price',
    title: 'Курс DevOps & Cloud Engineering',
    text: `Курс "DevOps & Cloud Engineering: Инфраструктура и CI/CD":
Длительность: 5 месяцев (60 занятий).
Стек: Linux administration, Bash, Docker, Kubernetes (K8s), Terraform, AWS, GitLab CI, Prometheus.
Стоимость: 2 000 000 UZS в месяц (полная стоимость — 10 000 000 UZS).
Условия рассрочки: Возможна рассрочка на весь период обучения или через банк до 12 месяцев.`
  },
  {
    id: 'price-qa',
    category: 'price',
    title: 'Курс Тестирование ПО (QA Manual + Automation)',
    text: `Курс "Тестирование ПО (QA Manual + QA Automation на Python)":
Длительность: 4 месяца (48 занятий).
Стек: Тест-дизайн, баг-репорты, Postman (API), SQL, Автоматизация на Python + PyTest, Selenium.
Стоимость: 1 500 000 UZS в месяц (полная стоимость — 6 000 000 UZS). Помесячная оплата без переплат.`
  },
  {
    id: 'price-discounts',
    category: 'price',
    title: 'Скидки, акции и условия оплаты',
    text: `Скидки и специальные условия Apex IT Academy:
- Скидка 10% при единовременной 100% оплате курса.
- Скидка 5% студентам вузов и школьникам при предъявлении студенческого билета.
- Акция "Приведи друга": скидка 10% на один месяц обучения для каждого студента.
- Бесплатный пробный урок доступен для всех направлений перед заключением договора.`
  },

  // FAQ
  {
    id: 'faq-enrollment',
    category: 'faq',
    title: 'Запись, бронирование места и пробный урок',
    text: `Как записаться и забронировать место:
1. Оставить заявку на сайте или в Telegram: @ApexAcademy_Support, либо позвонить по номеру +998 (71) 200-55-44.
2. Менеджер свяжется, согласует расписание и пригласит на бесплатный пробный урок или профориентационное тестирование.
3. Бронирование места в формирующейся группе (до 14 человек) осуществляется предоплатой от 300 000 UZS (входит в стоимость первого месяца) либо заключением договора рассрочки.`
  },
  {
    id: 'faq-payment-methods',
    category: 'faq',
    title: 'Способы оплаты и рассрочка',
    text: `Способы оплаты и рассрочка:
- Оплата принимается в сумах (UZS) через Payme, Click, Uzum Bank, банковской картой через терминал, наличными в кассе кампуса (с фискальным чеком), а также безналичным расчетом для юрлиц с договором и счетом-фактурой.
- Рассрочка: беспроцентная внутренняя помесячная оплата (до 5-го числа месяца без переплат) или банковская рассрочка на 6, 9 или 12 месяцев через банки-партнёры (Uzum Nasiya, Anorbank, TBC Bank) без первого взноса.`
  },
  {
    id: 'faq-cancellation-freeze',
    category: 'faq',
    title: 'Отмена, пропуск занятий, заморозка и перевод',
    text: `Отмена, перенос и заморозка занятий:
1. Заморозка обучения: можно официально заморозить обучение на срок до 30 календарных дней по уважительной причине (болезнь, командировка) без потери денежных средств.
2. Пропущенные занятия: все лекции записываются в HD и доступны в личном кабинете. По субботам проводятся бесплатные консультации с дежурным ментором.
3. Перевод в другую группу: бесплатный перевод в параллельную или вечернюю группу на том же этапе программы.`
  },
  {
    id: 'faq-refund',
    category: 'faq',
    title: 'Возврат средств при отказе от курса',
    text: `Возврат средств:
Если после первого занятия или в течение первых 14 дней с момента старта группы студент решает прекратить обучение, он может оформить заявление на возврат денежных средств за вычетом фактически пройденных часов. Возврат осуществляется в течение 7–10 банковских дней. Также доступен бесплатный перевод на любое другое направление с зачетом средств.`
  },
  {
    id: 'faq-quality-guarantee',
    category: 'faq',
    title: 'Гарантия качества обучения и трудоустройство',
    text: `Гарантия качества и карьерный центр:
- Преподаватели: действующие Senior-инженеры и техлиды из EPAM, Uzum, TBC Bank со стажем от 6+ лет.
- Карьерный центр: мок-собеседования, оформление резюме, подготовка портфолио из 3+ проектов на GitHub/Behance и закрытый Demo Day для 180+ IT-компаний.
- Статистика: 94.6% выпускников находят работу в первые 3 месяца со средней стартовой зарплатой $1,380 на позициях Junior+.`
  },
  {
    id: 'faq-laptop-preparation',
    category: 'faq',
    title: 'Что взять с собой: требования к ноутбуку и подготовка',
    text: `Что нужно иметь с собой и требования к ноутбуку:
- Офлайн: личный ноутбук (Windows, macOS или Linux), зарядное устройство, наушники.
- Минимальные характеристики: процессор Core i3/Ryzen 3 (рекомендуется Core i5/Ryzen 5), от 8 ГБ RAM (для Data Science, Mobile и DevOps рекомендуется 16 ГБ), SSD от 256 ГБ.
- В кампусе оборудованы рабочие места: розетки у каждого стола, скоростной Wi-Fi до 500 Мбит/с, маркерные доски, кофе-поинты.
- На вводном уроке куратор помогает бесплатно установить и настроить все программы (VS Code, Git, Python/Node, Docker, Figma).`
  },
  {
    id: 'faq-certificate',
    category: 'faq',
    title: 'Официальный сертификат и аккредитация IT Park',
    text: `Сертификат об окончании:
Apex IT Academy является аккредитованным резидентом IT Park Uzbekistan. Выпускники, сдавшие дипломный проект на 75+ баллов, получают официальный номерной сертификат международного образца на английском языке с верифицируемым QR-кодом, электронный бейдж для LinkedIn и рекомендательное письмо от ведущего ментора курса.`
  },

  // Schedule
  {
    id: 'sched-campus',
    category: 'schedule',
    title: 'График работы кампуса, адрес и контакты',
    text: `Режим работы кампуса Apex IT Academy:
- Понедельник — Пятница: 09:00 – 22:00
- Суббота: 09:00 – 21:00
- Воскресенье: 10:00 – 18:00 (хакатоны, мастер-классы, коворкинг)
- Адрес: Республика Узбекистан, г. Ташкент, Мирзо-Улугбекский район, ул. Темур Малик, IT Park Plaza, 4-й этаж, офисы 401–410.
- Телефоны: +998 (71) 200-55-44 (Call-центр), +998 (90) 012-34-56 (запись).
- Telegram поддержки: @ApexAcademy_Support, канал: @ApexAcademy_UZ. Instagram: @apex.academy.uz.`
  },
  {
    id: 'sched-timur-alimov',
    category: 'schedule',
    title: 'Расписание преподавателя Тимура Алимова (Frontend)',
    text: `Тимур Алимов (Head of Frontend, Senior Architect):
- Лекции Frontend (React, Next.js): Понедельник, Среда, Пятница с 19:00 до 21:00 (Аудитория 401).
- Индивидуальные консультации и код-ревью: Суббота с 14:00 до 17:00 (Коворкинг, стол менторов №1).`
  },
  {
    id: 'sched-madina-karimova',
    category: 'schedule',
    title: 'Расписание преподавателя Мадины Каримовой (Backend)',
    text: `Мадина Каримова (Principal Backend & Cloud Engineer):
- Лекции Backend (Python, FastAPI, PostgreSQL): Вторник и Четверг с 19:00 до 21:00, Суббота с 10:00 до 12:30 (Аудитория 402).
- Архитектурные консультации: Вторник и Четверг с 17:30 до 18:45 (по предварительной записи).`
  },
  {
    id: 'sched-sardor-rakhimov',
    category: 'schedule',
    title: 'Расписание преподавателя Сардора Рахимова (UI/UX Design)',
    text: `Сардор Рахимов (Lead Product & UI/UX Designer):
- Занятия по UI/UX в Figma: Вторник и Четверг с 17:00 до 19:00, Суббота с 14:00 до 16:30 (Лаборатория дизайна 405).
- Портфолио-ревью (Behance / Dribbble): Пятница с 16:00 до 18:30.`
  },
  {
    id: 'sched-jasur-usmanov',
    category: 'schedule',
    title: 'Расписание преподавателя Жасура Усманова (Mobile / Flutter)',
    text: `Жасур Усманов (Mobile Tech Lead):
- Занятия по Flutter & Dart: Понедельник, Среда, Пятница с 17:00 до 19:00 (Аудитория 403).
- Практика сборки и отладка на реальных устройствах: Воскресенье с 11:00 до 14:00 (Mobile Device Testing Lab).`
  },
  {
    id: 'sched-elena-volkova',
    category: 'schedule',
    title: 'Расписание преподавателя Елены Волковой (Data Science & AI)',
    text: `Елена Волкова (Senior AI & Data Science Researcher):
- Лекции Data Science & AI: Понедельник, Среда, Пятница с 19:30 до 21:30 (Аудитория 404 / GPU Server Lab).
- Консультации по ML-моделям: Суббота с 12:00 до 15:00.`
  },
  {
    id: 'sched-bobur-mirzaev',
    category: 'schedule',
    title: 'Расписание преподавателя Бобура Мирзаева (DevOps)',
    text: `Бобур Мирзаев (DevOps & Cloud Solutions Architect):
- Лекции DevOps & Cloud: Вторник и Четверг с 19:30 до 21:30, Суббота с 17:00 до 19:30 (Аудитория 403).
- Лабораторные работы по Cloud Lab: Воскресенье с 14:00 до 17:00.`
  }
];

async function getEmbedding(text) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent?key=${API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: `models/${EMBEDDING_MODEL}`,
      content: { parts: [{ text }] },
      taskType: 'RETRIEVAL_DOCUMENT'
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Embedding API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data?.embedding?.values;
}

async function run() {
  console.log(`Starting vectorization of ${rawChunks.length} RAG knowledge chunks using ${EMBEDDING_MODEL}...`);
  const vectorizedChunks = [];

  for (let i = 0; i < rawChunks.length; i++) {
    const chunk = rawChunks[i];
    console.log(`[${i + 1}/${rawChunks.length}] Embedding: ${chunk.title}...`);
    try {
      const vector = await getEmbedding(chunk.text);
      vectorizedChunks.push({
        ...chunk,
        vector
      });
      // Small pause to be gentle with rate limits
      await new Promise(r => setTimeout(r, 200));
    } catch (err) {
      console.error(`Failed to embed ${chunk.id}:`, err);
    }
  }

  const outDir = path.resolve('src/data');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outFile = path.join(outDir, 'vectorKnowledgeBase.json');
  fs.writeFileSync(outFile, JSON.stringify(vectorizedChunks, null, 2), 'utf-8');
  console.log(`Successfully generated vector knowledge base with ${vectorizedChunks.length} embedded chunks!`);
  console.log(`Saved to: ${outFile}`);
}

run();
