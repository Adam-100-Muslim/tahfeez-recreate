// Quran Cloud API service
// Documentation: https://alquran.cloud/api

export interface QuranCloudSurah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  numberOfAyahs: number;
}

export interface QuranCloudAyah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean;
}

export interface QuranCloudTranslation {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean;
}

export interface QuranCloudTransliteration {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean;
}

export interface QuranCloudAudio {
  number: number;
  audio: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean;
}

export interface QuranCloudEdition {
  identifier: string;
  language: string;
  name: string;
  englishName: string;
  format: string;
  type: string;
}

export interface QuranCloudReciter {
  identifier: string;
  language: string;
  name: string;
  englishName: string;
  format: string;
  type: string;
}

const BASE_URL = 'https://api.alquran.cloud/v1';

export class QuranCloudService {
  /**
   * Get all surahs from the Quran
   */
  static async getSurahs(): Promise<QuranCloudSurah[]> {
    try {
      const response = await fetch(`${BASE_URL}/surah`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching surahs from Quran Cloud:', error);
      throw error;
    }
  }

  /**
   * Get a specific surah with Arabic text
   */
  static async getSurah(surahNumber: number): Promise<QuranCloudAyah[]> {
    try {
      const response = await fetch(`${BASE_URL}/surah/${surahNumber}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.data.ayahs;
    } catch (error) {
      console.error('Error fetching surah from Quran Cloud:', error);
      throw error;
    }
  }

  /**
   * Get a specific ayah with Arabic text
   */
  static async getAyah(surahNumber: number, ayahNumber: number): Promise<QuranCloudAyah> {
    try {
      const response = await fetch(`${BASE_URL}/ayah/${surahNumber}:${ayahNumber}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching ayah from Quran Cloud:', error);
      throw error;
    }
  }

  /**
   * Get English translation for a specific ayah
   */
  static async getAyahTranslation(surahNumber: number, ayahNumber: number): Promise<QuranCloudTranslation> {
    try {
      const response = await fetch(`${BASE_URL}/ayah/${surahNumber}:${ayahNumber}/en.sahih`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching translation from Quran Cloud:', error);
      throw error;
    }
  }

  /**
   * Get English transliteration for a specific ayah
   */
  static async getAyahTransliteration(surahNumber: number, ayahNumber: number): Promise<QuranCloudTransliteration> {
    try {
      const response = await fetch(`${BASE_URL}/ayah/${surahNumber}:${ayahNumber}/en.transliteration`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching transliteration from Quran Cloud:', error);
      throw error;
    }
  }

  /**
   * Get audio for a specific ayah with specified reciter
   */
  static async getAyahAudio(surahNumber: number, ayahNumber: number, reciter: string = 'mishary_rashid_alafasy'): Promise<string> {
    try {
      const response = await fetch(`${BASE_URL}/ayah/${surahNumber}:${ayahNumber}/${reciter}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.data.audio;
    } catch (error) {
      console.error('Error fetching audio from Quran Cloud:', error);
      throw error;
    }
  }

  /**
   * Get available reciters
   */
  static async getReciters(): Promise<QuranCloudReciter[]> {
    try {
      const response = await fetch(`${BASE_URL}/edition?format=audio&type=versebyverse`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching reciters from Quran Cloud:', error);
      throw error;
    }
  }

  /**
   * Get word-by-word breakdown with proper transliteration
   */
  static async getWordByWordBreakdown(surahNumber: number, ayahNumber: number): Promise<any[]> {
    try {
      // Get Arabic text, translation, and transliteration
      const [arabicAyah, translation, transliteration] = await Promise.all([
        this.getAyah(surahNumber, ayahNumber),
        this.getAyahTranslation(surahNumber, ayahNumber),
        this.getAyahTransliteration(surahNumber, ayahNumber)
      ]);

      // Split Arabic text into words
      const arabicWords = arabicAyah.text.split(' ').filter(word => word.trim().length > 0);
      
      // Split transliteration into words
      const transliterationWords = transliteration.text.split(' ').filter(word => word.trim().length > 0);
      
      // Split translation into words
      const translationWords = translation.text.split(' ').filter(word => word.trim().length > 0);

      // Create word mappings
      return arabicWords.map((word, index) => ({
        id: index + 1,
        position: index + 1,
        text: word.trim(),
        transliteration: {
          text: transliterationWords[index] || '',
          language_name: 'english'
        },
        translation: {
          text: this.getTranslationForWord(index, translationWords),
          language_name: 'english'
        },
        audio_url: this.getAyahAudio(surahNumber, ayahNumber)
      }));
    } catch (error) {
      console.error('Error creating word breakdown from Quran Cloud:', error);
      throw error;
    }
  }

  /**
   * Helper method to get appropriate translation for a word
   */
  private static getTranslationForWord(wordIndex: number, translationWords: string[]): string {
    // Simple mapping - can be improved
    if (wordIndex < translationWords.length) {
      return translationWords[wordIndex];
    }
    return 'translation not available';
  }

  /**
   * Get popular reciters
   */
  static getPopularReciters(): { [key: string]: string } {
    return {
      'mishary_rashid_alafasy': 'Mishary Rashid Al Afasy',
      'abdul_basit_abdul_samad': 'Abdul Basit Abdul Samad',
      'muhammad_siddiq_al_minshawi': 'Muhammad Siddiq Al Minshawi',
      'mahmoud_khalil_al_husary': 'Mahmoud Khalil Al Husary', // Sheikh al-Hussary!
      'muhammad_ayyub': 'Muhammad Ayyub',
      'saad_al_ghamdi': 'Saad Al Ghamdi',
      'ahmed_al_ajmi': 'Ahmed Al Ajmi',
      'abdur_rahman_as_sudais': 'Abdur Rahman As Sudais',
      'sadaqat_ali': 'Sadaqat Ali',
      'ghamadi': 'Ghamadi'
    };
  }
}

export default QuranCloudService;
