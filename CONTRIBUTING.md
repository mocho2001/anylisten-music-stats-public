# 贡献指南

感谢你对 Any Listen Music Stats 的关注！欢迎通过以下方式参与项目：

## 贡献方式

### 🐛 报告 Bug
在 [Issues](https://github.com/mocho2001/anylisten-music-stats-public/issues) 中提交，请包含：
- Any Listen 版本号
- Windows 版本
- 复现步骤
- 预期行为 vs 实际行为
- 相关日志（如有）
- 截图（如适用）

### 💡 提出功能建议
在 Issues 中使用 `enhancement` 标签，描述：
- 使用场景
- 预期效果
- 可能的实现思路

### 🔧 提交代码
1. Fork 本仓库
2. 创建分支：`git checkout -b feature/your-feature-name` 或 `fix/your-fix-name`
3. 编写代码并测试
4. 提交：`git commit -m 'feat: your feature description'` 或 `fix: your fix description`
5. 推送：`git push origin your-branch-name`
6. 发起 Pull Request

## 开发规范

### 分支命名
| 类型 | 前缀 | 示例 |
|------|------|------|
| 新功能 | `feature/` | `feature/add-export-pdf` |
| 修复 | `fix/` | `fix/dashboard-render-error` |
| 文档 | `docs/` | `docs/update-install-guide` |
| 重构 | `refactor/` | `refactor/session-merge-logic` |
| 测试 | `test/` | `test/add-unit-tests` |

### 提交信息规范
遵循 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/v1.0.0/)：

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Type 类型**：
- `feat`: 新功能
- `fix`: 修复 Bug
- `docs`: 文档更新
- `style`: 代码格式调整（不影响逻辑）
- `refactor`: 重构（非新功能、非修复）
- `test`: 测试相关
- `chore`: 构建、工具、依赖更新

**示例**：
```
feat(dashboard): add 12-week calendar heatmap
fix(import): handle empty sessions array in JSON merge
docs(readme): update installation steps for v10
```

### 代码风格
- 使用 TypeScript 严格模式（`tsconfig.json` 已配置）
- 运行 `npm run lint` 检查（如配置了 ESLint）
- 保持现有代码风格一致
- 关键逻辑添加注释说明意图

### 测试要求
- 任何功能变更需在 **Any Listen 0.10.1-beta.5** 上实测通过
- 核心统计逻辑变更必须验证：30秒阈值、暂停不计时、切歌保存、重启持久化
- 宿主补丁变更必须遵循《版本工作流规范》（见 `docs/development/VERSION_WORKFLOW.md`）

## 特殊领域贡献指引

### 插件源码 (`plugin/src/`)
- 主入口：`index.ts`
- 修改统计逻辑、Player API 交互、数据持久化、导入导出等核心功能
- 变更后需运行构建脚本验证：`plugin/build.ps1`

### 宿主补丁 (`host-patch/`)
⚠️ **高风险领域，需严格遵守流程**

任何宿主补丁修改必须：
1. 先获取目标版本原始 `app.asar`
2. 与 v10 基线进行差异审计（输出 `reports/host-diff-and-audit.md`）
3. 制定补丁计划并经**用户确认**后实施
4. 最小化修改，保留无关 payload
5. 完整代码质量检查（JS 语法、TS 类型、构建、清单、归档结构）
6. 用户实机测试验收通过
7. 仅在验收后合并到稳定分支并打 Tag

**禁止**：
- 直接修改 v10 稳定基线文件
- 未经差异审计直接迁移补丁
- 未经用户确认执行修改方案
- 新版本未实测即合并稳定分支

### 文档 (`docs/`)
- 使用 Markdown 编写
- 中文为主，关键技术术语可保留英文
- 更新功能文档时同步更新 CHANGELOG

## 行为准则

- 保持友善、包容、尊重的沟通氛围
- 欢迎不同经验水平的贡献者
- 建设性地给予和接受反馈
- 关注问题本身，而非个人

## 许可证

贡献的代码将遵循项目最终确定的许可证（目前许可证审查中，见 `README.md` 许可证说明部分）。

在许可证确定前，贡献即表示你同意：
- 你的贡献为原创或已获授权
- 允许项目按最终选定的开源许可证分发你的贡献

## 联系方式

- GitHub Issues：技术问题、Bug、功能建议
- GitHub Discussions：一般讨论、使用心得、方案探讨

---

*文档版本：1.0 | 更新日期：2026-11-21*