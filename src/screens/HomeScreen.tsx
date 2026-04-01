import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AvatarPreview } from '../components/AvatarPreview';
import { MetricChip } from '../components/MetricChip';
import { ProgressBar } from '../components/ProgressBar';
import { RankBadge } from '../components/RankBadge';
import { ScreenHeader } from '../components/ScreenHeader';
import { SurfaceCard } from '../components/SurfaceCard';
import { rankConfig } from '../config/game';
import { getRankProgress } from '../services/gameEngine';
import { useApp } from '../state/AppProvider';
import { theme } from '../theme/theme';
import { formatVolume } from '../utils/format';

export function HomeScreen() {
  const { currentUser, workouts, quests, routines, users, cosmetics, startWorkout, setActiveScreen } = useApp();
  const nextRank = rankConfig.find((rank) => rank.minXp > currentUser.xp);
  const topFriend = users
    .filter((user) => user.id !== currentUser.id)
    .sort((left, right) => right.xp - left.xp)[0];

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ScreenHeader
        eyebrow="Dashboard"
        title={`Welcome back, ${currentUser.displayName.split(' ')[0]}`}
        subtitle="Keep the streak hot, clear quests, and close the XP gap on your crew."
        rightNode={<RankBadge rank={currentUser.rank} />}
      />

      <SurfaceCard style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroCopyWrap}>
            <Text style={styles.heroLabel}>Current Rank</Text>
            <Text style={styles.heroXp}>{currentUser.xp} XP</Text>
            <Text style={styles.heroSubtitle}>
              {nextRank ? `${nextRank.tier} unlocks at ${nextRank.minXp} XP` : 'You are in the top tier.'}
            </Text>
          </View>
          <AvatarPreview user={currentUser} cosmetics={cosmetics} size={104} compact />
        </View>
        <ProgressBar
          progress={getRankProgress(currentUser.xp)}
          label="Rank progress"
          caption={`${Math.round(getRankProgress(currentUser.xp) * 100)}%`}
        />
        <View style={styles.metricRow}>
          <MetricChip label="Streak" value={`${currentUser.streak} days`} tone={theme.colors.accent} />
          <MetricChip label="Currency" value={`${currentUser.currency} GC`} tone={theme.colors.warning} />
          <MetricChip label="Workouts" value={`${currentUser.totalWorkouts}`} />
        </View>
      </SurfaceCard>

      <View style={styles.ctaRow}>
        <Pressable style={styles.primaryButton} onPress={() => startWorkout()}>
          <Text style={styles.primaryButtonText}>Start Workout</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => setActiveScreen('wrapped')}>
          <Text style={styles.secondaryButtonText}>Open Gym Wrapped</Text>
        </Pressable>
      </View>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Fast Start</Text>
        <Text style={styles.sectionSubtitle}>
          Pick a saved routine to get straight into logging with preloaded exercises.
        </Text>
        <View style={styles.stack}>
          {routines.map((routine) => (
            <Pressable
              key={routine.id}
              style={[styles.routineCard, { borderColor: routine.accent }]}
              onPress={() => startWorkout(routine.id)}
            >
              <View>
                <Text style={styles.routineTitle}>{routine.name}</Text>
                <Text style={styles.routineCopy}>{routine.description}</Text>
              </View>
              <Text style={[styles.routineMeta, { color: routine.accent }]}>
                {routine.exerciseIds.length} exercises
              </Text>
            </Pressable>
          ))}
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Quest Momentum</Text>
        <View style={styles.stack}>
          {quests.slice(0, 3).map((quest) => (
            <View key={quest.id} style={styles.questRow}>
              <View style={styles.questText}>
                <Text style={styles.questTitle}>{quest.title}</Text>
                <Text style={styles.questCopy}>{quest.description}</Text>
              </View>
              <View style={styles.questProgress}>
                <ProgressBar
                  progress={quest.progress / quest.target}
                  tone={quest.completed ? theme.colors.accent : theme.colors.accentAlt}
                  caption={`${quest.progress}/${quest.target}`}
                />
              </View>
            </View>
          ))}
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Social Pressure</Text>
        <Text style={styles.friendHeadline}>
          {topFriend.displayName} is ahead with {topFriend.xp - currentUser.xp} XP.
        </Text>
        <Text style={styles.sectionSubtitle}>
          Beat your friends this week by protecting the streak and clearing PR quests.
        </Text>
        <Pressable style={styles.secondaryAction} onPress={() => setActiveScreen('leaderboard')}>
          <Text style={styles.secondaryActionText}>View Leaderboards</Text>
        </Pressable>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Recent Sessions</Text>
        <View style={styles.stack}>
          {workouts.slice(0, 3).map((workout) => (
            <View key={workout.id} style={styles.historyRow}>
              <View>
                <Text style={styles.historyTitle}>{workout.title}</Text>
                <Text style={styles.historyCopy}>
                  {workout.totalSets} sets / {formatVolume(workout.totalVolume)}
                </Text>
              </View>
              <Text style={styles.historyXp}>+{workout.xpAwarded} XP</Text>
            </View>
          ))}
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
  heroXp: {
    color: theme.colors.text,
    fontSize: 42,
    fontWeight: '900',
    fontFamily: theme.fonts.display,
  },
  heroSubtitle: {
    color: theme.colors.textMuted,
    lineHeight: 20,
    marginBottom: 4,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  heroCopyWrap: {
    flex: 1,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 10,
  },
  ctaRow: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    paddingVertical: 16,
  },
  primaryButtonText: {
    color: theme.colors.background,
    fontWeight: '800',
    fontSize: 14,
    fontFamily: theme.fonts.mono,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  secondaryButtonText: {
    color: theme.colors.text,
    fontWeight: '700',
    fontSize: 14,
    fontFamily: theme.fonts.mono,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    fontFamily: theme.fonts.display,
  },
  sectionSubtitle: {
    color: theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 14,
  },
  stack: {
    gap: 12,
  },
  routineCard: {
    borderWidth: 1,
    borderRadius: theme.radius.md,
    padding: 14,
    backgroundColor: theme.colors.surfaceSoft,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  routineTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '700',
    fontFamily: theme.fonts.display,
  },
  routineCopy: {
    color: theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
  },
  routineMeta: {
    fontWeight: '700',
    fontSize: 12,
    fontFamily: theme.fonts.mono,
  },
  questRow: {
    gap: 10,
  },
  questText: {
    gap: 4,
  },
  questTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  questCopy: {
    color: theme.colors.textMuted,
    fontSize: 13,
  },
  questProgress: {
    marginTop: 4,
  },
  friendHeadline: {
    color: theme.colors.text,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '800',
    marginBottom: 8,
  },
  secondaryAction: {
    alignSelf: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surfaceSoft,
  },
  secondaryActionText: {
    color: theme.colors.text,
    fontWeight: '700',
    fontFamily: theme.fonts.mono,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  historyTitle: {
    color: theme.colors.text,
    fontWeight: '700',
    fontSize: 14,
  },
  historyCopy: {
    color: theme.colors.textMuted,
    fontSize: 13,
    marginTop: 4,
  },
  historyXp: {
    color: theme.colors.accent,
    fontWeight: '800',
    fontSize: 14,
  },
});
