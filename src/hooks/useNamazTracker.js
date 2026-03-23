import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../config/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { useAuth } from './useAuth';

const DEFAULT_NAMAZ_STATE = {
  fard: { sabah: false, ogle: false, ikindi: false, aksam: false, yatsi: false },
  nafil: { israk: false, kusluk: false, evvabin: false, teheccud: false }
};

export function useNamazTracker() {
  const [namazData, setNamazData] = useState(DEFAULT_NAMAZ_STATE);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  const getSafeTodayString = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  useEffect(() => {
    let unsubscribe = () => {};

    const syncLocal = async () => {
      if (!user) return;
      try {
        const cached = await AsyncStorage.getItem(`namaz_${user.uid}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.date === getSafeTodayString()) {
            setNamazData(parsed.data);
          } else {
            setNamazData(DEFAULT_NAMAZ_STATE);
          }
        }
      } catch (e) {
        console.error('Local cache read error:', e);
      }
    };

    if (user) {
      syncLocal();
      const namazDocRef = doc(db, 'users', user.uid, 'stats', 'namaz');
      
      unsubscribe = onSnapshot(namazDocRef, (snap) => {
        const today = getSafeTodayString();
        if (snap.exists()) {
          const d = snap.data();
          if (d.date === today && d.data) {
            setNamazData(d.data);
            AsyncStorage.setItem(`namaz_${user.uid}`, JSON.stringify({ date: today, data: d.data })).catch(console.error);
          } else {
             // It's a new day or missed formatting, reset to default internally, no need to push empty doc until they interact
             setNamazData(DEFAULT_NAMAZ_STATE);
          }
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
    
    return () => unsubscribe();
  }, [user?.uid]);

  const toggleNamaz = async (category, prayerKey) => {
    if (!user) return;
    const today = getSafeTodayString();
    
    // optimistically update local state
    const newData = {
      ...namazData,
      [category]: {
        ...namazData[category],
        [prayerKey]: !namazData[category][prayerKey]
      }
    };
    
    setNamazData(newData);
    
    // Save to AsyncStorage
    await AsyncStorage.setItem(`namaz_${user.uid}`, JSON.stringify({ date: today, data: newData })).catch(console.error);

    // Save to Firestore
    try {
      const namazDocRef = doc(db, 'users', user.uid, 'stats', 'namaz');
      await setDoc(namazDocRef, { date: today, data: newData });
    } catch (e) {
      console.error('Failed to save namaz tracker', e);
    }
  };

  return { namazData, loading, toggleNamaz };
}
