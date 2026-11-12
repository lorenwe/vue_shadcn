# 系统管理 / 多语言管理

状态：已完成列表、`/language/list`、新增 / 编辑 / 删除
（`/language/add`、`/language/edit`、`/language/del`）以及表头多语言。

## 目录结构

```text
src/pages/system/internationalization/
├─ index.vue                   列表页（新增、编辑、删除、搜索、展开/收起、刷新）
├─ components/table.vue        树形表格展示组件（点击整行展开/收起）
├─ components/form-sheet.vue   新增 / 编辑抽屉表单
├─ use-page-text.ts            页面文案 tr()：接口优先，缺失回退
├─ data.ts                     后端树 → 展示节点、父级选项、搜索过滤、计数
├─ types.ts                    模块级类型预留
└─ README.md
```

## 接口

### 列表

- 地址：`POST /api/language/list`（`API_BASE_URL` 已带 `/api` 前缀，代码中写作 `/language/list`）
- 响应外层：`{ code, message, data }`，`code === 200` 为成功
- `data`：树形词条数组，字段包括
  `id`、`parent_id`、`name`、`sort`、`zhCN`、`enUS`、`jaJP`、`zhTW`、`children`
- API 封装：`src/api/i18n/i18n.ts` 的 `fetchLanguageListApi`
- 响应校验：`src/api/i18n/types.ts` 的 `LanguageListResponseSchema`

### 新增 / 编辑 / 删除

| 操作 | 方法 | 地址 |
|---|---|---|
| 新增 | POST | `/language/add` |
| 编辑 | POST | `/language/edit` |
| 删除 | POST | `/language/del` |

- 提交字段与后端 Java `SysLanguage` 对齐：
  `parentId`、`name`、`sort`、`zhCN`、`enUS`、`jaJP`、`zhTW`、`remark`；
  编辑时额外提交 `id`。
- `id`、`createBy`、`updateBy` 由后端生成，表单不提交。
- 删除请求同时携带 `?id=` 查询参数和 body `{ id }`，兼容
  `@RequestParam` / `@RequestBody` 两种后端写法。
- **删除限制**：只有叶子节点可删除。存在子节点时删除按钮禁用并提示
  「请先删除该节点的所有子节点」；前端 `askDelete()` 也会再次校验。
  后端仍应做最终校验。
- 保存 / 删除成功后：重新拉取 `/language/list` 刷新列表，并重新拉取
  `/language/allLocales` 更新运行时语言包。

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
  的 `isLogin` 分支），页面只用 `t()` / `tr()` 取词条；**不把业务页文案写进**
  `src/plugins/i18n/lang/*.json`，那些静态文件只服务未登录页面。
- 表头直接使用后端已有词条：
  `pages.system.internationalization.name`、`.zh-CN` / `.en-US` / `.ja-JP` /
  `.zh-TW`，排序列使用 `global.table.sort`，操作列使用 `global.table.operation`。
- 页面 chrome、表单、确认弹窗文案使用 `pages.system.internationalization.*` 键；
  接口暂未提供时，通过 `te()` 检测并回退默认文案/符号（加载 `…`、空数据 `—`）。
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

- [ ] 权限点与后端接口对齐
- [ ] 支持移动节点（当前编辑时父级只读，避免改变整棵 key 前缀）
