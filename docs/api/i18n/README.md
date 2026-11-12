# 多语言接口数据（AI / 开发参考）

本目录存放两套**不同用途**的多语言接口快照。先看结论，再按需读取：

| 用途 | 接口 | 快照文件 | 谁用 |
|---|---|---|---|
| 页面运行时文案 / Agent 查翻译 | `POST /language/allLocales` | `language-pack.full.json` | **Agent 写多语言文案时唯一数据源** |
| 多语言管理页增删改查 | `POST /language/list` | `language-list.full.json` | 管理页、接口联调 |

> ⚠️ 硬性规则：**Agent 需要多语言文案时，只使用 `/language/allLocales` 的快照
> （`language-pack.full.json`），不要用 `/language/list` 的词条树自己拼 key。**
> 两者结构不同：前者是 `locale → key → 文案` 的扁平映射，后者是管理页用的树形记录。

⚠️ 这些 JSON 都不是运行时数据源：页面运行时仍然通过接口获取，不要把这里的文件
import 进 `src/` 业务代码，否则会把整份语言数据打进前端产物。

## 文件说明

| 文件 | 内容 | 大小（约） | 建议读取方式 |
|---|---|---|---|
| `language-pack.sample.json` | allLocales 精简样例（代表性 81 个 key） | 21 KB | AI 优先读，了解 key 格式 |
| `language-pack.full.json` | allLocales 完整快照（198 个 key，zh-CN 覆盖 174 个） | 43 KB | 用 `jq` 定向查 key，不要整份读 |
| `language-pack.meta.json` | 快照来源与生成时间 | < 1 KB | 确认是否为真实接口数据 |
| `language-list.sample.json` | `/language/list` 精简样例（2 个根节点） | 8 KB | 只看管理页数据结构时读 |
| `language-list.full.json` | `/language/list` 完整响应（8 根 / 202 节点） | 155 KB | 管理页开发/联调，用 `jq` 查 |

## 接口 1：`POST /language/allLocales`（运行时文案）

