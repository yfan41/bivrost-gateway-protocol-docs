---
title: "六、MCP 服务"
sidebar:
  label: "六、MCP 服务"
---


网关内置 MCP（Model Context Protocol）服务端，将机台数据、数据分析与网关状态以「工具（Tool）」的形式提供给 AI 客户端（Claude Code、Claude Desktop、MCP Inspector 等支持 MCP 的应用与智能体），无需自行编写 HTTP 请求即可用自然语言查询机台。

MCP 工具在网关内部走与 HTTP 接口完全相同的处理流程，因此**同一数据经 MCP 返回的内容与对应 HTTP 接口完全一致**，字段含义参见[二、HTTP 通讯](/http/)各章节。

## 6.1. 基本说明 {#basics}

MCP 服务端地址为 **/mcp**，与 HTTP 接口使用同一端口：

```
http://{网关 IP}/mcp
```

:::caution[注意]
MCP 服务**默认关闭**，关闭时 `/mcp` 返回 HTTP 404。网关在网页「通讯配置」页打开 MCP 开关后立即生效，无需重启。
:::

传输方式为 MCP 标准的 Streamable HTTP：客户端以 POST 发送 JSON-RPC 报文，请求头需带 `Content-Type: application/json` 与 `Accept: application/json, text/event-stream`。服务端为无状态模式，每次工具调用都是独立的一次 HTTP 请求。

