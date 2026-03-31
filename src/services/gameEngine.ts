import { baseQuestTemplates, rankConfig, xpRules } from '../config/game';
import {
  CosmeticItem,
  Exercise,
  LoggedExercise,
  Post,
  ProgressSnapshot,
  Quest,
  RankTier,
  UserProfile,
  Workout,
  WorkoutDraft,
  WorkoutDraftExercise,
  WorkoutRewardBreakdown,
} from '../types/models';
import { clamp, toId } from '../utils/format';

function sumSetTotals(exercises: LoggedExercise[]) {
  return exercises.reduce(
    (accumulator, exercise) => {
      exercise.sets.forEach((set) => {
        accumulator.totalSets += 1;
        accumulator.totalReps += set.reps;
        accumulator.totalVolume += set.weight * set.reps;
      });

      return accumulator;
    },
    { totalSets: 0, totalReps: 0, totalVolume: 0 }
  );
}

function toLoggedExercises(draftExercises: WorkoutDraftExercise[]): LoggedExercise[] {
  return draftExercises.map((exercise) => ({
    id: `${exercise.exerciseId}-${exercise.sets.length}`,
    exerciseId: exercise.exerciseId,
    name: exercise.name,
    notes: exercise.notes.trim() ? exercise.notes.trim() : undefined,
    sets: exercise.sets
      .map((set) => ({
        id: set.id,
        reps: Number.parseInt(set.reps, 10) || 0,
        weight: Number.parseFloat(set.weight) || 0,
      }))
      .filter((set) => set.reps > 0),
  }));
}

function getPersonalRecordNames(
  exercises: LoggedExercise[],
  existingWorkouts: Workout[]
): string[] {
  const maxByExercise = new Map<string, number>();

  existingWorkouts.forEach((workout) => {
    workout.exercises.forEach((exercise) => {
      const bestWeight = Math.max(...exercise.sets.map((set) => set.weight), 0);
      const previous = maxByExercise.get(exercise.exerciseId) ?? 0;
      maxByExercise.set(exercise.exerciseId, Math.max(previous, bestWeight));
    });
  });

  return exercises.reduce<string[]>((records, exercise) => {
    const currentBest = Math.max(...exercise.sets.map((set) => set.weight), 0);
    const previousBest = maxByExercise.get(exercise.exerciseId) ?? 0;

    if (currentBest > previousBest && currentBest > 0) {
      records.push(`${exercise.name} ${currentBest} kg`);
    }

    return records;
  }, []);
}

function getQuestCompletion(
  quests: Quest[],
  workout: Workout,
  prCount: number
): { quests: Quest[]; xp: number; currency: number; completedIds: string[] } {
  let totalXp = 0;
  let totalCurrency = 0;
  const completedIds: string[] = [];

  const nextQuests = quests.map((quest) => {
    if (quest.completed) {
      return quest;
    }

    let increment = 0;
    if (quest.goalType === 'workouts') {
      increment = 1;
    }

    if (quest.goalType === 'volume') {
      increment = workout.totalVolume;
    }

    if (quest.goalType === 'prs') {
      increment = prCount;
    }

    if (quest.goalType === 'consistency') {
      increment = 1;
    }

    if (quest.goalType === 'social') {
      increment = 1;
    }

    const progress = Math.min(quest.target, quest.progress + increment);
    const completed = progress >= quest.target;

    if (completed) {
      totalXp += quest.xpReward;
      totalCurrency += quest.currencyReward;
      completedIds.push(quest.id);
    }

    return {
      ...quest,
      progress,
      completed,
    };
  });

  return { quests: nextQuests, xp: totalXp, currency: totalCurrency, completedIds };
}

export function getRankForXp(xp: number): RankTier {
  let current: RankTier = 'Bronze';
  rankConfig.forEach((rank) => {
    if (xp >= rank.minXp) {
      current = rank.tier;
    }
  });
  return current;
}

export function getRankProgress(xp: number): number {
  const currentIndex = rankConfig.findIndex((rank, index) => {
    const next = rankConfig[index + 1];
    return xp >= rank.minXp && (!next || xp < next.minXp);
  });
  const currentRank = rankConfig[currentIndex];
  const nextRank = rankConfig[currentIndex + 1];

  if (!nextRank) {
    return 1;
  }

  return clamp((xp - currentRank.minXp) / (nextRank.minXp - currentRank.minXp), 0, 1);
}

