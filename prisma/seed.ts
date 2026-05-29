import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ── Exercises ──────────────────────────────────────────────────────
  const exerciseData = [
    {
      name: "Barbell Squat",
      primaryMuscle: "legs" as const,
      secondaryMuscles: ["core"] as string[],
      equipment: "barbell" as const,
      description:
        "A compound lower-body exercise that targets the quadriceps, hamstrings, and glutes.",
      instructions:
        "1. Set a barbell on a squat rack at upper-chest height.\n2. Step under the bar, place it on your upper back, and unrack.\n3. Step back, feet shoulder-width apart, toes slightly out.\n4. Brace your core, bend knees and hips to squat down until thighs are at least parallel.\n5. Drive through your heels to stand back up.",
      isPreset: true,
    },
    {
      name: "Bench Press",
      primaryMuscle: "chest" as const,
      secondaryMuscles: ["shoulders", "arms"] as string[],
      equipment: "barbell" as const,
      description:
        "A classic upper-body press that builds chest, shoulder, and tricep strength.",
      instructions:
        "1. Lie on a flat bench with eyes under the bar.\n2. Grip the bar slightly wider than shoulder-width.\n3. Unrack and lower the bar to your mid-chest with control.\n4. Press the bar back up to full arm extension without locking out elbows.",
    },
    {
      name: "Deadlift",
      primaryMuscle: "back" as const,
      secondaryMuscles: ["legs", "core"] as string[],
      equipment: "barbell" as const,
      description:
        "A full-body hinge movement that heavily targets the posterior chain.",
      instructions:
        "1. Stand with mid-foot under the barbell, feet hip-width apart.\n2. Hinge at hips, bend knees, and grip the bar just outside shins.\n3. Keep back flat, chest up, and pull the slack out of the bar.\n4. Drive through heels, extend hips and knees to stand tall.\n5. Lower the bar by hinging at the hips with control.",
    },
    {
      name: "Overhead Press",
      primaryMuscle: "shoulders" as const,
      secondaryMuscles: ["arms"] as string[],
      equipment: "barbell" as const,
      description:
        "A vertical press that develops shoulder and tricep strength.",
      instructions:
        "1. Set a barbell at upper-chest height on a rack.\n2. Grip slightly wider than shoulders, unrack, and rest the bar on your front delts.\n3. Brace core, press the bar overhead until arms are fully extended.\n4. Lower the bar back to the starting position with control.",
    },
    {
      name: "Barbell Row",
      primaryMuscle: "back" as const,
      secondaryMuscles: ["arms"] as string[],
      equipment: "barbell" as const,
      description:
        "A bent-over pulling movement that targets the lats, rhomboids, and biceps.",
      instructions:
        "1. Stand over a barbell, hinge forward until your torso is roughly parallel to the floor.\n2. Grip the bar slightly wider than shoulder-width.\n3. Pull the bar toward your lower chest/upper abdomen.\n4. Squeeze shoulder blades, then lower the bar with control.",
    },
    {
      name: "Pull-Up",
      primaryMuscle: "back" as const,
      secondaryMuscles: ["arms"] as string[],
      equipment: "bodyweight" as const,
      description:
        "A bodyweight vertical pull that builds back width and arm strength.",
      instructions:
        "1. Hang from a pull-up bar with an overhand grip, hands shoulder-width or wider.\n2. Pull yourself up until your chin clears the bar.\n3. Lower with control to full arm extension.\n4. Avoid excessive swinging or kipping.",
    },
    {
      name: "Dumbbell Curl",
      primaryMuscle: "arms" as const,
      secondaryMuscles: [] as string[],
      equipment: "dumbbell" as const,
      description:
        "An isolation exercise for the biceps.",
      instructions:
        "1. Stand holding a dumbbell in each hand, arms fully extended, palms facing forward.\n2. Curl the dumbbells up toward your shoulders, keeping elbows stationary.\n3. Squeeze biceps at the top, then lower with control.",
    },
    {
      name: "Tricep Pushdown",
      primaryMuscle: "arms" as const,
      secondaryMuscles: [] as string[],
      equipment: "cable" as const,
      description:
        "An isolation exercise that targets the triceps using a cable machine.",
      instructions:
        "1. Attach a straight or rope attachment to the high pulley of a cable station.\n2. Grip the attachment, elbows tucked at your sides.\n3. Push the attachment down until arms are fully extended.\n4. Return slowly to the starting position, keeping elbows pinned.",
    },
    {
      name: "Leg Press",
      primaryMuscle: "legs" as const,
      secondaryMuscles: ["core"] as string[],
      equipment: "machine" as const,
      description:
        "A machine-based compound movement for the quadriceps, hamstrings, and glutes.",
      instructions:
        "1. Sit on the leg press machine and place feet shoulder-width on the platform.\n2. Push the platform away until legs are nearly extended (don't lock knees).\n3. Lower the platform until knees reach roughly a 90-degree angle.\n4. Press back to the starting position.",
    },
    {
      name: "Romanian Deadlift",
      primaryMuscle: "legs" as const,
      secondaryMuscles: ["back"] as string[],
      equipment: "barbell" as const,
      description:
        "A hip-hinge movement emphasizing hamstring and glute engagement.",
      instructions:
        "1. Stand holding a barbell at hip height with an overhand grip.\n2. Soften knees slightly, keep back flat, and hinge at the hips.\n3. Lower the bar along your shins until you feel a hamstring stretch.\n4. Drive hips forward to return to standing.",
    },
    {
      name: "Lateral Raise",
      primaryMuscle: "shoulders" as const,
      secondaryMuscles: [] as string[],
      equipment: "dumbbell" as const,
      description:
        "An isolation exercise for the medial deltoids.",
      instructions:
        "1. Stand holding a dumbbell in each hand at your sides.\n2. With a slight elbow bend, raise the dumbbells out to the sides until they reach shoulder height.\n3. Lower with control. Avoid using momentum.",
    },
    {
      name: "Plank",
      primaryMuscle: "core" as const,
      secondaryMuscles: [] as string[],
      equipment: "bodyweight" as const,
      description:
        "An isometric core exercise that builds endurance in the abdominals and lower back.",
      instructions:
        "1. Assume a forearm plank position — elbows under shoulders, body in a straight line from head to heels.\n2. Brace your core and glutes.\n3. Hold the position, breathing steadily. Do not let hips sag or pike.",
    },
    {
      name: "Face Pull",
      primaryMuscle: "shoulders" as const,
      secondaryMuscles: ["back"] as string[],
      equipment: "cable" as const,
      description:
        "A cable exercise targeting the rear delts and upper back, great for shoulder health.",
      instructions:
        "1. Set a cable pulley at roughly face height and attach a rope.\n2. Grip the rope with both hands, palms facing each other.\n3. Pull the rope toward your face, separating the ends and squeezing shoulder blades.\n4. Return with control.",
    },
    {
      name: "Dumbbell Lunges",
      primaryMuscle: "legs" as const,
      secondaryMuscles: ["core"] as string[],
      equipment: "dumbbell" as const,
      description:
        "A unilateral lower-body movement that builds quad, glute, and stabiliser strength.",
      instructions:
        "1. Stand holding a dumbbell in each hand at your sides.\n2. Step forward with one leg and lower your back knee toward the floor.\n3. Both knees should reach roughly 90 degrees.\n4. Push through the front heel to return to standing.\n5. Alternate legs each rep.",
    },
    {
      name: "Lat Pulldown",
      primaryMuscle: "back" as const,
      secondaryMuscles: ["arms"] as string[],
      equipment: "machine" as const,
      description:
        "A vertical pulling machine exercise that targets the latissimus dorsi.",
      instructions:
        "1. Sit at a lat pulldown station and adjust the knee pad.\n2. Grip the bar wider than shoulder-width with an overhand grip.\n3. Lean back slightly, pull the bar down to your upper chest.\n4. Squeeze lats, then return bar with control to full arm extension.",
    },
  ];

  // Upsert exercises by name
  const exerciseMap: Record<string, string> = {};
  for (const ex of exerciseData) {
    const exercise = await prisma.exercise.upsert({
      where: { id: ex.name.replace(/\s+/g, "-").toLowerCase() }, // placeholder; upsert needs a unique field
      update: {},
      create: {
        name: ex.name,
        primaryMuscle: ex.primaryMuscle,
        secondaryMuscles: ex.secondaryMuscles,
        equipment: ex.equipment,
        description: ex.description,
        instructions: ex.instructions,
        isPreset: ex.isPreset,
      },
    });
    exerciseMap[ex.name] = exercise.id;
    console.log(`  Exercise: ${ex.name}`);
  }

  // ── Plan Templates ─────────────────────────────────────────────────
  const templateDefinitions = [
    {
      name: "Push Pull Legs",
      description:
        "A 6-day split alternating push, pull, and leg days for balanced hypertrophy.",
      days: [
        {
          dayOfWeek: 1,
          exercises: [
            { name: "Bench Press", order: 1 },
            { name: "Overhead Press", order: 2 },
            { name: "Tricep Pushdown", order: 3 },
            { name: "Lateral Raise", order: 4 },
          ],
        },
        {
          dayOfWeek: 2,
          exercises: [
            { name: "Barbell Row", order: 1 },
            { name: "Pull-Up", order: 2 },
            { name: "Dumbbell Curl", order: 3 },
            { name: "Face Pull", order: 4 },
          ],
        },
        {
          dayOfWeek: 3,
          exercises: [
            { name: "Barbell Squat", order: 1 },
            { name: "Romanian Deadlift", order: 2 },
            { name: "Leg Press", order: 3 },
            { name: "Dumbbell Lunges", order: 4 },
            { name: "Plank", order: 5 },
          ],
        },
        {
          dayOfWeek: 4,
          exercises: [
            { name: "Bench Press", order: 1 },
            { name: "Overhead Press", order: 2 },
            { name: "Tricep Pushdown", order: 3 },
            { name: "Lateral Raise", order: 4 },
          ],
        },
        {
          dayOfWeek: 5,
          exercises: [
            { name: "Deadlift", order: 1 },
            { name: "Barbell Row", order: 2 },
            { name: "Pull-Up", order: 3 },
            { name: "Lat Pulldown", order: 4 },
          ],
        },
        {
          dayOfWeek: 6,
          exercises: [
            { name: "Barbell Squat", order: 1 },
            { name: "Romanian Deadlift", order: 2 },
            { name: "Leg Press", order: 3 },
            { name: "Dumbbell Lunges", order: 4 },
            { name: "Plank", order: 5 },
          ],
        },
      ],
    },
    {
      name: "Upper Lower Split",
      description:
        "A 4-day split alternating upper and lower body workouts for strength and hypertrophy.",
      days: [
        {
          dayOfWeek: 1,
          exercises: [
            { name: "Bench Press", order: 1 },
            { name: "Barbell Row", order: 2 },
            { name: "Overhead Press", order: 3 },
            { name: "Pull-Up", order: 4 },
            { name: "Lateral Raise", order: 5 },
            { name: "Tricep Pushdown", order: 6 },
          ],
        },
        {
          dayOfWeek: 2,
          exercises: [
            { name: "Barbell Squat", order: 1 },
            { name: "Romanian Deadlift", order: 2 },
            { name: "Leg Press", order: 3 },
            { name: "Dumbbell Lunges", order: 4 },
            { name: "Plank", order: 5 },
          ],
        },
        {
          dayOfWeek: 3,
          exercises: [
            { name: "Bench Press", order: 1 },
            { name: "Barbell Row", order: 2 },
            { name: "Overhead Press", order: 3 },
            { name: "Face Pull", order: 4 },
            { name: "Dumbbell Curl", order: 5 },
          ],
        },
        {
          dayOfWeek: 4,
          exercises: [
            { name: "Deadlift", order: 1 },
            { name: "Barbell Squat", order: 2 },
            { name: "Leg Press", order: 3 },
            { name: "Romanian Deadlift", order: 4 },
            { name: "Plank", order: 5 },
          ],
        },
      ],
    },
    {
      name: "Full Body 3x",
      description:
        "A 3-day full-body program ideal for beginners or those with limited time.",
      days: [
        {
          dayOfWeek: 1,
          exercises: [
            { name: "Barbell Squat", order: 1 },
            { name: "Bench Press", order: 2 },
            { name: "Barbell Row", order: 3 },
            { name: "Overhead Press", order: 4 },
            { name: "Plank", order: 5 },
          ],
        },
        {
          dayOfWeek: 3,
          exercises: [
            { name: "Deadlift", order: 1 },
            { name: "Pull-Up", order: 2 },
            { name: "Overhead Press", order: 3 },
            { name: "Dumbbell Lunges", order: 4 },
            { name: "Dumbbell Curl", order: 5 },
          ],
        },
        {
          dayOfWeek: 5,
          exercises: [
            { name: "Barbell Squat", order: 1 },
            { name: "Bench Press", order: 2 },
            { name: "Lat Pulldown", order: 3 },
            { name: "Lateral Raise", order: 4 },
            { name: "Plank", order: 5 },
          ],
        },
      ],
    },
  ];

  const systemUserId = "system";

  // Ensure system user exists for templates
  await prisma.user.upsert({
    where: { id: systemUserId },
    update: {},
    create: {
      id: systemUserId,
      email: "system@fitness.app",
      name: "System",
      passwordHash: "__system__",
    },
  });

  for (const template of templateDefinitions) {
    const plan = await prisma.trainingPlan.upsert({
      where: { id: `template-${template.name.replace(/\s+/g, "-").toLowerCase()}` },
      update: {},
      create: {
        name: template.name,
        description: template.description,
        isTemplate: true,
        userId: systemUserId,
      },
    });

    // Remove existing plan exercises for this template before re-creating
    await prisma.planExercise.deleteMany({ where: { planId: plan.id } });

    for (const day of template.days) {
      for (const ex of day.exercises) {
        const exerciseId = exerciseMap[ex.name];
        const targetReps = ex.name === "Plank" ? "60s" : "8-12";
        await prisma.planExercise.create({
          data: {
            planId: plan.id,
            exerciseId,
            weekNumber: 1,
            dayOfWeek: day.dayOfWeek,
            order: ex.order,
            targetSets: 3,
            targetReps,
          },
        });
      }
    }
    console.log(`  Template: ${template.name}`);
  }

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
