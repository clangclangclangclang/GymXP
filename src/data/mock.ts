import { cosmeticCatalog, defaultAvatarLoadout } from '../config/cosmetics';
import { rewardCatalog } from '../config/game';
import { buildExerciseDatabase } from './exercises';
import { ensureQuestState, getRankForXp } from '../services/gameEngine';
import { buildYearlySummary } from '../services/summaryEngine';
import {
  Badge,
  Friendship,
  LoggedExercise,
  Post,
  PostComment,
  ProgressSnapshot,
  RoutineTemplate,
  UserProfile,
  Workout,
} from '../types/models';
import { toId } from '../utils/format';

function dateDaysAgo(days: number, hour = 18): string {
  const value = new Date();
  value.setDate(value.getDate() - days);
  value.setHours(hour, 0, 0, 0);
  return value.toISOString();
}

const exercises = buildExerciseDatabase();
const exerciseByName = new Map(exercises.map((exercise) => [exercise.name, exercise]));

function createLoggedExercise(name: string, sets: Array<[number, number]>, notes = ''): LoggedExercise {
  const exercise = exerciseByName.get(name) ?? exercises[0];
  return {
    id: `${exercise.id}-${sets.length}`,
    exerciseId: exercise.id,
    name: exercise.name,
    notes: notes || undefined,
    sets: sets.map(([reps, weight], index) => ({
      id: `${exercise.id}-${index + 1}`,
      reps,
      weight,
    })),
  };
}

function createWorkout(
  id: string,
  title: string,
  daysAgo: number,
  entries: Array<{ name: string; sets: Array<[number, number]>; notes?: string }>
): Workout {
  const startedAt = dateDaysAgo(daysAgo, 17);
  const endedAt = dateDaysAgo(daysAgo, 18);
  const loggedExercises = entries.map((entry) =>
    createLoggedExercise(entry.name, entry.sets, entry.notes)
  );
  const totalSets = loggedExercises.reduce((sum, exercise) => sum + exercise.sets.length, 0);
  const totalReps = loggedExercises.reduce(
    (sum, exercise) => sum + exercise.sets.reduce((inner, set) => inner + set.reps, 0),
    0
  );
  const totalVolume = loggedExercises.reduce(
    (sum, exercise) =>
      sum +
      exercise.sets.reduce((inner, set) => inner + set.reps * set.weight, 0),
    0
  );
  const prHighlights = daysAgo === 2 ? ['Barbell Bench Press 95 kg'] : daysAgo === 0 ? ['Barbell Back Squat 145 kg'] : [];

  return {
    id,
    userId: 'u1',
    title,
    startedAt,
    endedAt,
    durationMinutes: 58 + daysAgo,
    exercises: loggedExercises,
    totalSets,
    totalReps,
    totalVolume,
    xpAwarded: 110 + totalSets * 4 + prHighlights.length * 20,
    prHighlights,
  };
}

const badges: Badge[] = [
  { id: 'badge-1', label: 'PR Hunter', tone: '#f2c45a' },
  { id: 'badge-2', label: '8 Day Streak', tone: '#8cf26d' },
  { id: 'badge-3', label: 'Crew Captain', tone: '#53d2c2' },
];

export const seedCurrentUser: UserProfile = {
  id: 'u1',
  username: 'liftnephi',
  displayName: 'Nephi Steele',
  bio: 'Chasing stronger lifts, cleaner reps, and longer streaks.',
  joinedDate: '2025-01-14T00:00:00.000Z',
  xp: 1680,
  streak: 8,
  longestStreak: 15,
  totalPrs: 4,
  rank: getRankForXp(1680),
  badges,
  avatarColor: '#8cf26d',
  avatar: {
    frameId: 'frame-champion',
    faceId: 'face-focus',
    topId: 'top-pr-gold',
    auraId: 'aura-none',
  },
  currency: 265,
  totalWorkouts: 46,
  referralCode: 'GYMXP-NEPHI',
};

