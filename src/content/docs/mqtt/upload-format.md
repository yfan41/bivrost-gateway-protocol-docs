---
title: "四、MQTT 通讯"
sidebar:
  label: "4.1. 数据上报报文格式"
---


启用 MQTT 通讯，并开启目标机台/机组的自动采集任务（详见《说明书》[5.3.1.2. 任务设置](https://gateway.docs.bivrost.cn/usage/machines#task-settings)，以及 [5.4.1.2. 机组任务设置](https://gateway.docs.bivrost.cn/usage/groups#group-tasks)）后，网关会基于 MQTT 协议，将自动采集任务结果数据转化成 JSON 格式的报文，并发布至指定 MQTT 服务器，数据上报的报文默认主题为 "r"。网关也支持 [RPC 接口](/mqtt/rpc/)。用户可以参照《说明书》[5.6.3. MQTT 配置](https://gateway.docs.bivrost.cn/usage/communication#mqtt)的说明配置 MQTT 服务。

## 4.1. 数据上报报文格式 {#upload-format}

网关 MQTT 协议数据上报的报文支持多种模式，包括 Default，MKT，TB，TB2，Brm，IoTDA，WisIoT 等。

各模式下报文内容结构如下：

### Default 模式 {#mode-default}

```json
{
    "type": <type>,
    "unixtimestamp": <time>,
    "data": {
        "<field>": <value>
    },
    "<tag>": <value>,
    "<entityID>": <value>
}
```

### MKT 模式 {#mode-mkt}

```json
{
    "unixtimestamp": <time>,
    "<entityID>_<fieldID>_<field>": <value>
}
```

### TB 模式 {#mode-tb}

```json
{
    "<alias>": [
        {
            "ts": <time>,
            "values": {
                "<fieldID>_<field>": <value>
            }
        }
    ]
}
```

### TB2 模式 {#mode-tb2}

```json
{
    "<machineID>": [
        {
            "ts": <time>,
            "values": {
                "<fieldID>_<field>": <value>
            }
        }
    ]
}
```

### Brm 模式 {#mode-brm}

```json
[
    {
        "type": <type>,
        "ts": <time>,
        "data": {
            "<field>": <value>
        },
        "<tag>": <value>,
        "<entityID>": <value>
    }
]
```

### IoTDA 模式 {#mode-iotda}

```json
{
    "devices": [
        {
            "device_id": <entityID>,
            "services": [
                {
                    "service_id": <type>,
                    "properties": {
                        "<tagField>_<field>": <value>
                    },
                    "event_time": <time>
                }
            ]
        }
    ]
}
```

### WisIoT 模式 {#mode-wisiot}

```json
{
    "properties": [
        {
            "key": <entityID>_<fieldID>_<field>,
            "name": <fieldID>_<field>,
            "value": <value>,
            "time": <time>
        }
    ]
}
```

### 重要概念 {#key-concepts}

1. `<entityID>` 机台或机组标识：如当前数据属于机台数据时，`<entityID>` 为机台标识 machineID；如当前数据属于机组数据时，`<entityID>` 为机组标识 groupID。machineID 与 groupID 见 [1.1. 基本说明](/conventions/identifiers/)。
2. `<alias>` 机台或机组名称：用户自定义的机台名称或机组名称（详见《说明书》[5.3.1. 添加机台](https://gateway.docs.bivrost.cn/usage/machines#add-machine)，[5.4.1. 添加机组](https://gateway.docs.bivrost.cn/usage/groups#add-group)）。
3. `<type>` 类，`<field>` 字段与 `<tag>` 标签：一个**类**包含至少一个**字段**和不定数量的**标签**。**字段**是数据的名称。当某**类**不能仅以机台或机组进行区分时，我们需要为此数据种类添加**标签**。例如，**类** SpindleOverload（主轴过载数据）包含**字段** CumulativeTime（累计过载时间），和**标签** SpindleNo（主轴号）。
4. `<tagField>` 标签的字段形式，由**标签**缩写和**标签值**组成。如 S1 是 SpindleNo=1 的字段形式。
5. `<fieldID>` 字段标识：若**类**中不包含**标签**，则**字段标识**与**类**一致。若**类**包含**标签**，则**字段标识**由**类**和**标签的字段形式**构成。**类**和多个**标签的字段形式**间由下横线隔开。**标签**在字段形式中的顺序由下文中**标签**的序号决定。例如，**字段标识** SpindleOverload_S1 表示第一主轴的过载数据，其中 S1 是 SpindleNo=1 的字段形式；**字段标识** ToolLife_G1_I2 表示刀组 1 中第 2 把刀的寿命数据，其中 G1_I2 是 GroupNum=1;Index=2 的字段形式。
6. `<time>` 时间戳：表示任务执行时的时间，单位是毫秒。
7. `<value>` 数值：数值或内容。
8. Default，和 MKT 模式，每条报文仅含来自同一机台或机组 `<entityID>` 的同一个数据类 `<type>` 的数据。TB，TB2，IoTDA，Brm，和 WisIoT 等模式，支持把来自不同机台或机组 `<entityID>` 的不同数据类 `<type>` 的数据合并到一条报文中。

### 报文示例 {#examples}

示例 1–3 为 Default 模式下报文。

#### 示例 1 {#example-1}

```json
{
  "type": "CNCStatus",
  "unixtimestamp": 1698908463135,
  "data": {
    "cncStatus": "MANUAL",
    "alarmStatus": "NO_ALARM"
  },
  "machineID": "10"
}
```

第 2 行，`"type": "CNCStatus",`

`<type>` 数据类，用 "CNCStatus" 作为关键词，可以在 [1.2. 数据说明](/conventions/data-classes/)中 `<type>` 数据类表中找到，由此找到 [1.2.4. CNCStatus：机台状态](/conventions/data-classes/#cncstatus)，识别本条报文中的数据为机台状态数据。

第 3 行，`"unixtimestamp": 1698908463135,`

`<unixtimestamp>` 时间戳，数值 1698908463135 即此条报文的时间戳。

第 4 行到第 7 行，

```json
"data": {
    "cncStatus": "MANUAL",
    "alarmStatus": "NO_ALARM"
},
```

`<data>` 数据内容，可通过 `<type>` 申明的数据类查找对应内容的解释说明。这里查找 [1.2.4. CNCStatus：机台状态](/conventions/data-classes/#cncstatus)，"cncStatus" 和 "alarmStatus" 是数据类 CNCStatus 下的 `<field>` 数据字段，代表 CNC 运行状态为调机状态：一般调机，警报状态为当前无警报。

第 8 行，`"machineID": "10"`

`<entityID>` 机台或机组标识：如当前数据属于机台数据时，`<entityID>` 为机台标识 machineID；如当前数据属于机组数据时，`<entityID>` 为机组标识 groupID。machineID 与 groupID 见 [1.1. 基本说明](/conventions/identifiers/)。

第 8 行内容代表这条报文的数据来自机台标识为 10 的机台。

#### 示例 2 {#example-2}

```json
{
  "type": "GroupCount",
  "unixtimestamp": 1698911434710,
  "data": {
    "cumulativeCount": 233
  },
  "groupID": 1
}
```

第 2 行，`"type": "GroupCount",`

`<type>` 数据类，用 "GroupCount" 作为关键词，可以在 [1.2. 数据说明](/conventions/data-classes/)中 `<type>` 数据类表中找到，由此找到 [1.2.11. GroupCount：机组加工计数数据](/conventions/data-classes/#groupcount)，识别本条报文中的数据为机组加工计数数据。

第 3 行，`"unixtimestamp": 1698911434710,`

`<unixtimestamp>` 时间戳，数值 1698911434710 即此条报文的时间戳。

第 4 行到第 6 行，

```json
"data": {
    "cumulativeCount": 233
},
```

`<data>` 数据内容，可通过 `<type>` 申明的数据类查找对应内容的解释说明。这里查找 [1.2.11. GroupCount：机组加工计数数据](/conventions/data-classes/#groupcount)，"cumulativeCount" 是数据 GroupCount 下的 `<field>` 数据字段，代表机组累计加工计数。

第 7 行，`"groupID": 1`

`<entityID>` 机台或机组标识：此处为 groupID 机组标识。

第 7 行内容代表这条报文的数据来自 1 号机组。

#### 示例 3 {#example-3}

```json
{
  "type": "ToolLife",
  "unixtimestamp": 1698908397751,
  "data": {
    "timeLimit": 1800,
    "currentTime": 1620,
    "prewarningTime": 1680
  },
  "toolNum": 9,
  "toolOffsetNum": 2,
  "machineID": "10"
}
```

第 2 行，`"type": "ToolLife",`

`<type>` 数据类，用 "ToolLife" 作为关键词，可以在 [1.2. 数据说明](/conventions/data-classes/)中 `<type>` 数据类表中找到，由此找到 [1.2.27. ToolLife：刀具寿命数据](/conventions/data-classes/#toollife)，识别本条报文中的数据为刀具寿命数据。

第 3 行，`"unixtimestamp": 1698908397751,`

`<unixtimestamp>` 时间戳，数值 1698908397751 即此条报文的时间戳。

第 4 行到第 8 行，

```json
"data": {
    "timeLimit": 1800,
    "currentTime": 1620,
    "prewarningTime": 1680
},
```

`<data>` 数据内容，可通过 `<type>` 申明的数据类查找对应内容的解释说明。这里查找 [1.2.27. ToolLife：刀具寿命数据](/conventions/data-classes/#toollife) `<field>` 数据字段，"timeLimit" 是寿命极限[秒]，"currentTime" 是当前寿命[秒]，"prewarningTime" 预警寿命[秒]。

第 9、第 10 行，`"toolNum": 9,` 与 `"toolOffsetNum": 2,`

可通过 `<type>` 申明的数据类查找对应内容的解释说明。这里查找 [1.2.27. ToolLife：刀具寿命数据](/conventions/data-classes/#toollife) `<tag>` 数据字段，"toolNum" 是刀号，"toolOffsetNum" 是刀补号。

第 9 第 10 两行内容代表这条报文的刀补数据属于 9 号刀 2 号刀补。

第 11 行，`"machineID": "10"`

`<entityID>` 机台或机组标识：此处为 machineID 机台标识，代表当前数据所属机台。

第 11 行内容代表这条报文的数据来自机台标识为 10 的机台。

#### 示例 4，MKT 模式 {#example-4}

```json
{
  "unixtimestamp": 1698908397751,
  "10_ToolLife_T9_02_timeLimit": 1800,
  "10_ToolLife_T9_02_currentTime": 1620,
  "10_ToolLife_T9_02_prewarningTime": 1680
}
```

第 2 行，`"unixtimestamp": 1698908397751,`

`<unixtimestamp>` 时间戳，数值 1698908397751 即此条报文的时间戳。

第 3 行，`"10_ToolLife_T9_02_timeLimit": 1800,`

其格式为 `"<entityID>_<fieldID>_<field>": <value>`，

其中 10 是 `<entityID>` 机台或机组标识：此处为 machineID 机台标识，代表当前数据所属机台。

ToolLife_T9_02 是 `<fieldID>` 数据字段标识，其中 ToolLife 是 `<type>` 数据类，用 "ToolLife" 作为关键词，可以在 [1.2. 数据说明](/conventions/data-classes/)中 `<type>` 数据类表中找到，由此找到 [1.2.27. ToolLife：刀具寿命数据](/conventions/data-classes/#toollife)，识别本条报文中的数据为刀具寿命数据。T9 与 02 是 `<tag>` 数据标签缩写与标签内容的组合，查找 [1.2.27. ToolLife：刀具寿命数据](/conventions/data-classes/#toollife) `<tag>` 数据标签，得到 T 是 toolNum 刀号的缩写，0 是 toolOffsetNum 刀补号的缩写，代表这条报文的刀补数据属于 9 号刀 2 号刀补。

timeLimit 是 `<field>` 数据字段，查找 [1.2.27. ToolLife：刀具寿命数据](/conventions/data-classes/#toollife) `<field>` 数据字段，"timeLimit" 是寿命极限[秒]。

这一行的内容总结：来自机台标识为 10 的机台的 9 号刀 2 号刀补的刀具寿命数据，寿命极限为 1800 秒。

第 4 行，`"10_ToolLife_T9_02_currentTime": 1620,`

类似第三行，此行内容总结：来自机台标识为 10 的机台的 9 号刀 2 号刀补的刀具寿命数据，当前寿命为 1620 秒。

第 5 行，`"10_ToolLife_T9_02_prewarningTime": 1680`

类似第三行，此行内容总结：来自机台标识为 10 的机台的 9 号刀 2 号刀补的刀具寿命数据，预警寿命为 1680 秒。

#### 示例 5，TB 模式 {#example-5}

```json
{
  "机台10": [ {
    "ts": 1698908397751,
    "values": {
      "ToolLife_T9_02_timeLimit": 1800,
      "ToolLife_T9_02_currentTime": 1620,
      "ToolLife_T9_02_prewarningTime": 1680
    }
  } ]
}
```

第 2 行，`"机台10": [ {`

其格式为 `"<alias>": [ {`，

其中机台 10 是 `<alias>` 机台或机组名称，由用户在网关机台配置页，添加/编辑机台（机组）窗口设置，如未设置，则默认 alias 与 entityID 机台或机组标识相同。

第 3 到第 6 行，`"ts": 1698908397751,`

`<ts>` 时间戳，数值 1698908397751 即此条报文的时间戳。

第 4 行到第 8 行，

```json
"values": {
    "ToolLife_T9_02_timeLimit": 1800,
    "ToolLife_T9_02_currentTime": 1620,
    "ToolLife_T9_02_prewarningTime": 1680
}
```

`<values>` 数据内容。以第 5 行为例：

`"ToolLife_T9_02_timeLimit": 1800,`

其格式为 `"<fieldID>_<field>": <value>`，

ToolLife_T9_02 是 `<fieldID>` 数据字段标识，其中 ToolLife 是 `<type>` 数据类，用 "ToolLife" 作为关键词，可以在 [1.2. 数据说明](/conventions/data-classes/)中 `<type>` 数据类表中找到，由此找到 [1.2.27. ToolLife：刀具寿命数据](/conventions/data-classes/#toollife)，识别本条报文中的数据为刀具寿命数据。T9 与 02 是 `<tag>` 数据标签缩写与标签内容的组合，查找 [1.2.27. ToolLife：刀具寿命数据](/conventions/data-classes/#toollife) `<tag>` 可以找到 T 是 toolNum 刀号的缩写，0 是 toolOffsetNum 刀补号的缩写，代表这条报文的刀补数据属于 9 号刀 2 号刀补。

timeLimit 是 `<field>` 数据字段，查找 [1.2.27. ToolLife：刀具寿命数据](/conventions/data-classes/#toollife) `<field>` 数据字段，"timeLimit" 是寿命极限[秒]。

这一行的内容：9 号刀 2 号刀补的刀具寿命数据，寿命极限为 1800 秒。

类似的，第 6 行内容：9 号刀 2 号刀补的刀具寿命数据，当前寿命为 1620 秒。第 7 行内容：9 号刀 2 号刀补的刀具寿命数据，预警寿命为 1680 秒。

#### 示例 6，IoTDA 模式 {#example-6}

```json
{
  "devices": [
    {
      "device_id": "10",
      "services": [
        {
          "service_id": "ToolLife",
          "properties": {
            "T9_02_timeLimit": 1800,
            "T9_02_currentTime": 1620,
            "T9_02_prewarningTime": 1680},
          "event_time": 1698908397751
        }
      ]
    }
  ]
}
```

第 4 行，`"device_id": "10",`

其格式为 `"device_id": <entityID>`，

其中 10 是 `<entityID>` 机台或机组标识：此处为 machineID 机台标识，代表当前数据所属机台。此行内容代表这条报文的数据来自机台标识为 10 的机台。

第 7 行，`"service_id": "ToolLife",`

其格式为 `"service_id": <type>`。用 "ToolLife" 作为关键词，可以在 [1.2. 数据说明](/conventions/data-classes/)中 `<type>` 数据类表中找到，由此找到 [1.2.27. ToolLife：刀具寿命数据](/conventions/data-classes/#toollife)，识别本条报文中的数据为刀具寿命数据。

第 8 行到第 11 行，

```json
"properties": {
    "T9_02_timeLimit": 1800,
    "T9_02_currentTime": 1620,
    "T9_02_prewarningTime": 1680},
```

T9_02 是 `<tagField>` 标签的字段形式，T9 与 02 是 `<tag>` 数据标签缩写与标签内容的组合，查找 [1.2.27. ToolLife：刀具寿命数据](/conventions/data-classes/#toollife) `<tag>` 数据标签，得到 T 是 toolNum 刀号的缩写，0 是 toolOffsetNum 刀补号的缩写，代表这条报文的刀补数据属于 9 号刀 2 号刀补。

timeLimit 是 `<field>` 数据字段，查找 [1.2.27. ToolLife：刀具寿命数据](/conventions/data-classes/#toollife) `<field>` 数据字段，"timeLimit" 是寿命极限[秒]，"currentTime" 是当前寿命[秒]，"prewarningTime" 预警寿命[秒]。

这一段的内容总结：9 号刀 2 号刀补的刀具寿命数据，寿命极限为 1800 秒，当前寿命为 1620 秒，预警寿命为 1680 秒。

第 12 行，`"event_time": 1698908397751`

其格式为 `"event_time": <time>`。数值 1698908397751 即此条报文的时间戳。
