// AI-powered lesson generator for Quran memorization
import { Word, Ayah } from './quranApi';
import HybridQuranService, { HybridWord } from './hybridQuranService';

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface LessonQuestion {
  id: string;
  type: 'transliteration_to_arabic' | 'arabic_to_transliteration' | 'audio_recognition' | 'word_selection' | 'complete_verse';
  question: string;
  correctAnswer: string;
  options: QuestionOption[];
  audioUrl?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  strokesReward: number;
  celebrationMessage?: string;
  arabicText?: string;
  transliterationText?: string;
}

export interface LessonPlan {
  verseKey: string;
  totalQuestions: number;
  questions: LessonQuestion[];
  totalStrokes: number;
  celebrationMilestones: number[];
}

export class LessonGenerator {
  /**
   * Generate a complete lesson plan for an ayah
   */
  static async generateLessonPlan(ayah: Ayah, words: HybridWord[]): Promise<LessonPlan> {
    const questions: LessonQuestion[] = [];
    let questionId = 1;

    // Validate inputs
    if (!ayah || !words || words.length === 0) {
      throw new Error('Invalid ayah or words data provided for lesson generation');
    }

    // Filter out words with missing transliteration or text
    const validWords = words.filter(word => 
      word && 
      word.text && 
      word.transliteration && 
      word.transliteration.text &&
      typeof word.transliteration.text === 'string' &&
      word.transliteration.text.trim().length > 0
    );

    if (validWords.length === 0) {
      throw new Error('No valid words found for lesson generation');
    }

    // Phase 1: Individual word recognition (Easy)
    validWords.forEach((word, index) => {
      // Use QuranCloud transliteration if available, otherwise fallback to original
      const transliterationText = word.source === 'quran-cloud' && word.quranCloudTransliteration 
        ? word.quranCloudTransliteration 
        : word.transliteration.text;

      // Question: How do we read [Arabic word]?
      questions.push({
        id: `q${questionId++}`,
        type: 'arabic_to_transliteration',
        question: `How do we read ${word.text}?`,
        correctAnswer: transliterationText,
        options: this.generateTransliterationOptions(transliterationText),
        difficulty: 'easy',
        strokesReward: 1,
        arabicText: word.text,
        transliterationText: transliterationText
      });

      // Question: Choose the correct option for [Arabic word]
      questions.push({
        id: `q${questionId++}`,
        type: 'word_selection',
        question: `Choose the correct option: ${word.text}`,
        correctAnswer: transliterationText,
        options: this.generateTransliterationOptions(transliterationText),
        difficulty: 'easy',
        strokesReward: 1,
        arabicText: word.text
      });
    });

    // Celebration after first 5 questions
    if (questions.length >= 5) {
      questions[4].celebrationMessage = "Woah, five strokes unlocked! 🎉";
    }

    // Phase 2: Reverse recognition (Easy to Medium)
    validWords.forEach((word, index) => {
      if (index < 3) { // Focus on first few words
        const transliterationText = word.source === 'quran-cloud' && word.quranCloudTransliteration 
          ? word.quranCloudTransliteration 
          : word.transliteration.text;

        questions.push({
          id: `q${questionId++}`,
          type: 'transliteration_to_arabic',
          question: `Write this in Arabic: ${transliterationText}`,
          correctAnswer: word.text,
          options: this.generateArabicOptions(word.text, validWords),
          difficulty: 'medium',
          strokesReward: 1,
          transliterationText: transliterationText,
          arabicText: word.text
        });
      }
    });

    // Celebration after 10 questions
    if (questions.length >= 10) {
      questions[9].celebrationMessage = "You just unlocked 10 strokes! 🌟";
    }

    // Phase 3: Word combinations (Medium)
    if (validWords.length >= 2) {
      const firstTwoWords = validWords.slice(0, 2);
      const combinedTransliteration = firstTwoWords.map(w => {
        return w.source === 'quran-cloud' && w.quranCloudTransliteration 
          ? w.quranCloudTransliteration 
          : w.transliteration.text;
      }).join(' ');
      const combinedArabic = firstTwoWords.map(w => w.text).join(' ');

      questions.push({
        id: `q${questionId++}`,
        type: 'transliteration_to_arabic',
        question: `Write this in Arabic: ${combinedTransliteration}`,
        correctAnswer: combinedArabic,
        options: this.generateCombinedArabicOptions(combinedArabic, validWords),
        difficulty: 'medium',
        strokesReward: 2,
        transliterationText: combinedTransliteration,
        arabicText: combinedArabic
      });
    }

    // Phase 4: Audio recognition (Medium)
    validWords.forEach((word, index) => {
      if (index < 2) { // First two words
        const transliterationText = word.source === 'quran-cloud' && word.quranCloudTransliteration 
          ? word.quranCloudTransliteration 
          : word.transliteration.text;

        questions.push({
          id: `q${questionId++}`,
          type: 'audio_recognition',
          question: `Click on what you hear:`,
          correctAnswer: transliterationText,
          options: this.generateTransliterationOptions(transliterationText),
          audioUrl: word.audio_url,
          difficulty: 'medium',
          strokesReward: 2,
          arabicText: word.text
        });
      }
    });

    // Add difficulty warning
    const hardQuestionIndex = Math.floor(questions.length * 0.7);
    if (questions[hardQuestionIndex]) {
      questions[hardQuestionIndex].celebrationMessage = "Great! Attention! It's getting hard. 🔥";
    }

    // Phase 5: Full ayah recognition (Hard)
    const fullVerseTransliteration = validWords.map(w => {
      return w.source === 'quran-cloud' && w.quranCloudTransliteration 
        ? w.quranCloudTransliteration 
        : w.transliteration.text;
    }).join(' ');
    const fullVerseArabic = ayah.arabic1 || ayah.arabic2 || '';

    // Transliteration of partial verse
    if (validWords.length >= 2) {
      questions.push({
        id: `q${questionId++}`,
        type: 'arabic_to_transliteration',
        question: `Write this in transliteration: ${validWords.slice(0, 2).map(w => w.text).join(' ')}`,
        correctAnswer: validWords.slice(0, 2).map(w => {
          return w.source === 'quran-cloud' && w.quranCloudTransliteration 
            ? w.quranCloudTransliteration 
            : w.transliteration.text;
        }).join(' '),
        options: this.generateCombinedTransliterationOptions(
          validWords.slice(0, 2).map(w => {
            return w.source === 'quran-cloud' && w.quranCloudTransliteration 
              ? w.quranCloudTransliteration 
              : w.transliteration.text;
          }).join(' ')
        ),
        difficulty: 'hard',
        strokesReward: 3,
        arabicText: validWords.slice(0, 2).map(w => w.text).join(' ')
      });
    }

    // Final challenge - complete verse
    const finalIndex = questions.length;
    questions.push({
      id: `q${questionId++}`,
      type: 'transliteration_to_arabic',
      question: `Write this in Arabic: ${fullVerseTransliteration}`,
      correctAnswer: fullVerseArabic,
      options: this.generateFullVerseOptions(fullVerseArabic),
      difficulty: 'hard',
      strokesReward: 5,
      transliterationText: fullVerseTransliteration,
      arabicText: fullVerseArabic,
      celebrationMessage: "You're almost done! 💪"
    });

    questions.push({
      id: `q${questionId++}`,
      type: 'arabic_to_transliteration',
      question: `Write this in transliteration: ${fullVerseArabic}`,
      correctAnswer: fullVerseTransliteration,
      options: this.generateCombinedTransliterationOptions(fullVerseTransliteration),
      difficulty: 'hard',
      strokesReward: 5,
      arabicText: fullVerseArabic,
      celebrationMessage: "🎉 Congratulations! You've mastered this verse! 🎉"
    });

    const totalStrokes = questions.reduce((sum, q) => sum + q.strokesReward, 0);
    const celebrationMilestones = [5, 10, 15, totalStrokes];

    return {
      verseKey: `${ayah.surahNo}:${ayah.ayahNo}`,
      totalQuestions: questions.length,
      questions,
      totalStrokes,
      celebrationMilestones
    };
  }

