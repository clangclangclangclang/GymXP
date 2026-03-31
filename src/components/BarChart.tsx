import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../theme/theme';
import { formatCompactNumber } from '../utils/format';

interface BarChartPoint {
  label: string;
  value: number;
}

export function BarChart({
  data,
  tone,
  formatter,
}: {
  data: BarChartPoint[];
  tone?: string;
  formatter?: (value: number) => string;
}) {
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <View style={styles.chart}>
      {data.map((item) => (
        <View key={`${item.label}-${item.value}`} style={styles.item}>
          <Text style={styles.value}>{formatter ? formatter(item.value) : formatCompactNumber(item.value)}</Text>
          <View style={styles.barTrack}>
            <View
              style={[
                styles.bar,
                {
                  height: `${Math.max(6, (item.value / maxValue) * 100)}%`,
                  backgroundColor: tone ?? theme.colors.accentAlt,
                },
              ]}
            />
          </View>
          <Text style={styles.label}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 180,
    gap: 10,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  value: {
    color: theme.colors.textMuted,
    fontSize: 11,
    marginBottom: 6,
  },
  barTrack: {
    width: '100%',
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: theme.radius.md,
    paddingHorizontal: 4,
    paddingBottom: 4,
  },
  bar: {
    width: '100%',
    borderRadius: theme.radius.sm,
  },
  label: {
    color: theme.colors.textMuted,
    fontSize: 11,
    marginTop: 8,
  },
});

