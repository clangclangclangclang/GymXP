import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AvatarPreview } from '../components/AvatarPreview';
import { RankBadge } from '../components/RankBadge';
import { ScreenHeader } from '../components/ScreenHeader';
import { SurfaceCard } from '../components/SurfaceCard';
import { useApp } from '../state/AppProvider';
import { theme } from '../theme/theme';

export function LeaderboardScreen() {
  const { currentUser, users, friendships, cosmetics, leaderboardScope, setLeaderboardScope } = useApp();
  const friendIds = friendships
    .filter((friendship) => friendship.userId === currentUser.id)
    .map((friendship) => friendship.friendId);
  const rankedUsers = users
    .filter((user) => {
      if (leaderboardScope === 'global') {
        return true;
      }

      return user.id === currentUser.id || friendIds.includes(user.id);
    })
    .sort((left, right) => right.xp - left.xp);

  const podium = rankedUsers.slice(0, 3);
  const rest = rankedUsers.slice(3);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ScreenHeader
        eyebrow="Arena"
        title="Leaderboards"
        subtitle="Compete with friends or check where your momentum stacks up globally."
      />

      <View style={styles.toggleRow}>
        <Pressable
          style={[styles.toggleButton, leaderboardScope === 'friends' ? styles.toggleActive : null]}
          onPress={() => setLeaderboardScope('friends')}
        >
          <Text style={[styles.toggleText, leaderboardScope === 'friends' ? styles.toggleTextActive : null]}>
            Friends
          </Text>
        </Pressable>
        <Pressable
          style={[styles.toggleButton, leaderboardScope === 'global' ? styles.toggleActive : null]}
          onPress={() => setLeaderboardScope('global')}
        >
          <Text style={[styles.toggleText, leaderboardScope === 'global' ? styles.toggleTextActive : null]}>
            Global
          </Text>
        </Pressable>
      </View>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Top 3</Text>
        <View style={styles.podiumRow}>
          {podium.map((user, index) => (
            <View
              key={user.id}
              style={[
                styles.podiumCard,
                { borderColor: index === 0 ? theme.colors.warning : index === 1 ? theme.colors.silver : theme.colors.bronze },
              ]}
            >
              <Text style={styles.podiumPlace}>#{index + 1}</Text>
              <View style={styles.podiumAvatarWrap}>
                <AvatarPreview user={user} cosmetics={cosmetics} size={92} compact />
              </View>
              <Text style={styles.podiumName}>{user.displayName}</Text>
              <Text style={styles.podiumXp}>{user.xp} XP</Text>
              <Text style={styles.podiumMeta}>{user.streak} day streak</Text>
            </View>
          ))}
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Ranked list</Text>
        <View style={styles.stack}>
          {rest.map((user, index) => (
            <View key={user.id} style={styles.row}>
              <Text style={styles.rowPlace}>#{index + 4}</Text>
              <AvatarPreview user={user} cosmetics={cosmetics} size={58} compact />
              <View style={styles.rowCopy}>
                <Text style={styles.rowName}>{user.displayName}</Text>
                <Text style={styles.rowMeta}>
                  @{user.username} / {user.streak} day streak / {user.totalWorkouts} workouts
                </Text>
              </View>
              <View style={styles.rowRight}>
                <RankBadge rank={user.rank} />
                <Text style={styles.rowXp}>{user.xp} XP</Text>
              </View>
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
  toggleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  toggleButton: {
    flex: 1,
    borderRadius: theme.radius.sm,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  toggleActive: {
    backgroundColor: theme.colors.accent,
  },
  toggleText: {
    color: theme.colors.textMuted,
    fontWeight: '700',
    fontFamily: theme.fonts.mono,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  toggleTextActive: {
    color: theme.colors.background,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    fontFamily: theme.fonts.display,
  },
  podiumRow: {
    gap: 10,
  },
  podiumCard: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    backgroundColor: theme.colors.surfaceSoft,
    padding: 16,
    alignItems: 'center',
  },
  podiumPlace: {
    color: theme.colors.textMuted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontFamily: theme.fonts.mono,
  },
  podiumAvatarWrap: {
    marginTop: 8,
    marginBottom: 6,
  },
  podiumName: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 6,
    fontFamily: theme.fonts.display,
  },
  podiumXp: {
    color: theme.colors.accent,
    fontSize: 22,
    fontWeight: '900',
    marginTop: 8,
    fontFamily: theme.fonts.display,
  },
  podiumMeta: {
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  stack: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  rowPlace: {
    width: 34,
    color: theme.colors.textMuted,
    fontWeight: '700',
  },
  rowCopy: {
    flex: 1,
  },
  rowName: {
    color: theme.colors.text,
    fontWeight: '700',
    fontSize: 15,
    fontFamily: theme.fonts.display,
  },
  rowMeta: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginTop: 4,
    fontFamily: theme.fonts.mono,
  },
  rowRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  rowXp: {
    color: theme.colors.accent,
    fontWeight: '800',
    fontSize: 13,
    fontFamily: theme.fonts.mono,
  },
});
