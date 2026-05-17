# Scripts

本目录放项目维护脚本，只用于本地诊断、数据预览或一次性迁移辅助。

约定：

- 默认先提供 dry-run，不直接写真实数据库。
- 真实写入数据库的脚本必须在文件名或参数中明确标识，并在执行前单独确认目标账号和影响范围。
- 脚本不能打印 `.env.local`、数据库连接字符串、API key 或 token。
- 一次性脚本保留简短说明，执行完成并确认不再需要后再考虑清理。

## Excel 历史数据迁移

`import_growth_plan_dry_run.py` 只解析 `Faye的成长计划.xlsx` 并输出迁移预览，不读取环境变量、不连接数据库。

```bash
python3 scripts/import_growth_plan_dry_run.py
python3 scripts/import_growth_plan_dry_run.py --format json
```

`import_growth_plan_apply.mjs` 复用 dry-run 的解析结果，并分为三个模式：

```bash
node scripts/import_growth_plan_apply.mjs --mode plan
node scripts/import_growth_plan_apply.mjs --mode check --email your@email.com
node scripts/import_growth_plan_apply.mjs --mode apply --email your@email.com --confirm-import IMPORT_FAYE_GROWTH_PLAN
```

- `plan`：不连接数据库，只输出计划数量。
- `check`：只读数据库，确认目标账号和该账号当前已有数据量。
- `apply`：写入数据库；必须单独确认后才允许执行。
