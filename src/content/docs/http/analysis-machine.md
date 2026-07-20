---
title: "2.7. 数据分析接口"
sidebar:
  label: "2.7.1. 机台数据分析"
---


数据分析接口用于获取目标机台或机组在指定时间范围内的数据分析。

使用数据分析接口前，必须开启网关本地缓存开关（详见《说明书》[5.12.2.3. 本地缓存](https://docs.bivrost.cn/gateway/usage/settings)），以允许在网关本地保存机台状态历史数据。

使用数据分析接口需要补充开始时间戳，结束时间戳。两者间最大长度为 31 天。

本地保存最大时限为 365 天。因此开始时间不可早于当前时间的 365 天前。

如当前时间戳小于输入的结束时间戳，则自动以当前时间戳为结束时间戳。

如网关有一段时间没有接收到机台或机组数据（数据缺失），会导致数据分析接口返回的数据与实际有出入。造成数据缺失的常见原因有：网关未开启本地缓存，未开启对应的自动采集任务，网关断电，网关网络中断，以及机台离线等。

## 2.7.1. 机台数据分析 {#machine-analysis}

机台数据分析用于获取目标机台在指定时间范围内的数据分析，基地址 `/api/analysis`。

### 2.7.1.1. oee 机台 OEE 数据分析 {#oee}

获取指定时间范围内，每个分组间隔的机台 OEE 统计数据。

```http
GET /api/analysis/oee?machineID=MACHINEID&startUnix=STARTUNIX&endUnix=ENDUNIX&interval=INTERVAL
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| machineID | String | (必需)目标机台标识，详见 [1.1.1. machineID 机台标识](/conventions/identifiers/#machineid) |
| startUnix | Int64 | (必需)开始时间戳[秒] |
| endUnix | Int64 | (必需)结束时间戳[秒] |
| interval | Int32 | 分组间隔[秒]，如未定义，则只有一个分组间隔。 |

返回示例

```json
[
  {
    "machineName": "模拟机台 1",
    "startTime": "2022-04-28T14:30:00Z",
    "endTime": "2022-04-28T15:30:00Z",
    "availability": 83.33333,
    "offTime": 100,
    "waitTime": 200,
    "emergencyTime": 300,
    "autoRunTime": 3000,
    "manualTime": 0.0
  },
  {
    "machineName": "模拟机台 1",
    "startTime": "2022-04-28T15:30:00Z",
    "endTime": "2022-04-28T16:30:00Z",
    "availability": 0.0,
    "offTime": 0,
    "waitTime": 3600,
    "emergencyTime": 0,
    "autoRunTime": 0,
    "manualTime": 0
  }
]
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| machineName | String | (必需)机台名，在“机台配置”页“添加/编辑设备”窗口设置。 |
| startTime | String | (必需)分组间隔开始时间(UTC) |
| endTime | String | (必需)分组间隔结束时间(UTC) |
| availability | Float | (必需)开动率[%] |
| offTime | Int64 | (必需)关机或离线时间[秒] |
| waitTime | Int64 | (必需)待机时间[秒] |
| emergencyTime | Int64 | (必需)紧急停止时间[秒] |
| autoRunTime | Int64 | (必需)自动运行时间[秒] |
| manualTime | Int64 | (必需)调机时间[秒] |

:::note[注]
机台 OEE 数据说明详见《说明书》[6.1.1. 机台 OEE 数据](https://docs.bivrost.cn/gateway/reference/glossary#machine-oee)。如开始时间和结束时间之间有一段时间缺失状态数据，则该段数据缺失时间的状态默认为关机或离线。
:::

### 2.7.1.2. alarm 机台警报数据分析 {#alarm}

获取指定时间范围内的机台警报历史。

```http
GET /api/analysis/alarm?machineID=MACHINEID&startUnix=STARTUNIX&endUnix=ENDUNIX
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| machineID | String | (必需)目标机台标识，详见 [1.1.1. machineID 机台标识](/conventions/identifiers/#machineid) |
| startUnix | Int64 | (必需)开始时间戳[秒] |
| endUnix | Int64 | (必需)结束时间戳[秒] |

返回示例

```json
[
  {
    "machineName": "模拟机台 1",
    "startTime": "2023-06-16T16:00:00Z",
    "endTime": "2023-06-16T16:00:10Z",
    "alarmMsg": "00:00 ALARM 1",
    "alarmLevel": "WRN"
  },
  {
    "machineName": "模拟机台 1",
    "startTime": "2023-06-16T16:00:00Z",
    "endTime": "2023-06-16T16:00:10.001Z",
    "alarmMsg": "00:00 ALARM 2",
    "alarmLevel": "WRN"
  },
  {
    "machineName": "模拟机台 1",
    "startTime": "2023-06-16T16:01:00.008Z",
    "endTime": "2023-06-16T16:01:50.019Z",
    "alarmMsg": "00:01 ALARM 1",
    "alarmLevel": "WRN"
  }
]
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| machineName | String | (必需)机台名，在“机台配置”页“添加/编辑设备”窗口设置。 |
| startTime | String | (必需)警报开始时间(UTC) |
| endTime | String | (必需)警报结束时间(UTC) |
| alarmMsg | String | (必需)警报内容 |
| alarmLevel | String | (必需)警报级别。按优先级由高到低分为错误（ERR），警告（WRN），消息（INF）三个级别。用户可以参照《说明书》[5.5.7. 警报监控设置](https://docs.bivrost.cn/gateway/usage/tasks#alarm-monitor)，以关键字设置警报级别，及过滤低于最低报警级别的警报；未设置级别的警报均默认为警告级别。 |

:::note[注]
从警报出现到警报解除作为一次警报，记录其开始时间，结束时间，警报内容，和警报级别。如在开始时间戳之前，警报已经出现，且未解除，则此次警报的开始时间为开始时间戳对应的时间。

如果在结束时间戳对应的时间，警报尚未解除，则此次警报的结束时间为结束时间戳对应的时间。

如开始时间和结束时间之间缺失警报数据，则默认该段缺失数据时间内没有出现警报。
:::

### 2.7.1.3. count 机台计数数据分析 {#count}

获取指定时间范围内，每个分组间隔的机台累计加工计数。

```http
GET /api/analysis/count?machineID=MACHINEID&startUnix=STARTUNIX&endUnix=ENDUNIX&interval=INTERVAL
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| machineID | String | (必需)目标机台标识，详见 [1.1.1. machineID 机台标识](/conventions/identifiers/#machineid) |
| startUnix | Int64 | (必需)开始时间戳[秒] |
| endUnix | Int64 | (必需)结束时间戳[秒] |
| interval | Int32 | 分组间隔[秒]，如未定义，则只有一个分组间隔。 |

返回示例

```json
[
  {
    "machineName": "模拟机台 1",
    "startTime": "2022-04-28T14:30:00Z",
    "endTime": "2022-04-28T15:30:00Z",
    "count": 96
  },
  {
    "machineName": "模拟机台 1",
    "startTime": "2022-04-28T15:30:00Z",
    "endTime": "2022-04-28T16:30:00Z",
    "count": 0
  }
]
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| machineName | String | (必需)机台名，在“机台配置”页“添加/编辑设备”窗口设置。 |
| startTime | String | (必需)分组间隔开始时间(UTC) |
| endTime | String | (必需)分组间隔结束时间(UTC) |
| count | Int32 | (必需)累计加工计数，分组间隔首末机台累计加工计数 `cumulativeCount` 之差 |

### 2.7.1.4. overall 机台综合数据分析 {#overall}

获取指定时间范围内，每个分组间隔的综合数据，包括 [2.7.1.1. oee 机台 OEE 数据分析](#oee)，[2.7.1.3. count 机台计数数据分析](#count)的数据。

```http
GET /api/analysis/overall?machineID=MACHINEID&startUnix=STARTUNIX&endUnix=ENDUNIX&interval=INTERVAL
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| machineID | String | (必需)目标机台标识，详见 [1.1.1. machineID 机台标识](/conventions/identifiers/#machineid) |
| startUnix | Int64 | (必需)开始时间戳[秒] |
| endUnix | Int64 | (必需)结束时间戳[秒] |
| interval | Int32 | 分组间隔[秒]，如未定义，则只有一个分组间隔。 |

返回示例

```json
[
  {
    "machineName": "模拟机台 1",
    "startTime": "2022-04-28T14:30:00Z",
    "endTime": "2022-04-28T15:30:00Z",
    "count": 96,
    "availability": 83.33333,
    "offTime": 100,
    "waitTime": 200,
    "emergencyTime": 300,
    "autoRunTime": 3000,
    "manualTime": 0.0
  },
  {
    "machineName": "模拟机台 1",
    "startTime": "2022-04-28T15:30:00Z",
    "endTime": "2022-04-28T16:30:00Z",
    "count": 0,
    "availability": 0.0,
    "offTime": 0,
    "waitTime": 3600,
    "emergencyTime": 0,
    "autoRunTime": 0,
    "manualTime": 0
  }
]
```

### 2.7.1.5. cycle 机台节拍数据分析 {#cycle}

获取指定时间范围内，机台的节拍数据。

```http
GET /api/analysis/cycle?machineID=MACHINEID&startUnix=STARTUNIX&endUnix=ENDUNIX
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| machineID | String | (必需)目标机台标识，详见 [1.1.1. machineID 机台标识](/conventions/identifiers/#machineid) |
| startUnix | Int64 | (必需)开始时间戳[秒] |
| endUnix | Int64 | (必需)结束时间戳[秒] |

返回示例

```json
[
  {
    "machineName": "模拟机台 1",
    "startTime": "2025-05-23T06:35:44.046Z",
    "endTime": "2025-05-23T06:36:25.046Z",
    "lastCycleTime": 41,
    "mainPrgmName": "O6495",
    "machineID": "1"
  },
  {
    "machineName": "模拟机台 1",
    "startTime": "2025-05-23T06:36:25.072Z",
    "endTime": "2025-05-23T06:36:56.072Z",
    "lastCycleTime": 31,
    "mainPrgmName": "O6495",
    "machineID": "1"
  }
]
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| machineName | String | (必需)机台名，在“机台配置”页“添加/编辑设备”窗口设置。 |
| startTime | String | (必需)节拍开始时间(UTC) |
| endTime | String | (必需)节拍结束时间(UTC) |
| lastCycleTime | Int32 | (必需)节拍时长[秒]，仅计算自动运行时间。 |
| mainPrgmName | String | (必需)节拍执行的主程序名 |
