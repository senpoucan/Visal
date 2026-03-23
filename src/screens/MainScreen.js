import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, ScrollView, Dimensions, Image, Modal,
  TextInput, ActivityIndicator, FlatList, Linking, Platform,
  Animated, Easing
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useStatsContext } from '../hooks/StatsContext';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/LanguageContext';
import { useStreak } from '../hooks/useStreak';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { getPrayerTimes, getCoordinates, getNearbyMosques } from '../services/locationApi';
import { CITIES } from '../constants/turkeyData';

const { width, height } = Dimensions.get('window');
const scale = width / 375;
const normalize = (size) => {
  const newSize = size * scale;
  if (Platform.OS === 'web') return Math.min(newSize, size * 1.2);
  return Math.round(newSize);
};

const NAV_BUTTONS = [
  { id: 'QuranReader', label: 'Read Quran',    icon: '📖' },
  { id: 'NamazDaily',  label: 'Namaz Daily',   icon: '🕌' },
  { id: 'SunnahList',  label: 'Sunnah List',   icon: '📜' },
  { id: 'Companions',  label: 'Companions',    icon: '🌙' },
  { id: 'QuranicGems', label: 'Quranic Gems',  icon: '✨' },
  { id: 'EsmaUlHusna', label: 'Esma-ül Hüsna', icon: '📿' },
];

