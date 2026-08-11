---
title: "2.10.2. Gateway 服务功能接口"
sidebar:
  label: "2.10.2. Gateway 服务功能"
---


基地址 `/api/gateway`。

## 2.10.2.1. alias 获取网关名称 {#alias}

此接口无请求参数。

```http
GET /api/gateway/alias
```

返回示例

```json
{
  "alias": "iotgw"
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| alias | String | (必需)网关名称 |

## 2.10.2.2. update-alias 修改网关名称 {#update-alias}

注：此修改在硬件重启后生效。

```http
POST /api/gateway/update-alias
```

请求体示例 application/json

```json
{
  "alias": "newAlias"
}
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| alias | String | (必需)网关名称 |

返回示例

```json
{
  "errorCode": 0,
  "errorMsg": "Success"
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| errorCode | Int32 | (必需)错误码，0 代表成功。 |
| errorMsg | String | (必需)错误内容 |

## 2.10.2.3. reboot 网关硬件重启 {#reboot}

等效于在网关管理页面点击“电源”-“重启”按键。此接口无请求参数。

```http
GET /api/gateway/reboot
```

返回示例

```json
{
  "errorCode": 0,
  "errorMsg": "Success"
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| errorCode | Int32 | (必需)错误码，0 代表成功。 |
| errorMsg | String | (必需)错误内容 |

## 2.10.2.4. restart 重启所有服务 {#restart}

此接口用于重启 Core 服务与 Gateway 服务。此重启服务与网关主页的“重启服务”按键功能不同。此接口无请求参数。

```http
GET /api/gateway/restart
```

返回示例

```json
{
  "errorCode": 0,
  "errorMsg": "Success"
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| errorCode | Int32 | (必需)错误码，0 代表成功。 |
| errorMsg | String | (必需)错误内容 |

## 2.10.2.5. restart-service 重启 Core 服务 {#restart-service}

用户修改了机台配置、机组配置、任务配置，或通讯配置后，需要使用此接口，等效于在网关主页点击“重启服务”按键。此接口无请求参数。

```http
GET /api/gateway/restart-service
```

返回示例

```json
{
  "errorCode": 0,
  "errorMsg": "Success"
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| errorCode | Int32 | (必需)错误码，0 代表成功。 |
| errorMsg | String | (必需)错误内容 |

## 2.10.2.6. shut-down 网关关机 {#shut-down}

等效于在网关管理页面点击“电源”-“关机”按键。此接口无请求参数。

```http
GET /api/gateway/shut-down
```

返回示例

```json
{
  "errorCode": 0,
  "errorMsg": "Success"
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| errorCode | Int32 | (必需)错误码，0 代表成功。 |
| errorMsg | String | (必需)错误内容 |

## 2.10.2.7. internet-connection 获取网关网络状态 {#internet-connection}

获取网关与因特网的连接状态。此接口无请求参数。

```http
GET /api/gateway/internet-connection
```

返回示例

```json
{
  "isOnline": true
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| isOnline | Bool | (必需)是否联网，true=已连接，false=未连接。 |

## 2.10.2.8. hardware-resources 获取网关硬件资源 {#hardware-resources}

获取网关的 CPU、内存与磁盘占用情况，用于监控网关运行负载。此接口无请求参数。

```http
GET /api/gateway/hardware-resources
```

返回示例

```json
{
  "cpuUsage": 12.5,
  "physicalMemoryUsage": 48.3,
  "pagingMemoryUsage": 35.1,
  "virtualMemoryUsage": 22.7,
  "diskTotalBytes": 500000000000,
  "diskUsedBytes": 205800000000,
  "diskUsage": 41.16
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| cpuUsage | Float | CPU 占用率（百分比，0~100）。 |
| physicalMemoryUsage | Float | 物理内存占用率（百分比，0~100）。 |
| pagingMemoryUsage | Float | 分页内存（页面文件）占用率（百分比，0~100）。 |
| virtualMemoryUsage | Float | 虚拟内存占用率（百分比，0~100）。 |
| diskTotalBytes | Int64 | 磁盘总容量（字节）。 |
| diskUsedBytes | Int64 | 磁盘已用容量（字节）。 |
| diskUsage | Float | 磁盘占用率（百分比，0~100）。 |

:::note[注]
以上返回参数均为可选。CPU 占用为一项；物理内存、分页内存、虚拟内存三项内存指标为一组；磁盘总容量、已用容量、磁盘占用率三项磁盘指标为一组。如果网关无法获取某一组指标（如所在系统不支持），该组字段会从返回结果中一并省略。
:::

## 2.10.2.9. time 获取网关当前时间 {#time}

此接口无请求参数。

```http
GET /api/gateway/time
```

返回示例

```json
{
  "localTime": "2025-06-30T05:51:19.286Z"
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| localTime | String | (必需)网关当前时间，按 UTC 输出（ISO 8601，格式 yyyy-MM-ddTHH:mm:ss.fffZ）。 |

## 2.10.2.10. sync-time 同步网关时间 {#sync-time}

```http
GET /api/gateway/sync-time
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| timeServerAddress | String | (必需)时间服务器地址，多个地址用“;”分隔，网关会首先尝试与第一个地址同步时间，如失败，则尝试下一个地址，示例：ntp1.aliyun.com;ntp2.aliyun.com;ntp3.aliyun.com;ntp4.aliyun.com; |

返回示例

```json
{
  "errorCode": 0,
  "errorMsg": "Success"
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| errorCode | Int32 | (必需)错误码，0 代表成功。 |
| errorMsg | String | (必需)错误内容 |

## 2.10.2.11. time-zone 获取网关时区 {#time-zone}

此接口无请求参数。

```http
GET /api/gateway/time-zone
```

返回示例

```json
{
  "timeZoneID": "China Standard Time"
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| timeZoneID | String | (必需)网关时区（Microsoft Windows 时区 ID） |

## 2.10.2.12. time-zones 获取时区选项 {#time-zones}

此接口无请求参数。

```http
GET /api/gateway/time-zones
```

返回示例

```json
{
  "timeZoneIDs": [
  "Afghanistan Standard Time",
  "Alaskan Standard Time",
  "Aleutian Standard Time",
  "…",
  "China Standard Time",
  "…"
  ]
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| timeZoneIDs | String[] | (必需)网关时区选项（Microsoft Windows 时区 ID），列表按时区 ID 字母序排序。 |

## 2.10.2.13. update-time-zone 修改网关时区 {#update-time-zone}

```http
POST /api/gateway/update-time-zone
```

请求体示例 application/json

```json
{
  "timeZoneID": "China Standard Time"
}
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| timeZoneID | String | (必需)网关时区（Microsoft Windows 时区 ID），可通过 [2.10.2.12. time-zones 获取时区选项](#time-zones)获得可用选项。 |

返回示例

```json
{
  "errorCode": 0,
  "errorMsg": "Success"
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| errorCode | Int32 | (必需)错误码，0 代表成功。 |
| errorMsg | String | (必需)错误内容 |

## 2.10.2.14. network-adapters 获取网关网络适配器列表 {#network-adapters}

此接口无请求参数。

```http
GET /api/gateway/network-adapters
```

返回示例

```json
{
  "names": [
  "LAN1",
  "LAN2",
  "WLAN"
  ]
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| names | String[] | (必需)网络适配器名称 |

## 2.10.2.15. lan 获取有线网设置 {#lan}

```http
GET /api/gateway/lan
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| name | String | (必需)网络适配器名称，范围：LAN1 或 LAN2。 |

返回示例

```json
{
  "name": "LAN1",
  "macAddress": "00:E0:71:BC:D2:53",
  "state": "Disconnected",
  "isDHCPEnabled": false,
  "ipAddress": "192.168.100.1",
  "subMask": "255.255.0.0",
  "defaultGateway": "",
  "isDNSServerDHCPEnabled": false,
  "dnsServer1": "",
  "dnsServer2": ""
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| name | String | (必需)网络适配器名称，范围：LAN1 或 LAN2。 |
| macAddress | String | (必需)物理地址 |
| state | String | (必需)状态，范围：Connected，Disconnected。 |
| isDHCPEnabled | Bool | (必需)自动获得 IP 地址 |
| ipAddress | String | (必需)IP 地址 |
| subMask | String | (必需)子网掩码 |
| defaultGateway | String | (必需)默认网关 |
| isDNSServerDHCPEnabled | Bool | (必需)自动获得 DNS 服务器地址 |
| dnsServer1 | String | (必需)首选 DNS 服务器 |
| dnsServer2 | String | (必需)备用 DNS 服务器 |

## 2.10.2.16. update-lan 修改网关有线网设置 {#update-lan}

```http
POST /api/gateway/update-lan
```

请求体示例 application/json

```json
{
  "name": "LAN1",
  "isDHCPEnabled": false,
  "ipAddress": "192.168.100.1",
  "subMask": "255.255.0.0",
  "defaultGateway": "",
  "isDNSServerDHCPEnabled": false,
  "dnsServer1": "",
  "dnsServer2": ""
}
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| name | String | (必需)目标网络适配器名称，范围：LAN1 或 LAN2。 |
| isDHCPEnabled | Bool | 自动获得 IP 地址 |
| ipAddress | String | IP 地址 |
| subMask | String | 子网掩码 |
| defaultGateway | String | 默认网关 |
| isDNSServerDHCPEnabled | Bool | 自动获得 DNS 服务器地址 |
| dnsServer1 | String | 首选 DNS 服务器 |
| dnsServer2 | String | 备用 DNS 服务器 |

返回示例

```json
{
  "name": "LAN1",
  "macAddress": "00:E0:71:BC:D2:53",
  "state": "Disconnected",
  "isDHCPEnabled": false,
  "ipAddress": "192.168.100.1",
  "subMask": "255.255.0.0",
  "defaultGateway": "",
  "isDNSServerDHCPEnabled": false,
  "dnsServer1": "",
  "dnsServer2": ""
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| name | String | (必需)网络适配器名称，范围：LAN1 或 LAN2。 |
| macAddress | String | (必需)物理地址 |
| state | String | (必需)状态，范围：Connected，Disconnected。 |
| isDHCPEnabled | Bool | (必需)自动获得 IP 地址 |
| ipAddress | String | (必需)IP 地址 |
| subMask | String | (必需)子网掩码 |
| defaultGateway | String | (必需)默认网关 |
| isDNSServerDHCPEnabled | Bool | (必需)自动获得 DNS 服务器地址 |
| dnsServer1 | String | (必需)首选 DNS 服务器 |
| dnsServer2 | String | (必需)备用 DNS 服务器 |

## 2.10.2.17. wifi 获取无线网设置 {#wifi}

此接口无请求参数。

```http
GET /api/gateway/wifi
```

返回示例

```json
{
  "wifiName": "myWifi-5G",
  "signalStrength": 99,
  "macAddress": "00:A0:71:BD:E2:63",
  "state": "Connected",
  "isDHCPEnabled": true,
  "ipAddress": "192.168.1.88",
  "subMask": "255.255.255.0",
  "defaultGateway": "192.168.1.1",
  "isDNSServerDHCPEnabled": true,
  "dnsServer1": "192.168.211.1",
  "dnsServer2": "8.8.8.8"
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| wifiName | String | 无线网络 SSID |
| signalStrength | Int32 | 范围：0-100，越大信号越强 |
| macAddress | String | (必需)物理地址 |
| state | String | (必需)状态，范围：Connected，Disconnected。 |
| isDHCPEnabled | Bool | (必需)自动获得 IP 地址 |
| ipAddress | String | (必需)IP 地址 |
| subMask | String | (必需)子网掩码 |
| defaultGateway | String | (必需)默认网关 |
| isDNSServerDHCPEnabled | Bool | (必需)自动获得 DNS 服务器地址 |
| dnsServer1 | String | (必需)首选 DNS 服务器 |
| dnsServer2 | String | (必需)备用 DNS 服务器 |

:::note[注]
仅当 state 为 Connected 时才返回 wifiName 与 signalStrength；未连接时这两个字段不会出现在返回结果中。
:::

## 2.10.2.18. update-wifi 修改无线网设置 {#update-wifi}

```http
POST /api/gateway/update-wifi
```

请求体示例 application/json

```json
{
  "isDHCPEnabled": true,
  "ipAddress": "192.168.1.88",
  "subMask": "255.255.255.0",
  "defaultGateway": "192.168.1.1",
  "isDNSServerDHCPEnabled": true,
  "dnsServer1": "192.168.211.1",
  "dnsServer2": "8.8.8.8"
}
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| isDHCPEnabled | Bool | 自动获得 IP 地址 |
| ipAddress | String | IP 地址 |
| subMask | String | 子网掩码 |
| defaultGateway | String | 默认网关 |
| isDNSServerDHCPEnabled | Bool | 自动获得 DNS 服务器地址 |
| dnsServer1 | String | 首选 DNS 服务器 |
| dnsServer2 | String | 备用 DNS 服务器 |

返回示例

```json
{
  "wifiName": "myWifi-5G",
  "signalStrength": 99,
  "macAddress": "00:A0:71:BD:E2:63",
  "state": "Connected",
  "isDHCPEnabled": true,
  "ipAddress": "192.168.1.88",
  "subMask": "255.255.255.0",
  "defaultGateway": "192.168.1.1",
  "isDNSServerDHCPEnabled": true,
  "dnsServer1": "192.168.211.1",
  "dnsServer2": "8.8.8.8"
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| wifiName | String | 无线网络 SSID |
| signalStrength | Int32 | 范围：0-100，越大信号越强 |
| macAddress | String | (必需)物理地址 |
| state | String | (必需)状态，范围：Connected，Disconnected。 |
| isDHCPEnabled | Bool | (必需)自动获得 IP 地址 |
| ipAddress | String | (必需)IP 地址 |
| subMask | String | (必需)子网掩码 |
| defaultGateway | String | (必需)默认网关 |
| isDNSServerDHCPEnabled | Bool | (必需)自动获得 DNS 服务器地址 |
| dnsServer1 | String | (必需)首选 DNS 服务器 |
| dnsServer2 | String | (必需)备用 DNS 服务器 |

:::note[注]
仅当 state 为 Connected 时才返回 wifiName 与 signalStrength；未连接时这两个字段不会出现在返回结果中。
:::

## 2.10.2.19. search-wifi 搜索无线网 {#search-wifi}

此接口无请求参数。

```http
GET /api/gateway/search-wifi
```

返回示例

```json
[
  {
    "wifiName": "myWifi-5G",
    "signalStrength": 99,
    "state": "Connected"
  },
  {
    "wifiName": "myWifi-2.4G",
    "signalStrength": 99,
    "state": "Disconnected"
  }
]
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| wifiName | String | (必需)无线网络 SSID |
| signalStrength | Int32 | 范围：0-100，越大信号越强 |
| state | String | (必需)状态，范围：Connected，Disconnected。 |

## 2.10.2.20. connect-wifi 连接无线网 {#connect-wifi}

```http
GET /api/gateway/connect-wifi
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| wifiName | String | (必需)目标无线网络 SSID |
| wifiPassword | String | 目标无线网络密码 |

返回示例

```json
{
  "errorCode": 0,
  "errorMsg": "Success"
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| errorCode | Int32 | (必需)错误码，0 代表成功。 |
| errorMsg | String | (必需)错误内容 |

## 2.10.2.21. disconnect-wifi 断开无线网 {#disconnect-wifi}

此接口无请求参数。

```http
GET /api/gateway/disconnect-wifi
```

返回示例

```json
{
  "errorCode": 0,
  "errorMsg": "Success"
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| errorCode | Int32 | (必需)错误码，0 代表成功。 |
| errorMsg | String | (必需)错误内容 |

## 2.10.2.22. static-routing 获取静态路由设置 {#static-routing}

此接口无请求参数。

```http
GET /api/gateway/static-routing
```

返回示例

```json
{
  "staticRouting": "0.0.0.0, 0.0.0.0, 192.168.100.1;"
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| staticRouting | String | (必需)静态路由。多条路由以“;”分隔，每条格式为“IP, 子网掩码, 网关”。 |

## 2.10.2.23. update-static-routing 修改静态路由设置 {#update-static-routing}

```http
POST /api/gateway/update-static-routing
```

请求体示例 application/json

```json
{
  "staticRouting": "0.0.0.0, 0.0.0.0, 192.168.100.1;"
}
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| staticRouting | String | (必需)静态路由。多条路由以“;”分隔，每条格式为“IP, 子网掩码, 网关”；传空字符串表示清空全部持久路由；格式非法时返回错误代码 10012（IP 地址无效）。 |

返回示例

```json
{
  "staticRouting": "0.0.0.0, 0.0.0.0, 192.168.100.1;"
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| staticRouting | String | (必需)静态路由。多条路由以“;”分隔，每条格式为“IP, 子网掩码, 网关”。 |

## 2.10.2.24. connect-remote-host 连接远程服务器 {#connect-remote-host}

此接口无请求参数。

```http
GET /api/gateway/connect-remote-host
```

返回示例

```json
{
  "errorCode": 0,
  "errorMsg": "Success"
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| errorCode | Int32 | (必需)错误码，0 代表成功。 |
| errorMsg | String | (必需)错误内容 |

## 2.10.2.25. disconnect-remote-host 断开远程服务器 {#disconnect-remote-host}

此接口无请求参数。

```http
GET /api/gateway/disconnect-remote-host
```

返回示例

```json
{
  "errorCode": 0,
  "errorMsg": "Success"
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| errorCode | Int32 | (必需)错误码，0 代表成功。 |
| errorMsg | String | (必需)错误内容 |

## 2.10.2.26. file-server-items 获取网关文件服务器列表 {#file-server-items}

获取网关文件服务器根目录下的文件与子目录列表。子目录与机台对应，名称为机台的 IP 地址。此接口无请求参数。

```http
GET /api/gateway/file-server-items
```

返回示例

```json
{
  "totalSpace": "10.00 GB",
  "usedSpace": "120 B",
  "files": [
  ],
  "subDirs": [
    {
      "name": "127.0.0.1",
      "size": "20 B",
      "machineName": "1",
      "machineID": "1",
      "ip": "127.0.0.1",
      "status": "Activated"
    },
    {
      "name": "127.0.0.2",
      "size": "100 B",
      "machineName": "2",
      "machineID": "2",
      "ip": "127.0.0.2",
      "status": "Activated"
    }
  ]
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| totalSpace | String | (必需)总空间 |
| usedSpace | String | (必需)已使用空间 |
| files | Object[] | (必需)根目录下的文件列表，一般为空。 |
| subDirs | Object[] | (必需)根目录下的子目录列表。 |
| name | String | 文件/目录名 |
| size | String | 文件/目录大小 |
| machineName | String | 关联机台名称 |
| machineID | String | 关联机台标识 |
| ip | String | 关联机台 ip |
| status | String | 状态，范围 Unlinked（未关联），Activated（已激活），Unactivated（未激活）。 |

## 2.10.2.27. delete-file-server-item 删除网关文件服务器项目 {#delete-file-server-item}

删除根目录下指定文件或子目录。

```http
GET /api/gateway/delete-file-server-item
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| fileName | String | 文件名 |
| dirName | String | 子目录名 |

返回示例

```json
{
  "errorCode": 0,
  "errorMsg": "Success"
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| errorCode | Int32 | (必需)错误码，0 代表成功。 |
| errorMsg | String | (必需)错误内容 |

## 2.10.2.28. ping 网络连通性测试 {#ping}

从网关向目标主机发送 ICMP 回显请求，用于测试网关到目标主机的连通性。单次探测超时为 1000 毫秒。

```http
GET /api/gateway/ping
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| host | String | (必需)目标 IP 地址或主机名 |
| count | Int32 | 探测次数，默认 4，最大 10，超出最大值返回错误。 |

返回示例

```json
{
  "isReachable": true,
  "repliesMs": [
    12,
    11,
    null,
    13
  ]
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| isReachable | Bool | (必需)目标是否可达，任一次探测收到回复即为 true。 |
| repliesMs | Int64[] | (必需)每次探测的往返耗时（毫秒），该次探测超时未收到回复时为 null。 |

## 2.10.2.29. telnet 端口连通性测试 {#telnet}

从网关向目标主机的指定端口发起 TCP 连接，用于测试端口是否可达。连接超时为 3000 毫秒。

```http
GET /api/gateway/telnet
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| host | String | (必需)目标 IP 地址或主机名 |
| port | Int32 | (必需)目标端口，范围：1~65535。 |

返回示例

```json
{
  "isConnected": true
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| isConnected | Bool | (必需)是否能在 3 秒内建立 TCP 连接。 |

## 2.10.2.30. traceroute 路由追踪 {#traceroute}

从网关逐跳追踪到目标主机的网络路径。逐跳超时为 3000 毫秒。

```http
GET /api/gateway/traceroute
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| host | String | (必需)目标 IP 地址或主机名 |
| maxHops | Int32 | 最大跳数，默认 30，最大 64，超出最大值返回错误。 |

返回示例

```json
{
  "reachedTarget": true,
  "hops": [
    {
      "hop": 1,
      "address": "192.168.1.1",
      "rttMs": 1
    },
    {
      "hop": 2,
      "address": null,
      "rttMs": null
    }
  ]
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| reachedTarget | Bool | (必需)是否追踪到目标主机。 |
| hops | Object[] | (必需)逐跳结果列表。 |
| hop | Int32 | 跳数（TTL），从 1 开始。 |
| address | String | 该跳响应节点的 IP 地址，该跳未响应时为 null。 |
| rttMs | Int64 | 该跳往返耗时（毫秒），该跳未响应时为 null。 |

## 2.10.2.31. scan-ports 端口扫描 {#scan-ports}

对目标主机的一组端口逐个发起 TCP 连接，检测端口是否开放。单端口连接超时为 1000 毫秒。

```http
POST /api/gateway/scan-ports
```

请求体示例 application/json

```json
{
  "host": "192.168.1.1",
  "startPort": 80,
  "endPort": 88,
  "ports": [
    443,
    8080
  ]
}
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| host | String | (必需)目标 IP 地址或主机名 |
| startPort | Int32 | 端口区间起始值（闭区间），不得大于 endPort。 |
| endPort | Int32 | 端口区间结束值（闭区间）。 |
| ports | Int32[] | 需扫描的端口列表，与端口区间合并去重。 |

:::note[注]
端口区间与 ports 至少需给出一项，合并去重后为空时返回错误。端口取值范围为 1~65535，合并去重后的端口总数不得超过 1024。
:::

返回示例

```json
{
  "ports": [
    {
      "port": 80,
      "isOpen": true
    },
    {
      "port": 443,
      "isOpen": false
    }
  ]
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| ports | Object[] | (必需)端口扫描结果列表。 |
| port | Int32 | 端口号 |
| isOpen | Bool | 端口是否开放 |

## 2.10.2.32. lookup-dns DNS 解析 {#lookup-dns}

在网关上解析指定主机名，返回对应的 IP 地址列表。

```http
GET /api/gateway/lookup-dns
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| host | String | (必需)待解析的主机名 |

返回示例

```json
{
  "addresses": [
    "142.250.196.238"
  ]
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| addresses | String[] | (必需)解析到的 IP 地址列表；无法解析时为空数组，不返回错误码。 |
