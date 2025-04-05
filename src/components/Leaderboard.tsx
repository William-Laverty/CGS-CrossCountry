import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Trophy, Medal } from 'lucide-react';

interface Result {
  id: string;
  runner_name: string;
  house: string;
  time: string;
}

interface Event {
  id: string;
  name: string;
  active: boolean;
}

function Leaderboard() {
  const [results, setResults] = useState<Result[]>([]);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCurrentEventAndResults();
    
    const subscription = supabase
      .channel('results')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'results' }, fetchCurrentEventAndResults)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, fetchCurrentEventAndResults)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchCurrentEventAndResults() {
    try {
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('active', true)
        .maybeSingle();

      if (eventError) {
        throw eventError;
      }

      if (!eventData) {
        setCurrentEvent(null);
        setResults([]);
        setError('No active event found. Please create a new event.');
        return;
      }

      setCurrentEvent(eventData);
      setError(null);

      const { data: resultsData, error: resultsError } = await supabase
        .from('results')
        .select('*')
        .eq('event_id', eventData.id)
        .order('time', { ascending: true })
        .limit(10);

      if (resultsError) {
        throw resultsError;
      }

      setResults(resultsData || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data. Please try again later.');
    }
  }

  // Format time to remove hour section if present (only show MM:SS.MS)
  const formatTime = (timeString: string) => {
    // Check if time contains two colons (which would indicate hours)
    if (timeString.split(':').length > 2) {
      // If there are hours, take only the minutes, seconds, and milliseconds parts
      return timeString.split(':').slice(1).join(':');
    }
    // Otherwise, return the time as is (already in MM:SS.MS format)
    return timeString;
  };

  // Houses and their colors
  const HOUSE_COLORS: Record<string, { bgColor: string; textColor: string; borderColor: string }> = {
    'Sheaffe': { bgColor: '#A7A6A4', textColor: '#ffffff', borderColor: '#888784' },
    'Garran': { bgColor: '#5C396F', textColor: '#ffffff', borderColor: '#482c57' },
    'Burgmann': { bgColor: '#FCCC00', textColor: '#333333', borderColor: '#d9af00' },
    'Garnsey': { bgColor: '#3C9BD1', textColor: '#ffffff', borderColor: '#2a80b0' },
    'Hay': { bgColor: '#0D0802', textColor: '#ffffff', borderColor: '#291e14' },
    'Blaxland': { bgColor: '#E63C2D', textColor: '#ffffff', borderColor: '#c3321f' },
    'Edwards': { bgColor: '#882426', textColor: '#ffffff', borderColor: '#6a1c1e' },
    'Middelton': { bgColor: '#1DB678', textColor: '#ffffff', borderColor: '#189a64' },
    'Eddison': { bgColor: '#213B5E', textColor: '#ffffff', borderColor: '#162945' },
    'Jones': { bgColor: '#1A5630', textColor: '#ffffff', borderColor: '#13401f' }
  };

  // Default color for houses not in the mapping
  const DEFAULT_COLOR = { bgColor: '#6b7280', textColor: '#ffffff', borderColor: '#4b5563' };

  // Get house color or default if not found
  const getHouseColor = (house: string) => {
    return HOUSE_COLORS[house] || DEFAULT_COLOR;
  };

  // Create a lightened version of a color for backgrounds
  const getLightenedColor = (color: string) => {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Mix with white to create a lighter version (90% white, 10% original color)
    const lightenedR = Math.round(r * 0.2 + 255 * 0.8);
    const lightenedG = Math.round(g * 0.2 + 255 * 0.8);
    const lightenedB = Math.round(b * 0.2 + 255 * 0.8);
    
    // Convert back to hex
    return `#${lightenedR.toString(16).padStart(2, '0')}${lightenedG.toString(16).padStart(2, '0')}${lightenedB.toString(16).padStart(2, '0')}`;
  };

  const getMedalColor = (position: number) => {
    switch (position) {
      case 0: return 'text-yellow-500';
      case 1: return 'text-gray-400';
      case 2: return 'text-amber-700';
      default: return 'text-gray-400';
    }
  };

  const getMedalBorderColor = (position: number) => {
    switch (position) {
      case 0: return 'border-yellow-500';
      case 1: return 'border-gray-400';
      case 2: return 'border-amber-700';
      default: return 'border-transparent';
    }
  };

  const getMedalGradient = (position: number) => {
    switch (position) {
      case 0: return 'bg-gradient-to-b from-yellow-300 to-yellow-500';
      case 1: return 'bg-gradient-to-b from-gray-300 to-gray-500';
      case 2: return 'bg-gradient-to-b from-amber-600 to-amber-800';
      default: return 'bg-gradient-to-b from-gray-100 to-gray-300';
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full py-16">
        <div className="text-center bg-gradient-to-b from-gray-100 to-gray-200 p-8 rounded-xl shadow-xl border-0 transform perspective-1000 relative">
          <div className="absolute inset-0 bg-black/5 pointer-events-none rounded-xl"></div>
          <img 
            src="/cgsLogo.png" 
            alt="CGS Logo" 
            className="h-20 w-auto mx-auto mb-4 opacity-70 drop-shadow-md" 
          />
          <h2 className="text-xl font-bold mb-3 text-cgs-navy drop-shadow-sm">{error}</h2>
          <p className="text-gray-600 font-medium">Head to the Data Entry page to create a new event.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {currentEvent && (
        <div>
          <div className="text-center mb-8">
            <div className="relative mx-auto max-w-4xl">
              {/* Background effects */}
              <div className="absolute inset-0 bg-gradient-to-r from-cgs-blue/10 via-cgs-blue/20 to-cgs-blue/10 rounded-xl blur-md transform -rotate-1"></div>
              
              {/* Main event name container */}
              <div className="relative bg-gradient-to-b from-white to-gray-100 rounded-xl px-8 py-4 shadow-xl border border-gray-200/50 transform hover:scale-[1.02] transition-all duration-300">
                {/* Top decorative line */}
                <div className="absolute top-0 left-4 right-4 h-1 bg-gradient-to-r from-transparent via-cgs-blue to-transparent"></div>
                
                {/* Bottom decorative line */}
                <div className="absolute bottom-0 left-4 right-4 h-1 bg-gradient-to-r from-transparent via-cgs-blue to-transparent"></div>
                
                <div className="flex flex-col items-center justify-center space-y-1">
                  <div className="text-sm uppercase tracking-widest text-cgs-blue/70 font-semibold">CGS Cross Country</div>
                  
                  <h1 className="text-2xl sm:text-3xl font-bold text-cgs-navy flex items-center justify-center">
                    <img 
                      src="/cgsLogo.png" 
                      alt="CGS Logo" 
                      className="h-8 w-auto mr-3 drop-shadow-md" 
                    />
                    <span className="relative">
                      {/* Text outline effect */}
                      <span className="absolute inset-0 text-transparent bg-clip-text bg-gradient-to-r from-cgs-blue/90 to-cgs-blue blur-[0.5px] select-none">{currentEvent.name}</span>
                      {/* Main text */}
                      <span className="relative">{currentEvent.name}</span>
                    </span>
                  </h1>
                  
                  <div className="flex items-center mt-1">
                    <div className="h-0.5 w-12 bg-gradient-to-r from-transparent to-cgs-blue/30"></div>
                    <div className="mx-2 text-xs text-cgs-blue/60 font-medium">RESULTS</div>
                    <div className="h-0.5 w-12 bg-gradient-to-r from-cgs-blue/30 to-transparent"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {results.length > 0 ? (
            <>
              {/* Top 3 Podium */}
              <div className="mb-6">
                <div className="grid grid-cols-3 gap-3 sm:gap-4 px-2">
                  {/* 2nd Place */}
                  {results.length >= 2 && (
                    <div className="transform hover:-translate-y-1 transition-all duration-300">
                      <div className="rounded-lg shadow-lg overflow-hidden relative h-full"
                           style={{ 
                             background: `linear-gradient(to top, ${getLightenedColor(getHouseColor(results[1].house).bgColor)}, white)` 
                           }}>
                        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-gray-300 to-gray-500"></div>
                        <div className="absolute -right-8 -top-8 w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rotate-45 shadow-inner"></div>
                        <div className="p-4 flex flex-col items-center h-full">
                          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-b from-gray-300 to-gray-400 mb-3 shadow-md border-2 border-white">
                            <Medal className="h-5 w-5 text-white drop-shadow-sm" />
                          </div>
                          <div className="flex-1 flex flex-col justify-between w-full space-y-3">
                            <p className="text-lg font-bold text-center text-gray-800 truncate w-full">{results[1].runner_name}</p>
                            
                            <div className="text-center bg-gradient-to-r from-gray-600 to-gray-700 text-white px-4 py-1 rounded-full text-sm font-bold shadow-md">
                              2<sup>nd</sup> Place
                            </div>
                            
                            <div className="text-base font-bold text-gray-700 bg-white px-3 py-2 rounded-lg shadow-inner w-full text-center"
                                 style={{
                                   borderWidth: '1px',
                                   borderColor: getHouseColor(results[1].house).borderColor
                                 }}>
                              {formatTime(results[1].time)}
                            </div>
                            
                            <div 
                              className="px-3 py-1 rounded-full text-xs font-medium shadow-sm w-full text-center border"
                              style={{ 
                                backgroundColor: getHouseColor(results[1].house).bgColor,
                                color: getHouseColor(results[1].house).textColor,
                                borderColor: getHouseColor(results[1].house).borderColor,
                              }}
                            >
                              {results[1].house}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 1st Place */}
                  {results.length >= 1 && (
                    <div className="transform hover:-translate-y-2 transition-all duration-300 z-10">
                      <div className="rounded-lg shadow-xl overflow-hidden relative h-full"
                           style={{ 
                             background: `linear-gradient(to top, ${getLightenedColor(getHouseColor(results[0].house).bgColor)}, white)` 
                           }}>
                        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-yellow-300 to-yellow-500"></div>
                        <div className="absolute -right-8 -top-8 w-16 h-16 bg-gradient-to-br from-yellow-200 to-yellow-300 rotate-45 shadow-inner"></div>
                        <div className="p-4 flex flex-col items-center h-full">
                          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-b from-yellow-400 to-yellow-500 mb-3 shadow-lg border-2 border-white">
                            <Trophy className="h-5 w-5 text-white drop-shadow-md" />
                          </div>
                          <div className="flex-1 flex flex-col justify-between w-full space-y-3">
                            <p className="text-lg font-bold text-center text-gray-800 truncate w-full">{results[0].runner_name}</p>
                            
                            <div className="text-center bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-md">
                              1<sup>st</sup> Place
                            </div>
                            
                            <div className="text-base font-bold text-gray-800 bg-white px-3 py-2 rounded-lg shadow-inner w-full text-center"
                                 style={{
                                   borderWidth: '1px',
                                   borderColor: getHouseColor(results[0].house).borderColor
                                 }}>
                              {formatTime(results[0].time)}
                            </div>
                            
                            <div 
                              className="px-3 py-1 rounded-full text-xs font-medium shadow-sm w-full text-center border"
                              style={{ 
                                backgroundColor: getHouseColor(results[0].house).bgColor,
                                color: getHouseColor(results[0].house).textColor,
                                borderColor: getHouseColor(results[0].house).borderColor,
                              }}
                            >
                              {results[0].house}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3rd Place */}
                  {results.length >= 3 && (
                    <div className="transform hover:-translate-y-1 transition-all duration-300">
                      <div className="rounded-lg shadow-lg overflow-hidden relative h-full"
                           style={{ 
                             background: `linear-gradient(to top, ${getLightenedColor(getHouseColor(results[2].house).bgColor)}, white)` 
                           }}>
                        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-600 to-amber-800"></div>
                        <div className="absolute -right-8 -top-8 w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-800 rotate-45 shadow-inner"></div>
                        <div className="p-4 flex flex-col items-center h-full">
                          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-b from-amber-500 to-amber-700 mb-3 shadow-md border-2 border-white">
                            <Medal className="h-5 w-5 text-white drop-shadow-sm" />
                          </div>
                          <div className="flex-1 flex flex-col justify-between w-full space-y-3">
                            <p className="text-lg font-bold text-center text-gray-800 truncate w-full">{results[2].runner_name}</p>
                            
                            <div className="text-center bg-gradient-to-r from-amber-600 to-amber-700 text-white px-4 py-1 rounded-full text-sm font-bold shadow-md">
                              3<sup>rd</sup> Place
                            </div>
                            
                            <div className="text-base font-bold text-gray-700 bg-white px-3 py-2 rounded-lg shadow-inner w-full text-center"
                                 style={{
                                   borderWidth: '1px',
                                   borderColor: getHouseColor(results[2].house).borderColor
                                 }}>
                              {formatTime(results[2].time)}
                            </div>
                            
                            <div 
                              className="px-3 py-1 rounded-full text-xs font-medium shadow-sm w-full text-center border"
                              style={{ 
                                backgroundColor: getHouseColor(results[2].house).bgColor,
                                color: getHouseColor(results[2].house).textColor,
                                borderColor: getHouseColor(results[2].house).borderColor,
                              }}
                            >
                              {results[2].house}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Remaining Results (4-10) */}
              {results.length > 3 && (
                <>
                  <div className="space-y-2">
                    {results.slice(3).map((result, index) => (
                      <div
                        key={result.id}
                        className="bg-gradient-to-b from-white to-gray-50 rounded-lg shadow-md p-2.5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 border-0 relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-black/5 pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                        <div className="flex items-center justify-between relative">
                          <div className="flex items-center">
                            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-b from-gray-100 to-gray-300 mr-3 shadow-md">
                              <span className="text-gray-700 font-bold text-sm">{index + 4}</span>
                            </div>
                            <div className="flex items-center">
                              <h3 className="text-sm font-semibold text-gray-800 truncate max-w-[120px] sm:max-w-none">{result.runner_name}</h3>
                              <div className="ml-2">
                                <div 
                                  className="px-1.5 py-0.5 rounded-full text-xs font-medium shadow-sm"
                                  style={{ 
                                    backgroundColor: getHouseColor(result.house).bgColor,
                                    color: getHouseColor(result.house).textColor,
                                    borderColor: getHouseColor(result.house).borderColor,
                                    borderWidth: '1px'
                                  }}
                                >
                                  {result.house}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-sm font-bold text-cgs-blue bg-gradient-to-b from-blue-50 to-blue-100 px-2 py-1 rounded-md shadow-inner">
                            {formatTime(result.time)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="text-center py-8 bg-gradient-to-b from-gray-100 to-gray-200 rounded-xl shadow-xl border-0 relative transform perspective-1000">
              <div className="absolute inset-0 bg-black/5 pointer-events-none rounded-xl"></div>
              <Medal className="h-12 w-12 mx-auto mb-3 text-gray-300 drop-shadow-lg" />
              <p className="text-gray-600 font-medium relative">No results yet. Add some results to see them here!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Leaderboard;