import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { rankToneMap, theme } from '../theme/theme';
import { RankTier } from '../types/models';

export function RankBadge({ rank }: { rank: RankTier }) {
  return (
    <View style={[styles.badge, { borderColor: rankToneMap[rank], backgroundColor: `${rankToneMap[rank]}22` }]}>
      <Text style={[styles.label, { color: rankToneMap[rank] }]}>{rank}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
  },
  label: {
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
