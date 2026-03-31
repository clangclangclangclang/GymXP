import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';

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
  const { isAuthenticated, activeScreen } = useApp();

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.backgroundOrbs} pointerEvents="none">
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
  backgroundOrbs: {
    ...StyleSheet.absoluteFillObject,
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.18,
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
});
