import { User } from '@supabase/supabase-js';

import { buildYearlySummary } from '../summaryEngine';
import { AppDataSnapshot, AuthInput, Badge, CosmeticItem, Post, PostComment, ProgressSnapshot, Quest, RewardItem, RoutineTemplate, UserProfile, Workout } from '../../types/models';
import { supabase } from './supabase';

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  return supabase;
}

type MutationResult = PromiseLike<{ error: unknown | null }>;

async function runMutation(statement: MutationResult) {
  const result = await statement;

  if (result.error) {
    throw result.error;
  }
}

function toUserProfile(profile: Record<string, unknown>, badges: Badge[]): UserProfile {
  return {
    id: String(profile.id),
    email: typeof profile.email === 'string' ? profile.email : undefined,
    username: String(profile.username),
    displayName: String(profile.display_name),
    photoUrl: typeof profile.photo_url === 'string' ? profile.photo_url : undefined,
    bio: String(profile.bio ?? ''),
    joinedDate: String(profile.joined_date),
    xp: Number(profile.xp ?? 0),
    streak: Number(profile.streak ?? 0),
    longestStreak: Number(profile.longest_streak ?? 0),
    totalPrs: Number(profile.total_prs ?? 0),
    rank: profile.rank as UserProfile['rank'],
    badges,
    avatarColor: String(profile.avatar_color ?? '#d4ff36'),
    avatar: (profile.avatar ?? {
      frameId: 'frame-iron',
      faceId: 'face-focus',
      topId: 'top-midnight',
      auraId: 'aura-none',
    }) as UserProfile['avatar'],
    currency: Number(profile.currency ?? 0),
    totalWorkouts: Number(profile.total_workouts ?? 0),
    referralCode: String(profile.referral_code ?? 'GYMXP'),
  };
}

export async function restoreRemoteSession() {
  const client = requireSupabase();
  const { data, error } = await client.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session?.user ?? null;
}

export async function signInRemote(email: string, password: string) {
  const client = requireSupabase();
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data.user;
}

export async function signUpRemote(email: string, password: string) {
  const client = requireSupabase();
  const { data, error } = await client.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  if (!data.user) {
    throw new Error('Sign up did not return a user.');
  }

  return data.user;
}

export async function signOutRemote() {
  const client = requireSupabase();
  const { error } = await client.auth.signOut();

  if (error) {
    throw error;
  }
}

