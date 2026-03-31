import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../theme/theme';
import { ScreenKey } from '../types/models';

const tabs: Array<{ key: ScreenKey; label: string }> = [
  { key: 'home', label: 'Home' },
  { key: 'progress', label: 'Progress' },
  { key: 'leaderboard', label: 'Arena' },
  { key: 'feed', label: 'Feed' },
  { key: 'quests', label: 'Quests' },
  { key: 'profile', label: 'Profile' },
];

export function BottomNav({
  activeScreen,
  onChange,
}: {
  activeScreen: ScreenKey;
  onChange: (screen: ScreenKey) => void;
}) {
  return (
    <View style={styles.shell}>
      {tabs.map((tab) => {
        const active = activeScreen === tab.key;
        return (
          <Pressable
            key={tab.key}
            style={[styles.tab, active ? styles.activeTab : null]}
            onPress={() => onChange(tab.key)}
          >
            <Text style={[styles.label, active ? styles.activeLabel : null]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    backgroundColor: theme.colors.overlay,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingTop: 10,
    paddingBottom: 18,
  },
  tab: {
    flexGrow: 1,
    minWidth: '30%',
    borderRadius: theme.radius.pill,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  activeTab: {
    backgroundColor: theme.colors.accent,
  },
  label: {
    color: theme.colors.textMuted,
    fontWeight: '600',
    fontSize: 12,
  },
  activeLabel: {
    color: theme.colors.background,
  },
});

