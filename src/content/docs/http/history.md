---
title: "2.8. 历史数据接口"
sidebar:
  label: "2.8. 历史数据接口"
---


历史数据接口用于获取目标机台或机组在指定时间范围内的历史数据，基地址 `/api/db`。

使用历史数据分析接口前，必须开启网关本地缓存开关（详见《说明书》[5.12.2.3. 本地缓存](https://gateway.docs.bivrost.cn/usage/settings)），以允许在网关本地保存历史数据。

使用历史数据分析接口需要补充开始时间戳，结束时间戳。两者间最大长度为 31 天。

本地保存最大时限为 365 天。因此开始时间不可早于当前时间的 365 天前。

如当前时间戳小于输入的结束时间戳，则自动以当前时间戳为结束时间戳。

如网关有一段时间没有接收到机台或机组数据（数据缺失），会导致历史数据接口返回的数据与实际不符。造成数据缺失的常见原因有：网关未开启本地缓存，未开启对应的自动采集任务，网关断电，网关网络中断，以及机台离线等。

## 2.8.1. machine 机台历史数据 {#machine}

机台历史数据用于获取目标机台在指定时间范围内的历史数据。

```http
GET /api/db/machine?machineID=MACHINEID&type=TYPE&startUnix=STARTUNIX&endUnix=ENDUNIX
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| machineID | String | (必需)目标机台标识，详见 [1.1.1. machineID 机台标识](/conventions/identifiers/#machineid) |
| type | String | (必需)数据类，详见 [1.2. 数据说明](/conventions/data-classes/) |
| startUnix | Int64 | (必需)开始时间戳[秒] |
| endUnix | Int64 | (必需)结束时间戳[秒] |

示例

获取 machineID 为 1010 的机台在 2024 年 3 月 1 日上午 10:00 – 11:00 的机台状态历史数据，type=CNCStatus，请求如下：

```http
GET /api/db/machine?machineID=1010&type=CNCStatus&startUnix=1709258400&endUnix=1709262000
```

如果请求的目标机台在指定时间范围内不存在历史数据，返回为空：

```json
[]
```

如存在历史数据，以 JSON 格式返回指定数据类的数据，返回：

```json
[
  {
    "cncStatus": "MANUAL_INC",
    "adjustedStatus": "MANUAL_INC",
    "alarmStatus": "ALARM",
    "alarmLevel": "WRN",
    "offTime": 2329,
    "waitTime": 3212,
    "emergencyTime": 232,
    "autoRunTime": 1336,
    "manualTime": 1232,
    "machineID": "2112",
    "time": "2024-03-01T02:22:11.442Z"
  },
  {
    "cncStatus": "MANUAL_INC",
    "adjustedStatus": "MANUAL_INC",
    "alarmStatus": "ALARM",
    "alarmLevel": "WRN",
    "offTime": 2329,
    "waitTime": 3212,
    "emergencyTime": 232,
    "autoRunTime": 1336,
    "manualTime": 1237,
    "machineID": "2112",
    "time": "2024-03-01T02:22:16.44Z"
  },
  ...
]
```

返回参数中，machineID 是机台的 machineID（见 [1.1. 基本说明](/conventions/identifiers/)），time 是数据的获取时间。其它返回参数详见 [1.2. 数据说明](/conventions/data-classes/)中对应 `type` 包含的 `field` 与 `tag` 内容说明。

## 2.8.2. group-machine 机组内所有机台历史数据 {#group-machine}

用于获取目标机组内所有机台在指定时间范围内的历史数据。

```http
GET /api/db/group-machine?groupID=GROUPID&type=TYPE&startUnix=STARTUNIX&endUnix=ENDUNIX
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| groupID | String | (必需)目标机组标识，详见 [1.1.2. groupID 机组标识](/conventions/identifiers/#groupid) |
| type | String | (必需)数据类，详见 [1.2. 数据说明](/conventions/data-classes/) |
| startUnix | Int64 | (必需)开始时间戳[秒] |
| endUnix | Int64 | (必需)结束时间戳[秒] |

示例

获取 groupID 为 g1 的机组内所有机台在 2024 年 3 月 1 日上午 10:00 – 11:00 的机台状态历史数据，type=CNCStatus，请求如下：

```http
GET /api/db/group-machine?groupID=g1&type=CNCStatus&startUnix=1709258400&endUnix=1709262000
```

如果请求的目标机台在指定时间范围内不存在历史数据，返回为空 Array：

```json
[]
```

如存在历史数据，以 JSON 格式返回指定数据类的数据，返回：

```json
[
  {
    "cncStatus": "MANUAL_INC",
    "adjustedStatus": "MANUAL_INC",
    "alarmStatus": "ALARM",
    "alarmLevel": "WRN",
    "offTime": 2329,
    "waitTime": 3212,
    "emergencyTime": 232,
    "autoRunTime": 1336,
    "manualTime": 1232,
    "machineID": "2112",
    "time": "2024-03-01T02:22:11.442Z"
  },
  {
    "cncStatus": "MANUAL_INC",
    "adjustedStatus": "MANUAL_INC",
    "alarmStatus": "ALARM",
    "alarmLevel": "WRN",
    "offTime": 2329,
    "waitTime": 3212,
    "emergencyTime": 232,
    "autoRunTime": 1336,
    "manualTime": 1237,
    "machineID": "2112",
    "time": "2024-03-01T02:22:16.44Z"
  },
  ...
  {
    "cncStatus": "AUTO_RUN",
    "adjustedStatus": "AUTO_RUN",
    "alarmStatus": "NO_ALARM",
    "offTime": 12229,
    "waitTime": 12312,
    "emergencyTime": 2332,
    "autoRunTime": 52332,
    "manualTime": 6132,
    "machineID": "3",
    "time": "2024-03-01T02:19:29.308Z"
  },
  ...
]
```

返回参数中，machineID 是机台的 machineID（见 [1.1. 基本说明](/conventions/identifiers/)），time 是数据的获取时间。其它返回参数详见 [1.2. 数据说明](/conventions/data-classes/)中对应 `type` 包含的 `field` 与 `tag` 内容说明。

## 2.8.3. query 查询历史数据 {#query}

查询符合条件的历史数据。类似数据库的查询命令。

```http
POST /api/db/query?groupID=GROUPID&type=TYPE&startUnix=STARTUNIX&endUnix=ENDUNIX
```

请求体示例 application/json

查询“PLC”类，时间戳在 1704892831–1708893358 之间，machineID 为模拟机台 1，且 tag 为 Ttag1 或 Ttag2 的数据，时间最早的 2 条（按 time 升序取前 2 条）。

```json
{
  "type": "PLC",
  "startUnix": 1704892831,
  "endUnix": 1708893358,
  "filters": [
    {
      "key": "machineID",
      "operator": "equal",
      "value": "模拟机台 1"
    },
    {
      "key": "tag",
      "operator": "in",
      "value": [
        "Ttag1",
        "Ttag2"
      ]
    }
  ],
  "orderBy": {
    "field": "time",
    "isDesc": false
  },
  "limit": 2
}
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| type | String | (必需)数据类，详见 [1.2. 数据说明](/conventions/data-classes/) |
| startUnix | Int64 | (必需)开始时间戳[秒] |
| endUnix | Int64 | (必需)结束时间戳[秒] |
| filters | Object[] | (必需)过滤条件 |
| key | String | (必需)键值 |
| operator | String | (必需)比较运算 |
| value | Object | (必需)比较值，类型为 String 或者 String[] |
| orderBy | Object | (必需)排序方式 |
| field | String | (必需)排序对象 |
| isDesc | Bool | (必需)true：降序，false：升序 |
| limit | Int32 | (必需)最大数量 |

返回示例

```json
[
  {
    "data": [
      255
    ],
    "tag": "Ttag1",
    "machineID": "模拟机台 1",
    "time": "2025-04-28T06:30:19.827Z"
  },
  {
    "data": [
      2147483647
    ],
    "tag": "Ttag2",
    "machineID": "模拟机台 1",
    "time": "2025-04-28T06:30:19.848Z"
  }
]
```

返回参数中，machineID 是机台的 machineID（见 [1.1. 基本说明](/conventions/identifiers/)），time 是数据的获取时间。其它返回参数详见 [1.2. 数据说明](/conventions/data-classes/)中对应 `type` 包含的 `field` 与 `tag` 内容说明。
