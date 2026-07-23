---
title: "2.8. History Data Interface"
sidebar:
  label: "2.8. History Data Interface"
---


The history data interface is used to retrieve historical data for a target machine or machine group within a specified time range, with base path `/api/db`.

Before using the history data analysis interface, the gateway's local cache switch must be enabled (see the Bivrost Gateway Manual [5.12.2.3. Local Cache](https://docs.bivrost.cn/gateway/usage/settings)), to allow historical data to be saved locally on the gateway.

Using the history data analysis interface requires supplying a start timestamp and an end timestamp. The maximum span between the two is 31 days.

The maximum local retention period is 365 days. Therefore, the start time cannot be earlier than 365 days before the current time.

If the current timestamp is earlier than the supplied end timestamp, the current timestamp is automatically used as the end timestamp.

If the gateway has not received machine or machine group data for a period of time (data gap), the data returned by the history data interface may differ from the actual data. Common causes of data gaps include: the gateway's local cache not being enabled, the corresponding automatic collection task not being enabled, the gateway losing power, the gateway's network connection being interrupted, and the machine being offline.

## 2.8.1. machine — Machine History Data {#machine}

Machine history data is used to retrieve historical data for a target machine within a specified time range.

```http
GET /api/db/machine?machineID=MACHINEID&type=TYPE&startUnix=STARTUNIX&endUnix=ENDUNIX
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| machineID | String | (Required) Target machine identifier, see [1.1.1. machineID Machine Identifier](/en/conventions/identifiers/#machineid) |
| type | String | (Required) Data class, see [1.2. Data Description](/en/conventions/data-classes/) |
| startUnix | Int64 | (Required) Start timestamp [seconds] |
| endUnix | Int64 | (Required) End timestamp [seconds] |

Example

Retrieve historical machine status data for the machine with machineID 1010, from 10:00 to 11:00 on the morning of March 1, 2024, with type=CNCStatus. The request is as follows:

```http
GET /api/db/machine?machineID=1010&type=CNCStatus&startUnix=1709258400&endUnix=1709262000
```

If no historical data exists for the target machine within the specified time range, an empty array is returned:

```json
[]
```

If historical data exists, the data for the specified data class is returned in JSON format:

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

Among the response parameters, machineID is the machine's machineID (see [1.1. Identifiers](/en/conventions/identifiers/)), and time is the time the data was captured. For other response parameters, see the `field` and `tag` descriptions for the corresponding `type` in [1.2. Data Description](/en/conventions/data-classes/).

## 2.8.2. group-machine — History Data for All Machines in a Group {#group-machine}

Used to retrieve historical data for all machines in a target machine group within a specified time range.

```http
GET /api/db/group-machine?groupID=GROUPID&type=TYPE&startUnix=STARTUNIX&endUnix=ENDUNIX
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| groupID | String | (Required) Target group identifier, see [1.1.2. groupID Group Identifier](/en/conventions/identifiers/#groupid) |
| type | String | (Required) Data class, see [1.2. Data Description](/en/conventions/data-classes/) |
| startUnix | Int64 | (Required) Start timestamp [seconds] |
| endUnix | Int64 | (Required) End timestamp [seconds] |

Example

Retrieve historical machine status data for all machines in the group with groupID g1, from 10:00 to 11:00 on the morning of March 1, 2024, with type=CNCStatus. The request is as follows:

```http
GET /api/db/group-machine?groupID=g1&type=CNCStatus&startUnix=1709258400&endUnix=1709262000
```

If no historical data exists for the target machines within the specified time range, an empty array is returned:

```json
[]
```

If historical data exists, the data for the specified data class is returned in JSON format:

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

Among the response parameters, machineID is the machine's machineID (see [1.1. Identifiers](/en/conventions/identifiers/)), and time is the time the data was captured. For other response parameters, see the `field` and `tag` descriptions for the corresponding `type` in [1.2. Data Description](/en/conventions/data-classes/).

## 2.8.3. query — Query History Data {#query}

Queries historical data matching the specified conditions, similar to a database query command.

```http
POST /api/db/query?groupID=GROUPID&type=TYPE&startUnix=STARTUNIX&endUnix=ENDUNIX
```

Request body example (application/json)

Query the "PLC" class, with timestamps between 1704892831 and 1708893358, where machineID is Simulated Machine 1 and tag is either Ttag1 or Ttag2, returning the earliest 2 records (the first 2 records in ascending order by time).

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

| Request Parameter | Type | Description |
| --- | --- | --- |
| type | String | (Required) Data class, see [1.2. Data Description](/en/conventions/data-classes/) |
| startUnix | Int64 | (Required) Start timestamp [seconds] |
| endUnix | Int64 | (Required) End timestamp [seconds] |
| filters | Object[] | (Required) Filter conditions |
| key | String | (Required) Key |
| operator | String | (Required) Comparison operator |
| value | Object | (Required) Comparison value, of type String or String[] |
| orderBy | Object | (Required) Sort order |
| field | String | (Required) Sort field |
| isDesc | Bool | (Required) true: descending, false: ascending |
| limit | Int32 | (Required) Maximum number of records |

Response example

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

Among the response parameters, machineID is the machine's machineID (see [1.1. Identifiers](/en/conventions/identifiers/)), and time is the time the data was captured. For other response parameters, see the `field` and `tag` descriptions for the corresponding `type` in [1.2. Data Description](/en/conventions/data-classes/).