export default function MainScreen({ navigation }) {
  const { user, logout, updateUserPfp } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const stats = useStatsContext();
  const { streak, getStreakColor, getRankInfo } = useStreak();
  const rankInfo = getRankInfo(streak.count);

  // Rotating border animation for streak badge
  const streakSpin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(streakSpin, {
        toValue: 1,
        duration: 2400,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);
  const streakRotate = streakSpin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const [activeTab, setActiveTab] = useState('daily');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [showModeModal, setShowModeModal] = useState(false);
  const [selectedMode, setSelectedMode] = useState(null);

  // ── LOCATION & PRAYER STATES ──
  const [userLocation, setUserLocation] = useState({ city: '', district: '' });
  const [prayerTimes, setPrayerTimes] = useState(null);

  const [showLocModal, setShowLocModal] = useState(false);
  const [locStep, setLocStep] = useState('city'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingAction, setPendingAction] = useState(null);
  const [isLocLoading, setIsLocLoading] = useState(false);
  
  const [now, setNow] = useState(new Date());

  // ── TICKER ENGINE ──
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ── LOAD SAVED LOCATION ──
  useEffect(() => {
    const loadLocation = async () => {
      try {
        const saved = await AsyncStorage.getItem('userEzanLocation');
        if (saved) {
          const loc = JSON.parse(saved);
          setUserLocation(loc);
          executeAction(loc.city, loc.district);
        }
      } catch (e) {
        console.error('Error loading location', e);
      }
    };
    loadLocation();
  }, []);

  // Compute next prayer based on current 'now' state
  const nextPrayer = React.useMemo(() => {
    if (!prayerTimes) return null;
    
    try {
      const prs = [
        { key: 'Fajr', labelTr: 'Sabah', labelEn: 'Fajr' },
        { key: 'Sunrise', labelTr: 'Güneş', labelEn: 'Sunrise' },
        { key: 'Dhuhr', labelTr: 'Öğle', labelEn: 'Dhuhr' },
        { key: 'Asr', labelTr: 'İkindi', labelEn: 'Asr' },
        { key: 'Maghrib', labelTr: 'Akşam', labelEn: 'Maghrib' },
        { key: 'Isha', labelTr: 'Yatsı', labelEn: 'Isha' }
      ];

      let next = null;
      for (let p of prs) {
        const timeVal = prayerTimes[p.key];
        if (!timeVal || typeof timeVal !== 'string') continue;

        const match = timeVal.match(/(\d{2}):(\d{2})/);
        if(!match) continue;

        const [_, h, m] = match;
        const ptDate = new Date(now);
        ptDate.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);

        if (ptDate > now) {
          next = { ...p, date: ptDate };
          break;
        }
      }

      // Tomorrow Fajr fallback
      if (!next && prayerTimes['Fajr']) {
        const match = prayerTimes['Fajr'].match(/(\d{2}):(\d{2})/);
        if(match) {
          const [_, h, m] = match;
          const ptDate = new Date(now);
          ptDate.setDate(ptDate.getDate() + 1);
          ptDate.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
          next = { labelTr: 'Sabah (Yarın)', labelEn: 'Fajr (Tomorrow)', date: ptDate };
        }
      }

      if (next && next.date) {
        const diffMs = next.date - now;
        const totalSecs = Math.max(0, Math.floor(diffMs / 1000));
        const hrs = Math.floor(totalSecs / 3600);
        const mins = Math.floor((totalSecs % 3600) / 60);
        const secs = totalSecs % 60;
        
        return {
          label: language === 'tr' ? next.labelTr : next.labelEn,
          timeStr: `${hrs.toString().padStart(2,'0')}:${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`
        };
      }
    } catch (e) { console.error("Timer error:", e); }
    return null;
  }, [prayerTimes, now, language]);

  // Profile hook
  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      updateUserPfp(result.assets[0].uri);
    }
  };

  // Safe Stats context
  const currentStats = stats[activeTab] || { verses: 0, pages: 0, formattedTime: '0m', formattedHasanat: '0' };
  const { verses, pages, formattedTime, formattedHasanat } = currentStats;



  const handleLocationAction = (actionType) => {
    setPendingAction(actionType);
    if (!userLocation.city || !userLocation.district) {
      setLocStep('city');
      setSearchQuery('');
      setShowLocModal(true);
    } else {
      executeAction(userLocation.city, userLocation.district, actionType);
    }
  };

  const executeAction = async (city, district) => {
    // 1. Fetch Prayer Times (Always update when location changes)
    const times = await getPrayerTimes(city, district);
    if (times) setPrayerTimes(times);
  };

  const selectCity = (cityName) => {
    setUserLocation(prev => ({ ...prev, city: cityName, district: '' }));
    setLocStep('district');
    setSearchQuery('');
  };

  const selectDistrict = (distName) => {
    const cityName = userLocation.city;
    const newLoc = { city: cityName, district: distName };
    setUserLocation(newLoc);
    setShowLocModal(false);
    AsyncStorage.setItem('userEzanLocation', JSON.stringify(newLoc)).catch(e => console.error(e));
    executeAction(cityName, distName, pendingAction);
  };

  const filteredItems = React.useMemo(() => {
    if (locStep === 'city') {
      return CITIES.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
    } else {
      const cityObj = CITIES.find(c => c.name === userLocation.city);
      if (!cityObj) return [];
      return cityObj.districts
        .filter(d => d.toLowerCase().includes(searchQuery.toLowerCase()))
        .map(d => ({ name: d }));
    }
  }, [locStep, searchQuery, userLocation.city]);

  const openGoogleMaps = (lat, lon) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
    Linking.openURL(url).catch(() => alert('Harita açılamadı.'));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* ── HEADER ── */}
        <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? normalize(40) : (Platform.OS === 'web' ? 20 : normalize(25)) }]}>
          <View style={styles.headerLeft}>
            <Image 
              source={{ 
                uri: user?.photoURL || (user?.gender === 'female' 
                  ? `https://api.dicebear.com/7.x/avataaars/png?seed=${user?.uid || 'f'}&clothing=hijab&backgroundColor=ffdfbf`
                  : `https://api.dicebear.com/7.x/avataaars/png?seed=${user?.uid || 'm'}&hair=shortHairShortFlat&facialHair=beardLight&backgroundColor=c0aede`)
              }}
              style={styles.avatar}
            />
            <View style={styles.headerTextCol}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <Text style={[styles.greeting, { marginRight: 6 }]}>
                  {language === 'tr' ? 'Selamun Aleyküm!' : 'Assalamu Alaikum!'}
                </Text>
                <Text style={styles.greetingName} adjustsFontSizeToFit numberOfLines={1}>
                  {user?.displayName || (language === 'tr' ? 'Yolcu' : 'Traveler')}
                </Text>
              </View>
              {user && (
                <View style={{ flexDirection: 'row', marginTop: 2 }}>
                  <TouchableOpacity onPress={() => setShowLogoutModal(true)} style={styles.logoutBtn} activeOpacity={0.7}>
                     <Text style={styles.logoutBtnText}>{language === 'tr' ? 'ÇIKIŞ' : 'LOGOUT'}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <TouchableOpacity style={styles.langToggle} onPress={toggleLanguage} activeOpacity={0.7}>
              <Text style={styles.langToggleText}>{language === 'tr' ? 'TR' : 'EN'}</Text>
            </TouchableOpacity>
            {/* Streak badge with animated rotating border */}
            <View style={{ alignItems: 'center', justifyContent: 'center', width: 52, height: 52 }}>
              {/* Spinning border ring */}
              <Animated.View style={[
                styles.streakRing,
                { borderColor: rankInfo.border, transform: [{ rotate: streakRotate }] }
              ]} />
              {/* Badge button */}
              <TouchableOpacity
                style={[styles.streakBtn, { backgroundColor: rankInfo.color, position: 'absolute' }]}
                onPress={() => setShowStreakModal(true)}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 9, fontWeight: '800', color: rankInfo.textColor, letterSpacing: 0.4 }}>
                  🔥 {streak.count}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── NAV BUTTONS ── */}
        <View style={styles.navGrid}>
          {NAV_BUTTONS.map(btn => {
            const labelKey = btn.id === 'QuranReader' ? 'startReading' : 
                             btn.id === 'NamazDaily' ? 'namazDaily' :
                             btn.id === 'SunnahList' ? 'dailySunnah' : 
                             btn.id === 'Companions' ? 'companions' : 
                             btn.id === 'EsmaUlHusna' ? 'esmaUlHusna' : 'quranicGems';
            return (
              <TouchableOpacity
                key={btn.id}
                style={styles.navBtn}
                activeOpacity={0.75}
                onPress={() => {
                  if (btn.id === 'QuranReader') { setSelectedMode(null); setShowModeModal(true); }
                  else navigation.navigate(btn.id);
                }}
              >
                <Text style={styles.navBtnIcon}>{btn.icon}</Text>
                <Text style={styles.navBtnLabel}>{t(labelKey)}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── GUIDE BOX ── */}
        <TouchableOpacity
          style={styles.guideBox}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Guide')}
        >
          <View style={styles.guideIconContainer}>
            <Text style={styles.guideIcon}>🧭</Text>
          </View>
          <View style={styles.guideTextContainer}>
            <Text style={styles.guideTitle}>{t('guide')}</Text>
            <Text style={styles.guideSub}>{t('guideDesc')}</Text>
          </View>
          <Text style={styles.guideArrow}>❯</Text>
        </TouchableOpacity>

        {/* ── DIVIDER ── */}
        <View style={styles.divider}>
           <View style={styles.dividerLine} />
           <Text style={styles.dividerIcon}>◆</Text>
           <View style={styles.dividerLine} />
        </View>

        {/* ── TIME FILTER TABS ── */}
        <View style={styles.timeFilterContainer}>
          {[{ id: 'daily', label: t('daily').toUpperCase() }, { id: 'monthly', label: t('monthly').toUpperCase() }, { id: 'allTime', label: t('allTime').toUpperCase() }].map(f => (
            <TouchableOpacity key={f.id} style={[styles.filterBtn, activeTab === f.id && styles.filterBtnActive]} onPress={() => setActiveTab(f.id)} activeOpacity={0.7}>
              <Text style={[styles.filterBtnText, activeTab === f.id && styles.filterBtnTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── STATS ── */}
        <View style={styles.statsRow}>
          <StatBox label={t('verses')}  value={String(verses)}        color={COLORS.textVerse}   />
          <StatBox label={t('pages')}   value={String(pages)}         color={COLORS.textPage}    />
          <StatBox label={t('time')}    value={formattedTime}         color={COLORS.textTime}    />
          <StatBox label={t('hasanat')} value={formattedHasanat}      color={COLORS.textHasanat} />
        </View>

        {/* ── LOCATION SERVICES BARS ── */}
        <View style={styles.locActionsContainer}>
          <TouchableOpacity style={[styles.locActionBtn, { flex: 1 }]} onPress={() => handleLocationAction('prayerTimes')} activeOpacity={0.8}>
            <View style={styles.locActionIconBox}><Text style={styles.locActionIcon}>🕌</Text></View>
            <View>
              <Text style={{color: COLORS.text, fontSize: 13, fontWeight: '700', letterSpacing:-0.2}}>
                {language === 'tr' ? 'Ezan Vakitleri' : 'Prayer Times'}
              </Text>
              <Text style={{color: COLORS.textMuted, fontSize: 10, marginTop: 2}}>
                {prayerTimes ? (userLocation.district || userLocation.city) : (language === 'tr' ? 'Konum Seç' : 'Select Location')}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── LIVE COUNTDOWN CLOCK ── */}
        {prayerTimes && nextPrayer && (
          <View style={styles.countdownBox}>
            <Text style={styles.countdownTitle}>
              {language === 'tr' 
                ? `${userLocation.district}, ${userLocation.city} için Sıradaki Ezan:` 
                : `Next prayer in ${userLocation.district}, ${userLocation.city}:`}
            </Text>
            <View style={styles.countdownRow}>
              <Text style={styles.countdownLabel}>{nextPrayer.label}</Text>
              <Text style={styles.countdownTimer}>{nextPrayer.timeStr}</Text>
            </View>
            <TouchableOpacity onPress={() => { setLocStep('city'); setSearchQuery(''); setShowLocModal(true); }} style={styles.changeLocBtn}>
              <Text style={styles.changeLocText}>{language === 'tr' ? "Konumu Değiştir" : "Change Location"}</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>

      {/* ── MODALS (Logout, Streak, Mode) ── */}
      <Modal visible={showLogoutModal} transparent animationType="fade" onRequestClose={() => setShowLogoutModal(false)}>
        <View style={styles.modalOverlayCenter}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{t('logout')}</Text>
            <Text style={styles.modalText}>
              {language === 'tr' 
                ? (user?.isAnonymous 
                    ? '⚠️ Misafir oturumundan çıkış yaparsanız verileriniz KAYBOLACAKTIR. Emin misiniz?' 
                    : 'Hesabınızdan çıkış yapmak istediğinize emin misiniz?')
                : (user?.isAnonymous
                    ? '⚠️ Logging out of a guest session will PERMANENTLY LOSE your data. Are you sure?'
                    : 'Are you sure you want to logout?')}
            </Text>
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setShowLogoutModal(false)} activeOpacity={0.7}><Text style={styles.modalBtnCancelText}>{t('cancel')}</Text></TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnConfirm} onPress={async () => { setShowLogoutModal(false); await logout(); }} activeOpacity={0.7}><Text style={styles.modalBtnConfirmText}>{t('confirm')}</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showStreakModal} transparent animationType="fade" onRequestClose={() => setShowStreakModal(false)}>
        <TouchableOpacity style={styles.modalOverlayCenter} activeOpacity={1} onPress={() => setShowStreakModal(false)}>
          <View style={styles.modalBoxLarger}>
            <Text style={styles.modalTitle}>{t('streak')} Ranks</Text>
            <Text style={styles.modalText}>{language === 'tr' ? 'Bir gün aksatmanız durumunda seriniz bozulmaz (Tolerans hakkı).' : 'Your streak won\'t break if you miss one day (Grace day period).'}</Text>
            
            <View style={styles.streakTier}><View style={[styles.streakDot, {backgroundColor: '#264a26'}]} /><Text style={styles.streakTierText}>1 - 10 {language === 'tr' ? 'Gün' : 'Days'}: {t('tohum')}</Text></View>
            <View style={styles.streakTier}><View style={[styles.streakDot, {backgroundColor: '#FFA500'}]} /><Text style={styles.streakTierText}>11 - 25 {language === 'tr' ? 'Gün' : 'Days'}: {t('fidan')}</Text></View>
            <View style={styles.streakTier}><View style={[styles.streakDot, {backgroundColor: '#FF4500'}]} /><Text style={styles.streakTierText}>26 - 50 {language === 'tr' ? 'Gün' : 'Days'}: {t('agac')}</Text></View>
            <View style={styles.streakTier}><View style={[styles.streakDot, {backgroundColor: '#FFD700'}]} /><Text style={styles.streakTierText}>51 - 99 {language === 'tr' ? 'Gün' : 'Days'}: {t('orman')}</Text></View>
            <View style={styles.streakTier}>
              <View style={[styles.streakDot, {backgroundColor: '#000', borderWidth: 1, borderColor:'#444', shadowColor: '#fff', shadowOpacity: 0.8, shadowRadius: 5, elevation: 5}]} />
              <Text style={styles.streakTierText}>100+ {language === 'tr' ? 'Gün' : 'Days'}: {t('cennetBahcesi')}</Text>
            </View>
            <TouchableOpacity style={styles.modalBtnClose} onPress={() => setShowStreakModal(false)} activeOpacity={0.8}><Text style={styles.modalBtnCloseText}>OK</Text></TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={showModeModal} transparent animationType="fade" onRequestClose={() => setShowModeModal(false)}>
         <View style={styles.modalOverlayCenter}>
           <View style={styles.modalBoxLarger}>
             <Text style={styles.modalTitle}>{language === 'tr' ? 'Okuma Modu' : 'Reading Mode'}</Text>
             <Text style={styles.modalText}>{language === 'tr' ? 'Kur\'an-ı Kerim okuma biçimini seçiniz.' : 'Choose a reading mode for the Holy Quran.'}</Text>
             <View style={{ gap: 14, marginBottom: 24 }}>
               <TouchableOpacity style={selectedMode === 'mushaf' ? styles.modeBtn : styles.modeBtnOutline} onPress={() => setSelectedMode('mushaf')} activeOpacity={0.7}>
                 <Text style={styles.modeBtnIcon}>📖</Text>
                 <View style={{ flex: 1 }}><Text style={styles.modeBtnTitle}>{language === 'tr' ? 'Mushaf Modu' : 'Mushaf Mode'}</Text><Text style={styles.modeBtnSub}>{language === 'tr' ? 'Sayfa sayfa, sade kitap okuma deneyimi' : 'Page by page, pure book reading experience'}</Text></View>
               </TouchableOpacity>
               <TouchableOpacity style={selectedMode === 'ayah' ? styles.modeBtn : styles.modeBtnOutline} onPress={() => setSelectedMode('ayah')} activeOpacity={0.7}>
                 <Text style={styles.modeBtnIcon}>🎧</Text>
                 <View style={{ flex: 1 }}><Text style={styles.modeBtnTitle}>{language === 'tr' ? 'Ayet Modu' : 'Ayah Mode'}</Text><Text style={styles.modeBtnSub}>{language === 'tr' ? 'Ayet ayet interaktif ve detaylı okuma' : 'Interactive verse by verse detailed view'}</Text></View>
               </TouchableOpacity>
             </View>
             <View style={styles.modalBtnRow}>
               <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setShowModeModal(false)} activeOpacity={0.8}><Text style={styles.modalBtnCancelText}>{t('cancel')}</Text></TouchableOpacity>
               <TouchableOpacity style={[styles.modalBtnConfirm, { backgroundColor: selectedMode ? COLORS.green : '#333' }]} disabled={!selectedMode} onPress={() => { setShowModeModal(false); navigation.navigate(selectedMode === 'mushaf' ? 'MushafReader' : 'QuranReader'); }} activeOpacity={0.8}><Text style={[styles.modalBtnConfirmText, { color: selectedMode ? '#000' : '#888' }]}>{language === 'tr' ? 'Okuma Başla' : 'Start Reading'}</Text></TouchableOpacity>
             </View>
           </View>
         </View>
      </Modal>

      {/* ── LOCATION SELECTOR MODAL (Searchable List) ── */}
      <Modal visible={showLocModal} transparent animationType="slide">
        <View style={[styles.modalOverlayCenter, { padding: 0 }]}>
          <SafeAreaView style={styles.locModalContainer}>
            <View style={styles.locModalHeader}>
              <TouchableOpacity onPress={() => setShowLocModal(false)}><Text style={{color: '#fff', fontSize: 18}}>✕</Text></TouchableOpacity>
              <Text style={styles.locModalTitle}>
                {locStep === 'city' 
                  ? (language === 'tr' ? 'İl Seçiniz' : 'Select City')
                  : (language === 'tr' ? `${userLocation.city} / İlçe Seçiniz` : `${userLocation.city} / Select District`)
                }
              </Text>
              <View style={{width: 20}} />
            </View>
            
            <View style={styles.searchBarContainer}>
               <TextInput 
                 style={styles.searchBar}
                 placeholder={language === 'tr' ? 'Ara...' : 'Search...'}
                 placeholderTextColor="#666"
                 value={searchQuery}
                 onChangeText={setSearchQuery}
                 autoFocus
               />
            </View>

            <FlatList
              data={filteredItems}
              keyExtractor={(item) => item.name}
              initialNumToRender={20}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.locSelectItem} 
                  onPress={() => locStep === 'city' ? selectCity(item.name) : selectDistrict(item.name)}
                >
                  <Text style={styles.locSelectItemText}>{item.name}</Text>
                  <Text style={{color: '#444'}}>❯</Text>
                </TouchableOpacity>
              )}
            />
          </SafeAreaView>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

// ── Sub-components ──
function NavButton({ icon, label, onPress }) {
  return (
    <TouchableOpacity style={styles.navBtn} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.navBtnIcon}>{icon}</Text>
      <Text style={styles.navBtnLabel} adjustsFontSizeToFit numberOfLines={1}>{label}</Text>
    </TouchableOpacity>
  );
}

