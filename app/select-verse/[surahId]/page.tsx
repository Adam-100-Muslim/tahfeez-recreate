'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Play, BookOpen, Clock, Target } from 'lucide-react';
import { Surah, Verse } from '../../../types';

// Simulation des versets - en production, vous utiliseriez l'API Quran.com
const getVersesForSurah = (surahId: number): Verse[] => {
  // Données d'exemple pour quelques sourates
  const versesData: Record<number, Verse[]> = {
    1: [
      { number: 1, arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', translation: 'Au nom d\'Allah, le Tout Miséricordieux, le Très Miséricordieux', words: 4 },
      { number: 2, arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', translation: 'Louange à Allah, Seigneur de l\'univers', words: 4 },
      { number: 3, arabic: 'الرَّحْمَٰنِ الرَّحِيمِ', translation: 'Le Tout Miséricordieux, le Très Miséricordieux', words: 2 },
      { number: 4, arabic: 'مَالِكِ يَوْمِ الدِّينِ', translation: 'Maître du Jour de la rétribution', words: 3 },
      { number: 5, arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', translation: 'C\'est Toi [Seul] que nous adorons, et c\'est Toi [Seul] dont nous implorons secours', words: 4 },
      { number: 6, arabic: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ', translation: 'Guide-nous dans le droit chemin', words: 3 },
      { number: 7, arabic: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ', translation: 'le chemin de ceux que Tu as comblés de faveurs, non pas de ceux qui ont encouru Ta colère, ni des égarés', words: 11 }
    ],
    112: [
      { number: 1, arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ', translation: 'Dis: "Il est Allah, Unique"', words: 4 },
      { number: 2, arabic: 'اللَّهُ الصَّمَدُ', translation: 'Allah, Le Seul à être imploré pour ce que nous désirons', words: 2 },
      { number: 3, arabic: 'لَمْ يَلِدْ وَلَمْ يُولَدْ', translation: 'Il n\'a jamais engendré, n\'a pas été engendré non plus', words: 4 },
      { number: 4, arabic: 'وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ', translation: 'Et nul n\'est égal à Lui', words: 5 }
    ]
  };

  return versesData[surahId] || [];
};

export default function SelectVerse() {
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const router = useRouter();
  const params = useParams();
  const surahId = parseInt(params.surahId as string);

  useEffect(() => {
    const surah = localStorage.getItem('selectedSurah');
    if (surah) {
      const surahData = JSON.parse(surah);
      setSelectedSurah(surahData);
      setVerses(getVersesForSurah(surahId));
    }
  }, [surahId]);

  const handleVerseSelect = (verse: Verse) => {
    setSelectedVerse(verse.number);
  };

  const handleStartLesson = () => {
    if (selectedVerse) {
      const verse = verses.find(v => v.number === selectedVerse);
      localStorage.setItem('selectedVerse', JSON.stringify(verse));
      router.push(`/listen/${surahId}/${selectedVerse}`);
    }
  };

  const getDifficultyLevel = (wordCount: number) => {
    if (wordCount <= 3) return { level: 'Très Facile', color: 'bg-green-100 text-green-800', time: '2-3 min' };
    if (wordCount <= 5) return { level: 'Facile', color: 'bg-emerald-100 text-emerald-800', time: '3-5 min' };
    if (wordCount <= 8) return { level: 'Moyen', color: 'bg-yellow-100 text-yellow-800', time: '5-8 min' };
    return { level: 'Difficile', color: 'bg-red-100 text-red-800', time: '8-12 min' };
  };

  if (!selectedSurah) {
    return <div>Chargement...</div>;
  }

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
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{selectedSurah.name}</span>
                <span className="mx-2">•</span>
                <span>{verses.length} versets</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Title Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full mb-4">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Choisissez un verset
          </h1>
          <p className="text-gray-600">
            Sourate {selectedSurah.name} • {selectedSurah.arabicName}
          </p>
        </div>

        {/* Verses List */}
        <div className="space-y-4 mb-8">
          {verses.map((verse) => {
            const difficulty = getDifficultyLevel(verse.words);
            const isSelected = selectedVerse === verse.number;
            
            return (
              <button
                key={verse.number}
                onClick={() => handleVerseSelect(verse)}
                className={`w-full p-6 rounded-2xl text-left transition-all duration-300 transform hover:scale-[1.02] ${
                  isSelected
                    ? 'bg-emerald-500 text-white shadow-xl border-2 border-emerald-600'
                    : 'bg-white hover:shadow-lg border border-gray-200 hover:border-emerald-300'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    isSelected 
                      ? 'bg-white text-emerald-500' 
                      : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
                  }`}>
                    {verse.number}
                  </div>
                  
                  <div className="flex-1">
                    <div className="text-right mb-3">
                      <p className={`text-2xl font-arabic leading-loose ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                        {verse.arabic}
                      </p>
                    </div>
                    
                    <div className="text-left">
                      <p className={`text-base mb-3 ${isSelected ? 'text-emerald-50' : 'text-gray-600'}`}>
                        {verse.translation}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            <span className="text-sm">{verse.words} mots</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">{difficulty.time}</span>
                          </div>
                        </div>
                        
                        {!isSelected && (
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${difficulty.color}`}>
                            {difficulty.level}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Start Button */}
        {selectedVerse && (
          <div className="text-center">
            <button
              onClick={handleStartLesson}
              className="inline-flex items-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-8 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Play className="w-5 h-5" />
              Écouter et apprendre ce verset
            </button>
            
            <p className="text-sm text-gray-600 mt-3">
              Vous allez d&apos;abord écouter le verset, puis l&apos;apprendre mot par mot
            </p>
          </div>
        )}

        {verses.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📖</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Versets en cours de chargement</h3>
            <p className="text-gray-500">Veuillez patienter...</p>
          </div>
        )}
      </main>
    </div>
  );
}
