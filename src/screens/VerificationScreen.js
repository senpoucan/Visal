import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/LanguageContext';

export default function VerificationScreen() {
  const { user, logout, checkVerification } = useAuth();
  const { t, language } = useLanguage();
  const [checking, setChecking] = useState(false);

  const handleCheck = async () => {
    setChecking(true);
    const verified = await checkVerification();
    setChecking(false);
    if (!verified) {
      Alert.alert(
        language === 'tr' ? "Henüz Onaylanmadı" : "Not Verified Yet", 
        language === 'tr' ? "Lütfen e-postanızdaki linke tıkladığınızdan emin olun." : "Please make sure you clicked the link in your email."
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.icon}>📧</Text>
        <Text style={styles.title}>{t('verificationRequired')}</Text>
        <Text style={styles.subtitle}>
          {language === 'tr' ? 'Lütfen ' : 'Please click the verification link sent to '}
          <Text style={{color: COLORS.green}}>{user?.email}</Text>
          {language === 'tr' ? ' adresine gönderilen doğrulama linkine tıklayın.' : '.'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.infoText}>
          {language === 'tr' 
            ? 'Linke tıkladıktan sonra aşağıdaki butona basarak onay durumunuzu kontrol edebilirsiniz.' 
            : 'After clicking the link, you can check your status by pressing the button below.'}
        </Text>

        <TouchableOpacity 
          style={styles.btnPrimary} 
          onPress={handleCheck} 
          disabled={checking}
          activeOpacity={0.8}
        >
          {checking ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.btnPrimaryText}>{t('checkNow')}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.resendBtn} 
          onPress={async () => {
            try {
              const { auth } = require('../config/firebase');
              const { sendEmailVerification } = require('firebase/auth');
              if (auth.currentUser) {
                await sendEmailVerification(auth.currentUser);
                Alert.alert(
                  language === 'tr' ? "Başarılı" : "Success", 
                  language === 'tr' ? "Doğrulama maili tekrar gönderildi." : "Verification email has been resent."
                );
              }
            } catch (err) {
              Alert.alert("Error", err.message);
            }
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.resendText}>{t('resendMail')}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.logoutBtn} 
          onPress={logout}
          activeOpacity={0.7}
        >
          <Text style={styles.logoutText}>{t('logout')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    padding: SPACING.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  icon: {
    fontSize: 60,
    marginBottom: 20,
  },
  title: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoText: {
    color: '#bbb',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  btnPrimary: {
    backgroundColor: COLORS.green,
    paddingVertical: 16,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    shadowColor: COLORS.green,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  btnPrimaryText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
  resendBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  resendText: {
    color: COLORS.green,
    fontSize: 14,
    fontWeight: '600',
  },
  logoutBtn: {
    marginTop: 20,
    alignItems: 'center',
  },
  logoutText: {
    color: '#666',
    fontSize: 13,
    textDecorationLine: 'underline',
  }
});
