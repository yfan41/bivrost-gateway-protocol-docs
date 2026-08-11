---
title: "4.2. RPC 接口"
sidebar:
  label: "4.2. RPC 接口"
---


网关支持基于 MQTT 协议的 RPC 接口，用户必须在网关管理页面设定 RPC 请求主题和 RPC 回复主题，详见《说明书》[5.6.3. MQTT 配置](https://docs.bivrost.cn/gateway/usage/communication#mqtt)。设定完成后网关会监听 RPC 请求主题，并将 RPC 请求的结果发布至 RPC 回复主题。RPC 接口数据编码为 MQTT 配置中设定的编码。

如果需要在主题中嵌入 RPC 请求的标识，可在需要嵌入标识的位置使用通配符 `${request_id}` 表示。

例如在本节示例中，RPC 请求主题设置为：`request/${request_id}`，RPC 回复主题设置为：`response/${request_id}`。按照此设置，当网关接收到 `request/24` 的请求时，网关会将执行结果发布至主题 `response/24`。

`${request_id}` 的位置建议放在主题的尾部。如果需要把 `${request_id}` 位置放于主题中间，`${request_id}` 前必须有 `/` 作为分隔符。

网关 MQTT 协议支持多种报文模式，包括 Default，MKT，Brm，TB，TB2 等。

## RPC 请求报文格式 {#request-format}

不同模式下 RPC 请求的数据格式：

### Default/MKT/Brm 模式 {#request-default}

```json
{
  "id": <request_id>,
  "method": "<method>",
  "params": <params>
}
```

:::note[注]
在 Default/MKT/Brm 模式下，`params` 字段必须存在，且必须是 JSON 对象（或内容为 JSON 对象的字符串）；缺失、null、数组或标量的请求会被网关直接丢弃，网关仅记录 `GENERAL_API_INVALID_REQUEST` 错误，不会发布任何回复报文。无输入参数的命令（如 `settings`、`users`、`time`、`service-status` 等）也必须发送 `"params": {}`。TB 模式在 `params` 缺失或为 null 时会自动替换为空对象，TB2 模式接受 JSON null。
:::

### TB/TB2 模式 {#request-tb}

```json
{
  "device": "<deviceName>",
  "data": {
    "id": "<request_id>",
    "method": "<method>",
    "params": <params>
  }
}
```

### WisIoT/IoTDA 模式 {#request-wisiot-iotda}

WisIoT/IoTDA 模式沿用 [Default/MKT/Brm 模式](/mqtt/rpc/#request-default) 的请求报文格式。

其中 `<request_id>` 为请求标识；`<method>` 为 RPC 命令；`<params>` 为 RPC 命令的输入参数；`<deviceName>` 为机台名称。

:::note[注]
在 TB/TB2 模式下，`<params>` 中的参数 "machineID" 与 "groupID" 均无需输入，网关会根据 `<deviceName>` 覆盖这两个参数，机台与机组均由 `<deviceName>` 指定。在 TB2 模式下，`<deviceName>` 直接作为实体标识使用，若 `<deviceName>` 不是已知的机台或机组实体标识，请求将被直接丢弃，网关仅记录 `GENERAL_API_INVALID_REQUEST` 错误，不会发布任何回复报文。
:::

## RPC 回复报文格式 {#reply-format}

不同模式下 RPC 回复的报文格式：

### Default/MKT/Brm 模式 {#reply-default}

```json
{
  "id": <request_id>,
  "data": <response>
}
```

### TB/TB2 模式 {#reply-tb}

```json
{
  "device": "<deviceName>",
  "id": <request_id>,
  "data": <response>
}
```

### WisIoT/IoTDA 模式 {#reply-wisiot-iotda}

WisIoT/IoTDA 模式沿用 [Default/MKT/Brm 模式](/mqtt/rpc/#reply-default) 的回复报文格式。

其中 `<response>` 为 RPC 命令的返回结果；`<deviceName>` 为机台名称；`<request_id>` 为自定义请求标识。

## 支持的 RPC 命令 {#commands}

当前网关支持以下 RPC 命令：

### 数据读写接口-直接读写，前缀 /cnc/ {#commands-cnc-direct}

| RPC 命令 | 说明 |
| --- | --- |
| readAlarm | 读取警报信息 |
| readCNCStatus | 读取机台状态 |
| readCNCStatusDetails | 读取机台状态详情 |
| readCount | 读取加工计数 |
| readCurrentToolNumber | 读取当前刀号 |
| readEnergyConsum | 读取能耗数据 |
| readFeed | 读取进给数据 |
| readFeedAndSpindle | 读取进给转速数据 |
| readLaserPower | 读取激光功率 |
| readLoad | 读取负载数据 |
| readLog | 读取日志信息 |
| readOffsetData | 读取刀补数据 |
| batchReadOffsetData | 批量读取刀具补偿 |
| writeOffsetData | 写入刀补数据 |
| readPosition | 读取坐标数据 |
| readProgramBlock | 读取当前程序段 |
| readProgramInfo | 读取当前程序 |
| readPlcData | 读取 PLC 数据 |
| writePlcData | 写入 PLC 数据 |
| readTimeData | 读取机台时间数据 |
| readToolLife | 读取刀具寿命 |
| batchReadToolLife | 批量读取刀具寿命 |
| readToolLifeDetails | 读取刀具寿命详情 |
| batchReadToolLifeDetails | 批量读取刀具寿命详情 |

### 数据读写接口-缓存读取，前缀 /cnc/ {#commands-cnc-cached}

| RPC 命令 | 说明 |
| --- | --- |
| readTaskData | 读取机台任务数据 |
| batchReadTaskData | 批量读取机台任务数据 |
| readGroupTaskData | 读取机组任务数据 |
| batchReadGroupTaskData | 批量读取机组任务数据 |
| batchReadErrors | 批量读取机台连接状态 |
| readErrorSummary | 读取状态简报 |

### 文件管理接口，前缀 /cnc/ {#commands-cnc-files}

| RPC 命令 | 说明 |
| --- | --- |
| readProgramList | 读取机台文件列表 |
| receiveFile | 接收机台文件 |
| readCurrentProgram | 接收机台当前运行的文件 |
| sendFile | 发送文件至机台 |
| batchSendFile | 批量发送文件至机台 |
| deleteFile | 删除机台文件 |
| batchDeleteFile | 批量删除机台文件 |
| lockFileByRange | 锁定/解锁机台程序编辑 |
| createDir | 创建机台目录 |
| deleteDir | 删除机台目录 |
| selectProgram | 选择程序 |
| readAllPrograms | 浏览所有文件 |
| searchFile | 搜索机台文件 |

### 机台数据分析接口，前缀 /analysis/ {#commands-analysis}

| RPC 命令 | 说明 |
| --- | --- |
| oee | 机台 OEE 数据分析 |
| alarm | 机台警报数据分析 |
| count | 机台计数数据分析 |
| overall | 机台综合数据分析 |
| cycle | 机台节拍数据分析 |

### 机组数据分析接口，前缀 /group-analysis/ {#commands-group-analysis}

| RPC 命令 | 说明 |
| --- | --- |
| oee | 机组 OEE 数据分析 |
| alarm | 机组警报数据分析 |
| count | 机组计数数据分析 |
| overall | 机组综合数据分析 |
| cycle | 机组节拍数据分析 |

### 历史数据接口，前缀 /db/ {#commands-db}

| RPC 命令 | 说明 |
| --- | --- |
| machine | 机台历史数据 |
| group-machine | 机组内所有机台历史数据 |
| query | 查询历史数据 |

### 全局配置接口，前缀 /config/ {#commands-config-global}

| RPC 命令 | 说明 |
| --- | --- |
| gateway-info | 获取网关信息 |
| settings | 获取网关全局设置 |
| update-settings | 修改网关全局设置 |
| security | 获取网关全局安全设置 |
| update-security | 修改网关全局安全设置 |
| backup | 备份网关配置 |
| restore | 还原网关配置 |
| reset | 重置网关配置 |

### 用户配置接口，前缀 /config/ {#commands-config-users}

| RPC 命令 | 说明 |
| --- | --- |
| user | 获取用户设置 |
| users | 获取所有用户设置 |
| create-user | 创建新用户 |
| update-user | 修改用户设置 |
| delete-user | 删除用户 |
| user-security | 获取用户安全设置 |
| update-user-security | 修改用户安全设置 |

### 机台配置接口，前缀 /config/ {#commands-config-machines}

| RPC 命令 | 说明 |
| --- | --- |
| machine | 获取机台配置 |
| machines | 获取所有机台配置 |
| create-machine | 添加机台配置 |
| update-machine | 修改机台配置 |
| delete-machine | 删除机台配置 |
| batch-delete-machines | 批量删除机台配置 |

### 机组配置接口，前缀 /config/ {#commands-config-groups}

| RPC 命令 | 说明 |
| --- | --- |
| group | 获取机组配置 |
| groups | 获取所有机组配置 |
| create-group | 添加机组配置 |
| update-group | 修改机组配置 |
| delete-group | 删除机组配置 |
| batch-delete-groups | 批量删除机组配置 |

### 任务配置接口，前缀 /config/ {#commands-config-tasks}

| RPC 命令 | 说明 |
| --- | --- |
| task-manager-settings | 获取任务管理器设置 |
| update-task-manager-settings | 修改任务管理器设置 |
| machine-task-interval-settings | 获取机台任务间隔设置 |
| update-machine-task-interval-settings | 修改机台任务间隔设置 |
| group-task-interval-settings | 获取机组任务间隔设置 |
| update-group-task-interval-settings | 修改机组任务间隔设置 |
| oee-monitoring-settings | 获取 OEE 监控设置 |
| update-oee-monitoring-settings | 修改 OEE 监控设置 |
| tool-life-monitoring-settings | 获取刀具寿命监控设置 |
| update-tool-life-monitoring-settings | 修改刀具寿命监控设置 |
| count-monitoring-settings | 获取加工计数监控设置 |
| update-count-monitoring-settings | 修改加工计数监控设置 |
| overload-monitoring-settings | 获取过载监控设置 |
| update-overload-monitoring-settings | 修改过载监控设置 |
| alarm-monitoring-settings | 获取警报监控设置 |
| update-alarm-monitoring-settings | 修改警报监控设置 |
| machine-status-monitoring-settings | 获取机台状态监控设置 |
| update-machine-status-monitoring-settings | 修改机台状态监控设置 |

### 通讯配置接口，前缀 /config/ {#commands-config-communication}

| RPC 命令 | 说明 |
| --- | --- |
| cloud-settings | 获取云平台设置 |
| update-cloud-settings | 修改云平台设置 |
| modbus-settings | 获取 MODBUS 设置 |
| update-modbus-settings | 修改 MODBUS 设置 |
| mqtt-settings | 获取 MQTT 设置 |
| update-mqtt-settings | 修改 MQTT 设置 |
| database-settings | 获取数据库设置 |
| update-database-settings | 修改数据库设置 |
| gateway-file-server-settings | 获取网关文件服务器设置 |
| update-gateway-file-server-settings | 修改网关服务器设置 |
| http-settings | 获取 HTTP 设置 |
| update-http-settings | 修改 HTTP 设置 |
| hub-settings | 获取 Hub 设置 |
| update-hub-settings | 修改 Hub 设置 |
| remote-access | 获取远程访问设置 |
| update-remote-access | 修改远程访问设置 |

### Core 服务功能接口，前缀 /core/ {#commands-core}

| RPC 命令 | 说明 |
| --- | --- |
| info | 获取 Core 服务信息 |
| license-info | 获取许可信息 |
| service-status | 获取服务状态 |
| upload-license | 上传网关许可 |
| settings | 获取 Core 服务设置 |
| log-level | 切换日志级别 |
| need-restart | 查询 Core 服务是否需要重启 |

### Gateway 服务功能接口，前缀 /gateway/ {#commands-gateway}

| RPC 命令 | 说明 |
| --- | --- |
| alias | 获取网关名称 |
| update-alias | 修改网关名称 |
| reboot | 网关硬件重启 |
| restart | 重启所有服务 |
| restart-service | 重启 Core 服务 |
| shut-down | 网关关机 |
| internet-connection | 获取网关网络状态 |
| hardware-resources | 获取网关硬件资源 |
| time | 获取网关当前时间 |
| sync-time | 同步网关时间 |
| time-zone | 获取网关时区 |
| time-zones | 获取时区选项 |
| update-time-zone | 修改网关时区 |
| network-adapters | 获取网关网络适配器列表 |
| ping | Ping 网络诊断 |
| telnet | Telnet 端口连通性诊断 |
| traceroute | 路由跟踪诊断 |
| scan-ports | 扫描端口 |
| lookup-dns | DNS 解析查询 |
| lan | 获取有线网设置 |
| update-lan | 修改网关有线网设置 |
| wifi | 获取无线网设置 |
| update-wifi | 修改无线网设置 |
| search-wifi | 搜索无线网 |
| connect-wifi | 连接无线网 |
| disconnect-wifi | 断开无线网 |
| static-routing | 获取静态路由设置 |
| update-static-routing | 修改静态路由设置 |
| connect-remote-host | 连接远程服务器 |
| disconnect-remote-host | 断开远程服务器 |
| file-server-items | 获取网关文件服务器列表 |
| delete-file-server-item | 删除网关文件服务器项目 |

### 日志接口，前缀 /log/ {#commands-log}

| RPC 命令 | 说明 |
| --- | --- |
| access | 读取访问日志 |
| error | 读取错误日志 |

除了鉴权接口，以及返回文件流的接口（`sendFileStream`、`receiveFileStream`、`backupFiles`、`/log/core`、`/log/gateway`）不支持 RPC 调用外，RPC 命令与 [二、HTTP 通讯](/http/)中对应的接口一一对应，输入参数与返回结果可参照 [二、HTTP 通讯](/http/)中的接口说明。

## 示例 {#rpc-examples}

### 示例 1：sendFile 发送文件至机台 {#example-sendfile}

在 Default 模式下，要发送 ASCII 编码的文件内容 "fileContent" 到 machineID 为 1010 的机台的 Dir/Prog 目录下，保存为 2222，应使用请求主题："request/1"，其中 1 为自定义请求标识；请求报文，包括 RPC 命令与参数如下：

```json
{
  "method": "sendFile",
  "params": {
    "machineID": "1010",
    "fileName": "2222",
    "dirAtCNC": "Dir/Prog",
    "data": {
      "content": "fileContent",
      "encoding": "us-ascii"
    }
  }
}
```

其中 machineID，fileName，dirAtCNC 为 HTTP 接口 [2.6.6. sendFile 发送文件至机台](/http/file-management/#sendfile) URL 中的请求参数，直接嵌入 "params" 字段里。POST 请求的请求体应嵌入 "params" 内的 "data" 字段中。

回复主题 "response/1"，回复报文如下：

```json
{
  "data": {
    "errorCode": 0,
    "errorMsg": "Success"
  }
}
```

### 示例 2：writeOffsetData 写入刀补数据 {#example-writeoffsetdata}

在 Default 模式下，要写入刀补号为 1 的刀补数据，应使用请求主题："request/2"，其中 2 为自定义请求标识；请求报文，包括 RPC 命令与参数如下：

```json
{
  "method": "writeOffsetData",
  "params": {
    "machineID": "1010",
    "offsetNum": 1,
    "data": {
      "toolNose": 3,
      "lengthWear": 0.0001,
      "radiusWear": 0.03,
      "lengthGeom": 0.0,
      "radiusGeom": 0.002
    }
  }
}
```

其中 machineID，offsetNum，为 HTTP 接口 [2.5.1.14. writeOffsetData 写入刀补数据](/http/direct-offset-plc/#writeoffsetdata) URL 中的参数，直接嵌入 "params" 字段里。POST 请求的请求体应嵌入 "params" 内的 "data" 字段中。

回复主题 "response/2"，回复报文如下：

```json
{
  "data": {
    "errorCode": 0,
    "errorMsg": "Success"
  }
}
```
