import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert } from 'react-native';
import QuranApiService, { Chapter, Verse, Word } from './services/quranApi';
import LessonGenerator, { LessonPlan, LessonQuestion } from './services/lessonGenerator';

// Types pour la navigation
type Screen = 'home' | 'get-started' | 'select-surah' | 'select-verse' | 'listen' | 'lesson' | 'lesson-complete';

// This is the main entry point for the Expo/React Native version
// Recreating your Next.js homepage for mobile with navigation

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedOption, setSelectedOption] = useState<string>('');
  
  // Quran API data
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);
  const [selectedVerseWords, setSelectedVerseWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Lesson data
  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);
  const [currentLessonQuestion, setCurrentLessonQuestion] = useState(0);
  const [lessonAnswers, setLessonAnswers] = useState<Record<string, string>>({});
  const [score, setScore] = useState(0);
  const [totalStrokes, setTotalStrokes] = useState(0);

  // Questions for the Get Started screen
  const questions = [
    {
      id: 1,
      question: "What is your current level with the Quran?",
      options: [
        { id: 'beginner', text: 'Complete beginner', icon: '🌱', description: 'I\'m just starting out' },
        { id: 'basic', text: 'Basic level', icon: '📚', description: 'I know a few verses' },
        { id: 'intermediate', text: 'Intermediate', icon: '⭐', description: 'I know several surahs' },
        { id: 'advanced', text: 'Advanced', icon: '🏆', description: 'I have good mastery of the Quran' }
      ]
    },
    {
      id: 2,
      question: "How much time do you want to dedicate per day?",
      options: [
        { id: '5min', text: '5 minutes', icon: '⚡', description: 'Quick learning' },
        { id: '10min', text: '10 minutes', icon: '🎯', description: 'Regular progress' },
        { id: '15min', text: '15 minutes', icon: '💪', description: 'Intensive learning' },
        { id: '20min', text: '20+ minutes', icon: '🔥', description: 'Complete immersion' }
      ]
    },
    {
      id: 3,
      question: "What is your main goal?",
      options: [
        { id: 'memorization', text: 'Memorization', icon: '🧠', description: 'Learn by heart' },
        { id: 'understanding', text: 'Understanding', icon: '💡', description: 'Understand the meaning' },
        { id: 'recitation', text: 'Recitation', icon: '🎵', description: 'Improve my recitation' },
        { id: 'all', text: 'All together', icon: '🌟', description: 'Complete objective' }
      ]
    }
  ];

  // Load chapters on app start
  useEffect(() => {
    loadChapters();
  }, []);

  // API functions
  const loadChapters = async () => {
    setLoading(true);
    try {
      const chaptersData = await QuranApiService.getChapters();
      setChapters(chaptersData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load Quran chapters. Please check your internet connection.');
      console.error('Error loading chapters:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadVerses = async (chapterId: number) => {
    setLoading(true);
    try {
      const versesData = await QuranApiService.getVersesByChapter(chapterId, {
        translations: '20', // English translation
        words: true,
        transliteration: true,
        perPage: 50 // Get more verses per request
      });
      setVerses(versesData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load verses. Please try again.');
      console.error('Error loading verses:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadVerseWords = async (chapterId: number, verseNumber: number) => {
    setLoading(true);
    try {
      const words = await QuranApiService.getWordByWordBreakdown(chapterId, verseNumber);
      setSelectedVerseWords(words);
    } catch (error) {
      Alert.alert('Error', 'Failed to load verse details. Please try again.');
      console.error('Error loading verse words:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateLesson = (verse: Verse, words: Word[]) => {
    try {
      // Additional validation before generating lesson
      if (!verse) {
        throw new Error('No verse selected');
      }
      
      if (!words || words.length === 0) {
        throw new Error('No word data available for this verse');
      }

      // Check if we have transliteration data
      const wordsWithTransliteration = words.filter(w => 
        w && w.transliteration && w.transliteration.text
      );

      if (wordsWithTransliteration.length === 0) {
        throw new Error('No transliteration data available for this verse');
      }

      console.log(`Generating lesson for verse ${verse.verse_key} with ${wordsWithTransliteration.length} valid words`);
      
      const plan = LessonGenerator.generateLessonPlan(verse, words);
      setLessonPlan(plan);
      setCurrentLessonQuestion(0);
      setLessonAnswers({});
      setScore(0);
      setTotalStrokes(0);
      
      console.log(`Lesson generated successfully with ${plan.totalQuestions} questions`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert('Error', `Failed to generate lesson: ${errorMessage}. Please try a different verse.`);
      console.error('Error generating lesson:', error);
    }
  };

  // Navigation functions
  const navigateTo = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const handleGetStarted = () => {
    navigateTo('get-started');
  };

  const handleAnswer = (optionId: string) => {
    setSelectedOption(optionId);
  };

  const handleNext = () => {
    if (!selectedOption) return;

    const newAnswers = {
      ...answers,
      [questions[currentQuestion].id]: selectedOption
    };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption('');
    } else {
      // Terminer le questionnaire et aller à la sélection des sourates
      navigateTo('select-surah');
      // Reset pour la prochaine fois
      setCurrentQuestion(0);
      setSelectedOption('');
    }
  };

  // Render different screens based on currentScreen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return renderHomeScreen();
      case 'get-started':
        return renderGetStartedScreen();
      case 'select-surah':
        return renderSelectSurahScreen();
      case 'select-verse':
        return renderSelectVerseScreen();
      case 'listen':
        return renderListenScreen();
      case 'lesson':
        return renderLessonScreen();
      case 'lesson-complete':
        return renderLessonCompleteScreen();
      default:
        return renderHomeScreen();
    }
  };

  const renderHomeScreen = () => (
    <ScrollView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require('./public/tahfeez-logo.png')}
            style={styles.logoSmall}
          />
          <Text style={styles.logoText}>tahfeez</Text>
        </View>
        
        <TouchableOpacity style={styles.languageButton}>
          <Text style={styles.languageText}>SITE LANGUAGE: ENGLISH</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.main}>
        {/* Logo Section */}
        <View style={styles.illustrationSection}>
          <Image
            source={require('./public/tahfeez-logo.png')}
            style={styles.logoLarge}
          />
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          <Text style={styles.title}>
            The free, fun and effective way to learn the{' '}
            <Text style={styles.coranText}>Quran</Text>!
          </Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.primaryButton} onPress={handleGetStarted}>
              <Text style={styles.primaryButtonText}>GET STARTED!</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>I ALREADY HAVE AN ACCOUNT</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderGetStartedScreen = () => {
    const currentQ = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    return (
      <ScrollView style={[styles.container, { backgroundColor: '#f0fdf4' }]}>
        <StatusBar style="dark" />
        
        {/* Header avec progress */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require('./public/tahfeez-logo.png')}
              style={styles.logoSmall}
            />
            <Text style={styles.logoText}>tahfeez</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            Question {currentQuestion + 1} of {questions.length}
          </Text>
        </View>

        {/* Question */}
        <View style={styles.questionContainer}>
          <View style={styles.questionIcon}>
            <Text style={styles.questionIconText}>📚</Text>
          </View>
          <Text style={styles.questionTitle}>{currentQ.question}</Text>
          <Text style={styles.questionSubtitle}>
            Help us personalize your learning experience
          </Text>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {currentQ.options.map((option) => (
            <TouchableOpacity
              key={option.id}
              onPress={() => handleAnswer(option.id)}
              style={[
                styles.optionButton,
                selectedOption === option.id && styles.optionButtonSelected
              ]}
            >
              <Text style={styles.optionIcon}>{option.icon}</Text>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{option.text}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Next Button */}
        <View style={styles.nextButtonContainer}>
          <TouchableOpacity
            onPress={handleNext}
            disabled={!selectedOption}
            style={[
              styles.nextButton,
              !selectedOption && styles.nextButtonDisabled
            ]}
          >
            <Text style={[
              styles.nextButtonText,
              !selectedOption && styles.nextButtonTextDisabled
            ]}>
              {currentQuestion < questions.length - 1 ? 'Continue' : 'Start Learning'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  const renderSelectSurahScreen = () => (
    <ScrollView style={[styles.container, { backgroundColor: '#f0fdf4' }]}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigateTo('home')} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Image
            source={require('./public/tahfeez-logo.png')}
            style={styles.logoSmall}
          />
          <Text style={styles.logoText}>tahfeez</Text>
        </View>
      </View>

      <View style={styles.surahContainer}>
        <Text style={styles.surahTitle}>Choose a Surah</Text>
        <Text style={styles.surahSubtitle}>Begin your Quran learning journey</Text>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10b981" />
            <Text style={styles.loadingText}>Loading Quran chapters...</Text>
          </View>
        ) : (
          chapters.map((chapter) => (
            <TouchableOpacity 
              key={chapter.id}
              style={styles.surahCard}
              onPress={() => handleChapterSelect(chapter)}
            >
              <View style={styles.surahCardContent}>
                <View style={styles.surahNumber}>
                  <Text style={styles.surahNumberText}>{chapter.id}</Text>
                </View>
                <View style={styles.surahInfo}>
                  <Text style={styles.surahName}>{chapter.name_simple}</Text>
                  <Text style={styles.surahTranslation}>{chapter.translated_name.name}</Text>
                  <Text style={styles.surahDetails}>
                    {chapter.verses_count} verses • {chapter.revelation_place}
                  </Text>
                </View>
                <View style={styles.surahDifficulty}>
                  <Text style={[styles.difficultyBadge, {
                    backgroundColor: chapter.verses_count <= 10 ? '#dcfce7' : 
                                   chapter.verses_count <= 50 ? '#fef3c7' : '#fecaca',
                    color: chapter.verses_count <= 10 ? '#166534' : 
                           chapter.verses_count <= 50 ? '#92400e' : '#991b1b'
                  }]}>
                    {chapter.verses_count <= 10 ? 'Very Easy' : 
                     chapter.verses_count <= 50 ? 'Medium' : 'Hard'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );

  const handleChapterSelect = async (chapter: Chapter) => {
    setSelectedChapter(chapter);
    await loadVerses(chapter.id);
    navigateTo('select-verse');
  };

  const renderSelectVerseScreen = () => (
    <ScrollView style={[styles.container, { backgroundColor: '#f0fdf4' }]}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigateTo('select-surah')} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Image
            source={require('./public/tahfeez-logo.png')}
            style={styles.logoSmall}
          />
          <Text style={styles.logoText}>tahfeez</Text>
        </View>
      </View>

      <View style={styles.surahContainer}>
        <Text style={styles.surahTitle}>
          {selectedChapter?.name_simple || 'Select Verse'}
        </Text>
        <Text style={styles.surahSubtitle}>Choose a verse to memorize</Text>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10b981" />
            <Text style={styles.loadingText}>Loading verses...</Text>
          </View>
        ) : (
          verses.map((verse) => (
            <TouchableOpacity 
              key={verse.id}
              style={styles.verseCard}
              onPress={() => handleVerseSelect(verse)}
            >
              <View style={styles.verseCardContent}>
                <View style={styles.verseNumber}>
                  <Text style={styles.verseNumberText}>{verse.verse_number}</Text>
                </View>
                <View style={styles.verseInfo}>
                  <Text style={styles.verseArabic}>{verse.text_uthmani_simple}</Text>
                  {verse.translations && verse.translations[0] && (
                    <Text style={styles.verseTranslation}>{verse.translations[0].text}</Text>
                  )}
                  <Text style={styles.verseDetails}>
                    {verse.words?.length || 0} words • Verse {verse.verse_number}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );

  const handleVerseSelect = async (verse: Verse) => {
    setSelectedVerse(verse);
    if (selectedChapter) {
      await loadVerseWords(selectedChapter.id, verse.verse_number);
      navigateTo('listen');
    }
  };

  const renderListenScreen = () => (
    <ScrollView style={[styles.container, { backgroundColor: '#f0fdf4' }]}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigateTo('select-verse')} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Image
            source={require('./public/tahfeez-logo.png')}
            style={styles.logoSmall}
          />
          <Text style={styles.logoText}>tahfeez</Text>
        </View>
      </View>

      <View style={styles.listenContainer}>
        <Text style={styles.listenTitle}>Listen & Learn</Text>
        <Text style={styles.listenSubtitle}>
          Listen carefully to the recitation by Mishary al-Afasy
        </Text>
        
        {selectedVerse && (
          <View style={styles.verseDisplayCard}>
            <Text style={styles.verseDisplayArabic}>{selectedVerse.text_uthmani_simple}</Text>
            {selectedVerse.translations && selectedVerse.translations[0] && (
              <Text style={styles.verseDisplayTranslation}>
                {selectedVerse.translations[0].text}
              </Text>
            )}
            
            <View style={styles.audioControls}>
              <TouchableOpacity style={styles.playButton}>
                <Text style={styles.playButtonText}>▶ Play Recitation</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <TouchableOpacity 
          style={styles.startLessonButton}
          onPress={handleStartLesson}
        >
          <Text style={styles.startLessonButtonText}>Start Interactive Lesson</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const handleStartLesson = () => {
    if (selectedVerse && selectedVerseWords.length > 0) {
      generateLesson(selectedVerse, selectedVerseWords);
      navigateTo('lesson');
    } else {
      Alert.alert('Error', 'Please wait for the verse to load completely.');
    }
  };

  const renderLessonScreen = () => {
    if (!lessonPlan || !lessonPlan.questions[currentLessonQuestion]) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.loadingText}>Generating lesson...</Text>
        </View>
      );
    }

    const currentQ = lessonPlan.questions[currentLessonQuestion];
    const progress = ((currentLessonQuestion + 1) / lessonPlan.totalQuestions) * 100;

    return (
      <ScrollView style={[styles.container, { backgroundColor: '#f0fdf4' }]}>
        <StatusBar style="dark" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigateTo('listen')} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <Image
              source={require('./public/tahfeez-logo.png')}
              style={styles.logoSmall}
            />
            <Text style={styles.logoText}>tahfeez</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            Question {currentLessonQuestion + 1} of {lessonPlan.totalQuestions}
          </Text>
          <Text style={styles.strokesText}>Strokes: {totalStrokes}</Text>
        </View>

        {/* Question */}
        <View style={styles.questionContainer}>
          <View style={styles.questionIcon}>
            <Text style={styles.questionIconText}>🕌</Text>
          </View>
          <Text style={styles.questionTitle}>{currentQ.question}</Text>
          
          {currentQ.celebrationMessage && (
            <View style={styles.celebrationContainer}>
              <Text style={styles.celebrationText}>{currentQ.celebrationMessage}</Text>
            </View>
          )}
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {currentQ.options.map((option) => (
            <TouchableOpacity
              key={option.id}
              onPress={() => handleLessonAnswer(option.id)}
              style={[
                styles.optionButton,
                selectedOption === option.id && styles.optionButtonSelected
              ]}
            >
              <Text style={styles.optionText}>{option.text}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Next Button */}
        <View style={styles.nextButtonContainer}>
          <TouchableOpacity
            onPress={handleLessonNext}
            disabled={!selectedOption}
            style={[
              styles.nextButton,
              !selectedOption && styles.nextButtonDisabled
            ]}
          >
            <Text style={[
              styles.nextButtonText,
              !selectedOption && styles.nextButtonTextDisabled
            ]}>
              {currentLessonQuestion < lessonPlan.totalQuestions - 1 ? 'Continue' : 'Complete Lesson'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  const handleLessonAnswer = (optionId: string) => {
    setSelectedOption(optionId);
  };

  const handleLessonNext = () => {
    if (!selectedOption || !lessonPlan) return;

    const currentQ = lessonPlan.questions[currentLessonQuestion];
    const selectedOptionData = currentQ.options.find(opt => opt.id === selectedOption);
    const isCorrect = selectedOptionData?.isCorrect || false;

    if (isCorrect) {
      setScore(score + 1);
      setTotalStrokes(totalStrokes + currentQ.strokesReward);
    }

    const newAnswers = {
      ...lessonAnswers,
      [currentQ.id]: selectedOption
    };
    setLessonAnswers(newAnswers);

    if (currentLessonQuestion < lessonPlan.totalQuestions - 1) {
      setCurrentLessonQuestion(currentLessonQuestion + 1);
      setSelectedOption('');
    } else {
      // Lesson complete
      navigateTo('lesson-complete');
    }
  };

  const renderLessonCompleteScreen = () => (
    <ScrollView style={[styles.container, { backgroundColor: '#f0fdf4' }]}>
      <StatusBar style="dark" />
      
      <View style={styles.completeContainer}>
        <View style={styles.completeIcon}>
          <Text style={styles.completeIconText}>🎉</Text>
        </View>
        
        <Text style={styles.completeTitle}>Lesson Complete!</Text>
        <Text style={styles.completeSubtitle}>
          Congratulations! You've completed the lesson for this verse.
        </Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{score}</Text>
            <Text style={styles.statLabel}>Correct Answers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalStrokes}</Text>
            <Text style={styles.statLabel}>Strokes Earned</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {lessonPlan ? Math.round((score / lessonPlan.totalQuestions) * 100) : 0}%
            </Text>
            <Text style={styles.statLabel}>Accuracy</Text>
          </View>
        </View>

        <View style={styles.completeActions}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => navigateTo('select-verse')}
          >
            <Text style={styles.primaryButtonText}>Try Another Verse</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => navigateTo('select-surah')}
          >
            <Text style={styles.secondaryButtonText}>Choose Different Surah</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  return renderScreen();
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingTop: 60, // Pour le status bar
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoSmall: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  languageButton: {
    padding: 8,
  },
  languageText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  main: {
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  illustrationSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoLarge: {
    width: 120,
    height: 120,
  },
  contentSection: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 40,
  },
  coranText: {
    color: '#10b981',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 320,
  },
  primaryButton: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: '#10b981',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 16,
  },
  secondaryButtonText: {
    color: '#10b981',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  // Styles pour Get Started
  progressContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  progressBar: {
    width: '100%',
    height: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
  },
  progressFill: {
    height: 12,
    backgroundColor: '#10b981',
    borderRadius: 6,
  },
  progressText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    color: '#6b7280',
  },
  questionContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  questionIcon: {
    width: 80,
    height: 80,
    backgroundColor: '#10b981',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  questionIconText: {
    fontSize: 40,
  },
  questionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 36,
  },
  questionSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  optionsContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  optionButtonSelected: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  optionIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 16,
    color: '#6b7280',
  },
  nextButtonContainer: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  nextButton: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    minWidth: 200,
  },
  nextButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  nextButtonTextDisabled: {
    color: '#9ca3af',
  },
  // Styles pour Select Surah
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#10b981',
    fontWeight: '600',
  },
  surahContainer: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  surahTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  surahSubtitle: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  surahCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  surahCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  surahNumber: {
    width: 50,
    height: 50,
    backgroundColor: '#10b981',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  surahNumberText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  surahInfo: {
    flex: 1,
  },
  surahName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  surahTranslation: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 2,
  },
  surahDetails: {
    fontSize: 14,
    color: '#9ca3af',
  },
  surahDifficulty: {
    alignItems: 'flex-end',
  },
  difficultyBadge: {
    backgroundColor: '#dcfce7',
    color: '#166534',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
  },
  comingSoon: {
    alignItems: 'center',
    marginTop: 32,
    padding: 24,
    backgroundColor: '#f9fafb',
    borderRadius: 16,
  },
  comingSoonText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  // Loading styles
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
    textAlign: 'center',
  },
  // Verse selection styles
  verseCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  verseCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  verseNumber: {
    width: 40,
    height: 40,
    backgroundColor: '#10b981',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    marginTop: 4,
  },
  verseNumberText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  verseInfo: {
    flex: 1,
  },
  verseArabic: {
    fontSize: 18,
    color: '#1f2937',
    textAlign: 'right',
    marginBottom: 8,
    lineHeight: 28,
    fontFamily: 'System', // Use system Arabic font
  },
  verseTranslation: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 4,
    lineHeight: 20,
  },
  verseDetails: {
    fontSize: 12,
    color: '#9ca3af',
  },
  // Listen screen styles
  listenContainer: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  listenTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  listenSubtitle: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  verseDisplayCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  verseDisplayArabic: {
    fontSize: 24,
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 36,
    fontFamily: 'System',
  },
  verseDisplayTranslation: {
    fontSize: 16,
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  audioControls: {
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  playButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  startLessonButton: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  startLessonButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Lesson screen styles
  strokesText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
    marginTop: 4,
  },
  celebrationContainer: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  celebrationText: {
    fontSize: 16,
    color: '#92400e',
    textAlign: 'center',
    fontWeight: '600',
  },
  optionText: {
    fontSize: 18,
    color: '#1f2937',
    textAlign: 'center',
    fontWeight: '500',
  },
  // Lesson complete styles
  completeContainer: {
    paddingHorizontal: 24,
    paddingVertical: 40,
    alignItems: 'center',
  },
  completeIcon: {
    width: 100,
    height: 100,
    backgroundColor: '#10b981',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  completeIconText: {
    fontSize: 50,
  },
  completeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  completeSubtitle: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 26,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 32,
  },
  statItem: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  completeActions: {
    width: '100%',
  },
});

export default App;