export function createDraftExercise(exercise: Exercise): WorkoutDraftExercise {
  return {
    exerciseId: exercise.id,
    name: exercise.name,
    notes: '',
    sets: [
      { id: `${exercise.id}-1`, reps: '10', weight: '0' },
      { id: `${exercise.id}-2`, reps: '10', weight: '0' },
      { id: `${exercise.id}-3`, reps: '8', weight: '0' },
    ],
  };
}

export function summarizeDraft(draft: WorkoutDraft | null): {
  totalSets: number;
  totalVolume: number;
  exerciseCount: number;
} {
  if (!draft) {
    return { totalSets: 0, totalVolume: 0, exerciseCount: 0 };
  }

  return draft.exercises.reduce(
    (accumulator, exercise) => {
      accumulator.exerciseCount += 1;
      exercise.sets.forEach((set) => {
        const reps = Number.parseInt(set.reps, 10) || 0;
        const weight = Number.parseFloat(set.weight) || 0;
        accumulator.totalSets += 1;
        accumulator.totalVolume += reps * weight;
      });
      return accumulator;
    },
    { totalSets: 0, totalVolume: 0, exerciseCount: 0 }
  );
}

export function buildWorkoutFromDraft(
  draft: WorkoutDraft,
  user: UserProfile,
  existingWorkouts: Workout[],
  quests: Quest[]
): {
  workout: Workout;
  user: UserProfile;
  quests: Quest[];
  reward: WorkoutRewardBreakdown;
  autoPost: Post;
  snapshot: ProgressSnapshot;
} {
  const endedAt = new Date().toISOString();
  const exercises = toLoggedExercises(draft.exercises).filter((exercise) => exercise.sets.length > 0);
  const totals = sumSetTotals(exercises);
  const durationMinutes = Math.max(
    22,
    Math.round((new Date(endedAt).getTime() - new Date(draft.startedAt).getTime()) / 60000)
  );
  const prHighlights = getPersonalRecordNames(exercises, existingWorkouts);
  const baseXp =
    xpRules.baseWorkoutXp +
    totals.totalSets * xpRules.perSetXp +
    exercises.length * xpRules.perExerciseXp +
    Math.floor(totals.totalVolume / xpRules.volumeStepSize) * xpRules.volumeStepXp;
  const consistencyXp = Math.min(
    xpRules.streakBonusCap,
    Math.max(1, user.streak) * xpRules.consistencyMultiplier
  );
  const prXp = prHighlights.length * xpRules.prBonusXp;
  const nextStreak = user.streak + 1;

  const baseWorkout: Workout = {
    id: `${draft.id}-complete`,
    userId: user.id,
    title: draft.title,
    startedAt: draft.startedAt,
    endedAt,
    durationMinutes,
    exercises,
    totalSets: totals.totalSets,
    totalReps: totals.totalReps,
    totalVolume: totals.totalVolume,
    xpAwarded: 0,
    prHighlights,
    templateId: draft.routineId,
  };

  const questCompletion = getQuestCompletion(quests, baseWorkout, prHighlights.length);
  const totalXp =
    baseXp + consistencyXp + prXp + questCompletion.xp + xpRules.socialShareXp;
  const currencyEarned = 20 + questCompletion.currency + prHighlights.length * 10;
  const rankBefore = getRankForXp(user.xp);
  const rankAfter = getRankForXp(user.xp + totalXp);

  const workout: Workout = {
    ...baseWorkout,
    xpAwarded: totalXp,
  };

  const updatedUser: UserProfile = {
    ...user,
    xp: user.xp + totalXp,
    streak: nextStreak,
    longestStreak: Math.max(user.longestStreak, nextStreak),
    totalPrs: user.totalPrs + prHighlights.length,
    rank: rankAfter,
    currency: user.currency + currencyEarned,
    totalWorkouts: user.totalWorkouts + 1,
  };

  const reward: WorkoutRewardBreakdown = {
    baseXp,
    consistencyXp,
    prXp,
    questXp: questCompletion.xp,
    totalXp,
    currencyEarned,
    streak: nextStreak,
    rankBefore,
    rankAfter,
    rankProgressBefore: getRankProgress(user.xp),
    rankProgressAfter: getRankProgress(updatedUser.xp),
    completedQuestIds: questCompletion.completedIds,
    discoveredPrs: prHighlights,
    unlockedCosmetics: [],
  };

  const autoPost: Post = {
    id: toId(`${user.id}-${endedAt}`),
    authorId: user.id,
    createdAt: endedAt,
    type: prHighlights.length > 0 ? 'pr' : 'workout',
    title: prHighlights.length > 0 ? 'New PR Session' : 'Workout Complete',
    content: `${workout.title} finished with ${totals.totalSets} sets, ${totals.totalVolume} kg volume, and ${totalXp} XP earned.`,
    chips: [
      `+${totalXp} XP`,
      `${totals.totalSets} sets`,
      `${totals.totalVolume} kg`,
      `${nextStreak} day streak`,
    ],
    likeUserIds: [],
    commentIds: [],
  };

  const snapshot: ProgressSnapshot = {
    id: `snapshot-${endedAt}`,
    userId: user.id,
    date: endedAt,
    totalVolume: workout.totalVolume,
    workoutCount: 1,
    strengthScore: Math.round(workout.totalVolume / Math.max(1, workout.totalSets)),
    bodyweight: 79.2,
    prs: prHighlights.length,
  };

  return {
    workout,
    user: updatedUser,
    quests: questCompletion.quests,
    reward,
    autoPost,
    snapshot,
  };
}

