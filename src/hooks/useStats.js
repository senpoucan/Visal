import { useState, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { countArabicLetters } from '../constants/quranData';
import { useAuth } from './useAuth';

const VERSES_PER_PAGE = 15;
const emptyStats = { verses: 0, pages: 0, hasanat: 0, seconds: 0 };

const makeInitialData = () => ({
  daily:    { ...emptyStats },
  monthly:  { ...emptyStats },
  allTime:  { ...emptyStats },
  lastDate: '',
  lastMonth: '',
});

export function useStats() {
  const [data, setData] = useState(makeInitialData());
  const dataRef  = useRef(makeInitialData()); // Start with empty, never null
  const userRef  = useRef(null);              // Always up-to-date user ref
  const timerRef = useRef(null);

  const { user } = useAuth();

  // Keep userRef always pointing to latest user
  useEffect(() => { userRef.current = user; }, [user]);

  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const getMonthStr = () => new Date().toISOString().slice(0, 7);

  const mergeStats = (a, b) => {
    if (!a) return b || { ...emptyStats };
    if (!b) return a;
    return {
      verses:  Math.max(a.verses  || 0, b.verses  || 0),
      pages:   Math.max(a.pages   || 0, b.pages   || 0),
      hasanat: Math.max(a.hasanat || 0, b.hasanat || 0),
      seconds: Math.max(a.seconds || 0, b.seconds || 0),
    };
  };

  // Save to AsyncStorage FIRST, Firebase in background (never blocks UI)
  const saveNow = useCallback(async () => {
    const u = userRef.current;
    const d = dataRef.current;
    if (!u || !d) return;

    // AsyncStorage is synchronous on native — save immediately
    try {
      await AsyncStorage.setItem(`stats_${u.uid}`, JSON.stringify(d));
    } catch {}

    // Firebase in background — failures are silent
    setDoc(doc(db, 'users', u.uid, 'stats', 'main'), d).catch(() => {});
  }, []); // No deps — uses refs

  // ── Load & merge on login ─────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const uid   = user.uid;
    const today = getTodayStr();
    const month = getMonthStr();

    (async () => {
      // 1. Load from AsyncStorage immediately so counters show instantly
      try {
        const cached = await AsyncStorage.getItem(`stats_${uid}`);
        if (cached) {
          const parsed = JSON.parse(cached);

          // Reset daily/monthly if dates changed, keeping allTime intact
          if (parsed.lastDate !== today) { parsed.daily   = { ...emptyStats }; parsed.lastDate  = today; }
          if (parsed.lastMonth !== month){ parsed.monthly = { ...emptyStats }; parsed.lastMonth = month; }

          dataRef.current = parsed;
          setData({ ...parsed });
        } else {
          // New user — initialize with today's date
          const init = makeInitialData();
          init.lastDate  = today;
          init.lastMonth = month;
          dataRef.current = init;
          setData({ ...init });
        }
      } catch {}

      // 2. Background Firebase merge (keeps highest values)
      try {
        const snap = await getDoc(doc(db, 'users', uid, 'stats', 'main'));
        if (snap.exists()) {
          const remote = snap.data();
          const live   = dataRef.current;
          const merged = {
            lastDate:  today,
            lastMonth: month,
            daily:   (remote.lastDate === today)  ? mergeStats(live.daily,   remote.daily)   : live.daily,
            monthly: (remote.lastMonth === month) ? mergeStats(live.monthly, remote.monthly) : live.monthly,
            allTime: mergeStats(live.allTime, remote.allTime),
          };
          dataRef.current = merged;
          setData({ ...merged });
          AsyncStorage.setItem(`stats_${uid}`, JSON.stringify(merged)).catch(() => {});
          setDoc(doc(db, 'users', uid, 'stats', 'main'), merged).catch(() => {});
        } else {
          // First run — write initial doc
          setDoc(doc(db, 'users', uid, 'stats', 'main'), dataRef.current).catch(() => {});
        }
      } catch {}
    })();
  }, [user?.uid]);

  // ── Periodic save timer (every 5 seconds of activity) ─────────────────────
  useEffect(() => {
    timerRef.current = setInterval(() => {
      const u = userRef.current;
      if (!u) return;

      const today = getTodayStr();
      const month = getMonthStr();

      dataRef.current.allTime.seconds += 1;

      if (dataRef.current.lastDate === today) {
        dataRef.current.daily.seconds += 1;
      } else {
        dataRef.current.daily    = { ...emptyStats, seconds: 1 };
        dataRef.current.lastDate = today;
      }
      if (dataRef.current.lastMonth === month) {
        dataRef.current.monthly.seconds += 1;
      } else {
        dataRef.current.monthly   = { ...emptyStats, seconds: 1 };
        dataRef.current.lastMonth = month;
      }

      setData({ ...dataRef.current });

      if (dataRef.current.allTime.seconds % 5 === 0) {
        saveNow();
      }
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [saveNow]);

  // ── Record verse (called by QuranReader on every ayah) ────────────────────
  const recordVerse = useCallback((arabicText) => {
    const u = userRef.current;
    if (!u) return;

    const today = getTodayStr();
    const month = getMonthStr();

    const lettersX10 = countArabicLetters(arabicText) * 10;

    // Reset if day/month changed
    if (dataRef.current.lastDate !== today) {
      dataRef.current.daily    = { ...emptyStats };
      dataRef.current.lastDate = today;
    }
    if (dataRef.current.lastMonth !== month) {
      dataRef.current.monthly   = { ...emptyStats };
      dataRef.current.lastMonth = month;
    }

    // Update all counters
    for (const bucket of [dataRef.current.daily, dataRef.current.monthly, dataRef.current.allTime]) {
      bucket.verses  += 1;
      bucket.pages    = Math.floor(bucket.verses / VERSES_PER_PAGE);
      bucket.hasanat += lettersX10;
    }

    setData({ ...dataRef.current });
    saveNow(); // Immediate save on every ayah
  }, [saveNow]);

  // ── Formatters ─────────────────────────────────────────────────────────────
  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return m === 0 ? '0m' : `${m}m`;
  };

  const formatHasanat = (n) => {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1_000)     return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
    return String(n);
  };

  const formatStats = (obj) => {
    if (!obj) obj = emptyStats;
    return {
      verses:           obj.verses  || 0,
      pages:            obj.pages   || 0,
      hasanat:          obj.hasanat || 0,
      formattedTime:    formatTime(obj.seconds  || 0),
      formattedHasanat: formatHasanat(obj.hasanat || 0),
    };
  };

  return {
    daily:       formatStats(data.daily),
    monthly:     formatStats(data.monthly),
    allTime:     formatStats(data.allTime),
    recordVerse,
  };
}
