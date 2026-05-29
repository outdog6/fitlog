import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({ url: "file:dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  const exerciseData = [
    {
      name: "深蹲",
      primaryMuscle: "legs",
      secondaryMuscles: JSON.stringify(["core"]),
      equipment: "barbell",
      description: "下肢复合动作，主要锻炼股四头肌、腘绳肌和臀肌。",
      instructions: "1. 将杠铃放在深蹲架上，高度与胸口齐平。\n2. 从下方进入杠铃，将杠铃放在上背部，出杠。\n3. 后退，双脚与肩同宽，脚尖微微向外。\n4. 收紧核心，屈膝屈髋下蹲，直到大腿至少与地面平行。\n5. 通过脚后跟发力站起。",
      isPreset: true,
    },
    {
      name: "卧推",
      primaryMuscle: "chest",
      secondaryMuscles: JSON.stringify(["shoulders", "arms"]),
      equipment: "barbell",
      description: "经典的上肢推类动作，增强胸部、肩部和肱三头肌力量。",
      instructions: "1. 平躺在平板凳上，眼睛在杠铃正下方。\n2. 握距比肩略宽。\n3. 出杠，控制杠铃下放到胸部中间。\n4. 将杠铃推回起始位置，肘部不完全锁死。",
    },
    {
      name: "硬拉",
      primaryMuscle: "back",
      secondaryMuscles: JSON.stringify(["legs", "core"]),
      equipment: "barbell",
      description: "全身性的髋铰链动作，侧重训练后链肌群。",
      instructions: "1. 站在杠铃前，双脚与髋同宽，杠铃在脚掌中间上方。\n2. 屈髋屈膝，握住杠铃，握距与肩同宽。\n3. 保持背部挺直，挺胸，拉紧杠铃。\n4. 通过脚后跟发力，伸展髋膝站起。\n5. 沿原路放下杠铃，髋部先动。",
    },
    {
      name: "实力举",
      primaryMuscle: "shoulders",
      secondaryMuscles: JSON.stringify(["arms"]),
      equipment: "barbell",
      description: "发展肩部和肱三头肌力量的竖直推举。",
      instructions: "1. 将杠铃放在力量架上，高度约在胸口位置。\n2. 握距略宽于肩，出杠，杠铃靠在前三角肌上。\n3. 收紧核心，将杠铃举过头顶至手臂完全伸展。\n4. 控制杠铃回到起始位置。",
    },
    {
      name: "杠铃划船",
      primaryMuscle: "back",
      secondaryMuscles: JSON.stringify(["arms"]),
      equipment: "barbell",
      description: "俯身划船动作，锻炼背阔肌、菱形肌和肱二头肌。",
      instructions: "1. 站在杠铃前，前倾至躯干与地面接近平行。\n2. 握距略宽于肩。\n3. 将杠铃拉向胸口下方/上腹部。\n4. 收缩肩胛骨，然后控制下放杠铃。",
    },
    {
      name: "引体向上",
      primaryMuscle: "back",
      secondaryMuscles: JSON.stringify(["arms"]),
      equipment: "bodyweight",
      description: "自重垂直拉类动作，增强背部宽度和手臂力量。",
      instructions: "1. 正手握住引体杆，握距与肩同宽或略宽。\n2. 将自己向上拉，直到下巴超过杆。\n3. 控制下放至手臂完全伸展。\n4. 避免过度摇摆或借力。",
    },
    {
      name: "哑铃弯举",
      primaryMuscle: "arms",
      secondaryMuscles: JSON.stringify([]),
      equipment: "dumbbell",
      description: "孤立训练肱二头肌。",
      instructions: "1. 站立，双手各持哑铃，手臂自然下垂，掌心向前。\n2. 弯举哑铃至肩膀高度，肘部固定不动。\n3. 在顶部收缩肱二头肌，然后控制下放。",
    },
    {
      name: "绳索下压",
      primaryMuscle: "arms",
      secondaryMuscles: JSON.stringify([]),
      equipment: "cable",
      description: "使用绳索机训练肱三头肌的孤立动作。",
      instructions: "1. 在绳索机高位滑轮上安装直杆或绳索手柄。\n2. 握住手柄，肘部紧贴身体两侧。\n3. 下压手柄至手臂完全伸展。\n4. 缓慢回到起始位置，肘部不动。",
    },
    {
      name: "腿举",
      primaryMuscle: "legs",
      secondaryMuscles: JSON.stringify(["core"]),
      equipment: "machine",
      description: "器械腿举，锻炼股四头肌、腘绳肌和臀肌。",
      instructions: "1. 坐在腿举机上，双脚与肩同宽放在踏板上。\n2. 推动踏板直到腿接近伸直（不锁膝）。\n3. 下放踏板至膝盖约90度角。\n4. 推回起始位置。",
    },
    {
      name: "罗马尼亚硬拉",
      primaryMuscle: "legs",
      secondaryMuscles: JSON.stringify(["back"]),
      equipment: "barbell",
      description: "髋铰链动作，侧重训练腘绳肌和臀肌。",
      instructions: "1. 站立，双手握住杠铃，杠铃在髋部高度。\n2. 膝盖微屈，保持背部挺直，髋部后推。\n3. 沿腿部下放杠铃，直到感到腘绳肌有明显拉伸感。\n4. 髋部前推恢复站立。",
    },
    {
      name: "侧平举",
      primaryMuscle: "shoulders",
      secondaryMuscles: JSON.stringify([]),
      equipment: "dumbbell",
      description: "孤立训练中三角肌。",
      instructions: "1. 站立，双手各持哑铃放在身体两侧。\n2. 肘部微屈，将哑铃向两侧举起至肩部高度。\n3. 控制下放。避免借力。",
    },
    {
      name: "平板支撑",
      primaryMuscle: "core",
      secondaryMuscles: JSON.stringify([]),
      equipment: "bodyweight",
      description: "等长核心训练，增强腹肌和下背部的耐力。",
      instructions: "1. 从肘板支撑开始——肘部在肩下方，身体从头部到脚跟呈一条直线。\n2. 收紧核心和臀肌。\n3. 保持姿势，均匀呼吸。不要让臀部下沉或抬高。",
    },
    {
      name: "面拉",
      primaryMuscle: "shoulders",
      secondaryMuscles: JSON.stringify(["back"]),
      equipment: "cable",
      description: "针对后束和上背的绳索动作，对肩膀健康非常有益。",
      instructions: "1. 将绳索滑轮设置在约面部高度，安装绳索手柄。\n2. 双手握住绳索，掌心相对。\n3. 将绳索拉向面部，双手分开，收缩肩胛骨。\n4. 控制还原。",
    },
    {
      name: "哑铃箭步蹲",
      primaryMuscle: "legs",
      secondaryMuscles: JSON.stringify(["core"]),
      equipment: "dumbbell",
      description: "单侧下肢训练，增强股四头肌、臀肌和稳定性。",
      instructions: "1. 站立，双手各持哑铃放在身体两侧。\n2. 向前迈出一步，下蹲至前后膝盖均呈90度角。\n3. 通过前脚后跟发力返回起始位置。\n4. 交替腿部。",
    },
    {
      name: "高位下拉",
      primaryMuscle: "back",
      secondaryMuscles: JSON.stringify(["arms"]),
      equipment: "cable",
      description: "垂直拉类器械动作，增加背阔肌宽度。",
      instructions: "1. 坐在高位下拉器上，调整腿部固定垫。\n2. 握距比肩宽，正手握杆。\n3. 微向后倾，将杆拉至上胸口。\n4. 收缩背阔肌，然后控制杆回到全臂伸展位置。",
    },
  ];

  // Create system user for templates
  await prisma.user.upsert({
    where: { id: "system" },
    update: {},
    create: { id: "system", email: "system@fitlog.local", name: "System", passwordHash: "" },
  });

  const exerciseMap: Record<string, string> = {};
  for (const ex of exerciseData) {
    const slug = ex.name.replace(/\s+/g, "-").toLowerCase();
    const exercise = await prisma.exercise.upsert({
      where: { id: slug },
      update: {},
      create: {
        id: slug,
        name: ex.name,
        primaryMuscle: ex.primaryMuscle,
        secondaryMuscles: ex.secondaryMuscles,
        equipment: ex.equipment,
        description: ex.description,
        instructions: ex.instructions,
        isPreset: true,
      },
    });
    exerciseMap[ex.name] = exercise.id;
    console.log(`  Exercise: ${ex.name}`);
  }

  const templates = [
    {
      name: "推拉腿分化",
      description: "6天训练分化：推日、拉日、腿日各两次。",
      days: [
        { day: 1, exercises: ["卧推", "实力举", "绳索下压", "侧平举"] },
        { day: 2, exercises: ["硬拉", "杠铃划船", "引体向上", "面拉", "哑铃弯举"] },
        { day: 3, exercises: ["深蹲", "腿举", "罗马尼亚硬拉", "哑铃箭步蹲", "平板支撑"] },
        { day: 4, exercises: ["卧推", "实力举", "绳索下压", "侧平举"] },
        { day: 5, exercises: ["硬拉", "杠铃划船", "高位下拉", "面拉", "哑铃弯举"] },
        { day: 6, exercises: ["深蹲", "腿举", "罗马尼亚硬拉", "哑铃箭步蹲", "平板支撑"] },
      ],
    },
    {
      name: "上下肢分化",
      description: "4天训练分化：上肢、下肢各两次。",
      days: [
        { day: 1, exercises: ["卧推", "杠铃划船", "实力举", "引体向上", "绳索下压", "哑铃弯举"] },
        { day: 2, exercises: ["深蹲", "罗马尼亚硬拉", "腿举", "哑铃箭步蹲", "平板支撑"] },
        { day: 3, exercises: ["卧推", "杠铃划船", "实力举", "高位下拉", "侧平举", "面拉"] },
        { day: 4, exercises: ["深蹲", "硬拉", "腿举", "罗马尼亚硬拉", "平板支撑"] },
      ],
    },
    {
      name: "全身训练3次/周",
      description: "每周3天，每天全身训练。",
      days: [
        { day: 1, exercises: ["深蹲", "卧推", "杠铃划船", "实力举", "平板支撑"] },
        { day: 3, exercises: ["硬拉", "实力举", "引体向上", "哑铃箭步蹲", "面拉"] },
        { day: 5, exercises: ["深蹲", "卧推", "杠铃划船", "罗马尼亚硬拉", "绳索下压", "哑铃弯举"] },
      ],
    },
  ];

  console.log("Seeding plan templates...");
  for (const tmpl of templates) {
    const planId = `template-${tmpl.name.replace(/\s+/g, "-").toLowerCase()}`;
    const plan = await prisma.trainingPlan.upsert({
      where: { id: planId },
      update: { name: tmpl.name, description: tmpl.description },
      create: {
        id: planId,
        name: tmpl.name,
        description: tmpl.description,
        isTemplate: true,
        userId: "system",
      },
    });

    await prisma.planExercise.deleteMany({ where: { planId: plan.id } });
    for (const day of tmpl.days) {
      for (let i = 0; i < day.exercises.length; i++) {
        const exerciseId = exerciseMap[day.exercises[i]];
        if (!exerciseId) {
          console.warn(`  WARNING: exercise "${day.exercises[i]}" not found, skipping`);
          continue;
        }
        await prisma.planExercise.create({
          data: {
            planId: plan.id,
            exerciseId,
            weekNumber: 1,
            dayOfWeek: day.day,
            order: i,
            targetSets: 3,
            targetReps: day.exercises[i] === "平板支撑" ? "60s" : "8-12",
          },
        });
      }
    }
    console.log(`  Plan: ${tmpl.name}`);
  }

  console.log("Seed complete.");
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
