import { Course, Teacher, EventItem, StatisticItem, FAQItem, LeadApplication } from '../types';

export const SEED_STATISTICS: StatisticItem[] = [
  {
    value: '2,850+',
    label: {
      ru: 'Выпускников трудоустроено',
      uz: 'Bitiruvchilar ish bilan ta\'minlangan',
      en: 'Graduates successfully employed'
    },
    sublabel: {
      ru: 'в ведущие IT-компании Узбекистана и мира',
      uz: 'O\'zbekiston va jahonning yetakchi IT kompaniyalariga',
      en: 'at leading tech companies locally & globally'
    },
    iconName: 'GraduationCap'
  },
  {
    value: '94.6%',
    label: {
      ru: 'Успешность трудоустройства',
      uz: 'Ishga joylashish ko\'rsatkichi',
      en: 'Employment rate within 3 months'
    },
    sublabel: {
      ru: 'с персональной поддержкой карьерного центра',
      uz: 'karyera markazi ko\'magida 3 oy ichida',
      en: 'backed by our dedicated career acceleration center'
    },
    iconName: 'TrendingUp'
  },
  {
    value: '$1,380',
    label: {
      ru: 'Средняя стартовая зарплата',
      uz: 'O\'rtacha boshlang\'ich maosh',
      en: 'Average starting salary'
    },
    sublabel: {
      ru: 'первый оклад наших выпускников на позиции Junior+',
      uz: 'Junior+ darajasidagi bitiruvchilarimizning birinchi maoshi',
      en: 'first compensation package for Junior+ level'
    },
    iconName: 'DollarSign'
  },
  {
    value: '180+',
    label: {
      ru: 'Компаний-партнеров',
      uz: 'Hamkor IT kompaniyalar',
      en: 'Hiring partner companies'
    },
    sublabel: {
      ru: 'регулярно нанимают студентов прямо с защиты диплома',
      uz: 'talabalarni to\'g\'ridan-to\'g\'ri ishga taklif qiladilar',
      en: 'actively recruiting students during demo days'
    },
    iconName: 'Building2'
  }
];

export const SEED_PARTNERS = [
  { name: 'EPAM Systems', logo: 'EPAM' },
  { name: 'Uzum Group', logo: 'UZUM' },
  { name: 'Yandex', logo: 'YANDEX' },
  { name: 'Payme', logo: 'PAYME' },
  { name: 'Click', logo: 'CLICK' },
  { name: 'Exadel', logo: 'EXADEL' },
  { name: 'TBC Bank', logo: 'TBC' },
  { name: 'IT Park Uzbekistan', logo: 'IT PARK' },
];

export const SEED_TEACHERS: Teacher[] = [
  {
    id: 'teacher-1',
    name: 'Тимур Алимов',
    role: {
      ru: 'Руководитель Frontend-направления / Senior Architect',
      uz: 'Frontend yo\'nalishi rahbari / Senior Architect',
      en: 'Head of Frontend Track / Senior Architect'
    },
    company: 'Ex-EPAM & Fintech Tech Lead',
    experienceYears: 9,
    bio: {
      ru: '9+ лет в коммерческой разработке высоконагруженных веб-приложений. Эксперт по React, Next.js, TypeScript и архитектуре микрофронтендов.',
      uz: 'Yuqori yuklamali veb-ilovalarni ishlab chiqishda 9+ yillik tajriba. React, Next.js, TypeScript va mikrofrontendlarning arxitekturasi bo\'yicha ekspert.',
      en: '9+ years in high-load web development. Expert in React, Next.js, TypeScript, and micro-frontend architecture.'
    },
    skills: ['React 19', 'Next.js', 'TypeScript', 'TailwindCSS', 'Redux Toolkit', 'GraphQL', 'Micro-frontends'],
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    socials: {
      linkedin: 'https://linkedin.com',
      github: 'https://github.com',
      telegram: 'https://t.me'
    }
  },
  {
    id: 'teacher-2',
    name: 'Мадина Каримова',
    role: {
      ru: 'Principal Backend & Cloud Engineer',
      uz: 'Principal Backend va Cloud muhandisi',
      en: 'Principal Backend & Cloud Engineer'
    },
    company: 'Uzum FinTech',
    experienceYears: 8,
    bio: {
      ru: 'Специализируется на микросервисной архитектуре, асинхронных очередях и защищенных распределенных базах данных. Обучила более 450 разработчиков.',
      uz: 'Mikroservis arxitekturasi, asinxron navbatlar va xavfsiz ma\'lumotlar bazalariga ixtisoslashgan. 450 dan ortiq dasturchilarga ustozlik qilgan.',
      en: 'Specialized in microservices, distributed queues, and secure database systems. Mentored over 450 engineers.'
    },
    skills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'Kubernetes', 'Redis', 'Kafka'],
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    socials: {
      linkedin: 'https://linkedin.com',
      github: 'https://github.com',
      telegram: 'https://t.me'
    }
  },
  {
    id: 'teacher-3',
    name: 'Сардор Рахимов',
    role: {
      ru: 'Lead Product & UI/UX Designer',
      uz: 'Bosh Mahsulot va UI/UX dizayneri',
      en: 'Lead Product & UI/UX Designer'
    },
    company: 'TBC Bank Digital Design Team',
    experienceYears: 7,
    bio: {
      ru: 'Создатель дизайн-систем для мобильного и веб-банкинга. Преподает UX-исследования, интерактивное прототипирование и UI в Figma.',
      uz: 'Mobil va veb-banking uchun dizayn tizimlari muallifi. UX tadqiqotlar, interaktiv prototiplash va Figma bo\'yicha dars beradi.',
      en: 'Creator of design systems for banking & fintech products. Teaches user research, interactive prototyping, and design systems.'
    },
    skills: ['Figma', 'Design Systems', 'UX Research', 'Mobile UX', 'CJM', 'Motion Design'],
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    socials: {
      linkedin: 'https://linkedin.com',
      telegram: 'https://t.me'
    }
  },
  {
    id: 'teacher-4',
    name: 'Жасур Усманов',
    role: {
      ru: 'Mobile Tech Lead (Flutter & iOS)',
      uz: 'Mobil dasturlash Tech Lead (Flutter va iOS)',
      en: 'Mobile Tech Lead (Flutter & iOS)'
    },
    company: 'Ex-Payme Mobile Lead',
    experienceYears: 7,
    bio: {
      ru: 'Автор 15+ коммерческих мобильных приложений в App Store и Google Play с суммарной аудиторией более 2 миллионов пользователей.',
      uz: 'App Store va Google Play-da 2 milliondan ortiq foydalanuvchiga ega 15 dan ortiq yirik ilovalar yaratuvchisi.',
      en: 'Author of 15+ production mobile applications in App Store & Google Play with over 2M active users.'
    },
    skills: ['Flutter', 'Dart', 'Swift', 'Kotlin', 'Firebase', 'State Management (Bloc)', 'CI/CD Mobile'],
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    socials: {
      linkedin: 'https://linkedin.com',
      github: 'https://github.com'
    }
  },
  {
    id: 'teacher-5',
    name: 'Елена Волкова',
    role: {
      ru: 'Senior AI / Data Science Researcher',
      uz: 'Katta AI / Data Science tadqiqotchisi',
      en: 'Senior AI & Data Science Researcher'
    },
    company: 'AI Solutions Lab',
    experienceYears: 8,
    bio: {
      ru: 'Исследователь в области NLP и генеративных языковых моделей. Реализовала более 30 корпоративных ML-пайплайнов для прогнозной аналитики.',
      uz: 'NLP va generativ sun\'iy intellekt bo\'yicha tadqiqotchi. 30 dan ortiq yirik korporativ ML modellarini ishlab chiqqan.',
      en: 'Researcher in NLP, LLMs, and Computer Vision. Deployed over 30 production machine learning pipelines.'
    },
    skills: ['Python', 'PyTorch', 'TensorFlow', 'LLMs', 'Pandas', 'Scikit-Learn', 'Vector DBs'],
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
    socials: {
      linkedin: 'https://linkedin.com',
      github: 'https://github.com'
    }
  },
  {
    id: 'teacher-6',
    name: 'Бобур Мирзаев',
    role: {
      ru: 'DevOps & Cloud Solutions Architect',
      uz: 'DevOps va Cloud yechimlar arxitektori',
      en: 'DevOps & Cloud Solutions Architect'
    },
    company: 'CloudScale Infrastructure',
    experienceYears: 8,
    bio: {
      ru: 'Эксперт по автоматизации развертывания, отказоустойчивости инфраструктур в AWS/GCP, настройке мониторинга и безопасности серверов.',
      uz: 'Avtomatlashtirilgan o\'rnatish, AWS/GCP bulutli infratuzilmalari, monitoring va xavfsizlik bo\'yicha yetakchi mutaxassis.',
      en: 'Expert in infrastructure automation, AWS/GCP high availability, Kubernetes orchestration, and DevSecOps pipelines.'
    },
    skills: ['Docker', 'Kubernetes', 'Terraform', 'AWS', 'Linux', 'GitLab CI', 'Prometheus'],
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80',
    socials: {
      linkedin: 'https://linkedin.com',
      github: 'https://github.com'
    }
  }
];

