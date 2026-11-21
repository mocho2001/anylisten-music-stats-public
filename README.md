# Any Listen Music Stats

一个面向 **Any Listen 桌面音乐播放器** 的第三方本地听歌统计扩展项目。

## 项目简介

**Any Listen Music Stats** 是一个为 Any Listen 桌面端音乐播放器开发的听歌统计扩展。它在本地记录你的播放历史，生成图形化统计面板，支持数据导出、备份与恢复，帮助你了解自己的听歌习惯。

- **完全本地运行**：所有数据仅保存在你的电脑上，不上传任何服务器
- **无需注册账号**：开箱即用，保护隐私
- **开源透明**：核心逻辑可审计，无隐藏行为

## 核心功能

### 图形化统计面板
- **KPI 概览**：累计收听时长、有效播放次数、歌曲数量、歌手数量
- **14 天收听趋势**：可视化展示近两周的听歌走势
- **TOP 100 排行**：歌曲、歌手、专辑三个维度的热门榜单
- **12 周收听日历**：类似 GitHub Contributions 的热力图，一眼看清活跃度
- **播放历史明细**：每一条有效播放记录的详细时间轴

### 灵活的筛选与排序
- **时间范围**：全部、今天、本周、本月、今年
- **排序方式**：按播放次数排序、按收听时长排序

### 完整的数据管理
- **CSV 导出**：听歌明细导出为 Excel 可打开的 CSV 文件
- **JSON 备份**：完整统计数据备份为 JSON 文件
- **JSON 恢复**：从备份文件恢复数据（覆盖模式）
- **JSON 合并**：将备份数据与现有数据智能合并（去重、取最大值）
- **格式兼容**：自动识别并兼容数组格式和对象格式的 tracks/sessions 数据

### 统计规则（公开透明）
- **有效播放判定**：单次连续播放达到 **30 秒** 才计入统计
- **暂停/缓冲不计时**：暂停、停止、缓冲期间的时间不计入有效时长
- **切歌/结束自动保存**：歌曲切换或自然结束时自动最终化当前记录
- **启动同步**：插件启动时自动同步正在播放的曲目
- **数据持久化**：所有数据保存在本地 `music-stats/data-v2.json`，兼容旧版数据迁移

## 界面预览

> 📸 截图占位区域——建议补充以下截图：
> - Dashboard 总览页
> - 趋势图表页
> - TOP 100 排行页
> - 12 周日历热力图
> - 播放历史列表
> - 数据管理面板（导入/导出/合并）

## 当前稳定版本

| 项目 | 值 |
|------|-----|
| **稳定基线版本** | **v10** (AnyListen-beta5-MusicStats-Dashboard-Fix-v10) |
| **适配宿主版本** | Any Listen Desktop 0.10.1-beta.5 |
| **插件版本** | 1.2.0 |
| **发布日期** | 2026-11-21 |
| **验证状态** | ✅ 用户实机测试通过，所有功能正常 |

> **重要说明**：v10 是目前唯一经过用户实机验证的稳定版本。后续版本（v11+）将在完成宿主差异审计、最小化补丁迁移、代码质量检查、用户实测验收后才会发布。

## 支持的 Any Listen 版本

| Any Listen 版本 | 适配状态 | 备注 |
|-----------------|----------|------|
| 0.10.1-beta.5 | ✅ 稳定基线 (v10) | 当前唯一验证通过的版本 |
| 1.1.3 | 历史版本 | 项目历史中曾适配，非当前基线 |
| 1.2.0+ | 待适配 | 需遵循版本工作流进行差异审计后适配 |

## 安装教程

### 前置要求
- Windows 10/11
- Any Listen Desktop 0.10.1-beta.5（当前稳定基线对应版本）
- 已安装 Node.js（用于构建插件包）

