import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../theme/theme';

export function ProgressBar({
  progress,
  tone,
  label,
  caption,
}: {
  progress: number;
  tone?: string;
  label?: string;
  caption?: string;
}) {
  return (
    <View style={styles.wrapper}>
      {(label || caption) && (
        <View style={styles.header}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.caption}>{caption}</Text>
        </View>
      )}
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            {
              width: `${Math.max(4, Math.min(100, progress * 100))}%`,
              backgroundColor: tone ?? theme.colors.accent,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  caption: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  track: {
    height: 10,
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: theme.radius.pill,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: theme.radius.pill,
  },
});