  /**
   * Generate transliteration options (2 wrong + 1 correct)
   */
  private static generateTransliterationOptions(correct: string): QuestionOption[] {
    const variations = this.generateTransliterationVariations(correct);
    return [
      { id: 'a', text: correct, isCorrect: true },
      { id: 'b', text: variations[0], isCorrect: false },
      { id: 'c', text: variations[1], isCorrect: false }
    ].sort(() => Math.random() - 0.5); // Shuffle options
  }

  /**
   * Generate Arabic text options (2 wrong + 1 correct)
   */
  private static generateArabicOptions(correct: string, allWords: HybridWord[]): QuestionOption[] {
    const otherWords = allWords.filter(w => w.text !== correct).slice(0, 2);
    const wrongOptions = otherWords.length >= 2 
      ? otherWords.map(w => w.text)
      : [this.generateSimilarArabic(correct), this.generateSimilarArabic(correct, true)];

    return [
      { id: 'a', text: correct, isCorrect: true },
      { id: 'b', text: wrongOptions[0], isCorrect: false },
      { id: 'c', text: wrongOptions[1], isCorrect: false }
    ].sort(() => Math.random() - 0.5);
  }

  /**
   * Generate combined Arabic options for multiple words
   */
  private static generateCombinedArabicOptions(correct: string, allWords: HybridWord[]): QuestionOption[] {
    const wrong1 = this.shuffleWords(correct);
    const wrong2 = this.addTypo(correct);

    return [
      { id: 'a', text: correct, isCorrect: true },
      { id: 'b', text: wrong1, isCorrect: false },
      { id: 'c', text: wrong2, isCorrect: false }
    ].sort(() => Math.random() - 0.5);
  }