export const seedUsers: UserProfile[] = [
  seedCurrentUser,
  {
    id: 'u2',
    username: 'ana.power',
    displayName: 'Ana Park',
    bio: 'Strong lifts and stronger consistency.',
    joinedDate: '2024-11-02T00:00:00.000Z',
    xp: 1940,
    streak: 11,
    longestStreak: 19,
    totalPrs: 6,
    rank: getRankForXp(1940),
    badges: [{ id: 'b1', label: '11 Day Streak', tone: '#8cf26d' }],
    avatarColor: '#70d5d0',
    avatar: defaultAvatarLoadout,
    currency: 410,
    totalWorkouts: 51,
    referralCode: 'GYMXP-ANA',
  },
  {
    id: 'u3',
    username: 'jay.rows',
    displayName: 'Jay Moran',
    bio: 'Pull day specialist.',
    joinedDate: '2024-12-18T00:00:00.000Z',
    xp: 1515,
    streak: 5,
    longestStreak: 12,
    totalPrs: 2,
    rank: getRankForXp(1515),
    badges: [{ id: 'b2', label: 'Row Machine', tone: '#53d2c2' }],
    avatarColor: '#f2c45a',
    avatar: defaultAvatarLoadout,
    currency: 180,
    totalWorkouts: 39,
    referralCode: 'GYMXP-JAY',
  },
  {
    id: 'u4',
    username: 'mika.squat',
    displayName: 'Mika Sol',
    bio: 'Leg day never skipped.',
    joinedDate: '2024-10-21T00:00:00.000Z',
    xp: 2360,
    streak: 9,
    longestStreak: 20,
    totalPrs: 7,
    rank: getRankForXp(2360),
    badges: [{ id: 'b3', label: 'Leg Day Loyalist', tone: '#d17b42' }],
    avatarColor: '#ff6b7d',
    avatar: defaultAvatarLoadout,
    currency: 510,
    totalWorkouts: 63,
    referralCode: 'GYMXP-MIKA',
  },
  {
    id: 'u5',
    username: 'isaac.cardio',
    displayName: 'Isaac Vale',
    bio: 'Hybrid athlete mode.',
    joinedDate: '2025-02-05T00:00:00.000Z',
    xp: 1340,
    streak: 4,
    longestStreak: 8,
    totalPrs: 1,
    rank: getRankForXp(1340),
    badges: [{ id: 'b4', label: 'Hybrid Mode', tone: '#a3b2c2' }],
    avatarColor: '#93a4bf',
    avatar: defaultAvatarLoadout,
    currency: 140,
    totalWorkouts: 34,
    referralCode: 'GYMXP-ISAAC',
  },
  {
    id: 'u6',
    username: 'nova.bulk',
    displayName: 'Nova Clarke',
    bio: 'Leveling up every session.',
    joinedDate: '2025-01-01T00:00:00.000Z',
    xp: 2890,
    streak: 14,
    longestStreak: 22,
    totalPrs: 9,
    rank: getRankForXp(2890),
    badges: [{ id: 'b5', label: 'Quest Clearer', tone: '#8cf26d' }],
    avatarColor: '#8cf26d',
    avatar: defaultAvatarLoadout,
    currency: 620,
    totalWorkouts: 70,
    referralCode: 'GYMXP-NOVA',
  },
];

export const seedFriendships: Friendship[] = [
  { id: 'f1', userId: 'u1', friendId: 'u2', status: 'mutual' },
  { id: 'f2', userId: 'u1', friendId: 'u3', status: 'mutual' },
  { id: 'f3', userId: 'u1', friendId: 'u4', status: 'mutual' },
  { id: 'f4', userId: 'u1', friendId: 'u5', status: 'following' },
];

export const seedRoutines: RoutineTemplate[] = [
  {
    id: 'routine-push',
    name: 'Push Power',
    description: 'Fast chest, shoulder, and triceps session for XP farming.',
    accent: '#f2c45a',
    exerciseIds: [
      exerciseByName.get('Barbell Bench Press')?.id ?? exercises[0].id,
      exerciseByName.get('Dumbbell Incline Press')?.id ?? exercises[1].id,
      exerciseByName.get('Cable Lateral Raise')?.id ?? exercises[2].id,
      exerciseByName.get('Cable Triceps Pressdown')?.id ?? exercises[3].id,
    ],
  },
  {
    id: 'routine-pull',
    name: 'Pull Velocity',
    description: 'Back and biceps focused with strong PR potential.',
    accent: '#53d2c2',
    exerciseIds: [
      exerciseByName.get('Lat Pulldown')?.id ?? exercises[0].id,
      exerciseByName.get('Seated Cable Row')?.id ?? exercises[1].id,
      exerciseByName.get('EZ Bar Curl')?.id ?? exercises[2].id,
      exerciseByName.get('Pull-Up')?.id ?? exercises[3].id,
    ],
  },
  {
    id: 'routine-legs',
    name: 'Leg Day Grind',
    description: 'Progression-heavy lower body template.',
    accent: '#8cf26d',
    exerciseIds: [
      exerciseByName.get('Barbell Back Squat')?.id ?? exercises[0].id,
      exerciseByName.get('Romanian Deadlift')?.id ?? exercises[1].id,
      exerciseByName.get('Bulgarian Split Squat')?.id ?? exercises[2].id,
      exerciseByName.get('Leg Press')?.id ?? exercises[3].id,
    ],
  },
];

