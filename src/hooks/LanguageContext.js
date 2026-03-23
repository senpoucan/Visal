import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const translations = {
  tr: {
    // Auth & General
    welcome: "Hoş Geldiniz",
    login: "Giriş Yap",
    register: "Kayıt Ol",
    guest: "Misafir Olarak Devam Et",
    email: "E-Posta",
    password: "Şifre",
    name: "İsim / Kullanıcı Adı",
    logout: "Çıkış Yap",
    cancel: "Vazgeç",
    confirm: "Onayla",
    guide: "Rehber",
    guideDesc: "İbadet ve Namaz Rehberi",
    prayer: "Namaz",
    prayerGuide: "Namaz Rehberi",
    ablution: "Abdest",
    ablutionGuide: "Abdest Rehberi",

    // Main Screen
    startReading: "Okumaya Başla",
    dailySunnah: "Günlük Sünnetler",
    companions: "Sahabelerin Hayatı",
    quranicGems: "Kur'an Cevherleri",
    esmaUlHusna: "Esma-ül Hüsna",
    streak: "Günlük Seri",
    tolerans: "Tolerans",
    stats: "İstatistikler",
    daily: "Günlük",
    monthly: "Aylık",
    allTime: "Toplam",
    verses: "Ayet",
    pages: "Sayfa",
    hasanat: "Hasanat",
    time: "Süre",

    // Progress / Rank
    tohum: "Tohum",
    fidan: "Fidan",
    agac: "Ağaç",
    orman: "Orman",
    cennetBahcesi: "Cennet Bahçesi",

    // Messages
    dataLossWarning: "Misafir olarak girdiğinizde verileriniz sadece bu telefonda saklanır. Uygulamayı silerseniz tüm ilerlemeniz KAYBOLUR. Devam etmek istiyor musunuz?",
    verificationRequired: "E-Posta Doğrulaması",
    verificationSubtitle: "Lütfen e-postanıza gönderilen linke tıklayın.",
    checkNow: "Onayladım, Devam Et",
    resendMail: "Mail gelmedi mi? Tekrar Gönder",
  },
  en: {
    // Auth & General
    welcome: "Welcome",
    login: "Login",
    register: "Register",
    guest: "Continue as Guest",
    email: "Email",
    password: "Password",
    name: "Name / Username",
    logout: "Logout",
    cancel: "Cancel",
    confirm: "Confirm",
    guide: "Guide",
    guideDesc: "Worship and Prayer Guide",
    prayer: "Prayer (Namaz)",
    prayerGuide: "Prayer Guide",
    ablution: "Ablution",
    ablutionGuide: "Ablution Guide",

    // Main Screen
    startReading: "Start Reading",
    dailySunnah: "Daily Sunnah",
    companions: "Life of Companions",
    quranicGems: "Quranic Gems",
    esmaUlHusna: "The 99 Names",
    streak: "Day Streak",
    tolerans: "Grace Day",
    stats: "Statistics",
    daily: "Daily",
    monthly: "Monthly",
    allTime: "All Time",
    verses: "Verses",
    pages: "Pages",
    hasanat: "Hasanat",
    time: "Time",

    // Progress / Rank
    tohum: "Seed",
    fidan: "Sapling",
    agac: "Tree",
    orman: "Forest",
    cennetBahcesi: "Garden of Paradise",

    // Messages
    dataLossWarning: "When entering as a guest, your data is only stored on this phone. If you delete the app, all your progress is LOST. Do you want to continue?",
    verificationRequired: "Email Verification",
    verificationSubtitle: "Please click the link sent to your email.",
    checkNow: "I Verified, Continue",
    resendMail: "Didn't get mail? Resend",
  }
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('tr');

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const saved = await AsyncStorage.getItem('@visal_lang');
      if (saved) setLanguage(saved);
    } catch (e) {
      console.error("Load language error", e);
    }
  };

  const toggleLanguage = async () => {
    const newLang = language === 'tr' ? 'en' : 'tr';
    setLanguage(newLang);
    try {
      await AsyncStorage.setItem('@visal_lang', newLang);
    } catch (e) {
      console.error("Save language error", e);
    }
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
