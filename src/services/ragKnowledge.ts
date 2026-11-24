// Structured RAG Knowledge Base extracted from price_list.md, faq.md, and schedule.md

export interface RagChunk {
  id: string;
  category: 'price' | 'faq' | 'schedule';
  title: string;
  keywords: string[];
  content: string;
}

export const RAG_KNOWLEDGE_CHUNKS: RagChunk[] = [
  // --- Price List Chunks ---
  {
    id: 'price-frontend',
    category: 'price',
    title: 'Курс Frontend-разработчик (React, Next.js)',
    keywords: ['frontend', 'фронтенд', 'react', 'next.js', 'верстка', 'javascript', 'цена', 'стоимость', 'прайс'],
    content: `Курс "Frontend-разработчик: с нуля до React & Next.js":
Длительность: 6 месяцев (72 занятия по 2 часа + 120 часов практики).
Стек: HTML5, CSS3, JavaScript (ES6+), TypeScript, React 19, Next.js 15, Tailwind CSS, Redux Toolkit, Git.
Формат: Офлайн в кампусе или онлайн.
Стоимость: 1 750 000 UZS в месяц (полная стоимость за 6 месяцев — 10 500 000 UZS).
Оплата: Помесячная оплата без переплат. Предоставляется бесплатный пробный урок.`
  },
  {
    id: 'price-backend',
    category: 'price',
    title: 'Курс Backend-разработчик (Python, FastAPI, PostgreSQL)',
    keywords: ['backend', 'бэкенд', 'python', 'питон', 'fastapi', 'базы данных', 'postgresql', 'цена', 'рассрочка'],
    content: `Курс "Backend-разработчик: Python, FastAPI & PostgreSQL":
Длительность: 6 месяцев (72 занятия + командный дипломный проект).
Стек: Python 3.12, ООП, FastAPI, PostgreSQL, SQLAlchemy 2.0, Redis, Docker, Celery, JWT.
Стоимость: 1 800 000 UZS в месяц (полная стоимость — 10 800 000 UZS).
Условия рассрочки: Доступна беспроцентная рассрочка на 6 или 12 месяцев (от 900 000 UZS/мес через банки-партнёры Uzum Nasiya, Anorbank, TBC).`
  },
  {
    id: 'price-fullstack',
    category: 'price',
    title: 'Курс Fullstack JavaScript / TypeScript',
    keywords: ['fullstack', 'фулстек', 'node.js', 'nestjs', 'разработка', 'цена', 'рассрочка'],
    content: `Курс "Fullstack JavaScript / TypeScript Инженер":
Длительность: 8 месяцев (96 занятий + 2 коммерческих проекта).
Стек: React, Next.js, Node.js, Express, NestJS, Prisma, PostgreSQL, Docker, AWS.
Стоимость: 1 950 000 UZS в месяц (полная стоимость — 15 600 000 UZS).
Условия рассрочки: Возможна внутренняя рассрочка от академии помесячно либо банковская рассрочка на 6–12 месяцев без первоначального взноса.`
  },
  {
    id: 'price-java',
    category: 'price',
    title: 'Курс Java Enterprise & Spring Boot',
    keywords: ['java', 'джава', 'spring', 'spring boot', 'enterprise', 'микросервисы', 'цена', 'рассрочка'],
    content: `Курс "Java Enterprise & Spring Boot Разработчик":
Длительность: 7 месяцев (84 занятия).
Стек: Java Core 21, Spring Boot 3, Spring Security, Hibernate, PostgreSQL, Kafka, Microservices.
Стоимость: 1 900 000 UZS в месяц (полная стоимость — 13 300 000 UZS).
Рассрочка: Доступна рассрочка до 12 месяцев (от 1 108 000 UZS/мес).`
  },
  {
    id: 'price-mobile-flutter',
    category: 'price',
    title: 'Курс Мобильный разработчик (Flutter & Dart)',
    keywords: ['mobile', 'мобильный', 'flutter', 'флаттер', 'dart', 'ios', 'android', 'приложения', 'цена'],
    content: `Курс "Мобильный разработчик: Flutter & Dart для iOS и Android":
Длительность: 5 месяцев (60 занятий + 3 готовых приложения).
Стек: Dart, Flutter, BLoC / Cubit, REST API, Firebase, Hive, Clean Architecture.
Стоимость: 1 650 000 UZS в месяц (полная стоимость — 8 250 000 UZS).
Скидка: При 100% единовременной оплате всего курса действует скидка 10% (7 425 000 UZS).`
  },
  {
    id: 'price-mobile-ios',
    category: 'price',
    title: 'Курс iOS Разработка на Swift & SwiftUI',
    keywords: ['ios', 'swift', 'swiftui', 'айфон', 'apple', 'цена', 'рассрочка'],
    content: `Курс "iOS Разработка на Swift & SwiftUI":
Длительность: 6 месяцев (72 занятия).
Стек: Swift 6, SwiftUI, UIKit, CoreData, Combine, URLSession, TestFlight. Предоставляются компьютеры Mac mini в аудитории.
Стоимость: 1 900 000 UZS в месяц (полная стоимость — 11 400 000 UZS).
Рассрочка: Возможна банковская рассрочка на 6–12 месяцев.`
  },
  {
    id: 'price-uiux',
    category: 'price',
    title: 'Курс UI/UX & Product Design в Figma',
    keywords: ['дизайн', 'ui', 'ux', 'ui/ux', 'дизайнер', 'figma', 'прототип', 'интерфейс', 'цена'],
    content: `Курс "UI/UX & Product Design: от идеи до прототипа в Figma":
Длительность: 4 месяца (48 занятий + 2 кейса на Behance).
Стек: Figma Pro, Auto Layout, Variables, Design Systems, UX Research, CJM, Motion Prototyping.
Стоимость: 1 500 000 UZS в месяц (полная стоимость — 6 000 000 UZS).
Оплата: Помесячно по 1 500 000 UZS либо 5 400 000 UZS при единоразовой оплате (скидка 10%).`
  },
  {
    id: 'price-graphic',
    category: 'price',
    title: 'Курс Графический дизайн и брендинг',
    keywords: ['графический дизайн', 'photoshop', 'illustrator', 'брендинг', 'логотип', 'айдентика', 'цена'],
    content: `Курс "Графический дизайн, брендинг и айдентика":
Длительность: 3 месяца (36 занятий).
Стек: Adobe Photoshop, Adobe Illustrator, брендинг, типографика.
Стоимость: 1 300 000 UZS в месяц (полная стоимость — 3 900 000 UZS).`
  },
  {
    id: 'price-datascience',
    category: 'price',
    title: 'Курс Data Science & Machine Learning (AI)',
    keywords: ['data science', 'дата сайнс', 'ai', 'ии', 'машинное обучение', 'нейросети', 'pytorch', 'цена', 'рассрочка'],
    content: `Курс "Data Science & Machine Learning: Машинное обучение и нейросети":
Длительность: 7 месяцев (84 занятия).
Стек: Python, NumPy, Pandas, Scikit-learn, PyTorch, Компьютерное зрение (OpenCV), LLM, RAG.
Стоимость: 2 100 000 UZS в месяц (полная стоимость — 14 700 000 UZS).
Рассрочка: Дорогостоящий курс повышенной сложности — доступна беспроцентная рассрочка на 6, 9 или 12 месяцев (от 1 225 000 UZS/мес) без первого взноса.`
  },
  {
    id: 'price-data-analyst',
    category: 'price',
    title: 'Курс Аналитик данных (SQL, Power BI, Python)',
    keywords: ['аналитик данных', 'data analyst', 'sql', 'power bi', 'аналитика', 'excel', 'цена'],
    content: `Курс "Аналитик данных (Data Analyst: SQL, Power BI, Python)":
Длительность: 4 месяца (48 занятий).
Стек: SQL (оконные функции, сложные выборки), Power BI, Excel Advanced, Python.
Стоимость: 1 600 000 UZS в месяц (полная стоимость — 6 400 000 UZS). Помесячная оплата.`
  },
  {
    id: 'price-devops',
    category: 'price',
    title: 'Курс DevOps & Cloud Engineering',
    keywords: ['devops', 'девопс', 'docker', 'kubernetes', 'k8s', 'aws', 'linux', 'ci/cd', 'облако', 'цена', 'рассрочка'],
    content: `Курс "DevOps & Cloud Engineering: Инфраструктура и CI/CD":
Длительность: 5 месяцев (60 занятий).
Стек: Linux administration, Bash, Docker, Kubernetes (K8s), Terraform, AWS, GitLab CI, Prometheus.
Стоимость: 2 000 000 UZS в месяц (полная стоимость — 10 000 000 UZS).
Рассрочка: Доступна внутренняя рассрочка или банковская на 6–12 месяцев.`
  },
  {
    id: 'price-qa',
    category: 'price',
    title: 'Курс Тестирование ПО (QA Manual + Automation)',
    keywords: ['qa', 'тестирование', 'тестировщик', 'автоматизация', 'pytest', 'selenium', 'postman', 'цена'],
    content: `Курс "Тестирование ПО (QA Manual + QA Automation на Python)":
Длительность: 4 месяца (48 занятий).
Стек: Тест-дизайн, баг-репорты, Postman (API), SQL, автоматизация на Python + PyTest, Selenium.
Стоимость: 1 500 000 UZS в месяц (полная стоимость — 6 000 000 UZS).`
  },
  {
    id: 'price-discounts',
    category: 'price',
    title: 'Скидки, акции и условия оплаты',
    keywords: ['скидка', 'акция', 'льгота', 'студент', 'друг', 'оплата', 'рассрочка'],
    content: `Скидки и программы лояльности Apex IT Academy:
- Скидка 10% при единовременной 100% оплате курса.
- Скидка 5% студентам вузов и школьникам при предъявлении студенческого билета.
- Акция "Приведи друга": скидка 10% на один месяц обучения для каждого студента.
- Бесплатный вводный урок и профориентационное тестирование перед записью на любой курс.`
  },

  // --- FAQ Chunks ---
  {
    id: 'faq-enrollment',
    category: 'faq',
    title: 'Запись, бронирование места и пробный урок',
    keywords: ['запись', 'записаться', 'бронь', 'бронирование', 'пробный урок', 'поступление'],
    content: `Как записаться и забронировать место:
1. Оставить заявку на сайте или в Telegram: @ApexAcademy_Support, либо позвонить по телефону +998 (71) 200-55-44.
2. Пройти бесплатный пробный урок или карьерное тестирование.
3. Бронирование места в формирующейся группе (до 14 человек) осуществляется предоплатой от 300 000 UZS (входит в стоимость первого месяца) либо оформлением рассрочки.`
  },
  {
    id: 'faq-payment-methods',
    category: 'faq',
    title: 'Способы оплаты и оформление рассрочки',
    keywords: ['оплата', 'способ оплаты', 'payme', 'click', 'uzum', 'перечисление', 'терминал', 'наличные', 'рассрочка'],
    content: `Способы оплаты и рассрочка:
- Оплата принимается в сумах (UZS) через Payme, Click, Uzum Bank, терминалом (Uzcard/Humo/Visa/MasterCard), наличными в кассе кампуса (с фискальным чеком), а также перечислением для юридических лиц со счетом-фактурой.
- Рассрочка: доступна беспроцентная внутренняя помесячная оплата (до 5-го числа месяца без переплат) или банковская рассрочка на 6, 9 или 12 месяцев через Uzum Nasiya, Anorbank, TBC Bank (оформляется за 15 минут по ID-карте в кампусе).`
  },
  {
    id: 'faq-cancellation-freeze',
    category: 'faq',
    title: 'Отмена, пропуск занятий, заморозка и перевод',
    keywords: ['отмена', 'перенос', 'заморозка', 'пропуск', 'болезнь', 'перевод в группу'],
    content: `Правила пропуска и заморозки:
1. Заморозка обучения: можно бесплатно заморозить обучение на срок до 30 дней по уважительной причине (болезнь, командировка) с сохранением средств.
2. Пропущенные занятия: все офлайн-уроки записываются в HD и доступны в личном кабинете. По субботам проводятся бесплатные консультации с дежурным ментором для разбора пропущенных тем.
3. Перевод в другую группу: можно бесплатно перевестись в параллельную или вечернюю группу на том же этапе программы.`
  },
  {
    id: 'faq-refund',
    category: 'faq',
    title: 'Возврат средств и гарантия',
    keywords: ['возврат', 'вернуть деньги', 'гарантия', 'отказ'],
    content: `Возврат средств:
Если после первого занятия или в течение первых 14 дней с момента старта группы студент решает прекратить обучение, он может оформить заявление на возврат денежных средств за вычетом фактически пройденных часов. Возврат осуществляется в течение 7–10 банковских дней. Также возможен бесплатный перевод на любое другое направление с зачетом средств.`
  },
  {
    id: 'faq-quality-guarantee',
    category: 'faq',
    title: 'Гарантия качества, менторы и карьерный центр',
    keywords: ['качество', 'трудоустройство', 'гарантия', 'карьерный центр', 'менторы', 'работа'],
    content: `Гарантия качества обучения:
- Преподаватели: действующие Senior-инженеры и техлиды из EPAM, Uzum, TBC Bank со стажем от 6+ лет.
- Карьерный центр: мок-собеседования, портфолио на GitHub/Behance (3+ проекта), подготовка резюме и Demo Day перед 180+ компаниями-партнерами.
- Трудоустройство: 94.6% выпускников находят работу в первые 3 месяца со средней стартовой зарплатой $1,380 на позициях Junior+.`
  },
  {
    id: 'faq-laptop-preparation',
    category: 'faq',
    title: 'Что взять с собой: требования к ноутбуку и подготовка',
    keywords: ['ноутбук', 'компьютер', 'что взять', 'подготовка', 'оборудование', 'требования'],
    content: `Что нужно для занятий:
- Офлайн: личный ноутбук (Windows, macOS или Linux) с зарядным устройством и наушниками.
- Требования к ноутбуку: процессор от Core i3/Ryzen 3 (рекомендуется Core i5/Ryzen 5), от 8 ГБ RAM (для Data Science, Mobile и DevOps рекомендуется 16 ГБ), SSD от 256 ГБ.
- В кампусе оборудованы рабочие места: розетки у каждого стола, скоростной Wi-Fi до 500 Мбит/с, маркерные доски, кофе-поинты.
- На первом уроке куратор помогает бесплатно установить и настроить все программы (VS Code, Git, Python, Docker, Figma).`
  },
  {
    id: 'faq-certificate',
    category: 'faq',
    title: 'Сертификат об окончании и аккредитация',
    keywords: ['сертификат', 'диплом', 'документ', 'it park', 'аккредитация'],
    content: `Сертификация:
Apex IT Academy — аккредитованный резидент IT Park Uzbekistan. Выпускники, сдавшие финальный проект на 75+ баллов, получают официальный номерной сертификат международного образца на английском языке с верифицируемым QR-кодом, электронный бейдж для LinkedIn и рекомендательное письмо от ведущего ментора.`
  },

  // --- Schedule Chunks ---
  {
    id: 'sched-campus',
    category: 'schedule',
    title: 'График работы кампуса, адрес и контакты',
    keywords: ['график', 'часы работы', 'время', 'адрес', 'где находится', 'телефон', 'контакты', 'telegram'],
    content: `График работы кампуса Apex IT Academy:
- Понедельник — Пятница: 09:00 – 22:00
- Суббота: 09:00 – 21:00
- Воскресенье: 10:00 – 18:00 (хакатоны, мастер-классы, коворкинг)
Адрес: г. Ташкент, Мирзо-Улугбекский район, ул. Темур Малик, IT Park Plaza, 4-й этаж, офисы 401–410 (ориентир: комплекс IT Park, напротив Центра цифровых технологий).
Телефоны: +998 (71) 200-55-44 (Call-центр), +998 (90) 012-34-56 (WhatsApp/Telegram).
Telegram поддержки: @ApexAcademy_Support, канал: @ApexAcademy_UZ. Instagram: @apex.academy.uz.`
  },
  {
    id: 'sched-timur-alimov',
    category: 'schedule',
    title: 'Расписание преподавателя Тимура Алимова (Frontend)',
    keywords: ['тимур', 'алимов', 'frontend', 'фронтенд', 'расписание тимура', 'график frontend'],
    content: `Тимур Алимов (Head of Frontend, Senior Architect):
- Лекции Frontend (React, Next.js): Понедельник, Среда, Пятница с 19:00 до 21:00 (Аудитория 401).
- Индивидуальные консультации и код-ревью: Суббота с 14:00 до 17:00 (Коворкинг, стол менторов №1).`
  },
  {
    id: 'sched-madina-karimova',
    category: 'schedule',
    title: 'Расписание преподавателя Мадины Каримовой (Backend)',
    keywords: ['мадина', 'каримова', 'backend', 'бэкенд', 'python', 'питон', 'график мадины'],
    content: `Мадина Каримова (Principal Backend & Cloud Engineer):
- Лекции Backend (Python, FastAPI, PostgreSQL): Вторник и Четверг с 19:00 до 21:00, Суббота с 10:00 до 12:30 (Аудитория 402).
- Архитектурные консультации: Вторник и Четверг с 17:30 до 18:45 (по предварительной записи).`
  },
  {
    id: 'sched-sardor-rakhimov',
    category: 'schedule',
    title: 'Расписание преподавателя Сардора Рахимова (UI/UX Design)',
    keywords: ['сардор', 'рахимов', 'дизайн', 'ui/ux', 'figma', 'график сардора'],
    content: `Сардор Рахимов (Lead Product & UI/UX Designer):
- Занятия по UI/UX в Figma: Вторник и Четверг с 17:00 до 19:00, Суббота с 14:00 до 16:30 (Лаборатория дизайна 405).
- Портфолио-ревью (Behance): Пятница с 16:00 до 18:30.`
  },
  {
    id: 'sched-jasur-usmanov',
    category: 'schedule',
    title: 'Расписание преподавателя Жасура Усманова (Mobile / Flutter)',
    keywords: ['жасур', 'усманов', 'мобильная', 'flutter', 'флаттер', 'ios', 'график жасура'],
    content: `Жасур Усманов (Mobile Tech Lead):
- Занятия по Flutter & Dart: Понедельник, Среда, Пятница с 17:00 до 19:00 (Аудитория 403).
- Тестирование и дебаг на мобильных устройствах: Воскресенье с 11:00 до 14:00 (Mobile Device Testing Lab).`
  },
  {
    id: 'sched-elena-volkova',
    category: 'schedule',
    title: 'Расписание преподавателя Елены Волковой (Data Science & AI)',
    keywords: ['елена', 'волкова', 'data science', 'ai', 'ии', 'машинное обучение', 'график елены'],
    content: `Елена Волкова (Senior AI & Data Science Researcher):
- Лекции Data Science & AI: Понедельник, Среда, Пятница с 19:30 до 21:30 (Аудитория 404 / GPU Server Lab).
- Консультации по ML-моделям: Суббота с 12:00 до 15:00.`
  },
  {
    id: 'sched-bobur-mirzaev',
    category: 'schedule',
    title: 'Расписание преподавателя Бобура Мирзаева (DevOps)',
    keywords: ['бобур', 'мирзаев', 'devops', 'девопс', 'docker', 'kubernetes', 'график бобура'],
    content: `Бобур Мирзаев (DevOps & Cloud Solutions Architect):
- Лекции DevOps & Cloud: Вторник и Четверг с 19:30 до 21:30, Суббота с 17:00 до 19:30 (Аудитория 403).
- Лабораторные работы по Cloud/K8s: Воскресенье с 14:00 до 17:00 (Cloud Lab).`
  }
];

