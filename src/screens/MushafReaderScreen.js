import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator, Alert, Platform, Modal, TextInput, FlatList, TouchableWithoutFeedback } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { useLanguage } from '../hooks/LanguageContext';
import { useAuth } from '../hooks/useAuth';
import { SURAHS } from '../constants/quranData';

const API_BASE = 'https://api.alquran.cloud/v1/page';

function toArabicNumber(n) {
  const digits = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
  return String(n).split('').map(d => digits[parseInt(d)]).join('');
}

export default function MushafReaderScreen({ navigation }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageData, setPageData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSurahModal, setShowSurahModal] = useState(false);
  const [surahFilter, setSurahFilter] = useState('');
  const { language } = useLanguage();
  const { user } = useAuth();

  const filteredSurahs = SURAHS.filter(s => {
    if (!surahFilter.trim()) return true;
    const q = surahFilter.toLowerCase();
    const trName = s.tr ? s.tr.toLowerCase() : '';
    return (
      s.en.toLowerCase().includes(q) ||
      trName.includes(q) ||
      s.ar.includes(surahFilter) ||
      String(s.num).includes(surahFilter)
    );
  });

  const openSurah = async (surah) => {
    setShowSurahModal(false);
    setLoading(true);
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/ayah/${surah.num}:1/quran-uthmani`);
      const json = await res.json();
      if (json.code === 200 && json.data && json.data.page) {
        setCurrentPage(json.data.page);
      }
    } catch (e) {
      if (Platform.OS === 'web') alert('Sure sayfası bulunamadı.');
      else Alert.alert('Hata', 'Sure sayfası bulunamadı.');
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadSavedPage = async () => {
      try {
        const key = user?.uid ? `lastMushafPage_${user.uid}` : 'lastMushafPage';
        const saved = await AsyncStorage.getItem(key);
        if (saved) {
          setCurrentPage(parseInt(saved, 10));
        } else {
          setShowSurahModal(true);
        }
      } catch (e) {
        console.error('Error loading mushaf page', e);
      }
    };
    loadSavedPage();
  }, [user?.uid]); // Re-run when user changes

  useEffect(() => {
    if (currentPage) {
       fetchPage(currentPage);
       const key = user?.uid ? `lastMushafPage_${user.uid}` : 'lastMushafPage';
       AsyncStorage.setItem(key, String(currentPage)).catch(e => console.error(e));
    }
  }, [currentPage, user?.uid]);

  const fetchPage = async (page) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/${page}/quran-uthmani`);
      const json = await res.json();
      if (json.code === 200 && json.data && json.data.ayahs) {
        // Group by surah
        const grouped = [];
        let currentSurahName = '';
        let currentText = '';

        json.data.ayahs.forEach(ayah => {
          if (ayah.surah.name !== currentSurahName) {
            if (currentText) {
              grouped.push({ surahName: currentSurahName, text: currentText.trim() });
            }
            currentSurahName = ayah.surah.name;
            currentText = '';
          }
          let cleanText = ayah.text;
          currentText += `${cleanText} ﴿${toArabicNumber(ayah.numberInSurah)}﴾ `;
        });

        if (currentText) {
          grouped.push({ surahName: currentSurahName, text: currentText.trim() });
        }

        setPageData(grouped);
      }
    } catch (e) {
      if (Platform.OS === 'web') alert('Failed to load page. Check your internet connection.');
      else Alert.alert('Error', 'Failed to load page. Check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentPage < 604) setCurrentPage(p => p + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(p => p - 1);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.surahPickerBtn} onPress={() => setShowSurahModal(true)} activeOpacity={0.7}>
            <Text style={styles.surahPickerText}>☰</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{language === 'tr' ? 'Mushaf Okuma' : 'Mushaf Reader'}</Text>
          <Text style={styles.pageIndicator}>{language === 'tr' ? 'Sayfa' : 'Page'} {currentPage} / 604</Text>
        </View>
        <View style={{width: 82}}/>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.pageBox}>
           {loading ? (
             <ActivityIndicator size="large" color={COLORS.green} style={{ marginVertical: 50 }} />
           ) : (
             pageData.map((block, idx) => (
               <View key={idx} style={styles.surahBlock}>
                 <View style={styles.surahNameBanner}>
                   <Text style={styles.surahNameText}>{block.surahName}</Text>
                 </View>
                 <Text style={styles.arabicText}>{block.text}</Text>
               </View>
             ))
           )}
        </View>
        
        <View style={styles.controls}>
           <TouchableOpacity 
             style={[styles.navBtn, currentPage <= 1 && styles.navBtnDisabled]}
             onPress={handlePrev}
             disabled={currentPage <= 1 || loading}
           >
             <Text style={styles.navBtnText}>▶ {language === 'tr' ? 'Önceki' : 'Prev'}</Text>
           </TouchableOpacity>

           <TouchableOpacity 
             style={[styles.navBtn, currentPage >= 604 && styles.navBtnDisabled]}
             onPress={handleNext}
             disabled={currentPage >= 604 || loading}
           >
             <Text style={styles.navBtnText}>{language === 'tr' ? 'Sonraki' : 'Next'} ◀</Text>
           </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── SURAH SELECTION MODAL ── */}
      <Modal visible={showSurahModal} animationType="slide" transparent={true} onRequestClose={() => setShowSurahModal(false)}>
        <TouchableWithoutFeedback onPress={() => setShowSurahModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modal}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{language === 'tr' ? 'Sure Seç' : 'Select Surah'}</Text>
                  <TouchableOpacity onPress={() => setShowSurahModal(false)} style={styles.closeBtn}>
                    <Text style={styles.closeBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={styles.searchInput}
                  placeholder={language === 'tr' ? 'İsim veya numara ile ara...' : 'Search by name or number...'}
                  placeholderTextColor={COLORS.textMuted}
                  value={surahFilter}
                  onChangeText={setSurahFilter}
                />
                <FlatList
                  data={filteredSurahs}
                  keyExtractor={item => String(item.num)}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.surahItem} onPress={() => openSurah(item)} activeOpacity={0.7}>
                      <View style={styles.surahNum}><Text style={styles.surahNumText}>{item.num}</Text></View>
                      <View style={styles.surahInfo}>
                        <Text style={styles.surahAr}>{item.ar}</Text>
                        <Text style={styles.surahEn}>{language === 'tr' ? item.tr : item.en}</Text>
                      </View>
                      <Text style={styles.surahVerses}>{item.verses} {language === 'tr' ? 'Ayet' : 'Verses'}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingTop: Platform.OS === 'ios' ? 55 : 35, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: '#1e1e1e',
    borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { color: COLORS.text, fontSize: 18 },
  headerTitleContainer: { alignItems: 'center' },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  pageIndicator: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  
  content: { padding: SPACING.md, paddingBottom: 40 },
  pageBox: {
    backgroundColor: '#FAF5E6', // A soft mushaf-like paper color
    minHeight: 400,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1, borderColor: '#ebdca7',
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: {height: 2}
  },
  surahBlock: { marginBottom: 24 },
  surahNameBanner: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    marginBottom: 12
  },
  surahNameText: {
    color: '#333',
    fontSize: 20,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif'
  },
  arabicText: {
    color: '#222', // Dark ink color
    fontSize: 26,
    lineHeight: 52,
    textAlign: 'center',
    writingDirection: 'rtl',
    fontFamily: Platform.OS === 'ios' ? 'Arial' : 'sans-serif'
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 14,
  },
  navBtn: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.sm,
    borderWidth: 1, borderColor: COLORS.border,
    paddingVertical: 16,
    alignItems: 'center',
  },
  navBtnDisabled: { opacity: 0.4 },
  navBtnText: { color: COLORS.text, fontSize: 14, fontWeight: '600' },

  surahPickerBtn: {
    width: 36, height: 36,
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  surahPickerText: { color: COLORS.text, fontSize: 18 },

  // MODAL STYLES
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 26, borderTopRightRadius: 26,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)',
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingVertical: 18,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  modalTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  closeBtn: {
    backgroundColor: '#2a2a2a', width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  closeBtnText: { color: COLORS.textMuted, fontSize: 14 },
  searchInput: {
    backgroundColor: '#161616', color: COLORS.text, fontSize: 14,
    paddingHorizontal: SPACING.lg, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  surahItem: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: SPACING.lg, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  surahNum: {
    width: 34, height: 34, borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center', justifyContent: 'center',
  },
  surahNumText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600' },
  surahInfo: { flex: 1 },
  surahAr: { color: COLORS.text, fontSize: 16, fontWeight: '700', writingDirection: 'rtl', textAlign: 'left' },
  surahEn: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  surahVerses: { color: COLORS.textMuted, fontSize: 11, fontWeight: '500' },
});
