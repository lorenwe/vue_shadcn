# AGENTS.md

本文件给在此仓库工作的 AI Agent 提供最少必要上下文。修改代码前请先读相关业务文件。

## 技术栈

Vue 3.5 + TypeScript + Vite 8 + Pinia（持久化）+ vue-router 5 + vue-i18n 11
+ Tailwind 4 + shadcn-vue（reka-ui）+ TanStack Query / Table / Form
+ zod + vee-validate + ofetch。包管理器：pnpm。

## 常用命令

```bash
pnpm dev        # 开发服务器（端口 3333，代理 /api → http://localhost:8080）
pnpm build      # vue-tsc -b && vite build
pnpm preview    # 预览 dist
```

## 目录约定

- 页面：`src/pages/<域>/<模块>/index.vue`，模块内组件放 `components/`，
  派生数据/工具放 `data.ts`。
- 接口：`src/api/<域>/<name>.ts` 负责请求，`types.ts` 用 zod 定义 schema；
  统一走 `useApiFetch` + `parseApiResponse`。
- 路由：`src/router/route-mapping.ts` 维护 path → 组件映射；实际路由由后端菜单
  动态注册，新增页面需同时存在后端菜单叶子节点。
- 别名：`@` → `src`；Vue API、常量、`src/components` 下的组件为自动导入。

## 多语言数据（重要）

- **运行时语言包**：`POST /api/language/allLocales`，初始化时由
  `src/plugins/i18n/setup.ts` → `fetchLanguagePack()` 加载并合并进 `vue-i18n`。
- **Agent 写多语言文案时，业务/页面 key 以该接口快照为准**：
  `docs/api/i18n/language-pack.full.json`
  - 先读 `docs/api/i18n/README.md` 与 `language-pack.sample.json`；
  - 需要查具体 key 时用 `jq`（未安装则用 README 里的 Node 命令）查
    `language-pack.full.json`，不要整份读入上下文；
  - 基础文案（`login.*`、`common.*`、`tabs.*` 等）在
    `src/plugins/i18n/lang/*.json` 内置包中，仅供未登录场景；
  - 前端页面自身的 UI 文案键（如
    `pages.system.internationalization.pageTitle`）应维护在后端语言表中，
    登录后由 `/language/allLocales` 下发；**不要**写进内置静态文件；
    接口暂缺该键时，页面用默认文案兜底；
  - key 规则：词条树按 `name` 用 `.` 连接（如 `pages.system.menu-management.name`）。
- **`/language/list` 是管理页数据**（树形记录），只用于
  `src/pages/system/internationalization/` 的展示与增删改查；
  不要用它拼 UI 文案 key。
- 类型契约：
  - 语言包：`src/api/global/types.ts`（`LanguagePackSchema`）；
  - 管理列表：`src/api/system/internationalization/types.ts`
    （`LanguageListResponseSchema`）。
- 快照刷新脚本：
  - `scripts/fetch-language-pack.mjs`：从 `/language/allLocales` 抓取（权威）；
  - `scripts/build-language-pack-from-list.mjs`：后端不可用时从
    `language-list.full.json` 离线重建；
  - `scripts/fetch-language-list.mjs`：刷新管理页列表快照。

## 注意事项

- 不要把 `docs/api/i18n/*.json` import 进 `src/`，否则语言数据会进入打包产物。
- 新增接口先补 zod schema，再用 `parseApiResponse` 解析，保持错误处理一致。
- 页面文案为空时统一显示 `-`；翻译字段允许 `null`。

## 已知构建问题（与业务改动无关）

- `vue-tsc -b` 在多个历史文件中有未使用变量报错（TS6133）。
- `vite build` 会在 `src/pages/errors/404.vue` 的 `<route lang="yaml">` 块上报
  `MISSING_EXPORT`（Vite 8.0.16 与 vite-plugin-vue-layouts 0.11 的兼容问题）。
  临时移除该块可构建通过；修复前不要把它当成新代码引入的问题。
