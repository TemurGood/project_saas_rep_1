export type Language = 'ru' | 'uz' | 'en';
export type Theme = 'light' | 'dark';

export interface LocalizedString {
  ru: string;
  uz: string;
  en: string;
}

export type CourseCategory = 'all' | 'frontend' | 'backend' | 'mobile' | 'design' | 'data' | 'qa' | 'devops';

export interface Course {
  id: string;
  title: LocalizedString;
  category: CourseCategory;
  level: LocalizedString; // e.g. "С нуля" / "Zero to Pro"
  duration: LocalizedString; // e.g. "6 месяцев" / "6 months"
  schedule: LocalizedString; // e.g. "3 раза в неделю по 2 часа"
  price: string; // e.g. "1,800,000 UZS / мес"
  fullPrice?: string;
  description: LocalizedString;
  syllabus: {
    module: number;
    title: LocalizedString;
    topics: LocalizedString[];
  }[];
  technologies: string[];
  popular?: boolean;
  mentorId: string;
  iconName: string;
}

export interface Teacher {
  id: string;
  name: string;
  role: LocalizedString;
  company: string;
  experienceYears: number;
  bio: LocalizedString;
  skills: string[];
  avatar: string;
  socials: {
    linkedin?: string;
    github?: string;
    telegram?: string;
  };
}

export interface EventItem {
  id: string;
  type: 'event' | 'news' | 'hackathon' | 'workshop';
  title: LocalizedString;
  date: string;
  time?: string;
  location: LocalizedString;
  description: LocalizedString;
  image: string;
  badge: LocalizedString;
  spotsLeft?: number;
}

export interface LeadApplication {
  id: string;
  name: string;
  phone: string;
  email: string;
  courseId: string;
  courseName?: string;
  message?: string;
  status: 'new' | 'in_progress' | 'enrolled' | 'rejected';
  createdAt: string;
}

export interface StatisticItem {
  value: string;
  label: LocalizedString;
  sublabel: LocalizedString;
  iconName: string;
}

export interface FAQItem {
  question: LocalizedString;
  answer: LocalizedString;
}
