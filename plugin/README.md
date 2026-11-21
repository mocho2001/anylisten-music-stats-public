# Music Stats 插件源码

Any Listen Music Stats 扩展的核心源码目录。

---

## 目录结构

```
plugin/
├── src/
│   └── index.ts          # 主入口（428 行，含全部核心逻辑）
├── build.ps1             # PowerShell 构建脚本
├── tsconfig.json         # TypeScript 配置
├── .env.example          # 环境变量示例（签名密钥配置）
└── package.json          # 依赖配置（若存在）
```

---

## 核心模块说明 (`src/index.ts`)

### 版本与常量
```typescript
const PLUGIN_VERSION = '1.2.0';
const THRESHOLD = 30_000;        // 有效播放阈值：30 秒
const MAX_SESSIONS = 20_000;     // 最大会话记录数
const STORE_KEY = 'music-stats/data-v2.json';
```

### 数据结构 (Store v2)
```typescript
interface Track {
  id: string;
  name: string;
  singer: string;
  album?: string;
  totalSeconds: number;
  playCount: number;
  lastPlayedAt: number;
  firstPlayedAt: number;
}

interface Session {
  key: string;
  songId: string;
  songName: string;
  artist: string;
  album?: string;
  startedAt: number;
  endedAt: number;
  seconds: number;
  source?: string;
}

interface Store {
  version: 2;
  tracks: Record<string, Track>;
  sessions: Session[];
  totalSeconds: number;
  validPlays: number;
}
```

### 核心功能函数

| 函数 | 说明 |
|------|------|
| `getStore()` / `saveStore()` | 存储读写封装 |
| `normalizeImportedStore()` | 导入数据标准化、校验、去重 |
| `mergeStore()` | 智能合并（tracks/sessions 去重策略） |
| `exportCSV()` | CSV 导出 |
| `generateDashboardHTML()` | 生成 Dashboard 完整 HTML |
| `handlePlayerEvents()` | Player 事件监听与状态同步 |
| `syncCurrentTrack()` | 启动/切歌时同步当前播放轨道 |

### 注册的命令
| 命令 ID | 面板入口 | 说明 |
|---------|----------|------|
| `music-stats` | 设置菜单/扩展卡片 | 打开统计面板 |
| `music-stats-diagnose` | 面板内部 | 诊断当前状态 |
| `music-stats-dashboard` | 面板内部 | 渲染 Dashboard |
| `music-stats-export-json` | 数据管理标签页 | JSON 备份 |
| `music-stats-import-json` | 数据管理标签页 | JSON 恢复（覆盖） |
| `music-stats-merge-json` | 数据管理标签页 | JSON 合并 |
| `music-stats-export-csv` | 数据管理标签页 | CSV 导出 |
| `music-stats-reset` | 数据管理标签页 | 重置所有数据 |

### Player API 交互
```typescript
// 获取 Player 实例
const player = api.player;

// 当前轨道索引（注意：是 playInfo.info.index，不是 playInfo.index）
const currentIndex = playInfo.info.index;

// 播放状态
const state = player.getPlaybackState(); // 'playing' | 'paused' | 'stopped' | 'buffering'

// 事件监听
player.on('play', handler);
player.on('pause', handler);
player.on('musicChanged', handler);
player.on('ended', handler);
```

### Dashboard 通信协议
iframe 与插件主进程通过 `postMessage` 通信：

```typescript
// 插件 → Dashboard
{ type: 'ALS_DATA', payload: Store }
{ type: 'ALS_REFRESH' }

// Dashboard → 插件
{ type: 'ALS_IMPORT', payload: Store }
```

安全措施：
- `window.__alsStatsMessageHandler` 单例监听器
- 仅接受 `event.source === dashboardIframe.contentWindow` 的消息

---

## 构建流程

### 前置要求
- Node.js 18+
- pnpm
- 有效的签名密钥对（`.env` 中配置 `PRI_KEY`、`PUB_KEY`）

### 构建命令
```powershell
cd plugin
.\build.ps1
```

### 构建产物
```
plugin/
├── dist/              # 解包后的扩展文件（开发调试用）
│   ├── manifest.json
│   ├── index.js
│   └── dashboard.html
└── build/
    └── AnyListen-Music-Stats-v{version}.alix  # 可安装的签名扩展包
```

### 构建脚本关键步骤 (`build.ps1`)
1. 清理旧产物
2. TypeScript 编译 (`tsc`)
3. 复制静态资源（manifest.json、dashboard.html 等）
4. 使用 `extension-kit` 打包签名生成 `.alix`
5. 校验产物完整性

---

## 开发调试

### 热重载开发
```powershell
# 监听模式编译
npx tsc -w
```
在 Any Listen 扩展页面启用“开发者模式”，加载 `plugin/dist` 目录即可热重载测试。

### 常用调试命令
```typescript
// 控制台执行：查看当前 Store
api.storage.get('music-stats/data-v2.json')

// 控制台执行：手动触发统计刷新
api.commands.execute('music-stats-diagnose')
```

---

## 关键技术约束（修改前必读）

> ⚠️ 以下逻辑为**稳定基线 v10 核心不可变量**，任何修改必须经差异审计、用户实测验收：

1. **30 秒阈值** - `THRESHOLD = 30_000`，统计有效播放的硬性门槛
2. **Player API 来源** - `api.player`，不可改用其他路径
3. **当前轨道索引** - `playInfo.info.index`，不是 `playInfo.index`
4. **启动同步** - 插件加载时必须同步已播放轨道
5. **切歌同步** - `musicChanged` 事件必须结束上一会话、开始新会话
6. **数据兼容** - `data-v2.json` 格式不可破坏，必须兼容 v1 迁移
7. **CSV/JSON 导出** - 格式不可随意变更，外部工具可能依赖
8. **Dashboard iframe 通信** - `ALS_REFRESH`/`ALS_DATA`/`ALS_IMPORT` 协议固定
8. **消息来源校验** - 必须验证 `event.source === iframe.contentWindow`

---

## 依赖说明

| 依赖 | 版本 | 用途 | 许可证 |
|------|------|------|--------|
| `extension-kit` | ^1.x | 扩展打包、签名、清单生成 | Apache-2.0 |
| `any-listen-extension-lx-api-source-loader` | ^1.x | 类型定义、API 加载器 | Apache-2.0 |
| `typescript` | ^5.x | 编译 | Apache-2.0 |

> 完整依赖树见 `package.json`（若存在）或构建时 `pnpm install` 产生的 `pnpm-lock.yaml`。

---

## 相关文档

- [安装指南](../docs/INSTALLATION.md#方式二从源码构建安装开发者高级用户)
- [配置说明](../docs/CONFIGURATION.md#可通过代码调整的参数需重新构建)
- [版本工作流规范](../docs/development/VERSION_WORKFLOW.md)
- [宿主补丁说明](../host-patch/README.md)

---

*文档版本：1.0 | 更新日期：2026-11-21 | 对应插件版本：1.2.0 (v10 基线)*