---
title: "2.7.2. 机组数据分析"
sidebar:
  label: "2.7.2. 机组数据分析"
---


机组数据分析用于获取目标机台或机组在指定时间范围内的数据分析，基地址 `/api/group-analysis`，需要补充变量机组标识 groupID，代替机台标识 machineID。

## 2.7.2.1. oee 机组 OEE 数据分析 {#oee}

获取指定时间范围内，每个分组间隔的，机组内所有机台的机台 OEE 数据。

```http
GET /api/group-analysis/oee?groupID=GROUPID&startUnix=STARTUNIX&endUnix=ENDUNIX&interval=INTERVAL
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| groupID | String | (必需)目标机组标识，详见 [1.1.2. groupID 机组标识](/conventions/identifiers/#groupid) |
| startUnix | Int64 | (必需)开始时间戳[秒] |
| endUnix | Int64 | (必需)结束时间戳[秒] |
| interval | Int32 | 分组间隔[秒]，如未定义，则只有一个分组间隔。 |

返回示例

```json
[
  {
    "machineID": "1010",
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
    "machineID": "1010",
    "machineName": "模拟机台 1",
    "startTime": "2022-04-28T15:30:00Z",
    "endTime": "2022-04-28T16:30:00Z",
    "availability": 0.0,
    "offTime": 0,
    "waitTime": 3600,
    "emergencyTime": 0,
    "autoRunTime": 0,
    "manualTime": 0
  },
  {
    "machineID": "1011",
    "machineName": "模拟机台 2",
    "startTime": "2022-04-28T14:30:00Z",
    "endTime": "2022-04-28T15:30:00Z",
    "availability": 80.55556,
    "offTime": 150,
    "waitTime": 250,
    "emergencyTime": 300,
    "autoRunTime": 2900,
    "manualTime": 0.0
  },
  {
    "machineID": "1011",
    "machineName": "模拟机台 2",
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
| machineID | String | (必需)机台 machineID，详见 [1.1.1. machineID 机台标识](/conventions/identifiers/#machineid) |
| machineName | String | (必需)机台名，在“机台配置”页“添加/编辑设备”窗口设置。 |
| startTime | String | (必需)分组间隔开始时间 |
| endTime | String | (必需)分组间隔结束时间 |
| availability | Float | (必需)开动率[%] |
| offTime | Int64 | (必需)关机或离线时间[秒] |
| waitTime | Int64 | (必需)待机时间[秒] |
| emergencyTime | Int64 | (必需)紧急停止时间[秒] |
| autoRunTime | Int64 | (必需)自动运行时间[秒] |
| manualTime | Int64 | (必需)调机时间[秒] |

## 2.7.2.2. alarm 机组警报数据分析 {#alarm}

获取指定时间范围内的机组内所有机台的警报历史。

```http
GET /api/group-analysis/alarm?groupID=GROUPID&startUnix=STARTUNIX&endUnix=ENDUNIX
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| groupID | String | (必需)目标机组标识，详见 [1.1.2. groupID 机组标识](/conventions/identifiers/#groupid) |
| startUnix | Int64 | (必需)开始时间戳[秒] |
| endUnix | Int64 | (必需)结束时间戳[秒] |

返回示例

```json
[
  {
    "machineID": "1010",
    "machineName": "模拟机台 1",
    "startTime": "2023-06-16T16:00:00Z",
    "endTime": "2023-06-16T16:00:10Z",
    "alarmMsg": "00:00 ALARM 1",
    "alarmLevel": "WRN"
  },
  {
    "machineID": "1010",
    "machineName": "模拟机台 1",
    "startTime": "2023-06-17T15:59:48.105Z",
    "endTime": "2023-06-17T16:00:00Z",
    "alarmMsg": "23:59 ALARM 2",
    "alarmLevel": "WRN"
  },
  {
    "machineID": "1011",
    "machineName": "模拟机台 2",
    "startTime": "2023-06-16T16:00:00.399Z",
    "endTime": "2023-06-16T16:00:30.395Z",
    "alarmMsg": "00:00 ALARM 1",
    "alarmLevel": "WRN"
  },
  {
    "machineID": "1010",
    "machineName": "模拟机台 1",
    "startTime": "2023-06-16T16:01:00.008Z",
    "endTime": "2023-06-16T16:01:50.019Z",
    "alarmMsg": "00:01 ALARM 1",
    "alarmLevel": "WRN"
  },
  {
    "machineID": "1014",
    "machineName": "模拟机台 5",
    "startTime": "2023-06-17T15:59:06.702Z",
    "endTime": "2023-06-17T15:59:16.7Z",
    "alarmMsg": "23:59 ALARM 2",
    "alarmLevel": "WRN"
  }
]
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| machineID | String | (必需)目标机台标识，详见 [1.1.1. machineID 机台标识](/conventions/identifiers/#machineid) |
| machineName | String | (必需)机台名，在“机台配置”页“添加/编辑设备”窗口设置。 |
| startTime | String | (必需)警报开始时间(UTC) |
| endTime | String | (必需)警报结束时间(UTC) |
| alarmMsg | String | (必需)警报内容 |
| alarmLevel | String | (必需)警报级别。如无警报，返回空 Array。按优先级由高到低分为错误（ERR），警告（WRN），消息（INF）三个级别。用户可以参照《说明书》[5.5.7. 警报监控设置](https://gateway.docs.bivrost.cn/usage/tasks#alarm-monitor)，以关键字设置警报级别，及过滤低于最低报警级别的警报；未设置级别的警报均默认为警告级别。 |

## 2.7.2.3. count 机组计数数据分析 {#count}

获取指定时间范围内，每个分组间隔的，机组内所有机台的机台计数数据。

```http
GET /api/group-analysis/count?groupID=GROUPID&startUnix=STARTUNIX&endUnix=ENDUNIX&interval=INTERVAL
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| groupID | String | (必需)目标机组标识，详见 [1.1.2. groupID 机组标识](/conventions/identifiers/#groupid) |
| startUnix | Int64 | (必需)开始时间戳[秒] |
| endUnix | Int64 | (必需)结束时间戳[秒] |
| interval | Int32 | 分组间隔[秒]，如未定义，则只有一个分组间隔。 |

返回示例

```json
[
  {
    "machineID": "1010",
    "machineName": "模拟机台 1",
    "startTime": "2022-04-28T14:30:00Z",
    "endTime": "2022-04-28T15:30:00Z",
    "count": 96
  },
  {
    "machineID": "1010",
    "machineName": "模拟机台 1",
    "startTime": "2022-04-28T15:30:00Z",
    "endTime": "2022-04-28T16:30:00Z",
    "machineName": "模拟机台 1",
    "count": 0
  },
  {
    "machineID": "1010",
    "machineName": "模拟机台 1",
    "startTime": "2022-04-28T14:30:00Z",
    "endTime": "2022-04-28T15:30:00Z",
    "machineName": "模拟机台 2",
    "count": 52
  },
  {
    "machineID": "1010",
    "machineName": "模拟机台 1",
    "startTime": "2022-04-28T15:30:00Z",
    "endTime": "2022-04-28T16:30:00Z",
    "machineName": "模拟机台 2",
    "count": 0
  }
]
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| machineID | String | (必需)机台 machineID，详见 [1.1.1. machineID 机台标识](/conventions/identifiers/#machineid) |
| machineName | String | (必需)机台名，在“机台配置”页“添加/编辑设备”窗口设置。 |
| startTime | String | (必需)分组间隔开始时间 |
| endTime | String | (必需)分组间隔结束时间 |
| count | Int32 | (必需)累计加工计数，为指定时间范围首末的机台累计加工计数 `cumulativeCount` 之差 |

## 2.7.2.4. overall 机组综合数据分析 {#overall}

获取指定时间范围内，每个分组间隔的，机组内所有机台的机台综合数据。

```http
GET /api/group-analysis/overall?groupID=GROUPID&startUnix=STARTUNIX&endUnix=ENDUNIX&interval=INTERVAL
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| groupID | String | (必需)目标机组标识，详见 [1.1.2. groupID 机组标识](/conventions/identifiers/#groupid) |
| startUnix | Int64 | (必需)开始时间戳[秒] |
| endUnix | Int64 | (必需)结束时间戳[秒] |
| interval | Int32 | 分组间隔[秒]，如未定义，则只有一个分组间隔。 |

返回示例

```json
[
  {
    "machineID": "1010",
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
    "machineID": "1010",
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
  },
  {
    "machineID": "1011",
    "machineName": "模拟机台 2",
    "startTime": "2022-04-28T14:30:00Z",
    "endTime": "2022-04-28T15:30:00Z",
    "count": 52,
    "availability": 80.55556,
    "offTime": 150,
    "waitTime": 250,
    "emergencyTime": 300,
    "autoRunTime": 2900,
    "manualTime": 0.0
  },
  {
    "machineID": "1011",
    "machineName": "模拟机台 2",
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

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| machineID | String | (必需)机台 machineID，详见 [1.1.1. machineID 机台标识](/conventions/identifiers/#machineid) |
| machineName | String | (必需)机台名，在“机台配置”页“添加/编辑设备”窗口设置。 |
| startTime | String | (必需)分组间隔开始时间 |
| endTime | String | (必需)分组间隔结束时间 |
| count | Int32 | (必需)累计加工计数，为指定时间范围首末的机台累计加工计数 `cumulativeCount` 之差 |
| availability | Float | (必需)开动率[%] |
| offTime | Int64 | (必需)关机或离线时间[秒] |
| waitTime | Int64 | (必需)待机时间[秒] |
| emergencyTime | Int64 | (必需)紧急停止时间[秒] |
| autoRunTime | Int64 | (必需)自动运行时间[秒] |
| manualTime | Int64 | (必需)调机时间[秒] |

## 2.7.2.5. cycle 机组节拍数据分析 {#cycle}

获取指定时间范围内，每个分组间隔的，机组内所有机台的机台综合数据。

```http
GET /api/group-analysis/cycle?groupID=GROUPID&startUnix=STARTUNIX&endUnix=ENDUNIX
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| groupID | String | (必需)目标机组标识，详见 [1.1.2. groupID 机组标识](/conventions/identifiers/#groupid) |
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
  },
  {
    "machineName": "模拟机台 2",
    "startTime": "2025-05-23T07:51:50.777Z",
    "endTime": "2025-05-23T07:52:10.777Z",
    "lastCycleTime": 20,
    "mainPrgmName": "O2228",
    "machineID": "2"
  },
  {
    "machineName": "模拟机台 2",
    "startTime": "2025-05-23T07:52:10.842Z",
    "endTime": "2025-05-23T07:52:30.842Z",
    "lastCycleTime": 20,
    "mainPrgmName": "O2228",
    "machineID": "2"
  }
]
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| machineID | String | (必需)机台 machineID，详见 [1.1.1. machineID 机台标识](/conventions/identifiers/#machineid) |
| machineName | String | (必需)机台名，在“机台配置”页“添加/编辑设备”窗口设置。 |
| startTime | String | (必需)节拍开始时间(UTC) |
| endTime | String | (必需)节拍结束时间(UTC) |
| lastCycleTime | Int32 | (必需)节拍时长[秒]，仅计算自动运行时间。 |
| mainPrgmName | String | (必需)节拍执行的主程序名 |