function StatBox({ label, value, color }) {
  return (
    <View style={styles.statBox}>
      <Text style={[styles.statLabel, { color }]} adjustsFontSizeToFit numberOfLines={1}>{label.toUpperCase()}</Text>
      <Text style={styles.statValue} adjustsFontSizeToFit numberOfLines={1}>{value}</Text>
    </View>
  );
}

// ── Styles ──
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { paddingBottom: 40, paddingTop: 30 },

  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: SPACING.lg, 
    paddingBottom: 10 
  },
  headerLeft: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flex: 1,
    marginRight: 8,
    marginLeft: 10
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 10,
    backgroundColor: '#1E1E1E'
  },
  headerTextCol: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    flex: 1
  },
  greeting: { 
    color: COLORS.textMuted, 
    fontSize: 12, 
    fontWeight: '600' 
  },
  greetingName: { 
    color: COLORS.text, 
    fontSize: 12, 
    fontWeight: '800' 
  },
  logoutBtn: {
    marginTop: 2,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,50,50,0.12)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  logoutBtnText: {
    color: '#ff5252',
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  greetingSub: { color: COLORS.textMuted, fontSize: 11, marginTop: 2 },
  
  streakBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakRing: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2.5,
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  langToggle: { backgroundColor: '#2a2a2a', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#444' },
  langToggleText: { color: '#ccc', fontSize: 10, fontWeight: '600' },

  navGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    marginTop: 8,
  },
  navBtn: {
    width: '48.5%',
    marginBottom: 10,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  navBtnIcon: { fontSize: 18 },
  navBtnLabel: { color: COLORS.text, fontSize: 11, fontWeight: '600', letterSpacing: -0.2, textAlign: 'center' },

  guideBox: {
    marginHorizontal: SPACING.lg,
    marginTop: 14,
    backgroundColor: '#1E2B1E',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(92, 184, 92, 0.4)',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  guideIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(92, 184, 92, 0.15)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  guideIcon: { fontSize: 22 },
  guideTextContainer: { flex: 1 },
  guideTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
  guideSub: { color: COLORS.green, fontSize: 11, marginTop: 2, fontWeight: '600' },
  guideArrow: { color: 'rgba(255,255,255,0.3)', fontSize: 16, fontWeight: '700' },

  divider: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.lg, marginVertical: 14, gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
  dividerIcon: { color: 'rgba(255,255,255,0.18)', fontSize: 12 },

  timeFilterContainer: { flexDirection: 'row', paddingHorizontal: SPACING.lg, marginBottom: 12, gap: 8 },
  filterBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md },
  filterBtnActive: { borderColor: 'rgba(76, 175, 80, 0.4)', backgroundColor: 'rgba(76, 175, 80, 0.1)' },
  filterBtnText: { color: COLORS.textMuted, fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  filterBtnTextActive: { color: '#81c784' },

  statsRow: { flexDirection: 'row', paddingHorizontal: SPACING.lg, gap: 6 },
  statBox: { flex: 1, backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.sm, paddingVertical: 10, alignItems: 'center', gap: 2 },
  statLabel: { fontSize: 7, fontWeight: '600', letterSpacing: 0.8 },
  statValue: { color: COLORS.text, fontSize: 12, fontWeight: '700', letterSpacing: -0.5 },

  // LOCATION WIDGETS
  locActionsContainer: { flexDirection: 'row', paddingHorizontal: SPACING.lg, gap: 14, marginTop: 24 },
  locActionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: 'rgba(92, 184, 92, 0.3)', borderRadius: RADIUS.md, paddingVertical: 14, paddingHorizontal: 12, gap: 10 },
  locActionIconBox: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.05)', alignItems:'center', justifyContent:'center' },
  locActionIcon: { fontSize: 16 },
  locActionLabel: { color: '#e0e0e0', fontSize: 14, fontWeight: '700' },
  
  countdownBox: { marginHorizontal: SPACING.lg, marginTop: 14, backgroundColor: '#1A1A1A', borderRadius: RADIUS.md, borderWidth: 1, borderColor: 'rgba(92, 184, 92, 0.4)', padding: 16, alignItems: 'center' },
  countdownTitle: { color: COLORS.textMuted, fontSize: normalize(12), marginBottom: 8, fontWeight: '600', textAlign: 'center' },
  countdownRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  countdownLabel: { color: COLORS.green, fontSize: normalize(20), fontWeight: '800' },
  countdownTimer: { color: '#fff', fontSize: normalize(28), fontWeight: '900', fontVariant: ['tabular-nums'] },
  changeLocBtn: { paddingVertical: 4, paddingHorizontal: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20 },
  changeLocText: { color: '#999', fontSize: 10, fontWeight: '600' },

  // BACK BTN
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#1e1e1e', borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  backIcon: { color: COLORS.text, fontSize: 18 },
  headerTitleContainer: { alignItems: 'center' },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  headerSub: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },

  // MODAL SHARED
  modalOverlayCenter: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: SPACING.lg },
  modalBox: { width: '100%', backgroundColor: '#1e1e1e', borderRadius: RADIUS.lg, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  modalBoxLarger: { width: '100%', backgroundColor: '#1e1e1e', borderRadius: RADIUS.lg, padding: 24, paddingVertical: 32, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  modalTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700', marginBottom: 10, textAlign: 'center' },
  modalText: { color: COLORS.textMuted, fontSize: 14, lineHeight: 22, textAlign: 'center', marginBottom: 24 },
  modalBtnRow: { flexDirection: 'row', gap: 12 },
  modalBtnCancel: { flex: 1, backgroundColor: '#2a2a2a', paddingVertical: 14, borderRadius: RADIUS.md, alignItems: 'center' },
  modalBtnCancelText: { color: COLORS.text, fontWeight: '600' },
  modalBtnConfirm: { flex: 1, backgroundColor: COLORS.red || '#e53935', paddingVertical: 14, borderRadius: RADIUS.md, alignItems: 'center' },
  modalBtnConfirmText: { color: '#fff', fontWeight: '700' },
  modalBtnClose: { backgroundColor: COLORS.green, paddingVertical: 14, borderRadius: RADIUS.md, alignItems: 'center', marginTop: 24 },
  modalBtnCloseText: { color: '#000', fontWeight: '700', fontSize: 16 },

  locInput: { backgroundColor: '#111', color: '#fff', borderRadius: RADIUS.sm, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },

  // MOSQUE CARD
  mosqueCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e1e1e', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: RADIUS.md, padding: 18, marginBottom: 14 },
  mosqueName: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 6 },
  mosqueDist: { color: COLORS.green, fontSize: 13, fontWeight: '600' },
  mosqueMapBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },

  streakTier: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', paddingVertical: 10, paddingHorizontal: 16, borderRadius: RADIUS.sm, marginBottom: 8, gap: 12 },
  streakDot: { width: 20, height: 20, borderRadius: 10 },
  streakTierText: { color: COLORS.text, fontSize: 13, fontWeight: '500' },

  logoutBtn: { backgroundColor: '#2a2a2a', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#444' },
  logoutBtnText: { color: '#ccc', fontSize: 10, fontWeight: '600' },

  modeBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(90,122,90,0.85)', padding: 16, borderRadius: RADIUS.md, gap: 16 },
  modeBtnOutline: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', padding: 16, borderRadius: RADIUS.md, gap: 16 },
  modeBtnIcon: { fontSize: 32 },
  modeBtnTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  modeBtnSub: { color: COLORS.textMuted, fontSize: 12, marginTop: 4, lineHeight: 16 },

  // LOCATION SELECTOR MODAL STYLES
  locModalContainer: { flex: 1, backgroundColor: '#0A0A0A', width: '100%' },
  locModalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#222' },
  locModalTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  searchBarContainer: { padding: 15, backgroundColor: '#111' },
  searchBar: { backgroundColor: '#1e1e1e', color: '#fff', borderRadius: 10, paddingHorizontal: 15, paddingVertical: 12, fontSize: 15, borderWidth: 1, borderColor: '#333' },
  locSelectItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#111' },
  locSelectItemText: { color: '#eee', fontSize: 16, fontWeight: '500' },
});
