# Xueqiu MCP Server

- 独立的 Node/TS MCP 服务，依赖雪球 Cookie 访问接口。
- 参考本机模板 `server-larkoffice` 的项目结构与启动方式。

## 使用

1. 提供 Cookie：通过进程环境变量注入 `XQ_A_TOKEN`，可选 `XQ_R_TOKEN`、`XQ_U`，或运行时调用工具 `updateCookies` 注入结构化 Cookie（`xq_a_token`/`xq_r_token`/`u` 或整串 cookieHeader）
2. 安装依赖并构建：
   - `npm i`
   - `npm run build`
3. 启动：
   - `npm run start`
4. MCP 客户端接入（示例）：在 Claude Desktop/VS Code MCP 配置中注册本服务并声明工具：
   - 基础：`ping`、`updateCookies`
   - 行情：`getRealtimeQuotes`、`quotec`、`quote_detail`、`pankou`、`getQuoteSnapshot`
   - 走势：`getKline`、`getMinuteTimeline`
   - 搜索与自选：`searchSymbols`、`suggest_stock`、`getWatchlist`、`watch_list`、`watch_stock`
   - 资金：`getCapitalAssort`、`capital_margin`、`capital_blocktrans`、`capital_flow`、`capital_history`
   - 财务：`finance_cash_flow`、`finance_cash_flow_v2`、`finance_indicator`、`finance_indicator_v2`、`finance_balance`、`finance_balance_v2`、`finance_income`、`finance_income_v2`、`finance_business`
   - 研报：`report_latest`、`report_earningforecast`
   - F10：`f10_skholderchg`、`f10_skholder`、`f10_industry`、`f10_holders`、`f10_bonus`、`f10_org_holding_change`、`f10_industry_compare`、`f10_business_analysis`、`f10_shareschg`、`f10_top_holders`、`f10_main_indicator`
   - 组合：`getCubeInfo`、`cube_nav_daily`、`cube_rebalancing_history`、`cube_rebalancing_current`、`cube_quote_current`
   - 基金：`fund_detail`、`fund_info`、`fund_growth`、`fund_nav_history`、`fund_achievement`、`fund_asset`、`fund_manager`、`fund_trade_date`、`fund_derived`
   - 指数：`index_basic_info`、`index_details_data`、`index_weight_top10`、`index_perf_7`、`index_perf_30`、`index_perf_90`
   - 港股通：`hkex_northbound`
   - 其他：`convertible_bond`

## 示例

- `examples/check-quotes.js` 读取环境变量并验证实时行情。
- `examples/check-minute.js` 分钟/分时数据（该接口通常需要有效 Cookie，若返回 400016 请使用真实 Cookie）。
- `examples/check-capital.js` 资金成交分布（通常需要有效 Cookie）。
- `examples/check-finance.js` 财务指标与资金流示例（需设置 `SYMBOL` 与 Cookie）。

## 架构概览
- 入口：`src/server.ts`（McpServer + stdio），统一工具注册，不改变业务逻辑
- 客户端：`src/xueqiu/client.ts`，请求头与 Cookie 追加、拦截器与轻量缓存
- 常量与类型：`src/core/constants.ts`、`src/core/types.ts`；工具注册辅助：`src/core/registry.ts`
- 工具：`src/tools/*.ts`，每个工具包含 `zod` 入参/出参与执行器

## 常见错误码
- `400016`：Cookie 无效或权限不足；请确保使用有效 `xq_a_token`
- `429`：触发限速；客户端已进行指数退避重试
- `5xx`：服务端异常；客户端有限次重试

## 安全

- Cookie 仅存于内存，不写入日志与仓库；日志已做脱敏处理。
