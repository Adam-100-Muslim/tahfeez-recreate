'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search, BookOpen, Star, Clock, ArrowLeft, Loader2 } from 'lucide-react';
import { Surah } from '../../types';
import QuranApiService, { Surah as ApiSurah } from '../../services/quranApi';

// Popular surah IDs for quick access
const popularSurahIds = [1, 112, 113, 114, 2, 36, 67, 78, 55];

// Difficulty mapping based on surah length
const getDifficultyFromVerses = (verses: number): string => {
  if (verses <= 10) return 'Très Facile';
  if (verses <= 30) return 'Facile';
  if (verses <= 100) return 'Moyen';
  return 'Difficile';
};

// Category mapping
const getCategoryFromSurah = (surahNo: number, verses: number): string => {
  const popularCategories: { [key: number]: string } = {
    1: 'Essentiel',
    112: 'Court',
    113: 'Court',
    114: 'Court',
    2: 'Long',
    36: 'Populaire',
    67: 'Recommandé',
    78: 'Apprentissage',
    55: 'Beauté'
  };
  return popularCategories[surahNo] || (verses <= 20 ? 'Court' : verses > 100 ? 'Long' : 'Moyen');
};

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
  const [allSurahs, setAllSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const profile = localStorage.getItem('userProfile');
    if (profile) {
      setUserProfile(JSON.parse(profile));
    }
  }, []);

  useEffect(() => {
    const loadSurahs = async () => {
      try {
        setLoading(true);
        setError(null);
        const surahs = await QuranApiService.getSurahs();
        
        // Transform API data to match our component structure
        const transformedSurahs: Surah[] = surahs.map((apiSurah: ApiSurah, index) => ({
          surahName: apiSurah.surahName,
          surahNameArabic: apiSurah.surahNameArabic,
          surahNameArabicLong: apiSurah.surahNameArabicLong,
          surahNameTranslation: apiSurah.surahNameTranslation,
          revelationPlace: apiSurah.revelationPlace,
          totalAyah: apiSurah.totalAyah,
          surahNo: apiSurah.surahNo || (index + 1), // Use API surahNo if available
          difficulty: getDifficultyFromVerses(apiSurah.totalAyah),
          category: getCategoryFromSurah(apiSurah.surahNo || (index + 1), apiSurah.totalAyah)
        }));
        
        setAllSurahs(transformedSurahs);
      } catch (err) {
        console.error('Error loading surahs:', err);
        setError('Failed to load surahs. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadSurahs();
  }, []);

  const handleSurahSelect = (surah: Surah) => {
    localStorage.setItem('selectedSurah', JSON.stringify(surah));
    router.push(`/select-verse/${surah.surahNo}`);
  };

  const filteredSurahs = (() => {
    if (loading || allSurahs.length === 0) return [];
    
    let surahs: Surah[];
    
    if (selectedCategory === 'popular') {
      surahs = allSurahs.filter(surah => popularSurahIds.includes(surah.surahNo || 0));
    } else {
      surahs = allSurahs.filter(surah => {
        if (selectedCategory === 'short') return surah.totalAyah <= 20;
        if (selectedCategory === 'medium') return surah.totalAyah > 20 && surah.totalAyah <= 100;
        if (selectedCategory === 'long') return surah.totalAyah > 100;
        return true; // 'all' category
      });
    }
    
    // Apply search filter
    return surahs.filter(surah => 
      surah.surahName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      surah.surahNameArabic.includes(searchTerm) ||
      surah.surahNameTranslation.toLowerCase().includes(searchTerm.toLowerCase())
    );
  })();

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

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-4" />
            <p className="text-gray-600">Chargement des sourates...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Erreur de chargement</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Surahs Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSurahs.map((surah) => (
              <button
                key={surah.surahNo}
                onClick={() => handleSurahSelect(surah)}
                className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-left border border-gray-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                      {surah.surahNo}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">{surah.surahName}</h3>
                      <p className="text-xl text-gray-600 font-arabic">{surah.surahNameArabic}</p>
                      <p className="text-sm text-gray-500">{surah.surahNameTranslation}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{surah.totalAyah} versets</span>
                  </div>
                  
                  {surah.difficulty && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(surah.difficulty)}`}>
                      {surah.difficulty}
                    </span>
                  )}
                </div>
                
                {selectedCategory === 'popular' && surah.category && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                      <Star className="w-3 h-3" />
                      {surah.category}
                    </span>
                  </div>
                )}
                
                <div className="mt-2 text-xs text-gray-500">
                  {surah.revelationPlace}
                </div>
              </button>
            ))}
          </div>
        )}

        {!loading && !error && filteredSurahs.length === 0 && (
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
