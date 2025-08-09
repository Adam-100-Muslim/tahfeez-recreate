import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';

// Types pour la navigation
type Screen = 'home' | 'get-started' | 'select-surah' | 'select-verse' | 'listen' | 'lesson' | 'lesson-complete';

// This is the main entry point for the Expo/React Native version
// Recreating your Next.js homepage for mobile with navigation

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedOption, setSelectedOption] = useState<string>('');

  // Questions pour l'écran Get Started
  const questions = [
    {
      id: 1,
      question: "Quel est votre niveau actuel avec le Coran ?",
      options: [
        { id: 'beginner', text: 'Débutant complet', icon: '🌱', description: 'Je commence tout juste' },
        { id: 'basic', text: 'Niveau de base', icon: '📚', description: 'Je connais quelques versets' },
        { id: 'intermediate', text: 'Intermédiaire', icon: '⭐', description: 'Je connais plusieurs sourates' },
        { id: 'advanced', text: 'Avancé', icon: '🏆', description: 'Je maîtrise bien le Coran' }
      ]
    },
    {
      id: 2,
      question: "Combien de temps voulez-vous consacrer par jour ?",
      options: [
        { id: '5min', text: '5 minutes', icon: '⚡', description: 'Apprentissage rapide' },
        { id: '10min', text: '10 minutes', icon: '🎯', description: 'Progression régulière' },
        { id: '15min', text: '15 minutes', icon: '💪', description: 'Apprentissage intensif' },
        { id: '20min', text: '20+ minutes', icon: '🔥', description: 'Immersion complète' }
      ]
    },
    {
      id: 3,
      question: "Quel est votre objectif principal ?",
      options: [
        { id: 'memorization', text: 'Mémorisation', icon: '🧠', description: 'Apprendre par cœur' },
        { id: 'understanding', text: 'Compréhension', icon: '💡', description: 'Comprendre le sens' },
        { id: 'recitation', text: 'Récitation', icon: '🎵', description: 'Améliorer ma récitation' },
        { id: 'all', text: 'Tout ensemble', icon: '🌟', description: 'Objectif complet' }
      ]
    }
  ];

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
          <Text style={styles.languageText}>LANGUE DU SITE : FRANÇAIS</Text>
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
            La méthode gratuite, fun et efficace pour apprendre le{' '}
            <Text style={styles.coranText}>Coran</Text> !
          </Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.primaryButton} onPress={handleGetStarted}>
              <Text style={styles.primaryButtonText}>C'EST PARTI !</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>J'AI DÉJÀ UN COMPTE</Text>
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
            Question {currentQuestion + 1} sur {questions.length}
          </Text>
        </View>

        {/* Question */}
        <View style={styles.questionContainer}>
          <View style={styles.questionIcon}>
            <Text style={styles.questionIconText}>📚</Text>
          </View>
          <Text style={styles.questionTitle}>{currentQ.question}</Text>
          <Text style={styles.questionSubtitle}>
            Aidez-nous à personnaliser votre expérience d'apprentissage
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
              {currentQuestion < questions.length - 1 ? 'Continuer' : 'Commencer l\'apprentissage'}
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
          <Text style={styles.backButtonText}>← Retour</Text>
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
        <Text style={styles.surahTitle}>Choisissez une Sourate</Text>
        <Text style={styles.surahSubtitle}>Commencez votre apprentissage du Coran</Text>
        
        {/* Al-Fatiha comme exemple */}
        <TouchableOpacity style={styles.surahCard}>
          <View style={styles.surahCardContent}>
            <View style={styles.surahNumber}>
              <Text style={styles.surahNumberText}>1</Text>
            </View>
            <View style={styles.surahInfo}>
              <Text style={styles.surahName}>Al-Fatiha</Text>
              <Text style={styles.surahTranslation}>L'Ouverture</Text>
              <Text style={styles.surahDetails}>7 versets • Mecquoise</Text>
            </View>
            <View style={styles.surahDifficulty}>
              <Text style={styles.difficultyBadge}>Très Facile</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.comingSoon}>
          <Text style={styles.comingSoonText}>Plus de sourates bientôt disponibles ! 🌟</Text>
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
});

export default App;
