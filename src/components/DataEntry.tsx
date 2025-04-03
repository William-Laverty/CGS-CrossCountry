import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Medal, Trash2, PlusCircle } from 'lucide-react';

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
  'Burgman',
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

    await supabase
      .from('events')
      .update({ active: false })
      .eq('id', currentEvent.id);
    
    setCurrentEvent(null);
    setResults([]);
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
    <div className="space-y-6">
      {!currentEvent ? (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-white/20">
          <div className="bg-gradient-to-r from-cgs-blue to-cgs-blue-light p-4 border-b">
            <h2 className="text-xl font-bold text-white">Create New Event</h2>
          </div>
          <form onSubmit={createEvent} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Division
                </label>
                <select
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                  className="w-full px-4 py-3 rounded-md border border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-cgs-blue focus:border-transparent appearance-none bg-white"
                >
                  {DIVISIONS.map(div => (
                    <option key={div} value={div}>{div}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Distance
                </label>
                <select
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  className="w-full px-4 py-3 rounded-md border border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-cgs-blue focus:border-transparent appearance-none bg-white"
                >
                  {DISTANCES.map(dist => (
                    <option key={dist} value={dist}>{dist}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Age Group
                </label>
                <select
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value)}
                  className="w-full px-4 py-3 rounded-md border border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-cgs-blue focus:border-transparent appearance-none bg-white"
                >
                  {AGE_GROUPS.map(age => (
                    <option key={age} value={age}>{age === 'Open' ? 'Open' : `${age} Years`}</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-cgs-orange hover:bg-cgs-orange-dark text-white py-3 px-4 rounded-md transition duration-200 font-semibold shadow-sm text-base"
            >
              Create New Event
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-white/20">
          <div className="bg-gradient-to-r from-cgs-blue to-cgs-blue-light p-4 border-b">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
              <h2 className="text-xl font-bold text-white break-words">{currentEvent.name}</h2>
              <button
                onClick={endCurrentEvent}
                className="px-4 py-2 bg-white text-cgs-blue-dark hover:bg-gray-100 rounded-md text-sm font-medium transition duration-200 flex items-center self-start"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                End Event
              </button>
            </div>
          </div>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Event Results</h3>
            <div className="overflow-auto max-h-[40vh] mb-4 sm:max-h-64">
              {results.length > 0 ? (
                <div className="space-y-2">
                  {results.map((result, index) => (
                    <div key={result.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                      <div className="flex items-center">
                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 mr-3 flex-shrink-0">
                          {index < 3 ? (
                            <Medal className={`h-4 w-4 ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-amber-700'}`} />
                          ) : (
                            <span className="text-gray-500 text-sm">{index + 1}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{result.runner_name}</p>
                          <p className="text-xs text-gray-500">{result.house} • {result.time}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteResult(result.id)}
                        className="text-red-500 hover:text-red-700 p-2 transition duration-200 ml-2 flex-shrink-0"
                        aria-label="Delete runner"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <p>No results yet. Add a result below.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {currentEvent && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-white/20">
          <div className="bg-gradient-to-r from-cgs-orange to-cgs-orange-light p-4 border-b">
            <h2 className="text-xl font-bold text-white">
              Add Result
            </h2>
          </div>
          <form onSubmit={addResult} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Runner's Name
              </label>
              <input
                type="text"
                value={runnerName}
                onChange={(e) => setRunnerName(e.target.value)}
                placeholder="Enter runner's name"
                className="w-full px-4 py-3 rounded-md border border-gray-300 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cgs-orange focus:border-transparent"
                inputMode="text"
                autoComplete="name"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                House
              </label>
              <select
                value={house}
                onChange={(e) => setHouse(e.target.value)}
                className="w-full px-4 py-3 rounded-md border border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-cgs-orange focus:border-transparent appearance-none bg-white"
              >
                {HOUSES.map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Time
              </label>
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div className="flex flex-col">
                  <label className="text-xs text-gray-500 mb-1">Minutes</label>
                  <input
                    type="number"
                    min="0"
                    value={minutes}
                    onChange={(e) => setMinutes(e.target.value)}
                    className="w-full px-3 py-3 rounded-md border border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-cgs-orange focus:border-transparent"
                    inputMode="numeric"
                    pattern="[0-9]*"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-gray-500 mb-1">Seconds</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={seconds}
                    onChange={(e) => setSeconds(e.target.value)}
                    className="w-full px-3 py-3 rounded-md border border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-cgs-orange focus:border-transparent"
                    inputMode="numeric"
                    pattern="[0-9]*"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-gray-500 mb-1">Milliseconds</label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={milliseconds}
                    onChange={(e) => setMilliseconds(e.target.value)}
                    className="w-full px-3 py-3 rounded-md border border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-cgs-orange focus:border-transparent"
                    inputMode="numeric"
                    pattern="[0-9]*"
                  />
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-cgs-blue hover:bg-cgs-blue-dark text-white py-3 px-4 rounded-md transition duration-200 font-semibold shadow-sm text-base"
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