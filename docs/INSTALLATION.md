# 安装指南

本文档提供 Any Listen Music Stats 扩展的详细安装步骤。

## ⚠️ 重要免责声明

> **本项目全程由 AI 构建生成，未经过专业安全审计与完整测试流程。**
> 
> 可能存在严重漏洞、Bug、数据丢失风险、兼容性问题或未预期的行为。**请务必谨慎使用，生产环境或重要数据场景下建议先在测试环境验证。**
> 
> 使用即表示您理解并接受上述风险。如因使用本扩展导致任何数据损坏、软件异常或其他损失，作者不承担任何责任。

## 系统要求

| 组件 | 要求 |
|------|------|
| 操作系统 | Windows 10 (1909+) / Windows 11 |
| Any Listen | 0.10.1-beta.5（当前稳定基线适配版本） |
| 运行时 | Any Listen 内置 Electron 运行时 |
| 构建工具（可选） | Node.js 18+、pnpm（仅源码构建需要） |

## 核心安装逻辑说明

> **本扩展采用「宿主补丁 + 扩展包」双层架构：**
> - **宿主补丁 (`app.asar` 替换)**：注入 Dashboard 页面、暴露 Player API、建立 iframe 通信桥接，**这是使用统计面板的前置条件，必须执行**。
> - **扩展包 (`.alix` 安装)**：提供统计记录逻辑、数据管理、导入导出、设置面板等核心功能，**配合宿主补丁使用**。
> 
> 仅安装扩展包不替换 `app.asar` → 无 Dashboard 面板、无 Player API、无法统计
> 仅替换 `app.asar` 不安装扩展包 → 有 Dashboard 页面但无数据记录、无管理功能
> 
> **两者缺一不可，请按顺序完成步骤一和步骤二。**

## 安装方式

### 步骤一：替换宿主 app.asar (必须，高风险操作，请谨慎操作)

> ⚠️ **必须步骤**：扩展功能依赖宿主层面的 Dashboard 页面注入与 Player API 暴露，**必须替换 `app.asar` 才能使用本扩展的统计面板功能**。
> 
> ⚠️ **高风险操作**：替换宿主核心文件可能导致 Any Listen 无法启动、数据丢失或其他不可预期问题。请务必先完整备份原版 `app.asar`，并确认您具备恢复能力。

1. **完全退出 Any Listen**，并在任务管理器确认进程已结束。
2. **备份** 安装目录下的 `resources/app.asar`（例如重命名为 `app.asar.before-v10.bak`）。
   - 默认路径：`C:\Program Files\Any Listen\resources\app.asar`
3. 从 Release 下载 `AnyListen-beta5-MusicStats-Dashboard-Fix-v10.app.asar`，**重命名为 `app.asar`** 后替换安装目录下的 `resources/app.asar`。
4. **保留用户数据目录**，不要删除统计数据库（`music-stats/data-v2.json`）。
5. 重启 Any Listen，在设置中进入"听歌统计"面板查看图形化统计界面。
6. 如果仍无法启动，**立即退出并恢复备份**的原版 `app.asar`。
7. **本文件需要使用对应版本的软件**：Any Listen 0.10.1-beta.5。

---

### 步骤二：安装扩展包 (必须，配合步骤一使用)

> ⚠️ **必须步骤**：完成步骤一替换 `app.asar` 后，**必须安装本扩展包** 以启用统计记录、数据管理、导入导出等核心功能。仅替换 `app.asar` 无法记录播放数据。

