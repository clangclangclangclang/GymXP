import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { BottomNav } from './src/components/BottomNav';
import { HomeScreen } from './src/screens/HomeScreen';
import { LeaderboardScreen } from './src/screens/LeaderboardScreen';
import { LiveWorkoutScreen } from './src/screens/LiveWorkoutScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { ProgressScreen } from './src/screens/ProgressScreen';
import { QuestsScreen } from './src/screens/QuestsScreen';
import { FeedScreen } from './src/screens/FeedScreen';
import { WorkoutSummaryScreen } from './src/screens/WorkoutSummaryScreen';
import { WrappedScreen } from './src/screens/WrappedScreen';
import { AppProvider, useApp } from './src/state/AppProvider';
import { theme } from './src/theme/theme';

function ActiveScreen() {
  const { isAuthenticated, isHydrating, activeScreen } = useApp();

  if (isHydrating) {
    return (
      <View style={styles.loadingScreen}>
        <Text style={styles.loadingEyebrow}>Syncing GymXP</Text>
        <Text style={styles.loadingTitle}>Loading your rank, streaks, and last saved progress.</Text>
        <ActivityIndicator size="small" color={theme.colors.accent} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <OnboardingScreen />;
  }

  if (activeScreen === 'workout') {
    return <LiveWorkoutScreen />;
  }

  if (activeScreen === 'summary') {
    return <WorkoutSummaryScreen />;
  }

  if (activeScreen === 'progress') {
    return <ProgressScreen />;
  }

  if (activeScreen === 'leaderboard') {
    return <LeaderboardScreen />;
  }

  if (activeScreen === 'feed') {
    return <FeedScreen />;
  }

  if (activeScreen === 'quests') {
    return <QuestsScreen />;
  }

  if (activeScreen === 'profile') {
    return <ProfileScreen />;
  }

  if (activeScreen === 'wrapped') {
    return <WrappedScreen />;
  }

  return <HomeScreen />;
}

function AppShell() {
  const { isAuthenticated, activeScreen, setActiveScreen } = useApp();
  const showBottomNav = isAuthenticated && activeScreen !== 'workout' && activeScreen !== 'summary';
  const horizontalGrid = Array.from({ length: 7 }, (_, index) => index);
  const verticalGrid = Array.from({ length: 5 }, (_, index) => index);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.backgroundOrbs} pointerEvents="none">
        {horizontalGrid.map((index) => (
          <View key={`h-${index}`} style={[styles.gridLineHorizontal, { top: 84 + index * 96 }]} />
        ))}
        {verticalGrid.map((index) => (
          <View key={`v-${index}`} style={[styles.gridLineVertical, { left: 20 + index * 96 }]} />
        ))}
        <View style={[styles.orb, styles.orbPrimary]} />
        <View style={[styles.orb, styles.orbSecondary]} />
        <View style={[styles.orb, styles.orbTertiary]} />
      </View>
      <View style={styles.screenWrap}>
        <ActiveScreen />
      </View>
      {showBottomNav && <BottomNav activeScreen={activeScreen} onChange={setActiveScreen} />}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  screenWrap: {
    flex: 1,
  },
  loadingScreen: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
    gap: 14,
  },
  loadingEyebrow: {
    color: theme.colors.accent,
    fontSize: 13,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontFamily: theme.fonts.mono,
  },
  loadingTitle: {
    color: theme.colors.text,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
    fontFamily: theme.fonts.display,
  },
  backgroundOrbs: {
    ...StyleSheet.absoluteFillObject,
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.12,
  },
  orbPrimary: {
    width: 260,
    height: 260,
    backgroundColor: theme.colors.accent,
    top: -70,
    right: -80,
  },
  orbSecondary: {
    width: 220,
    height: 220,
    backgroundColor: theme.colors.accentAlt,
    bottom: 140,
    left: -90,
  },
  orbTertiary: {
    width: 180,
    height: 180,
    backgroundColor: theme.colors.warning,
    bottom: -50,
    right: 30,
  },
  gridLineHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(212, 255, 54, 0.07)',
  },
  gridLineVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(208, 140, 46, 0.08)',
  },
});
