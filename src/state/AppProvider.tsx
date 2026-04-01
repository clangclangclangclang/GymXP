import React, { createContext, useContext, useEffect, useState } from 'react';

import { seedDatabase } from '../data/mock';
import {
  createFreshUserProfile,
  createFreshUserSnapshot,
  createPersonalizedDemoSnapshot,
  mergeRemoteSnapshotWithDemo,
} from '../services/backend/bootstrap';
import { isSupabaseConfigured } from '../services/backend/config';
import {
  clearLocalAuthFlag,
  loadLocalSnapshot,
  saveLocalSnapshot,
} from '../services/backend/localCache';
import {
  loadRemoteSnapshot,
  restoreRemoteSession,
  saveRemoteSnapshot,
  signInRemote,
  signOutRemote,
  signUpRemote,
} from '../services/backend/supabaseRepository';
import {
  buildWorkoutFromDraft,
  createDraftExercise,
  unlockPrCosmetics,
} from '../services/gameEngine';
import { buildYearlySummary } from '../services/summaryEngine';
import {
  AppDataSnapshot,
  AuthInput,
  CosmeticSlot,
  Exercise,
  LeaderboardScope,
  ScreenKey,
  WorkoutDraft,
  WorkoutRewardBreakdown,
  Workout,
} from '../types/models';
import { toId } from '../utils/format';

interface AppContextValue {
  isAuthenticated: boolean;
  isHydrating: boolean;
  authPending: boolean;
  isBackendConfigured: boolean;
  activeScreen: ScreenKey;
  currentUser: AppDataSnapshot['currentUser'];
  users: AppDataSnapshot['users'];
  exercises: Exercise[];
  routines: AppDataSnapshot['routines'];
  workouts: AppDataSnapshot['workouts'];
  progress: AppDataSnapshot['progress'];
  quests: AppDataSnapshot['quests'];
  rewards: AppDataSnapshot['rewards'];
  cosmetics: AppDataSnapshot['cosmetics'];
  friendships: AppDataSnapshot['friendships'];
  posts: AppDataSnapshot['posts'];
  comments: AppDataSnapshot['comments'];
  yearlySummary: AppDataSnapshot['yearlySummary'];
  leaderboardScope: LeaderboardScope;
  workoutDraft: WorkoutDraft | null;
  lastWorkoutReward: WorkoutRewardBreakdown | null;
  lastWorkout: Workout | null;
  totalExerciseCount: number;
  authenticate: (input: AuthInput) => Promise<string | null>;
  signOut: () => Promise<void>;
  setActiveScreen: (screen: ScreenKey) => void;
  setLeaderboardScope: (scope: LeaderboardScope) => void;
  startWorkout: (routineId?: string) => void;
  addExerciseToDraft: (exerciseId: string) => void;
  addSetToDraft: (exerciseId: string) => void;
  updateDraftSet: (
    exerciseId: string,
    setId: string,
    field: 'reps' | 'weight',
    value: string
  ) => void;
  updateDraftNotes: (exerciseId: string, notes: string) => void;
  removeDraftExercise: (exerciseId: string) => void;
  finishWorkout: () => void;
  likePost: (postId: string) => void;
  addComment: (postId: string, content: string) => void;
  toggleFollow: (userId: string) => void;
  unlockReward: (rewardId: string) => void;
  selectAvatarCosmetic: (slot: CosmeticSlot, cosmeticId: string) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

function replaceCurrentUser(snapshot: AppDataSnapshot, currentUser: AppDataSnapshot['currentUser']) {
  return {
    ...snapshot,
    currentUser,
    users: [
      currentUser,
      ...snapshot.users.filter(
        (user) => user.id !== snapshot.currentUser.id && user.id !== currentUser.id
      ),
    ],
  };
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);
  const [authPending, setAuthPending] = useState(false);
  const [activeScreen, setActiveScreen] = useState<ScreenKey>('home');
  const [leaderboardScope, setLeaderboardScope] = useState<LeaderboardScope>('friends');
  const [snapshot, setSnapshot] = useState<AppDataSnapshot>({
    currentUser: seedDatabase.currentUser,
    users: seedDatabase.users,
    routines: seedDatabase.routines,
    workouts: seedDatabase.workouts,
    progress: seedDatabase.progress,
    quests: seedDatabase.quests,
    rewards: seedDatabase.rewards,
    cosmetics: seedDatabase.cosmetics,
    friendships: seedDatabase.friendships,
    posts: seedDatabase.posts,
    comments: seedDatabase.comments,
    yearlySummary: seedDatabase.yearlySummary,
  });
  const [workoutDraft, setWorkoutDraft] = useState<WorkoutDraft | null>(null);
  const [lastWorkoutReward, setLastWorkoutReward] = useState<WorkoutRewardBreakdown | null>(null);
  const [lastWorkout, setLastWorkout] = useState<Workout | null>(null);

