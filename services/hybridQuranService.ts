// Hybrid Quran Service
// Combines the original API with Quran Cloud for better features

import QuranApiService, { Surah, Ayah, Word } from './quranApi';
import QuranCloudService, { QuranCloudSurah, QuranCloudAyah } from './quranCloudApi';

export interface HybridWord extends Word {
  source: 'quran-cloud' | 'original-api';
  quranCloudTransliteration?: string;
}

export class HybridQuranService {
  private static useQuranCloud: boolean = true; // Toggle between APIs

  /**
   * Toggle between using Quran Cloud or original API
   */
  static setUseQuranCloud(use: boolean): void {
    this.useQuranCloud = use;
    console.log(`Switched to ${use ? 'Quran Cloud' : 'Original'} API`);
  }

  /**
   * Get all surahs (from either API)
   */
  static async getSurahs(): Promise<Surah[]> {
    if (this.useQuranCloud) {
      try {
        const quranCloudSurahs = await QuranCloudService.getSurahs();
        // Convert to our Surah interface
        return quranCloudSurahs.map(surah => ({
          surahName: surah.englishName,
          surahNameArabic: surah.name,
          surahNameArabicLong: surah.name,
          surahNameTranslation: surah.englishNameTranslation,
          revelationPlace: surah.revelationType,
          totalAyah: surah.numberOfAyahs,
          surahNo: surah.number
        }));
      } catch (error) {
        console.log('Quran Cloud failed, falling back to original API');
        return QuranApiService.getSurahs();
      }
    }
    return QuranApiService.getSurahs();
  }

  /**
   * Get a specific ayah with enhanced data
   */
  static async getAyah(surahNo: number, ayahNo: number): Promise<Ayah> {
    if (this.useQuranCloud) {
      try {
        const [arabicAyah, translation, transliteration] = await Promise.all([
          QuranCloudService.getAyah(surahNo, ayahNo),
          QuranCloudService.getAyahTranslation(surahNo, ayahNo),
          QuranCloudService.getAyahTransliteration(surahNo, ayahNo)
        ]);

        // Convert to our Ayah interface
        return {
          surahName: 'Al-Fatiha', // Will be filled by caller
          surahNameArabic: 'الفاتحة',
          surahNameArabicLong: 'سورة الفاتحة',
          surahNameTranslation: 'The Opening',
          revelationPlace: 'Mecca',
          totalAyah: 7,
          surahNo: surahNo,
          ayahNo: ayahNo,
          audio: {
            '1': {
              reciter: 'Quran Cloud',
              url: await QuranCloudService.getAyahAudio(surahNo, ayahNo),
              originalUrl: await QuranCloudService.getAyahAudio(surahNo, ayahNo)
            }
          },
          english: translation.text,
          arabic1: arabicAyah.text,
          arabic2: arabicAyah.text.replace(/[ًٌٍَُِّْ]/g, ''), // Remove diacritics
          // Add transliteration as a custom property
          ...(transliteration && { transliteration: transliteration.text })
        };
      } catch (error) {
        console.log('Quran Cloud failed, falling back to original API');
        return QuranApiService.getAyah(surahNo, ayahNo);
      }
    }
    return QuranApiService.getAyah(surahNo, ayahNo);
  }