1. 从 [Releases](https://github.com/mocho2001/anylisten-music-stats-public/releases) 下载 `anylisten_music_stats_v1.2.4.alix`
2. 打开 Any Listen，进入 **设置 → 扩展**
3. 点击 **从本地安装**，选择下载的 `anylisten_music_stats_v1.2.4.alix` 文件
4. 安装完成后，在设置 → 扩展设置中找到 **AnyListen-Music-Stats** 即可看到图形化统计界面

#### 验证安装
- 面板正常打开，显示“听歌统计”标题
- 播放一首歌超过 30 秒，刷新面板应显示统计数据
- 点击各功能标签页（概览、排行、日历、历史、趋势、数据管理）均能正常切换

---

### 方法二：从源码构建安装（开发者/高级用户）

#### 1. 准备环境
```powershell
# 安装 Node.js (推荐使用 nvm-windows 管理版本)
# https://github.com/coreybutler/nvm-windows

# 安装 pnpm
npm install -g pnpm

# 验证版本
node --version  # >= 18.0.0
pnpm --version
```

#### 2. 获取源码
```powershell
git clone https://github.com/mocho2001/anylisten-music-stats-public.git
cd anylisten-music-stats-public/plugin
```

#### 3. 配置签名密钥
> ⚠️ **重要**：Any Listen 扩展系统要求扩展包必须签名。没有有效密钥无法构建可安装的 `.alix` 包。

```powershell
# 复制示例配置
copy .env.example .env

# 编辑 .env 文件，填入你的密钥
notepad .env
```

`.env` 文件内容格式：
```ini
# 使用 extension-kit 支持的 PEM 或 Base64 单行密钥
# 请勿将真实私钥提交或分享
PRI_KEY=你的PKCS8私钥内容（单行，支持 PEM 格式或 Base64）
PUB_KEY=你的SPKI公钥Base64内容（不要包含PEM头尾-----BEGIN PUBLIC KEY-----等）
```

**获取密钥的方式**：
- 如果你是扩展开发者，使用自己的签名密钥
- 如果没有密钥，**请使用方式一的预构建包**，不要尝试生成临时密钥（会导致安装失败或安全风险）

#### 4. 构建扩展包
```powershell
# 运行构建脚本
.\build.ps1
```

构建成功后，产物位于：
- `plugin/dist/` - 解包后的扩展文件（用于调试）
- `plugin/build/` - 打包后的 `.alix` 文件

#### 5. 安装构建产物
按方式一的步骤 2-4，选择构建生成的 `.alix` 文件安装。

---

## 常见安装问题

| 问题 | 原因 | 解决方法 |
|------|------|----------|
| 提示“扩展包签名无效” | 密钥不匹配或损坏 | 检查 `.env` 中 PRI_KEY/PUB_KEY 是否成对、格式正确；或使用官方预构建包 |
| 安装后不显示在扩展列表 | 安装未完成或版本不兼容 | 重启 Any Listen；确认 Any Listen 版本为 0.10.1-beta.5 |
| 点击“打开面板”无反应/空白 | 宿主版本不匹配 | 当前稳定基线仅适配 0.10.1-beta.5，其他版本需等待适配版本发布 |
| 播放歌曲不记录统计 | 未达到 30 秒阈值 | 连续播放同一首歌超过 30 秒后刷新面板 |
| 导入 JSON 报错“文件无效” | JSON 格式不符合规范 | 确认导入的是本扩展导出的 JSON，或符合 `data-v2.json` 结构 |

---

## 卸载扩展

1. 打开 Any Listen → 设置 → 扩展
2. 找到 **Music Stats**，点击 **禁用**
3. 点击 **卸载**（垃圾桶图标）
4. 确认卸载

> **数据保留**：卸载扩展**不会删除**本地统计数据（`music-stats/data-v2.json`）。重新安装后数据自动恢复。如需彻底清除数据，请在面板中使用 **重置** 功能（输入 RESET 确认）或手动删除存储目录下的 `music-stats` 文件夹。

---

## 更新扩展

### 预构建包用户
1. 下载新版本 `.alix`
2. 在扩展页面点击 **更新** 或重新 **从本地安装** 新包
3. Any Listen 会自动处理版本替换

### 源码构建用户
```powershell
cd anylisten-music-stats-public
git pull origin main
cd plugin
.\build.ps1
# 重新安装生成的新 .alix 包
```

---

## 数据目录位置

| 场景 | 路径 |
|------|------|
| 统计数据 | `%APPDATA%\Any Listen\music-stats\data-v2.json` |
| 旧版数据 | `%APPDATA%\Any Listen\music-stats\data-v1.json` |
| 导入前备份 | `%APPDATA%\Any Listen\music-stats\pre-import-<timestamp>.json` |

可在资源管理器地址栏直接粘贴 `%APPDATA%\Any Listen\music-stats\` 快速访问。

---

## 下一步

- 阅读 [配置说明](CONFIGURATION.md) 了解个性化设置
- 阅读 [数据与隐私](DATA-AND-PRIVACY.md) 了解数据处理详情
- 查看 [常见问题](FAQ.md) 解决使用中的疑问

---

*文档版本：1.0 | 更新日期：2026-11-21 | 适用版本：v10+*