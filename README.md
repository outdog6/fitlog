# FitLog — 力量训练记录工具

为认真训练者打造的 Web 端训练日志。规划训练周期、记录每组数据，用数据驱动进步。

## 功能

- **训练计划管理** — 从模板创建计划（推拉腿/上下肢/全身），或完全自定义编排，灵活分配每周每天的动作
- **动作库** — 20 个预设动作，含中文说明和分步指导，按肌群和器械筛选，支持添加自定义动作
- **训练记录** — 逐组记录重量和次数，±2.5kg / ±1 次快捷调节，自动预填上次训练数据
- **组间歇计时** — ▶ 开始 / ✓ 完成双按钮精确测量纯休息时间，颜色分阶段提醒超时
- **训练时长** — 进入训练自动计时，结束训练时保存总时长
- **训练量分析** — 每周训练量趋势图，各肌群训练量分布柱状图
- **用户系统** — 邮箱注册登录，JWT 认证

## 技术栈

| 层 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router) |
| 语言 | TypeScript |
| 数据库 | SQLite (Prisma 7 + libsql) |
| 认证 | NextAuth.js v5 (Credentials) |
| UI | Tailwind CSS v4 + shadcn/ui v4 |
| 图表 | Recharts |
| 图标 | Lucide React |

## 本地运行

```bash
# 安装依赖
npm install

# 初始化数据库并灌入种子数据
npx prisma db push
npx tsx prisma/seed.ts

# 启动开发服务器
npm run dev
```

打开 http://localhost:3000，注册账户即可使用。

## 项目结构

```
src/
├── app/
│   ├── page.tsx              # 着陆页
│   ├── login/                # 登录注册
│   ├── (authenticated)/      # 需登录的路由
│   │   ├── dashboard/        # 仪表盘
│   │   ├── plans/            # 训练计划
│   │   ├── exercises/        # 动作库
│   │   ├── workout/          # 训练记录
│   │   └── analytics/        # 数据分析
│   └── api/                  # API 路由
├── components/               # UI 组件
│   ├── ui/                   # shadcn 组件
│   ├── sidebar.tsx           # 侧边栏
│   ├── set-logger.tsx        # 训练组记录器
│   ├── add-exercise-dialog.tsx
│   └── volume-chart.tsx      # 训练量图表
├── lib/                      # 工具函数
│   ├── prisma.ts             # 数据库客户端
│   └── auth.ts               # 认证配置
└── middleware.ts             # 路由守卫

prisma/
├── schema.prisma             # 数据模型
└── seed.ts                   # 种子数据
```
