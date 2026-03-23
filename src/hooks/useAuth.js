import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile,
  sendEmailVerification,
  signInAnonymously
} from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // 1. FAST BOOT: Try to restore from AsyncStorage to instantly unblock UI
          let cachedProfile = {};
          try {
            const cachedProfileStr = await AsyncStorage.getItem(`profile_${firebaseUser.uid}`);
            if (cachedProfileStr) cachedProfile = JSON.parse(cachedProfileStr);
          } catch (e) {}

          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            emailVerified: firebaseUser.emailVerified,
            isAnonymous: firebaseUser.isAnonymous,
            displayName: firebaseUser.displayName || cachedProfile.displayName || 'Yolcu',
            photoURL: firebaseUser.photoURL || cachedProfile.photoURL,
            gender: cachedProfile.gender || 'male',
            ...cachedProfile
          });
          setLoading(false); // Unblock loading screen immediately!

          // 2. BACKGROUND SYNC: Fetch latest profile from Firebase (Silently handled)
          try {
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              const userData = userDoc.data();
              setUser(prev => ({
                ...prev,
                displayName: firebaseUser.displayName || userData.displayName || 'Yolcu',
                photoURL: firebaseUser.photoURL || userData.photoURL,
                gender: userData.gender || 'male',
                ...userData
              }));
              AsyncStorage.setItem(`profile_${firebaseUser.uid}`, JSON.stringify(userData)).catch(()=>{});
            }
          } catch (fetchErr) {
            console.log("Firebase background fetch blocked/delayed (AdBlocker?):", fetchErr.message);
          }

        } else {
          setUser(null);
          setLoading(false);
        }
      } catch (err) {
        console.error("Auth State Error:", err);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const register = async (name, email, password, gender) => {
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update profile
      await updateProfile(user, { displayName: name });
      
      // Send Verification Email
      await sendEmailVerification(user);
      
      // Create user doc
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        displayName: name,
        email: email,
        gender: gender || 'male',
        createdAt: new Date().toISOString(),
        hasPfp: false,
        isGuest: false
      });

      return user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const loginAsGuest = async (name, gender) => {
    setError(null);
    try {
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;
      
      await updateProfile(user, { displayName: name });
      
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        displayName: name,
        gender: gender || 'male',
        createdAt: new Date().toISOString(),
        isGuest: true
      });

      return user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      setError(err.message);
    }
  };

  const checkVerification = async () => {
    if (!auth.currentUser) return;
    await auth.currentUser.reload();
    setUser(prev => ({ ...prev, emailVerified: auth.currentUser.emailVerified }));
    return auth.currentUser.emailVerified;
  };

  const updateUserPfp = async (imageUri) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid), { photoURL: imageUri }, { merge: true });
      setUser(prev => ({ ...prev, photoURL: imageUri }));
    } catch (err) {
      console.error("Error updating profile pic:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, loading, error, 
      login, register, loginAsGuest, 
      logout, checkVerification, updateUserPfp 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
