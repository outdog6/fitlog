import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";

// ─── Tables ───

export const users = sqliteTable("User", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  name: text("name"),
  passwordHash: text("passwordHash").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const sessions = sqliteTable("Session", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  sessionToken: text("sessionToken").notNull().unique(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp" }).notNull(),
});

export const exercises = sqliteTable("Exercise", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  primaryMuscle: text("primaryMuscle").notNull(),
  secondaryMuscles: text("secondaryMuscles").notNull().default("[]"),
  equipment: text("equipment").notNull(),
  description: text("description").default(""),
  instructions: text("instructions").default(""),
  imageUrl: text("imageUrl"),
  isPreset: integer("isPreset", { mode: "boolean" }).notNull().default(false),
  userId: text("userId").references(() => users.id, { onDelete: "cascade" }),
});

export const trainingPlans = sqliteTable("TrainingPlan", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  isTemplate: integer("isTemplate", { mode: "boolean" }).notNull().default(false),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const planExercises = sqliteTable("PlanExercise", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  planId: text("planId")
    .notNull()
    .references(() => trainingPlans.id, { onDelete: "cascade" }),
  exerciseId: text("exerciseId")
    .notNull()
    .references(() => exercises.id),
  weekNumber: integer("weekNumber").notNull(),
  dayOfWeek: integer("dayOfWeek").notNull(),
  order: integer("order").notNull(),
  targetSets: integer("targetSets").notNull(),
  targetReps: text("targetReps").notNull().default("8-12"),
});

export const workoutSessions = sqliteTable("WorkoutSession", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  planId: text("planId").references(() => trainingPlans.id),
  date: integer("date", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  duration: integer("duration"),
  notes: text("notes"),
});

export const workoutSets = sqliteTable("WorkoutSet", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  sessionId: text("sessionId")
    .notNull()
    .references(() => workoutSessions.id, { onDelete: "cascade" }),
  exerciseId: text("exerciseId")
    .notNull()
    .references(() => exercises.id),
  setNumber: integer("setNumber").notNull(),
  weight: real("weight").notNull(),
  reps: integer("reps").notNull(),
  rpe: real("rpe"),
});

// ─── Relations ───

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  plans: many(trainingPlans),
  workouts: many(workoutSessions),
  exercises: many(exercises),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const exercisesRelations = relations(exercises, ({ one, many }) => ({
  user: one(users, {
    fields: [exercises.userId],
    references: [users.id],
  }),
  planExercises: many(planExercises),
  workoutSets: many(workoutSets),
}));

export const trainingPlansRelations = relations(trainingPlans, ({ one, many }) => ({
  user: one(users, { fields: [trainingPlans.userId], references: [users.id] }),
  exercises: many(planExercises),
  sessions: many(workoutSessions),
}));

export const planExercisesRelations = relations(planExercises, ({ one }) => ({
  plan: one(trainingPlans, {
    fields: [planExercises.planId],
    references: [trainingPlans.id],
  }),
  exercise: one(exercises, {
    fields: [planExercises.exerciseId],
    references: [exercises.id],
  }),
}));

export const workoutSessionsRelations = relations(workoutSessions, ({ one, many }) => ({
  user: one(users, { fields: [workoutSessions.userId], references: [users.id] }),
  plan: one(trainingPlans, {
    fields: [workoutSessions.planId],
    references: [trainingPlans.id],
  }),
  sets: many(workoutSets),
}));

export const workoutSetsRelations = relations(workoutSets, ({ one }) => ({
  session: one(workoutSessions, {
    fields: [workoutSets.sessionId],
    references: [workoutSessions.id],
  }),
  exercise: one(exercises, {
    fields: [workoutSets.exerciseId],
    references: [exercises.id],
  }),
}));

// ─── Schema export ───

export const schema = {
  users,
  sessions,
  exercises,
  trainingPlans,
  planExercises,
  workoutSessions,
  workoutSets,
};

// ─── Type exports ───

export type User = InferSelectModel<typeof users>;
export type Session = InferSelectModel<typeof sessions>;
export type Exercise = InferSelectModel<typeof exercises>;
export type TrainingPlan = InferSelectModel<typeof trainingPlans>;
export type PlanExercise = InferSelectModel<typeof planExercises>;
export type WorkoutSession = InferSelectModel<typeof workoutSessions>;
export type WorkoutSet = InferSelectModel<typeof workoutSets>;

export type NewUser = InferInsertModel<typeof users>;
export type NewExercise = InferInsertModel<typeof exercises>;
export type NewTrainingPlan = InferInsertModel<typeof trainingPlans>;
export type NewPlanExercise = InferInsertModel<typeof planExercises>;
export type NewWorkoutSession = InferInsertModel<typeof workoutSessions>;
export type NewWorkoutSet = InferInsertModel<typeof workoutSets>;
