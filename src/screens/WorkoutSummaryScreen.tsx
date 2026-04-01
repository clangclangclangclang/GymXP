import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { MetricChip } from '../components/MetricChip';
import { ProgressBar } from '../components/ProgressBar';
import { RankBadge } from '../components/RankBadge';
import { ScreenHeader } from '../components/ScreenHeader';
import { SurfaceCard } from '../components/SurfaceCard';
import { useApp } from '../state/AppProvider';
import { theme } from '../theme/theme';
import { formatDuration, formatVolume } from '../utils/format';

export function WorkoutSummaryScreen() {
  const { lastWorkoutReward, lastWorkout, setActiveScreen, startWorkout } = useApp();

  if (!lastWorkoutReward || !lastWorkout) {
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <SurfaceCard>
          <Text style={styles.emptyTitle}>No workout summary yet</Text>
          <Text style={styles.emptyCopy}>
            Finish a workout to see rank impact, streak progress, quests, and PRs.
          </Text>
        </SurfaceCard>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ScreenHeader
        eyebrow="Workout Complete"
        title={`+${lastWorkoutReward.totalXp} XP`}
        subtitle="Your reward loop just fired. Review the gains, then get back after the next streak tile."
        rightNode={<RankBadge rank={lastWorkoutReward.rankAfter} />}
      />

      <SurfaceCard style={styles.heroCard}>
        <Text style={styles.heroLabel}>{lastWorkout.title}</Text>
        <Text style={styles.heroValue}>{formatVolume(lastWorkout.totalVolume)}</Text>
        <Text style={styles.heroCopy}>
          {lastWorkout.totalSets} total sets in {formatDuration(lastWorkout.durationMinutes)}
        </Text>

        <View style={styles.metricRow}>
          <MetricChip label="Base XP" value={`${lastWorkoutReward.baseXp}`} />
          <MetricChip label="PR Bonus" value={`${lastWorkoutReward.prXp}`} tone={theme.colors.warning} />
          <MetricChip label="Quest XP" value={`${lastWorkoutReward.questXp}`} tone={theme.colors.accentAlt} />
        </View>

        <View style={styles.metricRow}>
          <MetricChip
            label="Currency"
            value={`+${lastWorkoutReward.currencyEarned} GC`}
            tone={theme.colors.warning}
          />
          <MetricChip label="Streak" value={`${lastWorkoutReward.streak} days`} tone={theme.colors.accent} />
          <MetricChip label="PRs" value={`${lastWorkoutReward.discoveredPrs.length}`} />
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Rank impact</Text>
        <ProgressBar
          progress={lastWorkoutReward.rankProgressBefore}
          label={`Before / ${lastWorkoutReward.rankBefore}`}
          caption={`${Math.round(lastWorkoutReward.rankProgressBefore * 100)}%`}
          tone={theme.colors.textMuted}
        />
        <View style={styles.spacer} />
        <ProgressBar
          progress={lastWorkoutReward.rankProgressAfter}
          label={`After / ${lastWorkoutReward.rankAfter}`}
          caption={`${Math.round(lastWorkoutReward.rankProgressAfter * 100)}%`}
          tone={theme.colors.accent}
        />
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Quest clears</Text>
        {lastWorkoutReward.completedQuestIds.length > 0 ? (
          <View style={styles.chipWrap}>
            {lastWorkoutReward.completedQuestIds.map((questId) => (
              <View key={questId} style={styles.rewardChip}>
                <Text style={styles.rewardChipText}>{questId}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyCopy}>
            No quest fully cleared this session, but the progress bar moved.
          </Text>
        )}
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Personal records</Text>
        {lastWorkoutReward.discoveredPrs.length > 0 ? (
          <View style={styles.stack}>
            {lastWorkoutReward.discoveredPrs.map((pr) => (
              <View key={pr} style={styles.prRow}>
                <Text style={styles.prText}>{pr}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyCopy}>
            No new PRs this time. The consistency bonus still keeps progression rewarding.
          </Text>
        )}
      </SurfaceCard>

      {lastWorkoutReward.unlockedCosmetics.length > 0 && (
        <SurfaceCard>
          <Text style={styles.sectionTitle}>New cosmetic unlocks</Text>
          <View style={styles.stack}>
            {lastWorkoutReward.unlockedCosmetics.map((cosmetic) => (
              <View key={cosmetic.id} style={styles.prRow}>
                <Text style={styles.prText}>{cosmetic.name}</Text>
                <Text style={styles.unlockText}>{cosmetic.description}</Text>
              </View>
            ))}
          </View>
        </SurfaceCard>
      )}

      <View style={styles.buttonRow}>
        <Pressable style={styles.secondaryButton} onPress={() => setActiveScreen('feed')}>
          <Text style={styles.secondaryButtonText}>See Shared Post</Text>
        </Pressable>
        <Pressable style={styles.primaryButton} onPress={() => startWorkout()}>
          <Text style={styles.primaryButtonText}>Log Another Workout</Text>
        </Pressable>
      </View>

      <Pressable style={styles.footerLink} onPress={() => setActiveScreen('home')}>
        <Text style={styles.footerLinkText}>Back to Dashboard</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 22,
    gap: 22,
  },
  heroCard: {
    backgroundColor: theme.colors.surfaceElevated,
    gap: 14,
    borderColor: theme.colors.accentAlt,
  },
  heroLabel: {
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    fontSize: 12,
    fontFamily: theme.fonts.mono,
  },
  heroValue: {
    color: theme.colors.text,
    fontSize: 40,
    fontWeight: '900',
    fontFamily: theme.fonts.display,
  },
  heroCopy: {
    color: theme.colors.textMuted,
    fontSize: 14,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 10,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    fontFamily: theme.fonts.display,
  },
  spacer: {
    height: 14,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  rewardChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surfaceSoft,
  },
  rewardChipText: {
    color: theme.colors.accent,
    fontWeight: '700',
    fontFamily: theme.fonts.mono,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  stack: {
    gap: 10,
  },
  prRow: {
    padding: 12,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceSoft,
  },
  prText: {
    color: theme.colors.text,
    fontWeight: '600',
  },
  unlockText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginTop: 6,
    lineHeight: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  secondaryButtonText: {
    color: theme.colors.text,
    fontWeight: '700',
    fontFamily: theme.fonts.mono,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    backgroundColor: theme.colors.accent,
  },
  primaryButtonText: {
    color: theme.colors.background,
    fontWeight: '900',
    fontFamily: theme.fonts.mono,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  footerLink: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  footerLinkText: {
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  emptyTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  emptyCopy: {
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
});
