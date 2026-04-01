export type RankTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Elite';
export type QuestCadence = 'daily' | 'weekly';
export type QuestGoalType = 'workouts' | 'volume' | 'consistency' | 'prs' | 'social';
export type RewardKind = 'badge' | 'theme' | 'plan' | 'boost';
export type RewardRarity = 'common' | 'rare' | 'epic';
export type PostType = 'workout' | 'pr' | 'streak' | 'summary';
export type LeaderboardScope = 'friends' | 'global';
export type CosmeticSlot = 'frame' | 'face' | 'top' | 'aura';
export type CosmeticUnlockSource = 'starter' | 'pr_milestone';
export type AuthMode = 'signup' | 'login';
export type ScreenKey =
  | 'home'
  | 'workout'
  | 'summary'
  | 'progress'
  | 'leaderboard'
  | 'feed'
  | 'quests'
  | 'profile'
  | 'wrapped';

export interface Badge {
  id: string;
  label: string;
  tone: string;
}

export interface AvatarLoadout {
  frameId: string;
  faceId: string;
  topId: string;
  auraId: string;
}

export interface CosmeticItem {
  id: string;
  name: string;
  slot: CosmeticSlot;
  description: string;
  tone: string;
  accentTone?: string;
  unlockSource: CosmeticUnlockSource;
  prThreshold?: number;
  unlocked: boolean;
}

export interface UserProfile {
  id: string;
  email?: string;
  username: string;
  displayName: string;
  photoUrl?: string;
  bio: string;
  joinedDate: string;
  xp: number;
  streak: number;
  longestStreak: number;
  totalPrs: number;
  rank: RankTier;
  badges: Badge[];
  avatarColor: string;
  avatar: AvatarLoadout;
  currency: number;
  totalWorkouts: number;
  referralCode: string;
}

export interface Exercise {
  id: string;
  name: string;
  category: string;
  primaryMuscles: string[];
  equipment: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  aliases: string[];
}

export interface WorkoutDraftSet {
  id: string;
  reps: string;
  weight: string;
}

export interface WorkoutDraftExercise {
  exerciseId: string;
  name: string;
  sets: WorkoutDraftSet[];
  notes: string;
}

export interface WorkoutDraft {
  id: string;
  title: string;
  startedAt: string;
  routineId?: string;
  exercises: WorkoutDraftExercise[];
}

export interface WorkoutSet {
  id: string;
  reps: number;
  weight: number;
}

export interface LoggedExercise {
  id: string;
  exerciseId: string;
  name: string;
  sets: WorkoutSet[];
  notes?: string;
}

export interface Workout {
  id: string;
  userId: string;
  title: string;
  startedAt: string;
  endedAt: string;
  durationMinutes: number;
  exercises: LoggedExercise[];
  totalSets: number;
  totalReps: number;
  totalVolume: number;
  xpAwarded: number;
  prHighlights: string[];
  templateId?: string;
}

export interface RoutineTemplate {
  id: string;
  name: string;
  description: string;
  accent: string;
  exerciseIds: string[];
}

export interface ProgressSnapshot {
  id: string;
  userId: string;
  date: string;
  totalVolume: number;
  workoutCount: number;
  strengthScore: number;
  bodyweight?: number;
  prs: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  cadence: QuestCadence;
  goalType: QuestGoalType;
  target: number;
  progress: number;
  xpReward: number;
  currencyReward: number;
  iconLabel: string;
  completed: boolean;
  audience: 'solo' | 'community';
}

export interface RewardItem {
  id: string;
  name: string;
  description: string;
  kind: RewardKind;
  rarity: RewardRarity;
  cost: number;
  unlocked: boolean;
}

export interface Friendship {
  id: string;
  userId: string;
  friendId: string;
  status: 'following' | 'mutual';
}

export interface Post {
  id: string;
  authorId: string;
  createdAt: string;
  type: PostType;
  title: string;
  content: string;
  chips: string[];
  likeUserIds: string[];
  commentIds: string[];
}

export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  createdAt: string;
  content: string;
}

export interface RankProgressionStop {
  rank: RankTier;
  date: string;
}

export interface YearlySummary {
  year: number;
  totalWorkouts: number;
  totalVolume: number;
  favoriteExercises: string[];
  streakRecord: number;
  prHighlights: string[];
  xpEarned: number;
  rankProgression: RankProgressionStop[];
}

export interface RankConfigItem {
  tier: RankTier;
  minXp: number;
  color: string;
  description: string;
}

export interface XpRules {
  baseWorkoutXp: number;
  perSetXp: number;
  perExerciseXp: number;
  volumeStepXp: number;
  volumeStepSize: number;
  consistencyMultiplier: number;
  prBonusXp: number;
  streakBonusCap: number;
  socialShareXp: number;
}

export interface WorkoutRewardBreakdown {
  baseXp: number;
  consistencyXp: number;
  prXp: number;
  questXp: number;
  totalXp: number;
  currencyEarned: number;
  streak: number;
  rankBefore: RankTier;
  rankAfter: RankTier;
  rankProgressBefore: number;
  rankProgressAfter: number;
  completedQuestIds: string[];
  discoveredPrs: string[];
  unlockedCosmetics: CosmeticItem[];
}

export interface AuthInput {
  mode: AuthMode;
  email: string;
  password: string;
  username: string;
  displayName: string;
  bio: string;
}

export interface AppDataSnapshot {
  currentUser: UserProfile;
  users: UserProfile[];
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
}
