// Quran.com API service
// Documentation: https://api-docs.quran.com/

export interface Chapter {
  id: number;
  revelation_place: string;
  revelation_order: number;
  bismillah_pre: boolean;
  name_simple: string;
  name_complex: string;
  name_arabic: string;
  verses_count: number;
  pages: number[];
  translated_name: {
    language_name: string;
    name: string;
  };
}

export interface Verse {
  id: number;
  verse_number: number;
  verse_key: string;
  hizb_number: number;
  rub_el_hizb_number: number;
  ruku_number: number;
  manzil_number: number;
  sajdah_number: number | null;
  text_uthmani: string;
  text_uthmani_simple: string;
  text_imlaei: string;
  text_imlaei_simple: string;
  text_indopak: string;
  text_uthmani_tajweed: string;
  juz_number: number;
  page_number: number;
  words: Word[];
  translations?: Translation[];
}

export interface Word {
  id: number;
  position: number;
  audio_url: string;
  char_type_name: string;
  code_v1: string;
  code_v2: string;
  line_number: number;
  page_number: number;
  text: string;
  translation: {
    text: string;
    language_name: string;
  };
  transliteration: {
    text: string;
    language_name: string;
  };
}

export interface Translation {
  id: number;
  language_name: string;
  text: string;
  resource_name: string;
}

export interface AudioFile {
  id: number;
  chapter_id: number;
  file_size: number;
  format: string;
  audio_url: string;
}

export interface Reciter {
  id: number;
  name: string;
  arabic_name: string;
  relative_path: string;
  format: string;
  files_size: number;
}

const BASE_URL = 'https://api.quran.com/api/v4';

// Mishary al-Afasy reciter ID (commonly used)
export const MISHARY_AL_AFASY_ID = 7;

export class QuranApiService {
  /**
   * Get all chapters (surahs) from the Quran
   */
  static async getChapters(): Promise<Chapter[]> {
    try {
      const response = await fetch(`${BASE_URL}/chapters`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.chapters;
    } catch (error) {
      console.error('Error fetching chapters:', error);
      throw error;
    }
  }

  /**
   * Get a specific chapter by ID
   */
  static async getChapter(chapterId: number): Promise<Chapter> {
    try {
      const response = await fetch(`${BASE_URL}/chapters/${chapterId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.chapter;
    } catch (error) {
      console.error('Error fetching chapter:', error);
      throw error;
    }
  }

  /**
   * Get verses of a specific chapter
   */
  static async getVersesByChapter(
    chapterId: number, 
    options: {
      translations?: string; // e.g., '20' for English translation
      words?: boolean;
      transliteration?: boolean;
      page?: number;
      perPage?: number;
    } = {}
  ): Promise<Verse[]> {
    try {
      const params = new URLSearchParams();
      
      if (options.translations) params.append('translations', options.translations);
      if (options.words) params.append('words', 'true');
      if (options.transliteration) params.append('word_translation_language', 'en');
      if (options.page) params.append('page', options.page.toString());
      if (options.perPage) params.append('per_page', options.perPage.toString());

      const url = `${BASE_URL}/verses/by_chapter/${chapterId}?${params.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.verses;
    } catch (error) {
      console.error('Error fetching verses:', error);
      throw error;
    }
  }

  /**
   * Get a specific verse
   */
  static async getVerse(
    chapterId: number, 
    verseNumber: number,
    options: {
      translations?: string;
      words?: boolean;
      transliteration?: boolean;
    } = {}
  ): Promise<Verse> {
    try {
      const params = new URLSearchParams();
      
      if (options.translations) params.append('translations', options.translations);
      if (options.words) params.append('words', 'true');
      if (options.transliteration) params.append('word_translation_language', 'en');

      const url = `${BASE_URL}/verses/by_key/${chapterId}:${verseNumber}?${params.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.verse;
    } catch (error) {
      console.error('Error fetching verse:', error);
      throw error;
    }
  }

  /**
   * Get audio URL for a specific verse with Mishary al-Afasy recitation
   */
  static async getVerseAudio(chapterId: number, verseNumber: number): Promise<string> {
    try {
      // Using Mishary al-Afasy recitation (reciter ID: 7)
      const response = await fetch(
        `${BASE_URL}/chapter_recitations/${MISHARY_AL_AFASY_ID}/${chapterId}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.audio_file.audio_url;
    } catch (error) {
      console.error('Error fetching verse audio:', error);
      // Fallback URL structure for Mishary al-Afasy
      const paddedChapter = chapterId.toString().padStart(3, '0');
      const paddedVerse = verseNumber.toString().padStart(3, '0');
      return `https://verses.quran.com/Alafasy/mp3/001${paddedChapter}${paddedVerse}.mp3`;
    }
  }

  /**
   * Get all available reciters
   */
  static async getReciters(): Promise<Reciter[]> {
    try {
      const response = await fetch(`${BASE_URL}/resources/recitations`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.recitations;
    } catch (error) {
      console.error('Error fetching reciters:', error);
      throw error;
    }
  }

  /**
   * Get word-by-word breakdown for better lesson generation
   */
  static async getWordByWordBreakdown(chapterId: number, verseNumber: number): Promise<Word[]> {
    try {
      const verse = await this.getVerse(chapterId, verseNumber, {
        words: true,
        transliteration: true,
        translations: '20' // English translation
      });
      
      return verse.words || [];
    } catch (error) {
      console.error('Error fetching word breakdown:', error);
      throw error;
    }
  }
}

export default QuranApiService;
