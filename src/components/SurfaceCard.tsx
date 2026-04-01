import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { theme } from '../theme/theme';

export function SurfaceCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.topRail} />
      <View style={styles.cornerTag} />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  topRail: {
    height: 3,
    backgroundColor: theme.colors.accent,
  },
  cornerTag: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 28,
    height: 6,
    backgroundColor: theme.colors.accentAlt,
    borderRadius: theme.radius.pill,
    opacity: 0.8,
  },
  content: {
    padding: theme.spacing.md,
  },
});
