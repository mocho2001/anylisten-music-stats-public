# AnyListen Beta5 v10 稳定基线发布

## 📦 版本信息
- **宿主版本**：Any Listen Desktop 0.10.1-beta.5
- **插件版本**：1.2.4 (v10 基线对应)
- **发布日期**：2026-11-21
- **Git Tag**：anylisten-beta5-v10-stable

## ✅ 验证状态
- ✅ 用户实机测试通过，所有 17 项功能确认正常
- ✅ 完整的图形化统计面板
- ✅ KPI 统计、趋势图、排行榜、日历、历史记录
- ✅ CSV/JSON 导出、备份、恢复、合并
- ✅ 数据格式双重兼容 (tracks/sessions 数组/对象)

## 🔐 SHA256 校验值

### 稳定基线 app.asar (AnyListen-beta5-MusicStats-Dashboard-Fix-v10.app.asar)
```
77e2dfa198b1f8e34beac7d2784c10261dcd2bd9679031bcb9d623222104f0e9
```

### 原始宿主 app.asar (Any Listen 0.10.1-beta.5 原始文件)
```
659958f04d6d75879a676e02b9eb80b5e8dfedd292cd03d488950f863c89e795
```

### 插件包 (anylisten_music_stats_v1.2.4.alix)
```
fbdbbd882d566a607895b5956acbb3700180c9d326ba6df22fdfeebb14cd76c9a
```

## 📥 安装说明

### 方式一：使用预构建稳定基线包 (推荐)
1. 下载 `AnyListen-beta5-MusicStats-Dashboard-Fix-v10.app.asar` (需从私有渠道获取)
2. 备份原始 `app.asar`：`C:\Program Files\Any Listen\resources\app.asar`
3. 替换为稳定基线版本
4. 重启 Any Listen，在设置中进入"听歌统计"面板

### 方式二：安装插件包
1. 下载 `anylisten_music_stats_v1.2.4.alix`
2. 在 Any Listen 扩展管理中安装 .alix 文件
3. 重启 Any Listen

## ⚠️ 重要警告

> **app.asar 替换属于高风险操作，请谨慎操作：**
> - 必须先备份原始 `app.asar` 文件
> - 替换后可能导致 Any Listen 无法启动、签名验证失败、自动更新覆盖补丁
> - 官方不提供技术支持
> - 仅建议高级用户/开发者操作
> - 普通用户请优先使用插件包安装方式

## 📋 完整功能清单
详见 [FEATURES.md](docs/FEATURES.md) 与 [CHANGELOG.md](CHANGELOG.md)

## 🔗 相关链接
- 项目主页：https://github.com/mocho2001/anylisten-music-stats-public
- 安装指南：[docs/INSTALLATION.md](docs/INSTALLATION.md)
- 许可证：MIT License

---

## 📎 Release 附件清单

| 文件 | 说明 | SHA256 |
|------|------|--------|
| `anylisten_music_stats_v1.2.4.alix` | 插件安装包 (v1.2.4) | `fbdbbd882d566a607895b5956acbb3700180c9d326ba6df22fdfeebb14cd76c9a` |

> **注意**：稳定基线 `app.asar` 文件不在此处分发（包含 Any Listen 专有代码）。如需获取，请通过私有渠道或自行使用补丁脚本构建。

---

## GitHub Release 创建步骤

由于当前环境无 `gh` CLI，请按以下步骤在 GitHub 网页手动创建 Release：

1. 访问：https://github.com/mocho2001/anylisten-music-stats-public/releases/new
2. 选择标签：`anylisten-beta5-v10-stable` (或输入 `V0.10.1-beta.5_v10` 创建新标签)
3. 发布标题：`V0.10.1-beta.5_v10 - AnyListen Beta5 v10 稳定基线`
4. 复制上述发布说明到描述框
5. 上传附件：`anylisten_music_stats_v1.2.4.alix` (本地路径：`D:\App\App_data\DSH_data\AnyListen-Music-Stats\AnyListen-Music-Stats-Public\anylisten_music_stats_v1.2.4.alix`)
6. 勾选 "Set as the latest release"
7. 点击 "Publish release"