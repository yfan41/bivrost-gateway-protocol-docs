---
title: "2.5.1. 直接读写：刀具寿命"
sidebar:
  label: "2.5.1. 直接读写 · 刀具寿命"
---


本页承接 [2.5.1. 直接读写](/http/direct-read/#direct)，收录刀具寿命相关接口（2.5.1.21–2.5.1.24）。

## 2.5.1.21. readToolLife 读取刀具寿命 {#readtoollife}

```http
GET /api/cnc/readToolLife?machineID=MACHINEID&groupNum=GROUPNUM&toolIndex=TOOLINDEX&toolNum=TOOLNUM&offsetNum=OFFSETNUM
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| machineID | String | (必需)目标机台标识，详见 [1.1.1. machineID 机台标识](/conventions/identifiers/#machineid) |
| groupNum | Int32 | 补充 groupNum 刀组号，或 toolIndex 组内序号，或 toolNum 刀具号，或 offsetNum 刀补号，以确定目标刀具。请求参数对应 [1.2.25. ToolLife：刀具寿命数据](/conventions/data-classes/#toollife)中的标签，其中参数 groupNum 对应标签中的 toolGroupNum，参数 offsetNum 对应标签中的 toolOffsetNum，其他的参数与标签名称一致。参考 [1.2.25. ToolLife：刀具寿命数据](/conventions/data-classes/#toollife)中各系统的标签组合表，补充请求参数组合。 |
| toolIndex | Int32 | 同上（与 groupNum 行合并说明） |
| toolNum | Int32 | 同上（与 groupNum 行合并说明） |
| offsetNum | Int32 | 同上（与 groupNum 行合并说明） |

示例 1-2 为 Fanuc 发那科示例。

示例 1，Fanuc 发那科计次：

（原文此处为 Fanuc 刀具寿命界面截图：组 00000001（最大刀具数：32），型号 1（1: 次，2: 分），寿命 100，计数 21；刀具列表号码 01–04，T 代码分别为 00000001/00000008/00000002/00000032，H 代码 001/000/002/120，D 代码 001/000/002/008。）

上图中型号为 1，代表计次。获取上图中 machineID 为 1010 的机台的刀组号为 1，组内序号为 4 的刀具寿命数据，请求如下：

```
/api/cnc/readToolLife?machineID=1010&groupNum=1&toolIndex=4
```

返回示例

```json
{
  "toolNum": 32,
  "toolIndex": 4,
  "toolGroupNum": 1,
  "countLimit": 100,
  "currentCount": 21
}
```

toolNum 为上图中 T 代码；toolIndex 为上图中号码；toolGroupNum 为上图中组；countLimit 为上图中寿命，单位：次；currentCount 为上图中计数，单位：次。

示例 2，Fanuc 发那科计时：

（原文此处为 Fanuc 刀具寿命界面截图：组 00000002（最大刀具数：32），型号 2（1: 次，2: 分），寿命 1000，计数 23；刀具列表号码 01–02，T 代码分别为 00000004/00000000，H 代码 004/000，D 代码 004/000。）

上图中型号为 2，代表计时。获取上图中 machineID 为 1010 的机台的刀组号为 2，组内序号为 2 的刀具寿命数据，请求如下：

```
/api/cnc/readToolLife?machineID=1010&groupNum=2&toolIndex=2
```

返回示例

```json
{
  "toolNum": 8,
  "toolIndex": 2,
  "toolGroupNum": 1,
  "timeLimit": 60000,
  "currentTime": 1380
}
```

toolNum 为上图中 T 代码；toolIndex 为上图中号码；toolGroupNum 为上图中组；timeLimit 为上图中寿命，单位：秒；currentTime 为上图中计数，单位：秒。图中时间原始单位为分，返回数据统一换算为秒。

示例 3-4 为 Siemens 西门子示例。

示例 3，西门子计时：

（原文此处为 Siemens SINUMERIK OPERATE 刀具磨损界面截图（MAGAZIN1）：位置 1，刀具名称 ROUGHING_T80 A，ST 1，D 1，Δ长度Z 0.780，Δ半径 0.750，TC 列为 T，刀具寿命 30.0，目标值 30.0，预警值 6.2。）

上图中 "TC" 列为 T，代表计时。获取上图中 machineID 为 1010 的机台的位置（刀具号）为 1，D（刀补号）为 1 的刀补数据，请求如下：

```
/api/cnc/readToolLife?machineID=1010&toolNum=1&offsetNum=1
```

返回示例

```json
{
  "toolNum": 1,
  "toolOffsetNum": 1,
  "timeLimit": 1800,
  "currentTime": 0,
  "prewarningTime": 1428
}
```

toolNum 为上图中位置；toolOffsetNum 为上图中 D；timeLimit 为上图中目标值，单位：秒；currentTime 为上图中目标值与刀具寿命之差，单位：秒；prewarningTime 为上图中目标值与预警值之差，单位：秒。图中时间原始单位为分，返回数据统一换算为秒。

一般情况下，currentTime 当前寿命大于或等于 prewarningTime 预警寿命时，系统发出警告。Siemens 西门子系统设定中的刀具寿命实际为剩余可用寿命，随着加工不断减小，当刀具寿命小于预警值时报警。为了统一定义，接口输出的当前寿命与预警寿命已做了相应的换算。

示例 4，西门子计磨损：

（原文此处为 Siemens SINUMERIK OPERATE 刀具磨损界面截图（MAGAZIN1）：位置 3，刀具名称 FINISHING_T35 A，ST 1，D 1，Δ长度Z 0.000，Δ半径 0.000，TC 列为 W，磨损量 2.000，额定值 2.000，预警值 1.000。）

上图中 "TC" 列为 W，代表计磨损。获取上图中 machineID 为 1010 的机台的位置（刀具号）为 3，D（刀补号）为 1 的刀补数据，请求如下：

```
/api/cnc/readToolLife?machineID=1010&toolNum=3&offsetNum=1
```

返回示例

```json
{
  "toolNum": 3,
  "toolOffsetNum": 1,
  "wearLimit": 2.0,
  "currentWear": 0.0,
  "prewarningWear": 1.0
}
```

toolNum 为上图中位置；toolOffsetNum 为上图中 D；wearLimit 为上图中额定值；currentWear 为上图中额定值与磨损量之差；prewarningWear 为上图中额定值与预警值之差。磨损相关量单位为机床默认的长度单位 mm 或 inch。

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| toolGroupNum | Int32 | 刀组号 |
| toolIndex | Int32 | 组内序号 |
| toolNum | Int32 | 刀具号 |
| toolOffsetNum | Int32 | 刀补号 |
| timeLimit | Int32 | 寿命极限[秒]，最大可用时间 |
| currentTime | Int32 | 当前寿命[秒]，已经使用的时间 |
| prewarningTime | Int32 | 预警寿命[秒]，当前寿命达到此值时发出警报 |
| countLimit | Int32 | 寿命极限[次]，最大可用次数 |
| currentCount | Int32 | 当前寿命[次]，已经使用的次数 |
| prewarningCount | Int32 | 预警寿命[次]，当前寿命达到此值时发出警报 |
| wearLimit | Int32 | 寿命极限[机床默认的长度单位]，最大可磨损量 |
| currentWear | Int32 | 当前寿命[机床默认长度单位]，当前磨损量 |
| prewarningWear | Int32 | 预警寿命[机床默认长度单位]，当前寿命达到此值时发出警报 |

:::note[注]
表中为通用的刀具寿命数据，为了所有机床系统标准统一，有些参数由原始数据换算得到。如需获得原始数据，可以使用 [2.5.1.23. readToolLifeDetails 读取刀具寿命详情](#readtoollifedetails)。
:::

各系统型号支持的寿命类型详见 [1.2.25. ToolLife：刀具寿命数据](/conventions/data-classes/#toollife)。

## 2.5.1.22. batchReadToolLife 批量读取刀具寿命 {#batchreadtoollife}

此接口为 [2.5.1.21. readToolLife 读取刀具寿命](#readtoollife)的批量化版本，通过在请求体中补充目标刀具列表，可以一次读取多组数据。

```http
POST /api/cnc/batchReadToolLife?machineID=MACHINEID
```

请求体示例 application/json

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

请求参数与 [2.5.1.21. readToolLife 读取刀具寿命](#readtoollife)一致。

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| machineID | String | (必需)目标机台标识，详见 [1.1.1. machineID 机台标识](/conventions/identifiers/#machineid) |
| groupNum | Int32 | 补充 groupNum 刀组号，或 toolIndex 组内序号，或 toolNum 刀具号，或 offsetNum 刀补号，以确定目标刀具。请求参数对应 [1.2.25. ToolLife：刀具寿命数据](/conventions/data-classes/#toollife)中的标签，其中参数 groupNum 对应标签中的 toolGroupNum，参数 offsetNum 对应标签中的 toolOffsetNum，其他的参数与标签名称一致。参考 [1.2.25. ToolLife：刀具寿命数据](/conventions/data-classes/#toollife)中各系统的标签组合表，补充请求参数组合。 |
| toolIndex | Int32 | 同上（与 groupNum 行合并说明） |
| toolNum | Int32 | 同上（与 groupNum 行合并说明） |
| offsetNum | Int32 | 同上（与 groupNum 行合并说明） |

返回示例

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

返回参数与 [2.5.1.21. readToolLife 读取刀具寿命](#readtoollife)一致。如果某条请求失败，则返回数组中对应位置为该请求的错误信息。

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| toolGroupNum | Int32 | 刀组号 |
| toolIndex | Int32 | 组内序号 |
| toolNum | Int32 | 刀具号 |
| toolOffsetNum | Int32 | 刀补号 |
| timeLimit | Int32 | 寿命极限[秒]，最大可用时间 |
| currentTime | Int32 | 当前寿命[秒]，已经使用的时间 |
| prewarningTime | Int32 | 预警寿命[秒]，当前寿命达到此值时发出警报 |
| countLimit | Int32 | 寿命极限[次]，最大可用次数 |
| currentCount | Int32 | 当前寿命[次]，已经使用的次数 |
| prewarningCount | Int32 | 预警寿命[次]，当前寿命达到此值时发出警报 |
| wearLimit | Int32 | 寿命极限[机床默认的长度单位]，最大可磨损量 |
| currentWear | Int32 | 当前寿命[机床默认长度单位]，当前磨损量 |
| prewarningWear | Int32 | 预警寿命[机床默认的长度单位]，当前寿命达到此值时发出警报 |

:::note[注]
表中为通用的刀具寿命数据，为了所有机床系统标准统一，有些数据由原始数据换算得到。
:::

各系统型号支持的寿命类型详见 [1.2.25. ToolLife：刀具寿命数据](/conventions/data-classes/#toollife)。

## 2.5.1.23. readToolLifeDetails 读取刀具寿命详情 {#readtoollifedetails}

此接口除了读取到与 [2.5.1.21. readToolLife 读取刀具寿命](#readtoollife)相同的通用刀具寿命数据，还能获取到未经处理的原始数据。一些不通用的刀具寿命数据会被添加到这个接口的返回参数中。

```http
GET /api/cnc/readToolLifeDetails?machineID=MACHINEID&groupNum=GROUPNUM&toolIndex=TOOLINDEX&toolNum=TOOLNUM&offsetNum=OFFSETNUM
```

请求参数与 [2.5.1.21. readToolLife 读取刀具寿命](#readtoollife)一致。

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| machineID | String | (必需)目标机台标识，详见 [1.1.1. machineID 机台标识](/conventions/identifiers/#machineid) |
| groupNum | Int32 | 补充 groupNum 刀组号，或 toolIndex 组内序号，或 toolNum 刀具号，或 offsetNum 刀补号，以确定目标刀具。请求参数对应 [1.2.25. ToolLife：刀具寿命数据](/conventions/data-classes/#toollife)中的标签，其中参数 groupNum 对应标签中的 toolGroupNum，参数 offsetNum 对应标签中的 toolOffsetNum，其他的参数与标签名称一致。参考 [1.2.25. ToolLife：刀具寿命数据](/conventions/data-classes/#toollife)中各系统的标签组合表，补充请求参数组合。 |
| toolIndex | Int32 | 同上（与 groupNum 行合并说明） |
| toolNum | Int32 | 同上（与 groupNum 行合并说明） |
| offsetNum | Int32 | 同上（与 groupNum 行合并说明） |

示例 1-2 为 Fanuc 发那科示例。

示例 1，Fanuc 发那科计次：

（原文此处为 Fanuc 刀具寿命界面截图：组 00000001（最大刀具数：32），型号 1（1: 次，2: 分），寿命 100，计数 21；刀具列表号码 01–04，T 代码分别为 00000001/00000008/00000002/00000032，H 代码 001/000/002/120，D 代码 001/000/002/008。）

上图中型号为 1，代表计次。获取上图中 machineID 为 1010 的机台的刀组号为 1，组内序号为 4 的刀具寿命数据，请求如下：

```
/api/cnc/readToolLifeDetails?machineID=1010&groupNum=1&toolIndex=4
```

返回示例

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

toolNum 为上图中 T 代码；toolIndex 为上图中号码；toolGroupNum 为上图中组；countLimit 为上图中寿命，单位：次；currentCount 为上图中计数，单位：次。rawToolLifeType 为上图中型号；rawToolLifeStatus 为上图中的状态标识。

示例 2，Fanuc 发那科计时：

（原文此处为 Fanuc 刀具寿命界面截图：组 00000002（最大刀具数：32），型号 2（1: 次，2: 分），寿命 1000，计数 23；刀具列表号码 01–02，T 代码分别为 00000004/00000000，H 代码 004/000，D 代码 004/000。）

上图中型号为 2，代表计时。获取上图中 machineID 为 1010 的机台的刀组号为 2，组内序号为 2 的刀具寿命数据，请求如下：

```
/api/cnc/readToolLifeDetails?machineID=1010&groupNum=2&toolIndex=2
```

返回示例

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

toolNum 为上图中 T 代码；toolIndex 为上图中号码；toolGroupNum 为上图中组；timeLimit 为上图中寿命，单位：秒；rawTimeLimit 为上图中寿命，单位：分；currentTime 为上图中计数，单位：秒；rawCurrentTime 为上图中计数，单位：分。rawToolLifeType 为上图中型号；rawToolLifeUnit 为原始数据时间单位；rawToolLifeStatus 为上图中的状态标识。

示例 3-4 为 Siemens 西门子示例。

示例 3，西门子计时：

（原文此处为 Siemens SINUMERIK OPERATE 刀具磨损界面截图（MAGAZIN1）：位置 1，刀具名称 ROUGHING_T80 A，ST 1，D 1，Δ长度Z 0.780，Δ半径 0.750，TC 列为 T，刀具寿命 30.0，目标值 30.0，预警值 6.2。）

上图中 "TC" 列为 T，代表计时。获取上图中 machineID 为 1010 的机台的位置（刀具号）为 1，D（刀补号）为 1 的刀补数据，请求如下：

```
/api/cnc/readToolLifeDetails?machineID=1010&toolNum=1&offsetNum=1
```

返回示例

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

toolNum 为上图中位置；toolOffsetNum 为上图中 D；timeLimit 为上图中目标值，单位：秒；rawTimeLimit 为上图中目标值，单位：分；currentTime 为上图中目标值与刀具寿命之差，单位：秒；rawRemainingTime 为上图中刀具寿命，单位：分；prewarningTime 为上图中目标值与预警值之差，单位：秒；rawPrewarningRemainingTime 为上图中预警值，单位：分。rawToolLifeType 为上图中 TC；rawToolLifeUnit 为原始数据时间单位。

一般情况下，currentTime 当前寿命大于或等于 prewarningTime 预警寿命时，系统发出警告。Siemens 西门子系统设定中的刀具寿命实际为 rawRemainingTime 剩余可用寿命，随着加工不断减小，当刀具寿命小于 rawPrewarningRemainingTime 预警值时报警。

示例 4，西门子计磨损：

（原文此处为 Siemens SINUMERIK OPERATE 刀具磨损界面截图（MAGAZIN1）：位置 3，刀具名称 FINISHING_T35 A，ST 1，D 1，Δ长度Z 0.000，Δ半径 0.000，TC 列为 W，磨损量 2.000，额定值 2.000，预警值 1.000。）

上图中 "TC" 列为 W，代表计磨损。获取上图中 machineID 为 1010 的机台的位置（刀具号）为 3，D（刀补号）为 1 的刀补数据，请求如下：

```
/api/cnc/readToolLifeDetails?machineID=1010&toolNum=3&offsetNum=1
```

返回示例

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

toolNum 为上图中位置；toolOffsetNum 为上图中 D；wearLimit 为上图中额定值；currentWear 为上图中额定值与磨损量之差；rawRemainingWear 为上图中磨损量；prewarningWear 为上图中额定值与预警值之差；rawPrewarningRemainingWear 为上图中预警值。rawToolLifeType 为上图中 TC。磨损相关量单位为机床默认的长度单位 mm 或 inch。

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| **通用数据** | | |
| groupNum | Int32 | 刀组号 |
| toolIndex | Int32 | 组内序号 |
| toolNum | Int32 | 刀具号 |
| toolOffsetNum | Int32 | 刀补号 |
| timeLimit | Int32 | 寿命极限[秒]，最大可用时间 |
| currentTime | Int32 | 当前寿命[秒]，已经使用的时间 |
| prewarningTime | Int32 | 预警寿命[秒]，当前寿命达到此值时发出警报 |
| countLimit | Int32 | 寿命极限[次]，最大可用次数 |
| currentCount | Int32 | 当前寿命[次]，已经使用的次数 |
| prewarningCount | Int32 | 预警寿命[次]，当前寿命达到此值时发出警报 |
| wearLimit | Int32 | 寿命极限[机床默认的长度单位]，最大可磨损量 |
| currentWear | Int32 | 当前寿命[机床默认长度单位]，当前磨损量 |
| prewarningWear | Int32 | 预警寿命[机床默认的长度单位]，当前寿命达到此值时发出警报 |
| **原始数据** | | |
| rawToolLifeType | String | 刀具寿命类型 |
| rawToolLifeUnit | String | 时间单位，以下简称为[时间] |
| rawToolLifeStatus | String | 刀具寿命状态 |
| rawTimeLimit | Double | 寿命极限[时间] |
| rawTimeLimit1 | Double | 刀具最长寿命[时间]，仅 Heidenhain 海德汉 |
| rawTimeLimit2 | Double | 调用刀具的最长寿命[时间]，仅 Heidenhain 海德汉 |
| rawCurrentTime | Double | 当前寿命[时间] |
| rawOverTime | Double | 超出刀具寿命[时间]，仅 Heidenhain 海德汉 |
| rawRemainingTime | Double | 剩余寿命[时间]，仅 Siemens 西门子 |
| rawPrewarningRemainingTime | Double | 预警剩余寿命[时间]，仅 Siemens 西门子 |
| rawRemainingCount | Int32 | 剩余寿命[次]，仅 Siemens 西门子 |
| rawPrewarningRemainingCount | Int32 | 预警剩余寿命[次]，仅 Siemens 西门子 |
| rawRemainingWear | Double | 剩余寿命[机床默认长度单位]，仅 Siemens 西门子 |
| rawPrewarningRemainingWear | Double | 预警剩余寿命[机床默认长度单位]，仅 Siemens 西门子 |
| inventoryNum | String | 刀具识别码，仅 Heidenhain 海德汉 |

:::note[注]
表中通用数据部分即 [2.5.1.21. readToolLife 读取刀具寿命](#readtoollife)中的返回参数。
:::

各系统型号支持的寿命类型详见 [1.2.25. ToolLife：刀具寿命数据](/conventions/data-classes/#toollife)。

## 2.5.1.24. batchReadToolLifeDetails 批量读取刀具寿命详情 {#batchreadtoollifedetails}

此接口为 [2.5.1.23. readToolLifeDetails 读取刀具寿命详情](#readtoollifedetails)的批量化版本，通过在请求体中补充目标刀具列表，可以一次读取多组数据。

```http
POST /api/cnc/batchReadToolLifeDetails?machineID=MACHINEID
```

请求体示例 application/json

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

请求参数与 [2.5.1.23. readToolLifeDetails 读取刀具寿命详情](#readtoollifedetails)一致。

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| machineID | String | (必需)目标机台标识，详见 [1.1.1. machineID 机台标识](/conventions/identifiers/#machineid) |
| groupNum | Int32 | 补充 groupNum 刀组号，或 toolIndex 组内序号，或 toolNum 刀具号，或 offsetNum 刀补号，以确定目标刀具。请求参数对应 [1.2.25. ToolLife：刀具寿命数据](/conventions/data-classes/#toollife)中的标签，其中参数 groupNum 对应标签中的 toolGroupNum，参数 offsetNum 对应标签中的 toolOffsetNum，其他的参数与标签名称一致。参考 [1.2.25. ToolLife：刀具寿命数据](/conventions/data-classes/#toollife)中各系统的标签组合表，补充请求参数组合。 |
| toolIndex | Int32 | 同上（与 groupNum 行合并说明） |
| toolNum | Int32 | 同上（与 groupNum 行合并说明） |
| offsetNum | Int32 | 同上（与 groupNum 行合并说明） |

返回示例

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

返回参数与 [2.5.1.23. readToolLifeDetails 读取刀具寿命详情](#readtoollifedetails)一致。如果某条请求失败，则返回数组中对应位置为该请求的错误信息。

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| **通用数据** | | |
| groupNum | Int32 | 刀组号 |
| toolIndex | Int32 | 组内序号 |
| toolNum | Int32 | 刀具号 |
| toolOffsetNum | Int32 | 刀补号 |
| timeLimit | Int32 | 寿命极限[秒]，最大可用时间 |
| currentTime | Int32 | 当前寿命[秒]，已经使用的时间 |
| prewarningTime | Int32 | 预警寿命[秒]，当前寿命达到此值时发出警报 |
| countLimit | Int32 | 寿命极限[次]，最大可用次数 |
| currentCount | Int32 | 当前寿命[次]，已经使用的次数 |
| prewarningCount | Int32 | 预警寿命[次]，当前寿命达到此值时发出警报 |
| wearLimit | Int32 | 寿命极限[机床默认的长度单位]，最大可磨损量 |
| currentWear | Int32 | 当前寿命[机床默认长度单位]，当前磨损量 |
| prewarningWear | Int32 | 预警寿命[机床默认长度单位]，当前寿命达到此值时发出警报 |
| **原始数据** | | |
| rawToolLifeType | String | 刀具寿命类型 |
| rawToolLifeUnit | String | 时间单位，以下简称为[时间] |
| rawToolLifeStatus | String | 刀具寿命状态 |
| rawTimeLimit | Double | 寿命极限[时间] |
| rawTimeLimit1 | Double | 刀具最长寿命[时间]，仅 Heidenhain 海德汉 |
| rawTimeLimit2 | Double | 调用刀具的最长寿命[时间]，仅 Heidenhain 海德汉 |
| rawCurrentTime | Double | 当前寿命[时间] |
| rawOverTime | Double | 超出刀具寿命[时间]，仅 Heidenhain 海德汉 |
| rawRemainingTime | Double | 剩余寿命[时间]，仅 Siemens 西门子 |
| rawPrewarningRemainingTime | Double | 预警剩余寿命[时间]，仅 Siemens 西门子 |
| rawRemainingCount | Int32 | 剩余寿命[次]，仅 Siemens 西门子 |
| rawPrewarningRemainingCount | Int32 | 预警剩余寿命[次]，仅 Siemens 西门子 |
| rawRemainingWear | Double | 剩余寿命[机床默认长度单位]，仅 Siemens 西门子 |
| rawPrewarningRemainingWear | Double | 预警剩余寿命[机床默认长度单位]，仅 Siemens 西门子 |
| inventoryNum | String | 刀具识别码，仅 Heidenhain 海德汉 |

:::note[注]
表中通用数据部分即 [2.5.1.21. readToolLife 读取刀具寿命](#readtoollife)中的返回参数。
:::

各系统型号支持的寿命类型详见 [1.2.25. ToolLife：刀具寿命数据](/conventions/data-classes/#toollife)。
