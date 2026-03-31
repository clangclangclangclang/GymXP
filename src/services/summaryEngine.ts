import { RankProgressionStop, UserProfile, Workout, YearlySummary } from '../types/models';

function getFavoriteExercises(workouts: Workout[]): string[] {
  const counts = new Map<string, number>();

  workouts.forEach((workout) => {
    workout.exercises.forEach((exercise) => {
      counts.set(exercise.name, (counts.get(exercise.name) ?? 0) + 1);
    });
  });

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3)
    .map(([name]) => name);
}

function getRankProgression(user: UserProfile): RankProgressionStop[] {
  return [
    { rank: 'Bronze', date: '2025-01-14' },
    { rank: 'Silver', date: '2025-04-08' },
    { rank: user.rank, date: new Date().toISOString() },
  ];
}

export function buildYearlySummary(user: UserProfile, workouts: Workout[]): YearlySummary {
  const currentYear = new Date().getFullYear();
  const yearlyWorkouts = workouts.filter(
    (workout) => new Date(workout.endedAt).getFullYear() === currentYear
  );

  return {
    year: currentYear,
    totalWorkouts: yearlyWorkouts.length,
    totalVolume: yearlyWorkouts.reduce((sum, workout) => sum + workout.totalVolume, 0),
    favoriteExercises: getFavoriteExercises(yearlyWorkouts),
    streakRecord: user.longestStreak,
    prHighlights: yearlyWorkouts.flatMap((workout) => workout.prHighlights).slice(0, 5),
    xpEarned: yearlyWorkouts.reduce((sum, workout) => sum + workout.xpAwarded, 0),
    rankProgression: getRankProgression(user),
  };
}
