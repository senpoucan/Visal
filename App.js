import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, View } from 'react-native';

import { StatsProvider } from './src/hooks/StatsContext';
import { AuthProvider, useAuth } from './src/hooks/useAuth';
import MainScreen         from './src/screens/MainScreen';
import QuranReaderScreen  from './src/screens/QuranReaderScreen';
import MushafReaderScreen from './src/screens/MushafReaderScreen';
import CompanionsScreen   from './src/screens/CompanionsScreen';
import CompanionDetailScreen from './src/screens/CompanionDetailScreen';
import QuranicGemsScreen  from './src/screens/QuranicGemsScreen';
import SunnahListScreen   from './src/screens/SunnahListScreen';
import NamazDailyScreen   from './src/screens/NamazDailyScreen';
import GuideScreen        from './src/screens/GuideScreen';
import PrayerGuideScreen  from './src/screens/PrayerGuideScreen';
import AblutionGuideScreen from './src/screens/AblutionGuideScreen';
import EsmaUlHusnaScreen  from './src/screens/EsmaUlHusnaScreen';
import AuthScreen         from './src/screens/AuthScreen';
import VerificationScreen from './src/screens/VerificationScreen';
import { LanguageProvider } from './src/hooks/LanguageContext';

const Stack = createNativeStackNavigator();

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) return <View style={{ flex: 1, backgroundColor: '#0a1a0a' }} />;

  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor="#0e0e0e" />
      <StatsProvider>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#0e0e0e' },
            animation: 'fade',
          }}
        >
          {user ? (
            (!user.emailVerified && !user.isAnonymous) ? (
              <Stack.Screen name="Verification" component={VerificationScreen} />
            ) : (
              <>
                <Stack.Screen name="Main"            component={MainScreen}            />
                <Stack.Screen name="QuranReader"     component={QuranReaderScreen}     />
                <Stack.Screen name="MushafReader"    component={MushafReaderScreen}    />
                <Stack.Screen name="Companions"      component={CompanionsScreen}      />
                <Stack.Screen name="CompanionDetail" component={CompanionDetailScreen} />
                <Stack.Screen name="QuranicGems"     component={QuranicGemsScreen}     />
                <Stack.Screen name="SunnahList"      component={SunnahListScreen}      />
                <Stack.Screen name="NamazDaily"      component={NamazDailyScreen}      />
                <Stack.Screen name="Guide"           component={GuideScreen}           />
                <Stack.Screen name="PrayerGuide"     component={PrayerGuideScreen}     />
                <Stack.Screen name="AblutionGuide"   component={AblutionGuideScreen}   />
                <Stack.Screen name="EsmaUlHusna"     component={EsmaUlHusnaScreen}     />
              </>
            )
          ) : (
            <Stack.Screen name="Auth" component={AuthScreen} />
          )}
        </Stack.Navigator>
      </StatsProvider>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <AuthProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
