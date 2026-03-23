import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, FlatList, Platform } from 'react-native';
import { useLanguage } from '../hooks/LanguageContext';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { ESMA_UL_HUSNA } from '../constants/esmaData';

export default function EsmaUlHusnaScreen({ navigation }) {
  const { language, toggleLanguage, t } = useLanguage();

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.goldBox}>
        <Text style={styles.arabicText} adjustsFontSizeToFit numberOfLines={1}>{item.nameAr}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.latinText}>{item.id}. {item.nameTr}</Text>
        <Text style={styles.meaningText}>{language === 'eng' || language === 'en' ? item.meaningEn : item.meaning}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 40 : 20 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.backIcon}>❮</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('esmaUlHusna')}</Text>
        
        <TouchableOpacity style={styles.langToggleBtn} onPress={toggleLanguage} activeOpacity={0.7}>
          <Text style={styles.langToggleText}>{language === 'tr' ? 'TR' : 'EN'}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={ESMA_UL_HUSNA}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
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
  headerTitle: { color: '#D4AF37', fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
  
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
  
  listContent: { paddingHorizontal: SPACING.lg, paddingBottom: 40 },
  
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121212',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)', // Gold transparent border
    padding: 16,
    marginBottom: 14,
    shadowColor: '#D4AF37',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3
  },
  goldBox: {
    width: 80,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#0a0a0a',
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16
  },
  arabicText: {
    color: '#D4AF37',
    fontSize: 22,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    textAlign: 'center'
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center'
  },
  latinText: {
    color: '#E0E0E0',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: -0.2
  },
  meaningText: {
    color: '#999',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500'
  }
});
