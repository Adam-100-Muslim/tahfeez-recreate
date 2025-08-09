'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search, BookOpen, Star, Clock, ArrowLeft } from 'lucide-react';
import { Surah } from '../../types';

// Données des sourates les plus populaires pour commencer
const popularSurahs = [
  { id: 1, name: 'Al-Fatiha', arabicName: 'الفاتحة', verses: 7, difficulty: 'Facile', category: 'Essentiel' },
  { id: 112, name: 'Al-Ikhlas', arabicName: 'الإخلاص', verses: 4, difficulty: 'Très Facile', category: 'Court' },
  { id: 113, name: 'Al-Falaq', arabicName: 'الفلق', verses: 5, difficulty: 'Très Facile', category: 'Court' },
  { id: 114, name: 'An-Nas', arabicName: 'الناس', verses: 6, difficulty: 'Très Facile', category: 'Court' },
  { id: 2, name: 'Al-Baqarah', arabicName: 'البقرة', verses: 286, difficulty: 'Difficile', category: 'Long' },
  { id: 36, name: 'Ya-Sin', arabicName: 'يس', verses: 83, difficulty: 'Moyen', category: 'Populaire' },
  { id: 67, name: 'Al-Mulk', arabicName: 'الملك', verses: 30, difficulty: 'Moyen', category: 'Recommandé' },
  { id: 78, name: 'An-Naba', arabicName: 'النبأ', verses: 40, difficulty: 'Moyen', category: 'Apprentissage' },
  { id: 55, name: 'Ar-Rahman', arabicName: 'الرحمن', verses: 78, difficulty: 'Moyen', category: 'Beauté' },
];

const allSurahs = [
  { id: 1, name: 'Al-Fatiha', arabicName: 'الفاتحة', verses: 7 },
  { id: 2, name: 'Al-Baqarah', arabicName: 'البقرة', verses: 286 },
  { id: 3, name: 'Ali \'Imran', arabicName: 'آل عمران', verses: 200 },
  { id: 4, name: 'An-Nisa', arabicName: 'النساء', verses: 176 },
  { id: 5, name: 'Al-Ma\'idah', arabicName: 'المائدة', verses: 120 },
  // ... (ajoutez plus de sourates selon les besoins)
  { id: 112, name: 'Al-Ikhlas', arabicName: 'الإخلاص', verses: 4 },
  { id: 113, name: 'Al-Falaq', arabicName: 'الفلق', verses: 5 },
  { id: 114, name: 'An-Nas', arabicName: 'الناس', verses: 6 },
];

const categories = [
  { id: 'popular', name: 'Populaires', icon: '⭐' },
  { id: 'short', name: 'Courtes', icon: '⚡' },
  { id: 'medium', name: 'Moyennes', icon: '📖' },
  { id: 'long', name: 'Longues', icon: '📚' },
  { id: 'all', name: 'Toutes', icon: '🕌' },
];

export default function SelectSurah() {
  const [selectedCategory, setSelectedCategory] = useState('popular');
  const [searchTerm, setSearchTerm] = useState('');
  const [userProfile, setUserProfile] = useState<Record<string, string> | null>(null);
  const router = useRouter();

  useEffect(() => {
    const profile = localStorage.getItem('userProfile');
    if (profile) {
      setUserProfile(JSON.parse(profile));
    }
  }, []);

  const handleSurahSelect = (surah: Surah) => {
    localStorage.setItem('selectedSurah', JSON.stringify(surah));
    router.push(`/select-verse/${surah.id}`);
  };

  const filteredSurahs = selectedCategory === 'popular' 
    ? popularSurahs.filter(surah => 
        surah.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        surah.arabicName.includes(searchTerm)
      )
    : allSurahs.filter(surah => {
        const matchesSearch = surah.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            surah.arabicName.includes(searchTerm);
        
        if (selectedCategory === 'short') return matchesSearch && surah.verses <= 20;
        if (selectedCategory === 'medium') return matchesSearch && surah.verses > 20 && surah.verses <= 100;
        if (selectedCategory === 'long') return matchesSearch && surah.verses > 100;
        
        return matchesSearch;
      });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Très Facile': return 'bg-green-100 text-green-800';
      case 'Facile': return 'bg-emerald-100 text-emerald-800';
      case 'Moyen': return 'bg-yellow-100 text-yellow-800';
      case 'Difficile': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>Niveau: {userProfile?.['1'] || 'Débutant'}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Title Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Choisissez une sourate
          </h1>
          <p className="text-gray-600">
            Sélectionnez la sourate que vous souhaitez apprendre
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher une sourate..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                selectedCategory === category.id
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>

        {/* Surahs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSurahs.map((surah) => (
            <button
              key={surah.id}
              onClick={() => handleSurahSelect(surah)}
              className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-left border border-gray-100"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                    {surah.id}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{surah.name}</h3>
                    <p className="text-xl text-gray-600 font-arabic">{surah.arabicName}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{surah.verses} versets</span>
                </div>
                
                                  {selectedCategory === 'popular' && 'difficulty' in surah && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor((surah as Surah & {difficulty: string}).difficulty)}`}>
                      {(surah as Surah & {difficulty: string}).difficulty}
                  </span>
                )}
              </div>
              
              {selectedCategory === 'popular' && 'category' in surah && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    <Star className="w-3 h-3" />
                    {(surah as Surah & {category: string}).category}
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>

        {filteredSurahs.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucune sourate trouvée</h3>
            <p className="text-gray-500">Essayez de modifier votre recherche</p>
          </div>
        )}
      </main>
    </div>
  );
}