export async function loadRemoteSnapshot(user: User): Promise<AppDataSnapshot | null> {
  const client = requireSupabase();

  const [
    profileResult,
    badgeResult,
    routineResult,
    workoutResult,
    workoutExerciseResult,
    workoutSetResult,
    progressResult,
    questResult,
    rewardResult,
    cosmeticResult,
    friendshipResult,
    postResult,
    commentResult,
  ] = await Promise.all([
    client.from('profiles').select('*').eq('id', user.id).maybeSingle(),
    client.from('user_badges').select('*').eq('user_id', user.id),
    client.from('routines').select('*').eq('user_id', user.id),
    client.from('workouts').select('*').eq('user_id', user.id).order('ended_at', { ascending: false }),
    client.from('workout_exercises').select('*').eq('user_id', user.id),
    client.from('workout_sets').select('*').eq('user_id', user.id),
    client.from('progress_snapshots').select('*').eq('user_id', user.id).order('date', { ascending: false }),
    client.from('user_quests').select('*').eq('user_id', user.id),
    client.from('user_rewards').select('*').eq('user_id', user.id),
    client.from('user_cosmetics').select('*').eq('user_id', user.id),
    client.from('friendships').select('*').eq('user_id', user.id),
    client.from('posts').select('*').eq('author_id', user.id).order('created_at', { ascending: false }),
    client.from('post_comments').select('*').eq('author_id', user.id).order('created_at', { ascending: false }),
  ]);

  if (profileResult.error) {
    throw profileResult.error;
  }

  if (!profileResult.data) {
    return null;
  }

  const badges: Badge[] = (badgeResult.data ?? []).map((badge) => ({
    id: String(badge.badge_id),
    label: String(badge.label),
    tone: String(badge.tone),
  }));

  const currentUser = toUserProfile(
    {
      ...profileResult.data,
      email: user.email ?? profileResult.data.email,
    },
    badges
  );

  const exercisesByWorkoutId = new Map<string, Array<Record<string, unknown>>>();
  (workoutExerciseResult.data ?? []).forEach((exercise) => {
    const workoutId = String(exercise.workout_id);
    const existing = exercisesByWorkoutId.get(workoutId) ?? [];
    existing.push(exercise);
    exercisesByWorkoutId.set(workoutId, existing);
  });

  const setsByExerciseId = new Map<string, Array<Record<string, unknown>>>();
  (workoutSetResult.data ?? []).forEach((set) => {
    const workoutExerciseId = String(set.workout_exercise_id);
    const existing = setsByExerciseId.get(workoutExerciseId) ?? [];
    existing.push(set);
    setsByExerciseId.set(workoutExerciseId, existing);
  });

  const workouts: Workout[] = (workoutResult.data ?? []).map((workout) => ({
    id: String(workout.id),
    userId: String(workout.user_id),
    title: String(workout.title),
    startedAt: String(workout.started_at),
    endedAt: String(workout.ended_at),
    durationMinutes: Number(workout.duration_minutes),
    exercises: (exercisesByWorkoutId.get(String(workout.id)) ?? []).map((exercise) => ({
      id: String(exercise.id),
      exerciseId: String(exercise.exercise_id),
      name: String(exercise.name),
      notes: typeof exercise.notes === 'string' ? exercise.notes : undefined,
      sets: (setsByExerciseId.get(String(exercise.id)) ?? []).map((set) => ({
        id: String(set.id),
        reps: Number(set.reps),
        weight: Number(set.weight),
      })),
    })),
    totalSets: Number(workout.total_sets),
    totalReps: Number(workout.total_reps),
    totalVolume: Number(workout.total_volume),
    xpAwarded: Number(workout.xp_awarded),
    prHighlights: ((workout.pr_highlights ?? []) as string[]) ?? [],
    templateId: typeof workout.template_id === 'string' ? workout.template_id : undefined,
  }));

  const progress: ProgressSnapshot[] = (progressResult.data ?? []).map((snapshot) => ({
    id: String(snapshot.id),
    userId: String(snapshot.user_id),
    date: String(snapshot.date),
    totalVolume: Number(snapshot.total_volume),
    workoutCount: Number(snapshot.workout_count),
    strengthScore: Number(snapshot.strength_score),
    bodyweight:
      snapshot.bodyweight === null || snapshot.bodyweight === undefined
        ? undefined
        : Number(snapshot.bodyweight),
    prs: Number(snapshot.prs),
  }));

  const routines: RoutineTemplate[] = (routineResult.data ?? []).map((routine) => ({
    id: String(routine.id),
    name: String(routine.name),
    description: String(routine.description),
    accent: String(routine.accent),
    exerciseIds: ((routine.exercise_ids ?? []) as string[]) ?? [],
  }));

  const quests: Quest[] = (questResult.data ?? []).map((quest) => ({
    id: String(quest.id),
    title: String(quest.title),
    description: String(quest.description),
    cadence: quest.cadence as Quest['cadence'],
    goalType: quest.goal_type as Quest['goalType'],
    target: Number(quest.target),
    progress: Number(quest.progress),
    xpReward: Number(quest.xp_reward),
    currencyReward: Number(quest.currency_reward),
    iconLabel: String(quest.icon_label),
    completed: Boolean(quest.completed),
    audience: quest.audience as Quest['audience'],
  }));

  const rewards: RewardItem[] = (rewardResult.data ?? []).map((reward) => ({
    id: String(reward.id),
    name: String(reward.name),
    description: String(reward.description),
    kind: reward.kind as RewardItem['kind'],
    rarity: reward.rarity as RewardItem['rarity'],
    cost: Number(reward.cost),
    unlocked: Boolean(reward.unlocked),
  }));

  const cosmetics: CosmeticItem[] = (cosmeticResult.data ?? []).map((cosmetic) => ({
    id: String(cosmetic.id),
    name: String(cosmetic.name),
    slot: cosmetic.slot as CosmeticItem['slot'],
    description: String(cosmetic.description),
    tone: String(cosmetic.tone),
    accentTone: typeof cosmetic.accent_tone === 'string' ? cosmetic.accent_tone : undefined,
    unlockSource: cosmetic.unlock_source as CosmeticItem['unlockSource'],
    prThreshold:
      cosmetic.pr_threshold === null || cosmetic.pr_threshold === undefined
        ? undefined
        : Number(cosmetic.pr_threshold),
    unlocked: Boolean(cosmetic.unlocked),
  }));

  const friendships = (friendshipResult.data ?? []).map((friendship) => ({
    id: String(friendship.id),
    userId: String(friendship.user_id),
    friendId: String(friendship.friend_id),
    status: friendship.status as 'following' | 'mutual',
  }));

  const posts: Post[] = (postResult.data ?? []).map((post) => ({
    id: String(post.id),
    authorId: String(post.author_id),
    createdAt: String(post.created_at),
    type: post.type as Post['type'],
    title: String(post.title),
    content: String(post.content),
    chips: ((post.chips ?? []) as string[]) ?? [],
    likeUserIds: ((post.like_user_ids ?? []) as string[]) ?? [],
    commentIds: ((post.comment_ids ?? []) as string[]) ?? [],
  }));

  const comments: PostComment[] = (commentResult.data ?? []).map((comment) => ({
    id: String(comment.id),
    postId: String(comment.post_id),
    authorId: String(comment.author_id),
    createdAt: String(comment.created_at),
    content: String(comment.content),
  }));

  return {
    currentUser,
    users: [currentUser],
    routines,
    workouts,
    progress,
    quests,
    rewards,
    cosmetics,
    friendships,
    posts,
    comments,
    yearlySummary: buildYearlySummary(currentUser, workouts),
  };
}