export const SEED_COURSES: Course[] = [
  {
    id: 'course-frontend',
    category: 'frontend',
    title: {
      ru: 'Frontend-разработчик: от основ до React и Next.js',
      uz: 'Frontend dasturchi: noldan React va Next.js gacha',
      en: 'Frontend Developer: From Zero to React & Next.js'
    },
    level: {
      ru: 'С нуля до Junior+',
      uz: 'Noldan Junior+ gacha',
      en: 'Beginner to Junior+'
    },
    duration: {
      ru: '6 месяцев',
      uz: '6 oy',
      en: '6 months'
    },
    schedule: {
      ru: '3 раза в неделю (Пн-Ср-Пт, 19:00 - 21:00)',
      uz: 'Haftada 3 kun (Dush-Chor-Jum, 19:00 - 21:00)',
      en: '3 times a week (Mon-Wed-Fri, 19:00 - 21:00)'
    },
    price: '1,750,000 UZS',
    fullPrice: '10,500,000 UZS',
    popular: true,
    mentorId: 'teacher-1',
    iconName: 'Layout',
    description: {
      ru: 'Научитесь создавать интерактивные веб-интерфейсы, сложные веб-приложения на TypeScript и React, работать с API и оптимизировать производительность.',
      uz: 'Interaktiv veb-interfeyslar, TypeScript va React yordamida murakkab ilovalar yaratish, API bilan ishlash va optimallashtirishni o\'rganasiz.',
      en: 'Learn to build responsive web interfaces, modern applications with TypeScript & React, integrate APIs, and optimize web performance.'
    },
    technologies: ['HTML5 & CSS3', 'Modern JavaScript (ES6+)', 'TypeScript', 'React 19', 'Next.js 15', 'TailwindCSS', 'Redux Toolkit', 'Git & GitHub'],
    syllabus: [
      {
        module: 1,
        title: {
          ru: 'Основы веб-разработки: HTML5, Семантика и современный CSS',
          uz: 'Veb asoslari: HTML5, Semantika va zamonaviy CSS',
          en: 'Web Fundamentals: HTML5, Semantics & Modern CSS'
        },
        topics: [
          { ru: 'Структура DOM и семантическая верстка', uz: 'DOM tuzilishi va semantik kod', en: 'DOM structure and semantic markup' },
          { ru: 'Flexbox, CSS Grid и адаптивный дизайн (Mobile First)', uz: 'Flexbox, Grid va moslashuvchan dizayn', en: 'Flexbox, CSS Grid & Mobile-First responsive design' },
          { ru: 'Tailwind CSS и препроцессоры', uz: 'Tailwind CSS va preprotsessorlar', en: 'Tailwind CSS and preprocessors' }
        ]
      },
      {
        module: 2,
        title: {
          ru: 'JavaScript (ES6+) и алгоритмическое мышление',
          uz: 'JavaScript (ES6+) va algoritmlash',
          en: 'JavaScript (ES6+) & Algorithmic Foundations'
        },
        topics: [
          { ru: 'Типы данных, функции высшего порядка, замыкания', uz: 'Ma\'lumotlar turlari, closure va funksiyalar', en: 'Data types, higher-order functions, closures' },
          { ru: 'Асинхронный JS: Promises, Async/Await, Fetch API', uz: 'Asinxron JS: Promises, Async/Await va Fetch API', en: 'Async JS: Promises, Async/Await, Fetch API' },
          { ru: 'Работа с Browser API, LocalStorage, событиями', uz: 'Browser API, LocalStorage va hodisalar bilan ishlash', en: 'Browser APIs, LocalStorage & DOM event handling' }
        ]
      },
      {
        module: 3,
        title: {
          ru: 'TypeScript и современный React',
          uz: 'TypeScript va zamonaviy React',
          en: 'TypeScript & Modern React Ecosystem'
        },
        topics: [
          { ru: 'Статическая типизация с TypeScript', uz: 'TypeScript bilan statik tiplash', en: 'Static typing with TypeScript' },
          { ru: 'Хуки: useState, useEffect, useMemo, useCallback, Custom Hooks', uz: 'React Hooklar va maxsus hooklar yaratish', en: 'React hooks & building reusable custom hooks' },
          { ru: 'Управление состоянием: Zustand и Redux Toolkit', uz: 'Holatni boshqarish: Zustand va Redux Toolkit', en: 'State management: Zustand and Redux Toolkit' }
        ]
      },
      {
        module: 4,
        title: {
          ru: 'Next.js, Архитектура и дипломный проект',
          uz: 'Next.js, Arxitektura va diplom loyihasi',
          en: 'Next.js, Architecture & Capstone Project'
        },
        topics: [
          { ru: 'Server Components, SSR, SSG и маршрутизация', uz: 'Server komponentlar, SSR va marshrutlash', en: 'Server Components, SSR, SSG & App Router' },
          { ru: 'Оптимизация, безопасность и CI/CD деплой', uz: 'Tezlikni optimallashtirish va CI/CD bilan joylashtirish', en: 'Performance optimization, security, and Vercel CI/CD' },
          { ru: 'Защита коммерческого командного дипломного проекта', uz: 'Jamoaviy tijorat diplom loyihasini himoya qilish', en: 'Defense of a full commercial team capstone project' }
        ]
      }
    ]
  },
  {
    id: 'course-backend',
    category: 'backend',
    title: {
      ru: 'Backend-разработчик: Python, FastAPI и PostgreSQL',
      uz: 'Backend dasturchi: Python, FastAPI va PostgreSQL',
      en: 'Backend Developer: Python, FastAPI & PostgreSQL'
    },
    level: {
      ru: 'С нуля до Junior+',
      uz: 'Noldan Junior+ gacha',
      en: 'Beginner to Junior+'
    },
    duration: {
      ru: '6 месяцев',
      uz: '6 oy',
      en: '6 months'
    },
    schedule: {
      ru: '3 раза в неделю (Вт-Чт-Сб, 19:00 - 21:00)',
      uz: 'Haftada 3 kun (Sesh-Pay-Shan, 19:00 - 21:00)',
      en: '3 times a week (Tue-Thu-Sat, 19:00 - 21:00)'
    },
    price: '1,800,000 UZS',
    fullPrice: '10,800,000 UZS',
    popular: true,
    mentorId: 'teacher-2',
    iconName: 'Server',
    description: {
      ru: 'Освойте разработку серверной логики, реляционные базы данных, асинхронные API, микросервисы, Docker и развертывание в облаке.',
      uz: 'Server mantiqini yaratish, PostgreSQL ma\'lumotlar bazasi, asinxron API, mikroservislar va Docker bilan ishlashni o\'rganing.',
      en: 'Master server-side architecture, relational databases, asynchronous REST APIs, microservices, Docker, and cloud deployments.'
    },
    technologies: ['Python 3.12', 'FastAPI', 'PostgreSQL', 'SQLAlchemy / Alembic', 'Redis', 'Docker', 'JWT Auth', 'REST & GraphQL'],
    syllabus: [
      {
        module: 1,
        title: {
          ru: 'Продвинутый Python и архитектура кода (ООП)',
          uz: 'Chuqurlashtirilgan Python va OOP',
          en: 'Advanced Python & OOP Principles'
        },
        topics: [
          { ru: 'Типизация, датаклассы, декораторы, генераторы', uz: 'Tiplash, dataclass, dekoratorlar', en: 'Type hints, dataclasses, decorators, generators' },
          { ru: 'ООП, паттерны проектирования и Clean Architecture', uz: 'OOP va Clean Architecture tamoyillari', en: 'OOP, design patterns & clean code practices' }
        ]
      },
      {
        module: 2,
        title: {
          ru: 'Базы данных: PostgreSQL и ORM',
          uz: 'Ma\'lumotlar bazalari: PostgreSQL va ORM',
          en: 'Databases: PostgreSQL & ORM'
        },
        topics: [
          { ru: 'Сложные SQL-запросы, индексы, транзакции, нормализация', uz: 'Murakkab SQL so\'rovlar, indekslar, tranzaksiyalar', en: 'Complex SQL queries, indexing, transactions, ACID' },
          { ru: 'SQLAlchemy 2.0 (Async) и миграции Alembic', uz: 'SQLAlchemy 2.0 va Alembic migratsiyalari', en: 'Asynchronous SQLAlchemy 2.0 and Alembic migrations' }
        ]
      },
      {
        module: 3,
        title: {
          ru: 'FastAPI, Авторизация и Микросервисы',
          uz: 'FastAPI, Autentifikatsiya va Mikroservislar',
          en: 'FastAPI, Authentication & Microservices'
        },
        topics: [
          { ru: 'Pydantic валидация, Dependency Injection, Swagger', uz: 'Pydantic, Dependency Injection va Swagger', en: 'Pydantic validation, Dependency Injection & OpenAPI' },
          { ru: 'Безопасность: OAuth2, JWT токены, Hashing', uz: 'Xavfsizlik: OAuth2, JWT va parollarni xesh qilish', en: 'Security: OAuth2, JWT tokens, RBAC permissions' },
          { ru: 'Кэширование с Redis и очереди Celery', uz: 'Redis kesh va Celery foniy vazifalar', en: 'Caching with Redis & background jobs with Celery' }
        ]
      },
      {
        module: 4,
        title: {
          ru: 'Docker, Контейнеризация и Релиз дипломного проекта',
          uz: 'Docker va diplom loyihasini ishlab chiqarishga chiqarish',
          en: 'Docker, Containerization & Production Release'
        },
        topics: [
          { ru: 'Docker, Docker Compose, мультистейдж сборки', uz: 'Docker va Docker Compose orqali konteynerlash', en: 'Docker, multi-stage builds, and Docker Compose' },
          { ru: 'Финальный дипломный проект: FinTech платежный шлюз', uz: 'Yakuniy diplom loyihasi: To\'lov shlyuzi yaratish', en: 'Capstone Project: High-concurrency Fintech payment gateway' }
        ]
      }
    ]
  },
  {
    id: 'course-mobile',
    category: 'mobile',
    title: {
      ru: 'Мобильный разработчик: Flutter & Dart для iOS и Android',
      uz: 'Mobil dasturchi: iOS va Android uchun Flutter & Dart',
      en: 'Mobile Developer: Flutter & Dart for iOS & Android'
    },
    level: {
      ru: 'С нуля до Junior+',
      uz: 'Noldan Junior+ gacha',
      en: 'Beginner to Junior+'
    },
    duration: {
      ru: '5 месяцев',
      uz: '5 oy',
      en: '5 months'
    },
    schedule: {
      ru: '3 раза в неделю (Пн-Ср-Пт, 17:00 - 19:00)',
      uz: 'Haftada 3 kun (Dush-Chor-Jum, 17:00 - 19:00)',
      en: '3 times a week (Mon-Wed-Fri, 17:00 - 19:00)'
    },
    price: '1,650,000 UZS',
    fullPrice: '8,250,000 UZS',
    popular: false,
    mentorId: 'teacher-4',
    iconName: 'Smartphone',
    description: {
      ru: 'Создавайте кроссплатформенные мобильные приложения для двух платформ одновременно с красивыми нативными анимациями и интеграцией с облаком.',
      uz: 'Bitta kod orqali iOS va Android platformalari uchun qulay, chiroyli va tez ishlovchi ilovalarni ishlab chiqing.',
      en: 'Create cross-platform mobile apps for iOS & Android from a single codebase with fluid native animations and cloud backends.'
    },
    technologies: ['Dart', 'Flutter', 'BLoC Pattern', 'REST API', 'Firebase', 'App Store / Play Market deploy', 'SQLite / Hive'],
    syllabus: [
      {
        module: 1,
        title: {
          ru: 'Язык Dart и архитектура Flutter виджетов',
          uz: 'Dart tili va Flutter vidjetlari arxitekturasi',
          en: 'Dart Language & Flutter Widget Tree'
        },
        topics: [
          { ru: 'Синтаксис Dart, Null Safety, коллекции', uz: 'Dart sintaksisi va Null Safety', en: 'Dart syntax, Null Safety, async streams' },
          { ru: 'Stateless и Stateful виджеты, верстка экранов', uz: 'Stateless va Stateful vidjetlar, ekranlar yasash', en: 'Stateless & Stateful widgets, responsive UI' }
        ]
      },
      {
        module: 2,
        title: {
          ru: 'Управление состоянием с BLoC и Clean Architecture',
          uz: 'BLoC orqali holatni boshqarish va Clean Architecture',
          en: 'State Management with BLoC & Clean Architecture'
        },
        topics: [
          { ru: 'Паттерн BLoC/Cubit, события и состояния', uz: 'BLoC va Cubit arxitekturasi', en: 'BLoC / Cubit events and states pattern' },
          { ru: 'Разделение на слои: Data, Domain, Presentation', uz: 'Data, Domain va Presentation qatlamlari', en: 'Separation of concerns: Data, Domain, Presentation' }
        ]
      },
      {
        module: 3,
        title: {
          ru: 'Работа с сетью, локальным хранилищем и Firebase',
          uz: 'Tarmoq, lokal xotira va Firebase bilan ishlash',
          en: 'Networking, Offline Cache & Firebase'
        },
        topics: [
          { ru: 'Dio, перехватчики запросов, кэш с Hive', uz: 'Dio, request interceptorlar va Hive keshlash', en: 'Dio client, interceptors & Hive offline storage' },
          { ru: 'Push-уведомления, Google Maps, Firebase Auth', uz: 'Push-xabarlar va Firebase Auth integratsiyasi', en: 'Push notifications, maps, and Firebase Auth' }
        ]
      },
      {
        module: 4,
        title: {
          ru: 'Дипломный проект: Маркетплейс и публикация в сторы',
          uz: 'Diplom loyihasi: Marketplace va ilovani do\'konlarga chiqarish',
          en: 'Capstone Project: E-Commerce App & App Store Publication'
        },
        topics: [
          { ru: 'Сборка APK, AAB и IPA файлов', uz: 'APK, AAB va IPA yig\'ish', en: 'Building release APK, AAB and iOS IPA bundles' },
          { ru: 'Публикация в Google Play Console и App Store Connect', uz: 'Google Play va App Store-ga chiqarish qoidalari', en: 'Submission guidelines for App Store & Google Play' }
        ]
      }
    ]
  },
  {
    id: 'course-design',
    category: 'design',
    title: {
      ru: 'UI/UX & Product Design: от идеи до прототипа в Figma',
      uz: 'UI/UX va Mahsulot Dizayni: G\'oyadan Figma prototipigacha',
      en: 'UI/UX & Product Design: From Concept to Figma Prototype'
    },
    level: {
      ru: 'С нуля до Junior+',
      uz: 'Noldan Junior+ gacha',
      en: 'Beginner to Junior+'
    },
    duration: {
      ru: '4 месяца',
      uz: '4 oy',
      en: '4 months'
    },
    schedule: {
      ru: '3 раза в неделю (Вт-Чт-Сб, 17:00 - 19:00)',
      uz: 'Haftada 3 kun (Sesh-Pay-Shan, 17:00 - 19:00)',
      en: '3 times a week (Tue-Thu-Sat, 17:00 - 19:00)'
    },
    price: '1,500,000 UZS',
    fullPrice: '6,000,000 UZS',
    popular: true,
    mentorId: 'teacher-3',
    iconName: 'Palette',
    description: {
      ru: 'Освойте профессию продуктового дизайнера: интерфейсы приложений и веб-сервисов, дизайн-системы, проведение UX-исследований и анимации.',
      uz: 'Mahsulot dizayneri kasbini egallang: mobil va veb-interfeyslar, dizayn tizimlari, UX tadqiqotlar va interaktiv animatsiyalar.',
      en: 'Master product design: build high-converting web and mobile apps, scalable design systems, conduct UX research, and craft interactive prototypes.'
    },
    technologies: ['Figma Master', 'Auto Layout', 'Design Systems', 'UX Research', 'User Flow & CJM', 'Interactive Prototyping', 'Behance Portfolio'],
    syllabus: [
      {
        module: 1,
        title: {
          ru: 'UX-исследования и проектирование пользовательского опыта',
          uz: 'UX tadqiqotlar va foydalanuvchi tajribasini loyihalash',
          en: 'UX Research & User Experience Architecture'
        },
        topics: [
          { ru: 'Глубинные интервью, персоны, анализ конкурентов', uz: 'Intervyular, personajlar va raqobatchilar tahlili', en: 'User interviews, persona creation, competitive benchmarking' },
          { ru: 'Customer Journey Map (CJM) и информационная архитектура', uz: 'CJM va axborot arxitekturasi', en: 'Customer Journey Maps (CJM) and Information Architecture' }
        ]
      },
      {
        module: 2,
        title: {
          ru: 'Figma: Продвинутый уровень и UI-композиция',
          uz: 'Figma: Chuqurlashtirilgan daraja va UI kompozitsiyasi',
          en: 'Figma Mastery: Components & UI Composition'
        },
        topics: [
          { ru: 'Сетки, типографика, теория цвета и контраст', uz: 'Setkalar, tipografika va ranglar nazariyasi', en: 'Grid layouts, typography scales, color contrast accessibility' },
          { ru: 'Auto Layout, компоненты, варианты и переменные (Variables)', uz: 'Auto Layout, komponentlar va Figma Variables', en: 'Auto Layout, responsive components, variants & variables' }
        ]
      },
      {
        module: 3,
        title: {
          ru: 'Дизайн-системы и интерактивные анимации',
          uz: 'Dizayn tizimlari va interaktiv animatsiyalar',
          en: 'Design Systems & Interactive Micro-animations'
        },
        topics: [
          { ru: 'Построение масштабных дизайн-систем для команд', uz: 'Jamoalar uchun keng ko\'lamli dizayn tizimlarini yaratish', en: 'Building scalable design systems with atomic tokens' },
          { ru: 'Smart Animate и микроинтеракции мобильных приложений', uz: 'Smart Animate va mikromunosabatlar', en: 'Smart Animate, mobile gestures & interactive prototypes' }
        ]
      },
      {
        module: 4,
        title: {
          ru: 'Оформление кейсов на Behance и передача в разработку',
          uz: 'Behance portfoliosi va dasturchilarga topshirish',
          en: 'Behance Portfolio Case Study & Developer Handoff'
        },
        topics: [
          { ru: 'Подготовка макетов к верстке: спецификации и UI Kit', uz: 'Maketlarni dasturchilarga topshirish qoidalari', en: 'Developer handoff, design tokens & Figma Dev Mode' },
          { ru: 'Оформление 2 сильных кейсов на Behance и Dribbble', uz: 'Behance va Dribbble uchun 2 ta kuchli keys tayyorlash', en: 'Publishing 2 high-impact case studies on Behance' }
        ]
      }
    ]
  },
  {
    id: 'course-datascience',
    category: 'data',
    title: {
      ru: 'Data Science & AI: Машинное обучение и нейросети',
      uz: 'Data Science & AI: Mashinaviy o\'rganish va neyrotarmoqlar',
      en: 'Data Science & AI: Machine Learning & Neural Networks'
    },
    level: {
      ru: 'С базовыми знаниями до Junior+',
      uz: 'Boshlang\'ich bilimlardan Junior+ gacha',
      en: 'Foundations to Junior+'
    },
    duration: {
      ru: '7 месяцев',
      uz: '7 oy',
      en: '7 months'
    },
    schedule: {
      ru: '3 раза в неделю (Пн-Ср-Пт, 19:30 - 21:30)',
      uz: 'Haftada 3 kun (Dush-Chor-Jum, 19:30 - 21:30)',
      en: '3 times a week (Mon-Wed-Fri, 19:30 - 21:30)'
    },
    price: '2,100,000 UZS',
    fullPrice: '14,700,000 UZS',
    popular: false,
    mentorId: 'teacher-5',
    iconName: 'Cpu',
    description: {
      ru: 'Научитесь собирать и анализировать большие данные, обучать прогнозные модели, внедрять LLM (ChatGPT API) и компьютерное зрение.',
      uz: 'Katta ma\'lumotlarni tahlil qilish, bashorat modellarini o\'qitish, zamonaviy LLM va neyrotarmoqlarni amaliyotga joriy qilish.',
      en: 'Analyze big data, train predictive ML models, integrate LLMs and computer vision models into real-world business applications.'
    },
    technologies: ['Python', 'Pandas & NumPy', 'Scikit-learn', 'PyTorch', 'LLMs & Prompt Engineering', 'OpenCV', 'SQL for Analytics'],
    syllabus: [
      {
        module: 1,
        title: {
          ru: 'Математика для Data Science и анализ данных на Python',
          uz: 'Data Science uchun matematika va Python ma\'lumotlar tahlili',
          en: 'Math for Data Science & Python Analytics'
        },
        topics: [
          { ru: 'Линейная алгебра, математическая статистика и теория вероятностей', uz: 'Chiziqli algebra va ehtimollar nazariyasi', en: 'Linear algebra, probability, and inferential statistics' },
          { ru: 'EDA (разведочный анализ) с Pandas, NumPy, Seaborn', uz: 'Pandas va NumPy yordamida ma\'lumotlar tahlili', en: 'Exploratory data analysis (EDA) with Pandas & Seaborn' }
        ]
      },
      {
        module: 2,
        title: {
          ru: 'Классическое машинное обучение (Machine Learning)',
          uz: 'Klassik mashinaviy o\'rganish (Machine Learning)',
          en: 'Classic Machine Learning Algorithms'
        },
        topics: [
          { ru: 'Регрессия, классификация, кластеризация, Random Forest', uz: 'Regressiya, tasniflash va tasodifiy o\'rmon algoritmi', en: 'Linear regression, classification, random forests, clustering' },
          { ru: 'Градиентный бустинг: XGBoost, LightGBM, CatBoost', uz: 'Gradient boosting: XGBoost va CatBoost', en: 'Gradient boosting with XGBoost, LightGBM, and CatBoost' }
        ]
      },
      {
        module: 3,
        title: {
          ru: 'Глубокое обучение и нейросети (Deep Learning & PyTorch)',
          uz: 'Chuqur o\'rganish va neyrotarmoqlar (PyTorch)',
          en: 'Deep Learning & Neural Networks with PyTorch'
        },
        topics: [
          { ru: 'Полносвязные и сверточные сети (CNN) для обработки изображений', uz: 'Tasvirlarni aniqlash uchun CNN tarmoqlari', en: 'Convolutional neural networks (CNNs) for Computer Vision' },
          { ru: 'Трансформеры, BERT, эмбеддинги и векторные базы данных', uz: 'Transformerlar, matn tahlili va vektor bazalar', en: 'Transformers architecture, embeddings & vector databases' }
        ]
      },
      {
        module: 4,
        title: {
          ru: 'Генеративный ИИ, LLM агенты и дипломный проект',
          uz: 'Generativ SI, LLM agentlar va diplom loyihasi',
          en: 'Generative AI, LLM Agents & Capstone Project'
        },
        topics: [
          { ru: 'RAG системы (Retrieval-Augmented Generation) и LangChain', uz: 'RAG tizimlari va korporativ AI yordamchilari', en: 'Retrieval-Augmented Generation (RAG) and LangChain' },
          { ru: 'Развертывание моделей в прод через FastAPI и Docker', uz: 'Modellarni API orqali ishlab chiqarishga chiqarish', en: 'Model serving with FastAPI, Docker, and monitoring' }
        ]
      }
    ]
  },
  {
    id: 'course-devops',
    category: 'devops',
    title: {
      ru: 'DevOps & Cloud Engineering: Инфраструктура и CI/CD',
      uz: 'DevOps va Cloud Engineering: Infratuzilma va CI/CD',
      en: 'DevOps & Cloud Engineering: Infrastructure & CI/CD'
    },
    level: {
      ru: 'С базовым Linux до Junior+',
      uz: 'Boshlang\'ich Linux bilan Junior+ gacha',
      en: 'Intermediate to Junior+'
    },
    duration: {
      ru: '5 месяцев',
      uz: '5 oy',
      en: '5 months'
    },
    schedule: {
      ru: '3 раза в неделю (Вт-Чт-Сб, 19:30 - 21:30)',
      uz: 'Haftada 3 kun (Sesh-Pay-Shan, 19:30 - 21:30)',
      en: '3 times a week (Tue-Thu-Sat, 19:30 - 21:30)'
    },
    price: '2,000,000 UZS',
    fullPrice: '10,000,000 UZS',
    popular: false,
    mentorId: 'teacher-6',
    iconName: 'Terminal',
    description: {
      ru: 'Изучите администрирование Linux, контейнеризацию в Docker, оркестрацию с Kubernetes, автоматизацию развертывания и облачные технологии AWS.',
      uz: 'Linux tizimini boshqarish, Docker konteynerlari, Kubernetes klasterlari, CI/CD konveyerlari va AWS bulutli xizmatlarini o\'rganing.',
      en: 'Learn Linux administration, Docker containerization, Kubernetes cluster orchestration, automated CI/CD pipelines, and AWS cloud management.'
    },
    technologies: ['Linux Bash', 'Docker', 'Kubernetes (K8s)', 'Terraform', 'GitLab CI / GitHub Actions', 'AWS Cloud', 'Prometheus & Grafana'],
    syllabus: [
      {
        module: 1,
        title: {
          ru: 'Linux Pro, сети и безопасность серверов',
          uz: 'Linux Pro, tarmoqlar va server xavfsizligi',
          en: 'Linux Pro, Networking & Server Hardening'
        },
        topics: [
          { ru: 'Bash скриптинг, управление процессами, права доступа', uz: 'Bash skriptlar va tizim boshqaruvi', en: 'Bash scripting, process management, file permissions' },
          { ru: 'TCP/IP, DNS, SSL/TLS сертификаты, Nginx reverse proxy', uz: 'TCP/IP, DNS va Nginx reverse proxy sozlash', en: 'Networking: TCP/IP, DNS, SSL/TLS certificates, Nginx proxy' }
        ]
      },
      {
        module: 2,
        title: {
          ru: 'Контейнеризация и оркестрация: Docker & Kubernetes',
          uz: 'Konteynerlash va orkestratsiya: Docker & Kubernetes',
          en: 'Containerization & Orchestration: Docker & Kubernetes'
        },
        topics: [
          { ru: 'Docker, Docker Compose, оптимизация образов', uz: 'Docker fayllar va resurslarni boshqarish', en: 'Docker daemon, layered caching, compose stacks' },
          { ru: 'Kubernetes: Pods, Deployments, Services, Ingress, Helm', uz: 'Kubernetes klasteri va Helm paketlari', en: 'Kubernetes architecture: Pods, Services, Ingress, Helm charts' }
        ]
      },
      {
        module: 3,
        title: {
          ru: 'Infrastructure as Code (IaC) & Cloud (AWS)',
          uz: 'Infratuzilmani kod sifatida boshqarish (Terraform & AWS)',
          en: 'Infrastructure as Code (IaC) & AWS Cloud'
        },
        topics: [
          { ru: 'Terraform: автоматизация создания облачной инфраструктуры', uz: 'Terraform yordamida bulutni avtomatlashtirish', en: 'Terraform state, modules, and automated cloud provisioning' },
          { ru: 'AWS: EC2, S3, RDS, VPC, IAM политики безопасности', uz: 'AWS xizmatlari va xavfsizlik qoidalari', en: 'AWS core primitives: EC2, S3, RDS, VPC, IAM policies' }
        ]
      },
      {
        module: 4,
        title: {
          ru: 'CI/CD пайплайны и мониторинг (Prometheus & Grafana)',
          uz: 'CI/CD quvurlari va monitoring tizimlari',
          en: 'Automated CI/CD Pipelines & Observability'
        },
        topics: [
          { ru: 'Настройка GitHub Actions и GitLab CI для автотестов и деплоя', uz: 'Avtomatlashtirilgan test va joylashtirish quvurlari', en: 'Zero-downtime deployment pipelines with GitHub Actions' },
          { ru: 'Мониторинг метрик и логов с Prometheus, Grafana, Loki', uz: 'Grafana va Prometheus orqali monitoring', en: 'Metrics visualization & alerting with Prometheus & Grafana' }
        ]
      }
    ]
  }
];

