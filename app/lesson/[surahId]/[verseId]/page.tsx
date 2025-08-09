'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Volume2, Check, X, Heart, Zap, Star, Trophy, ArrowRight } from 'lucide-react';
import { Surah, Verse, Word, Exercise } from '../../../../types';

// Types importés depuis types/index.ts

export default function Lesson() {
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [streak, setStreak] = useState(0);
  const [completedWords, setCompletedWords] = useState<Set<number>>(new Set());
  
  const router = useRouter();
  const params = useParams();
  const surahId = parseInt(params.surahId as string);
  const verseId = parseInt(params.verseId as string);

  // Données d'exemple pour Al-Fatiha verset 1
  const verseWords: Word[] = [
    { arabic: 'بِسْمِ', translation: 'Au nom de', transliteration: 'Bismi', position: 1 },
    { arabic: 'اللَّهِ', translation: 'Allah', transliteration: 'Allahi', position: 2 },
    { arabic: 'الرَّحْمَٰنِ', translation: 'Le Tout Miséricordieux', transliteration: 'Ar-Rahmani', position: 3 },
    { arabic: 'الرَّحِيمِ', translation: 'Le Très Miséricordieux', transliteration: 'Ar-Raheem', position: 4 }
  ];

  const generateExercises = useCallback(() => {
    const newExercises: Exercise[] = [];

    // Exercice 1: Reconnaissance des mots
    verseWords.forEach((word, index) => {
      newExercises.push({
        type: 'word-match',
        question: `Que signifie "${word.arabic}" ?`,
        options: [
          word.translation,
          verseWords[(index + 1) % verseWords.length].translation,
          verseWords[(index + 2) % verseWords.length].translation,
          'Aucune de ces réponses'
        ].sort(() => Math.random() - 0.5),
        correctAnswer: word.translation,
        word: word,
        explanation: `"${word.arabic}" (${word.transliteration}) signifie "${word.translation}"`
      });
    });

    // Exercice 2: Sélection de traduction
    newExercises.push({
      type: 'translation-select',
      question: 'Choisissez la bonne traduction du verset complet :',
      options: [
        'Au nom d\'Allah, le Tout Miséricordieux, le Très Miséricordieux',
        'Louange à Allah, Seigneur de l\'univers',
        'Guide-nous dans le droit chemin',
        'C\'est Toi que nous adorons'
      ],
      correctAnswer: 'Au nom d\'Allah, le Tout Miséricordieux, le Très Miséricordieux',
      explanation: 'Cette phrase est l\'ouverture de presque toutes les sourates du Coran'
    });

    // Exercice 3: Compléter le verset
    newExercises.push({
      type: 'complete-verse',
      question: 'Complétez le verset : بِسْمِ اللَّهِ _____ الرَّحِيمِ',
      options: ['الرَّحْمَٰنِ', 'الْحَمْدُ', 'رَبِّ', 'مَالِكِ'],
      correctAnswer: 'الرَّحْمَٰنِ',
      explanation: 'الرَّحْمَٰنِ (Ar-Rahman) signifie "Le Tout Miséricordieux"'
    });

    setExercises(newExercises);
  }, []);

  useEffect(() => {
    const surah = localStorage.getItem('selectedSurah');
    const verse = localStorage.getItem('selectedVerse');
    
    if (surah && verse) {
      setSelectedSurah(JSON.parse(surah));
      setSelectedVerse(JSON.parse(verse));
      generateExercises();
    }
  }, [generateExercises]);

  const generateExercises = () => {
    const newExercises: Exercise[] = [];

    // Exercice 1: Reconnaissance des mots
    verseWords.forEach((word, index) => {
      newExercises.push({
        type: 'word-match',
        question: `Que signifie "${word.arabic}" ?`,
        options: [
          word.translation,
          verseWords[(index + 1) % verseWords.length].translation,
          verseWords[(index + 2) % verseWords.length].translation,
          'Aucune de ces réponses'
        ].sort(() => Math.random() - 0.5),
        correctAnswer: word.translation,
        word: word,
        explanation: `"${word.arabic}" (${word.transliteration}) signifie "${word.translation}"`
      });
    });

    // Exercice 2: Sélection de traduction
    newExercises.push({
      type: 'translation-select',
      question: 'Choisissez la bonne traduction du verset complet :',
      options: [
        'Au nom d\'Allah, le Tout Miséricordieux, le Très Miséricordieux',
        'Louange à Allah, Seigneur de l\'univers',
        'Guide-nous dans le droit chemin',
        'C\'est Toi que nous adorons'
      ],
      correctAnswer: 'Au nom d\'Allah, le Tout Miséricordieux, le Très Miséricordieux',
      explanation: 'Cette phrase est l\'ouverture de presque toutes les sourates du Coran'
    });

    // Exercice 3: Compléter le verset
    newExercises.push({
      type: 'complete-verse',
      question: 'Complétez le verset : بِسْمِ اللَّهِ _____ الرَّحِيمِ',
      options: ['الرَّحْمَٰنِ', 'الْحَمْدُ', 'رَبِّ', 'مَالِكِ'],
      correctAnswer: 'الرَّحْمَٰنِ',
      explanation: 'الرَّحْمَٰنِ (Ar-Rahman) signifie "Le Tout Miséricordieux"'
    });

    setExercises(newExercises);
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const checkAnswer = () => {
    const exercise = exercises[currentExercise];
    const correct = selectedAnswer === exercise.correctAnswer;
    
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      setScore(score + 10);
      setStreak(streak + 1);
      if (exercise.word) {
        setCompletedWords(prev => new Set(prev).add(exercise.word!.position));
      }
    } else {
      setHearts(Math.max(0, hearts - 1));
      setStreak(0);
    }
  };

  const nextExercise = () => {
    if (currentExercise < exercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
      setSelectedAnswer('');
      setShowResult(false);
    } else {
      // Leçon terminée
      router.push(`/lesson-complete/${surahId}/${verseId}?score=${score}&hearts=${hearts}`);
    }
  };

  const playWordAudio = (word: string) => {
    // Simulation de la lecture audio du mot
    console.log(`Playing audio for: ${word}`);
  };

  if (!selectedSurah || !selectedVerse || exercises.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Préparation de votre leçon...</p>
        </div>
      </div>
    );
  }

  const currentEx = exercises[currentExercise];
  const progress = ((currentExercise + 1) / exercises.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-3">
                <Image
                  src="/tahfeez-logo.png"
                  alt="Tahfeez Logo"
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-lg"
                />
                <span className="text-xl font-bold text-gray-800">tahfeez</span>
              </div>
            </div>
            
            {/* Progress and Stats */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                <span className="font-bold text-red-500">{hearts}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-500" />
                <span className="font-bold text-orange-500">{streak}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="font-bold text-yellow-500">{score}</span>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Exercice {currentExercise + 1} sur {exercises.length}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {!showResult ? (
          <>
            {/* Question */}
            <div className="text-center mb-8">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-4">
                {currentEx.question}
              </h1>
              
              {currentEx.word && (
                <div className="bg-white rounded-2xl p-6 mb-6 shadow-md">
                  <div className="text-center">
                    <button
                      onClick={() => playWordAudio(currentEx.word!.arabic)}
                      className="inline-flex items-center gap-3 mb-4 p-3 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
                    >
                      <Volume2 className="w-5 h-5 text-emerald-600" />
                      <span className="text-3xl font-arabic text-gray-800">
                        {currentEx.word.arabic}
                      </span>
                    </button>
                    <p className="text-gray-600 italic">
                      {currentEx.word.transliteration}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {currentEx.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  className={`p-6 rounded-2xl border-2 text-left transition-all duration-300 transform hover:scale-105 ${
                    selectedAnswer === option
                      ? 'border-emerald-500 bg-emerald-50 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-emerald-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                      selectedAnswer === option
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-gray-300'
                    }`}>
                      {selectedAnswer === option && <Check className="w-4 h-4" />}
                    </div>
                    <span className="font-medium text-gray-800">{option}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Check Answer Button */}
            <div className="text-center">
              <button
                onClick={checkAnswer}
                disabled={!selectedAnswer}
                className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform ${
                  selectedAnswer
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white hover:scale-105 shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Vérifier
              </button>
            </div>
          </>
        ) : (
          /* Result Screen */
          <div className="text-center">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
              isCorrect ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {isCorrect ? (
                <Check className="w-12 h-12 text-green-500" />
              ) : (
                <X className="w-12 h-12 text-red-500" />
              )}
            </div>
            
            <h2 className={`text-3xl font-bold mb-4 ${
              isCorrect ? 'text-green-600' : 'text-red-600'
            }`}>
              {isCorrect ? 'Excellent !' : 'Pas tout à fait...'}
            </h2>
            
            <div className="bg-white rounded-2xl p-6 mb-6 shadow-md">
              <p className="text-gray-600 mb-2">La bonne réponse était :</p>
              <p className="text-xl font-bold text-gray-800 mb-4">
                {currentEx.correctAnswer}
              </p>
              {currentEx.explanation && (
                <p className="text-gray-600 italic">
                  {currentEx.explanation}
                </p>
              )}
            </div>

            <button
              onClick={nextExercise}
              className="inline-flex items-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-8 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              {currentExercise < exercises.length - 1 ? 'Continuer' : 'Terminer la leçon'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Word Progress */}
        <div className="mt-12 bg-white rounded-2xl p-6 shadow-md">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Progression des mots
          </h3>
          <div className="flex flex-wrap gap-3">
            {verseWords.map((word) => (
              <div
                key={word.position}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  completedWords.has(word.position)
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {word.arabic}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
