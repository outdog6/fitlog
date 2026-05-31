# FitLog Mobile

Expo React Native 版本的力量训练记录 App。Android 优先，本地 SQLite 存储，无需登录。

## 启动

```bash
npm install
npx expo start --web   # Web 预览（UI 调试用，DB 为内存 stub）
npx expo run:android   # Android 设备/模拟器（需要 Android SDK）
```

## 技术栈

| 层 | 技术 |
|---|---|
| 框架 | Expo SDK 55 + React Native 0.83 |
| 路由 | Expo Router v4（文件系统路由） |
| 样式 | NativeWind v4（Tailwind CSS 3.x） |
| 数据库 | Drizzle ORM + expo-sqlite（Android）/ 内存 stub（Web） |
| 图标 | lucide-react-native |
| 组件测试 | Storybook（`@storybook/react-native`） |

## 项目结构

```
src/
├── app/                    # Expo Router 页面
│   ├── _layout.tsx         # 根布局（seed 入口）
│   ├── index.tsx           # → 重定向到 /(tabs)
│   ├── (tabs)/
│   │   ├── _layout.tsx     # 5 个底部 Tab
│   │   ├── index.tsx       # 仪表盘
│   │   ├── workout.tsx     # 训练记录（核心功能）
│   │   ├── exercises.tsx   # 动作库
│   │   ├── plans.tsx       # 训练计划
│   │   └── analytics.tsx   # 统计分析
│   ├── workout/[id].tsx    # 训练详情
│   └── exercise/[id].tsx   # 动作详情
├── components/
│   └── workout/
│       ├── SetRow.tsx      # 单组训练行（重量×次数 stepper）
│       ├── StepperControl.tsx
│       └── RestTimerOverlay.tsx
├── db/
│   ├── schema.ts           # Drizzle 7 表定义 + 关系
│   ├── index.ts            # expo-sqlite 实例
│   ├── index.web.ts        # Web 内存 stub
│   ├── seed.ts             # 20 个预设动作
│   └── seed.web.ts
└── lib/
    └── auth.tsx            # 本地用户（DESKTOP_MODE 模式）
```

## 设计系统

Apple 风格深色健身主题。见 `tailwind.config.js` 和 `design/DESIGN.md`。

- 底色：纯黑 `#000000`，表面 `#272729`
- 强调色：系统绿 `#34c759`（唯一交互色）
- 按钮：全胶囊形 `rounded-pill`
- 排版：Inter 字体，标题负间距，正文 17px
