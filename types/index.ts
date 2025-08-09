// Types pour l'application Tahfeez

export interface Surah {
  surahName: string;
  surahNameArabic: string;
  surahNameArabicLong: string;
  surahNameTranslation: string;
  revelationPlace: string;
  totalAyah: number;
  surahNo?: number;
  difficulty?: string;
  category?: string;
}

export interface Verse {
  surahNo: number;
  ayahNo: number;
  arabic: string;
  arabicWithTashkeel: string;
  translation: string;
  audio: {
    [key: string]: {
      reciter: string;
      url: string;
      originalUrl: string;
    };
  };
}

export interface UserProfile {
  level: string;
  timeCommitment: string;
  goal: string;
}

export interface Word {
  id: number;
  position: number;
  arabic: string;
  translation: string;
  transliteration: string;
  audio_url?: string;
}

export interface Exercise {
  type: 'word-match' | 'translation-select' | 'audio-match' | 'complete-verse';
  question: string;
  options: string[];
  correctAnswer: string;
  word?: Word;
  explanation?: string;
}
