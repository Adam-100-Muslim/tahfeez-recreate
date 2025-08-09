// QuranAPI.pages.dev API service
// Documentation: https://quranapi.pages.dev/

export interface Surah {
  surahName: string;
  surahNameArabic: string;
  surahNameArabicLong: string;
  surahNameTranslation: string;
  revelationPlace: string;
  totalAyah: number;
  surahNo: number; // Make it required since we'll add it
}

export interface Ayah {
  surahName: string;
  surahNameArabic: string;
  surahNameArabicLong: string;
  surahNameTranslation: string;
  revelationPlace: string;
  totalAyah: number;
  surahNo: number;
  ayahNo: number;
  audio: {
    [key: string]: {
      reciter: string;
      url: string;
      originalUrl: string;
    };
  };
  english: string;
  arabic1: string; // With Tashkeel (diacritics)
  arabic2: string; // Without Tashkeel
  bengali?: string;
  urdu?: string;
  turkish?: string;
  uzbek?: string;
}

export interface SurahComplete {
  surahName: string;
  surahNameArabic: string;
  surahNameArabicLong: string;
  surahNameTranslation: string;
  revelationPlace: string;
  totalAyah: number;
  surahNo: number;
  audio: {
    [key: string]: {
      reciter: string;
      url: string;
      originalUrl: string;
    };
  };
  english: string[];
  arabic1: string[];
  arabic2: string[];
  bengali?: string[];
  urdu?: string[];
  turkish?: string[];
  uzbek?: string[];
}

export interface Tafsir {
  surahName: string;
  surahNo: number;
  ayahNo: number;
  tafsirs: {
    author: string;
    groupVerse?: string | null;
    content: string;
  }[];
}

export interface Reciters {
  [key: string]: string;
}

