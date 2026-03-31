import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { SurfaceCard } from '../components/SurfaceCard';
import { useApp } from '../state/AppProvider';
import { theme } from '../theme/theme';

export function OnboardingScreen() {
  const { completeOnboarding, totalExerciseCount } = useApp();
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [username, setUsername] = useState('liftnephi');
  const [displayName, setDisplayName] = useState('Nephi Steele');
  const [bio, setBio] = useState('Chasing stronger lifts, cleaner reps, and longer streaks.');
  const [password, setPassword] = useState('gymxp-demo');

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>GymXP</Text>
        <Text style={styles.title}>Workout tracking that feels alive.</Text>
        <Text style={styles.subtitle}>
          Log sessions fast, earn XP, climb rank, keep streaks alive, and compare your momentum with friends.
        </Text>
      </View>

      <SurfaceCard style={styles.valueCard}>
        <Text style={styles.valueTitle}>MVP included</Text>
        <View style={styles.valueList}>
          <Text style={styles.valueItem}>Fast workout logging and workout history</Text>
          <Text style={styles.valueItem}>Rank, XP, streaks, quests, and rewards</Text>
          <Text style={styles.valueItem}>Friends feed, leaderboard, and yearly Gym Wrapped</Text>
          <Text style={styles.valueItem}>{totalExerciseCount}+ exercises ready to search</Text>
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <View style={styles.modeRow}>
          <Pressable
            style={[styles.modeButton, mode === 'signup' ? styles.modeButtonActive : null]}
            onPress={() => setMode('signup')}
          >
            <Text style={[styles.modeText, mode === 'signup' ? styles.modeTextActive : null]}>
              Sign Up
            </Text>
          </Pressable>
          <Pressable
            style={[styles.modeButton, mode === 'login' ? styles.modeButtonActive : null]}
            onPress={() => setMode('login')}
          >
            <Text style={[styles.modeText, mode === 'login' ? styles.modeTextActive : null]}>
              Log In
            </Text>
          </Pressable>
        </View>

        <Text style={styles.formLabel}>Username</Text>
        <TextInput
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
          placeholder="liftnephi"
          placeholderTextColor={theme.colors.textDim}
        />

        {mode === 'signup' && (
          <>
            <Text style={styles.formLabel}>Display Name</Text>
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              style={styles.input}
              placeholder="Nephi Steele"
              placeholderTextColor={theme.colors.textDim}
            />

            <Text style={styles.formLabel}>Bio</Text>
            <TextInput
              value={bio}
              onChangeText={setBio}
              style={[styles.input, styles.bioInput]}
              multiline
              placeholder="What are you training for?"
              placeholderTextColor={theme.colors.textDim}
            />
          </>
        )}

        <Text style={styles.formLabel}>Password</Text>
        <TextInput
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={theme.colors.textDim}
        />

        <Text style={styles.helper}>
          Demo auth for the MVP. The app is structured so this can be swapped to a real backend auth provider later.
        </Text>

        <Pressable
          style={styles.primaryButton}
          onPress={() =>
            completeOnboarding({
              username,
              displayName: displayName || username,
              bio,
            })
          }
        >
          <Text style={styles.primaryButtonText}>
            {mode === 'signup' ? 'Enter GymXP' : 'Continue To Dashboard'}
          </Text>
        </Pressable>
      </SurfaceCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 22,
    gap: 22,
  },
  hero: {
    paddingTop: 28,
    gap: 12,
  },
  eyebrow: {
    color: theme.colors.accent,
    fontSize: 14,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  title: {
    color: theme.colors.text,
    fontSize: 38,
    lineHeight: 42,
    fontWeight: '900',
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
  },
  valueCard: {
    backgroundColor: theme.colors.surfaceElevated,
  },
  valueTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  valueList: {
    gap: 8,
  },
  valueItem: {
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surfaceSoft,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: theme.colors.accent,
  },
  modeText: {
    color: theme.colors.textMuted,
    fontWeight: '700',
  },
  modeTextActive: {
    color: theme.colors.background,
  },
  formLabel: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.text,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
  },
  bioInput: {
    minHeight: 92,
    textAlignVertical: 'top',
  },
  helper: {
    color: theme.colors.textDim,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 14,
  },
  primaryButton: {
    marginTop: 20,
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    paddingVertical: 16,
  },
  primaryButtonText: {
    color: theme.colors.background,
    fontSize: 15,
    fontWeight: '800',
  },
});