当前提供 33 个**只读**工具，覆盖机台配置、实时状态、数据分析与网关系统信息，详见 [6.4. 工具列表](#tools)。所有涉及写入、机台控制、文件传输的接口均不提供 MCP 工具，只能通过 HTTP 接口调用。

:::note[注]
云平台（Hub）同样提供 MCP 服务端，地址为 `https://{云平台地址}/mcp`，工具列表与网关一致，调用时由云平台转发至指定网关执行，鉴权方式见 [6.2.2. 云平台鉴权](#auth-cloud)。
:::

## 6.2. 鉴权 {#auth}

### 6.2.1. 网关鉴权 {#auth-gateway}

MCP 服务端的鉴权方式与 HTTP 接口一致，详见 [2.3. 鉴权方式](/http/auth/)。请求头中带 `Authorization: Bearer <token>`，token 可以是 [2.3.1. JWT 方式](/http/auth/#jwt)获取的令牌，也可以是 [2.3.2. 密钥方式](/http/auth/#secret-key)生成的密钥。未提供或提供无效凭证时，返回 HTTP 401。

:::caution[注意]
JWT 令牌有效期为 24 小时，过期后 MCP 客户端会持续调用失败。MCP 客户端配置通常长期保存，**建议使用永久有效的密钥**。
:::

其余访问控制同样生效：

- **IP 白名单**：启用后，`/mcp` 请求的来源 IP 必须在白名单内，规则与 `/api` 相同，详见 [2.3.3. IP 白名单](/http/auth/#ip-white-list)。
- **用户授权 API**：启用安全控制后，管理员用户可调用全部工具；非管理员用户只能调用其授权 API 列表覆盖到的工具（授权规则按工具对应的接口地址匹配，与 HTTP 请求使用同一套配置）。无权限时该次工具调用返回错误，错误消息为 `Forbidden: ...`。
- 关闭安全控制后，可跳过用户鉴权直接调用工具（IP 白名单仍然生效）。

### 6.2.2. 云平台鉴权 {#auth-cloud}

调用云平台的 MCP 服务端时，请求头中带 `accessToken: <网关令牌>`，与云平台的 HTTP 代理使用同一套规则：该令牌既是鉴权凭证，也用于指定工具在哪个网关上执行。网关令牌即云平台设置中的网关令牌，见 [2.9.6.1. cloud-settings 获取云平台设置](/http/config-communication/#cloud-settings)。

令牌缺失或未注册时，工具调用返回 `Unauthorized: missing or unknown accessToken header.`；令牌有效但对应网关当前未连接云平台时，返回 `GATEWAY_SERVICE_UNAVAILABLE`。

## 6.3. 客户端配置 {#client}

以 Claude Code 为例，添加网关 MCP 服务端：

```bash
claude mcp add --transport http bivrost-gateway http://192.168.100.1/mcp --header "Authorization: Bearer <密钥>"
```

添加云平台 MCP 服务端：

```bash
claude mcp add --transport http bivrost-hub https://cloud.example.com/mcp --header "accessToken: <网关令牌>"
```

其它 MCP 客户端一般使用如下形式的 JSON 配置：

```json
{
  "mcpServers": {
    "bivrost-gateway": {
      "type": "http",
      "url": "http://192.168.100.1/mcp",
      "headers": {
        "Authorization": "Bearer <密钥>"
      }
    }
  }
}
```

如需直接验证服务端是否可用，可用 JSON-RPC 请求列出全部工具：

```bash
curl -X POST http://192.168.100.1/mcp \
  -H "Authorization: Bearer <密钥>" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

## 6.4. 工具列表 {#tools}

以下参数中标注「可选」的可以省略，省略时使用对应接口的默认值。所有时间参数均为 Unix 时间戳（秒）。machineID 与 groupID 的含义见 [1.1. 基本说明](/conventions/identifiers/#machineid)，可先用 `list_machines`、`list_groups` 获取。

### 6.4.1. 配置查询 {#tools-config}

| 工具 | 说明 | 参数 | 对应接口 |
| --- | --- | --- | --- |
| list_machines | 列出全部机台配置（品牌、型号、IP、端口等） | 无 | [machines](/http/config-machines/#machines) |
| get_machine | 获取单个机台配置 | machineID | [machine](/http/config-machines/#machine) |
| list_groups | 列出全部机组及其成员机台 | 无 | [groups](/http/config-groups/#groups) |
| get_gateway_info | 获取网关标识与版本信息 | 无 | [gateway-info](/http/config-global/#gateway-info) |

### 6.4.2. 机台状态 {#tools-machine}

| 工具 | 说明 | 参数 | 对应接口 |
| --- | --- | --- | --- |
| read_cnc_status | 读取机台运行状态 | machineID、channel（可选） | [readCNCStatus](/http/direct-read/#readcncstatus) |
| read_cnc_status_details | 读取机台状态详情（状态、模式、程序、进给、转速、警报） | machineID、channel（可选） | [readCNCStatusDetails](/http/direct-read/#readcncstatusdetails) |
| read_alarm | 读取当前警报 | machineID、channel（可选） | [readAlarm](/http/direct-read/#readalarm) |
| read_position | 读取坐标数据 | machineID、channel（可选） | [readPosition](/http/direct-offset-plc/#readposition) |
| read_load | 读取轴与主轴负载 | machineID、channel（可选） | [readLoad](/http/direct-read/#readload) |
| read_feed_and_spindle | 读取进给与主轴转速 | machineID、channel（可选） | [readFeedAndSpindle](/http/direct-read/#readfeedandspindle) |
| read_current_tool_number | 读取当前刀号 | machineID、channel（可选） | [readCurrentToolNumber](/http/direct-read/#readcurrenttoolnumber) |
| read_time_data | 读取机台时间数据（通电、运行、切削、循环时间） | machineID、channel（可选） | [readTimeData](/http/direct-offset-plc/#readtimedata) |
| read_count | 读取加工计数 | machineID、channel（可选） | [readCount](/http/direct-read/#readcount) |
| read_tool_life | 读取刀具寿命 | machineID、toolNum / offsetNum / groupNum（均可选，省略则读取全部） | [readToolLife](/http/direct-toollife/#readtoollife) |
| read_tool_life_details | 读取刀具寿命详情 | machineID、toolNum / groupNum（均可选） | [readToolLifeDetails](/http/direct-toollife/#readtoollifedetails) |
| read_program_list | 读取机台程序文件列表 | machineID、dirAtCNC / subDir / startPrgNo（均可选） | [readProgramList](/http/file-management/#readprogramlist) |
| read_current_program | 读取当前运行程序（目录、文件名与内容） | machineID、dirAtCNC / subDir（均可选） | [readCurrentProgram](/http/file-management/#readcurrentprogram) |
| batch_read_errors | 批量读取多台机台的连接状态，错误码为 0 表示通讯正常 | machineIDs（机台标识数组） | [batchReadErrors](/http/cached-read/#batchreaderrors) |

### 6.4.3. 数据分析 {#tools-analysis}

| 工具 | 说明 | 参数 | 对应接口 |
| --- | --- | --- | --- |
| analyze_oee | 机台 OEE 分析 | machineID、startUnix、endUnix（可选）、interval（可选） | [oee](/http/analysis-machine/#oee) |
| analyze_alarm | 机台警报分析 | machineID、startUnix、endUnix（可选）、interval（可选） | [alarm](/http/analysis-machine/#alarm) |
| analyze_count | 机台计数分析 | machineID、startUnix、endUnix（可选）、interval（可选）、enableCountPerProgram（可选） | [count](/http/analysis-machine/#count) |
| analyze_cycle | 机台节拍分析 | machineID、startUnix、endUnix（可选）、interval（可选） | [cycle](/http/analysis-machine/#cycle) |
| analyze_overall | 机台综合分析（运行/待机/警报/离线时间占比） | machineID、startUnix、endUnix（可选）、interval（可选） | [overall](/http/analysis-machine/#overall) |
| analyze_group_oee | 机组 OEE 分析 | groupID、startUnix、endUnix（可选）、interval（可选） | [oee](/http/analysis-group/#oee) |
| analyze_group_overall | 机组综合分析 | groupID、startUnix、endUnix（可选）、interval（可选） | [overall](/http/analysis-group/#overall) |
| query_machine_history | 查询机台历史数据 | machineID、type（数据类型）、startUnix、endUnix（可选）、limit（可选） | [machine](/http/history/#machine) |

### 6.4.4. 系统信息 {#tools-system}

| 工具 | 说明 | 参数 | 对应接口 |
| --- | --- | --- | --- |
| get_core_info | 获取 Core 服务信息 | 无 | [info](/http/core-functions/#info) |
| get_core_license_info | 获取许可信息（授权机台数、到期时间） | 无 | [license-info](/http/core-functions/#license-info) |
| get_core_service_status | 获取 Core 服务运行状态 | 无 | [service-status](/http/core-functions/#service-status) |
| get_hardware_resources | 获取网关硬件资源占用（CPU、内存、磁盘） | 无 | [hardware-resources](/http/gateway-functions/#hardware-resources) |
| get_gateway_time | 获取网关当前时间与时区 | 无 | [time](/http/gateway-functions/#time) |
| get_network_adapters | 获取网关网络适配器列表 | 无 | [network-adapters](/http/gateway-functions/#network-adapters) |
| get_error_log | 查询网关接口错误日志 | startUnix（可选）、endUnix（可选） | `/api/log/error` |

## 6.5. 返回结果与错误 {#result}

工具调用成功时，返回内容即对应 HTTP 接口的返回报文（JSON 字符串），字段说明见各接口章节。

工具调用失败时，返回 MCP 的工具错误（`isError`），错误消息格式为：

```
{接口地址} failed: {错误码名称}({errorCode}) {错误说明}
```

例如查询一个不存在的机台：

```
/cnc/readCNCStatus failed: GENERAL_MACHINE_ID_NOT_EXISTED(10003)
```

其中 errorCode 与 HTTP 接口的错误码完全一致，含义见 [2.2. 错误处理](/http/#error-handling)。

## 6.6. 使用限制 {#limitations}

- 工具**均为只读**，不提供任何修改配置、控制机台、传输文件的能力；如需写入操作，请使用 HTTP 接口。
- 以下接口不提供 MCP 工具：文件传输与日志下载等返回文件流的接口、自由查询历史数据的 query 接口、以及用户配置与安全设置等涉及敏感信息的接口。
- 工具返回的数据量受机台响应与时间窗口影响，分析类工具建议限定较短的时间窗口，历史数据查询建议使用 limit 参数。
- 没有实际机床时，可使用[模拟机台](/mock-testing/)测试 MCP 工具。