  const supabaseEnabled = isSupabaseConfigured();

  async function persistSnapshot(nextSnapshot: AppDataSnapshot, nextAuth = isAuthenticated) {
    setSnapshot(nextSnapshot);
    await saveLocalSnapshot(nextSnapshot, nextAuth);

    if (supabaseEnabled && nextAuth) {
      await saveRemoteSnapshot(nextSnapshot);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      try {
        if (supabaseEnabled) {
          const authUser = await restoreRemoteSession();

          if (authUser) {
            const remoteSnapshot = await loadRemoteSnapshot(authUser);

            if (remoteSnapshot) {
              if (!cancelled) {
                setSnapshot(mergeRemoteSnapshotWithDemo(remoteSnapshot));
                setIsAuthenticated(true);
              }
            }
          }
        } else {
          const local = await loadLocalSnapshot();

          if (local.snapshot && !cancelled) {
            setSnapshot(local.snapshot);
            setIsAuthenticated(Boolean(local.auth?.isAuthenticated));
          }
        }
      } catch (error) {
        console.warn('GymXP hydration failed:', error);
      } finally {
        if (!cancelled) {
          setIsHydrating(false);
        }
      }
    }

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, [supabaseEnabled]);

  async function authenticate(input: AuthInput) {
    setAuthPending(true);

    try {
      if (supabaseEnabled) {
        const authUser =
          input.mode === 'signup'
            ? await signUpRemote(input.email.trim(), input.password)
            : await signInRemote(input.email.trim(), input.password);

        let remoteSnapshot = await loadRemoteSnapshot(authUser);

        if (!remoteSnapshot) {
          const freshUser = createFreshUserProfile(authUser.id, input);
          remoteSnapshot = createFreshUserSnapshot(freshUser);
          await saveRemoteSnapshot(remoteSnapshot);
        }

        const mergedSnapshot = mergeRemoteSnapshotWithDemo(remoteSnapshot);
        await saveLocalSnapshot(mergedSnapshot, true);
        setSnapshot(mergedSnapshot);
        setIsAuthenticated(true);
        setActiveScreen('home');
        return null;
      }

      const local = await loadLocalSnapshot();
      const nextSnapshot =
        input.mode === 'login' && local.snapshot
          ? local.snapshot
          : createPersonalizedDemoSnapshot(
              input,
              local.snapshot ?? {
                currentUser: seedDatabase.currentUser,
                users: seedDatabase.users,
                routines: seedDatabase.routines,
                workouts: seedDatabase.workouts,
                progress: seedDatabase.progress,
                quests: seedDatabase.quests,
                rewards: seedDatabase.rewards,
                cosmetics: seedDatabase.cosmetics,
                friendships: seedDatabase.friendships,
                posts: seedDatabase.posts,
                comments: seedDatabase.comments,
                yearlySummary: seedDatabase.yearlySummary,
              }
            );

      await saveLocalSnapshot(nextSnapshot, true);
      setSnapshot(nextSnapshot);
      setIsAuthenticated(true);
      setActiveScreen('home');
      return null;
    } catch (error) {
      return getErrorMessage(error);
    } finally {
      setAuthPending(false);
    }
  }

  async function signOut() {
    setWorkoutDraft(null);
    setLastWorkout(null);
    setLastWorkoutReward(null);
    setActiveScreen('home');

    if (supabaseEnabled) {
      await signOutRemote();
    }

    await clearLocalAuthFlag();
    setIsAuthenticated(false);
  }

  function startWorkout(routineId?: string) {
    const selectedRoutine = snapshot.routines.find((routine) => routine.id === routineId);
    const selectedExercises = selectedRoutine
      ? selectedRoutine.exerciseIds
          .map((exerciseId) => seedDatabase.exercises.find((item) => item.id === exerciseId))
          .filter((item): item is Exercise => Boolean(item))
      : [];

    setWorkoutDraft({
      id: `draft-${Date.now()}`,
      title: selectedRoutine?.name ?? 'Live Workout',
      startedAt: new Date().toISOString(),
      routineId: selectedRoutine?.id,
      exercises: selectedExercises.map((exercise) => createDraftExercise(exercise)),
    });
    setActiveScreen('workout');
  }