  /**
   * Generate combined transliteration options
   */
  private static generateCombinedTransliterationOptions(correct: string): QuestionOption[] {
    const words = correct.split(' ');
    const wrong1 = words.map(w => this.generateTransliterationVariations(w)[0]).join(' ');
    const wrong2 = words.map(w => this.generateTransliterationVariations(w)[1]).join(' ');

    return [
      { id: 'a', text: correct, isCorrect: true },
      { id: 'b', text: wrong1, isCorrect: false },
      { id: 'c', text: wrong2, isCorrect: false }
    ].sort(() => Math.random() - 0.5);
  }

  /**
   * Generate full verse options
   */
  private static generateFullVerseOptions(correct: string): QuestionOption[] {
    const wrong1 = this.shuffleWords(correct);
    const wrong2 = this.addTypo(correct);

    return [
      { id: 'a', text: correct, isCorrect: true },
      { id: 'b', text: wrong1, isCorrect: false },
      { id: 'c', text: wrong2, isCorrect: false }
    ].sort(() => Math.random() - 0.5);
  }

  /**
   * Generate transliteration variations for wrong options
   */
  private static generateTransliterationVariations(correct: string): string[] {
    const variations: string[] = [];
    
    // Handle null, undefined, or empty strings
    if (!correct || typeof correct !== 'string' || correct.trim().length === 0) {
      return ['Variant1', 'Variant2']; // Fallback options
    }

    const cleanCorrect = correct.trim();
    
    // Common transliteration variations
    const replacements = [
      ['i', 'e'], ['a', 'e'], ['u', 'o'],
      ['h', ''], ['ee', 'i'], ['aa', 'a'],
      ['kh', 'h'], ['gh', 'g'], ['th', 't']
    ];

    let variant1 = cleanCorrect;
    let variant2 = cleanCorrect;

    // Apply first variation
    for (const [from, to] of replacements) {
      if (variant1 && variant1.includes(from)) {
        variant1 = variant1.replace(from, to);
        break;
      }
    }

    // Apply second variation (create a copy of replacements to avoid mutating original)
    const reversedReplacements = [...replacements].reverse();
    for (const [from, to] of reversedReplacements) {
      if (variant2 && variant2.includes(from) && variant2 !== variant1) {
        variant2 = variant2.replace(from, to);
        break;
      }
    }

    // Ensure we have different variations
    if (variant1 === cleanCorrect) variant1 = cleanCorrect + 'i';
    if (variant2 === cleanCorrect || variant2 === variant1) variant2 = cleanCorrect + 'a';

    // Final safety check
    if (!variant1) variant1 = cleanCorrect + 'i';
    if (!variant2) variant2 = cleanCorrect + 'a';

    variations.push(variant1, variant2);
    return variations;
  }

  /**
   * Generate similar looking Arabic text
   */
  private static generateSimilarArabic(correct: string, addDots = false): string {
    if (addDots) {
      // Add or remove diacritics/dots
      return correct.replace(/[\u064B-\u0652]/g, '') + '\u064E'; // Add fatha
    }
    // Simple character substitutions for similar looking letters
    return correct.replace('ب', 'ت').replace('ج', 'ح').replace('د', 'ذ');
  }

  /**
   * Shuffle words in a text
   */
  private static shuffleWords(text: string): string {
    const words = text.split(' ');
    if (words.length < 2) return text;
    
    const shuffled = [...words];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled.join(' ');
  }

  /**
   * Add a typo to text
   */
  private static addTypo(text: string): string {
    if (text.length < 2) return text;
    
    const chars = text.split('');
    const randomIndex = Math.floor(Math.random() * chars.length);
    
    // Replace with a similar character
    const similarChars: { [key: string]: string } = {
      'ا': 'أ', 'ب': 'ت', 'ج': 'ح', 'د': 'ذ',
      'ر': 'ز', 'س': 'ش', 'ع': 'غ', 'ف': 'ق',
      'ك': 'گ', 'ل': 'م', 'ن': 'ه', 'و': 'ؤ'
    };
    
    const originalChar = chars[randomIndex];
    chars[randomIndex] = similarChars[originalChar] || originalChar;
    
    return chars.join('');
  }
}

export default LessonGenerator;
