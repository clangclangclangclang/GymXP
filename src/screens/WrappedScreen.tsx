import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ScreenHeader } from '../components/ScreenHeader';
import { SurfaceCard } from '../components/SurfaceCard';
import { useApp } from '../state/AppProvider';
import { theme } from '../theme/theme';
import { formatCompactNumber, formatVolume } from '../utils/format';

export function WrappedScreen() {
  const { yearlySummary, currentUser, setActiveScreen } = useApp();

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ScreenHeader
        eyebrow="Gym Wrapped"
        title={`${yearlySummary.year} Recap`}
        subtitle="A shareable yearly summary card that turns training consistency into something social."
      />

      <SurfaceCard style={styles.shareCard}>
        <Text style={styles.shareEyebrow}>GymXP Wrapped</Text>
        <Text style={styles.shareTitle}>{currentUser.displayName}</Text>
        <Text style={styles.shareRank}>{currentUser.rank} Rank</Text>
        <View style={styles.shareGrid}>
          <View style={styles.shareMetric}>
            <Text style={styles.shareValue}>{yearlySummary.totalWorkouts}</Text>
            <Text style={styles.shareLabel}>Workouts</Text>
          </View>
          <View style={styles.shareMetric}>
            <Text style={styles.shareValue}>{formatCompactNumber(yearlySummary.xpEarned)}</Text>
            <Text style={styles.shareLabel}>XP Earned</Text>
          </View>
          <View style={styles.shareMetric}>
            <Text style={styles.shareValue}>{yearlySummary.streakRecord}</Text>
            <Text style={styles.shareLabel}>Best Streak</Text>
          </View>
          <View style={styles.shareMetric}>
            <Text style={styles.shareValue}>{formatCompactNumber(yearlySummary.totalVolume)}</Text>
            <Text style={styles.shareLabel}>Volume</Text>
          </View>
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Highlights</Text>
        <View style={styles.stack}>
          <View style={styles.highlightCard}>
            <Text style={styles.highlightLabel}>Favorite exercises</Text>
            <Text style={styles.highlightValue}>{yearlySummary.favoriteExercises.join(', ')}</Text>
          </View>
          <View style={styles.highlightCard}>
            <Text style={styles.highlightLabel}>PR highlights</Text>
              <Text style={styles.highlightValue}>
              {yearlySummary.prHighlights.length > 0
                ? yearlySummary.prHighlights.join(' / ')
                : 'More PRs are waiting next session.'}
            </Text>
          </View>
          <View style={styles.highlightCard}>
            <Text style={styles.highlightLabel}>Total volume</Text>
            <Text style={styles.highlightValue}>{formatVolume(yearlySummary.totalVolume)}</Text>
          </View>
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Rank progression</Text>
        <View style={styles.stack}>
          {yearlySummary.rankProgression.map((stop) => (
            <View key={`${stop.rank}-${stop.date}`} style={styles.progressRow}>
              <Text style={styles.progressRank}>{stop.rank}</Text>
              <Text style={styles.progressDate}>
                {new Date(stop.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </View>
          ))}
        </View>
      </SurfaceCard>

      <Pressable style={styles.primaryButton} onPress={() => setActiveScreen('home')}>
        <Text style={styles.primaryButtonText}>Back To Dashboard</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 22,
    gap: 22,
  },
  shareCard: {
    backgroundColor: theme.colors.surfaceElevated,
    gap: 12,
  },
  shareEyebrow: {
    color: theme.colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    fontSize: 12,
  },
  shareTitle: {
    color: theme.colors.text,
    fontSize: 30,
    fontWeight: '900',
  },
  shareRank: {
    color: theme.colors.warning,
    fontSize: 18,
    fontWeight: '700',
  },
  shareGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  shareMetric: {
    width: '48%',
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: theme.radius.md,
    padding: 14,
  },
  shareValue: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '900',
  },
  shareLabel: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  stack: {
    gap: 10,
  },
  highlightCard: {
    padding: 14,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceSoft,
  },
  highlightLabel: {
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 12,
  },
  highlightValue: {
    color: theme.colors.text,
    lineHeight: 22,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  progressRank: {
    color: theme.colors.text,
    fontWeight: '700',
    fontSize: 15,
  },
  progressDate: {
    color: theme.colors.textMuted,
  },
  primaryButton: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    paddingVertical: 16,
  },
  primaryButtonText: {
    color: theme.colors.background,
    fontWeight: '900',
  },
});
