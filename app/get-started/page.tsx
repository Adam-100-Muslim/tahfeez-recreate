'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight, BookOpen } from 'lucide-react';

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

export default function GetStarted() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedOption, setSelectedOption] = useState<string>('');
  const router = useRouter();

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
      // Sauvegarder les réponses et rediriger vers la sélection des sourates
      localStorage.setItem('userProfile', JSON.stringify(newAnswers));
      router.push('/select-surah');
    }
  };

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      {/* Header */}
      <header className="flex items-center justify-between p-6">
        <div className="flex items-center gap-3">
          <Image
            src="/tahfeez-logo.png"
            alt="Tahfeez Logo"
            width={40}
            height={40}
            className="w-10 h-10 rounded-lg"
          />
          <span className="text-2xl font-bold text-gray-800">tahfeez</span>
        </div>
        
        {/* Progress Bar */}
        <div className="flex-1 max-w-md mx-8">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-teal-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2 text-center">
            Question {currentQuestion + 1} sur {questions.length}
          </p>
        </div>

        <div className="w-20"></div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full mb-6">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
            {currentQ.question}
          </h1>
          <p className="text-gray-600 text-lg">
            Aidez-nous à personnaliser votre expérience d&apos;apprentissage
          </p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {currentQ.options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleAnswer(option.id)}
              className={`p-6 rounded-2xl border-2 text-left transition-all duration-300 transform hover:scale-105 ${
                selectedOption === option.id
                  ? 'border-emerald-500 bg-emerald-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-emerald-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">{option.icon}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-gray-800 mb-2">
                    {option.text}
                  </h3>
                  <p className="text-gray-600">
                    {option.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Next Button */}
        <div className="flex justify-center">
          <button
            onClick={handleNext}
            disabled={!selectedOption}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform ${
              selectedOption
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white hover:scale-105 shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {currentQuestion < questions.length - 1 ? 'Continuer' : 'Commencer l&apos;apprentissage'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </main>
    </div>
  );
}
