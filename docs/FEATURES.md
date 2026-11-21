# Any Listen Music Stats — Beta 5 v10 稳定基线文档

## 1. 基线身份

| 项目 | 值 |
|------|-----|
| 正式版本名称 | AnyListen-beta5-MusicStats-Dashboard-Fix-v10 |
| 版本状态 | STABLE BASELINE / 用户实测通过 |
| 原始宿主版本 | Any Listen Desktop 0.10.1-beta.5 |
| 原始宿主文件 | app.asar |
| 稳定基线文件 | AnyListen-beta5-MusicStats-Dashboard-Fix-v10.app.asar |
| 稳定基线 SHA256 | `77e2dfa198b1f8e34beac7d2784c10261dcd2bd9679031bcb9d623222104f0e9` |
| 原始 beta5 app.asar SHA256 | `659958f04d6d75879a676e02b9eb80b5e8dfedd292cd03d488950f863c89e795` |
| 确立日期 | 2026-11-21 |
| 确立依据 | 用户在 Any Listen 客户端中实际安装测试，所有功能正常，无问题反馈 |

## 2. 已验证功能清单（用户实测确认正常）

以下 15 项功能已通过用户在 Any Listen 客户端中的实际安装和使用测试，**全部确认正常工作**，不得标记为待测试或未经验证：

| # | 功能 | 备注 |
|---|------|------|
| 1 | Dashboard 图形化统计页面正常显示 | 核心入口 |
| 2 | KPI 统计：收听时长、有效播放次数、歌曲数量、歌手数量 | 基础指标 |
| 3 | 14 天收听趋势图表 | 趋势可视化 |
| 4 | 歌曲 TOP 100 排行 | 排名功能 |
| 5 | 歌手 TOP 100 排行 | 排名功能 |
| 6 | 专辑 TOP 100 排行 | 排名功能 |
| 7 | 12 周收听日历热力图 | 日历视图 |
| 8 | 播放历史展示 | 明细记录 |
| 9 | 时间筛选：全部、今天、本周、本月、今年 | 多维度筛选 |
| 10 | 排序方式：播放次数、收听时长 | 双维度排序 |
| 11 | CSV 导出功能 | 数据导出 |
| 12 | JSON 备份、恢复、合并、覆盖 | 完整数据管理 |
| 13 | tracks 数组和对象格式兼容 | 兼容性 |
| 14 | sessions 导入时的数组和对象格式兼容 | 兼容性 |
| 15 | Dashboard 导入时动态字段保存问题修复 | 修复项 |
| 16 | Dashboard iframe 消息监听和消息来源校验修复 | 安全修复 |
| 17 | Player API 暴露及相关播放信息接口 | 核心桥接 |

## 3. 核心技术逻辑（未来开发不得随意改变）

以下逻辑为 v10 稳定基线的核心行为契约，后续版本迁移时必须优先审计兼容性，采用最小修改原则：

### 3.1 Player API 与播放事件
- **Player API 获取方式**：`api.player`
- **当前曲目索引**：`playInfo.info.index`（而非 `playInfo.index`）
- **播放状态与事件处理**：play、pause、stop、musicChanged、ended 等事件的监听与同步逻辑

### 3.2 统计规则
- **有效播放阈值**：超过 30 秒才计为有效播放
- **暂停/恢复/切歌/歌曲结束** 时的记录保存与最终化逻辑
- **缓冲时间不计入** 有效播放时长

### 3.3 Dashboard 通信机制
- **iframe 创建与挂载**：同步设置 `srcdoc`，挂载到宿主指定容器
- **消息协议**：
  - `ALS_REFRESH` —— 请求刷新数据
  - `ALS_DATA` —— 返回统计数据
  - `ALS_IMPORT` —— 导入/写回数据
- **监听器管理**：`window.__alsStatsMessageHandler` 单实例模式，注册前移除旧监听器
- **消息来源校验**：仅接受来自当前 iframe `contentWindow` 的消息

### 3.4 数据持久化与兼容性
- **存储文件**：`music-stats/data-v2.json`
- **兼容性要求**：
  - 保留现有统计数据完整性
  - tracks 字段支持数组与对象双格式
  - sessions 字段支持数组与对象双格式
  - 歌曲记录与播放历史的去重、合并逻辑
- **迁移原则**：不得在无显式备份和迁移方案的情况下删除或迁移用户数据

### 3.5 UI 与交互
- **Dashboard 页面布局**：保持原有结构
- **交互功能**：筛选、排序、导出、备份恢复、日历、排名、历史、趋势等全部保留
- **扩展身份键**：Settings 组件中的扩展标识键必须保持，防止不同扩展复用同一组件实例

## 4. 文件清单

| 文件 | 说明 | SHA256 |
|------|------|--------|
| `host-versions/0.10.1-beta.5/original/app.asar` | 原始 beta5 宿主 | `659958f04d6d75879a676e02b9eb80b5e8dfedd292cd03d488950f863c89e795` |
| `host-versions/0.10.1-beta.5/patched/AnyListen-beta5-MusicStats-Dashboard-Fix-v10.app.asar` | v10 稳定基线 | `77e2dfa198b1f8e34beac7d2784c10261dcd2bd9679031bcb9d623222104f0e9` |
| `host-versions/0.10.1-beta.5/patched/AnyListen-beta5-MusicStats-Dashboard-Fix-v10-source-and-package.zip` | 源码与构建产物包 | — |

## 5. 维护规则

1. **v10 为唯一稳定基线**，下一版本编号从 v11 开始
2. **严禁修改 v10 代码、重新构建或改变已验证功能**
3. 新版本开发必须遵循《版本工作流规范》（`docs/development/VERSION_WORKFLOW.md`）
4. 所有变更必须通过用户实测确认后才能合并到稳定分支
5. Git Tag 命名规范：`anylisten-beta5-v10-stable`

---

*文档版本：1.0 | 创建日期：2026-11-21 | 基线确立*