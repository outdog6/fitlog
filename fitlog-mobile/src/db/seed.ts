import { db } from "./index";
import { exercises } from "./schema";
import { eq, sql } from "drizzle-orm";

const presetExercises = [
  { id: "barbell-squat", name: "深蹲", primaryMuscle: "legs", secondaryMuscles: ["core"], equipment: "barbell", description: "下肢复合动作，主要锻炼股四头肌、腘绳肌和臀肌。", instructions: "1. 将杠铃放在深蹲架上，高度与胸口齐平。\n2. 从下方进入杠铃，将杠铃放在上背部，出杠。\n3. 后退，双脚与肩同宽，脚尖微微向外。\n4. 收紧核心，屈膝屈髋下蹲，直到大腿至少与地面平行。\n5. 通过脚后跟发力站起。" },
  { id: "bench-press", name: "卧推", primaryMuscle: "chest", secondaryMuscles: ["shoulders", "arms"], equipment: "barbell", description: "经典的上肢推类动作，增强胸部、肩部和肱三头肌力量。", instructions: "1. 平躺在平板凳上，眼睛在杠铃正下方。\n2. 握距比肩略宽。\n3. 出杠，控制杠铃下放到胸部中间。\n4. 将杠铃推回起始位置，肘部不完全锁死。" },
  { id: "deadlift", name: "硬拉", primaryMuscle: "back", secondaryMuscles: ["legs", "core"], equipment: "barbell", description: "全身性的髋铰链动作，侧重训练后链肌群。", instructions: "1. 站在杠铃前，双脚与髋同宽，杠铃在脚掌中间上方。\n2. 屈髋屈膝，握住杠铃，握距与肩同宽。\n3. 保持背部挺直，挺胸，拉紧杠铃。\n4. 通过脚后跟发力，伸展髋膝站起。\n5. 沿原路放下杠铃，髋部先动。" },
  { id: "overhead-press", name: "实力举", primaryMuscle: "shoulders", secondaryMuscles: ["arms"], equipment: "barbell", description: "发展肩部和肱三头肌力量的竖直推举。", instructions: "1. 将杠铃放在力量架上，高度约在胸口位置。\n2. 握距略宽于肩，出杠，杠铃靠在前三角肌上。\n3. 收紧核心，将杠铃举过头顶至手臂完全伸展。\n4. 控制杠铃回到起始位置。" },
  { id: "barbell-row", name: "杠铃划船", primaryMuscle: "back", secondaryMuscles: ["arms"], equipment: "barbell", description: "俯身划船动作，锻炼背阔肌、菱形肌和肱二头肌。", instructions: "1. 站在杠铃前，前倾至躯干与地面接近平行。\n2. 握距略宽于肩。\n3. 将杠铃拉向胸口下方/上腹部。\n4. 收缩肩胛骨，然后控制下放杠铃。" },
  { id: "pull-up", name: "引体向上", primaryMuscle: "back", secondaryMuscles: ["arms"], equipment: "bodyweight", description: "自重垂直拉类动作，增强背部宽度和手臂力量。", instructions: "1. 正手握住引体杆，握距与肩同宽或略宽。\n2. 将自己向上拉，直到下巴超过杆。\n3. 控制下放至手臂完全伸展。\n4. 避免过度摇摆或借力。" },
  { id: "dumbbell-curl", name: "哑铃弯举", primaryMuscle: "arms", secondaryMuscles: [], equipment: "dumbbell", description: "孤立训练肱二头肌。", instructions: "1. 站立，双手各持哑铃，手臂自然下垂，掌心向前。\n2. 弯举哑铃至肩膀高度，肘部固定不动。\n3. 在顶部收缩肱二头肌，然后控制下放。" },
  { id: "tricep-pushdown", name: "绳索下压", primaryMuscle: "arms", secondaryMuscles: [], equipment: "cable", description: "使用绳索机训练肱三头肌的孤立动作。", instructions: "1. 在绳索机高位滑轮上安装直杆或绳索手柄。\n2. 握住手柄，肘部紧贴身体两侧。\n3. 下压手柄至手臂完全伸展。\n4. 缓慢回到起始位置，肘部不动。" },
  { id: "leg-press", name: "腿举", primaryMuscle: "legs", secondaryMuscles: ["core"], equipment: "machine", description: "器械腿举，锻炼股四头肌、腘绳肌和臀肌。", instructions: "1. 坐在腿举机上，双脚与肩同宽放在踏板上。\n2. 推动踏板直到腿接近伸直（不锁膝）。\n3. 下放踏板至膝盖约90度角。\n4. 推回起始位置。" },
  { id: "romanian-deadlift", name: "罗马尼亚硬拉", primaryMuscle: "legs", secondaryMuscles: ["back"], equipment: "barbell", description: "髋铰链动作，侧重训练腘绳肌和臀肌。", instructions: "1. 站立，双手握住杠铃，杠铃在髋部高度。\n2. 膝盖微屈，保持背部挺直，髋部后推。\n3. 沿腿部下放杠铃，直到感到腘绳肌有明显拉伸感。\n4. 髋部前推恢复站立。" },
  { id: "lateral-raise", name: "侧平举", primaryMuscle: "shoulders", secondaryMuscles: [], equipment: "dumbbell", description: "孤立训练中三角肌。", instructions: "1. 站立，双手各持哑铃放在身体两侧。\n2. 肘部微屈，将哑铃向两侧举起至肩部高度。\n3. 控制下放。避免借力。" },
  { id: "plank", name: "平板支撑", primaryMuscle: "core", secondaryMuscles: [], equipment: "bodyweight", description: "等长核心训练，增强腹肌和下背部的耐力。", instructions: "1. 从肘板支撑开始——肘部在肩下方，身体从头部到脚跟呈一条直线。\n2. 收紧核心和臀肌。\n3. 保持姿势，均匀呼吸。不要让臀部下沉或抬高。" },
  { id: "face-pull", name: "面拉", primaryMuscle: "shoulders", secondaryMuscles: ["back"], equipment: "cable", description: "针对后束和上背的绳索动作，对肩膀健康非常有益。", instructions: "1. 将绳索滑轮设置在约面部高度，安装绳索手柄。\n2. 双手握住绳索，掌心相对。\n3. 将绳索拉向面部，双手分开，收缩肩胛骨。\n4. 控制还原。" },
  { id: "dumbbell-lunge", name: "哑铃箭步蹲", primaryMuscle: "legs", secondaryMuscles: ["core"], equipment: "dumbbell", description: "单侧下肢训练，增强股四头肌、臀肌和稳定性。", instructions: "1. 站立，双手各持哑铃放在身体两侧。\n2. 向前迈出一步，下蹲至前后膝盖均呈90度角。\n3. 通过前脚后跟发力返回起始位置。\n4. 交替腿部。" },
  { id: "lat-pulldown", name: "高位下拉", primaryMuscle: "back", secondaryMuscles: ["arms"], equipment: "cable", description: "垂直拉类器械动作，增加背阔肌宽度。", instructions: "1. 坐在高位下拉器上，调整腿部固定垫。\n2. 握距比肩宽，正手握杆。\n3. 微向后倾，将杆拉至上胸口。\n4. 收缩背阔肌，然后控制杆回到全臂伸展位置。" },
  { id: "seated-chest-press", name: "坐姿器械推胸", primaryMuscle: "chest", secondaryMuscles: ["shoulders", "arms"], equipment: "machine", description: "固定器械推胸动作，轨迹稳定，适合新手和力竭训练。", instructions: "1. 坐于器械上，调整座椅高度使手柄位于胸部中段。\n2. 背部紧贴靠垫，双手握住手柄。\n3. 向前推至手臂接近伸直（不锁肘）。\n4. 控制还原，感受胸肌拉伸。" },
  { id: "incline-dumbbell-press", name: "哑铃上斜卧推", primaryMuscle: "chest", secondaryMuscles: ["shoulders", "arms"], equipment: "dumbbell", description: "上斜角度哑铃推举，侧重上胸肌群的发展。", instructions: "1. 将哑铃凳调至30-45度上斜角度。\n2. 双手各持哑铃，仰卧于凳上，哑铃置于胸部两侧。\n3. 向上推举哑铃至手臂接近伸直，哑铃在锁骨上方。\n4. 控制下放，感受上胸拉伸。" },
  { id: "incline-bench-press", name: "仰卧上斜推胸", primaryMuscle: "chest", secondaryMuscles: ["shoulders", "arms"], equipment: "barbell", description: "上斜角度杠铃推举，增强上胸厚度和力量。", instructions: "1. 将凳子调至30-45度上斜角度，仰卧在杠铃架下。\n2. 握距比肩略宽，出杠，杠铃位于锁骨上方。\n3. 下放杠铃至胸口上方，肘部约呈45度。\n4. 推起至手臂接近伸直，保持肩胛收紧。" },
  { id: "dips", name: "双杠臂屈伸", primaryMuscle: "chest", secondaryMuscles: ["shoulders", "arms"], equipment: "bodyweight", description: "自重训练经典动作，身体前倾侧重胸肌下部。", instructions: "1. 双手撑于双杠上，手臂伸直支撑身体。\n2. 身体前倾，屈肘下放身体至肩膀低于肘部。\n3. 感受胸肌下部拉伸后发力推起。\n4. 重复动作，保持身体稳定不摆动。" },
  { id: "pec-deck-fly", name: "蝴蝶机夹胸", primaryMuscle: "chest", secondaryMuscles: ["shoulders"], equipment: "machine", description: "器械飞鸟动作，孤立训练胸肌中缝，刻画胸部线条。", instructions: "1. 坐于蝴蝶机上，调整座椅使手臂与肩同高。\n2. 前臂靠于垫板上，肘部微屈。\n3. 双臂向中间靠拢，感受胸肌收缩。\n4. 控制打开回到起始位置，保持胸肌张力。" },
];

export async function seedExercises() {
  const existing = await db.select({ count: sql<number>`count(*)` }).from(exercises);
  if (existing[0].count > 0) return;

  await db.insert(exercises).values(
    presetExercises.map((e) => ({
      id: e.id,
      name: e.name,
      primaryMuscle: e.primaryMuscle,
      secondaryMuscles: JSON.stringify(e.secondaryMuscles),
      equipment: e.equipment,
      description: e.description,
      instructions: e.instructions,
      isPreset: true,
    }))
  );
}
