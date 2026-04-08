import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AvatarPreview } from '../components/AvatarPreview';
import { ProgressBar } from '../components/ProgressBar';
import { RankBadge } from '../components/RankBadge';
import { ScreenHeader } from '../components/ScreenHeader';
import { SurfaceCard } from '../components/SurfaceCard';
import { rankConfig } from '../config/game';
import { useApp } from '../state/AppProvider';
import { theme } from '../theme/theme';
import { formatDuration, formatVolume } from '../utils/format';

export function WorkoutSummaryScreen() {
  const {
    lastWorkoutReward,
    lastWorkout,
    currentUser,
    quests,
    cosmetics,
    setActiveScreen,
    startWorkout,
  } = useApp();

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

  const completedQuests = lastWorkoutReward.completedQuestIds
    .map((questId) => quests.find((quest) => quest.id === questId))
    .filter((quest): quest is NonNullable<(typeof quests)[number]> => Boolean(quest));
  const nextRankStop = rankConfig.find((rank) => rank.minXp > currentUser.xp) ?? null;
  const xpToNextRank = nextRankStop ? Math.max(0, nextRankStop.minXp - currentUser.xp) : 0;
  const questBoard = [
    ...completedQuests,
    ...quests.filter((quest) => !lastWorkoutReward.completedQuestIds.includes(quest.id)),
  ].slice(0, 4);
  const payoutRows = [
    { label: 'Base workout', value: lastWorkoutReward.baseXp, tone: theme.colors.text },
    { label: 'Consistency bonus', value: lastWorkoutReward.consistencyXp, tone: theme.colors.accent },
    { label: 'Quest payout', value: lastWorkoutReward.questXp, tone: theme.colors.accentAlt },
    { label: 'PR bonus', value: lastWorkoutReward.prXp, tone: theme.colors.warning },
  ];

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ScreenHeader
        eyebrow="Workout Complete"
        title="Payout Secured"
        subtitle="Your rank rail moved, the streak stayed alive, and the reward board is ready to collect."
        rightNode={<RankBadge rank={lastWorkoutReward.rankAfter} />}
      />

      <SurfaceCard style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroCopyWrap}>
            <Text style={styles.heroLabel}>{lastWorkout.title}</Text>
            <Text style={styles.heroXpValue}>+{lastWorkoutReward.totalXp} XP</Text>
            <Text style={styles.heroCopy}>
              {lastWorkout.totalSets} total sets in {formatDuration(lastWorkout.durationMinutes)} with{' '}
              {formatVolume(lastWorkout.totalVolume)} moved.
            </Text>
          </View>
          <AvatarPreview user={currentUser} cosmetics={cosmetics} compact />
        </View>

        <View style={styles.sessionLootCard}>
          {payoutRows.map((row) => (
            <View key={row.label} style={styles.lootRow}>
              <Text style={styles.lootLabel}>{row.label}</Text>
              <Text style={[styles.lootValue, { color: row.tone }]}>+{row.value} XP</Text>
            </View>
          ))}
        </View>

        <View style={styles.heroStatGrid}>
          <View style={styles.heroStatTile}>
            <Text style={styles.heroStatValue}>{lastWorkoutReward.streak}</Text>
            <Text style={styles.heroStatLabel}>Streak Alive</Text>
          </View>
          <View style={styles.heroStatTile}>
            <Text style={styles.heroStatValue}>+{lastWorkoutReward.currencyEarned}</Text>
            <Text style={styles.heroStatLabel}>Gym Coins</Text>
          </View>
          <View style={styles.heroStatTile}>
            <Text style={styles.heroStatValue}>{lastWorkoutReward.discoveredPrs.length}</Text>
            <Text style={styles.heroStatLabel}>PRs Locked</Text>
          </View>
          <View style={styles.heroStatTile}>
            <Text style={styles.heroStatValue}>{lastWorkoutReward.completedQuestIds.length}</Text>
            <Text style={styles.heroStatLabel}>Quest Clears</Text>
          </View>
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Rank rail</Text>
        {lastWorkoutReward.rankBefore !== lastWorkoutReward.rankAfter && (
          <View style={styles.rankUpBanner}>
            <Text style={styles.rankUpText}>
              Rank up: {lastWorkoutReward.rankBefore} to {lastWorkoutReward.rankAfter}
            </Text>
          </View>
        )}
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
        <Text style={styles.rankMeta}>
          {nextRankStop
            ? `${xpToNextRank} XP until ${nextRankStop.tier}`
            : 'Elite reached. You are at the top of the current rank ladder.'}
        </Text>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Quest board</Text>
        <Text style={styles.sectionCopy}>
          The reward loop is strongest when each session visibly pushes quests forward.
        </Text>
        <View style={styles.questStack}>
          {questBoard.map((quest) => (
            <View key={quest.id} style={styles.questRow}>
              <View style={styles.questHeader}>
                <View>
                  <Text style={styles.questEyebrow}>
                    {quest.iconLabel} / {quest.cadence}
                  </Text>
                  <Text style={styles.questTitle}>{quest.title}</Text>
                </View>
                <Text
                  style={[
                    styles.questStatus,
                    quest.completed ? styles.questStatusComplete : null,
                  ]}
                >
                  {quest.completed ? 'Cleared' : `${quest.progress}/${quest.target}`}
                </Text>
              </View>
              <ProgressBar
                progress={quest.progress / quest.target}
                label={quest.description}
                caption={`${quest.progress}/${quest.target}`}
                tone={quest.completed ? theme.colors.accent : theme.colors.accentAlt}
              />
            </View>
          ))}
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Personal records</Text>
        {lastWorkoutReward.discoveredPrs.length > 0 ? (
          <View style={styles.stack}>
            {lastWorkoutReward.discoveredPrs.map((pr) => (
              <View key={pr} style={styles.prRow}>
                <Text style={styles.prText}>{pr}</Text>
                <Text style={styles.unlockText}>
                  New high-water mark recorded to your progress timeline.
                </Text>
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
    gap: 18,
    borderColor: theme.colors.accentAlt,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    alignItems: 'center',
  },
  heroCopyWrap: {
    flex: 1,
    gap: 8,
  },
  heroLabel: {
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    fontSize: 12,
    fontFamily: theme.fonts.mono,
  },
  heroXpValue: {
    color: theme.colors.text,
    fontSize: 48,
    fontWeight: '900',
    fontFamily: theme.fonts.display,
  },
  heroCopy: {
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  sessionLootCard: {
    gap: 10,
    padding: 14,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  lootRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  lootLabel: {
    color: theme.colors.textMuted,
    fontSize: 13,
  },
  lootValue: {
    fontWeight: '800',
    fontFamily: theme.fonts.mono,
    letterSpacing: 1,
  },
  heroStatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  heroStatTile: {
    width: '48%',
    minWidth: 140,
    padding: 14,
    borderRadius: theme.radius.md,
    backgroundColor: `${theme.colors.accent}10`,
    borderWidth: 1,
    borderColor: `${theme.colors.accent}35`,
  },
  heroStatValue: {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: '800',
    fontFamily: theme.fonts.display,
  },
  heroStatLabel: {
    color: theme.colors.textMuted,
    marginTop: 6,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontFamily: theme.fonts.mono,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    fontFamily: theme.fonts.display,
  },
  sectionCopy: {
    color: theme.colors.textMuted,
    lineHeight: 20,
    marginBottom: 14,
  },
  spacer: {
    height: 14,
  },
  rankUpBanner: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
    borderRadius: theme.radius.sm,
    backgroundColor: `${theme.colors.warning}18`,
    borderWidth: 1,
    borderColor: `${theme.colors.warning}55`,
  },
  rankUpText: {
    color: theme.colors.warning,
    fontWeight: '700',
    fontFamily: theme.fonts.mono,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  rankMeta: {
    marginTop: 12,
    color: theme.colors.textMuted,
    lineHeight: 20,
  },
  questStack: {
    gap: 12,
  },
  questRow: {
    padding: 14,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceSoft,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 10,
  },
  questHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'flex-start',
  },
  questEyebrow: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontFamily: theme.fonts.mono,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  questTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
  },
  questStatus: {
    color: theme.colors.accentAlt,
    fontFamily: theme.fonts.mono,
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  questStatusComplete: {
    color: theme.colors.accent,
  },
  stack: {
    gap: 10,
  },
  prRow: {
    padding: 12,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceSoft,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
