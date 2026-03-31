import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { BarChart } from '../components/BarChart';
import { MetricChip } from '../components/MetricChip';
import { ScreenHeader } from '../components/ScreenHeader';
import { SurfaceCard } from '../components/SurfaceCard';
import { getStrengthTrend, getVolumeTrend, getWorkoutFrequency } from '../services/gameEngine';
import { useApp } from '../state/AppProvider';
import { theme } from '../theme/theme';
import { formatCompactNumber, formatVolume } from '../utils/format';

export function ProgressScreen() {
  const { workouts, progress, yearlySummary } = useApp();
  const focusExercise = yearlySummary.favoriteExercises[0] ?? 'Barbell Bench Press';
  const strengthTrend = getStrengthTrend(workouts, focusExercise);
  const volumeTrend = getVolumeTrend(progress);
  const frequencyTrend = getWorkoutFrequency(workouts);
  const latestWeight = progress[0]?.bodyweight ?? 79.2;
  const totalPrs = workouts.reduce((sum, workout) => sum + workout.prHighlights.length, 0);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ScreenHeader
        eyebrow="Progress"
        title="Stats that show motion"
        subtitle="Strength, volume, frequency, bodyweight, and PR momentum all in one place."
      />

      <View style={styles.metricRow}>
        <MetricChip label="Workouts YTD" value={`${yearlySummary.totalWorkouts}`} />
        <MetricChip label="PRs Hit" value={`${totalPrs}`} tone={theme.colors.warning} />
        <MetricChip label="Bodyweight" value={`${latestWeight.toFixed(1)} kg`} tone={theme.colors.accent} />
      </View>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Volume trend</Text>
        <Text style={styles.sectionSubtitle}>
          Weekly volume keeps the app rewarding progression without pushing reckless max attempts.
        </Text>
        <BarChart data={volumeTrend} tone={theme.colors.accent} formatter={(value) => formatCompactNumber(value)} />
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>{focusExercise} trend</Text>
        <Text style={styles.sectionSubtitle}>Best weight by recent session for your top movement.</Text>
        <BarChart data={strengthTrend} tone={theme.colors.warning} formatter={(value) => `${value}kg`} />
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Training frequency</Text>
        <Text style={styles.sectionSubtitle}>Your week is strongest when the habit stays distributed.</Text>
        <BarChart data={frequencyTrend} tone={theme.colors.accentAlt} formatter={(value) => `${value}`} />
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Milestones</Text>
        <View style={styles.stack}>
          <View style={styles.milestoneCard}>
            <Text style={styles.milestoneTitle}>Best session volume</Text>
            <Text style={styles.milestoneValue}>{formatVolume(Math.max(...workouts.map((workout) => workout.totalVolume), 0))}</Text>
          </View>
          <View style={styles.milestoneCard}>
            <Text style={styles.milestoneTitle}>Longest streak</Text>
            <Text style={styles.milestoneValue}>{yearlySummary.streakRecord} days</Text>
          </View>
          <View style={styles.milestoneCard}>
            <Text style={styles.milestoneTitle}>Favorite exercise</Text>
            <Text style={styles.milestoneValue}>{focusExercise}</Text>
          </View>
        </View>
      </SurfaceCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 22,
    gap: 22,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 10,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionSubtitle: {
    color: theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 14,
  },
  stack: {
    gap: 10,
  },
  milestoneCard: {
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: theme.radius.md,
    padding: 14,
  },
  milestoneTitle: {
    color: theme.colors.textMuted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  milestoneValue: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
});

