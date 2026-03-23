import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert, Image
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/LanguageContext';

export default function AuthScreen() {
  const { login, register, loginAsGuest } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('male');
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [serverError, setServerError] = useState(null);

  const validateName = (text) => {
    const isValid = /[A-Z]/.test(text);
    setNameError(!isValid && text.length > 0);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(language === 'tr' ? "Hata" : "Error", language === 'tr' ? "Lütfen tüm alanları doldurun." : "Please fill all fields.");
      return;
    }

    if (!isLogin) {
      if (!name.trim()) {
        Alert.alert(language === 'tr' ? "Hata" : "Error", language === 'tr' ? "Lütfen isminizi girin." : "Please enter your name.");
        return;
      }
      if (!validateName(name)) {
        Alert.alert(language === 'tr' ? "Hata" : "Error", language === 'tr' ? "İsim en az bir büyük harf içermelidir." : "Name must contain at least one uppercase letter.");
        return;
      }
    }

    setLoading(true);
    setServerError(null);
    try {
      if (isLogin) {
        await login(email.trim(), password);
      } else {
        await register(name.trim(), email.trim(), password, gender);
      }
    } catch (err) {
      if (err.code === 'auth/operation-not-allowed') {
        setServerError(language === 'tr' 
          ? "Kritik Hata: Firebase Console üzerinden 'Email/Password' giriş yöntemi etkinleştirilmemiş." 
          : "Critical Error: Email/Password auth is not enabled in Firebase Console.");
      } else {
        setServerError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    const title = language === 'tr' ? "🎁 Misafir Girişi" : "🎁 Guest Login";
    const msg = t('dataLossWarning');
    
    const startGuestLogin = async () => {
      setLoading(true);
      try {
        const guestName = language === 'tr' ? 'Yolcu' : 'Traveler';
        await loginAsGuest(guestName, gender);
      } catch (err) {
        if (err.code === 'auth/admin-restricted-operation') {
           setServerError(language === 'tr' 
             ? "Hata: Misafir girişi kısıtlanmış. Lütfen Firebase Console üzerinden 'Anonymous Authentication' yöntemini etkinleştirin." 
             : "Error: Guest login is restricted. Please enable 'Anonymous Authentication' in your Firebase Console.");
        } else {
           setServerError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`${title}\n\n${msg}`)) {
        startGuestLogin();
      }
    } else {
      Alert.alert(title, msg, [
        { text: t('cancel'), style: "cancel" },
        { text: t('confirm'), onPress: startGuestLogin }
      ]);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        <TouchableOpacity style={styles.langBtnAbsolute} onPress={toggleLanguage} activeOpacity={0.7}>
          <Text style={styles.langBtnText}>{language === 'tr' ? 'TR' : 'EN'}</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title} adjustsFontSizeToFit numberOfLines={1}>{isLogin ? t('welcome') : t('register')}</Text>
          <Text style={styles.subtitle}>
            {isLogin 
              ? (language === 'tr' ? 'Yolcuğuna devam etmek için giriş yap.' : 'Login to continue your journey.') 
              : (language === 'tr' ? 'Yeni bir yolculuğa başlamak için kayıt ol.' : 'Register to start a new journey.')}
          </Text>
        </View>

        <View style={styles.card}>
          
          {serverError && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{serverError}</Text>
            </View>
          )}

          {( !isLogin || name.length > 0 ) && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('name')}</Text>
              <TextInput
                style={[styles.input, nameError && styles.inputError]}
                placeholder={language === 'tr' ? "Örn: İsmail Can" : "e.g. John Doe"}
                placeholderTextColor={COLORS.textMuted}
                value={name}
                onChangeText={(t) => {
                  setName(t);
                  validateName(t);
                }}
              />
              {nameError && (
                <Text style={styles.errorText}>
                  {language === 'tr' ? "En az 1 büyük harf içermeli!" : "Must contain at least 1 uppercase!"}
                </Text>
              )}
            </View>
          )}

          {!isLogin && (
             <View style={styles.genderContainer}>
               <Text style={styles.genderLabel}>{language === 'tr' ? "Cinsiyetiniz:" : "Your Gender:"}</Text>
               <View style={styles.genderToggle}>
                 <TouchableOpacity 
                   style={[styles.genderBtn, gender === 'male' && styles.genderBtnActive]}
                   onPress={() => setGender('male')}
                   activeOpacity={0.8}
                 >
                   <Text style={[styles.genderBtnText, gender === 'male' && styles.genderBtnTextActive]}>
                     {language === 'tr' ? "Erkek" : "Male"}
                   </Text>
                 </TouchableOpacity>
                 <TouchableOpacity 
                   style={[styles.genderBtn, gender === 'female' && styles.genderBtnActive]}
                   onPress={() => setGender('female')}
                   activeOpacity={0.8}
                 >
                   <Text style={[styles.genderBtnText, gender === 'female' && styles.genderBtnTextActive]}>
                     {language === 'tr' ? "Kadın" : "Female"}
                   </Text>
                 </TouchableOpacity>
               </View>
             </View>
          )}

          {isLogin || !nameError ? (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('email')}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="name@example.com"
                  placeholderTextColor={COLORS.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('password')}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity 
                style={styles.btnPrimary} 
                onPress={handleSubmit} 
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.btnPrimaryText} adjustsFontSizeToFit numberOfLines={1}>
                    {isLogin ? t('login') : t('register')}
                  </Text>
                )}
              </TouchableOpacity>
            </>
          ) : null}

          <TouchableOpacity 
            style={styles.toggleBtn} 
            onPress={() => setIsLogin(!isLogin)}
            activeOpacity={0.7}
          >
            <Text style={styles.toggleText}>
              {isLogin 
                ? (language === 'tr' ? 'Hesabınız yok mu? Kayıt Ol' : 'No account? Register') 
                : (language === 'tr' ? 'Hesabınız var mı? Giriş Yap' : 'Have an account? Login')}
            </Text>
          </TouchableOpacity>

          <View style={styles.dividerBox}>
            <View style={styles.line} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.line} />
          </View>

          {isLogin && (
            <View style={[styles.genderToggle, { marginBottom: 16 }]}>
                 <TouchableOpacity 
                   style={[styles.genderBtn, gender === 'male' && styles.genderBtnActive]}
                   onPress={() => setGender('male')}
                   activeOpacity={0.8}
                 >
                   <Text style={[styles.genderBtnText, gender === 'male' && styles.genderBtnTextActive]}>{language === 'tr' ? "Erkek Misafir" : "Male Guest"}</Text>
                 </TouchableOpacity>
                 <TouchableOpacity 
                   style={[styles.genderBtn, gender === 'female' && styles.genderBtnActive]}
                   onPress={() => setGender('female')}
                   activeOpacity={0.8}
                 >
                   <Text style={[styles.genderBtnText, gender === 'female' && styles.genderBtnTextActive]}>{language === 'tr' ? "Kadın Misafir" : "Female Guest"}</Text>
                 </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity 
            style={styles.btnGuest} 

            onPress={handleGuestLogin} 
            activeOpacity={0.8}
            disabled={loading}
          >
            <Text style={styles.btnGuestText} adjustsFontSizeToFit numberOfLines={1}>👤 {t('guest')}</Text>
          </TouchableOpacity>

        </View>

        <Text style={styles.footerNote}>
          {language === 'tr' 
            ? 'Misafir girişi yapıldığında veriler buluta yedeklenmez.' 
            : 'Data is not backed up to the cloud when as guest.'}
        </Text>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: {
    padding: SPACING.xl,
    paddingTop: 80,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#bbb',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#161616',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: RADIUS.md,
    color: COLORS.text,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
  },
  inputError: {
    borderColor: '#ff5252',
    borderWidth: 1.5,
  },
  errorText: {
    color: '#ff5252',
    fontSize: 13,
    marginBottom: 16,
    marginLeft: 4,
  },
  genderContainer: {
    marginBottom: 20,
    marginTop: 4,
  },
  genderLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  genderToggle: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    borderRadius: RADIUS.md,
    padding: 4,
  },
  genderBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: RADIUS.sm,
  },
  genderBtnActive: {
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  genderBtnText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  genderBtnTextActive: {
    color: COLORS.text,
  },
  btnPrimary: {
    backgroundColor: COLORS.green,
    paddingVertical: 16,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginTop: 10,
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
  toggleBtn: {
    marginTop: 24,
    alignItems: 'center',
  },
  toggleText: {
    color: COLORS.green,
    fontSize: 14,
    fontWeight: '600',
  },
  dividerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  orText: {
    color: '#555',
    marginHorizontal: 12,
    fontSize: 12,
    fontWeight: '700',
  },
  btnGuest: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: '#444',
    alignItems: 'center',
  },
  btnGuestText: {
    color: '#ccc',
    fontSize: 14,
    fontWeight: '700',
  },
  footerNote: {
    color: '#444',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
  errorBanner: {
    backgroundColor: 'rgba(255, 82, 82, 0.15)',
    borderWidth: 1,
    borderColor: '#ff5252',
    borderRadius: RADIUS.md,
    padding: 12,
    marginBottom: 20,
  },
  errorBannerText: {
    color: '#ff5252',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
  },
  langBtnAbsolute: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    zIndex: 999,
  },
  langBtnText: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700',
  }
});
