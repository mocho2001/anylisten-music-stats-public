# 安装指南

本文档提供 Any Listen Music Stats 扩展的详细安装步骤。

## 系统要求

| 组件 | 要求 |
|------|------|
| 操作系统 | Windows 10 (1909+) / Windows 11 |
| Any Listen | 0.10.1-beta.5（当前稳定基线适配版本） |
| 运行时 | Any Listen 内置 Electron 运行时 |
| 构建工具（可选） | Node.js 18+、pnpm（仅源码构建需要） |

## 安装方式

### 方式一：预构建扩展包安装（推荐，最简单）

#### 1. 下载扩展包
- 访问 [GitHub Releases](https://github.com/mocho2001/anylisten-music-stats-public/releases)
- 下载最新版本的 `AnyListen-Music-Stats-v10.alix`（或对应版本文件名）

#### 2. 安装到 Any Listen
1. 打开 Any Listen 桌面客户端
2. 点击左下角 **设置** (齿轮图标)
3. 在左侧菜单选择 **扩展**
4. 点击右上角 **从本地安装** 按钮
5. 在文件选择对话框中，选择下载的 `.alix` 文件
6. 等待安装完成提示

#### 3. 启用扩展
1. 在扩展列表中找到 **Music Stats**
2. 点击 **启用** 开关（如未自动启用）
3. 点击扩展卡片的 **打开面板** 或 **设置**
4. 或在设置左侧菜单直接点击 **听歌统计** 入口

#### 4. 验证安装
- 面板正常打开，显示“听歌统计”标题
- 播放一首歌超过 30 秒，刷新面板应显示统计数据
- 点击各功能标签页（概览、排行、日历、历史、趋势、数据管理）均能正常切换

---

### 方式二：从源码构建安装（开发者/高级用户）

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