import { cosmeticCatalog, defaultAvatarLoadout } from '../../config/cosmetics';
import { baseQuestTemplates, rewardCatalog } from '../../config/game';
import { seedComments, seedPosts, seedRoutines, seedUsers } from '../../data/mock';
import { getRankForXp } from '../gameEngine';
import { buildYearlySummary } from '../summaryEngine';
import { AppDataSnapshot, AuthInput, UserProfile } from '../../types/models';

function buildAvatarColor(seed: string) {
  const palette = ['#d4ff36', '#53d2c2', '#d08c2e', '#ff7b74', '#a3b2c2'];
  const hash = seed.split('').reduce((total, char) => total + char.charCodeAt(0), 0);
  return palette[hash % palette.length];
}

function buildReferralCode(username: string) {
  return `GYMXP-${username.replace(/[^a-z0-9]/gi, '').slice(0, 8).toUpperCase()}`;
}

export function createFreshUserProfile(userId: string, input: AuthInput): UserProfile {
  const username = input.username.trim() || input.email.split('@')[0] || 'gymxp-user';
  const displayName = input.displayName.trim() || username;
  return {
    id: userId,
    email: input.email.trim(),
    username,
    displayName,
    bio: input.bio.trim() || 'Ready to turn training into momentum.',
    joinedDate: new Date().toISOString(),
    xp: 0,
    streak: 0,
    longestStreak: 0,
    totalPrs: 0,
    rank: getRankForXp(0),
    badges: [],
    avatarColor: buildAvatarColor(username),
    avatar: defaultAvatarLoadout,
    currency: 100,
    totalWorkouts: 0,
    referralCode: buildReferralCode(username),
  };
}

export function createFreshUserSnapshot(currentUser: UserProfile): AppDataSnapshot {
  const users = [
    currentUser,
    ...seedUsers.filter((user) => user.id !== 'u1' && user.id !== currentUser.id),
  ];
  const quests = baseQuestTemplates.map((quest) => ({
    ...quest,
    progress: quest.audience === 'community' ? quest.progress : 0,
    completed: false,
  }));
  const rewards = rewardCatalog.map((reward) => ({ ...reward }));
  const cosmetics = cosmeticCatalog.map((cosmetic) => ({
    ...cosmetic,
    unlocked: cosmetic.unlockSource === 'starter',
  }));

  return {
    currentUser,
    users,
    routines: seedRoutines.map((routine) => ({ ...routine })),
    workouts: [],
    progress: [],
    quests,
    rewards,
    cosmetics,
    friendships: [],
    posts: seedPosts
      .filter((post) => post.authorId !== 'u1')
      .map((post) => ({ ...post, chips: [...post.chips], likeUserIds: [...post.likeUserIds], commentIds: [...post.commentIds] })),
    comments: seedComments.map((comment) => ({ ...comment })),
    yearlySummary: buildYearlySummary(currentUser, []),
  };
}

export function createPersonalizedDemoSnapshot(input: AuthInput, base: AppDataSnapshot): AppDataSnapshot {
  const currentUser: UserProfile = {
    ...base.currentUser,
    email: input.email.trim(),
    username: input.username.trim() || base.currentUser.username,
    displayName: input.displayName.trim() || base.currentUser.displayName,
    bio: input.bio.trim() || base.currentUser.bio,
    avatarColor: buildAvatarColor(input.username.trim() || base.currentUser.username),
    referralCode: buildReferralCode(input.username.trim() || base.currentUser.username),
  };

  return {
    ...base,
    currentUser,
    users: [
      currentUser,
      ...base.users.filter((user) => user.id !== base.currentUser.id && user.id !== currentUser.id),
    ],
    yearlySummary: buildYearlySummary(currentUser, base.workouts),
  };
}

export function mergeRemoteSnapshotWithDemo(snapshot: AppDataSnapshot): AppDataSnapshot {
  const demoUsers = seedUsers.filter(
    (user) => user.id !== 'u1' && user.id !== snapshot.currentUser.id
  );
  const demoPosts = seedPosts.filter((post) => post.authorId !== 'u1');
  const demoComments = seedComments;

  return {
    ...snapshot,
    users: [snapshot.currentUser, ...demoUsers],
    posts: [...snapshot.posts, ...demoPosts].sort((left, right) =>
      right.createdAt.localeCompare(left.createdAt)
    ),
    comments: [...snapshot.comments, ...demoComments].sort((left, right) =>
      right.createdAt.localeCompare(left.createdAt)
    ),
  };
}
