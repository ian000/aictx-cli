const fs = require('fs');
const path = require('path');

const rulesDir = 'd:\\product\\aictx-meta-repo\\rules';

const rules = [
  {
    name: 'project-smxingzuoai-business-logic.md',
    content: `---
tags: [业务逻辑, smxingzuoai]
alwaysApply: false
description: 当开发或讨论 smxingzuoai 项目的核心业务逻辑、状态机流转 (生命周期) 或 SSOT 阻断等业务红线时触发
---

# 业务逻辑 (Business Logic)

## 核心领域模型 (Domain Models)
- **User (用户)**: 系统的核心交互对象，必须通过 \`uni-id-co\` (或替换后的自研 JWT) 进行身份识别。
- **CanvasEngine (动态视觉引擎)**: 核心算力单元，负责将星座/运势数据渲染为个性化海报。
- **AdModule (广告组件)**: 核心变现单元，包含全屏视频与激励视频，受严格的频控与状态机约束。
- **Retention (留存大盘)**: 数据跟踪单元，依赖设备指纹 (\`deviceRetentionFillDayly\`) 进行转化率评估。

## 状态机流转 (State Machine)
- **海报生成生命周期**：
  1. \`Query\`：用户提交生日或星座信息。
  2. \`Compute\`：调用 \`Calendar\` 或 \`zodiacFromDate\` 算法引擎生成运势文案。
  3. \`Ad-Intercept\`：(可选) 触发激励视频，等待回调 \`RewardVerified\` 状态。
  4. \`Render\`：调用 \`CanvasRenderingContext2D\` 进行图文合成。
  5. \`Share/Download\`：通过 \`UniShare\` 分发至公域或私域。

## 业务红线 (Business Guardrails)
- **广告前置阻断**：在任何需要展示激励视频解锁的环节，必须优先检查网络状态与广告 SDK 初始化状态。如果广告拉取失败，必须提供兜底方案（如直接放行或提示重试），**严禁造成主业务流程死锁**。
- **鉴权红线**：获取敏感的星座运势数据或生成带个人信息的海报时，必须强制进行 Token 校验，严禁开放未鉴权的私有 API。
`
  },
  {
    name: 'project-smxingzuoai-context.md',
    content: `---
tags: [项目背景, smxingzuoai]
alwaysApply: false
description: 当需要了解 smxingzuoai 项目的真实痛点、商业变现目标或 MVP 边界时触发
---

# 项目背景 (Context)

## 客户真实诉求与痛点
- **Serverless 价格绑架 (Vendor Lock-in)**：原架构重度耦合 \`uniCloud\` (云函数、云数据库、uni-id)，面临涨价与流量收割的商业陷阱。
- **单机算力闲置**：亟需充分利用本地强大的 4090 显卡算力与私有服务器，降低边际成本至零。

## 商业变现目标 (Quote-to-Cash)
- **精准私域转化 (High-ticket)**：通过免费海报生成或运势解析，将公域流量引导至微信私域，进行高客单价服务转化。
- **矩阵号带货铺量 (Volume)**：利用生成的短视频/海报，进行多账号日更，通过低客单/高佣金商品（书籍、AI课程等）实现规模化变现。
- **广告直接截流 (Ads)**：应用内置激励视频 (\`RewardedVideo\`) 与全屏广告 (\`FullScreenVideo\`) 赚取广告费。

## 一期 MVP 边界声明
- **核心剥离**：彻底将 \`uniCloud\` 的云数据库与云函数替换为私有化 Node.js/NestJS 服务 + PostgreSQL + Prisma ORM。
- **坚决保留**：100% 保留 UniApp 前端的多端编译能力（微信小程序/App/H5）与核心 Canvas 渲染逻辑，不做重前端 UI 改版。
`
  },
  {
    name: 'project-smxingzuoai-prd.md',
    content: `---
tags: [PRD, smxingzuoai]
alwaysApply: false
description: 当设计或开发 smxingzuoai 项目的核心功能模块 (MOC) 和角色权限 (RBAC) 时触发
---

# 产品需求 (PRD)

## 核心功能模块列表 (MOC)
- **星座运势生成引擎 (Astrology Engine)**：基于用户出生数据（生日、时间），调用 \`Calendar\` 与相关算法，解析并输出当日、本周或年度星座运势/星盘。
- **海报动态渲染模块 (Canvas Renderer)**：基于 \`CanvasRenderingContext2D\` 将运势文本、星图素材等组合渲染为可供分享的高清图片/海报。
- **多端分发与社交裂变模块 (Share & Virality)**：包含邀请码机制 (\`getRandomInviteCode()\`, \`acceptInvite()\`) 与 \`UniShare\` 功能，支持一键分享至微信朋友圈与微信群。
- **广告变现与流量管控模块 (Ads Manager)**：集成穿山甲/优量汇/微信原生广告，实现激励视频解锁特定运势内容、关键路径全屏广告截流 (\`AdHelper\`, \`AdBase\`)。
- **用户体系与设备留存中心 (User & Analytics)**：包含多端统一登录（目前使用 \`uni-id-co\`，计划重构为标准 JWT）、微信静默授权 (\`WeixinServer\`) 以及基于设备指纹的留存漏斗统计 (\`deviceRetentionFillDayly\`)。

## 角色与权限划分 (RBAC)
- **普通访客 (Guest)**：仅可浏览基础公开运势，受限于频控。
- **注册用户 (User)**：可生成并保存专属星盘海报，参与邀请裂变。观看广告后可解锁深度运势解读。
- **系统管理员 (Admin)**：管理配置参数（如广告位 ID，裂变返利规则），查看数据大盘（DAU、留存统计）。
`
  },
  {
    name: 'project-smxingzuoai-tech-stack.md',
    content: `---
tags: [技术架构, smxingzuoai]
alwaysApply: false
description: 当需要确定 smxingzuoai 项目的前后端框架、依赖管理、分发渠道或 CI/CD 选型时触发
---

# 技术栈选型 (Tech Stack)

## 前端架构 (Frontend)
- **框架选型**：\`uni-app\` (基于 Vue 3 组合式 API)。必须保留现有多端（小程序、H5、App）编译分发能力。
- **核心引擎**：原生 \`CanvasRenderingContext2D\` 进行海报与图形渲染。
- **网络层**：计划剥离 \`uniCloud.callFunction\`，重构为封装统一拦截器的 HTTP Request Adapter (\`uni.request\` 或 \`luch-request\`)，直连私有后端。

## 后端架构 (Backend - 私有化重构方向)
- **框架选型**：推荐使用 \`Node.js\` 体系（如 \`NestJS\`, \`Express\` 或 \`Hono\`）以最大程度复用原有 JavaScript 云函数业务代码（如 \`Calendar\` 算法）。
- **鉴权方案**：自研基于 \`JWT (JSON Web Token)\` 与 \`Passport.js\` 的标准认证策略，自行对接微信 \`code2Session\`，彻底弃用 \`uni-id-co\`。
- **数据访问层**：\`Prisma ORM\` 作为唯一事实来源 (SSOT)，实现 Context as Code 的结构管理。

## 部署与基建 (Infrastructure)
- **数据库选型**：\`PostgreSQL\` 或 \`MySQL\`，全面替换原有的 \`uniCloud\` 托管 MongoDB。
- **部署方式**：后端代码 \`Docker\` 化 (\`Dockerfile\`)，部署于私有云服务器（如阿里云轻量应用服务器或本地物理机），配置 Nginx 反向代理与 HTTPS。
- **统计大盘**：弃用 \`uni-stat\`，转为后端自建埋点接收接口 (\`POST /api/v1/track/event\`) 与轻量级数据聚合视图。
`
  }
];

rules.forEach(rule => {
  fs.writeFileSync(path.join(rulesDir, rule.name), rule.content, 'utf-8');
});

console.log('Successfully wrote 4 smxingzuoai project rules to aictx-meta-repo.');