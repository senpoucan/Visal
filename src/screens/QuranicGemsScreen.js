import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Modal, TouchableWithoutFeedback, ScrollView, Platform } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { useLanguage } from '../hooks/LanguageContext';
import { MOOD_DATA } from '../constants/moodData';

export default function QuranicGemsScreen({ navigation }) {
  const { language, t } = useLanguage();
  const [selectedGem, setSelectedGem] = useState(null);

  const handleMoodSelect = (mood) => {
    const randomIndex = Math.floor(Math.random() * mood.content.length);
    setSelectedGem(mood.content[randomIndex]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.75}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{t('quranicGems')}</Text>
          <Text style={styles.headerSub}>
            {language === 'tr' ? 'Ruh Halinize Özel İlaçlar' : 'Remedies for Your Mood'}
          </Text>
        </View>
        <View style={{width: 36}}/>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.promptText}>
          {language === 'tr' ? 'Şu an nasıl hissediyorsun?' : 'How are you feeling right now?'}
        </Text>

        <View style={styles.moodGrid}>
          {MOOD_DATA.map((mood) => (
            <TouchableOpacity 
              key={mood.id} 
              style={styles.moodCard} 
              onPress={() => handleMoodSelect(mood)}
              activeOpacity={0.7}
            >
              <View style={styles.moodEmojiContainer}>
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
              </View>
              <View style={styles.moodTextContainer}>
                <Text style={styles.moodText}>{language === 'tr' ? mood.tr : mood.en}</Text>
                <Text style={styles.moodSubText}>
                  {language === 'tr' ? 'Sana özel ayet ve hadisleri gör' : 'Discover verses and hadiths for you'}
                </Text>
              </View>
              <Text style={styles.moodArrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* GEM MODAL */}
      <Modal visible={!!selectedGem} transparent animationType="fade" onRequestClose={() => setSelectedGem(null)}>
        <TouchableWithoutFeedback onPress={() => setSelectedGem(null)}>
           <View style={styles.modalOverlay}>
             <TouchableWithoutFeedback>
               <View style={styles.gemBox}>
                  <Text style={styles.gemType}>{selectedGem?.type}</Text>
                  <Text style={styles.gemContent}>
                    "{language === 'tr' ? selectedGem?.text : (selectedGem?.enText || selectedGem?.text)}"
                  </Text>
                  <Text style={styles.gemSource}>
                    — {language === 'tr' ? selectedGem?.source : (selectedGem?.enSource || selectedGem?.source)}
                  </Text>
                  
                  <TouchableOpacity style={styles.closeModalBtn} onPress={() => setSelectedGem(null)} activeOpacity={0.8}>
                    <Text style={styles.closeModalBtnText}>{language === 'tr' ? 'Tamam' : 'Close'}</Text>
                  </TouchableOpacity>
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
  headerSub: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },

  contentContainer: {
    padding: SPACING.xl,
    paddingTop: 30,
  },
  promptText: {
    color: '#EDEDED',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  moodGrid: {
    flexDirection: 'column',
    gap: 16,
  },
  moodCard: {
    backgroundColor: COLORS.bgCard,
    width: '100%',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  moodEmojiContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  moodEmoji: {
    fontSize: 24,
  },
  moodTextContainer: {
    flex: 1,
  },
  moodText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  moodSubText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  moodArrow: {
    color: COLORS.textMuted,
    fontSize: 20,
    opacity: 0.5,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  gemBox: {
    backgroundColor: '#1c1c1c',
    width: '100%',
    padding: 30,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(90,122,90,0.5)',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 10,
  },
  gemType: {
    color: COLORS.green,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 20,
  },
  gemContent: {
    color: '#ffffff',
    fontSize: 22,
    lineHeight: 34,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 24,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  gemSource: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 30,
  },
  closeModalBtn: {
    backgroundColor: COLORS.bg,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  closeModalBtnText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  }
});
