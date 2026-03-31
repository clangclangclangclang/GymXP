import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ProgressBar } from '../components/ProgressBar';
import { ScreenHeader } from '../components/ScreenHeader';
import { SurfaceCard } from '../components/SurfaceCard';
import { useApp } from '../state/AppProvider';
import { theme } from '../theme/theme';

export function QuestsScreen() {
  const { quests, rewards, currentUser, unlockReward } = useApp();
  const dailyQuests = quests.filter((quest) => quest.cadence === 'daily');
  const weeklyQuests = quests.filter((quest) => quest.cadence === 'weekly');

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ScreenHeader
        eyebrow="Rewards"
        title="Quests and unlocks"
        subtitle="Keep the loop obvious: complete quests, earn Gym Coins, and unlock cosmetics or plans."
      />

      <SurfaceCard style={styles.walletCard}>
        <Text style={styles.walletLabel}>Wallet</Text>
        <Text style={styles.walletValue}>{currentUser.currency} GC</Text>
        <Text style={styles.walletCopy}>Use Gym Coins on badges, themes, boosts, and future plans.</Text>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Daily quests</Text>
        <View style={styles.stack}>
          {dailyQuests.map((quest) => (
            <View key={quest.id} style={styles.questCard}>
              <View style={styles.questHeader}>
                <Text style={styles.questIcon}>{quest.iconLabel}</Text>
                <View style={styles.questCopy}>
                  <Text style={styles.questTitle}>{quest.title}</Text>
                  <Text style={styles.questDescription}>{quest.description}</Text>
                </View>
              </View>
              <ProgressBar
                progress={quest.progress / quest.target}
                tone={quest.completed ? theme.colors.accent : theme.colors.accentAlt}
                caption={`${quest.progress}/${quest.target}`}
              />
            </View>
          ))}
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Weekly and community</Text>
        <View style={styles.stack}>
          {weeklyQuests.map((quest) => (
            <View key={quest.id} style={styles.questCard}>
              <View style={styles.questHeader}>
                <Text style={styles.questIcon}>{quest.iconLabel}</Text>
                <View style={styles.questCopy}>
                  <Text style={styles.questTitle}>{quest.title}</Text>
                  <Text style={styles.questDescription}>{quest.description}</Text>
                </View>
              </View>
              <ProgressBar
                progress={quest.progress / quest.target}
                tone={quest.completed ? theme.colors.accent : theme.colors.warning}
                caption={`${quest.progress}/${quest.target}`}
              />
            </View>
          ))}
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Reward store</Text>
        <View style={styles.stack}>
          {rewards.map((reward) => (
            <View key={reward.id} style={styles.rewardCard}>
              <View style={styles.rewardCopy}>
                <Text style={styles.rewardTitle}>{reward.name}</Text>
                <Text style={styles.rewardDescription}>{reward.description}</Text>
              </View>
              <Pressable
                style={[
                  styles.rewardButton,
                  reward.unlocked || reward.cost > currentUser.currency ? styles.rewardButtonLocked : null,
                ]}
                onPress={() => unlockReward(reward.id)}
              >
                <Text style={[styles.rewardButtonText, reward.unlocked ? styles.rewardButtonTextUnlocked : null]}>
                  {reward.unlocked ? 'Unlocked' : `${reward.cost} GC`}
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Referral boost</Text>
        <Text style={styles.referralCopy}>
          Invite friends with code {currentUser.referralCode}. Each accepted invite can drive challenge participation and future shared rewards.
        </Text>
      </SurfaceCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 22,
    gap: 22,
  },
  walletCard: {
    backgroundColor: theme.colors.surfaceElevated,
  },
  walletLabel: {
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    fontSize: 12,
  },
  walletValue: {
    color: theme.colors.warning,
    fontSize: 32,
    fontWeight: '900',
    marginTop: 8,
  },
  walletCopy: {
    color: theme.colors.textMuted,
    marginTop: 8,
    lineHeight: 20,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  stack: {
    gap: 12,
  },
  questCard: {
    padding: 14,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceSoft,
    gap: 12,
  },
  questHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  questIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    textAlign: 'center',
    textAlignVertical: 'center',
    backgroundColor: theme.colors.surface,
    color: theme.colors.accent,
    fontWeight: '800',
    lineHeight: 46,
  },
  questCopy: {
    flex: 1,
  },
  questTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  questDescription: {
    color: theme.colors.textMuted,
    lineHeight: 18,
    marginTop: 4,
  },
  rewardCard: {
    padding: 14,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceSoft,
    gap: 14,
  },
  rewardCopy: {
    gap: 6,
  },
  rewardTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  rewardDescription: {
    color: theme.colors.textMuted,
    lineHeight: 18,
  },
  rewardButton: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.accent,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: theme.radius.pill,
  },
  rewardButtonLocked: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  rewardButtonText: {
    color: theme.colors.background,
    fontWeight: '800',
  },
  rewardButtonTextUnlocked: {
    color: theme.colors.textMuted,
  },
  referralCopy: {
    color: theme.colors.textMuted,
    lineHeight: 20,
  },
});
