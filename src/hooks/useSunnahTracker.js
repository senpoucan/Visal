import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../config/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { getRandomSunnahs } from '../constants/sunnahData';
import { useAuth } from './useAuth';

export function useSunnahTracker() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const historyRef = useRef([]);

  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  const getTodayStr = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  };

  const loadData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    if (!historyRef.current || historyRef.current.length === 0) {
      setLoading(true);
    }
    setError(null);
    try {
      const sunnahDocRef = doc(db, 'users', user.uid, 'stats', 'sunnah');
      let parsed = [];
      try {
        const snap = await getDoc(sunnahDocRef);
        if (snap.exists()) {
          const raw = snap.data().history || [];
          // Sanitize: remove any legacy objects that don't match { date, items: [] } format
          parsed = raw.filter(day => day && typeof day === 'object' && day.date && Array.isArray(day.items));
        }
      } catch (docErr) {
        console.warn("getDoc failed (offline), falling back to cached history:", docErr.message);
        parsed = [...historyRef.current];
      }
      
      const today = getTodayStr();
      const hasToday = parsed.length > 0 && parsed[parsed.length - 1].date === today;

      if (!hasToday) {
        const newDay = {
          date: today,
          items: getRandomSunnahs(5)
        };
        parsed.push(newDay);
        setDoc(sunnahDocRef, { history: parsed }).catch(e => console.warn("setDoc queued/failed:", e.message));
      }

      setHistory(parsed);
    } catch (e) {
      console.error("Sunnah Load Error:", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    let unsubscribe = () => {};

    const syncLocal = async () => {
      if (!user) return;
      const cached = await AsyncStorage.getItem(`sunnah_${user.uid}`);
      if (cached) setHistory(JSON.parse(cached));
    };

    if (user) {
      syncLocal();
      const sunnahDocRef = doc(db, 'users', user.uid, 'stats', 'sunnah');
      unsubscribe = onSnapshot(sunnahDocRef, (snap) => {
        if (snap.exists()) {
          const raw = snap.data().history || [];
          const sanitized = raw.filter(day => day && typeof day === 'object' && day.date && Array.isArray(day.items));
          setHistory(sanitized);
          AsyncStorage.setItem(`sunnah_${user.uid}`, JSON.stringify(sanitized));
        }
      });
      loadData();
    } else {
      setLoading(false);
    }

    return () => unsubscribe();
  }, [user?.uid, loadData]);

  const toggleTodaySunnah = async (id) => {
    if (!user) return { success: false };
    
    const today = getTodayStr();
    const newHistory = [...history];
    const todayIndex = newHistory.length - 1;
    const todayData = newHistory[todayIndex];

    if (!todayData || todayData.date !== today) {
      await loadData();
      return { success: false, rolledOver: true }; 
    }

    let justCompleted = false;
    todayData.items = todayData.items.map(item => {
      if (item.id === id) {
        const nextDone = !item.done;
        if (nextDone) justCompleted = true;
        return { ...item, done: nextDone };
      }
      return item;
    });

    const allDoneNow = todayData.items.every(i => i.done);

    setHistory(newHistory);
    const sunnahDocRef = doc(db, 'users', user.uid, 'stats', 'sunnah');
    await setDoc(sunnahDocRef, { history: newHistory });
    // Save to local
    await AsyncStorage.setItem(`sunnah_${user.uid}`, JSON.stringify(newHistory));
    
    return { success: true, justCompleted, allDoneNow }; 
  };

  const resetHistory = async () => {
    if (!user) return;
    const sunnahDocRef = doc(db, 'users', user.uid, 'stats', 'sunnah');
    await setDoc(sunnahDocRef, { history: [] });
    await loadData();
  };

  return { history, loading, error, loadData, toggleTodaySunnah, resetHistory };
}
