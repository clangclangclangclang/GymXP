import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { rankToneMap, theme } from '../theme/theme';
import { CosmeticItem, UserProfile } from '../types/models';

function getCosmetic(cosmetics: CosmeticItem[], id: string) {
  return cosmetics.find((item) => item.id === id);
}

function shortTag(name: string | undefined, fallback: string) {
  if (!name) {
    return fallback;
  }

  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();
}

export function AvatarPreview({
  user,
  cosmetics,
  size = 148,
  compact = false,
}: {
  user: UserProfile;
  cosmetics: CosmeticItem[];
  size?: number;
  compact?: boolean;
}) {
  const frame = getCosmetic(cosmetics, user.avatar.frameId);
  const face = getCosmetic(cosmetics, user.avatar.faceId);
  const top = getCosmetic(cosmetics, user.avatar.topId);
  const aura = getCosmetic(cosmetics, user.avatar.auraId);
  const initials = user.displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const badgeHeight = compact ? size * 0.92 : size * 1.12;
  const emblemSize = compact ? size * 0.32 : size * 0.36;
  const frameTone = frame?.tone ?? theme.colors.border;
  const faceTone = face?.tone ?? theme.colors.text;
  const faceAccent = face?.accentTone ?? theme.colors.accentAlt;
  const topTone = top?.tone ?? theme.colors.surfaceSoft;
  const topAccent = top?.accentTone ?? theme.colors.accent;
  const auraTone = aura?.tone ?? theme.colors.surfaceSoft;
  const rankTone = rankToneMap[user.rank];

  return (
    <View style={[styles.shell, { width: size, height: badgeHeight + (compact ? 8 : 16) }]}>
      <View
        style={[
          styles.auraPlate,
          {
            width: size * 0.95,
            height: badgeHeight * 0.92,
            borderRadius: compact ? 20 : 28,
            backgroundColor: `${auraTone}30`,
            transform: [{ rotate: '-3deg' }],
          },
        ]}
      />
      <View
        style={[
          styles.auraPlate,
          {
            width: size * 0.9,
            height: badgeHeight * 0.88,
            borderRadius: compact ? 18 : 24,
            backgroundColor: `${rankTone}18`,
            transform: [{ rotate: '4deg' }],
          },
        ]}
      />
      <View
        style={[
          styles.badge,
          {
            width: size,
            height: badgeHeight,
            borderRadius: compact ? 18 : 24,
            borderColor: frameTone,
          },
        ]}
      >
        <View style={[styles.topRail, { backgroundColor: frameTone }]} />
        <View style={[styles.gridLine, { top: compact ? 28 : 32 }]} />
        <View style={[styles.gridLine, { top: compact ? 52 : 58 }]} />
        <View style={[styles.verticalLine, { left: size * 0.24 }]} />
        <View style={[styles.verticalLine, { right: size * 0.24 }]} />

        <View style={styles.headerRow}>
          <Text style={[styles.headerTag, compact ? styles.headerTagCompact : null]}>GYMXP</Text>
          <Text style={[styles.headerTag, compact ? styles.headerTagCompact : null, { color: rankTone }]}>
            {user.rank}
          </Text>
        </View>

        <View style={styles.centerRow}>
          <View style={styles.telemetryCol}>
            <Text style={[styles.telemetryValue, compact ? styles.telemetryValueCompact : null]}>
              {user.streak}
            </Text>
            <Text style={styles.telemetryLabel}>STRK</Text>
          </View>

          <View
            style={[
              styles.emblemRing,
              {
                width: emblemSize,
                height: emblemSize,
                borderRadius: emblemSize / 2,
                borderColor: faceAccent,
                backgroundColor: `${frameTone}20`,
              },
            ]}
          >
            <View
              style={[
                styles.emblemCore,
                {
                  width: emblemSize * 0.72,
                  height: emblemSize * 0.72,
                  borderRadius: emblemSize * 0.18,
                  backgroundColor: user.avatarColor,
                  borderColor: faceTone,
                },
              ]}
            >
              <Text style={[styles.initials, compact ? styles.initialsCompact : null, { color: faceTone }]}>
                {initials}
              </Text>
            </View>
            <View style={[styles.cornerPin, { backgroundColor: rankTone, top: -4, left: emblemSize * 0.16 }]} />
            <View style={[styles.cornerPin, { backgroundColor: topAccent, top: emblemSize * 0.12, right: -4 }]} />
            <View style={[styles.cornerPin, { backgroundColor: frameTone, bottom: -4, left: emblemSize * 0.18 }]} />
          </View>

          <View style={styles.telemetryCol}>
            <Text style={[styles.telemetryValue, compact ? styles.telemetryValueCompact : null]}>
              {user.totalPrs}
            </Text>
            <Text style={styles.telemetryLabel}>PRS</Text>
          </View>
        </View>

        <View style={styles.bodyZone}>
          <View style={styles.chevronStack}>
            <View style={[styles.chevron, { backgroundColor: topAccent }]} />
            <View style={[styles.chevronShort, { backgroundColor: frameTone }]} />
          </View>
          <View
            style={[
              styles.topPanel,
              {
                backgroundColor: topTone,
                borderColor: topAccent,
                height: compact ? 26 : 34,
              },
            ]}
          >
            <View style={[styles.topStripe, { backgroundColor: topAccent }]} />
            <View style={[styles.topStripeMuted, { backgroundColor: `${faceTone}70` }]} />
          </View>
          <View style={styles.chevronStack}>
            <View style={[styles.chevron, { backgroundColor: frameTone }]} />
            <View style={[styles.chevronShort, { backgroundColor: topAccent }]} />
          </View>
        </View>

        <View style={styles.footerRow}>
          <View style={[styles.slotTag, { borderColor: frameTone }]}>
            <Text style={styles.slotTagText}>{shortTag(frame?.name, 'FRM')}</Text>
          </View>
          <View style={[styles.slotTag, { borderColor: faceAccent }]}>
            <Text style={styles.slotTagText}>{shortTag(face?.name, 'FCE')}</Text>
          </View>
          <View style={[styles.slotTag, { borderColor: topAccent }]}>
            <Text style={styles.slotTagText}>{shortTag(top?.name, 'TOP')}</Text>
          </View>
          <View style={[styles.slotTag, { borderColor: auraTone }]}>
            <Text style={styles.slotTagText}>{shortTag(aura?.name, 'AUR')}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  auraPlate: {
    position: 'absolute',
    alignSelf: 'center',
  },
  badge: {
    overflow: 'hidden',
    backgroundColor: `${theme.colors.surfaceElevated}f2`,
    borderWidth: 2,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 10,
    justifyContent: 'space-between',
  },
  topRail: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  gridLine: {
    position: 'absolute',
    left: 10,
    right: 10,
    height: 1,
    backgroundColor: 'rgba(180, 173, 157, 0.08)',
  },
  verticalLine: {
    position: 'absolute',
    top: 12,
    bottom: 12,
    width: 1,
    backgroundColor: 'rgba(212, 255, 54, 0.05)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTag: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.mono,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  headerTagCompact: {
    fontSize: 9,
  },
  centerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  telemetryCol: {
    width: 34,
    alignItems: 'center',
    gap: 2,
  },
  telemetryValue: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: 18,
    fontWeight: '800',
  },
  telemetryValueCompact: {
    fontSize: 15,
  },
  telemetryLabel: {
    color: theme.colors.textDim,
    fontFamily: theme.fonts.mono,
    fontSize: 9,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  emblemRing: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  emblemCore: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  initials: {
    fontFamily: theme.fonts.mono,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1.6,
  },
  initialsCompact: {
    fontSize: 14,
  },
  cornerPin: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: theme.radius.pill,
  },
  bodyZone: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    gap: 8,
  },
  chevronStack: {
    gap: 6,
    width: 18,
    alignItems: 'center',
  },
  chevron: {
    width: 16,
    height: 6,
    borderRadius: theme.radius.pill,
  },
  chevronShort: {
    width: 10,
    height: 6,
    borderRadius: theme.radius.pill,
  },
  topPanel: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 10,
    justifyContent: 'center',
    gap: 4,
  },
  topStripe: {
    height: 6,
    borderRadius: theme.radius.pill,
  },
  topStripeMuted: {
    height: 4,
    borderRadius: theme.radius.pill,
    width: '68%',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    gap: 6,
  },
  slotTag: {
    flex: 1,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: 'rgba(5, 6, 8, 0.38)',
    alignItems: 'center',
  },
  slotTagText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.mono,
    fontSize: 8,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
});
