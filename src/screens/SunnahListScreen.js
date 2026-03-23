import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, ScrollView, Animated, Dimensions, ActivityIndicator
} from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { useSunnahTracker } from '../hooks/useSunnahTracker';
import { useLanguage } from '../hooks/LanguageContext';

const { width } = Dimensions.get('window');

export default function SunnahListScreen({ navigation }) {
  const { history, loading, error, loadData, toggleTodaySunnah, resetHistory } = useSunnahTracker();
  const { language, toggleLanguage, t } = useLanguage();
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Toast Popup State
  const [popupVisible, setPopupVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const handleToggle = async (id, isToday) => {
    if (!isToday) return; // Cannot toggle past days
    
    const { success, justCompleted, allDoneNow } = await toggleTodaySunnah(id);
    if (!success) {
      alert(language === 'tr' ? "Gece 00:00'ı geçtiği için yeni görevler belirlendi!" : "Midnight passed! New tasks assigned!");
      return;
    }
    
    if (justCompleted && allDoneNow) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 8000); // Hide after animation finishes
    } else if (justCompleted) {
      showToast();
    }
  };

  const showToast = () => {
    setPopupVisible(true);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true })
    ]).start(() => {
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.timing(slideAnim, { toValue: 50, duration: 300, useNativeDriver: true })
        ]).start(() => setPopupVisible(false));
      }, 2000);
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.green} />
          <Text style={{ color: COLORS.textMuted, marginTop: 12 }}>
            {language === 'tr' ? 'Yükleniyor...' : 'Loading...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{language === 'tr' ? 'Hata' : 'Error'}</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ color: '#ff5252', marginBottom: 16, textAlign: 'center', lineHeight: 22 }}>
            {language === 'tr' ? 'Veri yüklenirken bir hata oluştu:\n' : 'An error occurred while loading data:\n'}{error}
          </Text>
          <TouchableOpacity style={styles.resetBtn} onPress={loadData}>
            <Text style={styles.resetText}>{language === 'tr' ? 'Tekrar Dene ↻' : 'Retry ↻'}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!history || history.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{language === 'tr' ? 'Günlük Sünnetler' : 'Daily Sunnahs'}</Text>
          <View style={styles.headerRight}>
             <TouchableOpacity style={styles.langBtn} onPress={toggleLanguage}>
               <Text style={styles.langBtnText}>{language === 'tr' ? '🇹🇷 TR' : '🇬🇧 EN'}</Text>
             </TouchableOpacity>
          </View>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ color: COLORS.textMuted, marginBottom: 16, textAlign: 'center', lineHeight: 22 }}>
            {language === 'tr' ? 'Sünnet listeniz boş veya oluşturulurken bir sorun yaşandı.' : 'Your sunnah list is empty or there was an issue creating it.'}
          </Text>
          <TouchableOpacity style={styles.resetBtn} onPress={loadData}>
            <Text style={styles.resetText}>{language === 'tr' ? 'Yeniden Yükle ↻' : 'Reload ↻'}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const todayItem = history.length > 0 ? history[history.length - 1] : null;
  const pastItems = history.length > 1 ? history.slice(0, history.length - 1).reverse() : [];
  const isAllDone = todayItem && todayItem.items.every(i => i.done);

  const renderTask = (item, isToday) => {
    const isDone = item.done;
    const taskText = item[language] || item.text || item.tr; // Fallback for old history items
    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.taskRow, isDone && styles.taskRowDone]}
        onPress={() => handleToggle(item.id, isToday)}
        activeOpacity={isToday ? 0.7 : 1}
      >
        <View style={[styles.checkbox, isDone && styles.checkboxDone]}>
          {isDone && <Text style={styles.checkIcon}>✓</Text>}
        </View>
        <Text style={[styles.taskText, isDone && styles.taskTextDone]}>
          {taskText}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{language === 'tr' ? 'Günlük Sünnetler' : 'Daily Sunnahs'}</Text>
        
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.langBtn} 
            onPress={toggleLanguage}
            activeOpacity={0.7}
          >
            <Text style={styles.langBtnText}>{language === 'tr' ? '🇹🇷 TR' : '🇬🇧 EN'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.resetBtn} onPress={resetHistory} activeOpacity={0.7}>
            <Text style={styles.resetText}>{language === 'tr' ? 'Sıfırla ↻' : 'Reset ↻'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* TODAY */}
        {todayItem && (
          <View style={styles.daySection}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayTitle}>🌟 {language === 'tr' ? "Bugünün Görevleri" : "Today's Sunnahs"}</Text>
              <Text style={styles.dayProgress}>
                {todayItem.items.filter(i => i.done).length} / {todayItem.items.length}
              </Text>
            </View>
            <View style={styles.taskList}>
              {todayItem.items.map(item => renderTask(item, true))}
            </View>
            
            {/* ALL DONE BOX */}
            {todayItem.items.every(i => i.done) && (
              <View style={styles.allDoneBox}>
                <Text style={styles.allDoneText}>
                  {language === 'tr' 
                    ? '🎉 Mükemmelsin! Bugünkü verilen tüm sünnetleri yerine getirdin! 🌟' 
                    : '🎉 Excellent! You have fulfilled all the sunnahs given for today! 🌟'}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* PAST DAYS */}
        {pastItems.length > 0 && (
          <View style={styles.pastSection}>
            <Text style={styles.pastHeaderTitle}>{language === 'tr' ? "Geçmiş Günler" : "Past Days"}</Text>
            {pastItems.map(day => (
              <View key={day.date} style={[styles.daySection, styles.pastDaySection]}>
                <View style={styles.dayHeader}>
                  <Text style={styles.dayTitleMuted}>📅 {day.date}</Text>
                  <Text style={styles.dayProgressMuted}>
                    {day.items.filter(i => i.done).length} / {day.items.length}
                  </Text>
                </View>
                <View style={styles.taskList}>
                  {day.items.map(item => renderTask(item, false))}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* POPUP TOAST */}
      {popupVisible && (
        <Animated.View style={[
          styles.toast, 
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}>
          <Text style={styles.toastText}>
            {language === 'tr' ? '✨ MashaAllah ! Böyle devam :) 🪴' : '✨ MashaAllah ! Keep it up :) 🪴'}
          </Text>
        </Animated.View>
      )}

      {/* CONFETTI FIREWORKS */}
      {showConfetti && (
        <ConfettiCannon
          count={200}
          origin={{x: width / 2, y: -20}}
          fallSpeed={3000}
          fadeOut={true}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { padding: SPACING.xs },
  backIcon: { color: COLORS.text, fontSize: 24, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langBtn: {
    backgroundColor: COLORS.bgCard,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  langBtnText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '700' },
  resetBtn: {
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
  },
  resetText: { color: '#ff6b6b', fontSize: 13, fontWeight: '600' },

  scroll: { padding: SPACING.lg, paddingBottom: 100, gap: 24 },

  daySection: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
  },
  pastDaySection: { opacity: 0.6 },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  dayTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  dayProgress: { color: COLORS.green, fontSize: 14, fontWeight: '700' },
  dayTitleMuted: { color: COLORS.textMuted, fontSize: 15, fontWeight: '600' },
  dayProgressMuted: { color: COLORS.textMuted, fontSize: 14, fontWeight: '600' },

  taskList: { gap: 10 },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: RADIUS.sm,
    gap: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  taskRowDone: {
    backgroundColor: 'rgba(255,255,255,0.01)',
  },
  checkbox: {
    width: 24, height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#555',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: COLORS.green,
    borderColor: COLORS.green,
  },
  checkIcon: { color: '#000', fontSize: 14, fontWeight: '800' },
  taskText: {
    flex: 1,
    color: '#e0e0e0',
    fontSize: 14,
    lineHeight: 20,
  },
  taskTextDone: {
    color: '#666',
    textDecorationLine: 'line-through',
  },

  pastSection: { gap: 16 },
  pastHeaderTitle: { color: COLORS.textMuted, fontSize: 13, fontWeight: '700', letterSpacing: 1 },

  allDoneBox: {
    marginTop: SPACING.md,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.4)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  allDoneText: {
    color: '#81c784',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 20,
  },

  toast: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: '#2e7d32',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  toastText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