export const SEED_EVENTS: EventItem[] = [
  {
    id: 'event-1',
    type: 'workshop',
    title: {
      ru: 'Бесплатный мастер-класс: «Roadmap в IT 2026 — Как получить первый оффер за 6 месяцев»',
      uz: 'Bepul master-klass: «IT Roadmap 2026 — 6 oyda birinchi taklifni olish yo\'li»',
      en: 'Free Workshop: "IT Career Roadmap 2026 — Landing Your First Offer in 6 Months"'
    },
    date: '2026-11-28',
    time: '19:00 - 21:00',
    location: {
      ru: 'Главный кампус Apex (IT Park) + Онлайн стрим',
      uz: 'Apex bosh kampusi (IT Park) + Onlayn efir',
      en: 'Apex Main Campus (IT Park) + Online Livestream'
    },
    description: {
      ru: 'Техлиды из EPAM и Uzum разберут реальные требования работодателей, как составить резюме без опыта и пройти техническое собеседование.',
      uz: 'EPAM va Uzum kompaniyalarining yetakchi mutaxassislari rezyume tayyorlash va texnik intervyudan o\'tish sirlarini ochib beradilar.',
      en: 'Tech leads from top companies break down industry expectations, resume tips without prior commercial experience, and interview tips.'
    },
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
    badge: {
      ru: 'Мастер-класс',
      uz: 'Master-klass',
      en: 'Workshop'
    },
    spotsLeft: 24
  },
  {
    id: 'event-2',
    type: 'hackathon',
    title: {
      ru: 'Apex AI & Web Hackathon: Призовой фонд $5,000',
      uz: 'Apex AI & Web Xakaton: Mukofot jamg\'armasi $5,000',
      en: 'Apex AI & Web Hackathon: $5,000 Prize Pool'
    },
    date: '2026-12-05',
    time: '48 часов нон-стоп',
    location: {
      ru: 'Apex Tech Hub (Офлайн)',
      uz: 'Apex Tech Hub (Oflayn)',
      en: 'Apex Tech Hub (Offline)'
    },
    description: {
      ru: '48-часовой интенсив по созданию инновационных продуктов на стыке искусственного интеллекта и веб-сервисов. Лучшие команды получат гранты на запуск.',
      uz: 'Sun\'iy intellekt va veb-servislar bo\'yicha 48 soatlik mahsulot yaratish marafoni. Eng yaxshi jamoalar grant yutib oladilar.',
      en: '48-hour challenge to build cutting-edge web & AI products. Winners receive venture grants and fast-track interviews with partners.'
    },
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
    badge: {
      ru: 'Хакатон',
      uz: 'Xakaton',
      en: 'Hackathon'
    },
    spotsLeft: 12
  },
  {
    id: 'event-3',
    type: 'event',
    title: {
      ru: 'День открытых дверей: Знакомство с академией и тест профессий',
      uz: 'Ochiq eshiklar kuni: Akademiya va kasblar bilan tanishuv',
      en: 'Open Campus Day: Meet Mentors & Free Career Assessment'
    },
    date: '2026-12-12',
    time: '14:00 - 18:00',
    location: {
      ru: 'Главный кампус Apex, 3-й этаж',
      uz: 'Apex bosh kampusi, 3-qavat',
      en: 'Apex Main Campus, 3rd Floor'
    },
    description: {
      ru: 'Экскурсия по современным аудиториям, личное общение с менторами, бесплатное профессиональное тестирование для выбора направления.',
      uz: 'Zamonaviy auditoriyalarga sayohat, ustozlar bilan yuzma-yuz suhbat va kasb tanlash uchun bepul test sinovi.',
      en: 'Tour our high-tech labs, meet mentors in person, and take a free aptitude test to find your ideal tech specialization.'
    },
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
    badge: {
      ru: 'День открытых дверей',
      uz: 'Ochiq eshiklar kuni',
      en: 'Open Doors'
    },
    spotsLeft: 45
  },
  {
    id: 'event-4',
    type: 'news',
    title: {
      ru: '96% наших студентов защитили дипломные проекты перед CTO ведущих компаний',
      uz: 'Talabalarimizning 96 foizi yetakchi kompaniyalar CTOlari oldida diplom loyihalarini himoya qildi',
      en: '96% of Students Successfully Defended Capstones in Front of Industry CTOs'
    },
    date: '2026-11-10',
    location: {
      ru: 'Новости академии',
      uz: 'Akademiya yangiliklari',
      en: 'Academy News'
    },
    description: {
      ru: 'На осеннем Demo Day присутствовали рекрутеры из 25 IT-компаний. Более 40 студентов получили офферы прямо в день защиты.',
      uz: 'Kuzgi Demo Day doirasida 25 ta IT kompaniya rekruterlari qatnashdi. 40 dan ortiq bitiruvchi himoya kunining o\'zidayoq ish taklifini oldi.',
      en: 'The Fall Demo Day brought recruiters from 25 leading software firms. Over 40 graduates received job offers directly on stage.'
    },
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    badge: {
      ru: 'Новости',
      uz: 'Yangiliklar',
      en: 'News'
    }
  }
];

