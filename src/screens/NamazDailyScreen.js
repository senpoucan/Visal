import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Platform } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { useLanguage } from '../hooks/LanguageContext';
import { useNamazTracker } from '../hooks/useNamazTracker';

export default function NamazDailyScreen({ navigation }) {
  const { language } = useLanguage();
  const { namazData, toggleNamaz } = useNamazTracker();

  const VAKIT_NAMAZLARI = [
    { key: 'sabah', labelTr: 'Sabah', labelEn: 'Fajr' },
    { key: 'ogle', labelTr: 'Öğle', labelEn: 'Dhuhr' },
    { key: 'ikindi', labelTr: 'İkindi', labelEn: 'Asr' },
    { key: 'aksam', labelTr: 'Akşam', labelEn: 'Maghrib' },
    { key: 'yatsi', labelTr: 'Yatsı', labelEn: 'Isha' },
  ];

  const NAFIL_NAMAZLARI = [
    { key: 'israk', labelTr: 'İşrak', labelEn: 'Ishraq' },
    { key: 'kusluk', labelTr: 'Kuşluk', labelEn: 'Duha' },
    { key: 'evvabin', labelTr: 'Evvabin', labelEn: 'Awwabin' },
    { key: 'teheccud', labelTr: 'Teheccüd', labelEn: 'Tahajjud' },
  ];

  const renderPrayerItem = (item, isFard) => {
    const category = isFard ? 'fard' : 'nafil';
    const isCompleted = namazData[category][item.key];
    
    return (
      <TouchableOpacity 
        key={item.key} 
        style={[styles.itemCard, isCompleted && styles.itemCardCompleted]} 
        onPress={() => toggleNamaz(category, item.key)}
        activeOpacity={0.7}
      >
        <Text style={[styles.itemText, isCompleted && styles.itemTextCompleted]}>
          {language === 'tr' ? item.labelTr : item.labelEn}
        </Text>
        <View style={[styles.checkbox, isCompleted && styles.checkboxChecked]}>
          {isCompleted && <Text style={styles.checkIcon}>✓</Text>}
        </View>
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
        <View style={styles.headerTitle}>
          <Text style={styles.title}>Namaz Daily</Text>
          <Text style={styles.subtitle}>{language === 'tr' ? 'Günlük Namaz Takibi' : 'Daily Prayer Tracker'}</Text>
        </View>
        <View style={{width: 36}} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        <View style={styles.infoBanner}>
          <Text style={styles.infoIcon}>💡</Text>
          <Text style={styles.infoText}>
            {language === 'tr' 
              ? 'Namazlarınız her gece saat 00:00\'da otomatik olarak sıfırlanır.' 
              : 'Your prayers will automatically reset every night at midnight.'}
          </Text>
        </View>

        {/* ── VAKIT NAMAZLARI ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{language === 'tr' ? 'Vakit Namazları' : 'Obligatory Prayers'}</Text>
          <View style={styles.list}>
            {VAKIT_NAMAZLARI.map(p => renderPrayerItem(p, true))}
          </View>
        </View>

        {/* ── NAFİLE NAMAZLAR ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{language === 'tr' ? 'Nafile Namazlar' : 'Voluntary Prayers'}</Text>
          <View style={styles.list}>
            {NAFIL_NAMAZLARI.map(p => renderPrayerItem(p, false))}
          </View>
        </View>
        
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { 
    flexDirection: 'row', alignItems: 'center', 
    paddingHorizontal: SPACING.lg, paddingVertical: 14, 
    borderBottomWidth: 1, borderBottomColor: COLORS.border, 
    paddingTop: Platform.OS === 'android' ? 40 : 10 
  },
  backBtn: { 
    width: 36, height: 36, backgroundColor: '#1e1e1e', 
    borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, 
    alignItems: 'center', justifyContent: 'center' 
  },
  backIcon: { color: COLORS.text, fontSize: 18 },
  headerTitle: { flex: 1, alignItems: 'center' },
  title: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  subtitle: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  
  scroll: { padding: SPACING.lg },
  
  infoBanner: {
    flexDirection: 'row', backgroundColor: 'rgba(52, 152, 219, 0.1)',
    borderRadius: RADIUS.md, padding: 12, marginBottom: 24,
    borderWidth: 1, borderColor: 'rgba(52, 152, 219, 0.3)', alignItems: 'center'
  },
  infoIcon: { fontSize: 16, marginRight: 8 },
  infoText: { color: '#3498db', fontSize: 12, flex: 1, fontWeight: '500' },

  section: { marginBottom: 30 },
  sectionTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700', marginBottom: 12, marginLeft: 4 },
  list: { gap: 10 },
  
  itemCard: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    backgroundColor: '#1E1E1E', padding: 16, borderRadius: RADIUS.md, 
    borderWidth: 1, borderColor: COLORS.border 
  },
  itemCardCompleted: { backgroundColor: 'rgba(90, 122, 90, 0.1)', borderColor: COLORS.green },
  itemText: { color: COLORS.text, fontSize: 15, fontWeight: '600' },
  itemTextCompleted: { color: COLORS.green, textDecorationLine: 'line-through' },
  
  checkbox: { 
    width: 24, height: 24, borderRadius: 12, borderWidth: 2, 
    borderColor: COLORS.textMuted, alignItems: 'center', justifyContent: 'center' 
  },
  checkboxChecked: { backgroundColor: COLORS.green, borderColor: COLORS.green },
  checkIcon: { color: '#000', fontSize: 14, fontWeight: '800' },
});
