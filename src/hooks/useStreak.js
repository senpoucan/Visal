import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from './useAuth';

export function useStreak() {
  const [streak, setStreak] = useState({ count: 0, lastLoginDate: '' });
  const { user } = useAuth();

  const getTodayStr = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm   = String(d.getMonth() + 1).padStart(2, '0');
    const dd   = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Save to AsyncStorage first (instant), Firebase in background
  const saveStreak = async (data) => {
    if (!user) return;
    try {
      await AsyncStorage.setItem(`streak_${user.uid}`, JSON.stringify(data));
    } catch {}
    setDoc(doc(db, 'users', user.uid, 'stats', 'streak'), data).catch(() => {});
  };

  useEffect(() => {
    if (!user) return;

    const run = async () => {
      const today = getTodayStr();

      // 1. Load from AsyncStorage immediately
      let current = { count: 0, lastLoginDate: '' };
      try {
        const cached = await AsyncStorage.getItem(`streak_${user.uid}`);
        if (cached) current = JSON.parse(cached);
      } catch {}

      // 2. Apply streak logic
      if (!current.lastLoginDate) {
        // First ever login → start at 1
        const newStreak = { count: 1, lastLoginDate: today };
        setStreak(newStreak);
        await saveStreak(newStreak);
        return;
      }

      if (current.lastLoginDate === today) {
        // Already logged in today
        setStreak(current);
        return;
      }

      // Calculate days since last login
      const lastDate  = new Date(current.lastLoginDate + 'T00:00:00');
      const todayDate = new Date(today + 'T00:00:00');
      const diffDays  = Math.round((todayDate - lastDate) / (1000 * 60 * 60 * 24));

      let newCount;
      if (diffDays === 1) {
        newCount = current.count + 1; // Consecutive day → increment
      } else if (diffDays > 1) {
        newCount = 1; // Missed a day → reset to 1
      } else {
        newCount = current.count; // Same day (shouldn't reach here)
      }

      const updated = { count: newCount, lastLoginDate: today };
      setStreak(updated);
      await saveStreak(updated);

      // 3. Background: sync with Firebase (merge, keep higher count)
      try {
        const snap = await getDoc(doc(db, 'users', user.uid, 'stats', 'streak'));
        if (snap.exists()) {
          const remote = snap.data();
          // If remote has a higher count AND is from today, prefer remote
          if (remote.lastLoginDate === today && remote.count > newCount) {
            setStreak(remote);
            AsyncStorage.setItem(`streak_${user.uid}`, JSON.stringify(remote)).catch(() => {});
          }
        }
      } catch {}
    };

    run();
  }, [user?.uid]);

  // Rank metadata by count ranges
  const getRankInfo = (count) => {
    if (count >= 100) return { color: '#000000', border: '#888888', label: '🏆 Legend',    textColor: '#ffffff' };
    if (count >=  51) return { color: '#b8860b', border: '#FFD700', label: '👑 Gold',      textColor: '#000000' };
    if (count >=  26) return { color: '#8b2000', border: '#FF6A33', label: '🔥 Fire',      textColor: '#ffffff' };
    if (count >=  11) return { color: '#7a4500', border: '#FFA500', label: '⚡ Rising',    textColor: '#ffffff' };
    if (count >=   1) return { color: '#1a3a1a', border: '#4caf50', label: '🌱 Beginner',  textColor: '#ffffff' };
    return                    { color: '#1c1c1c', border: '#333333', label: '—',           textColor: '#888888' };
  };

  // Keep getStreakColor for backwards compat
  const getStreakColor = (count) => getRankInfo(count).color;

  return { streak, getStreakColor, getRankInfo };
}
