import { db, exercises } from "./index.web";

const presetExercises = [
  { id: "barbell-squat", name: "深蹲", primaryMuscle: "legs", secondaryMuscles: '["core"]', equipment: "barbell", description: "下肢复合动作", instructions: "", isPreset: true },
  { id: "bench-press", name: "卧推", primaryMuscle: "chest", secondaryMuscles: '["shoulders","arms"]', equipment: "barbell", description: "经典上肢推类动作", instructions: "", isPreset: true },
  { id: "deadlift", name: "硬拉", primaryMuscle: "back", secondaryMuscles: '["legs","core"]', equipment: "barbell", description: "全身性髋铰链动作", instructions: "", isPreset: true },
  { id: "overhead-press", name: "实力举", primaryMuscle: "shoulders", secondaryMuscles: '["arms"]', equipment: "barbell", description: "发展肩部和肱三头肌", instructions: "", isPreset: true },
  { id: "barbell-row", name: "杠铃划船", primaryMuscle: "back", secondaryMuscles: '["arms"]', equipment: "barbell", description: "俯身划船动作", instructions: "", isPreset: true },
  { id: "pull-up", name: "引体向上", primaryMuscle: "back", secondaryMuscles: '["arms"]', equipment: "bodyweight", description: "自重垂直拉类动作", instructions: "", isPreset: true },
  { id: "dumbbell-curl", name: "哑铃弯举", primaryMuscle: "arms", secondaryMuscles: "[]", equipment: "dumbbell", description: "孤立训练肱二头肌", instructions: "", isPreset: true },
  { id: "tricep-pushdown", name: "绳索下压", primaryMuscle: "arms", secondaryMuscles: "[]", equipment: "cable", description: "训练肱三头肌", instructions: "", isPreset: true },
  { id: "leg-press", name: "腿举", primaryMuscle: "legs", secondaryMuscles: '["core"]', equipment: "machine", description: "器械腿举", instructions: "", isPreset: true },
  { id: "romanian-deadlift", name: "罗马尼亚硬拉", primaryMuscle: "legs", secondaryMuscles: '["back"]', equipment: "barbell", description: "侧重腘绳肌和臀肌", instructions: "", isPreset: true },
  { id: "lateral-raise", name: "侧平举", primaryMuscle: "shoulders", secondaryMuscles: "[]", equipment: "dumbbell", description: "孤立训练中三角肌", instructions: "", isPreset: true },
  { id: "plank", name: "平板支撑", primaryMuscle: "core", secondaryMuscles: "[]", equipment: "bodyweight", description: "等长核心训练", instructions: "", isPreset: true },
  { id: "face-pull", name: "面拉", primaryMuscle: "shoulders", secondaryMuscles: '["back"]', equipment: "cable", description: "针对后束和上背", instructions: "", isPreset: true },
  { id: "dumbbell-lunge", name: "哑铃箭步蹲", primaryMuscle: "legs", secondaryMuscles: '["core"]', equipment: "dumbbell", description: "单侧下肢训练", instructions: "", isPreset: true },
  { id: "lat-pulldown", name: "高位下拉", primaryMuscle: "back", secondaryMuscles: '["arms"]', equipment: "cable", description: "增加背阔肌宽度", instructions: "", isPreset: true },
  { id: "seated-chest-press", name: "坐姿器械推胸", primaryMuscle: "chest", secondaryMuscles: '["shoulders","arms"]', equipment: "machine", description: "固定器械推胸", instructions: "", isPreset: true },
  { id: "incline-dumbbell-press", name: "哑铃上斜卧推", primaryMuscle: "chest", secondaryMuscles: '["shoulders","arms"]', equipment: "dumbbell", description: "侧重上胸肌群", instructions: "", isPreset: true },
  { id: "incline-bench-press", name: "仰卧上斜推胸", primaryMuscle: "chest", secondaryMuscles: '["shoulders","arms"]', equipment: "barbell", description: "增强上胸厚度", instructions: "", isPreset: true },
  { id: "dips", name: "双杠臂屈伸", primaryMuscle: "chest", secondaryMuscles: '["shoulders","arms"]', equipment: "bodyweight", description: "自重训练经典动作", instructions: "", isPreset: true },
  { id: "pec-deck-fly", name: "蝴蝶机夹胸", primaryMuscle: "chest", secondaryMuscles: '["shoulders"]', equipment: "machine", description: "孤立训练胸肌中缝", instructions: "", isPreset: true },
];

export async function seedExercises() {
  const existing = await db.query.exercises.findMany();
  if (existing.length > 0) return;
  await db.insert(exercises).values(presetExercises).returning();
}
