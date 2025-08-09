import { ChevronDown, Globe } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-3">
        <Image
            src="/tahfeez-logo.png"
            alt="Tahfeez Logo"
            width={40}
            height={40}
            className="w-10 h-10 bg-transparent"
          />
          <span className="text-2xl font-bold text-gray-800">tahfeez</span>
        </div>
        
        {/* Language Selector */}
        <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
          <Globe className="w-4 h-4" />
          <span className="text-sm font-medium">LANGUE DU SITE : FRANÇAIS</span>
          <ChevronDown className="w-4 h-4" />
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Illustration Section */}
          <div className="flex-1 flex justify-center">
            <div className="relative w-full max-w-lg">
              {/* Main Islamic Illustration */}
              <div className="relative">
                                {/* Central Logo */}
                <div className="relative z-10 flex items-center justify-center py-12">
                  <Image
                    src="/tahfeez-logo.png"
                    alt="Tahfeez Logo"
                    width={120}
                    height={120}
                    className="w-32 h-32 mx-auto bg-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6 leading-tight">
              La méthode gratuite, fun et efficace pour apprendre le{" "}
              <span className="text-emerald-600">Coran</span> !
            </h1>
            
            <div className="space-y-4 mb-8">
              <a href="/get-started">
                <button className="w-full lg:w-80 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-12 rounded-2xl text-lg transition-colors shadow-lg hover:shadow-xl transform hover:scale-105">
                  C&apos;EST PARTI !
                </button>
              </a>
              
              <div className="flex justify-center lg:justify-start">
                <button className="w-full lg:w-80 border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 font-bold py-4 px-12 rounded-2xl text-lg transition-colors">
                  J&apos;AI DÉJÀ UN COMPTE
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
