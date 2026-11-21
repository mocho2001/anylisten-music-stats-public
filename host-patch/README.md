# 宿主补丁说明

本目录包含为 Any Listen 宿主程序（`app.asar`）应用补丁的脚本与文档，用于启用 Music Stats 扩展所需的 Player API 暴露与 Dashboard iframe 注入功能。

---

## ⚠️ 重要警告

> **修改宿主程序属于高风险操作，可能导致：**
> - Any Listen 无法启动
> - 签名验证失败（触发完整性检查）
> - 自动更新覆盖补丁
> - 官方不提供技术支持
>
> **普通用户请直接使用预构建的稳定基线包（`AnyListen-beta5-MusicStats-Dashboard-Fix-v10.app.asar`），无需自行打补丁。**
>
> 本目录面向：扩展开发者、安全研究员、想了解技术原理的高级用户。

---

## 补丁原理

Music Stats 扩展需要宿主提供两项能力，官方 0.10.1-beta.5 默认**不提供**：

1. **Player API 暴露**：扩展需通过 `api.player` 访问播放器实例（获取当前轨道、播放状态、注册事件监听）
2. **Dashboard iframe 注入**：扩展需在设置页面注入自定义 HTML 面板，并与主进程建立 `postMessage` 通信通道

补丁通过修改 `app.asar` 内部的 JavaScript 源码，在合适的生命周期节点注入上述能力。

---

## 目录结构

```
host-patch/
├── README.md                 # 本文件
├── patch_host.py             # 核心补丁脚本（Python）
├── patches/                  # 补丁片段目录（按功能拆分）
│   ├── player-api-expose.js  # Player API 暴露补丁
│   ├── dashboard-inject.js   # Dashboard iframe 注入补丁
│   └── message-bridge.js     # 消息桥接补丁
├── scripts/
│   ├── extract_asar.py       # 解包 app.asar
│   ├── repack_asar.py        # 重打包 app.asar
│   └── verify_patch.py       # 补丁验证脚本
└── VERIFY.txt                # v10 基线验证记录
```

---

## 核心补丁点详解

### 1. Player API 暴露 (`patches/player-api-expose.js`)

**目标**：在扩展 API 命名空间注入 `player` 对象。

**注入位置**：扩展 API 初始化完成后、扩展加载前。

```javascript
// 伪代码示例
api.player = {
  getCurrentTrack: () => ({ /* 当前轨道信息 */ }),
  getPlaybackState: () => 'playing' | 'paused' | 'stopped' | 'buffering',
  on: (event, handler) => { /* 注册事件监听 */ },
  off: (event, handler) => { /* 移除事件监听 */ },
};
```

**关键事件**：
- `play` - 开始/恢复播放
- `pause` - 暂停
- `musicChanged` - 切歌（含手动切歌、列表结束自动下一首）
- `ended` - 单曲自然播放结束
- `error` - 播放错误

### 2. Dashboard iframe 注入 (`patches/dashboard-inject.js`)

**目标**：在设置页面的“听歌统计”菜单项点击时，动态创建并显示 iframe 面板。

**注入位置**：设置页面侧边栏菜单渲染逻辑、路由处理。

```javascript
// 伪代码示例
function injectDashboardPanel() {
  const iframe = document.createElement('iframe');
  iframe.src = 'als-dashboard://panel'; // 自定义协议，由扩展拦截处理
  iframe.style.cssText = 'width:100%;height:100%;border:none;';
  iframe.id = 'als-stats-dashboard';
  panelContainer.appendChild(iframe);
  
  // 建立通信桥接
  window.__alsStatsMessageHandler = (event) => {
    if (event.source !== iframe.contentWindow) return;
    // 处理 ALS_IMPORT 等消息
  };
  window.addEventListener('message', window.__alsStatsMessageHandler);
}
```

### 3. 消息桥接 (`patches/message-bridge.js`)

**目标**：实现扩展主进程 ↔ Dashboard iframe 双向通信。

**协议规范**：

| 方向 | 消息类型 | payload | 说明 |
|------|----------|---------|------|
| 扩展 → Dashboard | `ALS_REFRESH` | 无 | 请求 Dashboard 重新渲染 |
| 扩展 → Dashboard | `ALS_DATA` | Store 对象 | 推送完整统计数据 |
| Dashboard → 扩展 | `ALS_IMPORT` | Store 对象 | 用户在 Dashboard 导入数据 |