  function addExerciseToDraft(exerciseId: string) {
    const exercise = seedDatabase.exercises.find((item) => item.id === exerciseId);

    if (!exercise) {
      return;
    }

    setWorkoutDraft((draft) => {
      if (!draft) {
        return draft;
      }

      const exists = draft.exercises.some((item) => item.exerciseId === exerciseId);
      if (exists) {
        return draft;
      }

      return {
        ...draft,
        exercises: [...draft.exercises, createDraftExercise(exercise)],
      };
    });
  }

  function addSetToDraft(exerciseId: string) {
    setWorkoutDraft((draft) => {
      if (!draft) {
        return draft;
      }

      return {
        ...draft,
        exercises: draft.exercises.map((exercise) => {
          if (exercise.exerciseId !== exerciseId) {
            return exercise;
          }

          const lastSet = exercise.sets[exercise.sets.length - 1];
          return {
            ...exercise,
            sets: [
              ...exercise.sets,
              {
                id: `${exerciseId}-${exercise.sets.length + 1}`,
                reps: lastSet?.reps ?? '8',
                weight: lastSet?.weight ?? '0',
              },
            ],
          };
        }),
      };
    });
  }

  function updateDraftSet(
    exerciseId: string,
    setId: string,
    field: 'reps' | 'weight',
    value: string
  ) {
    setWorkoutDraft((draft) => {
      if (!draft) {
        return draft;
      }

      return {
        ...draft,
        exercises: draft.exercises.map((exercise) => {
          if (exercise.exerciseId !== exerciseId) {
            return exercise;
          }

          return {
            ...exercise,
            sets: exercise.sets.map((set) =>
              set.id === setId
                ? {
                    ...set,
                    [field]: value,
                  }
                : set
            ),
          };
        }),
      };
    });
  }

  function updateDraftNotes(exerciseId: string, notes: string) {
    setWorkoutDraft((draft) => {
      if (!draft) {
        return draft;
      }

      return {
        ...draft,
        exercises: draft.exercises.map((exercise) =>
          exercise.exerciseId === exerciseId ? { ...exercise, notes } : exercise
        ),
      };
    });
  }

  function removeDraftExercise(exerciseId: string) {
    setWorkoutDraft((draft) => {
      if (!draft) {
        return draft;
      }

      return {
        ...draft,
        exercises: draft.exercises.filter((exercise) => exercise.exerciseId !== exerciseId),
      };
    });
  }

  function finishWorkout() {
    if (!workoutDraft) {
      return;
    }

    const result = buildWorkoutFromDraft(
      workoutDraft,
      snapshot.currentUser,
      snapshot.workouts,
      snapshot.quests
    );
    const cosmeticUnlock = unlockPrCosmetics(
      snapshot.currentUser.totalPrs,
      result.user,
      snapshot.cosmetics
    );
    const autoPost = cosmeticUnlock.unlockedCosmetics.length
      ? {
          ...result.autoPost,
          chips: [
            ...result.autoPost.chips,
            ...cosmeticUnlock.unlockedCosmetics.map((cosmetic) => `Unlocked ${cosmetic.name}`),
          ],
        }
      : result.autoPost;
    const nextSnapshot = replaceCurrentUser(
      {
        ...snapshot,
        workouts: [result.workout, ...snapshot.workouts],
        progress: [result.snapshot, ...snapshot.progress],
        quests: result.quests,
        cosmetics: cosmeticUnlock.cosmetics,
        posts: [autoPost, ...snapshot.posts],
        yearlySummary: buildYearlySummary(result.user, [result.workout, ...snapshot.workouts]),
      },
      result.user
    );

    setLastWorkoutReward({
      ...result.reward,
      unlockedCosmetics: cosmeticUnlock.unlockedCosmetics,
    });
    setLastWorkout(result.workout);
    setWorkoutDraft(null);
    setActiveScreen('summary');
    void persistSnapshot(nextSnapshot);
  }

  function likePost(postId: string) {
    const nextSnapshot = {
      ...snapshot,
      posts: snapshot.posts.map((post) => {
        if (post.id !== postId) {
          return post;
        }

        const alreadyLiked = post.likeUserIds.includes(snapshot.currentUser.id);
        return {
          ...post,
          likeUserIds: alreadyLiked
            ? post.likeUserIds.filter((userId) => userId !== snapshot.currentUser.id)
            : [...post.likeUserIds, snapshot.currentUser.id],
        };
      }),
    };

    void persistSnapshot(nextSnapshot);
  }

