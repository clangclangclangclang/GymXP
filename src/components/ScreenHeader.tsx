import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../theme/theme';

export function ScreenHeader({
  eyebrow,
  title,
  subtitle,
  rightNode,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  rightNode?: React.ReactNode;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      {rightNode}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  copy: {
    flex: 1,
  },
  eyebrow: {
    color: theme.colors.accent,
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 8,
    fontFamily: theme.fonts.mono,
  },
  title: {
    color: theme.colors.text,
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '900',
    fontFamily: theme.fonts.display,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
});
