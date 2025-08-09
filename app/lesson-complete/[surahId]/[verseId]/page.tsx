'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Trophy, Star, Heart, Zap, BookOpen, ArrowRight, RotateCcw, Home } from 'lucide-react';

export default function LessonComplete() {
  const [selectedSurah, setSelectedSurah] = useState<any>(null);
  const [selectedVerse, setSelectedVerse] = useState<any>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const surahId = parseInt(params.surahId as string);
  const verseId = parseInt(params.verseId as string);
  const score = parseInt(searchParams.get('score') || '0');
  const hearts = parseInt(searchParams.get('hearts') || '3');

  useEffect(() => {
    const surah = localStorage.getItem('selectedSurah');
    const verse = localStorage.getItem('selectedVerse');
    
    if (surah && verse) {
      setSelectedSurah(JSON.parse(surah));
      setSelectedVerse(JSON.parse(verse));
    }

    // Animation de célébration
    setTimeout(() => setShowCelebration(true), 500);
  }, []);

  const getPerformanceLevel = () => {
    if (score >= 80) return { level: 'Parfait !', color: 'text-yellow-600', emoji: '🏆', stars: 3 };
    if (score >= 60) return { level: 'Très bien !', color: 'text-green-600', emoji: '⭐', stars: 2 };
    if (score >= 40) return { level: 'Bien joué !', color: 'text-blue-600', emoji: '👍', stars: 1 };
    return { level: 'Continuez !', color: 'text-gray-600', emoji: '💪', stars: 1 };
  };

  const performance = getPerformanceLevel();

  const handleRetryLesson = () => {
    router.push(`/lesson/${surahId}/${verseId}`);
  };

  const handleNextVerse = () => {
    router.push(`/select-verse/${surahId}`);
  };

  const handleBackHome = () => {
    router.push('/select-surah');
  };

  if (!selectedSurah || !selectedVerse) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      {/* Celebration Animation */}
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl animate-bounce">🎉</div>
          </div>
          <div className="absolute top-1/4 left-1/4 text-4xl animate-pulse">⭐</div>
          <div className="absolute top-1/3 right-1/4 text-4xl animate-pulse delay-300">🌟</div>
          <div className="absolute bottom-1/3 left-1/3 text-4xl animate-pulse delay-500">✨</div>
          <div className="absolute bottom-1/4 right-1/3 text-4xl animate-pulse delay-700">🎊</div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
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
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="font-medium">{selectedSurah.name}</span>
              <span>•</span>
              <span>Verset {selectedVerse.number}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Main Achievement */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-6 shadow-2xl">
            <Trophy className="w-16 h-16 text-white" />
          </div>
          
          <h1 className={`text-4xl font-bold mb-4 ${performance.color}`}>
            Leçon terminée !
          </h1>
          
          <p className="text-xl text-gray-600 mb-2">
            {performance.level}
          </p>
          
          <p className="text-gray-500">
            Vous avez appris le verset {selectedVerse.number} de la sourate {selectedSurah.name}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Score */}
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4">
              <Star className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">{score}</h3>
            <p className="text-gray-600">Points gagnés</p>
          </div>

          {/* Hearts */}
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-400 to-pink-500 rounded-full mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">{hearts}/3</h3>
            <p className="text-gray-600">Vies restantes</p>
          </div>

          {/* Stars Earned */}
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">{performance.stars}</h3>
            <p className="text-gray-600">Étoiles gagnées</p>
          </div>
        </div>

        {/* Performance Stars */}
        <div className="bg-white rounded-2xl p-8 mb-8 shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
            Votre performance
          </h3>
          
          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3].map((star) => (
              <div
                key={star}
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  star <= performance.stars
                    ? 'bg-yellow-400 text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                <Star className="w-6 h-6" fill={star <= performance.stars ? 'currentColor' : 'none'} />
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <p className="text-lg font-medium text-gray-800 mb-2">
              {performance.emoji} {performance.level}
            </p>
            <p className="text-gray-600">
              {score >= 80 && "Incroyable ! Vous maîtrisez parfaitement ce verset."}
              {score >= 60 && score < 80 && "Excellent travail ! Vous progressez très bien."}
              {score >= 40 && score < 60 && "Bon effort ! Continuez à vous entraîner."}
              {score < 40 && "Ne vous découragez pas ! La pratique rend parfait."}
            </p>
          </div>
        </div>

        {/* Verse Review */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 mb-8 text-white shadow-lg">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <BookOpen className="w-6 h-6" />
              <h3 className="text-xl font-bold">Verset appris</h3>
            </div>
            
            <div className="mb-4">
              <p className="text-3xl font-arabic leading-loose mb-3" dir="rtl">
                {selectedVerse.arabic}
              </p>
              <p className="text-lg opacity-90">
                {selectedVerse.translation}
              </p>
            </div>
            
            <p className="text-emerald-100 text-sm">
              Sourate {selectedSurah.name} - Verset {selectedVerse.number}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={handleRetryLesson}
            className="flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg border border-gray-200"
          >
            <RotateCcw className="w-5 h-5" />
            Refaire la leçon
          </button>
          
          <button
            onClick={handleNextVerse}
            className="flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Verset suivant
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <button
            onClick={handleBackHome}
            className="flex items-center justify-center gap-3 bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <Home className="w-5 h-5" />
            Nouvelle sourate
          </button>
        </div>

        {/* Encouragement Message */}
        <div className="mt-12 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <div className="text-4xl mb-3">🤲</div>
            <h3 className="font-bold text-blue-800 mb-2">Continuez votre apprentissage !</h3>
            <p className="text-blue-700">
              Chaque verset appris vous rapproche d'Allah. Qu'Allah vous bénisse dans votre parcours d'apprentissage.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