/**
 * Retrieve top relevant RAG knowledge chunks for a given user query
 */
export function retrieveRelevantKnowledge(query: string, maxChunks: number = 4): string {
  const normalizedQuery = query.toLowerCase();
  const queryTokens = normalizedQuery.split(/[\s,?.!;:—]+/).filter((t) => t.length > 2);

  // Score chunks
  const scored = RAG_KNOWLEDGE_CHUNKS.map((chunk) => {
    let score = 0;

    // Check keywords
    for (const kw of chunk.keywords) {
      if (normalizedQuery.includes(kw)) {
        score += 5;
      }
    }

    // Check title
    for (const token of queryTokens) {
      if (chunk.title.toLowerCase().includes(token)) {
        score += 4;
      }
      if (chunk.content.toLowerCase().includes(token)) {
        score += 2;
      }
    }

    return { chunk, score };
  });

  scored.sort((a, b) => b.score - a.score);

  // If low score, include general summary or top items
  const selected = scored.slice(0, maxChunks).filter((item) => item.score > 0);

  // If no specific match, take top general chunks (price summary, faq enrollment, campus schedule)
  if (selected.length === 0) {
    return [
      RAG_KNOWLEDGE_CHUNKS.find((c) => c.id === 'price-discounts')?.content || '',
      RAG_KNOWLEDGE_CHUNKS.find((c) => c.id === 'faq-enrollment')?.content || '',
      RAG_KNOWLEDGE_CHUNKS.find((c) => c.id === 'sched-campus')?.content || '',
    ].filter(Boolean).join('\n\n---\n\n');
  }

  return selected.map((s) => s.chunk.content).join('\n\n---\n\n');
}
