import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AvatarPreview } from '../components/AvatarPreview';
import { MetricChip } from '../components/MetricChip';
import { RankBadge } from '../components/RankBadge';
import { ScreenHeader } from '../components/ScreenHeader';
import { SurfaceCard } from '../components/SurfaceCard';
import { CosmeticSlot } from '../types/models';
import { useApp } from '../state/AppProvider';
import { theme } from '../theme/theme';
import { formatDateLabel, formatJoinedDate } from '../utils/format';

const slotSections: Array<{ slot: CosmeticSlot; label: string }> = [
  { slot: 'frame', label: 'Frame' },
  { slot: 'face', label: 'Face' },
  { slot: 'top', label: 'Top' },
  { slot: 'aura', label: 'Aura' },
];

export function ProfileScreen() {
  const {
    currentUser,
    users,
    friendships,
    workouts,
    cosmetics,
    toggleFollow,
    selectAvatarCosmetic,
    setActiveScreen,
  } = useApp();
  const friendIds = friendships
    .filter((friendship) => friendship.userId === currentUser.id)
    .map((friendship) => friendship.friendId);
  const suggestions = users.filter(
    (user) => user.id !== currentUser.id && !friendIds.includes(user.id)
  );
  const nextCosmeticUnlock = cosmetics
    .filter((cosmetic) => cosmetic.unlockSource === 'pr_milestone' && !cosmetic.unlocked)
    .sort((left, right) => (left.prThreshold ?? 999) - (right.prThreshold ?? 999))[0];

  function isSelected(slot: CosmeticSlot, cosmeticId: string) {
    if (slot === 'frame') {
      return currentUser.avatar.frameId === cosmeticId;
    }

    if (slot === 'face') {
      return currentUser.avatar.faceId === cosmeticId;
    }

    if (slot === 'top') {
      return currentUser.avatar.topId === cosmeticId;
    }

    return currentUser.avatar.auraId === cosmeticId;
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ScreenHeader
        eyebrow="Profile"
        title={currentUser.displayName}
        subtitle={`@${currentUser.username} / Joined ${formatJoinedDate(currentUser.joinedDate)}`}
        rightNode={<RankBadge rank={currentUser.rank} />}
      />

      <SurfaceCard style={styles.profileCard}>
        <View style={styles.profileHero}>
          <AvatarPreview user={currentUser} cosmetics={cosmetics} />
          <View style={styles.profileCopy}>
            <Text style={styles.bio}>{currentUser.bio}</Text>
            <Text style={styles.profileHint}>
              Build your avatar and earn fresh cosmetics whenever you hit key PR milestones.
            </Text>
          </View>
        </View>
        <View style={styles.metricRow}>
          <MetricChip label="XP" value={`${currentUser.xp}`} tone={theme.colors.accent} />
          <MetricChip label="Streak" value={`${currentUser.streak} days`} tone={theme.colors.warning} />
          <MetricChip label="Total PRs" value={`${currentUser.totalPrs}`} tone={theme.colors.accentAlt} />
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Avatar Lab</Text>
        <Text style={styles.sectionCopy}>
          Every unlocked cosmetic can be mixed into your look. Your next milestone should change how your profile feels, not just your stats.
        </Text>
        <View style={styles.stack}>
          {slotSections.map((section) => (
            <View key={section.slot} style={styles.slotSection}>
              <Text style={styles.slotLabel}>{section.label}</Text>
              <View style={styles.optionWrap}>
                {cosmetics
                  .filter((cosmetic) => cosmetic.slot === section.slot && cosmetic.unlocked)
                  .map((cosmetic) => (
                    <Pressable
                      key={cosmetic.id}
                      style={[
                        styles.optionChip,
                        { borderColor: cosmetic.tone },
                        isSelected(section.slot, cosmetic.id) ? styles.optionChipActive : null,
                      ]}
                      onPress={() => selectAvatarCosmetic(section.slot, cosmetic.id)}
                    >
                      <Text
                        style={[
                          styles.optionChipText,
                          isSelected(section.slot, cosmetic.id)
                            ? styles.optionChipTextActive
                            : { color: cosmetic.tone },
                        ]}
                      >
                        {cosmetic.name}
                      </Text>
                    </Pressable>
                  ))}
              </View>
            </View>
          ))}
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Next cosmetic unlock</Text>
        {nextCosmeticUnlock ? (
          <View style={styles.unlockCard}>
            <Text style={styles.unlockTitle}>{nextCosmeticUnlock.name}</Text>
            <Text style={styles.unlockCopy}>{nextCosmeticUnlock.description}</Text>
            <Text style={styles.unlockMeta}>
              Unlocks at {nextCosmeticUnlock.prThreshold} total PRs. You are at {currentUser.totalPrs}.
            </Text>
          </View>
        ) : (
          <Text style={styles.sectionCopy}>You have unlocked every current PR cosmetic.</Text>
        )}
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Badges</Text>
        <View style={styles.badgeWrap}>
          {currentUser.badges.map((badge) => (
            <View
              key={badge.id}
              style={[styles.badge, { borderColor: badge.tone, backgroundColor: `${badge.tone}22` }]}
            >
              <Text style={[styles.badgeText, { color: badge.tone }]}>{badge.label}</Text>
            </View>
          ))}
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Gym Wrapped</Text>
        <Text style={styles.sectionCopy}>
          Your shareable yearly recap is ready with favorite lifts, streak record, PR highlights, and rank progression.
        </Text>
        <Pressable style={styles.primaryButton} onPress={() => setActiveScreen('wrapped')}>
          <Text style={styles.primaryButtonText}>Open Wrapped</Text>
        </Pressable>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Suggested friends</Text>
        <View style={styles.stack}>
          {suggestions.slice(0, 3).map((user) => (
            <View key={user.id} style={styles.friendRow}>
              <View style={styles.friendCopy}>
                <Text style={styles.friendName}>{user.displayName}</Text>
                <Text style={styles.friendMeta}>
                  @{user.username} / {user.xp} XP / {user.streak} day streak
                </Text>
              </View>
              <Pressable style={styles.followButton} onPress={() => toggleFollow(user.id)}>
                <Text style={styles.followButtonText}>Follow</Text>
              </Pressable>
            </View>
          ))}
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Workout history</Text>
        <View style={styles.stack}>
          {workouts.slice(0, 5).map((workout) => (
            <View key={workout.id} style={styles.historyRow}>
              <View>
                <Text style={styles.historyTitle}>{workout.title}</Text>
                <Text style={styles.historyMeta}>{formatDateLabel(workout.endedAt)}</Text>
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
  profileCard: {
    backgroundColor: theme.colors.surfaceElevated,
  },
  profileHero: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
    marginBottom: 14,
  },
  profileCopy: {
    flex: 1,
    gap: 8,
  },
  bio: {
    color: theme.colors.text,
    lineHeight: 22,
    fontSize: 15,
  },
  profileHint: {
    color: theme.colors.textMuted,
    lineHeight: 20,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 10,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  sectionCopy: {
    color: theme.colors.textMuted,
    lineHeight: 20,
    marginBottom: 14,
  },
  stack: {
    gap: 14,
  },
  slotSection: {
    gap: 10,
  },
  slotLabel: {
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 12,
  },
  optionWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    borderWidth: 1,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  optionChipActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  optionChipText: {
    fontWeight: '700',
    fontSize: 12,
  },
  optionChipTextActive: {
    color: theme.colors.background,
  },
  unlockCard: {
    padding: 14,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceSoft,
    gap: 6,
  },
  unlockTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  unlockCopy: {
    color: theme.colors.textMuted,
    lineHeight: 18,
  },
  unlockMeta: {
    color: theme.colors.warning,
    fontWeight: '700',
    marginTop: 4,
  },
  badgeWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    borderWidth: 1,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  badgeText: {
    fontWeight: '700',
    fontSize: 12,
  },
  primaryButton: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.pill,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  primaryButtonText: {
    color: theme.colors.background,
    fontWeight: '800',
  },
  friendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  friendCopy: {
    flex: 1,
  },
  friendName: {
    color: theme.colors.text,
    fontWeight: '700',
    fontSize: 15,
  },
  friendMeta: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  followButton: {
    backgroundColor: theme.colors.surfaceSoft,
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: theme.radius.pill,
  },
  followButtonText: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  historyTitle: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  historyMeta: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  historyXp: {
    color: theme.colors.accent,
    fontWeight: '800',
  },
});