export async function saveRemoteSnapshot(snapshot: AppDataSnapshot) {
  const client = requireSupabase();
  const userId = snapshot.currentUser.id;
  const ownPosts = snapshot.posts.filter((post) => post.authorId === userId);
  const ownComments = snapshot.comments.filter((comment) => comment.authorId === userId);

  const ownFriendships = snapshot.friendships.filter((friendship) => friendship.userId === userId);

  const badgeRows = snapshot.currentUser.badges.map((badge) => ({
    user_id: userId,
    badge_id: badge.id,
    label: badge.label,
    tone: badge.tone,
  }));
  const routineRows = snapshot.routines.map((routine) => ({
    id: routine.id,
    user_id: userId,
    name: routine.name,
    description: routine.description,
    accent: routine.accent,
    exercise_ids: routine.exerciseIds,
  }));
  const workoutRows = snapshot.workouts.map((workout) => ({
    id: workout.id,
    user_id: userId,
    title: workout.title,
    started_at: workout.startedAt,
    ended_at: workout.endedAt,
    duration_minutes: workout.durationMinutes,
    total_sets: workout.totalSets,
    total_reps: workout.totalReps,
    total_volume: workout.totalVolume,
    xp_awarded: workout.xpAwarded,
    pr_highlights: workout.prHighlights,
    template_id: workout.templateId ?? null,
  }));
  const workoutExerciseRows = snapshot.workouts.flatMap((workout) =>
    workout.exercises.map((exercise) => ({
      id: exercise.id,
      user_id: userId,
      workout_id: workout.id,
      exercise_id: exercise.exerciseId,
      name: exercise.name,
      notes: exercise.notes ?? null,
    }))
  );
  const workoutSetRows = snapshot.workouts.flatMap((workout) =>
    workout.exercises.flatMap((exercise) =>
      exercise.sets.map((set) => ({
        id: set.id,
        user_id: userId,
        workout_exercise_id: exercise.id,
        reps: set.reps,
        weight: set.weight,
      }))
    )
  );
  const progressRows = snapshot.progress.map((progress) => ({
    id: progress.id,
    user_id: userId,
    date: progress.date,
    total_volume: progress.totalVolume,
    workout_count: progress.workoutCount,
    strength_score: progress.strengthScore,
    bodyweight: progress.bodyweight ?? null,
    prs: progress.prs,
  }));
  const questRows = snapshot.quests.map((quest) => ({
    id: quest.id,
    user_id: userId,
    title: quest.title,
    description: quest.description,
    cadence: quest.cadence,
    goal_type: quest.goalType,
    target: quest.target,
    progress: quest.progress,
    xp_reward: quest.xpReward,
    currency_reward: quest.currencyReward,
    icon_label: quest.iconLabel,
    completed: quest.completed,
    audience: quest.audience,
  }));
  const rewardRows = snapshot.rewards.map((reward) => ({
    id: reward.id,
    user_id: userId,
    name: reward.name,
    description: reward.description,
    kind: reward.kind,
    rarity: reward.rarity,
    cost: reward.cost,
    unlocked: reward.unlocked,
  }));
  const cosmeticRows = snapshot.cosmetics.map((cosmetic) => ({
    id: cosmetic.id,
    user_id: userId,
    name: cosmetic.name,
    slot: cosmetic.slot,
    description: cosmetic.description,
    tone: cosmetic.tone,
    accent_tone: cosmetic.accentTone ?? null,
    unlock_source: cosmetic.unlockSource,
    pr_threshold: cosmetic.prThreshold ?? null,
    unlocked: cosmetic.unlocked,
  }));
  const friendshipRows = ownFriendships.map((friendship) => ({
    id: friendship.id,
    user_id: friendship.userId,
    friend_id: friendship.friendId,
    status: friendship.status,
  }));
  const postRows = ownPosts.map((post) => ({
    id: post.id,
    author_id: post.authorId,
    created_at: post.createdAt,
    type: post.type,
    title: post.title,
    content: post.content,
    chips: post.chips,
    like_user_ids: post.likeUserIds,
    comment_ids: post.commentIds,
  }));
  const commentRows = ownComments.map((comment) => ({
    id: comment.id,
    post_id: comment.postId,
    author_id: comment.authorId,
    created_at: comment.createdAt,
    content: comment.content,
  }));

  const profileRow = {
    id: userId,
    email: snapshot.currentUser.email ?? null,
    username: snapshot.currentUser.username,
    display_name: snapshot.currentUser.displayName,
    photo_url: snapshot.currentUser.photoUrl ?? null,
    bio: snapshot.currentUser.bio,
    joined_date: snapshot.currentUser.joinedDate,
    xp: snapshot.currentUser.xp,
    streak: snapshot.currentUser.streak,
    longest_streak: snapshot.currentUser.longestStreak,
    total_prs: snapshot.currentUser.totalPrs,
    rank: snapshot.currentUser.rank,
    avatar_color: snapshot.currentUser.avatarColor,
    avatar: snapshot.currentUser.avatar,
    currency: snapshot.currentUser.currency,
    total_workouts: snapshot.currentUser.totalWorkouts,
    referral_code: snapshot.currentUser.referralCode,
  };

  const statements: MutationResult[] = [
    client.from('profiles').upsert(profileRow),
    client.from('user_badges').delete().eq('user_id', userId),
    client.from('routines').delete().eq('user_id', userId),
    client.from('progress_snapshots').delete().eq('user_id', userId),
    client.from('user_quests').delete().eq('user_id', userId),
    client.from('user_rewards').delete().eq('user_id', userId),
    client.from('user_cosmetics').delete().eq('user_id', userId),
    client.from('friendships').delete().eq('user_id', userId),
    client.from('post_comments').delete().eq('author_id', userId),
    client.from('posts').delete().eq('author_id', userId),
    client.from('workouts').delete().eq('user_id', userId),
  ];

  await Promise.all(statements.map((statement) => runMutation(statement)));

  if (badgeRows.length > 0) {
    await runMutation(client.from('user_badges').insert(badgeRows));
  }

  if (routineRows.length > 0) {
    await runMutation(client.from('routines').insert(routineRows));
  }

  if (workoutRows.length > 0) {
    await runMutation(client.from('workouts').insert(workoutRows));
  }

  if (workoutExerciseRows.length > 0) {
    await runMutation(client.from('workout_exercises').insert(workoutExerciseRows));
  }

  if (workoutSetRows.length > 0) {
    await runMutation(client.from('workout_sets').insert(workoutSetRows));
  }

  if (progressRows.length > 0) {
    await runMutation(client.from('progress_snapshots').insert(progressRows));
  }

  if (questRows.length > 0) {
    await runMutation(client.from('user_quests').insert(questRows));
  }

  if (rewardRows.length > 0) {
    await runMutation(client.from('user_rewards').insert(rewardRows));
  }

  if (cosmeticRows.length > 0) {
    await runMutation(client.from('user_cosmetics').insert(cosmeticRows));
  }

  if (friendshipRows.length > 0) {
    await runMutation(client.from('friendships').insert(friendshipRows));
  }

  if (postRows.length > 0) {
    await runMutation(client.from('posts').insert(postRows));
  }

  if (commentRows.length > 0) {
    await runMutation(client.from('post_comments').insert(commentRows));
  }
}
