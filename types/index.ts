// Types pour l'application Tahfeez

export interface Surah {
  id: number;
  name: string;
  arabicName: string;
  verses: number;
  difficulty?: string;
  category?: string;
}

export interface Verse {
  number: number;
  arabic: string;
  translation: string;
  words: number;
}

export interface UserProfile {
  level: string;
  timeCommitment: string;
  goal: string;
}

export interface Word {
  arabic: string;
  translation: string;
  transliteration: string;
  position: number;
}

export interface Exercise {
  type: 'word-match' | 'translation-select' | 'audio-match' | 'complete-verse';
  question: string;
  options: string[];
  correctAnswer: string;
  word?: Word;
  explanation?: string;
}
