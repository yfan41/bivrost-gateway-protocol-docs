---
title: "2.5.1. Direct Read/Write: Tool Life"
sidebar:
  label: "2.5.1. Direct Read/Write · Tool Life"
---


This page continues [2.5.1. Direct Read/Write](/en/http/direct-read/#direct), covering tool-life-related endpoints (2.5.1.21–2.5.1.24).

## 2.5.1.21. readToolLife: Read Tool Life {#readtoollife}

```http
GET /api/cnc/readToolLife?machineID=MACHINEID&groupNum=GROUPNUM&toolIndex=TOOLINDEX&toolNum=TOOLNUM&offsetNum=OFFSETNUM
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| machineID | String | (Required) Identifier of the target machine, see [1.1.1. machineID: Machine Identifier](/en/conventions/identifiers/#machineid) |
| groupNum | Int32 | Supply groupNum (tool group number), or toolIndex (index within the group), or toolNum (tool number), or offsetNum (offset number) to identify the target tool. These request parameters correspond to the tags in [1.2.25. ToolLife: Tool Life Data](/en/conventions/data-classes/#toollife), where the groupNum parameter corresponds to toolGroupNum in the tags, offsetNum corresponds to toolOffsetNum in the tags, and the other parameters share names with the tags. Refer to the per-system tag combination table in [1.2.25. ToolLife: Tool Life Data](/en/conventions/data-classes/#toollife) to determine which combination of request parameters to supply. |
| toolIndex | Int32 | Same as above (described together with the groupNum row) |
| toolNum | Int32 | Same as above (described together with the groupNum row) |
| offsetNum | Int32 | Same as above (described together with the groupNum row) |

Examples 1–2 are Fanuc examples.

Example 1, Fanuc count-based:

(The original here shows a screenshot of the Fanuc tool life screen: group 00000001 (max tool count: 32), type 1 (1: count, 2: minutes), life 100, count 21; tool list numbers 01–04, T codes 00000001/00000008/00000002/00000032, H codes 001/000/002/120, D codes 001/000/002/008.)

The type shown above is 1, indicating count-based. To get the tool life data for the machine with machineID 1010 shown above, tool group number 1, index within group 4, the request is as follows:

```
/api/cnc/readToolLife?machineID=1010&groupNum=1&toolIndex=4
```

Response example

```json
{
  "toolNum": 32,
  "toolIndex": 4,
  "toolGroupNum": 1,
  "countLimit": 100,
  "currentCount": 21
}
```

toolNum is the T code shown above; toolIndex is the number shown above; toolGroupNum is the group shown above; countLimit is the life shown above, in counts; currentCount is the count shown above, in counts.

Example 2, Fanuc time-based:

(The original here shows a screenshot of the Fanuc tool life screen: group 00000002 (max tool count: 32), type 2 (1: count, 2: minutes), life 1000, count 23; tool list numbers 01–02, T codes 00000004/00000000, H codes 004/000, D codes 004/000.)

The type shown above is 2, indicating time-based. To get the tool life data for the machine with machineID 1010 shown above, tool group number 2, index within group 2, the request is as follows:

```
/api/cnc/readToolLife?machineID=1010&groupNum=2&toolIndex=2
```

Response example

```json
{
  "toolNum": 8,
  "toolIndex": 2,
  "toolGroupNum": 1,
  "timeLimit": 60000,
  "currentTime": 1380
}
```

toolNum is the T code shown above; toolIndex is the number shown above; toolGroupNum is the group shown above; timeLimit is the life shown above, in seconds; currentTime is the count shown above, in seconds. The original unit of time shown is minutes; the response data is uniformly converted to seconds.

Examples 3–4 are Siemens examples.

Example 3, Siemens time-based:

(The original here shows a screenshot of the Siemens SINUMERIK OPERATE tool wear screen (MAGAZIN1): position 1, tool name ROUGHING_T80 A, ST 1, D 1, Δ length Z 0.780, Δ radius 0.750, TC column T, tool life 30.0, target value 30.0, warning value 6.2.)

The "TC" column shown above is T, indicating time-based. To get the offset data for the machine with machineID 1010 shown above, position (tool number) 1, D (offset number) 1, the request is as follows:

```
/api/cnc/readToolLife?machineID=1010&toolNum=1&offsetNum=1
```

Response example

```json
{
  "toolNum": 1,
  "toolOffsetNum": 1,
  "timeLimit": 1800,
  "currentTime": 0,
  "prewarningTime": 1428
}
```

toolNum is the position shown above; toolOffsetNum is the D shown above; timeLimit is the target value shown above, in seconds; currentTime is the difference between the target value and the tool life shown above, in seconds; prewarningTime is the difference between the target value and the warning value shown above, in seconds. The original unit of time shown is minutes; the response data is uniformly converted to seconds.

In general, the system issues a warning when currentTime (current life) is greater than or equal to prewarningTime (warning life). On Siemens systems, the configured tool life actually represents remaining usable life, which decreases continuously with machining, and an alarm is raised when the tool life falls below the warning value. To keep the definition consistent, the current life and warning life output by this endpoint have been converted accordingly.

Example 4, Siemens wear-based:

(The original here shows a screenshot of the Siemens SINUMERIK OPERATE tool wear screen (MAGAZIN1): position 3, tool name FINISHING_T35 A, ST 1, D 1, Δ length Z 0.000, Δ radius 0.000, TC column W, wear amount 2.000, rated value 2.000, warning value 1.000.)

The "TC" column shown above is W, indicating wear-based. To get the offset data for the machine with machineID 1010 shown above, position (tool number) 3, D (offset number) 1, the request is as follows:

```
/api/cnc/readToolLife?machineID=1010&toolNum=3&offsetNum=1
```

Response example

```json
{
  "toolNum": 3,
  "toolOffsetNum": 1,
  "wearLimit": 2.0,
  "currentWear": 0.0,
  "prewarningWear": 1.0
}
```

toolNum is the position shown above; toolOffsetNum is the D shown above; wearLimit is the rated value shown above; currentWear is the difference between the rated value and the wear amount shown above; prewarningWear is the difference between the rated value and the warning value shown above. Wear-related quantities are in the machine's default length unit, mm or inch.

| Response Parameter | Type | Description |
| --- | --- | --- |
| toolGroupNum | Int32 | Tool group number |
| toolIndex | Int32 | Index within the group |
| toolNum | Int32 | Tool number |
| toolOffsetNum | Int32 | Offset number |
| timeLimit | Int32 | Life limit [seconds], the maximum usable time |
| currentTime | Int32 | Current life [seconds], the time already used |
| prewarningTime | Int32 | Warning life [seconds], an alarm is raised when the current life reaches this value |
| countLimit | Int32 | Life limit [counts], the maximum usable count |
| currentCount | Int32 | Current life [counts], the count already used |
| prewarningCount | Int32 | Warning life [counts], an alarm is raised when the current life reaches this value |
| wearLimit | Int32 | Life limit [machine's default length unit], the maximum allowable wear |
| currentWear | Int32 | Current life [machine's default length unit], the current wear amount |
| prewarningWear | Int32 | Warning life [machine's default length unit], an alarm is raised when the current life reaches this value |

:::note[Note]
This table lists the generic tool life data. To standardize across all machine systems, some parameters are converted from the raw data. To obtain the raw data, use [2.5.1.23. readToolLifeDetails: Read Tool Life Details](#readtoollifedetails).
:::

For the life types supported by each system model, see [1.2.25. ToolLife: Tool Life Data](/en/conventions/data-classes/#toollife).

## 2.5.1.22. batchReadToolLife: Batch Read Tool Life {#batchreadtoollife}

This endpoint is the batch version of [2.5.1.21. readToolLife: Read Tool Life](#readtoollife). By supplying a list of target tools in the request body, multiple sets of data can be read in a single call.

```http
POST /api/cnc/batchReadToolLife?machineID=MACHINEID
```

Request body example, application/json

```json
[
  {
    "groupNum": 1,
    "toolIndex": 4
  },
  {
    "groupNum": 2,
    "toolIndex": 3
  }
]
```

The request parameters are the same as [2.5.1.21. readToolLife: Read Tool Life](#readtoollife).

| Request Parameter | Type | Description |
| --- | --- | --- |
| machineID | String | (Required) Identifier of the target machine, see [1.1.1. machineID: Machine Identifier](/en/conventions/identifiers/#machineid) |
| groupNum | Int32 | Supply groupNum (tool group number), or toolIndex (index within the group), or toolNum (tool number), or offsetNum (offset number) to identify the target tool. These request parameters correspond to the tags in [1.2.25. ToolLife: Tool Life Data](/en/conventions/data-classes/#toollife), where the groupNum parameter corresponds to toolGroupNum in the tags, offsetNum corresponds to toolOffsetNum in the tags, and the other parameters share names with the tags. Refer to the per-system tag combination table in [1.2.25. ToolLife: Tool Life Data](/en/conventions/data-classes/#toollife) to determine which combination of request parameters to supply. |
| toolIndex | Int32 | Same as above (described together with the groupNum row) |
| toolNum | Int32 | Same as above (described together with the groupNum row) |
| offsetNum | Int32 | Same as above (described together with the groupNum row) |

Response example

```json
[
  {
    "toolNum": 32,
    "toolIndex": 4,
    "toolGroupNum": 1,
    "countLimit": 100,
    "currentCount": 21
  },
  {
    "toolNum": 23,
    "toolIndex": 3,
    "toolGroupNum": 2,
    "countLimit": 200,
    "currentCount": 58
  }
]
```

The response parameters are the same as [2.5.1.21. readToolLife: Read Tool Life](#readtoollife). If an individual request fails, the corresponding position in the returned array holds that request's error information.

| Response Parameter | Type | Description |
| --- | --- | --- |
| toolGroupNum | Int32 | Tool group number |
| toolIndex | Int32 | Index within the group |
| toolNum | Int32 | Tool number |
| toolOffsetNum | Int32 | Offset number |
| timeLimit | Int32 | Life limit [seconds], the maximum usable time |
| currentTime | Int32 | Current life [seconds], the time already used |
| prewarningTime | Int32 | Warning life [seconds], an alarm is raised when the current life reaches this value |
| countLimit | Int32 | Life limit [counts], the maximum usable count |
| currentCount | Int32 | Current life [counts], the count already used |
| prewarningCount | Int32 | Warning life [counts], an alarm is raised when the current life reaches this value |
| wearLimit | Int32 | Life limit [machine's default length unit], the maximum allowable wear |
| currentWear | Int32 | Current life [machine's default length unit], the current wear amount |
| prewarningWear | Int32 | Warning life [machine's default length unit], an alarm is raised when the current life reaches this value |

:::note[Note]
This table lists the generic tool life data. To standardize across all machine systems, some data is converted from the raw data.
:::

For the life types supported by each system model, see [1.2.25. ToolLife: Tool Life Data](/en/conventions/data-classes/#toollife).

## 2.5.1.23. readToolLifeDetails: Read Tool Life Details {#readtoollifedetails}

In addition to the generic tool life data also returned by [2.5.1.21. readToolLife: Read Tool Life](#readtoollife), this endpoint also returns the unprocessed raw data. Some non-generic tool life data is added to this endpoint's response parameters.

```http
GET /api/cnc/readToolLifeDetails?machineID=MACHINEID&groupNum=GROUPNUM&toolIndex=TOOLINDEX&toolNum=TOOLNUM&offsetNum=OFFSETNUM
```

The request parameters are the same as [2.5.1.21. readToolLife: Read Tool Life](#readtoollife).

| Request Parameter | Type | Description |
| --- | --- | --- |
| machineID | String | (Required) Identifier of the target machine, see [1.1.1. machineID: Machine Identifier](/en/conventions/identifiers/#machineid) |
| groupNum | Int32 | Supply groupNum (tool group number), or toolIndex (index within the group), or toolNum (tool number), or offsetNum (offset number) to identify the target tool. These request parameters correspond to the tags in [1.2.25. ToolLife: Tool Life Data](/en/conventions/data-classes/#toollife), where the groupNum parameter corresponds to toolGroupNum in the tags, offsetNum corresponds to toolOffsetNum in the tags, and the other parameters share names with the tags. Refer to the per-system tag combination table in [1.2.25. ToolLife: Tool Life Data](/en/conventions/data-classes/#toollife) to determine which combination of request parameters to supply. |
| toolIndex | Int32 | Same as above (described together with the groupNum row) |
| toolNum | Int32 | Same as above (described together with the groupNum row) |
| offsetNum | Int32 | Same as above (described together with the groupNum row) |

Examples 1–2 are Fanuc examples.

Example 1, Fanuc count-based:

(The original here shows a screenshot of the Fanuc tool life screen: group 00000001 (max tool count: 32), type 1 (1: count, 2: minutes), life 100, count 21; tool list numbers 01–04, T codes 00000001/00000008/00000002/00000032, H codes 001/000/002/120, D codes 001/000/002/008.)

The type shown above is 1, indicating count-based. To get the tool life data for the machine with machineID 1010 shown above, tool group number 1, index within group 4, the request is as follows:

```
/api/cnc/readToolLifeDetails?machineID=1010&groupNum=1&toolIndex=4
```

Response example

```json
{
  "toolNum": 32,
  "toolIndex": 4,
  "toolGroupNum": 1,
  "countLimit": 100,
  "currentCount": 21,
  "rawToolLifeType": "Count",
  "rawToolLifeStatus": "Enabled"
}
```

toolNum is the T code shown above; toolIndex is the number shown above; toolGroupNum is the group shown above; countLimit is the life shown above, in counts; currentCount is the count shown above, in counts. rawToolLifeType is the type shown above; rawToolLifeStatus is the status flag shown above.

Example 2, Fanuc time-based:

(The original here shows a screenshot of the Fanuc tool life screen: group 00000002 (max tool count: 32), type 2 (1: count, 2: minutes), life 1000, count 23; tool list numbers 01–02, T codes 00000004/00000000, H codes 004/000, D codes 004/000.)

The type shown above is 2, indicating time-based. To get the tool life data for the machine with machineID 1010 shown above, tool group number 2, index within group 2, the request is as follows:

```
/api/cnc/readToolLifeDetails?machineID=1010&groupNum=2&toolIndex=2
```

Response example

```json
{
  "toolNum": 8,
  "toolIndex": 2,
  "toolGroupNum": 1,
  "timeLimit": 60000,
  "currentTime": 1380,
  "rawToolLifeType": "Time",
  "rawToolLifeUnit": "Minute",
  "rawToolLifeStatus": "Enabled",
  "rawTimeLimit": 1000.0,
  "rawCurrentTime": 23.0
}
```

toolNum is the T code shown above; toolIndex is the number shown above; toolGroupNum is the group shown above; timeLimit is the life shown above, in seconds; rawTimeLimit is the life shown above, in minutes; currentTime is the count shown above, in seconds; rawCurrentTime is the count shown above, in minutes. rawToolLifeType is the type shown above; rawToolLifeUnit is the raw data's time unit; rawToolLifeStatus is the status flag shown above.

Examples 3–4 are Siemens examples.

Example 3, Siemens time-based:

(The original here shows a screenshot of the Siemens SINUMERIK OPERATE tool wear screen (MAGAZIN1): position 1, tool name ROUGHING_T80 A, ST 1, D 1, Δ length Z 0.780, Δ radius 0.750, TC column T, tool life 30.0, target value 30.0, warning value 6.2.)

The "TC" column shown above is T, indicating time-based. To get the offset data for the machine with machineID 1010 shown above, position (tool number) 1, D (offset number) 1, the request is as follows:

```
/api/cnc/readToolLifeDetails?machineID=1010&toolNum=1&offsetNum=1
```

Response example

```json
{
  "toolNum": 1,
  "toolOffsetNum": 1,
  "timeLimit": 1800,
  "currentTime": 0,
  "prewarningTime": 1428,
  "rawToolLifeType": "Time",
  "rawToolLifeUnit": "Minute",
  "rawTimeLimit": 30.0,
  "rawRemainingTime": 30.0,
  "rawPrewarningRemainingTime": 6.2
}
```

toolNum is the position shown above; toolOffsetNum is the D shown above; timeLimit is the target value shown above, in seconds; rawTimeLimit is the target value shown above, in minutes; currentTime is the difference between the target value and the tool life shown above, in seconds; rawRemainingTime is the tool life shown above, in minutes; prewarningTime is the difference between the target value and the warning value shown above, in seconds; rawPrewarningRemainingTime is the warning value shown above, in minutes. rawToolLifeType is the TC shown above; rawToolLifeUnit is the raw data's time unit.

In general, the system issues a warning when currentTime (current life) is greater than or equal to prewarningTime (warning life). On Siemens systems, the configured tool life actually represents rawRemainingTime, the remaining usable life, which decreases continuously with machining, and an alarm is raised when the tool life falls below rawPrewarningRemainingTime, the warning value.

Example 4, Siemens wear-based:

(The original here shows a screenshot of the Siemens SINUMERIK OPERATE tool wear screen (MAGAZIN1): position 3, tool name FINISHING_T35 A, ST 1, D 1, Δ length Z 0.000, Δ radius 0.000, TC column W, wear amount 2.000, rated value 2.000, warning value 1.000.)

The "TC" column shown above is W, indicating wear-based. To get the offset data for the machine with machineID 1010 shown above, position (tool number) 3, D (offset number) 1, the request is as follows:

```
/api/cnc/readToolLifeDetails?machineID=1010&toolNum=3&offsetNum=1
```

Response example

```json
{
  "toolNum": 3,
  "toolOffsetNum": 1,
  "wearLimit": 2.0,
  "currentWear": 0.0,
  "prewarningWear": 1.0,
  "rawToolLifeType": "Wear",
  "rawRemainingWear": 2.0,
  "rawPrewarningRemainingWear": 1.0
}
```

toolNum is the position shown above; toolOffsetNum is the D shown above; wearLimit is the rated value shown above; currentWear is the difference between the rated value and the wear amount shown above; rawRemainingWear is the wear amount shown above; prewarningWear is the difference between the rated value and the warning value shown above; rawPrewarningRemainingWear is the warning value shown above. rawToolLifeType is the TC shown above. Wear-related quantities are in the machine's default length unit, mm or inch.

| Response Parameter | Type | Description |
| --- | --- | --- |
| **Generic Data** | | |
| groupNum | Int32 | Tool group number |
| toolIndex | Int32 | Index within the group |
| toolNum | Int32 | Tool number |
| toolOffsetNum | Int32 | Offset number |
| timeLimit | Int32 | Life limit [seconds], the maximum usable time |
| currentTime | Int32 | Current life [seconds], the time already used |
| prewarningTime | Int32 | Warning life [seconds], an alarm is raised when the current life reaches this value |
| countLimit | Int32 | Life limit [counts], the maximum usable count |
| currentCount | Int32 | Current life [counts], the count already used |
| prewarningCount | Int32 | Warning life [counts], an alarm is raised when the current life reaches this value |
| wearLimit | Int32 | Life limit [machine's default length unit], the maximum allowable wear |
| currentWear | Int32 | Current life [machine's default length unit], the current wear amount |
| prewarningWear | Int32 | Warning life [machine's default length unit], an alarm is raised when the current life reaches this value |
| **Raw Data** | | |
| rawToolLifeType | String | Tool life type |
| rawToolLifeUnit | String | Time unit, hereafter abbreviated as [Time] |
| rawToolLifeStatus | String | Tool life status |
| rawTimeLimit | Double | Life limit [Time] |
| rawTimeLimit1 | Double | Maximum tool life [Time], Heidenhain only |
| rawTimeLimit2 | Double | Maximum life of the invoked tool [Time], Heidenhain only |
| rawCurrentTime | Double | Current life [Time] |
| rawOverTime | Double | Time exceeding tool life [Time], Heidenhain only |
| rawRemainingTime | Double | Remaining life [Time], Siemens only |
| rawPrewarningRemainingTime | Double | Warning remaining life [Time], Siemens only |
| rawRemainingCount | Int32 | Remaining life [counts], Siemens only |
| rawPrewarningRemainingCount | Int32 | Warning remaining life [counts], Siemens only |
| rawRemainingWear | Double | Remaining life [machine's default length unit], Siemens only |
| rawPrewarningRemainingWear | Double | Warning remaining life [machine's default length unit], Siemens only |
| inventoryNum | String | Tool identification code, Heidenhain only |

:::note[Note]
The generic data portion of this table is the same as the response parameters in [2.5.1.21. readToolLife: Read Tool Life](#readtoollife).
:::

For the life types supported by each system model, see [1.2.25. ToolLife: Tool Life Data](/en/conventions/data-classes/#toollife).

## 2.5.1.24. batchReadToolLifeDetails: Batch Read Tool Life Details {#batchreadtoollifedetails}

This endpoint is the batch version of [2.5.1.23. readToolLifeDetails: Read Tool Life Details](#readtoollifedetails). By supplying a list of target tools in the request body, multiple sets of data can be read in a single call.

```http
POST /api/cnc/batchReadToolLifeDetails?machineID=MACHINEID
```

Request body example, application/json

```json
[
  {
    "groupNum": 1,
    "toolIndex": 4
  },
  {
    "groupNum": 2,
    "toolIndex": 3
  }
]
```

The request parameters are the same as [2.5.1.23. readToolLifeDetails: Read Tool Life Details](#readtoollifedetails).

| Request Parameter | Type | Description |
| --- | --- | --- |
| machineID | String | (Required) Identifier of the target machine, see [1.1.1. machineID: Machine Identifier](/en/conventions/identifiers/#machineid) |
| groupNum | Int32 | Supply groupNum (tool group number), or toolIndex (index within the group), or toolNum (tool number), or offsetNum (offset number) to identify the target tool. These request parameters correspond to the tags in [1.2.25. ToolLife: Tool Life Data](/en/conventions/data-classes/#toollife), where the groupNum parameter corresponds to toolGroupNum in the tags, offsetNum corresponds to toolOffsetNum in the tags, and the other parameters share names with the tags. Refer to the per-system tag combination table in [1.2.25. ToolLife: Tool Life Data](/en/conventions/data-classes/#toollife) to determine which combination of request parameters to supply. |
| toolIndex | Int32 | Same as above (described together with the groupNum row) |
| toolNum | Int32 | Same as above (described together with the groupNum row) |
| offsetNum | Int32 | Same as above (described together with the groupNum row) |

Response example

```json
[
  {
    "toolNum": 32,
    "toolIndex": 4,
    "toolGroupNum": 1,
    "countLimit": 100,
    "currentCount": 21
  },
  {
    "toolNum": 23,
    "toolIndex": 3,
    "toolGroupNum": 2,
    "countLimit": 200,
    "currentCount": 58
  }
]
```

The response parameters are the same as [2.5.1.23. readToolLifeDetails: Read Tool Life Details](#readtoollifedetails). If an individual request fails, the corresponding position in the returned array holds that request's error information.

| Response Parameter | Type | Description |
| --- | --- | --- |
| **Generic Data** | | |
| groupNum | Int32 | Tool group number |
| toolIndex | Int32 | Index within the group |
| toolNum | Int32 | Tool number |
| toolOffsetNum | Int32 | Offset number |
| timeLimit | Int32 | Life limit [seconds], the maximum usable time |
| currentTime | Int32 | Current life [seconds], the time already used |
| prewarningTime | Int32 | Warning life [seconds], an alarm is raised when the current life reaches this value |
| countLimit | Int32 | Life limit [counts], the maximum usable count |
| currentCount | Int32 | Current life [counts], the count already used |
| prewarningCount | Int32 | Warning life [counts], an alarm is raised when the current life reaches this value |
| wearLimit | Int32 | Life limit [machine's default length unit], the maximum allowable wear |
| currentWear | Int32 | Current life [machine's default length unit], the current wear amount |
| prewarningWear | Int32 | Warning life [machine's default length unit], an alarm is raised when the current life reaches this value |
| **Raw Data** | | |
| rawToolLifeType | String | Tool life type |
| rawToolLifeUnit | String | Time unit, hereafter abbreviated as [Time] |
| rawToolLifeStatus | String | Tool life status |
| rawTimeLimit | Double | Life limit [Time] |
| rawTimeLimit1 | Double | Maximum tool life [Time], Heidenhain only |
| rawTimeLimit2 | Double | Maximum life of the invoked tool [Time], Heidenhain only |
| rawCurrentTime | Double | Current life [Time] |
| rawOverTime | Double | Time exceeding tool life [Time], Heidenhain only |
| rawRemainingTime | Double | Remaining life [Time], Siemens only |
| rawPrewarningRemainingTime | Double | Warning remaining life [Time], Siemens only |
| rawRemainingCount | Int32 | Remaining life [counts], Siemens only |
| rawPrewarningRemainingCount | Int32 | Warning remaining life [counts], Siemens only |
| rawRemainingWear | Double | Remaining life [machine's default length unit], Siemens only |
| rawPrewarningRemainingWear | Double | Warning remaining life [machine's default length unit], Siemens only |
| inventoryNum | String | Tool identification code, Heidenhain only |

:::note[Note]
The generic data portion of this table is the same as the response parameters in [2.5.1.21. readToolLife: Read Tool Life](#readtoollife).
:::

For the life types supported by each system model, see [1.2.25. ToolLife: Tool Life Data](/en/conventions/data-classes/#toollife).
