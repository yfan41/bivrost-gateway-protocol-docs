---
title: "6. MCP Service"
sidebar:
  label: "6. MCP Service"
---


The gateway has a built-in MCP (Model Context Protocol) server that exposes machine data, data analysis, and gateway status as "tools" for AI clients (Claude Code, Claude Desktop, MCP Inspector, and any other MCP-capable application or agent), so machines can be queried in natural language without writing HTTP requests by hand.

Internally, MCP tools go through exactly the same processing pipeline as the HTTP interfaces, so **the data returned through MCP is identical to that of the corresponding HTTP interface**. For field definitions, see the sections under [2. HTTP Communication](/en/http/).

## 6.1. Basics {#basics}

The MCP server endpoint is **/mcp**, served on the same port as the HTTP interfaces:

```
http://{Gateway IP}/mcp
```

The transport is the MCP standard Streamable HTTP: the client POSTs JSON-RPC messages with the headers `Content-Type: application/json` and `Accept: application/json, text/event-stream`. The server is stateless — every tool call is an independent HTTP request.

33 **read-only** tools are currently provided, covering machine configuration, live status, data analysis, and gateway system information; see [6.4. Tool List](#tools). No MCP tools are provided for interfaces that write data, control machines, or transfer files — those remain available through the HTTP interfaces only.

:::note[Note]
The cloud platform (Hub) also provides an MCP server at `https://{cloud platform address}/mcp`. Its tool list is identical to the gateway's; calls are forwarded by the cloud platform to the designated gateway for execution. For authentication, see [6.2.2. Cloud Platform Authentication](#auth-cloud).
:::

## 6.2. Authentication {#auth}

### 6.2.1. Gateway Authentication {#auth-gateway}

The MCP server uses the same authentication as the HTTP interfaces; see [2.3. Authentication Methods](/en/http/auth/). Send `Authorization: Bearer <token>` in the request headers, where the token is either a token obtained via [2.3.1. JWT Method](/en/http/auth/#jwt) or a key generated via [2.3.2. Secret Key Method](/en/http/auth/#secret-key). If no credentials or invalid credentials are supplied, HTTP 401 is returned.

:::caution[Caution]
A JWT token is valid for 24 hours; once it expires, the MCP client keeps failing every call. MCP client configurations are usually kept long-term, so **a permanent secret key is recommended**.
:::

The other access controls apply as well:

- **IP whitelist**: when enabled, the source IP of a `/mcp` request must be in the whitelist, following the same rules as `/api`; see [2.3.3. IP Whitelist](/en/http/auth/#ip-white-list).
- **Per-user authorized APIs**: when security control is enabled, administrators may call every tool, while other users may only call the tools covered by their authorized API list (matching is done on the interface path behind each tool, using the same configuration as HTTP requests). Without permission, the tool call returns an error whose message starts with `Forbidden: ...`.
- With security control disabled, tools can be called without user authentication (the IP whitelist still applies).

### 6.2.2. Cloud Platform Authentication {#auth-cloud}

When calling the cloud platform's MCP server, send `accessToken: <gateway token>` in the request headers — the same rule the cloud platform's HTTP proxy uses: the token is both the credential and the selector for which gateway executes the tool. The gateway token is the token in the cloud platform settings; see [2.9.6.1. cloud-settings - Get Cloud Platform Settings](/en/http/config-communication/#cloud-settings).

If the token is missing or not registered, the tool call returns `Unauthorized: missing or unknown accessToken header.`; if the token is valid but the corresponding gateway is not currently connected to the cloud platform, it returns `GATEWAY_SERVICE_UNAVAILABLE`.

## 6.3. Client Configuration {#client}

Using Claude Code as an example, add the gateway MCP server:

```bash
claude mcp add --transport http bivrost-gateway http://192.168.100.1/mcp --header "Authorization: Bearer <secret key>"
```

Add the cloud platform MCP server:

```bash
claude mcp add --transport http bivrost-hub https://cloud.example.com/mcp --header "accessToken: <gateway token>"
```

Other MCP clients generally use a JSON configuration of the following form:

```json
{
  "mcpServers": {
    "bivrost-gateway": {
      "type": "http",
      "url": "http://192.168.100.1/mcp",
      "headers": {
        "Authorization": "Bearer <secret key>"
      }
    }
  }
}
```

To verify directly that the server is reachable, list all tools with a JSON-RPC request:

```bash
curl -X POST http://192.168.100.1/mcp \
  -H "Authorization: Bearer <secret key>" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

## 6.4. Tool List {#tools}

Parameters marked "optional" below may be omitted, in which case the corresponding interface's default is used. All time parameters are Unix timestamps in seconds. For the meaning of machineID and groupID see [1.1. Basics](/en/conventions/identifiers/#machineid); they can be obtained with `list_machines` and `list_groups`.

### 6.4.1. Configuration {#tools-config}

| Tool | Description | Parameters | Interface |
| --- | --- | --- | --- |
| list_machines | List all machine configurations (brand, model, IP, port, etc.) | none | [machines](/en/http/config-machines/#machines) |
| get_machine | Get the configuration of a single machine | machineID | [machine](/en/http/config-machines/#machine) |
| list_groups | List all machine groups and their member machines | none | [groups](/en/http/config-groups/#groups) |
| get_gateway_info | Get gateway identity and version information | none | [gateway-info](/en/http/config-global/#gateway-info) |

### 6.4.2. Machine Status {#tools-machine}

| Tool | Description | Parameters | Interface |
| --- | --- | --- | --- |
| read_cnc_status | Read machine run status | machineID, channel (optional) | [readCNCStatus](/en/http/direct-read/#readcncstatus) |
| read_cnc_status_details | Read machine status details (status, mode, program, feed, spindle, alarms) | machineID, channel (optional) | [readCNCStatusDetails](/en/http/direct-read/#readcncstatusdetails) |
| read_alarm | Read active alarms | machineID, channel (optional) | [readAlarm](/en/http/direct-read/#readalarm) |
| read_position | Read axis positions | machineID, channel (optional) | [readPosition](/en/http/direct-offset-plc/#readposition) |
| read_load | Read axis and spindle load | machineID, channel (optional) | [readLoad](/en/http/direct-read/#readload) |
| read_feed_and_spindle | Read feed rate and spindle speed | machineID, channel (optional) | [readFeedAndSpindle](/en/http/direct-read/#readfeedandspindle) |
| read_current_tool_number | Read the current tool number | machineID, channel (optional) | [readCurrentToolNumber](/en/http/direct-read/#readcurrenttoolnumber) |
| read_time_data | Read machine time data (power-on, operating, cutting, cycle time) | machineID, channel (optional) | [readTimeData](/en/http/direct-offset-plc/#readtimedata) |
| read_count | Read machining counts | machineID, channel (optional) | [readCount](/en/http/direct-read/#readcount) |
| read_tool_life | Read tool life data | machineID, toolNum / offsetNum / groupNum (all optional; omit to read all tools) | [readToolLife](/en/http/direct-toollife/#readtoollife) |
| read_tool_life_details | Read tool life details | machineID, toolNum / groupNum (both optional) | [readToolLifeDetails](/en/http/direct-toollife/#readtoollifedetails) |
| read_program_list | List the part program files on a machine | machineID, dirAtCNC / subDir / startPrgNo (all optional) | [readProgramList](/en/http/file-management/#readprogramlist) |
| read_current_program | Read the currently running program (directory, file name, content) | machineID, dirAtCNC / subDir (both optional) | [readCurrentProgram](/en/http/file-management/#readcurrentprogram) |
| batch_read_errors | Read the connection status of multiple machines at once; error code 0 means communication is healthy | machineIDs (array of machine identifiers) | [batchReadErrors](/en/http/cached-read/#batchreaderrors) |

### 6.4.3. Data Analysis {#tools-analysis}

| Tool | Description | Parameters | Interface |
| --- | --- | --- | --- |
| analyze_oee | Machine OEE analysis | machineID, startUnix, endUnix (optional), interval (optional) | [oee](/en/http/analysis-machine/#oee) |
| analyze_alarm | Machine alarm analysis | machineID, startUnix, endUnix (optional), interval (optional) | [alarm](/en/http/analysis-machine/#alarm) |
| analyze_count | Machine count analysis | machineID, startUnix, endUnix (optional), interval (optional), enableCountPerProgram (optional) | [count](/en/http/analysis-machine/#count) |
| analyze_cycle | Machine cycle time analysis | machineID, startUnix, endUnix (optional), interval (optional) | [cycle](/en/http/analysis-machine/#cycle) |
| analyze_overall | Machine overall analysis (running/idle/alarm/offline time breakdown) | machineID, startUnix, endUnix (optional), interval (optional) | [overall](/en/http/analysis-machine/#overall) |
| analyze_group_oee | Machine group OEE analysis | groupID, startUnix, endUnix (optional), interval (optional) | [oee](/en/http/analysis-group/#oee) |
| analyze_group_overall | Machine group overall analysis | groupID, startUnix, endUnix (optional), interval (optional) | [overall](/en/http/analysis-group/#overall) |
| query_machine_history | Query historical machine data | machineID, type (data type), startUnix, endUnix (optional), limit (optional) | [machine](/en/http/history/#machine) |

### 6.4.4. System Information {#tools-system}

| Tool | Description | Parameters | Interface |
| --- | --- | --- | --- |
| get_core_info | Get Core service information | none | [info](/en/http/core-functions/#info) |
| get_core_license_info | Get license information (licensed machine count, expiry) | none | [license-info](/en/http/core-functions/#license-info) |
| get_core_service_status | Get the Core service running status | none | [service-status](/en/http/core-functions/#service-status) |
| get_hardware_resources | Get gateway hardware resource usage (CPU, memory, disk) | none | [hardware-resources](/en/http/gateway-functions/#hardware-resources) |
| get_gateway_time | Get the gateway's current time and time zone | none | [time](/en/http/gateway-functions/#time) |
| get_network_adapters | List the gateway's network adapters | none | [network-adapters](/en/http/gateway-functions/#network-adapters) |
| get_error_log | Query the gateway's interface error log | startUnix (optional), endUnix (optional) | `/api/log/error` |

## 6.5. Results and Errors {#result}

On success, a tool returns the response body of the corresponding HTTP interface (a JSON string); see each interface's section for field descriptions.

On failure, a tool returns an MCP tool error (`isError`) whose message has the format:

```
{interface path} failed: {error code name}({errorCode}) {error description}
```

For example, querying a machine that does not exist:

```
/cnc/readCNCStatus failed: GENERAL_MACHINE_ID_NOT_EXISTED(10003)
```

The errorCode is exactly the same as that of the HTTP interfaces; see [2.2. Error Handling](/en/http/#error-handling).

## 6.6. Limitations {#limitations}

- All tools are **read-only**; they provide no way to modify configuration, control machines, or transfer files. Use the HTTP interfaces for write operations.
- The following interfaces have no MCP tools: interfaces that return file streams (file transfer, log download), the free-form historical data query interface, and interfaces carrying sensitive information such as user configuration and security settings.
- The amount of data returned depends on machine response and the time window; for analysis tools prefer a short time window, and for historical data queries use the limit parameter.
- If no physical machine tool is available, use a [mock machine](/en/mock-testing/) to test the MCP tools.