- 认证：`Authorization: Bearer <token>`
- 成功响应：

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "zh-CN": { "pages.system.menu-management.name": "菜单名称" },
    "en-US": { "pages.system.menu-management.name": "Menu Name" },
    "ja-JP": {},
    "zh-TW": {}
  }
}
```

- `data` 是 `locale → key → 文案` 的扁平映射，locale 固定为
  `zh-CN` / `en-US` / `ja-JP` / `zh-TW`。
- **key 规则**：语言词条树按 `name` 用 `.` 连接。例如树
  `pages → system → menu-management → name` 对应
  `pages.system.menu-management.name`（已用 `src` 中的 `t()` 调用验证）。
- 缺失翻译（`null`）不会写入对应 locale 的对象；运行时由 `vue-i18n`
  的 `fallbackLocale` 兜底。
- 运行时加载链路：
  `src/plugins/i18n/setup.ts` → `fetchLanguagePack()`
  （`src/api/i18n/i18n.ts`）→ `useI18nLoader().loadLocaleMessages()`
  → 与 `src/plugins/i18n/lang/*.json` 内置包 `deepMerge` 后
  `i18n.global.setLocaleMessage()`。
- `allLocales` 主要覆盖后端管理的业务词条（`pages.*`、`menu.*`、`global.*`、
  `components.*` 等）；`login.*`、`common.*`、`tabs.*` 等基础文案目前在
  `src/plugins/i18n/lang/*.json` 内置包中，仅供未登录场景，远端加载后会合并覆盖。
- 前端页面自身的 UI 文案键（如
  `pages.system.internationalization.pageTitle`、`searchPlaceholder`）也应维护在
  后端语言表中，登录后由 `allLocales` 下发；不要写进内置静态文件。
  接口暂缺该键时，页面用默认文案兜底。
- 类型契约：`src/api/i18n/types.ts` 的 `LanguagePackSchema`。

**Agent 用法**：把 `language-pack.full.json` 当作翻译字典。写页面前先查
所需 key 是否已存在；存在就复用，不存在再按命名空间新增。

## 接口 2：`POST /language/list`（管理页数据）

- 返回树形词条（`id` / `parent_id` / `name` / `sort` / `zhCN` / `enUS` /
  `jaJP` / `zhTW` / `children`），供多语言管理页展示与编辑。
- 与运行时语言包是**同一份数据的不同视图**：`allLocales` 是扁平 key，`list`
  是管理树；不要用 `list` 的节点自己拼接 UI 文案 key。
- 页面与请求：`src/pages/system/internationalization/`、
  `src/api/i18n/i18n.ts` 的 `fetchLanguageListApi()`。

## 当前快照来源

- `language-pack.full.json` 目前是**从 `language-list.full.json` 离线派生**的
  （见 `language-pack.meta.json` 的 `source: "derived-from-list"`），
  因为抓取时后端未启动。
- 派生规则与真实接口的 key 规则一致，并已用 `pages.system.menu-management.name`、
  `global.table.operation` 等页面实际使用的 key 验证。
- 后端可用后，建议运行 `scripts/fetch-language-pack.mjs` 用真实接口响应覆盖，
  `meta.json` 会变为 `source: "allLocales"`。在覆盖前，把当前文件视为
  **结构可信、内容可能滞后**的参考。

## 刷新快照

```bash
# 1) 权威方式：直接抓 /language/allLocales
API_BASE_URL=http://localhost:3333/api API_TOKEN=xxx node scripts/fetch-language-pack.mjs

# 2) 离线重建：从 language-list.full.json 派生（同时重建 sample）
node scripts/build-language-pack-from-list.mjs

# 3) 刷新管理页列表快照
API_BASE_URL=http://localhost:3333/api API_TOKEN=xxx node scripts/fetch-language-list.mjs
```

PowerShell 写法：

```powershell
$env:API_BASE_URL='http://localhost:3333/api'; $env:API_TOKEN='xxx'
node scripts/fetch-language-pack.mjs
```

## AI Agent 读取建议

1. 先读本 README 和 `language-pack.sample.json`，不要直接读 `language-list.full.json`。
2. **查 key 的顺序**：
   1. 先查 `language-pack.full.json`（后端 `allLocales` 快照）；
   2. 找不到时再查 `src/plugins/i18n/lang/zh_cn.json` 等内置包
      （`login.*`、`common.*`、`tabs.*` 等基础文案在这里）。
3. 某个 key 在某个 locale 下缺失，表示该语言未翻译；运行时由 `vue-i18n`
   回退到 `fallbackLocale`（默认 `zh-CN`），不要把它当成数据错误。
4. 查某个 key 的翻译：

```bash
jq -r '.data["zh-CN"]["pages.system.menu-management.name"]' \
  docs/api/i18n/language-pack.full.json
```

5. 查某个 key 在四种语言下的值：

```bash
jq -r '.data | to_entries[] | "\(.key): \(.value["pages.system.menu-management.name"] // "-")"' \
  docs/api/i18n/language-pack.full.json
```

6. 列出所有可用 key：

```bash
jq -r '.data["zh-CN"] | keys[]' docs/api/i18n/language-pack.full.json
```

7. 没有安装 `jq` 时，用 Node 等价查询：

```bash
# 查单个 key
node -e "const p=require('./docs/api/i18n/language-pack.full.json');console.log(p.data['zh-CN']['pages.system.menu-management.name'])"

# 列出所有 key
node -e "const p=require('./docs/api/i18n/language-pack.full.json');console.log(Object.keys(p.data['zh-CN']).join('\n'))"
```

8. 如果只需要样例级别的信息，读 `language-pack.sample.json` 即可；
   需要准确、完整的 key 集合时再查 `full.json`。

## 为什么放在 `docs/` 而不是 `src/` 或 `public/`

- 放 `src/`：容易被业务代码 import，导致语言数据进入打包产物。
- 放 `public/`：会被原样发布到线上，等于公开语言数据。
- 放 `docs/`：只服务开发与 AI，不参与构建；配合根目录 `AGENTS.md` 可被 Agent 稳定发现。
