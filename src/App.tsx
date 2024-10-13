import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Smile, Frown, Meh } from 'lucide-react';
import { ref, push, onValue, query, limitToLast } from 'firebase/database';
import { db } from './firebase';

type User = 'Santi' | 'Chucho' | 'Claudia' | 'Vicky';
type MoodEntry = {
  user: User;
  mood: number;
  timestamp: string;
};

const users: User[] = ['Santi', 'Chucho', 'Claudia', 'Vicky'];

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [mood, setMood] = useState<number>(5);
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);

  useEffect(() => {
    const moodEntriesRef = query(ref(db, 'moodEntries'), limitToLast(200));
    onValue(moodEntriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const entries = Object.values(data) as MoodEntry[];
        setMoodEntries(entries.reverse());
      }
    });
  }, []);

  const handleMoodChange = (newMood: number) => {
    setMood(newMood);
  };

  const handleSubmit = () => {
    if (currentUser) {
      const newEntry: MoodEntry = {
        user: currentUser,
        mood,
        timestamp: new Date().toISOString(),
      };
      push(ref(db, 'moodEntries'), newEntry);
      setCurrentUser(null);
      setMood(5);
    }
  };

  const getMoodIcon = (moodValue: number) => {
    if (moodValue <= 3) return <Frown className="w-8 h-8 text-red-500" />;
    if (moodValue <= 7) return <Meh className="w-8 h-8 text-yellow-500" />;
    return <Smile className="w-8 h-8 text-green-500" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8 text-purple-800">Estado de Ánimo de Olga</h1>
      
      {!currentUser ? (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-purple-700">Selecciona tu usuario:</h2>
          <div className="flex space-x-4">
            {users.map((user) => (
              <motion.button
                key={user}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white px-6 py-3 rounded-full shadow-md text-purple-700 font-semibold"
                onClick={() => setCurrentUser(user)}
              >
                {user}
              </motion.button>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-semibold mb-4 text-purple-700">Hola, {currentUser}!</h2>
          <p className="mb-4 text-gray-600">¿Cómo está el ánimo de Olga hoy?</p>
          <div className="flex items-center justify-between mb-6">
            <span className="text-red-500 font-semibold">1</span>
            <input
              type="range"
              min="1"
              max="10"
              value={mood}
              onChange={(e) => handleMoodChange(parseInt(e.target.value))}
              className="w-full mx-4"
            />
            <span className="text-green-500 font-semibold">10</span>
          </div>
          <div className="flex justify-center mb-6">
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5 }}
            >
              {getMoodIcon(mood)}
            </motion.div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-purple-600 text-white py-2 rounded-md font-semibold"
            onClick={handleSubmit}
          >
            Registrar estado de ánimo
          </motion.button>
        </div>
      )}

      <div className="mt-8 w-full max-w-2xl">
        <h3 className="text-2xl font-semibold mb-4 text-purple-800">Registros recientes</h3>
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-purple-100">
              <tr>
                <th className="px-4 py-2 text-left text-purple-700">Usuario</th>
                <th className="px-4 py-2 text-left text-purple-700">Estado</th>
                <th className="px-4 py-2 text-left text-purple-700">Fecha y Hora</th>
              </tr>
            </thead>
            <tbody>
              {moodEntries.map((entry, index) => (
                <tr key={index} className="border-t border-gray-200">
                  <td className="px-4 py-2">{entry.user}</td>
                  <td className="px-4 py-2 flex items-center">
                    {getMoodIcon(entry.mood)}
                    <span className="ml-2">{entry.mood}</span>
                  </td>
                  <td className="px-4 py-2">
                    {new Date(entry.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;