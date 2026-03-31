import { Exercise } from '../types/models';
import { toId } from '../utils/format';

const featuredExercises: Array<Omit<Exercise, 'id'>> = [
  {
    name: 'Barbell Back Squat',
    category: 'legs',
    primaryMuscles: ['quads', 'glutes'],
    equipment: 'Barbell',
    difficulty: 'intermediate',
    aliases: ['Squat'],
  },
  {
    name: 'Barbell Bench Press',
    category: 'push',
    primaryMuscles: ['chest', 'triceps'],
    equipment: 'Barbell',
    difficulty: 'intermediate',
    aliases: ['Bench Press'],
  },
  {
    name: 'Conventional Deadlift',
    category: 'pull',
    primaryMuscles: ['back', 'hamstrings'],
    equipment: 'Barbell',
    difficulty: 'advanced',
    aliases: ['Deadlift'],
  },
  {
    name: 'Standing Overhead Press',
    category: 'push',
    primaryMuscles: ['shoulders', 'triceps'],
    equipment: 'Barbell',
    difficulty: 'intermediate',
    aliases: ['OHP'],
  },
  {
    name: 'Pull-Up',
    category: 'pull',
    primaryMuscles: ['back', 'biceps'],
    equipment: 'Bodyweight',
    difficulty: 'intermediate',
    aliases: ['Chin-Up'],
  },
  {
    name: 'Romanian Deadlift',
    category: 'legs',
    primaryMuscles: ['hamstrings', 'glutes'],
    equipment: 'Barbell',
    difficulty: 'intermediate',
    aliases: ['RDL'],
  },
  {
    name: 'Walking Lunge',
    category: 'legs',
    primaryMuscles: ['quads', 'glutes'],
    equipment: 'Dumbbell',
    difficulty: 'beginner',
    aliases: ['Lunge'],
  },
  {
    name: 'Lat Pulldown',
    category: 'pull',
    primaryMuscles: ['back', 'biceps'],
    equipment: 'Cable',
    difficulty: 'beginner',
    aliases: ['Pulldown'],
  },
  {
    name: 'Seated Cable Row',
    category: 'pull',
    primaryMuscles: ['back', 'biceps'],
    equipment: 'Cable',
    difficulty: 'beginner',
    aliases: ['Cable Row'],
  },
  {
    name: 'Leg Press',
    category: 'legs',
    primaryMuscles: ['quads', 'glutes'],
    equipment: 'Machine',
    difficulty: 'beginner',
    aliases: ['Press'],
  },
  {
    name: 'Leg Curl',
    category: 'legs',
    primaryMuscles: ['hamstrings'],
    equipment: 'Machine',
    difficulty: 'beginner',
    aliases: ['Ham Curl'],
  },
  {
    name: 'Cable Lateral Raise',
    category: 'push',
    primaryMuscles: ['shoulders'],
    equipment: 'Cable',
    difficulty: 'beginner',
    aliases: ['Lateral Raise'],
  },
  {
    name: 'Dumbbell Incline Press',
    category: 'push',
    primaryMuscles: ['chest', 'shoulders'],
    equipment: 'Dumbbell',
    difficulty: 'beginner',
    aliases: ['Incline Press'],
  },
  {
    name: 'Bulgarian Split Squat',
    category: 'legs',
    primaryMuscles: ['quads', 'glutes'],
    equipment: 'Dumbbell',
    difficulty: 'intermediate',
    aliases: ['Split Squat'],
  },
  {
    name: 'Hip Thrust',
    category: 'legs',
    primaryMuscles: ['glutes', 'hamstrings'],
    equipment: 'Barbell',
    difficulty: 'beginner',
    aliases: ['Glute Bridge'],
  },
  {
    name: 'Cable Triceps Pressdown',
    category: 'push',
    primaryMuscles: ['triceps'],
    equipment: 'Cable',
    difficulty: 'beginner',
    aliases: ['Pressdown'],
  },
  {
    name: 'EZ Bar Curl',
    category: 'pull',
    primaryMuscles: ['biceps'],
    equipment: 'Barbell',
    difficulty: 'beginner',
    aliases: ['Biceps Curl'],
  },
  {
    name: 'Hanging Knee Raise',
    category: 'core',
    primaryMuscles: ['core'],
    equipment: 'Bodyweight',
    difficulty: 'beginner',
    aliases: ['Knee Raise'],
  },
];