  /**
   * Get all verses for a specific surah
   */
  static async getVerses(surahNo: number): Promise<Ayah[]> {
    if (this.useQuranCloud) {
      try {
        // Get surah info first
        const surahs = await QuranCloudService.getSurahs();
        const surah = surahs.find(s => s.number === surahNo);
        
        if (!surah) {
          throw new Error('Surah not found');
        }

        // Get all ayahs for the surah
        const ayahs = await QuranCloudService.getSurah(surahNo);
        
        // Convert to our Ayah interface
        const verses: Ayah[] = [];
        for (let i = 0; i < ayahs.length; i++) {
          const ayah = ayahs[i];
          try {
            const [translation, transliteration] = await Promise.all([
              QuranCloudService.getAyahTranslation(surahNo, i + 1),
              QuranCloudService.getAyahTransliteration(surahNo, i + 1)
            ]);

            verses.push({
              surahName: surah.englishName,
              surahNameArabic: surah.name,
              surahNameArabicLong: `سورة ${surah.name}`,
              surahNameTranslation: surah.englishNameTranslation,
              revelationPlace: surah.revelationType,
              totalAyah: surah.numberOfAyahs,
              surahNo: surahNo,
              ayahNo: i + 1,
              audio: {
                '1': {
                  reciter: 'Quran Cloud',
                  url: await QuranCloudService.getAyahAudio(surahNo, i + 1),
                  originalUrl: await QuranCloudService.getAyahAudio(surahNo, i + 1)
                }
              },
              english: translation.text,
              arabic1: ayah.text,
              arabic2: ayah.text.replace(/[ًٌٍَُِّْ]/g, ''), // Remove diacritics
              // Add transliteration as a custom property
              transliteration: transliteration.text
            });
          } catch (error) {
            console.log(`Failed to get translation/transliteration for ayah ${i + 1}, using basic data`);
            // Fallback with basic data
            verses.push({
              surahName: surah.englishName,
              surahNameArabic: surah.name,
              surahNameArabicLong: `سورة ${surah.name}`,
              surahNameTranslation: surah.englishNameTranslation,
              revelationPlace: surah.revelationType,
              totalAyah: surah.numberOfAyahs,
              surahNo: surahNo,
              ayahNo: i + 1,
              audio: {
                '1': {
                  reciter: 'Quran Cloud',
                  url: await QuranCloudService.getAyahAudio(surahNo, i + 1),
                  originalUrl: await QuranCloudService.getAyahAudio(surahNo, i + 1)
                }
              },
              english: 'Translation not available',
              arabic1: ayah.text,
              arabic2: ayah.text.replace(/[ًٌٍَُِّْ]/g, ''),
              transliteration: 'Transliteration not available'
            });
          }
        }
        
        return verses;
      } catch (error) {
        console.log('Quran Cloud failed, falling back to original API');
        // Fallback to original API
        const surahData = await QuranApiService.getSurah(surahNo);
        
        // Transform the surah data to individual ayah objects
        return surahData.english.map((englishText, index) => ({
          surahName: surahData.surahName,
          surahNameArabic: surahData.surahNameArabic,
          surahNameArabicLong: surahData.surahNameArabicLong,
          surahNameTranslation: surahData.surahNameTranslation,
          revelationPlace: surahData.revelationPlace,
          totalAyah: surahData.totalAyah,
          surahNo: surahData.surahNo,
          ayahNo: index + 1,
          audio: surahData.audio,
          english: englishText,
          arabic1: surahData.arabic1[index],
          arabic2: surahData.arabic2[index],
          bengali: surahData.bengali?.[index],
          urdu: surahData.urdu?.[index],
          turkish: surahData.turkish?.[index],
          uzbek: surahData.uzbek?.[index]
        }));
      }
    }
    
    // Use original API
    const surahData = await QuranApiService.getSurah(surahNo);
    
    // Transform the surah data to individual ayah objects
    return surahData.english.map((englishText, index) => ({
      surahName: surahData.surahName,
      surahNameArabic: surahData.surahNameArabic,
      surahNameArabicLong: surahData.surahNameArabicLong,
      surahNameTranslation: surahData.surahNameTranslation,
      revelationPlace: surahData.revelationPlace,
      totalAyah: surahData.totalAyah,
      surahNo: surahData.surahNo,
      ayahNo: index + 1,
      audio: surahData.audio,
      english: englishText,
      arabic1: surahData.arabic1[index],
      arabic2: surahData.arabic2[index],
      bengali: surahData.bengali?.[index],
      urdu: surahData.urdu?.[index],
      turkish: surahData.turkish?.[index],
      uzbek: surahData.uzbek?.[index]
    }));
  }

  /**
   * Get word-by-word breakdown with enhanced transliteration
   */
  static async getWordByWordBreakdown(surahNo: number, ayahNo: number): Promise<HybridWord[]> {
    if (this.useQuranCloud) {
      try {
        const words = await QuranCloudService.getWordByWordBreakdown(surahNo, ayahNo);
        return words.map(word => ({
          ...word,
          source: 'quran-cloud' as const,
          quranCloudTransliteration: word.transliteration.text
        }));
      } catch (error) {
        console.log('Quran Cloud failed, falling back to original API');
        const words = await QuranApiService.getWordByWordBreakdown(surahNo, ayahNo);
        return words.map(word => ({
          ...word,
          source: 'original-api' as const
        }));
      }
    }
    
    const words = await QuranApiService.getWordByWordBreakdown(surahNo, ayahNo);
    return words.map(word => ({
      ...word,
      source: 'original-api' as const
    }));
  }

  /**
   * Get audio URL with choice of reciter
   */
  static async getAyahAudio(
    surahNo: number, 
    ayahNo: number, 
    reciterId: string = 'mishary_rashid_alafasy'
  ): Promise<string> {
    if (this.useQuranCloud) {
      try {
        return await QuranCloudService.getAyahAudio(surahNo, ayahNo, reciterId);
      } catch (error) {
        console.log('Quran Cloud audio failed, falling back to original API');
        return QuranApiService.getAyahAudio(surahNo, ayahNo, reciterId);
      }
    }
    return QuranApiService.getAyahAudio(surahNo, ayahNo, reciterId);
  }

  /**
   * Get available reciters
   */
  static async getReciters(): Promise<{ [key: string]: string }> {
    if (this.useQuranCloud) {
      try {
        const reciters = await QuranCloudService.getReciters();
        const reciterMap: { [key: string]: string } = {};
        reciters.forEach(reciter => {
          reciterMap[reciter.identifier] = reciter.englishName;
        });
        return reciterMap;
      } catch (error) {
        console.log('Quran Cloud reciters failed, falling back to original API');
        return QuranApiService.getReciters();
      }
    }
    return QuranApiService.getReciters();
  }

  /**
   * Get popular reciters (Quran Cloud specific)
   */
  static getPopularReciters(): { [key: string]: string } {
    if (this.useQuranCloud) {
      return QuranCloudService.getPopularReciters();
    }
    // Fallback to original API reciters
    return {
      '1': 'Mishary Rashid Al Afasy',
      '2': 'Abu Bakr Al Shatri',
      '3': 'Nasser Al Qatami',
      '4': 'Yasser Al Dosari',
      '5': 'Hani Ar Rifai'
    };
  }

  /**
   * Check if Quran Cloud is available and working
   */
  static async testQuranCloud(): Promise<boolean> {
    try {
      await QuranCloudService.getSurahs();
      return true;
    } catch (error) {
      console.log('Quran Cloud is not available:', error);
      return false;
    }
  }

  /**
   * Get current API status
   */
  static getCurrentAPI(): string {
    return this.useQuranCloud ? 'Quran Cloud' : 'Original API';
  }
}

export default HybridQuranService;