export function ensureQuestState(seed: Quest[] = baseQuestTemplates): Quest[] {
  return seed.map((quest) => ({ ...quest }));
}

export function unlockPrCosmetics(
  previousTotalPrs: number,
  updatedUser: UserProfile,
  cosmetics: CosmeticItem[]
): {
  cosmetics: CosmeticItem[];
  unlockedCosmetics: CosmeticItem[];
} {
  const unlockedCosmetics = cosmetics.filter(
    (cosmetic) =>
      cosmetic.unlockSource === 'pr_milestone' &&
      !cosmetic.unlocked &&
      typeof cosmetic.prThreshold === 'number' &&
      previousTotalPrs < cosmetic.prThreshold &&
      updatedUser.totalPrs >= cosmetic.prThreshold
  );

  return {
    cosmetics: cosmetics.map((cosmetic) =>
      unlockedCosmetics.some((unlocked) => unlocked.id === cosmetic.id)
        ? { ...cosmetic, unlocked: true }
        : cosmetic
    ),
    unlockedCosmetics,
  };
}

export function getWorkoutFrequency(workouts: Workout[]) {
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const values = Array.from({ length: 7 }, () => 0);

  workouts.forEach((workout) => {
    const day = new Date(workout.endedAt).getDay();
    const mondayAligned = day === 0 ? 6 : day - 1;
    values[mondayAligned] += 1;
  });

  return labels.map((label, index) => ({ label, value: values[index] }));
}

export function getStrengthTrend(workouts: Workout[], exerciseName: string) {
  return workouts
    .filter((workout) =>
      workout.exercises.some((exercise) =>
        exercise.name.toLowerCase().includes(exerciseName.toLowerCase())
      )
    )
    .slice(0, 6)
    .reverse()
    .map((workout) => {
      const matching = workout.exercises.find((exercise) =>
        exercise.name.toLowerCase().includes(exerciseName.toLowerCase())
      );
      const bestWeight = Math.max(...(matching?.sets.map((set) => set.weight) ?? [0]));
      return {
        label: new Date(workout.endedAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        value: bestWeight,
      };
    });
}

export function getVolumeTrend(progressStats: ProgressSnapshot[]) {
  return progressStats
    .slice(0, 6)
    .reverse()
    .map((snapshot) => ({
      label: new Date(snapshot.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      value: snapshot.totalVolume,
    }));
}

export function getRecentExercises(workouts: Workout[]): string[] {
  return Array.from(
    new Set(
      workouts
        .flatMap((workout) => workout.exercises.map((exercise) => exercise.name))
        .slice(0, 18)
    )
  ).slice(0, 6);
}
