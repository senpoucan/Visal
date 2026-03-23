import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Modal, Platform } from 'react-native';
import { useLanguage } from '../hooks/LanguageContext';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { DAILY_PRAYERS, NAFILE_PRAYERS, PRAYER_MOVEMENTS } from '../constants/guideData';

export default function PrayerGuideScreen({ navigation }) {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState('kilinis'); // 'kilinis' | 'hareketler'
  const [subTab, setSubTab] = useState('vakit'); // 'vakit' | 'nafile'
  const [showNafileInfo, setShowNafileInfo] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const toggleAccordion = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const renderPrayerList = (data) => (
    <View style={styles.listContainer}>
      {data.map(item => {
        const isExpanded = expandedId === item.id;
        return (
          <View key={item.id} style={styles.accordionContainer}>
            <TouchableOpacity 
              style={styles.accordionHeader} 
              onPress={() => toggleAccordion(item.id)}
              activeOpacity={0.8}
            >
              <View>
                <Text style={styles.prayerName}>{language === 'tr' ? item.nameTR : item.nameEN}</Text>
                <Text style={styles.rakatsInfo}>{item.rakats}</Text>
              </View>
              <Text style={styles.chevron}>{isExpanded ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            {isExpanded && (
              <View style={styles.accordionContent}>
                {item.stepsTR.map((step, idx) => (
                  <View key={idx} style={styles.stepRow}>
                    <View style={styles.stepDot} />
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 40 : 20 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>❮</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('prayerGuide')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabsRow}>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'kilinis' && styles.tabBtnActive]} 
          onPress={() => setActiveTab('kilinis')}
        >
          <Text style={[styles.tabText, activeTab === 'kilinis' && styles.tabTextActive]}>
            {language === 'tr' ? 'Namazların Kılınışı' : 'How to Pray'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'hareketler' && styles.tabBtnActive]} 
          onPress={() => setActiveTab('hareketler')}
        >
          <Text style={[styles.tabText, activeTab === 'hareketler' && styles.tabTextActive]}>
            {language === 'tr' ? 'Hareketler / Zikirler' : 'Movements / Zikr'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'kilinis' ? (
          <>
            <View style={styles.subTabsRow}>
              <TouchableOpacity 
                style={[styles.subTabBtn, subTab === 'vakit' && styles.subTabBtnActive]} 
                onPress={() => { setSubTab('vakit'); setExpandedId(null); }}
              >
                <Text style={[styles.subTabText, subTab === 'vakit' && styles.subTabTextActive]}>
                  {language === 'tr' ? 'Vakit Namazları' : 'Daily Prayers'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.subTabBtn, subTab === 'nafile' && styles.subTabBtnActive]} 
                onPress={() => { setSubTab('nafile'); setExpandedId(null); }}
              >
                <Text style={[styles.subTabText, subTab === 'nafile' && styles.subTabTextActive]}>
                  {language === 'tr' ? 'Nafile Namazlar' : 'Supererogatory'}
                </Text>
              </TouchableOpacity>
            </View>

            {subTab === 'nafile' && (
              <TouchableOpacity 
                style={styles.infoWarningBtn} 
                onPress={() => setShowNafileInfo(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.infoWarningText}>
                  {language === 'tr' ? '⚠️ Önemli Bilgi !' : '⚠️ Important Info !'}
                </Text>
              </TouchableOpacity>
            )}

            {renderPrayerList(subTab === 'vakit' ? DAILY_PRAYERS : NAFILE_PRAYERS)}
          </>
        ) : (
          <View style={styles.movementsGrid}>
            <Text style={styles.movementsIntro}>
              {language === 'tr' 
                ? 'Aşağıda namaz hareketleri ve bu hareketlere özel okunan zikirler yer almaktadır.'
                : 'Below are prayer movements and specific zikrs recited.'}
            </Text>
            {PRAYER_MOVEMENTS.map(mov => (
              <View key={mov.id} style={styles.movementCard}>
                <View style={styles.movementIconBox}><Text style={styles.movementIcon}>{mov.icon}</Text></View>
                <View style={styles.movementTextBox}>
                  <Text style={styles.movementTitle}>{language === 'tr' ? mov.nameTR : mov.nameEN}</Text>
                  <Text style={styles.movementDesc}>{mov.descTR}</Text>
                  <View style={styles.zikrBox}>
                    <Text style={styles.zikrLabel}>Zikir:</Text>
                    <Text style={styles.zikrText}>{mov.zikrTR}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* MODAL FOR NAFILE INFO */}
      <Modal visible={showNafileInfo} transparent animationType="fade" onRequestClose={() => setShowNafileInfo(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>⚠️ Önemli Bilgi</Text>
            <Text style={styles.modalText}>
              {language === 'tr'
                ? 'Nafile namazlar ister 2 rekatta bir selam vererek, isterseniz normal sünnet namazlar gibi 4 rekatta bir selam vererek kılınabilir. Ancak 2\'şer rekat kılmak daha faziletlidir.'
                : 'Supererogatory prayers can be prayed giving salam every 2 rakats or 4 rakats. However, doing it in pairs of 2 is more virtuous.'}
            </Text>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowNafileInfo(false)}>
              <Text style={styles.modalCloseText}>Tamam</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#1e1e1e', borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  backIcon: { color: COLORS.text, fontSize: 18 },
  headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  
  tabsRow: { flexDirection: 'row', marginHorizontal: SPACING.lg, backgroundColor: '#1e1e1e', borderRadius: RADIUS.md, pading: 4, marginBottom: 16 },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: RADIUS.md },
  tabBtnActive: { backgroundColor: 'rgba(92,184,92,0.2)' },
  tabText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: COLORS.green, fontWeight: '800' },

  scrollContent: { paddingHorizontal: SPACING.lg, paddingBottom: 40 },

  subTabsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  subTabBtn: { flex: 1, paddingVertical: 10, borderWidth: 1, borderColor: '#333', borderRadius: RADIUS.sm, alignItems: 'center' },
  subTabBtnActive: { borderColor: COLORS.green, backgroundColor: 'rgba(92,184,92,0.1)' },
  subTabText: { color: '#888', fontSize: 12, fontWeight: '600' },
  subTabTextActive: { color: COLORS.text, fontWeight: '700' },

  infoWarningBtn: { backgroundColor: 'rgba(255, 165, 0, 0.15)', borderWidth: 1, borderColor: 'orange', borderRadius: RADIUS.md, padding: 12, alignItems: 'center', alignSelf: 'center', marginBottom: 16, width: '80%' },
  infoWarningText: { color: 'orange', fontWeight: '700', fontSize: 13 },

  listContainer: { gap: 12 },
  accordionContainer: { backgroundColor: '#1E2B1E', borderRadius: RADIUS.sm, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  accordionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  prayerName: { color: COLORS.text, fontSize: 15, fontWeight: '700' },
  rakatsInfo: { color: COLORS.green, fontSize: 11, marginTop: 4, fontWeight: '600' },
  chevron: { color: '#555', fontSize: 16 },
  accordionContent: { padding: 16, paddingTop: 0, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  stepRow: { flexDirection: 'row', marginTop: 10, paddingRight: 10 },
  stepDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.green, marginTop: 6, marginRight: 10 },
  stepText: { color: '#ccc', fontSize: 13, lineHeight: 20, flex: 1 },

  movementsGrid: { gap: 14 },
  movementsIntro: { color: '#aaa', fontSize: 13, marginBottom: 10, lineHeight: 18 },
  movementCard: { backgroundColor: '#1A1A1A', borderRadius: RADIUS.md, padding: 16, flexDirection: 'row', gap: 16, borderWidth: 1, borderColor: '#2a2a2a' },
  movementIconBox: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  movementIcon: { fontSize: 24 },
  movementTextBox: { flex: 1 },
  movementTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  movementDesc: { color: COLORS.textMuted, fontSize: 12, marginTop: 4, marginBottom: 10 },
  zikrBox: { backgroundColor: 'rgba(92,184,92,0.1)', padding: 10, borderRadius: RADIUS.sm },
  zikrLabel: { color: COLORS.green, fontSize: 10, fontWeight: '700', marginBottom: 2 },
  zikrText: { color: '#fff', fontSize: 12, fontWeight: '600', fontStyle: 'italic' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: SPACING.lg },
  modalContent: { backgroundColor: '#1e1e1e', borderRadius: RADIUS.lg, padding: 24, width: '100%', borderWidth: 1, borderColor: 'orange' },
  modalTitle: { color: 'orange', fontSize: 18, fontWeight: '800', marginBottom: 12, textAlign: 'center' },
  modalText: { color: COLORS.text, fontSize: 14, lineHeight: 22, textAlign: 'center', marginBottom: 20 },
  modalCloseBtn: { backgroundColor: 'orange', padding: 12, borderRadius: RADIUS.md, alignItems: 'center' },
  modalCloseText: { color: '#000', fontWeight: '800', fontSize: 15 }
});