// For lesson generation - we need to create word-like structure from ayah
export interface Word {
  id: number;
  position: number;
  audio_url: string;
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

const BASE_URL = 'https://quranapi.pages.dev/api';

// Default reciter IDs
export const MISHARY_AL_AFASY_ID = '1';
export const ABU_BAKR_AL_SHATRI_ID = '2';
export const NASSER_AL_QATAMI_ID = '3';
export const YASSER_AL_DOSARI_ID = '4';
export const HANI_AR_RIFAI_ID = '5';

export class QuranApiService {
  /**
   * Get all surahs from the Quran
   */
  static async getSurahs(): Promise<Surah[]> {
    try {
      const response = await fetch(`${BASE_URL}/surah.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Add surahNo to each surah since the API doesn't include it
      return data.map((surah: any, index: number) => ({
        ...surah,
        surahNo: index + 1
      }));
    } catch (error) {
      console.error('Error fetching surahs:', error);
      throw error;
    }
  }

  /**
   * Get a specific surah by number
   */
  static async getSurah(surahNo: number): Promise<SurahComplete> {
    try {
      const response = await fetch(`${BASE_URL}/${surahNo}.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching surah:', error);
      throw error;
    }
  }

  /**
   * Get a specific ayah (verse)
   */
  static async getAyah(surahNo: number, ayahNo: number): Promise<Ayah> {
    try {
      const response = await fetch(`${BASE_URL}/${surahNo}/${ayahNo}.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching ayah:', error);
      throw error;
    }
  }

  /**
   * Get tafsir for a specific ayah
   */
  static async getTafsir(surahNo: number, ayahNo: number): Promise<Tafsir> {
    try {
      const response = await fetch(`${BASE_URL}/tafsir/${surahNo}_${ayahNo}.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching tafsir:', error);
      throw error;
    }
  }

  /**
   * Get audio URL for a specific ayah with specified reciter
   */
  static async getAyahAudio(
    surahNo: number, 
    ayahNo: number, 
    reciterId: string = MISHARY_AL_AFASY_ID
  ): Promise<string> {
    try {
      const ayah = await this.getAyah(surahNo, ayahNo);
      const audioData = ayah.audio[reciterId];
      
      if (!audioData) {
        throw new Error(`Reciter ${reciterId} not found for this ayah`);
      }
      
      // Prefer originalUrl if available
      return audioData.originalUrl || audioData.url;
    } catch (error) {
      console.error('Error fetching ayah audio:', error);
      // Fallback to direct audio URL
      return `https://quranapi.pages.dev/${reciterId}/${surahNo}_${ayahNo}.mp3`;
    }
  }

  /**
   * Get audio URL for a complete surah
   */
  static async getSurahAudio(
    surahNo: number, 
    reciterId: string = MISHARY_AL_AFASY_ID
  ): Promise<string> {
    try {
      const response = await fetch(`${BASE_URL}/audio/${surahNo}.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const audioData = data[reciterId];
      
      if (!audioData) {
        throw new Error(`Reciter ${reciterId} not found for this surah`);
      }
      
      // Prefer originalUrl if available
      return audioData.originalUrl || audioData.url;
    } catch (error) {
      console.error('Error fetching surah audio:', error);
      throw error;
    }
  }

  /**
   * Get all available reciters
   */
  static async getReciters(): Promise<Reciters> {
    try {
      const response = await fetch(`${BASE_URL}/reciters.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching reciters:', error);
      throw error;
    }
  }

  /**
   * Get word-by-word breakdown for lesson generation
   * Enhanced version with better word mapping and transliteration
   */
  static async getWordByWordBreakdown(surahNo: number, ayahNo: number): Promise<Word[]> {
    try {
      const ayah = await this.getAyah(surahNo, ayahNo);
      
      // Split the Arabic text into words and create simplified word objects
      const arabicWords = ayah.arabic1.split(' ').filter(word => word.trim().length > 0);
      const englishWords = ayah.english.split(/\s+/);
      
      // Create a better word-to-translation mapping
      const wordMappings = this.createWordMappings(arabicWords, englishWords);
      
      return arabicWords.map((word, index) => ({
        id: index + 1,
        position: index + 1,
        audio_url: `https://quranapi.pages.dev/1/${surahNo}_${ayahNo}.mp3`, // Full ayah audio as fallback
        text: word.trim(),
        translation: {
          text: wordMappings[index] || this.getWordTranslation(word.trim()),
          language_name: 'english'
        },
        transliteration: {
          text: this.arabicToTransliteration(word.trim()),
          language_name: 'english'
        }
      }));
    } catch (error) {
      console.error('Error creating word breakdown:', error);
      throw error;
    }
  }

  /**
   * Create better word-to-translation mappings
   */
  private static createWordMappings(arabicWords: string[], englishWords: string[]): string[] {
    const mappings: string[] = [];
    let englishIndex = 0;
    
    for (let i = 0; i < arabicWords.length; i++) {
      const arabicWord = arabicWords[i].trim();
      
      // Handle common Arabic patterns
      if (this.isArticle(arabicWord)) {
        mappings[i] = 'the';
        englishIndex++;
      } else if (this.isPreposition(arabicWord)) {
        mappings[i] = englishWords[englishIndex] || 'in/to/from';
        englishIndex++;
      } else {
        // Default mapping - take 1-2 English words depending on Arabic word complexity
        const wordCount = this.getExpectedEnglishWordCount(arabicWord);
        const translationParts = [];
        
        for (let j = 0; j < wordCount && englishIndex < englishWords.length; j++) {
          translationParts.push(englishWords[englishIndex++]);
        }
        
        mappings[i] = translationParts.join(' ') || this.getWordTranslation(arabicWord);
      }
    }
    
    return mappings;
  }

  /**
   * Check if Arabic word is an article
   */
  private static isArticle(word: string): boolean {
    const cleanWord = word.replace(/[ًٌٍَُِّْ]/g, '');
    return cleanWord === 'ال' || cleanWord.startsWith('ال');
  }

  /**
   * Check if Arabic word is a preposition
   */
  private static isPreposition(word: string): boolean {
    const prepositions = ['في', 'من', 'إلى', 'على', 'عن', 'لـ', 'بـ', 'كـ'];
    const cleanWord = word.replace(/[ًٌٍَُِّْ]/g, '');
    return prepositions.some(prep => cleanWord.startsWith(prep));
  }

  /**
   * Estimate how many English words an Arabic word might translate to
   */
  private static getExpectedEnglishWordCount(arabicWord: string): number {
    const cleanWord = arabicWord.replace(/[ًٌٍَُِّْ]/g, '');
    
    // Longer Arabic words might translate to multiple English words
    if (cleanWord.length > 8) return 2;
    if (cleanWord.length > 5) return 1;
    return 1;
  }

  /**
   * Get basic translation for common Arabic words
   */
  private static getWordTranslation(arabicWord: string): string {
    const commonWords: { [key: string]: string } = {
      'الله': 'Allah',
      'رب': 'Lord',
      'العالمين': 'of the worlds',
      'الرحمن': 'The Most Gracious',
      'الرحيم': 'The Most Merciful',
      'مالك': 'Master/Owner',
      'يوم': 'Day',
      'الدين': 'of Judgment',
      'إياك': 'You alone',
      'نعبد': 'we worship',
      'نستعين': 'we seek help',
      'اهدنا': 'Guide us',
      'الصراط': 'the path',
      'المستقيم': 'the straight',
      'صراط': 'path',
      'الذين': 'those',
      'أنعمت': 'You have blessed',
      'عليهم': 'upon them',
      'غير': 'not',
      'المغضوب': 'those who earned wrath',
      'ولا': 'and not',
      'الضالين': 'those who went astray'
    };
    
    const cleanWord = arabicWord.replace(/[ًٌٍَُِّْ]/g, '');
    return commonWords[cleanWord] || 'word';
  }

  /**
   * Enhanced Arabic to transliteration converter with vowels
   */
  private static arabicToTransliteration(arabicText: string): string {
    const transliterationMap: { [key: string]: string } = {
      // Letters
      'ا': 'a', 'أ': 'a', 'إ': 'i', 'آ': 'aa',
      'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j',
      'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'dh',
      'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh',
      'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z',
      'ع': "'", 'غ': 'gh', 'ف': 'f', 'ق': 'q',
      'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
      'ه': 'h', 'و': 'w', 'ي': 'y', 'ة': 'h',
      'ى': 'a', 'ء': "'",
      
      // Diacritics (vowels) - keep them for better pronunciation
      'َ': 'a',   // Fatha
      'ُ': 'u',   // Damma
      'ِ': 'i',   // Kasra
      'ّ': '',    // Shadda (doubling)
      'ْ': '',    // Sukun (no vowel)
      'ً': 'an',  // Tanween Fath
      'ٌ': 'un',  // Tanween Damm
      'ٍ': 'in',  // Tanween Kasr
      'ـ': '',    // Tatweel
      
      // Special cases
      'لا': 'la', // Lam-Alif
      'الل': 'allah', // Allah
    };

    // Handle special combinations first
    let result = arabicText;
    
    // Replace Allah
    result = result.replace(/الله/g, 'allah');
    result = result.replace(/لله/g, 'lillah');
    
    // Replace Lam-Alif
    result = result.replace(/لا/g, 'la');
    
    // Process character by character
    return result
      .split('')
      .map(char => transliterationMap[char] || char)
      .join('')
      .replace(/\s+/g, ' ') // Clean up extra spaces
      .trim();
  }
}

export default QuranApiService;
