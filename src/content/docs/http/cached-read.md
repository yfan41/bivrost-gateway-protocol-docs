---
title: "2.5.2. 缓存读取"
sidebar:
  label: "2.5.2. 缓存读取"
---


使用缓存读写类接口，网关会返回缓存中对应的自动采集任务数据。使用此类接口，必须启用网关的本地缓存功能（出厂设置默认开启），并且开启对应的自动采集任务。

## 2.5.2.1. readTaskData 读取机台任务数据 {#readtaskdata}

此接口从网关缓存中读取来自目标机台的任务数据，而不是向机台发出通讯请求读取数据，因此，通过此接口除了可以读取来自机台的原始数据（如机台状态，警报信息等），还能读取到经过网关统计处理的数据（过载时间，OEE 数据等），且运行效率更高，但前提是必须已开启目标数据对应的任务。

```http
GET /api/cnc/readTaskData?machineID=MACHINEID&type=TYPE&tag=TAG
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| machineID | String | (必需)目标机台标识，详见 [1.1.1. machineID 机台标识](/conventions/identifiers/#machineid) |
| type | String | (必需)数据类，详见 [1.2. 数据说明](/conventions/data-classes/) |
| tag | String | 标签的字段形式，详见 [1.2. 数据说明](/conventions/data-classes/) |

示例

获取 machineID 为 1010 的机台的 1 号主轴的过载数据，type=SpindleOverload，tag=S1，请求如下：

```
/api/cnc/readTaskData?machineID=1010&type=SpindleOverload&tag=S1
```

如果请求对应的机台任务未启用，或任务启用但是尚未执行时，返回结果为：

```json
{
  "errorCode": 1303,
  "errorMsg": "Task not ready."
}
```

工作正常时，以 JSON 格式返回指定数据类的数据，返回结果为：

```json
{
  "cumulativeTime": 14367,
  "spindleNo": 1,
  "time": "2024-03-01T02:26:42.2781587Z"
}
```

返回参数中，time 是数据的获取时间。其它返回参数详见 [1.2. 数据说明](/conventions/data-classes/)中对应 type 包含的 field 与 tag 内容说明。

## 2.5.2.2. batchReadTaskData 批量读取机台任务数据 {#batchreadtaskdata}

此接口为 [2.5.2.1. readTaskData 读取机台任务数据](#readtaskdata)的批量化版本，通过在请求体中补充目标数据列表，可以一次读取多组数据，前提是必须已开启目标数据对应的任务。

```http
POST /api/cnc/batchReadTaskData
```

请求体示例 application/json

```json
[
  {
    "machineID": "1",
    "type": "CNCStatus"
  },
  {
    "machineID": "2110",
    "type": "Count"
  },
  {
    "machineID": "3",
    "type": "PLC",
    "tag": "TR0"
  }
]
```

请求参数与 [2.5.2.1. readTaskData 读取机台任务数据](#readtaskdata)一致。

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| machineID | String | (必需)目标机台标识，详见 [1.1.1. machineID 机台标识](/conventions/identifiers/#machineid) |
| Type | String | (必需)数据类，详见 [1.2. 数据说明](/conventions/data-classes/) |
| Tag | String | 标签的字段形式，详见 [1.2. 数据说明](/conventions/data-classes/) |

返回示例

```json
[
  {
    "cncStatus": "AUTO_RUN",
    "alarmStatus": "ALARM",
    "alarmLevel": "WRN",
    "mode": "AUTO_RUN",
    "programStatus": "RUNNING",
    "emergencyStatus": "NOT_EMG",
    "dryRunStatus": "NOT_DRY_RUN",
    "adjustedStatus": "AUTO_RUN",
    "offTime": 2509,
    "waitTime": 2123,
    "emergencyTime": 25,
    "autoRunTime": 1526,
    "manualTime": 2905,
    "time": "2024-03-01T02:26:48.7383566Z"
  },
  {
    "count": 22406,
    "cumulativeCount": 0,
    "currentCount": 0,
    "time": "2024-03-01T02:26:49.8853233Z"
  },
  {
    "data": [
      32767
    ],
    "tag": "R0",
    "time": "2024-03-01T02:26:49.3324829Z"
  }
]
```

返回结果顺序与请求顺序一致。如果某条请求失败，则返回数组中对应位置为该请求的错误信息。

返回参数中，time 是数据的获取时间。其它返回参数详见 [1.2. 数据说明](/conventions/data-classes/)中对应 type 包含的 field 与 tag 内容说明。

## 2.5.2.3. readGroupTaskData 读取机组任务数据 {#readgrouptaskdata}

此接口从网关缓存中读取目标机组正在运行的目标任务的最新数据，前提是必须已开启目标机组的目标数据对应的任务。

```http
GET /api/cnc/readGroupTaskData?groupID=GROUPID&type=TYPE&tag=TAG
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| groupID | String | (必需)目标机组标识，详见 [1.1.2. groupID 机组标识](/conventions/identifiers/#groupid) |
| type | String | (必需)数据类，目前仅支持 [1.2.11. GroupCount：机组加工计数数据](/conventions/data-classes/#groupcount)，[1.2.12. GroupCumulativeTime：机组累计状态时间](/conventions/data-classes/#groupcumulativetime)，和 [1.2.13. GroupOEE：机组 OEE](/conventions/data-classes/#groupoee) |
| tag | String | 标签的字段形式，详见 [1.2. 数据说明](/conventions/data-classes/) |

示例

获取 groupID 为 g2 的机组加工计数数据，type=GroupCount，请求如下：

```
/api/cnc/readGroupTaskData?groupID=g2&type=GroupCount
```

如果请求对应的机组任务未启用，或任务启用但是尚未执行时，返回结果为：

```json
{
  "errorCode": 1303,
  "errorMsg": "Task not ready."
}
```

工作正常时，以 JSON 格式返回指定数据类的数据，返回结果为：

```json
{
  "cumulativeCount": 127,
  "time": "2024-03-01T02:26:50.1127663Z"
}
```

返回参数中，time 是数据的获取时间。其它返回参数详见 [1.2. 数据说明](/conventions/data-classes/)中对应 type 包含的 field 与 tag 内容说明。

## 2.5.2.4. batchReadGroupTaskData 批量读取机组任务数据 {#batchreadgrouptaskdata}

此接口为 [2.5.2.3. readGroupTaskData 读取机组任务数据](#readgrouptaskdata)的批量化版本，通过在请求体中补充目标数据列表，可以一次读取多组数据，前提是必须已开启目标数据对应的任务。

```http
POST /api/cnc/batchReadGroupTaskData
```

请求体示例 application/json

```json
[
  {
    "groupID": "1",
    "type": "GroupOEE"
  },
  {
    "groupID": "2",
    "type": "GroupCount"
  }
]
```

请求参数与 [2.5.2.1. readTaskData 读取机台任务数据](#readtaskdata)一致。

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| groupID | String | 目标机组标识，详见 [1.1.2. groupID 机组标识](/conventions/identifiers/#groupid) |
| type | String | 数据类，目前仅支持 [1.2.11. GroupCount：机组加工计数数据](/conventions/data-classes/#groupcount)，[1.2.12. GroupCumulativeTime：机组累计状态时间](/conventions/data-classes/#groupcumulativetime)，和 [1.2.13. GroupOEE：机组 OEE](/conventions/data-classes/#groupoee) |
| tag | String | 标签的字段形式，详见 [1.2. 数据说明](/conventions/data-classes/) |

返回示例

```json
[
  {
    "autoRunCount": 1,
    "waitCount": 0,
    "emergencyCount": 0,
    "manualCount": 0,
    "offCount": 0,
    "availability": 90.0,
    "offTime": 360,
    "waitTime": 0,
    "emergencyTime": 0,
    "autoRunTime": 3240,
    "manualTime": 0,
    "time": "2024-03-01T02:27:30.5534659Z"
  },
  {
    "cumulativeCount": 127,
    "time": "2024-03-01T02:27:30.6533778Z"
  }
]
```

返回结果顺序与请求顺序一致。如果某条请求失败，则返回数组中对应位置为该请求的错误信息。

返回参数中，time 是数据的获取时间。其它返回参数详见 [1.2. 数据说明](/conventions/data-classes/)中对应 type 包含的 field 与 tag 内容说明。

## 2.5.2.5. batchReadErrors 批量读取机台连接状态 {#batchreaderrors}

此接口用于批量获取指定机台当前连接状态，通过在请求体中补充目标机台标识，可以一次读取多台机台的连接状态。

```http
POST /api/cnc/batchReadErrors
```

请求体示例 application/json

```json
[
  {
    "machineID": "1"
  },
  {
    "machineID": "2"
  }
]
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| machineID | String | (必需)目标机台标识，详见 [1.1.1. machineID 机台标识](/conventions/identifiers/#machineid) |

返回示例

```json
[
  {
    "errorCode": 0,
    "errorMsg": "Success"
  },
  {
    "errorCode": 3,
    "errorMsg": "Machine offline."
  }
]
```

返回结果顺序与请求顺序一致。

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| errorCode | Int32 | (必需)错误码，0 代表连接成功。 |
| errorMsg | String | (必需)错误内容 |

## 2.5.2.6. readErrorSummary 读取状态简报 {#readerrorsummary}

此接口用于获取当前机台连接状态简报，无需请求参数。

```http
GET /api/cnc/readErrorSummary
```

返回示例

```json
{
  "success": 8,
  "offline": 1,
  "error": 0
}
```

返回结果顺序与请求顺序一致。

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| success | Int32 | (必需)连接成功机台数 |
| offline | Int32 | (必需)离线机台数 |
| error | Int32 | (必需)连接错误机台数 |
