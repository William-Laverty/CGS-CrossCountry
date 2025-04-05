import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Medal, Trash2, PlusCircle, XCircle } from 'lucide-react';

interface Event {
  id: string;
  name: string;
  active: boolean;
}

interface Result {
  id: string;
  runner_name: string;
  house: string;
  time: string;
}

const DISTANCES = ['1km', '2km', '3km', '4km', '5km', '6km'];
const AGE_GROUPS = ['12', '13', '14', '15', '16', '17', '18', 'Open'];
const DIVISIONS = ['Boys', 'Girls'];
const HOUSES = [
  'Sheaffe',
  'Garran',
  'Burgmann',
  'Garnsey',
  'Hay',
  'Blaxland',
  'Edwards',
  'Middelton',
  'Eddison',
  'Jones'
];

function DataEntry() {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [division, setDivision] = useState(DIVISIONS[0]);
  const [distance, setDistance] = useState(DISTANCES[0]);
  const [ageGroup, setAgeGroup] = useState(AGE_GROUPS[0]);
  const [runnerName, setRunnerName] = useState('');
  const [house, setHouse] = useState(HOUSES[0]);
  const [minutes, setMinutes] = useState('0');
  const [seconds, setSeconds] = useState('0');
  const [milliseconds, setMilliseconds] = useState('0');
  const [results, setResults] = useState<Result[]>([]);

  useEffect(() => {
    fetchEvents();
    const subscription = supabase
      .channel('events')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, fetchEvents)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'results' }, () => {
        if (currentEvent) fetchEventResults(currentEvent.id);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [currentEvent]);

  async function fetchEvents() {
    const { data } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) {
      setEvents(data);
      const activeEvent = data.find(event => event.active);
      setCurrentEvent(activeEvent || null);
      if (activeEvent) {
        fetchEventResults(activeEvent.id);
      }
    }
  }

  async function fetchEventResults(eventId: string) {
    const { data } = await supabase
      .from('results')
      .select('*')
      .eq('event_id', eventId)
      .order('time', { ascending: true });
    
    if (data) {
      setResults(data);
    }
  }

  async function createEvent(e: React.FormEvent) {
    e.preventDefault();
    const ageText = ageGroup === 'Open' ? 'Open' : `${ageGroup} Years`;
    const eventName = `${division} ${ageText} ${distance}`;

    // Deactivate all events
    await supabase
      .from('events')
      .update({ active: false })
      .eq('active', true);

    // Create new active event
    const { data, error } = await supabase
      .from('events')
      .insert([{ name: eventName, active: true }])
      .select()
      .single();

    if (data && !error) {
      setDivision(DIVISIONS[0]);
      setDistance(DISTANCES[0]);
      setAgeGroup(AGE_GROUPS[0]);
      fetchEvents();
    }
  }

  async function addResult(e: React.FormEvent) {
    e.preventDefault();
    if (!currentEvent || !runnerName || !house) return;

    const formattedMinutes = minutes.padStart(2, '0');
    const formattedSeconds = seconds.padStart(2, '0');
    const formattedMilliseconds = milliseconds.padStart(2, '0');
    const timeString = `${formattedMinutes}:${formattedSeconds}.${formattedMilliseconds}`;

    const { error } = await supabase
      .from('results')
      .insert([{
        event_id: currentEvent.id,
        runner_name: runnerName,
        house,
        time: timeString
      }]);

    if (!error) {
      setRunnerName('');
      setHouse(HOUSES[0]);
      setMinutes('0');
      setSeconds('0');
      setMilliseconds('0');
    }
  }

  async function endCurrentEvent() {
    if (!currentEvent) return;

    try {
      const { error } = await supabase
        .from('events')
        .update({ active: false })
        .eq('id', currentEvent.id);
      
      if (error) {
        console.error('Error ending event:', error);
        return;
      }
      
      setCurrentEvent(null);
      setResults([]);
      // Force refetch events to update UI
      fetchEvents();
    } catch (err) {
      console.error('Failed to end event:', err);
    }
  }

  async function deleteResult(resultId: string) {
    await supabase
      .from('results')
      .delete()
      .eq('id', resultId);
    
    if (currentEvent) {
      fetchEventResults(currentEvent.id);
    }
  }

  return (
    <div className="space-y-8">
      {!currentEvent ? (
        <div className="bg-gradient-to-b from-gray-100 to-gray-200 rounded-xl shadow-xl overflow-hidden border-0 transform perspective-1000">
          <div className="bg-gradient-to-r from-cgs-blue to-cgs-blue-light p-5 border-b-0 relative">
            <div className="absolute inset-0 bg-white/5"></div>
            <h2 className="text-xl font-bold text-white drop-shadow-md">Create New Event</h2>
          </div>
          <form onSubmit={createEvent} className="p-5 sm:p-6 space-y-5 sm:space-y-6 relative">
            <div className="absolute inset-0 bg-black/5 pointer-events-none"></div>
            <div className="grid grid-cols-1 gap-5 sm:gap-6 relative">
              <div>
                <label className="block text-gray-800 text-sm font-medium mb-2 drop-shadow-sm">
                  Division
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {DIVISIONS.map(div => (
                    <button
                      key={div}
                      type="button"
                      onClick={() => setDivision(div)}
                      className={`px-4 py-3 rounded-lg text-center transition-all duration-200 shadow ${
                        division === div 
                          ? 'bg-gradient-to-b from-cgs-blue-light to-cgs-blue text-white font-medium shadow-lg' 
                          : 'bg-white hover:bg-gray-50 text-gray-700 shadow-inner'
                      }`}
                    >
                      {div}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-gray-800 text-sm font-medium mb-2 drop-shadow-sm">
                  Distance
                </label>
                <div className="relative">
                  <select
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-0 text-gray-700 focus:outline-none focus:ring-2 focus:ring-cgs-blue appearance-none bg-white shadow-inner"
                  >
                    {DISTANCES.map(dist => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-gray-800 text-sm font-medium mb-2 drop-shadow-sm">
                  Age Group
                </label>
                <div className="relative">
                  <select
                    value={ageGroup}
                    onChange={(e) => setAgeGroup(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-0 text-gray-700 focus:outline-none focus:ring-2 focus:ring-cgs-blue appearance-none bg-white shadow-inner"
                  >
                    {AGE_GROUPS.map(age => (
                      <option key={age} value={age}>{age === 'Open' ? 'Open' : `${age} Years`}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-b from-cgs-orange to-cgs-orange-dark text-white py-3 px-4 rounded-lg transition-all duration-200 font-semibold shadow-lg text-base hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-md"
            >
              Create New Event
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-gradient-to-b from-gray-100 to-gray-200 rounded-xl shadow-xl overflow-hidden border-0 transform perspective-1000">
          <div className="bg-gradient-to-r from-cgs-blue to-cgs-blue-light p-5 border-b-0 relative">
            <div className="absolute inset-0 bg-white/5 pointer-events-none"></div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
              <h2 className="text-xl font-bold text-white drop-shadow-md break-words">{currentEvent.name}</h2>
              <button
                onClick={endCurrentEvent}
                className="px-4 py-2 bg-white/90 text-cgs-blue-dark hover:bg-white rounded-lg text-sm font-medium transition-all duration-200 flex items-center self-start shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-sm z-10"
              >
                <XCircle className="mr-2 h-4 w-4" />
                End Event
              </button>
            </div>
          </div>
          <div className="p-5 relative">
            <div className="absolute inset-0 bg-black/5 pointer-events-none"></div>
            <h3 className="text-lg font-semibold mb-4 drop-shadow-sm text-gray-800">Event Results</h3>
            <div className="overflow-auto max-h-[40vh] mb-4 sm:max-h-64 pr-1">
              {results.length > 0 ? (
                <div className="space-y-3">
                  {results.map((result, index) => (
                    <div key={result.id} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-md hover:shadow-lg transition-all">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 flex items-center justify-center rounded-full mr-3 flex-shrink-0 ${
                          index === 0 ? 'bg-gradient-to-b from-yellow-300 to-yellow-500 shadow-inner' : 
                          index === 1 ? 'bg-gradient-to-b from-gray-300 to-gray-500 shadow-inner' : 
                          index === 2 ? 'bg-gradient-to-b from-amber-600 to-amber-800 shadow-inner' :
                          'bg-gradient-to-b from-gray-100 to-gray-300 shadow-inner'
                        }`}>
                          {index < 3 ? (
                            <Medal className={`h-4 w-4 ${index === 0 ? 'text-white' : index === 1 ? 'text-white' : 'text-white'}`} />
                          ) : (
                            <span className="text-gray-700 text-sm font-medium">{index + 1}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate text-gray-800">{result.runner_name}</p>
                          <p className="text-xs text-gray-500">{result.house} • {result.time}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteResult(result.id)}
                        className="text-red-500 hover:text-red-700 p-2 transition-all duration-200 ml-2 flex-shrink-0 hover:bg-red-50 rounded-full"
                        aria-label="Delete runner"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8 bg-white/50 rounded-lg shadow-inner">
                  <p>No results yet. Add a result below.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {currentEvent && (
        <div className="bg-gradient-to-b from-gray-100 to-gray-200 rounded-xl shadow-xl overflow-hidden border-0 transform perspective-1000">
          <div className="bg-gradient-to-r from-cgs-orange to-cgs-orange-light p-5 border-b-0 relative">
            <div className="absolute inset-0 bg-white/5"></div>
            <h2 className="text-xl font-bold text-white drop-shadow-md">
              Add Result
            </h2>
          </div>
          <form onSubmit={addResult} className="p-5 sm:p-6 space-y-5 sm:space-y-6 relative">
            <div className="absolute inset-0 bg-black/5 pointer-events-none"></div>
            <div>
              <label className="block text-gray-800 text-sm font-medium mb-2 drop-shadow-sm">
                Runner's Name
              </label>
              <input
                type="text"
                value={runnerName}
                onChange={(e) => setRunnerName(e.target.value)}
                placeholder="Enter runner's name"
                className="w-full px-4 py-3 rounded-lg border-0 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cgs-orange focus:border-transparent bg-white shadow-inner"
                inputMode="text"
                autoComplete="name"
              />
            </div>
            <div>
              <label className="block text-gray-800 text-sm font-medium mb-2 drop-shadow-sm">
                House
              </label>
              <div className="relative">
                <select
                  value={house}
                  onChange={(e) => setHouse(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-0 text-gray-700 focus:outline-none focus:ring-2 focus:ring-cgs-orange focus:border-transparent appearance-none bg-white shadow-inner"
                >
                  {HOUSES.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-gray-800 text-sm font-medium mb-2 drop-shadow-sm">
                Time
              </label>
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <div className="flex flex-col">
                  <label className="text-xs text-gray-600 mb-1 drop-shadow-sm">Minutes</label>
                  <input
                    type="number"
                    min="0"
                    value={minutes}
                    onChange={(e) => setMinutes(e.target.value)}
                    className="w-full px-3 py-3 rounded-lg border-0 text-gray-700 focus:outline-none focus:ring-2 focus:ring-cgs-orange focus:border-transparent bg-white shadow-inner"
                    inputMode="numeric"
                    pattern="[0-9]*"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-gray-600 mb-1 drop-shadow-sm">Seconds</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={seconds}
                    onChange={(e) => setSeconds(e.target.value)}
                    className="w-full px-3 py-3 rounded-lg border-0 text-gray-700 focus:outline-none focus:ring-2 focus:ring-cgs-orange focus:border-transparent bg-white shadow-inner"
                    inputMode="numeric"
                    pattern="[0-9]*"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-gray-600 mb-1 drop-shadow-sm">Milliseconds</label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={milliseconds}
                    onChange={(e) => setMilliseconds(e.target.value)}
                    className="w-full px-3 py-3 rounded-lg border-0 text-gray-700 focus:outline-none focus:ring-2 focus:ring-cgs-orange focus:border-transparent bg-white shadow-inner"
                    inputMode="numeric"
                    pattern="[0-9]*"
                  />
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-b from-cgs-blue to-cgs-blue-dark text-white py-3 px-4 rounded-lg transition-all duration-200 font-semibold shadow-lg text-base hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-md"
            >
              Add Result
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default DataEntry;