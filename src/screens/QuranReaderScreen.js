import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  TextInput, Modal, ActivityIndicator, SafeAreaView,
  ScrollView, Alert, Switch, Dimensions, Platform,
  TouchableWithoutFeedback
} from 'react-native';
import { Audio } from 'expo-av';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { SURAHS, QARIS, getAudioUrl, parseTajweed, TAJWEED_COLORS } from '../constants/quranData';
import { useStatsContext } from '../hooks/StatsContext';
import { useLanguage } from '../hooks/LanguageContext';
import { useAuth } from '../hooks/useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const API_BASE = 'https://api.alquran.cloud/v1/ayah';

export default function QuranReaderScreen({ navigation }) {
  const { recordVerse } = useStatsContext();
  const { user } = useAuth();

  // ── Surah state ──
  const [showSurahModal, setShowSurahModal] = useState(true);
  const [surahFilter, setSurahFilter]       = useState('');
  const [currentSurah, setCurrentSurah]     = useState(null); // {num, ar, en, tr, verses}
  const [currentAyah, setCurrentAyah]       = useState(1);
  const { language } = useLanguage();

  // ── Verse data ──
  const [arabic, setArabic]           = useState('');
  const [parsedTajweed, setParsedTajweed] = useState([]);
  const [translation, setTranslation] = useState('');
  const [translationLang, setTranslationLang] = useState('tr.diyanet');
  const [loading, setLoading]         = useState(false);

  // ── Audio state ──
  const [selectedQari, setSelectedQari] = useState(QARIS[0].id);
  const [autoRead, setAutoRead]         = useState(false);
  const [isPlaying, setIsPlaying]       = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const soundRef = useRef(null);
  const nextSoundRef = useRef(null);

  // ── Surah finished ──
  const [surahFinished, setSurahFinished] = useState(false);

  // ── Stable Refs for AV Callbacks ──
  const autoReadRef = useRef(autoRead);
  useEffect(() => { autoReadRef.current = autoRead; }, [autoRead]);

  const currentSurahRef = useRef(currentSurah);
  useEffect(() => { currentSurahRef.current = currentSurah; }, [currentSurah]);

  const currentAyahRef = useRef(currentAyah);
  useEffect(() => { currentAyahRef.current = currentAyah; }, [currentAyah]);

  // ─────────────── CLEANUP AUDIO ON UNMOUNT ───────────────
  useEffect(() => {
    return () => {
      stopAudio();
      unloadNextAudio();
    };
  }, []);

  // ─────────────── PERSIST POSITION ───────────────
  useEffect(() => {
    const loadSavedPosition = async () => {
      try {
        const key = user?.uid ? `lastQuranPosition_${user.uid}` : 'lastQuranPosition';
        const saved = await AsyncStorage.getItem(key);
        if (saved) {
          const { surahNum, ayahNum } = JSON.parse(saved);
          if (surahNum >= 1 && surahNum <= 114) {
            const surah = SURAHS[surahNum - 1];
            setCurrentSurah(surah);
            setCurrentAyah(ayahNum);
            setShowSurahModal(false);
            fetchVerse(surah.num, ayahNum);
          }
        }
      } catch (e) {
        console.error('Error loading saved position:', e);
      }
    };
    loadSavedPosition();
  }, [user?.uid]); // Re-run when user changes

  useEffect(() => {
    if (currentSurah && currentAyah) {
      const key = user?.uid ? `lastQuranPosition_${user.uid}` : 'lastQuranPosition';
      AsyncStorage.setItem(key, JSON.stringify({ 
        surahNum: currentSurah.num, 
        ayahNum: currentAyah 
      })).catch(err => console.error('Save position error:', err));
    }
  }, [currentSurah, currentAyah, user?.uid]);

  const unloadNextAudio = async () => {
    if (nextSoundRef.current) {
      try {
        await nextSoundRef.current.unloadAsync();
      } catch {}
      nextSoundRef.current = null;
    }
  };

  // ─────────────── FETCH VERSE ───────────────
  const fetchVerse = useCallback(async (surahNum, ayahNum) => {
    setLoading(true);
    setArabic('');
    setParsedTajweed([]);
    setTranslation('');
    setSurahFinished(false);
    try {
      const [arRes, enRes] = await Promise.all([
        fetch(`${API_BASE}/${surahNum}:${ayahNum}/quran-tajweed`),
        fetch(`${API_BASE}/${surahNum}:${ayahNum}/${translationLang}`),
      ]);
      const arData = await arRes.json();
      const enData = await enRes.json();
      
      const rawTajweed = arData.data?.text || '—';
      setArabic(rawTajweed);
      setParsedTajweed(parseTajweed(rawTajweed));
      
      const en = enData.data?.text || '';
      setTranslation(en);
      recordVerse(rawTajweed);
    } catch {
      setArabic('تعذّر تحميل الآية');
      setTranslation('Failed to load verse. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [recordVerse, translationLang]);

  // Re-fetch only translation when language changes (if verse is loaded)
  useEffect(() => {
    if (currentSurah && !loading && arabic) {
      fetchVerse(currentSurah.num, currentAyah);
    }
  }, [translationLang]);

  // ─────────────── OPEN SURAH ───────────────
  const openSurah = useCallback(async (surah) => {
    await stopAudio();
    setCurrentSurah(surah);
    setCurrentAyah(1);
    setSurahFinished(false);
    setShowSurahModal(false);
    setShowSurahModal(false);
    fetchVerse(surah.num, 1);
  }, [fetchVerse]);

  async function stopAudio() {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch {}
      soundRef.current = null;
    }
    setIsPlaying(false);
    setAudioProgress(0);
  }

  const preloadNextAudio = async (surahNum, ayahNum) => {
    await unloadNextAudio();
    if (!surahNum || surahNum > 114) return;
    const surah = SURAHS[surahNum - 1];
    if (ayahNum > surah.verses) return;

    try {
      const url = getAudioUrl(selectedQari, surahNum, ayahNum);
      const { sound } = await Audio.Sound.createAsync({ uri: url }, { shouldPlay: false });
      nextSoundRef.current = sound;
    } catch (e) {}
  };

  const playAudio = useCallback(async (surahNum, ayahNum) => {
    if (!surahNum || !ayahNum) return;
    await stopAudio();

    try {
      if (Platform.OS !== 'web') {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        });
      }

      let sound;
      if (nextSoundRef.current) {
        sound = nextSoundRef.current;
        nextSoundRef.current = null;
      } else {
        const url = getAudioUrl(selectedQari, surahNum, ayahNum);
        const result = await Audio.Sound.createAsync({ uri: url }, { shouldPlay: false });
        sound = result.sound;
      }

      sound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
      await sound.playAsync();

      soundRef.current = sound;
      setIsPlaying(true);

      if (autoReadRef.current) {
        preloadNextAudio(surahNum, ayahNum + 1);
      }
    } catch (e) {
      const msg = e.message || 'Could not play audio.';
      if (Platform.OS === 'web') window.alert('Audio Error: ' + msg);
      else Alert.alert('Audio Error', msg);
      setIsPlaying(false);
    }
  }, [selectedQari]);

  const onPlaybackStatusUpdate = useCallback((status) => {
    if (!status.isLoaded) return;

    if (status.durationMillis && status.positionMillis) {
      setAudioProgress(status.positionMillis / status.durationMillis);
    }

    if (status.didJustFinish) {
      setIsPlaying(false);
      setAudioProgress(0);

      if (autoReadRef.current) {
        // Auto-advance to next verse or finish surah using stable refs
        const surah = currentSurahRef.current;
        const next = currentAyahRef.current + 1;
        
        if (surah && next <= surah.verses) {
          fetchVerse(surah.num, next);
          setCurrentAyah(next);
          setTimeout(() => playAudio(surah.num, next), 50); // Almost gapless!
        } else {
          setSurahFinished(true);
        }
      }
    }
  }, [fetchVerse, playAudio]);

  // ─────────────── UI HELPERS ───────────────
  // Re-attach playback callback when autoRead changes
  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
    }
  }, [onPlaybackStatusUpdate]);

  const togglePlay = async () => {
    if (isPlaying) {
      await stopAudio();
    } else {
      await playAudio(currentSurah?.num, currentAyah);
    }
  };

  // ─────────────── NAVIGATION ───────────────
  const goToAyah = async (ayah) => {
    await stopAudio();
    setCurrentAyah(ayah);
    fetchVerse(currentSurah.num, ayah);
    if (autoRead) {
      setTimeout(() => playAudio(currentSurah.num, ayah), 800);
    }
  };

  const goNext = () => {
    if (!currentSurah) return;
    if (currentAyah < currentSurah.verses) {
      goToAyah(currentAyah + 1);
    } else {
      setSurahFinished(true);
    }
  };

  const goPrev = () => {
    if (currentAyah > 1) goToAyah(currentAyah - 1);
  };

  const goNextSurah = async () => {
    if (!currentSurah || currentSurah.num >= 114) return;
    await stopAudio();
    const nextSurah = SURAHS[currentSurah.num]; // num is 1-based, index is 0-based so index = num
    openSurah(nextSurah);
  };

  // ─────────────── QARI CHANGE ───────────────
  const changeQari = async (newId) => {
    const wasPlaying = isPlaying;
    await stopAudio();
    setSelectedQari(newId);
    if (wasPlaying && currentSurah) {
      setTimeout(() => playAudio(currentSurah.num, currentAyah), 300);
    }
  };

  // ─────────────── FILTERED SURAHS ───────────────
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

  // ─────────────── RENDER ───────────────
  return (
    <SafeAreaView style={styles.safe}>

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => { stopAudio(); navigation.goBack(); }}
          activeOpacity={0.7}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.headerAr}>
            {currentSurah ? currentSurah.ar : 'القرآن الكريم'}
          </Text>
          <Text style={styles.headerEn}>
            {currentSurah ? (language === 'tr' ? currentSurah.tr : currentSurah.en) : (language === 'tr' ? 'Sure Seçiniz' : 'Choose a Surah')}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.surahPickerBtn}
          onPress={() => setShowSurahModal(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.surahPickerText}>☰</Text>
        </TouchableOpacity>
      </View>

      {/* ── QARI SELECTOR ── */}
      <View style={styles.qariSection}>
        <Text style={styles.sectionLabel}>{language === 'tr' ? 'OKUYUCU' : 'QARI'}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.qariList}>
          {QARIS.map(q => (
            <TouchableOpacity
              key={q.key}
              style={[styles.qariBtn, selectedQari === q.id && styles.qariBtnActive]}
              onPress={() => changeQari(q.id)}
              activeOpacity={0.7}
            >
              <Text style={[styles.qariBtnText, selectedQari === q.id && styles.qariBtnTextActive]}>
                {q.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── AUTO-READ & TRANSLATION TOGGLE ── */}
      <View style={styles.autoReadBar}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text style={styles.autoReadLabel}>🔁  {language === 'tr' ? 'Otomatik Oku' : 'Auto-Read'}</Text>
          <Switch
            value={autoRead}
            onValueChange={v => {
              setAutoRead(v);
              if (!v) stopAudio();
              else if (currentSurah && !isPlaying) playAudio(currentSurah.num, currentAyah);
            }}
            trackColor={{ false: '#2a2a2a', true: 'rgba(90,122,90,0.5)' }}
            thumbColor={autoRead ? COLORS.green : '#555'}
          />
        </View>

        <TouchableOpacity 
          style={styles.langToggleBtn}
          onPress={() => setTranslationLang(prev => prev === 'tr.diyanet' ? 'en.asad' : 'tr.diyanet')}
        >
          <Text style={styles.langToggleText}>
            {translationLang === 'tr.diyanet' ? '🇹🇷 TR' : '🇬🇧 EN'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── VERSE AREA ── */}
      <ScrollView contentContainerStyle={styles.verseArea} showsVerticalScrollIndicator={false}>

        {/* Verse Box */}
        <View style={styles.verseBox}>
          <TouchableOpacity 
            style={styles.verseBadgeWrap}
            onPress={() => setShowSurahModal(true)}
            activeOpacity={0.8}
          >
            <View style={styles.verseBadge}>
              <Text style={styles.verseBadgeText}>
                {currentSurah
                  ? `Surah ${currentSurah.num}  •  Ayah ${currentAyah} / ${currentSurah.verses}  ▾`
                  : 'Select a Surah  ▾'}
              </Text>
            </View>
          </TouchableOpacity>

          {loading ? (
            <ActivityIndicator color={COLORS.green} size="large" style={{ marginVertical: 40 }} />
          ) : (
            <>
              <Text style={styles.arabicText} numberOfLines={0}>
                {currentSurah && currentAyah === 1 && currentSurah.num !== 1 && currentSurah.num !== 9 && (
                  <Text style={{ color: COLORS.red }}>بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ{'\n'}</Text>
                )}
                {parsedTajweed.length > 0 ? (
                  parsedTajweed.map((p, i) => (
                    <Text key={i} style={{ color: p.class ? TAJWEED_COLORS[p.class] : COLORS.text }}>
                      {p.text}
                    </Text>
                  ))
                ) : (
                  <Text style={{ color: COLORS.text }}>{arabic || 'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ'}</Text>
                )}
              </Text>
              {translation ? (
                <View style={styles.translationWrap}>
                  <Text style={styles.translation}>{translation}</Text>
                </View>
              ) : null}
            </>
          )}
        </View>

        {/* Audio Progress */}
        {(isPlaying || audioProgress > 0) && (
          <View style={styles.progressWrap}>
            <View style={[styles.progressBar, { width: `${audioProgress * 100}%` }]} />
          </View>
        )}

        {/* Play Button */}
        <TouchableOpacity
          style={[styles.dubBtn, isPlaying && styles.dubBtnPlaying]}
          onPress={togglePlay}
          disabled={!currentSurah || loading}
          activeOpacity={0.75}
        >
          <Text style={styles.dubBtnText}>
            {isPlaying 
              ? (language === 'tr' ? '⏸  Oynatılıyor...' : '⏸  Playing...') 
              : (language === 'tr' ? '▶  Ayeti Dinle' : '▶  Play Verse')}
          </Text>
        </TouchableOpacity>

        {/* ── SURAH FINISHED BANNER ── */}
        {surahFinished && currentSurah && (
          <View style={styles.finishedBanner}>
            <Text style={styles.finishedTitle}>
              🎉 Surah {currentSurah.en} Complete!
            </Text>
            <Text style={styles.finishedSub}>MashaAllah! You've finished this surah.</Text>
            {currentSurah.num < 114 && (
              <TouchableOpacity style={styles.nextSurahBtn} onPress={goNextSurah} activeOpacity={0.8}>
                <Text style={styles.nextSurahBtnText}>
                  {language === 'tr' ? 'Sonraki Sure:' : 'Next Surah:'} {(language === 'tr' && SURAHS[currentSurah.num].tr) ? SURAHS[currentSurah.num].tr : SURAHS[currentSurah.num].en}  →
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ── PREV / NEXT AYAH ── */}
        <View style={styles.navRow}>
          <TouchableOpacity
            style={[styles.navAyahBtn, currentAyah <= 1 && styles.navAyahBtnDisabled]}
            onPress={goPrev}
            disabled={currentAyah <= 1 || loading}
            activeOpacity={0.7}
          >
            <Text style={styles.navAyahText}>◀  {language === 'tr' ? 'Önceki' : 'Previous'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navAyahBtn,
              (currentSurah && currentAyah >= currentSurah.verses) && styles.navAyahBtnDisabled,
            ]}
            onPress={goNext}
            disabled={!currentSurah || currentAyah >= currentSurah?.verses || loading}
            activeOpacity={0.7}
          >
            <Text style={styles.navAyahText}>{language === 'tr' ? 'Sonraki' : 'Next'}  ▶</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* ── SURAH SELECTION MODAL ── */}
      <Modal
        visible={showSurahModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSurahModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowSurahModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modal}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{language === 'tr' ? 'Sure Seç' : 'Select Surah'}</Text>
                  {currentSurah && (
                    <TouchableOpacity onPress={() => setShowSurahModal(false)} style={styles.closeBtn}>
                      <Text style={styles.closeBtnText}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <TextInput
                  style={styles.searchInput}
                  placeholder={language === 'tr' ? 'İsim veya numara ile ara...' : 'Search by name or number…'}
                  placeholderTextColor={COLORS.textMuted}
                  value={surahFilter}
                  onChangeText={setSurahFilter}
                  clearButtonMode="while-editing"
                />
                <FlatList
                  data={filteredSurahs}
                  keyExtractor={item => String(item.num)}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.surahItem}
                      onPress={() => openSurah(item)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.surahNum}>
                        <Text style={styles.surahNumText}>{item.num}</Text>
                      </View>
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

  // HEADER
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: Platform.OS === 'ios' ? 55 : 35,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 36, height: 36,
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { color: COLORS.text, fontSize: 18 },
  headerTitle: { flex: 1, alignItems: 'center' },
  headerAr: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '700',
    writingDirection: 'rtl',
  },
  headerEn: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  surahPickerBtn: {
    width: 36, height: 36,
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  surahPickerText: { color: COLORS.text, fontSize: 18 },

  // QARI
  qariSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    letterSpacing: 0.8,
    fontWeight: '600',
    marginBottom: 8,
  },
  qariList: { gap: 8 },
  qariBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 9,
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  qariBtnActive: {
    backgroundColor: 'rgba(90,122,90,0.2)',
    borderColor: 'rgba(90,122,90,0.4)',
  },
  qariBtnText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '500' },
  qariBtnTextActive: { color: COLORS.green },

  // AUTO-READ
  autoReadBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  autoReadLabel: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
    marginRight: SPACING.md,
  },
  langToggleBtn: {
    backgroundColor: '#2a2a2a', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 6, 
    borderWidth: 1, 
    borderColor: '#444'
  },
  langToggleText: {
    color: '#ccc', 
    fontSize: 10, 
    fontWeight: '600'
  },
  verseArea: { padding: SPACING.lg, gap: 18, paddingBottom: 40 },
  verseBox: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 28,
    paddingTop: 38,
    position: 'relative',
    marginTop: 10,
  },
  verseBadgeWrap: {
    position: 'absolute',
    top: -20,
    alignSelf: 'center',
    zIndex: 10,
  },
  verseBadge: {
    backgroundColor: '#1c1c1c',
    borderWidth: 1,
    borderColor: 'rgba(90,122,90,0.5)',
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  verseBadgeText: {
    color: '#e0e0e0',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  arabicText: {
    color: COLORS.text,
    fontSize: 26,
    lineHeight: 55,
    textAlign: 'right',
    writingDirection: 'rtl',
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  translationWrap: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.07)',
    marginTop: 16,
    paddingTop: 14,
  },
  translation: {
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // PROGRESS
  progressWrap: {
    height: 3,
    backgroundColor: '#2a2a2a',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.green,
    borderRadius: 3,
  },

  // DUB BUTTON
  dubBtn: {
    backgroundColor: '#1e2e1e',
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(90,122,90,0.35)',
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignSelf: 'center',
    alignItems: 'center',
  },
  dubBtnPlaying: {
    backgroundColor: '#162616',
    borderColor: 'rgba(143,190,143,0.5)',
  },
  dubBtnText: { color: COLORS.green, fontSize: 15, fontWeight: '700' },

  // SURAH FINISHED
  finishedBanner: {
    backgroundColor: 'rgba(90,122,90,0.12)',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(90,122,90,0.3)',
    padding: 22,
    alignItems: 'center',
    gap: 10,
  },
  finishedTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  finishedSub: {
    color: COLORS.textMuted,
    fontSize: 13,
    textAlign: 'center',
  },
  nextSurahBtn: {
    marginTop: 8,
    backgroundColor: COLORS.accentGreen,
    borderRadius: RADIUS.sm,
    paddingVertical: 13,
    paddingHorizontal: 28,
  },
  nextSurahBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },

  // PREV/NEXT NAV
  navRow: {
    flexDirection: 'row',
    gap: 14,
  },
  navAyahBtn: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 16,
    alignItems: 'center',
  },
  navAyahBtnDisabled: { opacity: 0.35 },
  navAyahText: { color: COLORS.text, fontSize: 14, fontWeight: '600' },

  // MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  closeBtn: {
    backgroundColor: '#2a2a2a',
    width: 28, height: 28,
    borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  closeBtnText: { color: COLORS.textMuted, fontSize: 14 },
  searchInput: {
    backgroundColor: '#161616',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    color: COLORS.text,
    fontSize: 14,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 12,
  },
  surahItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
    gap: 14,
  },
  surahNum: {
    width: 34, height: 34,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center', justifyContent: 'center',
  },
  surahNumText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600' },
  surahInfo: { flex: 1 },
  surahAr: {
    color: COLORS.text,
    fontSize: 17,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  surahEn: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  surahVerses: { color: COLORS.textMuted, fontSize: 11 },
});
