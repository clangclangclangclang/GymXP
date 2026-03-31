import React, { createContext, useContext, useState } from 'react';

import { seedDatabase } from '../data/mock';
import {
  buildWorkoutFromDraft,
  createDraftExercise,
  unlockPrCosmetics,
} from '../services/gameEngine';
import { buildYearlySummary } from '../services/summaryEngine';
import {
  CosmeticItem,
  CosmeticSlot,
  Exercise,
  Friendship,
  LeaderboardScope,
  Post,
  PostComment,
  ProgressSnapshot,
  Quest,
  RewardItem,
  RoutineTemplate,
  ScreenKey,
  UserProfile,
  Workout,
  WorkoutDraft,
  WorkoutRewardBreakdown,
  YearlySummary,
} from '../types/models';
import { toId } from '../utils/format';

interface CompleteOnboardingInput {
  username: string;
  displayName: string;
  bio: string;
}

interface AppContextValue {
  isAuthenticated: boolean;
  activeScreen: ScreenKey;
  currentUser: UserProfile;
  users: UserProfile[];
  exercises: Exercise[];
  routines: RoutineTemplate[];
  workouts: Workout[];
  progress: ProgressSnapshot[];
  quests: Quest[];
  rewards: RewardItem[];
  cosmetics: CosmeticItem[];
  friendships: Friendship[];
  posts: Post[];
  comments: PostComment[];
  yearlySummary: YearlySummary;
  leaderboardScope: LeaderboardScope;
  workoutDraft: WorkoutDraft | null;
  lastWorkoutReward: WorkoutRewardBreakdown | null;
  lastWorkout: Workout | null;
  totalExerciseCount: number;
  completeOnboarding: (input: CompleteOnboardingInput) => void;
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

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeScreen, setActiveScreen] = useState<ScreenKey>('home');
  const [leaderboardScope, setLeaderboardScope] = useState<LeaderboardScope>('friends');
  const [currentUser, setCurrentUser] = useState(seedDatabase.currentUser);
  const [users, setUsers] = useState(seedDatabase.users);
  const [exercises] = useState(seedDatabase.exercises);
  const [routines] = useState(seedDatabase.routines);
  const [workouts, setWorkouts] = useState(seedDatabase.workouts);
  const [progress, setProgress] = useState(seedDatabase.progress);
  const [quests, setQuests] = useState(seedDatabase.quests);
  const [rewards, setRewards] = useState(seedDatabase.rewards);
  const [cosmetics, setCosmetics] = useState(seedDatabase.cosmetics);
  const [friendships, setFriendships] = useState(seedDatabase.friendships);
  const [posts, setPosts] = useState(seedDatabase.posts);
  const [comments, setComments] = useState(seedDatabase.comments);
  const [yearlySummary, setYearlySummary] = useState(seedDatabase.yearlySummary);
  const [workoutDraft, setWorkoutDraft] = useState<WorkoutDraft | null>(null);
  const [lastWorkoutReward, setLastWorkoutReward] = useState<WorkoutRewardBreakdown | null>(null);
  const [lastWorkout, setLastWorkout] = useState<Workout | null>(null);

  function syncCurrentUser(updatedUser: UserProfile) {
    setCurrentUser(updatedUser);
    setUsers((existing) =>
      existing.map((user) => (user.id === updatedUser.id ? updatedUser : user))
    );
  }

  function completeOnboarding(input: CompleteOnboardingInput) {
    const updatedUser: UserProfile = {
      ...currentUser,
      username: input.username.trim() || currentUser.username,
      displayName: input.displayName.trim() || currentUser.displayName,
      bio: input.bio.trim() || currentUser.bio,
    };

    syncCurrentUser(updatedUser);
    setYearlySummary(buildYearlySummary(updatedUser, workouts));
    setIsAuthenticated(true);
  }

  function startWorkout(routineId?: string) {
    const selectedRoutine = routines.find((routine) => routine.id === routineId);
    const selectedExercises = selectedRoutine
      ? selectedRoutine.exerciseIds
          .map((exerciseId) => exercises.find((item) => item.id === exerciseId))
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
    const exercise = exercises.find((item) => item.id === exerciseId);

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

    const result = buildWorkoutFromDraft(workoutDraft, currentUser, workouts, quests);
    const cosmeticUnlock = unlockPrCosmetics(currentUser.totalPrs, result.user, cosmetics);
    const finalUser = result.user;
    const finalReward = {
      ...result.reward,
      unlockedCosmetics: cosmeticUnlock.unlockedCosmetics,
    };
    const autoPost = cosmeticUnlock.unlockedCosmetics.length
      ? {
          ...result.autoPost,
          chips: [
            ...result.autoPost.chips,
            ...cosmeticUnlock.unlockedCosmetics.map((cosmetic) => `Unlocked ${cosmetic.name}`),
          ],
        }
      : result.autoPost;
    const nextWorkouts = [result.workout, ...workouts];
    const nextProgress = [result.snapshot, ...progress];
    const nextPosts = [autoPost, ...posts];

    syncCurrentUser(finalUser);
    setWorkouts(nextWorkouts);
    setProgress(nextProgress);
    setQuests(result.quests);
    setPosts(nextPosts);
    setCosmetics(cosmeticUnlock.cosmetics);
    setYearlySummary(buildYearlySummary(finalUser, nextWorkouts));
    setLastWorkoutReward(finalReward);
    setLastWorkout(result.workout);
    setWorkoutDraft(null);
    setActiveScreen('summary');
  }

  function likePost(postId: string) {
    setPosts((existing) =>
      existing.map((post) => {
        if (post.id !== postId) {
          return post;
        }

        const alreadyLiked = post.likeUserIds.includes(currentUser.id);
        return {
          ...post,
          likeUserIds: alreadyLiked
            ? post.likeUserIds.filter((userId) => userId !== currentUser.id)
            : [...post.likeUserIds, currentUser.id],
        };
      })
    );
  }

  function addComment(postId: string, content: string) {
    const trimmed = content.trim();
    if (!trimmed) {
      return;
    }

    const comment: PostComment = {
      id: `comment-${Date.now()}`,
      postId,
      authorId: currentUser.id,
      createdAt: new Date().toISOString(),
      content: trimmed,
    };

    setComments((existing) => [comment, ...existing]);
    setPosts((existing) =>
      existing.map((post) =>
        post.id === postId ? { ...post, commentIds: [...post.commentIds, comment.id] } : post
      )
    );
  }

  function toggleFollow(userId: string) {
    setFriendships((existing) => {
      const relationship = existing.find(
        (friendship) => friendship.userId === currentUser.id && friendship.friendId === userId
      );

      if (relationship) {
        return existing.filter((friendship) => friendship.id !== relationship.id);
      }

      return [
        ...existing,
        {
          id: toId(`${currentUser.id}-${userId}`),
          userId: currentUser.id,
          friendId: userId,
          status: 'following',
        },
      ];
    });
  }

  function unlockReward(rewardId: string) {
    const reward = rewards.find((item) => item.id === rewardId);

    if (!reward || reward.unlocked || reward.cost > currentUser.currency) {
      return;
    }

    const updatedUser = {
      ...currentUser,
      currency: currentUser.currency - reward.cost,
      badges:
        reward.kind === 'badge'
          ? [...currentUser.badges, { id: reward.id, label: reward.name, tone: '#f2c45a' }]
          : currentUser.badges,
    };

    syncCurrentUser(updatedUser);
    setRewards((existing) =>
      existing.map((item) => (item.id === rewardId ? { ...item, unlocked: true } : item))
    );
    setYearlySummary(buildYearlySummary(updatedUser, workouts));
  }

  function selectAvatarCosmetic(slot: CosmeticSlot, cosmeticId: string) {
    const cosmetic = cosmetics.find((item) => item.id === cosmeticId);

    if (!cosmetic || !cosmetic.unlocked || cosmetic.slot !== slot) {
      return;
    }

    const nextAvatar =
      slot === 'frame'
        ? { ...currentUser.avatar, frameId: cosmeticId }
        : slot === 'face'
          ? { ...currentUser.avatar, faceId: cosmeticId }
          : slot === 'top'
            ? { ...currentUser.avatar, topId: cosmeticId }
            : { ...currentUser.avatar, auraId: cosmeticId };

    syncCurrentUser({
      ...currentUser,
      avatar: nextAvatar,
    });
  }

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        activeScreen,
        currentUser,
        users,
        exercises,
        routines,
        workouts,
        progress,
        quests,
        rewards,
        cosmetics,
        friendships,
        posts,
        comments,
        yearlySummary,
        leaderboardScope,
        workoutDraft,
        lastWorkoutReward,
        lastWorkout,
        totalExerciseCount: seedDatabase.totalExerciseCount,
        completeOnboarding,
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
