import React, { useDeferredValue, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { ProgressBar } from '../components/ProgressBar';
import { ScreenHeader } from '../components/ScreenHeader';
import { SurfaceCard } from '../components/SurfaceCard';
import { getRecentExercises, previewWorkoutReward, summarizeDraft } from '../services/gameEngine';
import { useApp } from '../state/AppProvider';
import { theme } from '../theme/theme';
import { formatVolume } from '../utils/format';

const restPresets = [60, 90, 120];

function formatTimer(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function toWholeNumber(value: string) {
  return Number.parseInt(value, 10) || 0;
}

function toWeightValue(value: string) {
  return Number.parseFloat(value) || 0;
}

function formatQuickWeight(value: number) {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}

export function LiveWorkoutScreen() {
  const {
    workoutDraft,
    exercises,
    workouts,
    routines,
    currentUser,
    quests,
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
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [restSecondsRemaining, setRestSecondsRemaining] = useState<number | null>(null);
  const deferredQuery = useDeferredValue(searchQuery);

  useEffect(() => {
    if (!workoutDraft) {
      setSessionSeconds(0);
      return;
    }

    const syncElapsed = () => {
      setSessionSeconds(
        Math.max(
          0,
          Math.floor((Date.now() - new Date(workoutDraft.startedAt).getTime()) / 1000)
        )
      );
    };

    syncElapsed();
    const timerId = setInterval(syncElapsed, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, [workoutDraft?.startedAt]);

  useEffect(() => {
    if (restSecondsRemaining === null) {
      return;
    }

    const timerId = setInterval(() => {
      setRestSecondsRemaining((current) => {
        if (current === null || current <= 1) {
          return null;
        }

        return current - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, [restSecondsRemaining]);

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
        return recentExercises.length > 0
          ? recentExercises.includes(exercise.name)
          : exercise.difficulty !== 'advanced';
      }

      const query = deferredQuery.toLowerCase();
      return (
        exercise.name.toLowerCase().includes(query) ||
        exercise.aliases.some((alias) => alias.toLowerCase().includes(query))
      );
    })
    .slice(0, deferredQuery.trim() ? 10 : 8);
  const draftSummary = summarizeDraft(workoutDraft);
  const rewardPreview = previewWorkoutReward(workoutDraft, currentUser, quests);
  const highlightedQuests = rewardPreview.questPreview
    .filter((quest) => quest.delta > 0 || quest.completedNow)
    .slice(0, 4);

  function nudgeLatestSet(
    exerciseId: string,
    field: 'reps' | 'weight',
    currentValue: string,
    amount: number
  ) {
    const numericValue =
      field === 'reps' ? toWholeNumber(currentValue) : toWeightValue(currentValue);
    const nextValue = Math.max(field === 'reps' ? 1 : 0, numericValue + amount);
    const formattedValue =
      field === 'reps' ? `${Math.round(nextValue)}` : formatQuickWeight(nextValue);
    const targetExercise = workoutDraft?.exercises.find((item) => item.exerciseId === exerciseId);
    const lastSet = targetExercise?.sets[targetExercise.sets.length - 1];

    if (!lastSet) {
      return;
    }

    updateDraftSet(exerciseId, lastSet.id, field, formattedValue);
  }

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

      <SurfaceCard style={styles.commandCard}>
        <View style={styles.commandTopRow}>
          <View style={styles.commandCopy}>
            <Text style={styles.commandEyebrow}>Mission console</Text>
            <Text style={styles.commandValue}>+{rewardPreview.totalXpFloor} XP Floor</Text>
            <Text style={styles.commandCaption}>
              Base, streak, quest, and auto-share rewards are already loaded. PR bonuses stack on finish.
            </Text>
          </View>
          <View style={styles.commandStatusWrap}>
            <View style={styles.signalBadge}>
              <Text style={styles.signalBadgeLabel}>Session</Text>
              <Text style={styles.signalBadgeValue}>{formatTimer(sessionSeconds)}</Text>
            </View>
            <View
              style={[styles.signalBadge, restSecondsRemaining !== null ? styles.signalBadgeActive : null]}
            >
              <Text style={styles.signalBadgeLabel}>Rest</Text>
              <Text style={styles.signalBadgeValue}>
                {restSecondsRemaining === null ? 'Ready' : formatTimer(restSecondsRemaining)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.metricRibbon}>
          <View style={styles.metricTile}>
            <Text style={styles.metricTileValue}>{draftSummary.exerciseCount}</Text>
            <Text style={styles.metricTileLabel}>Exercises</Text>
          </View>
          <View style={styles.metricTile}>
            <Text style={styles.metricTileValue}>{draftSummary.totalSets}</Text>
            <Text style={styles.metricTileLabel}>Sets</Text>
          </View>
          <View style={styles.metricTile}>
            <Text style={styles.metricTileValue}>{formatVolume(draftSummary.totalVolume)}</Text>
            <Text style={styles.metricTileLabel}>Volume</Text>
          </View>
          <View style={styles.metricTile}>
            <Text style={styles.metricTileValue}>{rewardPreview.streakAfter}</Text>
            <Text style={styles.metricTileLabel}>Streak</Text>
          </View>
        </View>

        <View style={styles.previewBreakdown}>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Base payout</Text>
            <Text style={styles.previewValue}>{rewardPreview.baseXp} XP</Text>
          </View>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Consistency bonus</Text>
            <Text style={styles.previewValue}>{rewardPreview.consistencyXp} XP</Text>
          </View>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Quest payout</Text>
            <Text style={styles.previewValue}>{rewardPreview.questXp} XP</Text>
          </View>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Auto-share bonus</Text>
            <Text style={styles.previewValue}>{rewardPreview.socialShareXp} XP</Text>
          </View>
        </View>

        <View style={styles.restRow}>
          {restPresets.map((preset) => (
            <Pressable
              key={preset}
              style={styles.restChip}
              onPress={() => setRestSecondsRemaining(preset)}
            >
              <Text style={styles.restChipText}>{preset / 60} min</Text>
            </Pressable>
          ))}
          {restSecondsRemaining !== null && (
            <Pressable style={styles.restChipMuted} onPress={() => setRestSecondsRemaining(null)}>
              <Text style={styles.restChipMutedText}>Clear</Text>
            </Pressable>
          )}
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Add exercises</Text>
        <Text style={styles.sectionCopy}>
          Start from recent lifts for speed, or search the full database when you need something new.
        </Text>
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search 400+ exercises"
          placeholderTextColor={theme.colors.textDim}
          style={styles.searchInput}
        />
        <Text style={styles.searchLabel}>
          {deferredQuery.trim() ? 'Search results' : 'Recent lift shortcuts'}
        </Text>
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
        {suggestions.length === 0 && (
          <Text style={styles.emptySuggestion}>
            No matches yet. Try a muscle group, alias, or equipment name.
          </Text>
        )}
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Quest radar</Text>
        <Text style={styles.sectionCopy}>
          Every completed workout moves quests immediately. These are the ones this session is pushing.
        </Text>
        <View style={styles.questStack}>
          {highlightedQuests.map((quest) => (
            <View key={quest.id} style={styles.questRow}>
              <View style={styles.questHeader}>
                <View>
                  <Text style={styles.questEyebrow}>
                    {quest.iconLabel} / {quest.cadence}
                  </Text>
                  <Text style={styles.questTitle}>{quest.title}</Text>
                </View>
                <Text style={styles.questDelta}>
                  {quest.completedNow ? 'Clears now' : `+${quest.delta}`}
                </Text>
              </View>
              <ProgressBar
                progress={quest.progressAfter / quest.target}
                label={`${quest.progressAfter}/${quest.target}`}
                caption={quest.completedNow ? 'Quest complete on finish' : 'Progress after this workout'}
                tone={quest.completedNow ? theme.colors.accent : theme.colors.accentAlt}
              />
            </View>
          ))}
        </View>
      </SurfaceCard>

      <View style={styles.stack}>
        {workoutDraft.exercises.map((exercise) => (
          <SurfaceCard key={exercise.exerciseId} style={styles.exerciseCard}>
            <View style={styles.exerciseHeader}>
              <View style={styles.exerciseCopy}>
                <Text style={styles.exerciseTitle}>{exercise.name}</Text>
                <Text style={styles.exerciseSubtitle}>Fast edits below always target your latest set.</Text>
              </View>
              <View style={styles.exerciseBadge}>
                <Text style={styles.exerciseBadgeText}>
                  {exercise.sets.length} sets /{' '}
                  {formatVolume(
                    exercise.sets.reduce(
                      (total, set) => total + toWholeNumber(set.reps) * toWeightValue(set.weight),
                      0
                    )
                  )}
                </Text>
              </View>
            </View>

            <View style={styles.quickActionRow}>
              <Pressable
                style={styles.quickActionChip}
                onPress={() => addSetToDraft(exercise.exerciseId)}
              >
                <Text style={styles.quickActionText}>Clone Last Set</Text>
              </Pressable>
              <Pressable
                style={styles.quickActionChip}
                onPress={() =>
                  nudgeLatestSet(
                    exercise.exerciseId,
                    'reps',
                    exercise.sets[exercise.sets.length - 1]?.reps ?? '0',
                    1
                  )
                }
              >
                <Text style={styles.quickActionText}>+1 Rep</Text>
              </Pressable>
              <Pressable
                style={styles.quickActionChip}
                onPress={() =>
                  nudgeLatestSet(
                    exercise.exerciseId,
                    'weight',
                    exercise.sets[exercise.sets.length - 1]?.weight ?? '0',
                    2.5
                  )
                }
              >
                <Text style={styles.quickActionText}>+2.5 Kg</Text>
              </Pressable>
              <Pressable
                style={styles.quickActionChipDanger}
                onPress={() => removeDraftExercise(exercise.exerciseId)}
              >
                <Text style={styles.quickActionDangerText}>Remove</Text>
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
              placeholder="Quick note, tempo cue, or PR target"
              placeholderTextColor={theme.colors.textDim}
              style={styles.notesInput}
            />
          </SurfaceCard>
        ))}
      </View>

      <Pressable style={styles.finishButton} onPress={finishWorkout}>
        <Text style={styles.finishButtonText}>
          Finish Workout And Collect +{rewardPreview.totalXpFloor} XP
        </Text>
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
  sectionCopy: {
    color: theme.colors.textMuted,
    lineHeight: 20,
    marginBottom: 14,
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
  commandCard: {
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.accentAlt,
    gap: 18,
  },
  commandTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  commandCopy: {
    flex: 1,
    gap: 8,
  },
  commandEyebrow: {
    color: theme.colors.accentAlt,
    fontSize: 12,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    fontFamily: theme.fonts.mono,
  },
  commandValue: {
    color: theme.colors.text,
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '900',
    fontFamily: theme.fonts.display,
  },
  commandCaption: {
    color: theme.colors.textMuted,
    lineHeight: 20,
  },
  commandStatusWrap: {
    width: 108,
    gap: 10,
  },
  signalBadge: {
    borderRadius: theme.radius.md,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 4,
  },
  signalBadgeActive: {
    borderColor: theme.colors.warning,
    backgroundColor: `${theme.colors.warning}11`,
  },
  signalBadgeLabel: {
    color: theme.colors.textMuted,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontFamily: theme.fonts.mono,
  },
  signalBadgeValue: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '800',
    fontFamily: theme.fonts.display,
  },
  metricRibbon: {
    flexDirection: 'row',
    gap: 10,
  },
  metricTile: {
    flex: 1,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  metricTileValue: {
    color: theme.colors.text,
    fontSize: 23,
    fontWeight: '800',
    fontFamily: theme.fonts.display,
  },
  metricTileLabel: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginTop: 4,
    fontFamily: theme.fonts.mono,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  previewBreakdown: {
    gap: 10,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  previewLabel: {
    color: theme.colors.textMuted,
    fontSize: 13,
  },
  previewValue: {
    color: theme.colors.text,
    fontWeight: '700',
    fontFamily: theme.fonts.mono,
  },
  restRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  restChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: theme.radius.pill,
    backgroundColor: `${theme.colors.warning}18`,
    borderWidth: 1,
    borderColor: `${theme.colors.warning}55`,
  },
  restChipText: {
    color: theme.colors.warning,
    fontFamily: theme.fonts.mono,
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  restChipMuted: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  restChipMutedText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.mono,
    fontWeight: '700',
    fontSize: 12,
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
  searchLabel: {
    marginTop: 14,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    fontSize: 11,
    fontFamily: theme.fonts.mono,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
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
  emptySuggestion: {
    marginTop: 12,
    color: theme.colors.textDim,
    lineHeight: 18,
  },
  questStack: {
    gap: 12,
  },
  questRow: {
    padding: 14,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceSoft,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 10,
  },
  questHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'flex-start',
  },
  questEyebrow: {
    color: theme.colors.textMuted,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    fontFamily: theme.fonts.mono,
  },
  questTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
  },
  questDelta: {
    color: theme.colors.accent,
    fontWeight: '700',
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  exerciseCard: {
    borderColor: theme.colors.border,
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
  exerciseBadge: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: theme.radius.pill,
    backgroundColor: `${theme.colors.accentAlt}18`,
    borderWidth: 1,
    borderColor: `${theme.colors.accentAlt}55`,
  },
  exerciseBadgeText: {
    color: theme.colors.accentAlt,
    fontSize: 11,
    fontFamily: theme.fonts.mono,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  quickActionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  quickActionChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  quickActionChipDanger: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: theme.radius.pill,
    backgroundColor: `${theme.colors.danger}14`,
    borderWidth: 1,
    borderColor: `${theme.colors.danger}44`,
  },
  quickActionText: {
    color: theme.colors.text,
    fontSize: 11,
    fontFamily: theme.fonts.mono,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  quickActionDangerText: {
    color: theme.colors.danger,
    fontSize: 11,
    fontFamily: theme.fonts.mono,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
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