**安全校验**：
```javascript
// 仅接受来自自家 iframe 的消息
if (event.source !== dashboardIframe.contentWindow) return;
// 仅处理已知类型
if (!['ALS_REFRESH', 'ALS_DATA', 'ALS_IMPORT'].includes(event.data?.type)) return;
```

---

## 使用方法（开发者）

### 环境准备
```bash
# Python 3.8+
# asar 包工具
npm install -g @electron/asar
```

### 补丁流程
```powershell
# 1. 准备原始 app.asar（Any Listen 0.10.1-beta.5 安装目录）
cp "C:\Program Files\Any Listen\resources\app.asar" ./original-app.asar

# 2. 运行补丁脚本
python patch_host.py --input ./original-app.asar --output ./patched-app.asar

# 3. 验证补丁
python scripts/verify_patch.py --asar ./patched-app.asar

# 4. 替换宿主文件（需管理员权限，建议备份原文件）
cp ./patched-app.asar "C:\Program Files\Any Listen\resources\app.asar"
```

### 参数说明
```bash
python patch_host.py --help
# --input: 原始 app.asar 路径
# --output: 补丁后输出路径
# --patches-dir: 补丁片段目录（默认 ./patches）
# --backup: 是否备份原文件（默认 true）
# --verify: 补丁后自动运行验证（默认 true）
```

---

## v10 稳定基线验证记录

见 `VERIFY.txt`，包含：
- 原始 `app.asar` SHA256
- 补丁后 `app.asar` SHA256
- 关键函数偏移量校验
- 功能验收清单（17 项全部通过）

---

## 适配新版本宿主（版本工作流）

当 Any Listen 发布新版本时，**严禁直接复用旧补丁**。必须按《版本工作流规范》（`../docs/development/VERSION_WORKFLOW.md`）执行：

1. **获取新版原始 app.asar**
2. **差异审计**：`python scripts/diff_audit.py --old v10-baseline.asar --new new-version.asar --report reports/host-diff-and-audit.md`
3. **影响分析**：确定哪些补丁点受影响、是否需要新增补丁点
4. **制定方案**：最小化修改，输出补丁计划
5. **用户确认**：方案经用户确认后方可实施
6. **实施补丁**：更新 `patches/` 下对应片段
7. **全量检查**：JS 语法、TS 类型、构建、清单、归档结构、完整性
8. **用户实测**：真实环境验收
9. **验收通过**：合并稳定分支、打 Tag、同步公开仓库

---

## 常见问题

### Q: 补丁后 Any Listen 无法启动/闪退？
**A:** 检查：
- 原始 `app.asar` 版本是否为 0.10.1-beta.5
- 补丁脚本是否报错（查看控制台输出）
- 是否破坏了关键语法（如漏掉分号、括号不匹配）
- 运行 `python scripts/verify_patch.py` 诊断

### Q: 扩展提示“Player API 不可用”？
**A:** 补丁未生效或注入位置错误。检查：
- `api.player` 是否在扩展加载前就绪
- 控制台是否有 `api.player` 相关报错

### Q: Dashboard 白屏/不显示数据？
**A:** 通信桥接故障。检查：
- `window.__alsStatsMessageHandler` 是否注册
- iframe `src` 协议是否被扩展正确拦截
- `ALS_DATA` 消息是否成功发送到 iframe

### Q: Any Listen 更新后补丁失效？
**A:** 官方更新会覆盖 `app.asar`。需重新对新版本执行完整版本工作流。**不支持增量热补丁**。

---

## 安全与合规

- **不分发修改后的 app.asar**：公开仓库仅提供补丁脚本、差异文件、操作说明
- **不包含 Any Listen 专有代码**：补丁片段仅含注入逻辑，不含宿主业务代码
- **用户自担风险**：应用补丁即表示接受可能导致的软件不稳定、数据丢失、安全风险
- **遵守当地法律**：逆向工程、修改商业软件在某些司法管辖区可能受限

---

## 相关文档

- [版本工作流规范](../docs/development/VERSION_WORKFLOW.md)
- [安装指南](../docs/INSTALLATION.md)
- [插件源码说明](../plugin/README.md)
- [v10 基线功能文档](../docs/FEATURES.md)

---

*文档版本：1.0 | 更新日期：2026-11-21 | 适用基线：v10*