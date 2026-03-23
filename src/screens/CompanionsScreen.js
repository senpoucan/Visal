import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, SectionList, TouchableOpacity,
  SafeAreaView, TextInput
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import companionsData from '../constants/companionsData.json';
import { useLanguage } from '../hooks/LanguageContext';

export default function CompanionsScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const { language, t } = useLanguage();

  const sections = useMemo(() => {
    let raw = companionsData;
    if (search) {
      const lowerSearch = search.toLowerCase();
      raw = companionsData.filter(c => c.name.toLowerCase().includes(lowerSearch));
    }
    
    const groups = {
      'Aşere-i Mübeşşere': [],
      'Erkek Sahabeler': [],
      'Kadın Sahabeler': []
    };
    
    raw.forEach(c => {
       if (groups[c.category]) {
           groups[c.category].push(c);
       } else {
           groups['Erkek Sahabeler'].push(c); // fallback
       }
    });
    
    return [
      { 
        title: language === 'tr' ? 'Aşere-i Mübeşşere' : 'The Promised Ten', 
        data: groups['Aşere-i Mübeşşere'] 
      },
      { 
        title: language === 'tr' ? 'Erkek Sahabeler' : 'Male Companions', 
        data: groups['Erkek Sahabeler'] 
      },
      { 
        title: language === 'tr' ? 'Kadın Sahabeler' : 'Female Companions', 
        data: groups['Kadın Sahabeler'] 
      }
    ].filter(s => s.data.length > 0);
  }, [search, language]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('CompanionDetail', { companion: item })}
    >
      <View style={styles.cardIconBox}>
        <Text style={styles.cardIcon}>🌙</Text>
      </View>
      <Text style={styles.cardText}>{item.name}</Text>
      <Text style={styles.cardArrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('companions')}</Text>
        </View>
        <Text style={styles.headerSub}>
          {language === 'tr' 
            ? 'Gökteki yıldızlar gibi parlayan örnek hayatlar' 
            : 'Exemplary lives shining like stars in the sky'}
        </Text>
        
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder={language === 'tr' ? "Sahabe ara..." : "Search companion..."}
            placeholderTextColor={COLORS.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id || item.url}
        renderItem={renderItem}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={15}
        stickySectionHeadersEnabled={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    padding: SPACING.lg,
    paddingTop: Platform.OS === 'ios' ? 70 : 50,
    backgroundColor: COLORS.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '300',
    marginTop: -4,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '800',
  },
  headerSub: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginBottom: 20,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161616',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
    color: COLORS.textMuted,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  sectionHeader: {
    color: COLORS.green,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 18,
    marginBottom: 12,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    padding: 16,
    borderRadius: RADIUS.md,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardIcon: {
    fontSize: 18,
  },
  cardText: {
    flex: 1,
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  cardArrow: {
    color: COLORS.textMuted,
    fontSize: 24,
    fontWeight: '300',
  }
});
