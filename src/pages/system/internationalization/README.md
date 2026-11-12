# 系统管理 / 多语言管理

状态：已完成列表页、`/language/list` 接口接入，以及页面文案与表头多语言；
新增 / 编辑 / 删除尚未实现。

## 目录结构

```text
src/pages/system/internationalization/
├─ index.vue              列表页（加载、搜索、展开/收起、刷新、错误重试）
├─ components/table.vue   树形表格展示组件
├─ data.ts                后端树 → 展示节点、搜索过滤、节点计数
├─ types.ts               模块级类型预留
└─ README.md
```

## 接口

- 地址：`POST /api/language/list`（`API_BASE_URL` 已带 `/api` 前缀，代码中写作 `/language/list`）
- 响应外层：`{ code, message, data }`，`code === 200` 为成功
- `data`：树形词条数组，字段包括
  `id`、`parent_id`、`name`、`sort`、`zhCN`、`enUS`、`jaJP`、`zhTW`、`children`
- API 封装：`src/api/i18n/i18n.ts` 的 `fetchLanguageListApi`
- 响应校验：`src/api/i18n/types.ts` 的 `LanguageListResponseSchema`

## 路由

已加入 `src/router/route-mapping.ts`：

```ts
{
  path: '/system/internationalization',
  component: () => import('@/pages/system/internationalization/index.vue'),
  meta: { title: '多语言管理', cacheName: 'Internationalization' }
}
```

项目使用后端菜单驱动的动态路由：还需后端菜单中存在 `/system/internationalization`
的叶子节点，路由才会在登录后被注册；否则该路径会回退到通用页面。

## 多语言

- 登录后语言数据来自 `POST /language/allLocales`（`src/plugins/i18n/setup.ts`
  的 `isLogin` 分支），页面只用 `t()` 取词条；**不把业务页文案写进**
  `src/plugins/i18n/lang/*.json`，那些静态文件只服务未登录页面。
- 表头直接使用后端已有词条：
  `pages.system.internationalization.name`、`.zh-CN` / `.en-US` / `.ja-JP` /
  `.zh-TW`，排序列使用 `global.table.sort`。
- 页面 chrome 文案使用 `pages.system.internationalization.*` 键；接口暂未提供时，
  通过 `te()` 检测并回退默认文案/符号（加载 `…`、空数据 `—`）。
- 建议在后端语言表补充以下键后，页面会随接口自动多语言：

| 键（`pages.system.internationalization.` 前缀） | zh-CN | en-US | ja-JP | zh-TW |
|---|---|---|---|---|
| `pageTitle` | 多语言管理 | Multilingual Management | 多言語管理 | 多語言管理 |
| `searchPlaceholder` | 搜索名称或翻译 | Search name or translation | 名前または翻訳を検索 | 搜尋名稱或翻譯 |
| `expandAll` | 全部展开 | Expand all | すべて展開 | 全部展開 |
| `collapseAll` | 全部收起 | Collapse all | すべて折りたたむ | 全部收合 |
| `refresh` | 刷新 | Refresh | 更新 | 重新整理 |
| `retry` | 重试 | Retry | 再試行 | 重試 |
| `loading` | 正在加载… | Loading… | 読み込み中… | 載入中… |
| `empty` | 暂无数据 | No data | データがありません | 暫無資料 |
| `summary` | 共 {total} 个词条，{leaf} 个叶子节点 | {total} entries, {leaf} leaf nodes | {total} 件のエントリ、{leaf} 件のリーフノード | 共 {total} 個詞條，{leaf} 個葉子節點 |
| `expand` | 展开 | Expand | 展開 | 展開 |
| `collapse` | 收起 | Collapse | 折りたたむ | 收合 |

- 表头由 `columns` computed 在 `locale` 变化时重建，保证表头跟随语言切换；
  不会出现只刷新正文、表头仍是旧语言的情况。

## 待实现

- [ ] 新增 / 编辑 / 删除词条（待确认后端接口；保存成功后重新拉取
  `/language/allLocales` 并刷新本地语言包）
- [ ] 权限点与后端接口对齐