export const seedWorkouts: Workout[] = [
  createWorkout('workout-1', 'Push Power', 0, [
    { name: 'Barbell Bench Press', sets: [[8, 90], [8, 92.5], [6, 95]] },
    { name: 'Dumbbell Incline Press', sets: [[10, 30], [10, 30], [8, 32.5]] },
    { name: 'Cable Lateral Raise', sets: [[15, 10], [15, 10], [12, 12.5]] },
  ]),
  createWorkout('workout-2', 'Leg Day Grind', 2, [
    { name: 'Barbell Back Squat', sets: [[6, 140], [6, 145], [5, 145]] },
    { name: 'Romanian Deadlift', sets: [[8, 110], [8, 110], [8, 115]] },
    { name: 'Leg Press', sets: [[12, 220], [12, 220], [10, 240]] },
  ]),
  createWorkout('workout-3', 'Pull Velocity', 4, [
    { name: 'Lat Pulldown', sets: [[10, 70], [10, 75], [8, 75]] },
    { name: 'Seated Cable Row', sets: [[12, 60], [12, 65], [10, 65]] },
    { name: 'EZ Bar Curl', sets: [[12, 30], [10, 35], [10, 35]] },
  ]),
  createWorkout('workout-4', 'Full Upper Recharge', 6, [
    { name: 'Standing Overhead Press', sets: [[8, 45], [8, 50], [6, 50]] },
    { name: 'Pull-Up', sets: [[10, 0], [9, 0], [8, 0]] },
    { name: 'Cable Triceps Pressdown', sets: [[15, 25], [15, 27.5], [12, 27.5]] },
  ]),
];

export const seedProgress: ProgressSnapshot[] = seedWorkouts.map((workout, index) => ({
  id: `progress-${index + 1}`,
  userId: 'u1',
  date: workout.endedAt,
  totalVolume: workout.totalVolume,
  workoutCount: 1,
  strengthScore: Math.round(workout.totalVolume / Math.max(1, workout.totalSets)),
  bodyweight: 79.4 - index * 0.2,
  prs: workout.prHighlights.length,
}));

export const seedQuests = ensureQuestState().map((quest) => {
  if (quest.id === 'daily-1') {
    return { ...quest, progress: 0, completed: false };
  }

  if (quest.id === 'weekly-1') {
    return { ...quest, progress: 3, completed: false };
  }

  if (quest.id === 'weekly-2') {
    return { ...quest, progress: 1, completed: false };
  }

  return quest;
});

export const seedRewards = rewardCatalog.map((reward) => ({ ...reward }));
export const seedCosmetics = cosmeticCatalog.map((cosmetic) => ({
  ...cosmetic,
  unlocked:
    cosmetic.unlockSource === 'starter' ||
    (typeof cosmetic.prThreshold === 'number' && cosmetic.prThreshold <= seedCurrentUser.totalPrs),
}));

const friendPosts: Post[] = [
  {
    id: 'post-1',
    authorId: 'u2',
    createdAt: dateDaysAgo(0, 12),
    type: 'pr',
    title: 'Incline Press PR',
    content: 'Ana hit a smooth 32.5 kg dumbbell incline press and cleared a weekly PR quest.',
    chips: ['+180 XP', 'PR', 'Quest Clear'],
    likeUserIds: ['u1', 'u3'],
    commentIds: ['comment-1'],
  },
  {
    id: 'post-2',
    authorId: 'u4',
    createdAt: dateDaysAgo(1, 20),
    type: 'streak',
    title: '9 Day Streak',
    content: 'Mika is still alive in the streak race and moved into Gold pace.',
    chips: ['9 day streak', 'Gold pace'],
    likeUserIds: ['u2'],
    commentIds: ['comment-2'],
  },
];

const workoutPosts = seedWorkouts.slice(0, 2).map((workout, index) => ({
  id: `workout-post-${index + 1}`,
  authorId: 'u1',
  createdAt: workout.endedAt,
  type: workout.prHighlights.length > 0 ? 'pr' : 'workout',
  title: workout.title,
  content: `Closed ${workout.title} with ${workout.totalSets} sets and ${workout.totalVolume} kg total volume.`,
  chips: [`+${workout.xpAwarded} XP`, `${workout.totalSets} sets`, `${workout.totalVolume} kg`],
  likeUserIds: ['u2'],
  commentIds: [],
})) as Post[];

export const seedPosts: Post[] = [...workoutPosts, ...friendPosts].sort((left, right) =>
  right.createdAt.localeCompare(left.createdAt)
);

export const seedComments: PostComment[] = [
  {
    id: 'comment-1',
    postId: 'post-1',
    authorId: 'u1',
    createdAt: dateDaysAgo(0, 13),
    content: 'That incline press looked clean. Nice work.',
  },
  {
    id: 'comment-2',
    postId: 'post-2',
    authorId: 'u3',
    createdAt: dateDaysAgo(1, 21),
    content: 'No chance I am letting you win the streak battle.',
  },
];

export const seedYearlySummary = buildYearlySummary(seedCurrentUser, seedWorkouts);

export const seedDatabase = {
  exercises,
  users: seedUsers,
  currentUser: seedCurrentUser,
  friendships: seedFriendships,
  routines: seedRoutines,
  workouts: seedWorkouts,
  progress: seedProgress,
  quests: seedQuests,
  rewards: seedRewards,
  cosmetics: seedCosmetics,
  posts: seedPosts,
  comments: seedComments,
  yearlySummary: seedYearlySummary,
  totalExerciseCount: exercises.length,
};
