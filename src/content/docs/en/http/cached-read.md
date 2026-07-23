---
title: "2.5.2. Cached Read"
sidebar:
  label: "2.5.2. Cached Read"
---


When using cache read/write APIs, the gateway returns the corresponding automatic data collection task data from its cache. To use these APIs, the gateway's local cache feature must be enabled (enabled by default from the factory), and the corresponding automatic data collection task must be enabled.

## 2.5.2.1. readTaskData Read Machine Task Data {#readtaskdata}

This API reads task data for the target machine from the gateway cache, instead of sending a communication request to the machine to read data. As a result, this API can not only read raw data from the machine (such as machine status, alarm information, etc.), but also read data that has been statistically processed by the gateway (overload time, OEE data, etc.), and runs more efficiently. However, the task corresponding to the target data must already be enabled.

```http
GET /api/cnc/readTaskData?machineID=MACHINEID&type=TYPE&tag=TAG
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| machineID | String | (Required) Target machine identifier, see [1.1.1. machineID Machine Identifier](/en/conventions/identifiers/#machineid) |
| type | String | (Required) Data class, see [1.2. Data Description](/en/conventions/data-classes/) |
| tag | String | Field form of the tag, see [1.2. Data Description](/en/conventions/data-classes/) |

Example

To get the overload data for spindle No. 1 of the machine with machineID 1010, with type=SpindleOverload, tag=S1, the request is as follows:

```
/api/cnc/readTaskData?machineID=1010&type=SpindleOverload&tag=S1
```

If the corresponding machine task has not been enabled, or the task is enabled but has not yet run, the response is:

```json
{
  "errorCode": 1303,
  "errorMsg": "Task not ready."
}
```

When working normally, the data for the specified data class is returned in JSON format, as follows:

```json
{
  "cumulativeTime": 14367,
  "spindleNo": 1,
  "time": "2024-03-01T02:26:42.2781587Z"
}
```

Among the response parameters, time is the timestamp when the data was retrieved. For the other response parameters, see the field and tag descriptions for the corresponding type in [1.2. Data Description](/en/conventions/data-classes/).

## 2.5.2.2. batchReadTaskData Batch Read Machine Task Data {#batchreadtaskdata}

This API is the batch version of [2.5.2.1. readTaskData Read Machine Task Data](#readtaskdata). By supplying a list of target data items in the request body, multiple sets of data can be read in a single call, provided that the tasks corresponding to the target data are already enabled.

```http
POST /api/cnc/batchReadTaskData
```

Request body example, application/json

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

The request parameters are the same as [2.5.2.1. readTaskData Read Machine Task Data](#readtaskdata).

| Request Parameter | Type | Description |
| --- | --- | --- |
| machineID | String | (Required) Target machine identifier, see [1.1.1. machineID Machine Identifier](/en/conventions/identifiers/#machineid) |
| Type | String | (Required) Data class, see [1.2. Data Description](/en/conventions/data-classes/) |
| Tag | String | Field form of the tag, see [1.2. Data Description](/en/conventions/data-classes/) |

Response example

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

The order of the response results matches the order of the requests. If a given request fails, the corresponding position in the returned array contains the error information for that request.

Among the response parameters, time is the timestamp when the data was retrieved. For the other response parameters, see the field and tag descriptions for the corresponding type in [1.2. Data Description](/en/conventions/data-classes/).

## 2.5.2.3. readGroupTaskData Read Machine Group Task Data {#readgrouptaskdata}

This API reads the latest data from the gateway cache for the target task currently running on the target machine group, provided that the task corresponding to the target data of the target machine group is already enabled.

```http
GET /api/cnc/readGroupTaskData?groupID=GROUPID&type=TYPE&tag=TAG
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| groupID | String | (Required) Target machine group identifier, see [1.1.2. groupID Machine Group Identifier](/en/conventions/identifiers/#groupid) |
| type | String | (Required) Data class, currently only [1.2.11. GroupCount: Machine Group Processing Count Data](/en/conventions/data-classes/#groupcount), [1.2.12. GroupCumulativeTime: Machine Group Cumulative Status Time](/en/conventions/data-classes/#groupcumulativetime), and [1.2.13. GroupOEE: Machine Group OEE](/en/conventions/data-classes/#groupoee) are supported |
| tag | String | Field form of the tag, see [1.2. Data Description](/en/conventions/data-classes/) |

Example

To get the processing count data for the machine group with groupID g2, with type=GroupCount, the request is as follows:

```
/api/cnc/readGroupTaskData?groupID=g2&type=GroupCount
```

If the corresponding machine group task has not been enabled, or the task is enabled but has not yet run, the response is:

```json
{
  "errorCode": 1303,
  "errorMsg": "Task not ready."
}
```

When working normally, the data for the specified data class is returned in JSON format, as follows:

```json
{
  "cumulativeCount": 127,
  "time": "2024-03-01T02:26:50.1127663Z"
}
```

Among the response parameters, time is the timestamp when the data was retrieved. For the other response parameters, see the field and tag descriptions for the corresponding type in [1.2. Data Description](/en/conventions/data-classes/).

## 2.5.2.4. batchReadGroupTaskData Batch Read Machine Group Task Data {#batchreadgrouptaskdata}

This API is the batch version of [2.5.2.3. readGroupTaskData Read Machine Group Task Data](#readgrouptaskdata). By supplying a list of target data items in the request body, multiple sets of data can be read in a single call, provided that the tasks corresponding to the target data are already enabled.

```http
POST /api/cnc/batchReadGroupTaskData
```

Request body example, application/json

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

The request parameters are the same as [2.5.2.1. readTaskData Read Machine Task Data](#readtaskdata).

| Request Parameter | Type | Description |
| --- | --- | --- |
| groupID | String | Target machine group identifier, see [1.1.2. groupID Machine Group Identifier](/en/conventions/identifiers/#groupid) |
| type | String | Data class, currently only [1.2.11. GroupCount: Machine Group Processing Count Data](/en/conventions/data-classes/#groupcount), [1.2.12. GroupCumulativeTime: Machine Group Cumulative Status Time](/en/conventions/data-classes/#groupcumulativetime), and [1.2.13. GroupOEE: Machine Group OEE](/en/conventions/data-classes/#groupoee) are supported |
| tag | String | Field form of the tag, see [1.2. Data Description](/en/conventions/data-classes/) |

Response example

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

The order of the response results matches the order of the requests. If a given request fails, the corresponding position in the returned array contains the error information for that request.

Among the response parameters, time is the timestamp when the data was retrieved. For the other response parameters, see the field and tag descriptions for the corresponding type in [1.2. Data Description](/en/conventions/data-classes/).

## 2.5.2.5. batchReadErrors Batch Read Machine Connection Status {#batchreaderrors}

This API is used to batch retrieve the current connection status of specified machines. By supplying a list of target machine identifiers in the request body, the connection status of multiple machines can be read in a single call.

```http
POST /api/cnc/batchReadErrors
```

Request body example, application/json

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

| Request Parameter | Type | Description |
| --- | --- | --- |
| machineID | String | (Required) Target machine identifier, see [1.1.1. machineID Machine Identifier](/en/conventions/identifiers/#machineid) |

Response example

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

The order of the response results matches the order of the requests.

| Response Parameter | Type | Description |
| --- | --- | --- |
| errorCode | Int32 | (Required) Error code; 0 indicates a successful connection. |
| errorMsg | String | (Required) Error message |

## 2.5.2.6. readErrorSummary Read Status Summary {#readerrorsummary}

This API is used to get a summary of the current connection status of the machines; no request parameters are required.

```http
GET /api/cnc/readErrorSummary
```

Response example

```json
{
  "success": 8,
  "offline": 1,
  "error": 0
}
```

The order of the response results matches the order of the requests.

| Response Parameter | Type | Description |
| --- | --- | --- |
| success | Int32 | (Required) Number of machines successfully connected |
| offline | Int32 | (Required) Number of offline machines |
| error | Int32 | (Required) Number of machines with connection errors |