const blueprints = [
  {
    movement: 'Chest Press',
    category: 'push',
    muscles: ['chest', 'triceps'],
    equipment: ['Barbell', 'Dumbbell', 'Cable', 'Machine', 'Smith Machine'],
    variants: ['Flat', 'Incline', 'Decline', 'Close-Grip', 'Paused'],
  },
  {
    movement: 'Shoulder Press',
    category: 'push',
    muscles: ['shoulders', 'triceps'],
    equipment: ['Barbell', 'Dumbbell', 'Machine', 'Cable', 'Smith Machine'],
    variants: ['Standing', 'Seated', 'Arnold', 'Neutral-Grip', 'Single-Arm'],
  },
  {
    movement: 'Fly',
    category: 'push',
    muscles: ['chest'],
    equipment: ['Cable', 'Machine', 'Dumbbell', 'Resistance Band', 'Pec Deck'],
    variants: ['Flat', 'Incline', 'Low-To-High', 'High-To-Low', 'Single-Arm'],
  },
  {
    movement: 'Lateral Raise',
    category: 'push',
    muscles: ['shoulders'],
    equipment: ['Cable', 'Dumbbell', 'Machine', 'Resistance Band', 'Plate'],
    variants: ['Standing', 'Seated', 'Leaning', 'Single-Arm', 'Behind-The-Back'],
  },
  {
    movement: 'Triceps Extension',
    category: 'push',
    muscles: ['triceps'],
    equipment: ['Cable', 'Dumbbell', 'Machine', 'Barbell', 'Resistance Band'],
    variants: ['Overhead', 'Standing', 'Seated', 'Single-Arm', 'Rope'],
  },
  {
    movement: 'Row',
    category: 'pull',
    muscles: ['back', 'biceps'],
    equipment: ['Barbell', 'Dumbbell', 'Cable', 'Machine', 'Chest-Supported'],
    variants: ['Bent-Over', 'Seated', 'Single-Arm', 'Wide-Grip', 'Neutral-Grip'],
  },
  {
    movement: 'Pulldown',
    category: 'pull',
    muscles: ['back', 'biceps'],
    equipment: ['Cable', 'Machine', 'Resistance Band', 'Assisted', 'Multi-Grip'],
    variants: ['Wide-Grip', 'Close-Grip', 'Neutral-Grip', 'Single-Arm', 'Underhand'],
  },
  {
    movement: 'Biceps Curl',
    category: 'pull',
    muscles: ['biceps'],
    equipment: ['Barbell', 'Dumbbell', 'Cable', 'Machine', 'EZ Bar'],
    variants: ['Standing', 'Seated', 'Incline', 'Preacher', 'Hammer'],
  },
  {
    movement: 'Face Pull',
    category: 'pull',
    muscles: ['rear delts', 'upper back'],
    equipment: ['Cable', 'Resistance Band', 'Machine', 'Dual Cable', 'Rope'],
    variants: ['Standing', 'Half-Kneeling', 'Wide', 'External Rotation', 'Single-Arm'],
  },
  {
    movement: 'Back Squat',
    category: 'legs',
    muscles: ['quads', 'glutes'],
    equipment: ['Barbell', 'Dumbbell', 'Machine', 'Smith Machine', 'Safety Bar'],
    variants: ['High-Bar', 'Low-Bar', 'Paused', 'Tempo', 'Box'],
  },
  {
    movement: 'Front Squat',
    category: 'legs',
    muscles: ['quads', 'core'],
    equipment: ['Barbell', 'Dumbbell', 'Kettlebell', 'Smith Machine', 'Safety Bar'],
    variants: ['Clean Grip', 'Cross-Arm', 'Paused', 'Tempo', 'Goblet'],
  },
  {
    movement: 'Lunge',
    category: 'legs',
    muscles: ['quads', 'glutes'],
    equipment: ['Dumbbell', 'Barbell', 'Smith Machine', 'Cable', 'Bodyweight'],
    variants: ['Walking', 'Reverse', 'Forward', 'Deficit', 'Alternating'],
  },
  {
    movement: 'Split Squat',
    category: 'legs',
    muscles: ['quads', 'glutes'],
    equipment: ['Dumbbell', 'Barbell', 'Smith Machine', 'Cable', 'Bodyweight'],
    variants: ['Bulgarian', 'Front-Foot Elevated', 'Rear-Foot Elevated', 'Goblet', 'Tempo'],
  },
  {
    movement: 'Hip Hinge',
    category: 'legs',
    muscles: ['hamstrings', 'glutes'],
    equipment: ['Barbell', 'Dumbbell', 'Cable', 'Kettlebell', 'Smith Machine'],
    variants: ['Romanian', 'Stiff-Leg', 'Single-Leg', 'Snatch-Grip', 'Deficit'],
  },
  {
    movement: 'Leg Curl',
    category: 'legs',
    muscles: ['hamstrings'],
    equipment: ['Machine', 'Cable', 'Resistance Band', 'Swiss Ball', 'Slider'],
    variants: ['Seated', 'Lying', 'Standing', 'Single-Leg', 'Tempo'],
  },
  {
    movement: 'Calf Raise',
    category: 'legs',
    muscles: ['calves'],
    equipment: ['Machine', 'Dumbbell', 'Smith Machine', 'Leg Press', 'Bodyweight'],
    variants: ['Standing', 'Seated', 'Single-Leg', 'Donkey', 'Paused'],
  },
  {
    movement: 'Crunch',
    category: 'core',
    muscles: ['core'],
    equipment: ['Bodyweight', 'Cable', 'Machine', 'Medicine Ball', 'Bench'],
    variants: ['Reverse', 'Weighted', 'Decline', 'Bicycle', 'Tempo'],
  },
  {
    movement: 'Plank',
    category: 'core',
    muscles: ['core'],
    equipment: ['Bodyweight', 'Resistance Band', 'TRX', 'Plate', 'Stability Ball'],
    variants: ['Front', 'Side', 'Weighted', 'Reach', 'Saw'],
  },
];

function buildGeneratedExercises(): Exercise[] {
  const generated: Exercise[] = [];
  const seen = new Set<string>();

  blueprints.forEach((blueprint) => {
    blueprint.equipment.forEach((equipment) => {
      blueprint.variants.forEach((variant) => {
        const name = `${equipment} ${variant} ${blueprint.movement}`;
        if (seen.has(name)) {
          return;
        }

        seen.add(name);
        generated.push({
          id: toId(name),
          name,
          category: blueprint.category,
          primaryMuscles: blueprint.muscles,
          equipment,
          difficulty:
            equipment === 'Bodyweight' || equipment === 'Machine' ? 'beginner' : 'intermediate',
          aliases: [variant, blueprint.movement],
        });
      });
    });
  });

  return generated;
}

export function buildExerciseDatabase(): Exercise[] {
  const mappedFeatured = featuredExercises.map((exercise) => ({
    ...exercise,
    id: toId(exercise.name),
  }));

  return [...mappedFeatured, ...buildGeneratedExercises()];
}
