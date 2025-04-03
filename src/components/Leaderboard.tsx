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

  if (error) {
    return (
      <div className="flex items-center justify-center h-full py-16">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg border border-white/20">
          <img 
            src="/cgsLogo.png" 
            alt="CGS Logo" 
            className="h-20 w-auto mx-auto mb-4 opacity-70" 
          />
          <h2 className="text-xl font-bold mb-3 text-cgs-navy">{error}</h2>
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
            <div className="inline-block bg-white rounded-full px-8 py-3 shadow-lg border border-white/20 mb-4">
              <h1 className="text-2xl font-bold text-cgs-navy flex items-center justify-center">
                <img 
                  src="/cgsLogo.png" 
                  alt="CGS Logo" 
                  className="h-8 w-auto mr-2" 
                />
                {currentEvent.name}
              </h1>
            </div>
            <p className="text-white text-lg font-medium">Top 10 Results</p>
          </div>

          <div className="space-y-4">
            {results.map((result, index) => (
              <div
                key={result.id}
                className={`bg-white rounded-lg shadow-lg p-5 transition-all duration-300 hover:shadow-xl border border-white/20 ${
                  index < 3 ? `border-l-4 ${getMedalBorderColor(index)}` : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 flex items-center justify-center rounded-full ${index < 3 ? 'bg-gray-100' : 'bg-white'} mr-4 shadow-md`}>
                      {index < 3 ? (
                        <Medal className={`h-5 w-5 ${getMedalColor(index)}`} />
                      ) : (
                        <span className="text-gray-500 font-medium">{index + 1}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{result.runner_name}</h3>
                      <p className="text-gray-500 text-sm">{result.house}</p>
                    </div>
                  </div>
                  <div className="text-xl font-mono font-bold text-cgs-blue bg-blue-50 px-3 py-1 rounded-md">
                    {result.time}
                  </div>
                </div>
              </div>
            ))}
            {results.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg shadow-lg border border-white/20">
                <Medal className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600 font-medium">No results yet. Add some results to see them here!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Leaderboard;