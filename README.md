# FitLog — 力量训练记录工具

为认真训练者打造的训练日志。规划训练周期、记录每组数据，用数据驱动进步。

## 版本说明

| 分支 | 版本 | 特点 |
|------|------|------|
| [`main`](https://github.com/outdog6/fitlog) | Web 版 | 需注册登录，可部署到 Vercel 供多人使用 |
| [`desktop`](https://github.com/outdog6/fitlog/tree/desktop) | 桌面版 | 免登录，打开即用，数据存本机 |

## 功能

- **训练计划管理** — 从模板创建计划（推拉腿/上下肢/全身），或完全自定义编排
- **动作库** — 20 个预设动作，含中文说明和分步指导，支持添加/编辑/删除
- **训练记录** — 逐组记录重量和次数，±2.5kg / ±1 次快捷调节，自动预填上次数据
- **组间歇计时** — ▶ 开始 / ✓ 完成双按钮精确测量纯休息时间
- **训练时长** — 进入训练自动计时，结束训练时保存总时长
- **训练量分析** — 每周训练量趋势图，各肌群训练量分布柱状图

## 技术栈

| 层 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router) |
| 语言 | TypeScript |
| 数据库 | SQLite (Prisma 7 + libsql) |
| UI | Tailwind CSS v4 + shadcn/ui v4 |
| 图表 | Recharts |
| 图标 | Lucide React |

## 桌面版使用

1. 下载 `release/` 文件夹
2. 双击 `启动FitLog.bat`
3. 浏览器自动打开，无需安装任何东西

**换电脑迁移数据**：拷贝 `release/dev.db` 文件到新电脑同位置即可。

## Web 版本地开发

```bash
npm install
npx prisma db push
npx tsx prisma/seed.ts
npm run dev
```

打开 http://localhost:3000 即可。

## 项目结构

```
src/
├── app/
│   ├── page.tsx              # 着陆页
│   ├── (authenticated)/
│   │   ├── dashboard/        # 训练台
│   │   ├── plans/            # 训练计划
│   │   ├── exercises/        # 动作库
│   │   ├── workout/          # 训练记录
│   │   └── analytics/        # 数据分析
│   └── api/                  # API 路由
├── components/
│   ├── ui/                   # shadcn 组件
│   ├── sidebar.tsx
│   ├── set-logger.tsx        # 训练组记录器
│   └── volume-chart.tsx      # 训练量图表
└── lib/
    ├── prisma.ts             # 数据库客户端
    └── auth.ts               # 认证

prisma/
├── schema.prisma
└── seed.ts                   # 20 个预设动作 + 3 个计划模板
```
