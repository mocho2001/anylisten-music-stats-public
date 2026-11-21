# 版本发布说明

本目录用于存放公开发布的版本产物与发布记录。

---

## 发布产物规范

### 文件命名
```
AnyListen-Music-Stats-v{版本号}.alix
```
示例：`AnyListen-Music-Stats-v10.alix`

### 附带校验文件
每个发布必须包含：
| 文件 | 说明 |
|------|------|
| `AnyListen-Music-Stats-v{版本号}.alix` | 签名扩展安装包 |
| `AnyListen-Music-Stats-v{版本号}.alix.sha256` | SHA256 校验值（单行） |
| `CHANGELOG_v{版本号}.md` | 该版本变更日志副本 |

---

## 发布流程

### 1. 准备发布
- 确认版本已通过用户实机测试验收
- 更新 `CHANGELOG.md` 对应版本条目
- 确认 `.alix` 包签名有效、可正常安装

### 2. 计算校验值
```powershell
# Windows PowerShell
Get-FileHash -Algorithm SHA256 "AnyListen-Music-Stats-v10.alix" | Select-Object -ExpandProperty Hash > "AnyListen-Music-Stats-v10.alix.sha256"
```

### 3. 创建 Git Tag
```bash
git tag -a "anylisten-beta5-v10-stable" -m "v10 稳定基线：用户实测验收通过"
git push origin --tags
```

### 4. GitHub Release
1. 访问仓库 Releases 页面 → "Draft a new release"
2. Tag 选择对应标签（如 `anylisten-beta5-v10-stable`）
3. Release title: `Any Listen Music Stats v10 - 稳定基线`
4. 描述：复制 `CHANGELOG.md` 对应版本内容
5. 上传三个文件：`.alix`、`.alix.sha256`、`CHANGELOG_v10.md`
6. 标记为 "Latest release"
7. 发布

---

## 当前发布记录

| 版本 | Tag | 发布日期 | 宿主适配 | 状态 | SHA256 |
|------|-----|----------|----------|------|--------|
| v10 | `anylisten-beta5-v10-stable` | 2026-11-21 | 0.10.1-beta.5 | ✅ 已发布 | `77e2dfa198b1f8e34beac7d2784c10261dcd2bd9679031bcb9d623222104f0e9` |

---

## 历史版本获取

> 历史内部开发版本（v1.2.4、v1.2.1、v1.2.0、v1.1.3 等）**不在公开仓库发布**。
>
> 如需历史版本用于研究，请联系维护者或查阅私有仓库记录。

---

## 校验安装包完整性

用户下载后可验证：
```powershell
# 1. 计算下载文件哈希
$hash = (Get-FileHash -Algorithm SHA256 "AnyListen-Music-Stats-v10.alix").Hash

# 2. 读取官方校验文件
$official = Get-Content "AnyListen-Music-Stats-v10.alix.sha256"

# 3. 对比
if ($hash -eq $official) { Write-Host "✅ 校验通过" } else { Write-Host "❌ 校验失败，文件可能被篡改或损坏" }
```

---

## 发布清单模板

发布新版本前核对：

- [ ] 用户实机测试验收通过（签名人、日期记录在案）
- [ ] `CHANGELOG.md` 已更新完整变更内容
- [ ] `.alix` 签名有效、可在目标宿主版本安装
- [ ] SHA256 校验文件已生成并核对
- [ ] Git Tag 已打且推送到远程
- [ ] GitHub Release 已创建、上传完整产物
- [ ] 旧版本 Release 保留未删除
- [ ] 无敏感信息混入发布产物

---

*文档版本：1.0 | 更新日期：2026-11-21*