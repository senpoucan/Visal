import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Platform } from 'react-native';
import { useLanguage } from '../hooks/LanguageContext';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { ABLUTION_STEPS } from '../constants/guideData';

export default function AblutionGuideScreen({ navigation }) {
  const { language, t } = useLanguage();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 40 : 20 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.backIcon}>❮</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('ablutionGuide')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* WUDU (ABDEST) SECTION */}
        <View style={styles.sectionBox}>
          <Text style={styles.sectionTitle}>{language === 'tr' ? 'Adım Adım Abdest Alınışı' : 'Step-by-step Ablution'}</Text>
          <Text style={styles.sectionSub}>
            {language === 'tr' 
              ? 'Namaza hazırlık için alınan abdestin sırasıyla yapılışı.' 
              : 'The sequential preparation of Wudu for prayer.'}
          </Text>

          <View style={styles.stepsContainer}>
            {ABLUTION_STEPS.map((step, index) => (
              <View key={step.id} style={styles.stepCard}>
                <View style={styles.stepNumBox}><Text style={styles.stepNum}>{index + 1}</Text></View>
                <View style={styles.stepIconBox}><Text style={styles.stepIcon}>{step.icon}</Text></View>
                <View style={styles.stepTextBox}>
                  <Text style={styles.stepTitle}>{step.nameTR}</Text>
                  <Text style={styles.stepDesc}>{step.descTR}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* GHUSL (GUSUL) SECTION */}
        <View style={[styles.sectionBox, { marginTop: 24, paddingBottom: 30 }]}>
          <Text style={styles.sectionTitle}>{language === 'tr' ? 'Gusül Abdesti (Boy Abdesti)' : 'Ghusl (Full Ablution)'}</Text>
          <View style={styles.ghuslBox}>
            <Text style={styles.ghuslText}>
              {language === 'tr' 
                ? 'Guslün Farzları Üçtür:\n\n1. Ağza (boğaza kadar) dolu dolu su vermek.\n2. Burna (genze kadar) su çekmek.\n3. Bütün bedeni, iğne ucu kadar kuru yer kalmayacak şekilde yıkamak.\n\nSünnetlerine Uygun Gusül Alınışı:\n- Önce niyet edilir ve besmele çekilir.\n- Eller ve avret yerleri yıkanır.\n- Namaz abdesti gibi abdest alınır.\n- Önce başa, sonra sağ omuza, sonra sol omuza 3\'er defa su dökülerek tüm vücut yıkanır.'
                : 'Obligatory acts of Ghusl are 3:\n1. Rinsing the mouth thoroughly.\n2. Rinsing the nose up to the nasal bone.\n3. Washing the entire body without leaving a dry spot.\n\nSunnah method: Niyyah, Bismillah, washing hands and private parts, performing Wudu, then pouring water over head, right shoulder, left shoulder 3 times each washing the whole body.'
              }
            </Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#1e1e1e', borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  backIcon: { color: COLORS.text, fontSize: 18 },
  headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700' },

  scrollContent: { paddingHorizontal: SPACING.lg, paddingTop: 10 },

  sectionBox: { gap: 8 },
  sectionTitle: { color: COLORS.green, fontSize: 18, fontWeight: '800' },
  sectionSub: { color: '#888', fontSize: 13, marginBottom: 12 },

  stepsContainer: { gap: 14 },
  stepCard: { flexDirection: 'row', backgroundColor: '#1A1A1A', borderRadius: RADIUS.md, padding: 16, alignItems: 'center', gap: 14, borderWidth: 1, borderColor: '#222' },
  stepNumBox: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.green, alignItems: 'center', justifyContent: 'center' },
  stepNum: { color: '#000', fontSize: 14, fontWeight: '800' },
  stepIconBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  stepIcon: { fontSize: 20 },
  stepTextBox: { flex: 1 },
  stepTitle: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 4 },
  stepDesc: { color: '#aaa', fontSize: 12, lineHeight: 18 },

  ghuslBox: { backgroundColor: '#1A1A1A', padding: 20, borderRadius: RADIUS.md, borderWidth: 1, borderColor: 'rgba(92,184,92,0.3)' },
  ghuslText: { color: '#e0e0e0', fontSize: 14, lineHeight: 24 }
});
