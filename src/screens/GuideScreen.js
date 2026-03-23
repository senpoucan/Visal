import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { useLanguage } from '../hooks/LanguageContext';
import { COLORS, SPACING, RADIUS } from '../constants/theme';

export default function GuideScreen({ navigation }) {
  const { language, t } = useLanguage();

  return (
    <SafeAreaView style={styles.safe}>
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 60 : 45 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.backIcon}>❮</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('guide')}</Text>
        <View style={styles.backBtnPlaceholder} />
      </View>

      <View style={styles.container}>
        <Text style={styles.description}>
          {language === 'tr' 
            ? 'Aşağıdaki bölümlerden ibaretlerle ilgili detaylı rehberlere ulaşabilirsiniz.' 
            : 'You can access detailed guides for worship from the sections below.'}
        </Text>

        <TouchableOpacity 
          style={styles.card} 
          activeOpacity={0.8}
          onPress={() => navigation.navigate('PrayerGuide')}
        >
          <View style={styles.cardIconBox}>
            <Text style={styles.cardIcon}>🕌</Text>
          </View>
          <View style={styles.cardTextBox}>
            <Text style={styles.cardTitle}>{t('prayerGuide')}</Text>
            <Text style={styles.cardDesc}>
              {language === 'tr' ? 'Namazların kılınışı ve namaz hareketleri' : 'How to perform prayers and movements'}
            </Text>
          </View>
          <Text style={styles.chevron}>❯</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card} 
          activeOpacity={0.8}
          onPress={() => navigation.navigate('AblutionGuide')}
        >
          <View style={styles.cardIconBox}>
            <Text style={styles.cardIcon}>💧</Text>
          </View>
          <View style={styles.cardTextBox}>
            <Text style={styles.cardTitle}>{t('ablutionGuide')}</Text>
            <Text style={styles.cardDesc}>
              {language === 'tr' ? 'Adım adım abdest ve gusül' : 'Step-by-step ablution and ghusl'}
            </Text>
          </View>
          <Text style={styles.chevron}>❯</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: SPACING.lg, 
    paddingBottom: 20 
  },
  backBtn: { 
    width: 40, height: 40, 
    borderRadius: 12, 
    backgroundColor: '#1e1e1e', 
    borderWidth: 1, borderColor: COLORS.border, 
    alignItems: 'center', justifyContent: 'center' 
  },
  backIcon: { color: COLORS.text, fontSize: 18 },
  headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  backBtnPlaceholder: { width: 40, height: 40 },
  container: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 10,
    gap: 16
  },
  description: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginBottom: 10,
    lineHeight: 20
  },
  card: {
    backgroundColor: '#1E2B1E',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(92, 184, 92, 0.4)',
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  cardIconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(92, 184, 92, 0.15)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  cardIcon: { fontSize: 24 },
  cardTextBox: { flex: 1 },
  cardTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700', marginBottom: 4 },
  cardDesc: { color: COLORS.green, fontSize: 12, fontWeight: '600' },
  chevron: { color: 'rgba(255,255,255,0.3)', fontSize: 18, fontWeight: '700' }
});
