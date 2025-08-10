// Example usage of the Quran API services
// This file demonstrates how to use the various API services

import QuranApiService, { Surah, Ayah, Word } from './services/quranApi';
import HybridQuranService, { HybridWord } from './services/hybridQuranService';
import LessonGenerator, { LessonPlan } from './services/lessonGenerator';

// Example 1: Get all surahs
export async function getAllSurahs() {
  try {
    // Use hybrid service to get surahs
    const surahs = await HybridQuranService.getSurahs();
    console.log(`Found ${surahs.length} surahs`);
    
    // Display first few surahs
    surahs.slice(0, 5).forEach(surah => {
      console.log(`${surah.surahNo}. ${surah.surahName} (${surah.surahNameArabic}) - ${surah.totalAyah} ayahs`);
    });
    
    return surahs;
  } catch (error) {
    console.error('Error fetching surahs:', error);
    throw error;
  }
}

// Example 2: Get a specific ayah with audio
export async function getAyahWithAudio(surahNo: number, ayahNo: number) {
  try {
    // Use hybrid service to get ayah
    const ayah = await HybridQuranService.getAyah(surahNo, ayahNo);
    
    // Get audio URL
    const audioUrl = await HybridQuranService.getAyahAudio(surahNo, ayahNo);
    
    console.log(`Ayah ${surahNo}:${ayahNo} - ${ayah.surahName}`);
    console.log(`English: ${ayah.english}`);
    console.log(`Arabic: ${ayah.arabic1}`);
    console.log(`Audio URL: ${audioUrl}`);
    
    return { ayah, audioUrl };
  } catch (error) {
    console.error('Error fetching ayah:', error);
    throw error;
  }
}

// Example 3: Generate a lesson for an ayah
export async function generateLessonForAyah(surahNo: number, ayahNo: number) {
  try {
    // Get the ayah using hybrid service
    const ayah = await HybridQuranService.getAyah(surahNo, ayahNo);
    
    // Get word breakdown using hybrid service
    const words = await HybridQuranService.getWordByWordBreakdown(surahNo, ayahNo);
    
    // Generate lesson plan (now async)
    const lessonPlan = await LessonGenerator.generateLessonPlan(ayah, words);
    
    console.log(`Generated lesson for ${lessonPlan.verseKey}`);
    console.log(`Total questions: ${lessonPlan.totalQuestions}`);
    console.log(`Total strokes: ${lessonPlan.totalStrokes}`);
    
    // Display first question
    if (lessonPlan.questions.length > 0) {
      const firstQuestion = lessonPlan.questions[0];
      console.log(`First question: ${firstQuestion.question}`);
      console.log(`Options: ${firstQuestion.options.map(o => o.text).join(', ')}`);
    }
    
    return lessonPlan;
  } catch (error) {
    console.error('Error generating lesson:', error);
    throw error;
  }
}

// Example 4: Get available reciters
export async function getAvailableReciters() {
  try {
    // Use hybrid service to get reciters
    const reciters = await HybridQuranService.getReciters();
    console.log('Available reciters:');
    Object.entries(reciters).forEach(([id, name]) => {
      console.log(`  ${id}: ${name}`);
    });
    
    return reciters;
  } catch (error) {
    console.error('Error fetching reciters:', error);
    throw error;
  }
}

// Example 5: Get complete surah
export async function getCompleteSurah(surahNo: number) {
  try {
    // Use hybrid service to get verses
    const verses = await HybridQuranService.getVerses(surahNo);
    console.log(`Surah ${surahNo}: Found ${verses.length} verses`);
    
    if (verses.length > 0) {
      const firstVerse = verses[0];
      console.log(`Surah: ${firstVerse.surahName} (${firstVerse.surahNameArabic})`);
      console.log(`Revelation place: ${firstVerse.revelationPlace}`);
      console.log(`Total ayahs: ${firstVerse.totalAyah}`);
      
      // Display first ayah
      console.log(`First ayah: ${firstVerse.english}`);
      console.log(`Arabic: ${firstVerse.arabic1}`);
    }
    
    return verses;
  } catch (error) {
    console.error('Error fetching surah:', error);
    throw error;
  }
}

// Example usage in a React component or Next.js page:
/*
import { getAllSurahs, getAyahWithAudio, generateLessonForAyah } from './examples/api-usage';

export default function ExamplePage() {
  const [surahs, setSurahs] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);

  useEffect(() => {
    // Load surahs on component mount
    getAllSurahs().then(setSurahs);
    
    // Generate a lesson for Al-Fatiha verse 2
    generateLessonForAyah(1, 2).then(setCurrentLesson);
  }, []);

  return (
    <div>
      <h1>Quran Learning App</h1>
      <h2>Available Surahs:</h2>
      <ul>
        {surahs.map(surah => (
          <li key={surah.surahNo}>
            {surah.surahName} ({surah.surahNameArabic}) - {surah.totalAyah} ayahs
          </li>
        ))}
      </ul>
      
      {currentLesson && (
        <div>
          <h2>Current Lesson: {currentLesson.verseKey}</h2>
          <p>Questions: {currentLesson.totalQuestions}</p>
          <p>Total Strokes: {currentLesson.totalStrokes}</p>
        </div>
      )}
    </div>
  );
}
*/
