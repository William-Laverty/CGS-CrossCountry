import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Timer, Trophy, Menu, X } from 'lucide-react';
import DataEntry from './components/DataEntry';
import Leaderboard from './components/Leaderboard';

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen relative overflow-hidden">
        {/* Custom background with multiple elements */}
        <div className="fixed inset-0 z-0">
          {/* Main gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-cgs-blue/80 to-cgs-blue/60"></div>
          
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-5 mix-blend-overlay" 
               style={{ 
                 backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'orange\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                 backgroundSize: '60px 60px'
               }}>
          </div>
        </div>
        
        <header className="relative z-10">
          <div className="bg-white shadow-sm border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center">
                  <Link to="/" className="flex items-center text-cgs-navy">
                    <img 
                      src="/cgsLogo.png" 
                      alt="CGS Logo" 
                      className="h-10 w-auto mr-2" 
                    />
                    <span className="text-xl font-bold hidden sm:inline">Canberra Grammar School</span>
                    <span className="text-xl font-bold sm:hidden">CGS</span>
                    <span className="ml-2 text-xl font-light text-cgs-blue hidden sm:inline">Cross Country</span>
                  </Link>
                </div>
                
                {/* Desktop navigation */}
                <div className="hidden sm:flex space-x-4">
                  <Link
                    to="/"
                    className="text-cgs-blue hover:bg-cgs-blue/10 px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors"
                  >
                    <Timer className="h-5 w-5 mr-1" />
                    Data Entry
                  </Link>
                  <Link
                    to="/leaderboard"
                    className="text-cgs-blue hover:bg-cgs-blue/10 px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors"
                  >
                    <img 
                      src="/cgsLogo.png" 
                      alt="CGS Logo" 
                      className="h-5 w-auto mr-1" 
                    />
                    Leaderboard
                  </Link>
                </div>
                
                {/* Mobile menu button */}
                <div className="sm:hidden">
                  <button 
                    onClick={toggleMobileMenu}
                    className="text-cgs-blue p-2 rounded-md hover:bg-cgs-blue/10 focus:outline-none"
                  >
                    {mobileMenuOpen ? (
                      <X className="h-6 w-6" />
                    ) : (
                      <Menu className="h-6 w-6" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Mobile menu */}
            <div className={`sm:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
              <div className="px-2 pt-2 pb-3 space-y-1 bg-white">
                <Link
                  to="/"
                  className="text-cgs-blue hover:bg-cgs-blue/10 block px-3 py-3 rounded-md text-base font-medium flex items-center transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Timer className="h-5 w-5 mr-2" />
                  Data Entry
                </Link>
                <Link
                  to="/leaderboard"
                  className="text-cgs-blue hover:bg-cgs-blue/10 block px-3 py-3 rounded-md text-base font-medium flex items-center transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <img 
                    src="/cgsLogo.png" 
                    alt="CGS Logo" 
                    className="h-5 w-auto mr-2" 
                  />
                  Leaderboard
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Routes>
            <Route path="/" element={<DataEntry />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Routes>
        </main>

        <footer className="relative z-10 mt-auto py-4 text-center text-sm text-white">
          <div className="max-w-7xl mx-auto px-4">
            <p>© {new Date().getFullYear()} William Laverty</p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;