### 方式一：使用预构建的扩展包（推荐）
1. 从 [Releases](https://github.com/mocho2001/anylisten-music-stats-public/releases) 下载最新的 `.alix` 扩展包
2. 打开 Any Listen，进入 **设置 → 扩展**
3. 点击 **从本地安装**，选择下载的 `.alix` 文件
4. 安装完成后，在扩展列表中启用 **Music Stats**
5. 点击扩展卡片的 **打开面板** 或在设置侧边栏找到 **听歌统计** 入口

### 方式二：从源码构建
```powershell
# 1. 克隆仓库
git clone https://github.com/mocho2001/anylisten-music-stats-public.git
cd anylisten-music-stats-public/plugin

# 2. 配置签名密钥（首次构建需要）
copy .env.example .env
# 编辑 .env，填入你的 PRI_KEY (PKCS8 私钥) 和 PUB_KEY (SPKI 公钥 Base64)

# 3. 构建
.\build.ps1
# 产物在 plugin/dist/ 或 plugin/build/ 目录下
```

> ⚠️ **注意**：构建产生的 `.alix` 包含签名，必须使用与 Any Listen 扩展系统匹配的密钥对。如果没有密钥，请使用方式一的预构建包。

## 使用教程

### 打开统计面板
1. Any Listen 主界面 → **设置** → **扩展**
2. 找到 **Music Stats**，点击 **打开面板** 或 **设置**
3. 或直接在设置左侧菜单找到 **听歌统计**

### 查看统计数据
- **概览页**：KPI 卡片、14 天趋势、TOP 10 排行
- **排行榜**：切换 歌曲/歌手/专辑，支持 时长/次数 双排序
- **日历**：12 周热力图，点击某天查看当日明细
- **历史**：完整播放记录列表，支持时间范围筛选
- **趋势**：14 天收听时长/次数走势图

### 数据导出与备份
| 操作 | 说明 | 适用场景 |
|------|------|----------|
| **导出 CSV** | 听歌明细 → Excel 可读 | 数据分析、个人归档 |
| **导出 JSON** | 完整统计数据备份 | 迁移设备、定期备份 |
| **导出 HTML 面板** | 离线可查看的图形化报告 | 分享给他人、离线查看 |
| **导入 JSON（覆盖）** | 完全替换现有数据 | 换设备恢复、回滚误操作 |
| **合并 JSON** | 智能合并，去重取最大值 | 多设备数据汇总 |

### 重置数据
- 在面板中执行 **重置** 命令，输入 `RESET` 确认
- 会清空所有本地统计数据，**不可恢复**，请先备份

## 数据保存与隐私说明

| 数据类型 | 存储位置 | 说明 |
|----------|----------|------|
| 播放统计 | `%APPDATA%\Any Listen\music-stats\data-v2.json` | 本地文件，仅你可见 |
| 导出文件 | 用户自选目录 | 完全由你控制 |
| 网络请求 | **无** | 插件不发起任何网络连接 |

**隐私承诺**：
- ❌ 不收集任何个人信息
- ❌ 不上传听歌历史到任何服务器
- ❌ 不包含任何遥测、统计上报代码
- ✅ 完全离线运行，数据 100% 掌握在你手中

## CSV / JSON 格式说明

### CSV 导出字段
```
歌曲, 歌手, 专辑, 开始时间, 结束时间, 有效时长(秒)
```

### JSON 结构 (data-v2.json)
```json
{
  "version": 2,
  "tracks": {
    "key|id|name|singer": {
      "key": "key|id|name|singer",
      "id": "song_id",
      "name": "歌曲名",
      "singer": "歌手名",
      "album": "专辑名",
      "seconds": 3600,
      "plays": 50,
      "lastPlayed": 1700000000000
    }
  },
  "sessions": [
    {
      "key": "key|id|name|singer",
      "name": "歌曲名",
      "singer": "歌手名",
      "album": "专辑名",
      "startedAt": 1700000000000,
      "endedAt": 1700000180000,
      "seconds": 180
    }
  ],
  "totalSeconds": 720000,
  "validPlays": 1200
}
```

> **兼容性**：导入时自动兼容 `tracks` 为数组或对象、`sessions` 为数组或对象的旧格式。

## 常见问题 (FAQ)

**Q: 为什么我的播放没有被记录？**
A: 只有连续播放超过 30 秒才会被计为有效播放。暂停、缓冲、切歌前不足 30 秒的片段不会记录。

**Q: 切换电脑怎么迁移数据？**
A: 使用 **导出 JSON** 备份，在新电脑上 **导入 JSON（覆盖模式）** 恢复。或使用 **合并模式** 将多台设备数据汇总。

**Q: 卸载扩展会删除数据吗？**
A: 不会。数据保存在 Any Listen 的存储目录中，卸载扩展不删除数据。重新安装后数据仍在。

**Q: 支持网页版 / 手机版 Any Listen 吗？**
A: 目前仅支持 Windows 桌面版 Any Listen Desktop。

**Q: 为什么 Dashboard 打不开/显示空白？**
A: 请确认 Any Listen 版本为 0.10.1-beta.5。其他版本可能因宿主结构变化导致不兼容，需等待对应版本的适配发布。

**Q: 可以同时安装多个统计扩展吗？**
A: 不建议。不同扩展可能共用同一宿主组件，导致数据冲突或面板异常。

## 项目目录说明

```
AnyListen-Music-Stats-Public/
├─ README.md                 # 本文件
├─ LICENSE                   # 许可证（待确定）
├─ CHANGELOG.md              # 版本变更日志
├─ CONTRIBUTING.md           # 贡献指南
├─ SECURITY.md               # 安全报告
├─ .gitignore                # Git 忽略规则
│
├─ docs/
│  ├─ FEATURES.md            # 功能详细规格（基线文档）
│  ├─ INSTALLATION.md        # 安装指南（本文件安装章节的扩展版）
│  ├─ CONFIGURATION.md       # 配置说明
│  ├─ DATA-AND-PRIVACY.md    # 数据与隐私详细说明
│  ├─ FAQ.md                 # 常见问题
│  └─ COMPATIBILITY.md       # 兼容性与审计报告
│
├─ plugin/
│  ├─ src/
│  │  └─ index.ts            # 插件主入口源码
│  ├─ build.ps1              # 构建脚本
│  ├─ tsconfig.json          # TypeScript 配置
│  └─ README.md              # 插件开发说明
│
├─ host-patch/
│  ├─ README.md              # 宿主补丁说明
│  ├─ patches/               # 补丁差异文件（待补充）
│  └─ scripts/
│      └─ patch_host.py      # 补丁应用脚本
│
├─ assets/
│  ├─ screenshots/           # 界面截图
│  └─ images/                # 文档用图片
│
├─ releases/
│  └─ README.md              # 发布说明模板
│
└─ .github/
   ├─ ISSUE_TEMPLATE/        # Issue 模板
   └─ workflows/             # GitHub Actions（待补充）
```

## 参与开发与问题反馈

### 报告 Bug / 提出建议
请在 [GitHub Issues](https://github.com/mocho2001/anylisten-music-stats-public/issues) 提交，建议包含：
- Any Listen 版本
- 操作系统版本
- 复现步骤
- 预期行为 vs 实际行为
- 相关日志或截图

### 贡献代码
1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/your-feature`
3. 提交变更：`git commit -m 'feat: add your feature'`
4. 推送分支：`git push origin feature/your-feature`
5. 发起 Pull Request

> ⚠️ **重要**：任何针对宿主补丁的修改必须遵循《版本工作流规范》，需经差异审计、最小化补丁、用户实测验收后才能合并。

### 开发环境搭建
参考 `plugin/README.md` 和 `docs/INSTALLATION.md`。

## 第三方项目免责声明

**Any Listen Music Stats 是第三方社区项目，与 Any Listen 官方无关。**

- 本项目不代表 Any Listen 官方立场
- 不保证与未来 Any Listen 版本兼容
- 使用本扩展产生的任何数据问题，使用者自行承担风险
- 请在重要数据变更前自行备份 `data-v2.json`

## 许可证说明

> 📋 **许可证待定**

本项目包含以下来源的代码，许可证审查进行中：
- **项目自有代码**（plugin/src/、host-patch/scripts/）：原创，许可证待决定
- **extension-kit**（构建工具链）：Apache-2.0
- **any-listen-extension-lx-api-source-loader**（参考实现）：Apache-2.0
- **Any Listen 宿主程序**：专有软件，**不包含在本仓库分发范围内**

**在许可证审查完成并明确声明前，请勿假设本项目采用任何特定开源许可证。**

最终许可证将在以下条件满足后确定：
1. 所有依赖许可证兼容性审查通过
2. 确认无受版权保护的宿主代码片段被分发
3. 作者明确批准选定许可证

---

**项目主页**：https://github.com/mocho2001/anylisten-music-stats-public  
**问题反馈**：https://github.com/mocho2001/anylisten-music-stats-public/issues  
**私有开发仓库**：mocho2001/anylisten-music-stats (Private)