  function addComment(postId: string, content: string) {
    const trimmed = content.trim();
    if (!trimmed) {
      return;
    }

    const comment = {
      id: `comment-${Date.now()}`,
      postId,
      authorId: snapshot.currentUser.id,
      createdAt: new Date().toISOString(),
      content: trimmed,
    };
    const nextSnapshot = {
      ...snapshot,
      comments: [comment, ...snapshot.comments],
      posts: snapshot.posts.map((post) =>
        post.id === postId ? { ...post, commentIds: [...post.commentIds, comment.id] } : post
      ),
    };

    void persistSnapshot(nextSnapshot);
  }

  function toggleFollow(userId: string) {
    const relationship = snapshot.friendships.find(
      (friendship) =>
        friendship.userId === snapshot.currentUser.id && friendship.friendId === userId
    );
    const nextSnapshot = {
      ...snapshot,
      friendships: relationship
        ? snapshot.friendships.filter((friendship) => friendship.id !== relationship.id)
        : [
            ...snapshot.friendships,
            {
              id: toId(`${snapshot.currentUser.id}-${userId}`),
              userId: snapshot.currentUser.id,
              friendId: userId,
              status: 'following' as const,
            },
          ],
    };

    void persistSnapshot(nextSnapshot);
  }

  function unlockReward(rewardId: string) {
    const reward = snapshot.rewards.find((item) => item.id === rewardId);

    if (!reward || reward.unlocked || reward.cost > snapshot.currentUser.currency) {
      return;
    }

    const updatedUser = {
      ...snapshot.currentUser,
      currency: snapshot.currentUser.currency - reward.cost,
      badges:
        reward.kind === 'badge'
          ? [...snapshot.currentUser.badges, { id: reward.id, label: reward.name, tone: '#f2c45a' }]
          : snapshot.currentUser.badges,
    };

    const nextSnapshot = replaceCurrentUser(
      {
        ...snapshot,
        rewards: snapshot.rewards.map((item) =>
          item.id === rewardId ? { ...item, unlocked: true } : item
        ),
        yearlySummary: buildYearlySummary(updatedUser, snapshot.workouts),
      },
      updatedUser
    );

    void persistSnapshot(nextSnapshot);
  }

  function selectAvatarCosmetic(slot: CosmeticSlot, cosmeticId: string) {
    const cosmetic = snapshot.cosmetics.find((item) => item.id === cosmeticId);

    if (!cosmetic || !cosmetic.unlocked || cosmetic.slot !== slot) {
      return;
    }

    const nextAvatar =
      slot === 'frame'
        ? { ...snapshot.currentUser.avatar, frameId: cosmeticId }
        : slot === 'face'
          ? { ...snapshot.currentUser.avatar, faceId: cosmeticId }
          : slot === 'top'
            ? { ...snapshot.currentUser.avatar, topId: cosmeticId }
            : { ...snapshot.currentUser.avatar, auraId: cosmeticId };

    const nextSnapshot = replaceCurrentUser(snapshot, {
      ...snapshot.currentUser,
      avatar: nextAvatar,
    });

    void persistSnapshot(nextSnapshot);
  }

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        isHydrating,
        authPending,
        isBackendConfigured: supabaseEnabled,
        activeScreen,
        currentUser: snapshot.currentUser,
        users: snapshot.users,
        exercises: seedDatabase.exercises,
        routines: snapshot.routines,
        workouts: snapshot.workouts,
        progress: snapshot.progress,
        quests: snapshot.quests,
        rewards: snapshot.rewards,
        cosmetics: snapshot.cosmetics,
        friendships: snapshot.friendships,
        posts: snapshot.posts,
        comments: snapshot.comments,
        yearlySummary: snapshot.yearlySummary,
        leaderboardScope,
        workoutDraft,
        lastWorkoutReward,
        lastWorkout,
        totalExerciseCount: seedDatabase.totalExerciseCount,
        authenticate,
        signOut,
        setActiveScreen,
        setLeaderboardScope,
        startWorkout,
        addExerciseToDraft,
        addSetToDraft,
        updateDraftSet,
        updateDraftNotes,
        removeDraftExercise,
        finishWorkout,
        likePost,
        addComment,
        toggleFollow,
        unlockReward,
        selectAvatarCosmetic,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useApp must be used within AppProvider.');
  }

  return context;
}
