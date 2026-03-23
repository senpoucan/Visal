import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { useLanguage } from '../hooks/LanguageContext';

export default function CompanionDetailScreen({ route, navigation }) {
  const { companion } = route.params;
  const { language } = useLanguage();
  const scrollViewRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const PARAGRAPHS_PER_PAGE = 3;

  const totalPages = companion.content ? Math.max(1, Math.ceil(companion.content.length / PARAGRAPHS_PER_PAGE)) : 1;
  const currentParagraphs = companion.content 
    ? companion.content.slice((currentPage - 1) * PARAGRAPHS_PER_PAGE, currentPage * PARAGRAPHS_PER_PAGE)
    : [];

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(p => p + 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(p => p - 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{companion.name}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{companion.name}</Text>
        
        <View style={styles.divider} />

        {currentParagraphs.length > 0 ? (
          currentParagraphs.map((paragraph, index) => (
            <Text key={index} style={styles.paragraph}>
              {paragraph}
            </Text>
          ))
        ) : (
          <Text style={styles.paragraph}>
            {language === 'tr' ? 'Biyografi bulunamadı.' : 'Biography not found.'}
          </Text>
        )}
        
        <View style={styles.footerSpace} />
      </ScrollView>

      {/* ── PAGINATION BAR ── */}
      <View style={styles.paginationRow}>
        <TouchableOpacity 
          style={[styles.pageBtn, currentPage === 1 && styles.pageBtnDisabled]}
          onPress={goToPrevPage}
          disabled={currentPage === 1}
          activeOpacity={0.7}
        >
          <Text style={[styles.pageBtnText, currentPage === 1 && styles.pageBtnTextDisabled]}>
            ◀ {language === 'tr' ? 'Önceki' : 'Prev'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.pageIndicator}>
          {currentPage} / {totalPages}
        </Text>

        <TouchableOpacity 
          style={[styles.pageBtn, currentPage === totalPages && styles.pageBtnDisabled]}
          onPress={goToNextPage}
          disabled={currentPage === totalPages}
          activeOpacity={0.7}
        >
          <Text style={[styles.pageBtnText, currentPage === totalPages && styles.pageBtnTextDisabled]}>
            {language === 'tr' ? 'Sonraki' : 'Next'} ▶
          </Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    backgroundColor: COLORS.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 40, height: 40,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
  },
  backIcon: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '400',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: 15,
    fontWeight: '600',
    marginHorizontal: 10,
  },
  content: {
    padding: SPACING.xl,
    paddingTop: SPACING.lg,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
    marginTop: 10,
  },
  divider: {
    height: 2,
    width: 60,
    backgroundColor: COLORS.green,
    marginVertical: 20,
    borderRadius: 1,
  },
  paragraph: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 16,
    lineHeight: 26,
    marginBottom: 16,
    textAlign: 'justify'
  },
  footerSpace: {
    height: 40,
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    backgroundColor: '#161616',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  pageBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#2a2a2a',
    borderRadius: RADIUS.sm,
    minWidth: 90,
    alignItems: 'center',
  },
  pageBtnDisabled: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#333',
  },
  pageBtnText: {
    color: COLORS.green,
    fontSize: 14,
    fontWeight: '700',
  },
  pageBtnTextDisabled: {
    color: COLORS.textMuted,
  },
  pageIndicator: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 1,
  }
});
