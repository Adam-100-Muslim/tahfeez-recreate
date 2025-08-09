'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Play, Pause, RotateCcw, Volume2, BookOpen, ArrowRight } from 'lucide-react';
import { Surah, Verse } from '../../../../types';

export default function ListenVerse() {
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasListened, setHasListened] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const router = useRouter();
  const params = useParams();
  const surahId = parseInt(params.surahId as string);
  const verseId = parseInt(params.verseId as string);

  useEffect(() => {
    const surah = localStorage.getItem('selectedSurah');
    const verse = localStorage.getItem('selectedVerse');
    
    if (surah && verse) {
      setSelectedSurah(JSON.parse(surah));
      setSelectedVerse(JSON.parse(verse));
    }
    
    // Simuler le chargement de l'audio
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      setHasListened(true);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
      setHasListened(true);
    }
    setIsPlaying(!isPlaying);
  };

  const restartAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = 0;
    if (isPlaying) {
      audio.play();
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleStartLesson = () => {
    router.push(`/lesson/${surahId}/${verseId}`);
  };

  if (!selectedSurah || !selectedVerse) {
    return <div>Chargement...</div>;
  }

  // URL de l'API Quran.com pour l'audio (exemple avec le récitateur Mishary Rashid Alafasy)
  const audioUrl = `https://cdn.islamic.network/quran/audio-surah/128/ar.misharyalafasy/${surahId}.mp3`;

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
                <span>Verset {selectedVerse.number}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Title Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full mb-6">
            <Volume2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Écoutez attentivement
          </h1>
          <p className="text-gray-600">
            Familiarisez-vous avec la récitation avant de commencer l&apos;apprentissage
          </p>
        </div>

        {/* Verse Display */}
        <div className="bg-white rounded-3xl p-8 mb-8 shadow-lg border border-gray-100">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 text-emerald-600 font-medium mb-4">
              <BookOpen className="w-5 h-5" />
              <span>Sourate {selectedSurah.name} - Verset {selectedVerse.number}</span>
            </div>
            
            <div className="mb-6">
              <p className="text-4xl font-arabic leading-loose text-gray-800 mb-4" dir="rtl">
                {selectedVerse.arabic}
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                {selectedVerse.translation}
              </p>
            </div>
          </div>

          {/* Audio Player */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6">
            <audio ref={audioRef} preload="metadata">
              <source src={audioUrl} type="audio/mpeg" />
              Votre navigateur ne supporte pas l&apos;élément audio.
            </audio>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-4"></div>
                <p className="text-gray-600">Chargement de l&apos;audio...</p>
              </div>
            ) : (
              <>
                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
                    ></div>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-6">
                  <button
                    onClick={restartAudio}
                    className="p-3 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <RotateCcw className="w-6 h-6 text-gray-600" />
                  </button>
                  
                  <button
                    onClick={togglePlayPause}
                    className="p-6 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8 text-white" />
                    ) : (
                      <Play className="w-8 h-8 text-white ml-1" />
                    )}
                  </button>
                  
                  <button
                    className="p-3 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <Volume2 className="w-6 h-6 text-gray-600" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 text-xl">💡</span>
            </div>
            <div>
              <h3 className="font-semibold text-blue-800 mb-2">Conseils d&apos;écoute</h3>
              <ul className="text-blue-700 space-y-1 text-sm">
                <li>• Écoutez attentivement la prononciation de chaque mot</li>
                <li>• Répétez mentalement ou à voix basse</li>
                <li>• Notez le rythme et les pauses</li>
                <li>• N&apos;hésitez pas à réécouter plusieurs fois</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Start Lesson Button */}
        {hasListened && (
          <div className="text-center">
            <button
              onClick={handleStartLesson}
              className="inline-flex items-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-8 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Commencer l&apos;apprentissage mot par mot
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <p className="text-sm text-gray-600 mt-3">
              Vous allez maintenant apprendre ce verset mot par mot, comme sur Duolingo !
            </p>
          </div>
        )}

        {!hasListened && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
              <Play className="w-4 h-4" />
              <span className="text-sm">Écoutez d&apos;abord le verset pour continuer</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
