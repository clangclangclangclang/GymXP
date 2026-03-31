import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../theme/theme';
import { CosmeticItem, UserProfile } from '../types/models';

function getCosmetic(cosmetics: CosmeticItem[], id: string) {
  return cosmetics.find((item) => item.id === id);
}

export function AvatarPreview({
  user,
  cosmetics,
  size = 148,
}: {
  user: UserProfile;
  cosmetics: CosmeticItem[];
  size?: number;
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

  return (
    <View style={[styles.shell, { width: size, height: size + 24 }]}>
      <View
        style={[
          styles.aura,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: aura ? `${aura.tone}33` : 'transparent',
          },
        ]}
      />
      <View
        style={[
          styles.frame,
          {
            width: size - 18,
            height: size - 18,
            borderRadius: (size - 18) / 2,
            borderColor: frame?.tone ?? theme.colors.border,
          },
        ]}
      >
        <View
          style={[
            styles.head,
            {
              width: size * 0.38,
              height: size * 0.38,
              borderRadius: (size * 0.38) / 2,
              backgroundColor: user.avatarColor,
              borderColor: face?.accentTone ?? face?.tone ?? theme.colors.text,
            },
          ]}
        >
          <Text style={[styles.initials, { color: face?.tone ?? theme.colors.background }]}>
            {initials}
          </Text>
        </View>
        <View
          style={[
            styles.body,
            {
              width: size * 0.48,
              height: size * 0.28,
              backgroundColor: top?.tone ?? theme.colors.surfaceSoft,
              borderColor: top?.accentTone ?? theme.colors.border,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  aura: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
  },
  frame: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    backgroundColor: `${theme.colors.surfaceElevated}ee`,
  },
  head: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    marginTop: 10,
  },
  initials: {
    fontWeight: '900',
    fontSize: 18,
    letterSpacing: 1,
  },
  body: {
    marginTop: 12,
    borderRadius: theme.radius.md,
    borderWidth: 2,
  },
});
