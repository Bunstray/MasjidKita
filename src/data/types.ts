/* =============================================
   Shared TypeScript interfaces for MasjidKita
   ============================================= */

export interface PrayerTime {
  name: string;
  nameAr: string;
  time: string; // HH:MM format
  icon: string;
}

export interface PrayerSchedule {
  date: string;
  hijriDate: string;
  location: string;
  prayers: PrayerTime[];
}

export interface Surah {
  number: number;
  nameAr: string;
  nameLatin: string;
  nameEn: string;
  totalVerses: number;
  revelationType: 'Makkiyah' | 'Madaniyah';
}

export interface Verse {
  number: number;
  textAr: string;
  translation: string;
  transliteration: string;
}

export interface DuaCategory {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
  count: number;
  color: string;
}

export interface Dua {
  id: string;
  categoryId: string;
  title: string;
  titleAr: string;
  textAr: string;
  transliteration: string;
  translation: string;
  source: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: 'event' | 'announcement' | 'update';
  date: string;
  author: string;
}

export interface DonationCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'qris' | 'ewallet' | 'bank';
  logo: string;
}
