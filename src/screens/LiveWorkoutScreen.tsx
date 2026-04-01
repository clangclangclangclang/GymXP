import React, { useDeferredValue, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { ScreenHeader } from '../components/ScreenHeader';
import { SurfaceCard } from '../components/SurfaceCard';
import { getRecentExercises, summarizeDraft } from '../services/gameEngine';
import { useApp } from '../state/AppProvider';
import { theme } from '../theme/theme';
import { formatVolume } from '../utils/format';

export function LiveWorkoutScreen() {
  const {
    workoutDraft,
    exercises,
    workouts,
    routines,
    addExerciseToDraft,
    addSetToDraft,
    updateDraftSet,
    updateDraftNotes,
    removeDraftExercise,
    finishWorkout,
    setActiveScreen,
    startWorkout,
  } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const deferredQuery = useDeferredValue(searchQuery);

  if (!workoutDraft) {
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader
          eyebrow="Live Logging"
          title="Start a workout"
          subtitle="Jump in with a template or build a custom session from scratch."
        />
        <SurfaceCard>
          <Text style={styles.emptyTitle}>No active workout yet</Text>
          <Text style={styles.emptyCopy}>
            Pick a routine to preload your sets, or start blank and search from the exercise database.
          </Text>
          <Pressable style={styles.primaryButton} onPress={() => startWorkout()}>
            <Text style={styles.primaryButtonText}>Start Blank Workout</Text>
          </Pressable>
        </SurfaceCard>

        <SurfaceCard>
          <Text style={styles.sectionTitle}>Quick routines</Text>
          <View style={styles.stack}>
            {routines.map((routine) => (
              <Pressable
                key={routine.id}
                style={[styles.routineCard, { borderColor: routine.accent }]}
                onPress={() => startWorkout(routine.id)}
              >
                <Text style={styles.routineTitle}>{routine.name}</Text>
                <Text style={styles.routineCopy}>{routine.description}</Text>
              </Pressable>
            ))}
          </View>
        </SurfaceCard>
      </ScrollView>
    );
  }

  const recentExercises = getRecentExercises(workouts);
  const selectedIds = new Set(workoutDraft.exercises.map((exercise) => exercise.exerciseId));
  const suggestions = exercises
    .filter((exercise) => {
      if (selectedIds.has(exercise.id)) {
        return false;
      }

      if (!deferredQuery.trim()) {
        return recentExercises.includes(exercise.name);
      }

      const query = deferredQuery.toLowerCase();
      return (
        exercise.name.toLowerCase().includes(query) ||
        exercise.aliases.some((alias) => alias.toLowerCase().includes(query))
      );
    })
    .slice(0, 8);
  const draftSummary = summarizeDraft(workoutDraft);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ScreenHeader
        eyebrow="Live Logging"
        title={workoutDraft.title}
        subtitle="Keep the flow fast. Search, tap, log, finish."
        rightNode={
          <Pressable style={styles.secondaryMiniButton} onPress={() => setActiveScreen('home')}>
            <Text style={styles.secondaryMiniText}>Dashboard</Text>
          </Pressable>
        }
      />

      <SurfaceCard style={styles.summaryCard}>
        <View style={styles.metricRow}>
          <View>
            <Text style={styles.summaryValue}>{draftSummary.exerciseCount}</Text>
            <Text style={styles.summaryLabel}>Exercises</Text>
          </View>
          <View>
            <Text style={styles.summaryValue}>{draftSummary.totalSets}</Text>
            <Text style={styles.summaryLabel}>Sets</Text>
          </View>
          <View>
            <Text style={styles.summaryValue}>{formatVolume(draftSummary.totalVolume)}</Text>
            <Text style={styles.summaryLabel}>Volume</Text>
          </View>
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Add exercises</Text>
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search 400+ exercises"
          placeholderTextColor={theme.colors.textDim}
          style={styles.searchInput}
        />
        <View style={styles.chipWrap}>
          {suggestions.map((exercise) => (
            <Pressable
              key={exercise.id}
              style={styles.chip}
              onPress={() => {
                addExerciseToDraft(exercise.id);
                setSearchQuery('');
              }}
            >
              <Text style={styles.chipText}>{exercise.name}</Text>
            </Pressable>
          ))}
        </View>
      </SurfaceCard>

      <View style={styles.stack}>
        {workoutDraft.exercises.map((exercise) => (
          <SurfaceCard key={exercise.exerciseId}>
            <View style={styles.exerciseHeader}>
              <View style={styles.exerciseCopy}>
                <Text style={styles.exerciseTitle}>{exercise.name}</Text>
                <Text style={styles.exerciseSubtitle}>Tap into a set and keep moving.</Text>
              </View>
              <Pressable onPress={() => removeDraftExercise(exercise.exerciseId)}>
                <Text style={styles.removeText}>Remove</Text>
              </Pressable>
            </View>

            <View style={styles.setHeader}>
              <Text style={styles.setHeaderText}>Set</Text>
              <Text style={styles.setHeaderText}>Reps</Text>
              <Text style={styles.setHeaderText}>Weight</Text>
            </View>

            {exercise.sets.map((set, index) => (
              <View key={set.id} style={styles.setRow}>
                <View style={styles.setIndex}>
                  <Text style={styles.setIndexText}>{index + 1}</Text>
                </View>
                <TextInput
                  keyboardType="number-pad"
                  value={set.reps}
                  onChangeText={(value) =>
                    updateDraftSet(exercise.exerciseId, set.id, 'reps', value)
                  }
                  style={styles.setInput}
                />
                <TextInput
                  keyboardType="decimal-pad"
                  value={set.weight}
                  onChangeText={(value) =>
                    updateDraftSet(exercise.exerciseId, set.id, 'weight', value)
                  }
                  style={styles.setInput}
                />
              </View>
            ))}

            <TextInput
              value={exercise.notes}
              onChangeText={(value) => updateDraftNotes(exercise.exerciseId, value)}
              placeholder="Quick note"
              placeholderTextColor={theme.colors.textDim}
              style={styles.notesInput}
            />

            <Pressable style={styles.addSetButton} onPress={() => addSetToDraft(exercise.exerciseId)}>
              <Text style={styles.addSetText}>Add Set</Text>
            </Pressable>
          </SurfaceCard>
        ))}
      </View>

      <Pressable style={styles.finishButton} onPress={finishWorkout}>
        <Text style={styles.finishButtonText}>Finish Workout And Collect XP</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 22,
    gap: 22,
  },
  emptyTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  emptyCopy: {
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 18,
  },
  primaryButton: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    paddingVertical: 16,
  },
  primaryButtonText: {
    color: theme.colors.background,
    fontWeight: '800',
    fontFamily: theme.fonts.mono,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    fontFamily: theme.fonts.display,
  },
  stack: {
    gap: 14,
  },
  routineCard: {
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    padding: 14,
  },
  routineTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  routineCopy: {
    color: theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
  },
  summaryCard: {
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.accentAlt,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  summaryValue: {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: '800',
    fontFamily: theme.fonts.display,
  },
  summaryLabel: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginTop: 4,
    fontFamily: theme.fonts.mono,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  searchInput: {
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.text,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surfaceSoft,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
    gap: 12,
  },
  exerciseCopy: {
    flex: 1,
  },
  exerciseTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: theme.fonts.display,
  },
  exerciseSubtitle: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  removeText: {
    color: theme.colors.danger,
    fontWeight: '700',
  },
  setHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  setHeaderText: {
    flex: 1,
    color: theme.colors.textMuted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  setIndex: {
    flex: 1,
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: theme.radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  setIndexText: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  setInput: {
    flex: 1,
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 14,
    color: theme.colors.text,
    textAlign: 'center',
  },
  notesInput: {
    marginTop: 6,
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: theme.colors.text,
  },
  addSetButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: theme.radius.sm,
  },
  addSetText: {
    color: theme.colors.accentAlt,
    fontWeight: '700',
    fontFamily: theme.fonts.mono,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  finishButton: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.sm,
    paddingVertical: 18,
    alignItems: 'center',
  },
  finishButtonText: {
    color: theme.colors.background,
    fontWeight: '900',
    fontSize: 15,
    fontFamily: theme.fonts.mono,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  secondaryMiniButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  secondaryMiniText: {
    color: theme.colors.text,
    fontWeight: '700',
    fontSize: 12,
    fontFamily: theme.fonts.mono,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