export const SEED_FAQS: FAQItem[] = [
  {
    question: {
      ru: 'Нужен ли предварительный опыт в программировании для поступления?',
      uz: 'O\'qishga kirish uchun dasturlash bo\'yicha tajriba kerakmi?',
      en: 'Do I need prior programming experience to enroll?'
    },
    answer: {
      ru: 'Нет, наши базовые курсы (Frontend, Backend, Mobile, UI/UX) разработаны по авторской методике «с нуля до Junior+». Мы начинаем с базовых концепций и постепенно переходим к сложным проектам.',
      uz: 'Yo\'q, asosiy kurslarimiz (Frontend, Backend, Mobile, UI/UX) "noldan Junior+ gacha" metodikasi bo\'yicha tuzilgan. Boshlang\'ich tushunchalardan murakkab loyihalargacha bosqichma-bosqich o\'rganasiz.',
      en: 'No, our foundational tracks are structured from "Zero to Junior+". We begin with core fundamentals and progressively transition to commercial team projects.'
    }
  },
  {
    question: {
      ru: 'Как работает гарантия помощи в трудоустройстве?',
      uz: 'Ishga joylashish kafolati qanday ishlaydi?',
      en: 'How does our career placement support work?'
    },
    answer: {
      ru: 'Наш карьерный центр начинает работу со студентами с середины обучения: проводит мок-интервью, помогает составить портфолио на GitHub/Behance, оформить резюме и организует закрытый Demo Day с компаниями-партнерами.',
      uz: 'Karyera markazimiz o\'qish o\'rtasidan boshlab talabalar bilan ishlaydi: mock intervyular o\'tkazadi, GitHub/Behance portfoliolarini tuzishga ko\'maklashadi va hamkor kompaniyalar bilan Demo Day tashkil etadi.',
      en: 'Our Career Center starts working with you midway through the course: conducting mock interviews, curating GitHub/Behance portfolios, and hosting exclusive Demo Days with 180+ hiring partners.'
    }
  },
  {
    question: {
      ru: 'Есть ли возможность оплачивать обучение в рассрочку?',
      uz: 'O\'qish to\'lovini bo\'lib to\'lash imkoniyati bormi?',
      en: 'Is installment payment available for tuition?'
    },
    answer: {
      ru: 'Да, доступна помесячная оплата без переплат, а также банковская беспроцентная рассрочка на срок до 12 месяцев через банки-партнеры.',
      uz: 'Ha, oylik to\'lov qilish imkoniyati va hamkor banklar orqali 12 oygacha foizsiz bo\'lib to\'lash imkoniyati mavjud.',
      en: 'Yes, we offer flexible month-by-month billing with 0% extra fees, as well as 12-month interest-free bank financing options.'
    }
  },
  {
    question: {
      ru: 'В каком формате проходят занятия — онлайн или офлайн?',
      uz: 'Darslar qanday formatda o\'tadi — onlaynmi yoki oflayn?',
      en: 'Are classes held online or in-person?'
    },
    answer: {
      ru: 'Мы предлагаем гибридный формат: вы можете учиться в технологичном кампусе в Ташкенте с персональным ментором или подключаться к живым интерактивным трансляциям из любой точки мира. Все уроки записываются в высоком качестве.',
      uz: 'Biz gibrid formatni taklif qilamiz: Toshkentdagi zamonaviy kampusimizda ustoz bilan birga o\'qishingiz yoki onlayn jonli efirlarda qatnashishingiz mumkin. Barcha darslar yozib olinadi.',
      en: 'We provide a hybrid model: study in-person at our modern Tashkent tech campus with dedicated mentor desks, or join interactive live streams remotely. All sessions are recorded in HD.'
    }
  },
  {
    question: {
      ru: 'Выдаётся ли официальный сертификат по окончании обучения?',
      uz: 'O\'qishni tugatgandan so\'ng rasmiy sertifikat beriladimi?',
      en: 'Will I receive an accredited graduation certificate?'
    },
    answer: {
      ru: 'Да, каждый выпускник, успешно защитивший дипломный проект, получает номерной верифицируемый сертификат международного образца на английском языке с подтверждением освоенных навыков.',
      uz: 'Ha, diplom loyihasini muvaffaqiyatli himoya qilgan har bir bitiruvchiga xalqaro standartdagi, ingliz tilidagi tekshiriladigan rasmiy sertifikat topshiriladi.',
      en: 'Yes, every graduate who successfully defends their capstone project receives an accredited, verifiable digital & physical certificate in English detailing all mastered competencies.'
    }
  }
];

export const SEED_LEADS: LeadApplication[] = [
  {
    id: 'lead-1',
    name: 'Алишер Назаров',
    phone: '+998 90 123 45 67',
    email: 'alisher.n@example.com',
    courseId: 'course-frontend',
    courseName: 'Frontend Developer',
    message: 'Хочу сменить профессию, есть базовые знания HTML/CSS.',
    status: 'new',
    createdAt: '2026-11-14 18:30'
  },
  {
    id: 'lead-2',
    name: 'Dilnoza Akhmedova',
    phone: '+998 97 765 43 21',
    email: 'dilnoza.akh@example.com',
    courseId: 'course-design',
    courseName: 'UI/UX & Product Design',
    message: 'Qachon yangi guruh ochiladi? Narxi haqida ma\'lumot kerak.',
    status: 'in_progress',
    createdAt: '2026-11-14 16:15'
  },
  {
    id: 'lead-3',
    name: 'Michael Chen',
    phone: '+998 93 555 12 34',
    email: 'm.chen@example.com',
    courseId: 'course-backend',
    courseName: 'Backend Developer',
    message: 'Interested in Python and FastAPI backend bootcamp.',
    status: 'enrolled',
    createdAt: '2026-11-13 14:00'
  }
];
