# V0.10.1-beta.5_v10 - AnyListen Beta5 v10 稳定基线发布

## 📦 版本信息
- **宿主版本**：Any Listen Desktop 0.10.1-beta.5
- **插件版本**：1.2.4 (v10 基线对应)
- **发布日期**：2026-11-21
- **Git Tag**：anylisten-beta5-v10-stable

## ✅ 验证状态
- ✅ 用户实机测试通过，所有 17 项功能确认正常
- ✅ 完整的图形化统计面板
- ✅ KPI 统计：累计收听时长、有效播放次数、歌曲数量、歌手数量
- ✅ 14 天收听趋势图表
- ✅ 歌曲/歌手/专辑 TOP 100 排行榜
- ✅ 12 周收听日历热力图
- ✅ 播放历史明细列表
- ✅ 时间范围筛选：全部、今天、本周、本月、今年
- ✅ 排序切换：按播放次数 / 按收听时长
- ✅ CSV 导出功能
- ✅ JSON 备份、恢复（覆盖）、合并功能
- ✅ tracks 数组/对象双格式兼容
- ✅ sessions 数组/对象双格式兼容
- ✅ Dashboard 导入时动态字段保存修复
- ✅ Dashboard iframe 消息监听与来源校验
- ✅ Player API 暴露及播放信息接口

## 🔐 SHA256 校验值

### 稳定基线 app.asar (AnyListen-beta5-MusicStats-Dashboard-Fix-v10.app.asar)
```
77e2dfa198b1f8e34beac7d2784c10261dcd2bd9679031bcb9d623222104f0e9
```
**文件大小**：28,874,279 字节 (~27.5 MB)

### 原始宿主 app.asar (Any Listen 0.10.1-beta.5 原始文件)
```
659958f04d6d75879a676e02b9eb80b5e8dfedd292cd03d488950f863c89e795
```

### 插件包 (anylisten_music_stats_v1.2.4.alix)
```
fbdbbd882d566a607895b5956acbb3700180c9d326ba6df22fdfeebb14cd76c9a
```
**文件大小**：10,534 字节 (~10.3 KB)

## 📥 安装说明

### 方式一：使用预构建稳定基线 app.asar (替换宿主文件)

> ⚠️ **高风险操作，请务必按步骤操作并先备份！**

1. **完全退出 Any Listen**，并在任务管理器确认进程已结束。
2. **备份** 安装目录下的 `resources/app.asar`（例如重命名为 `app.asar.before-v10.bak`）。
   - 默认路径：`C:\Program Files\Any Listen\resources\app.asar`
3. 将本发布包内的 **`AnyListen-beta5-MusicStats-Dashboard-Fix-v10.app.asar`** 替换安装目录下的 `resources/app.asar`。
4. **保留用户数据目录**，不要删除统计数据库（`music-stats/data-v2.json`）。
5. 重启 Any Listen，在设置中进入"听歌统计"面板查看图形化统计界面。
6. 如果仍无法启动，**立即退出并恢复备份**的原版 `app.asar`。
7. **本文件需要使用对应版本的软件**：Any Listen 0.10.1-beta.5。

### 方式二：安装插件包 (推荐普通用户)

1. 下载 **`anylisten_music_stats_v1.2.4.alix`**
2. 在 Any Listen 软件内：扩展管理 → 选择本地安装 → 选择该 .alix 文件
3. 安装完成后，在设置 → 扩展设置中找到 **AnyListen-Music-Stats** 即可看到图形化统计界面
4. 无需替换宿主文件，风险更低，卸载更方便

## ⚠️ 重要警告

> **app.asar 替换属于高风险操作，请谨慎操作：**
> - 必须先备份原始 `app.asar` 文件
> - 替换后可能导致 Any Listen 无法启动、签名验证失败、自动更新覆盖补丁
> - 官方不提供技术支持
> - 仅建议高级用户/开发者操作
> - 普通用户请优先使用插件包安装方式（.alix 文件）

## 📋 完整功能清单
详见 [FEATURES.md](docs/FEATURES.md) 与 [CHANGELOG.md](CHANGELOG.md)

## 🔗 相关链接
- 项目主页：https://github.com/mocho2001/anylisten-music-stats-public
- 安装指南：[docs/INSTALLATION.md](docs/INSTALLATION.md)
- 许可证：MIT License

---

## 📎 Release 附件清单

| 文件 | 说明 | 大小 | SHA256 |
|------|------|------|--------|
| `AnyListen-beta5-MusicStats-Dashboard-Fix-v10.app.asar` | 稳定基线宿主文件 (仅限 0.10.1-beta.5) | 27.5 MB | `77e2dfa198b1f8e34beac7d2784c10261dcd2bd9679031bcb9d623222104f0e9` |
| `anylisten_music_stats_v1.2.4.alix` | 插件安装包 (v1.2.4) | 10.3 KB | `fbdbbd882d566a607895b5956acbb3700180c9d326ba6df22fdfeebb14cd76c9a` |

---

## GitHub Release 创建步骤

由于当前环境无 `gh` CLI，请按以下步骤在 GitHub 网页手动创建 Release：

1. 访问：https://github.com/mocho2001/anylisten-music-stats-public/releases/new
2. 选择标签：`anylisten-beta5-v10-stable` (或输入 `V0.10.1-beta.5_v10` 创建新标签)
3. 发布标题：`V0.10.1-beta.5_v10 - AnyListen Beta5 v10 稳定基线`
4. 复制上述发布说明到描述框
5. 上传附件（按顺序）：
   - `AnyListen-beta5-MusicStats-Dashboard-Fix-v10.app.asar` (本地路径：`D:\App\App_data\DSH_data\AnyListen-Music-Stats\AnyListen-Music-Stats-Public\AnyListen-beta5-MusicStats-Dashboard-Fix-v10.app.asar`)
   - `anylisten_music_stats_v1.2.4.alix` (本地路径：`D:\App\App_data\DSH_data\AnyListen-Music-Stats\AnyListen-Music-Stats-Public\anylisten_music_stats_v1.2.4.alix`)
6. 勾选 "Set as the latest release"
7. 点击 "Publish release"