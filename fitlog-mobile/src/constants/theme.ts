// 肌群 → 颜色映射（语义色）
export const MUSCLE_COLORS: Record<string, string> = {
  chest: "#FF453A",
  back: "#007AFF",
  legs: "#34C759",
  shoulders: "#FF9500",
  arms: "#AF52DE",
  core: "#FFD60A",
};

export const MUSCLE_LABELS: Record<string, string> = {
  chest: "胸",
  back: "背",
  legs: "腿",
  shoulders: "肩",
  arms: "手臂",
  core: "核心",
};

export const MUSCLE_BG: Record<string, string> = {
  chest: "rgba(255,69,58,0.15)",
  back: "rgba(0,122,255,0.15)",
  legs: "rgba(52,199,89,0.15)",
  shoulders: "rgba(255,149,0,0.15)",
  arms: "rgba(175,82,222,0.15)",
  core: "rgba(255,214,10,0.15)",
};

export const EQUIPMENT_LABELS: Record<string, string> = {
  barbell: "杠铃",
  dumbbell: "哑铃",
  cable: "绳索",
  machine: "器械",
  bodyweight: "自重",
};
