---
title: "4. MQTT Communication"
sidebar:
  label: "4.1. Data Upload Message Format"
---


After enabling MQTT communication and turning on the automatic acquisition task for the target machine/group (see the Bivrost Gateway Manual [5.3.1.2. Task Settings](https://docs.bivrost.cn/gateway/usage/machines#task-settings) and [5.4.1.2. Group Task Settings](https://docs.bivrost.cn/gateway/usage/groups#group-tasks)), the gateway converts the automatic acquisition task results into JSON-formatted messages based on the MQTT protocol and publishes them to the specified MQTT server. The default topic for data upload messages is "r". The gateway also supports the [RPC interface](/en/mqtt/rpc/). Users can configure the MQTT service by following the instructions in the Bivrost Gateway Manual [5.6.3. MQTT Configuration](https://docs.bivrost.cn/gateway/usage/communication#mqtt).

## 4.1. Data Upload Message Format {#upload-format}

The gateway's MQTT protocol data upload messages support multiple modes, including Default, MKT, TB, TB2, Brm, IoTDA, WisIoT, and others.

The message content structure for each mode is as follows:

### Default Mode {#mode-default}

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

### MKT Mode {#mode-mkt}

```json
{
    "unixtimestamp": <time>,
    "<entityID>_<fieldID>_<field>": <value>
}
```

### TB Mode {#mode-tb}

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

### TB2 Mode {#mode-tb2}

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

### Brm Mode {#mode-brm}

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

### IoTDA Mode {#mode-iotda}

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

### WisIoT Mode {#mode-wisiot}

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

### Key Concepts {#key-concepts}

1. `<entityID>` Machine or group identifier: if the current data belongs to machine data, `<entityID>` is the machine identifier machineID; if the current data belongs to group data, `<entityID>` is the group identifier groupID. See [1.1. Basic Description](/en/conventions/identifiers/) for machineID and groupID.
2. `<alias>` Machine or group name: the user-defined machine name or group name (see the Bivrost Gateway Manual [5.3.1. Adding a Machine](https://docs.bivrost.cn/gateway/usage/machines#add-machine) and [5.4.1. Adding a Group](https://docs.bivrost.cn/gateway/usage/groups#add-group)).
3. `<type>` Class, `<field>` field, and `<tag>` tag: a **class** contains at least one **field** and any number of **tags**. A **field** is the name of a piece of data. When a **class** cannot be distinguished by machine or group alone, we need to add a **tag** to that data type. For example, the **class** SpindleOverload (spindle overload data) contains the **field** CumulativeTime (cumulative overload time) and the **tag** SpindleNo (spindle number).
4. `<tagField>` The field form of a tag, composed of the **tag** abbreviation and the **tag value**. For example, S1 is the field form of SpindleNo=1.
5. `<fieldID>` Field identifier: if a **class** contains no **tags**, the **field identifier** is the same as the **class**. If a **class** contains **tags**, the **field identifier** is composed of the **class** and the **field forms of the tags**. The **class** and the multiple **tag field forms** are separated by underscores. The order of the **tags** in the field form is determined by the tag's sequence number described below. For example, the **field identifier** SpindleOverload_S1 represents the overload data of the first spindle, where S1 is the field form of SpindleNo=1; the **field identifier** ToolLife_G1_I2 represents the life data of the 2nd tool in tool group 1, where G1_I2 is the field form of GroupNum=1;Index=2.
6. `<time>` Timestamp: indicates the time when the task was executed, in milliseconds.
7. `<value>` Value: a numeric value or content.
8. In Default and MKT mode, each message contains data from only a single data class `<type>` of the same machine or group `<entityID>`. Modes such as TB, TB2, IoTDA, Brm, and WisIoT support combining data from different data classes `<type>` of different machines or groups `<entityID>` into a single message.

### Message Examples {#examples}

Examples 1–3 are messages in Default mode.

#### Example 1 {#example-1}

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

Line 2, `"type": "CNCStatus",`

`<type>` Data class: using "CNCStatus" as the keyword, you can find it in the `<type>` data class table in [1.2. Data Description](/en/conventions/data-classes/), which leads to [1.2.4. CNCStatus: Machine Status](/en/conventions/data-classes/#cncstatus), identifying the data in this message as machine status data.

Line 3, `"unixtimestamp": 1698908463135,`

`<unixtimestamp>` Timestamp: the value 1698908463135 is the timestamp of this message.

Lines 4 to 7,

```json
"data": {
    "cncStatus": "MANUAL",
    "alarmStatus": "NO_ALARM"
},
```

`<data>` Data content: you can look up the explanation of the corresponding content through the data class declared by `<type>`. Here, looking up [1.2.4. CNCStatus: Machine Status](/en/conventions/data-classes/#cncstatus), "cncStatus" and "alarmStatus" are `<field>` data fields under the CNCStatus data class, indicating that the CNC operating status is a setup status: general setup, and the alarm status is currently no alarm.

Line 8, `"machineID": "10"`

`<entityID>` Machine or group identifier: if the current data belongs to machine data, `<entityID>` is the machine identifier machineID; if the current data belongs to group data, `<entityID>` is the group identifier groupID. See [1.1. Basic Description](/en/conventions/identifiers/) for machineID and groupID.

The content of line 8 indicates that the data in this message comes from the machine with machine identifier 10.

#### Example 2 {#example-2}

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

Line 2, `"type": "GroupCount",`

`<type>` Data class: using "GroupCount" as the keyword, you can find it in the `<type>` data class table in [1.2. Data Description](/en/conventions/data-classes/), which leads to [1.2.11. GroupCount: Group Machining Count Data](/en/conventions/data-classes/#groupcount), identifying the data in this message as group machining count data.

Line 3, `"unixtimestamp": 1698911434710,`

`<unixtimestamp>` Timestamp: the value 1698911434710 is the timestamp of this message.

Lines 4 to 6,

```json
"data": {
    "cumulativeCount": 233
},
```

`<data>` Data content: you can look up the explanation of the corresponding content through the data class declared by `<type>`. Here, looking up [1.2.11. GroupCount: Group Machining Count Data](/en/conventions/data-classes/#groupcount), "cumulativeCount" is a `<field>` data field under the GroupCount data, representing the group's cumulative machining count.

Line 7, `"groupID": 1`

`<entityID>` Machine or group identifier: here it is the group identifier groupID.

The content of line 7 indicates that the data in this message comes from group 1.

#### Example 3 {#example-3}

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

Line 2, `"type": "ToolLife",`

`<type>` Data class: using "ToolLife" as the keyword, you can find it in the `<type>` data class table in [1.2. Data Description](/en/conventions/data-classes/), which leads to [1.2.27. ToolLife: Tool Life Data](/en/conventions/data-classes/#toollife), identifying the data in this message as tool life data.

Line 3, `"unixtimestamp": 1698908397751,`

`<unixtimestamp>` Timestamp: the value 1698908397751 is the timestamp of this message.

Lines 4 to 8,

```json
"data": {
    "timeLimit": 1800,
    "currentTime": 1620,
    "prewarningTime": 1680
},
```

`<data>` Data content: you can look up the explanation of the corresponding content through the data class declared by `<type>`. Here, looking up the `<field>` data fields in [1.2.27. ToolLife: Tool Life Data](/en/conventions/data-classes/#toollife), "timeLimit" is the life limit [seconds], "currentTime" is the current life [seconds], and "prewarningTime" is the pre-warning life [seconds].

Lines 9 and 10, `"toolNum": 9,` and `"toolOffsetNum": 2,`

You can look up the explanation of the corresponding content through the data class declared by `<type>`. Here, looking up the `<tag>` data fields in [1.2.27. ToolLife: Tool Life Data](/en/conventions/data-classes/#toollife), "toolNum" is the tool number, and "toolOffsetNum" is the tool offset number.

The content of lines 9 and 10 indicates that the tool offset data in this message belongs to tool 9, offset 2.

Line 11, `"machineID": "10"`

`<entityID>` Machine or group identifier: here it is the machine identifier machineID, representing the machine that the current data belongs to.

The content of line 11 indicates that the data in this message comes from the machine with machine identifier 10.

#### Example 4, MKT Mode {#example-4}

```json
{
  "unixtimestamp": 1698908397751,
  "10_ToolLife_T9_02_timeLimit": 1800,
  "10_ToolLife_T9_02_currentTime": 1620,
  "10_ToolLife_T9_02_prewarningTime": 1680
}
```

Line 2, `"unixtimestamp": 1698908397751,`

`<unixtimestamp>` Timestamp: the value 1698908397751 is the timestamp of this message.

Line 3, `"10_ToolLife_T9_02_timeLimit": 1800,`

Its format is `"<entityID>_<fieldID>_<field>": <value>`,

where 10 is the `<entityID>` machine or group identifier: here it is the machine identifier machineID, representing the machine that the current data belongs to.

ToolLife_T9_02 is the `<fieldID>` data field identifier, where ToolLife is the `<type>` data class; using "ToolLife" as the keyword, you can find it in the `<type>` data class table in [1.2. Data Description](/en/conventions/data-classes/), which leads to [1.2.27. ToolLife: Tool Life Data](/en/conventions/data-classes/#toollife), identifying the data in this message as tool life data. T9 and 02 are combinations of `<tag>` data tag abbreviations and tag values; looking up the `<tag>` data tags in [1.2.27. ToolLife: Tool Life Data](/en/conventions/data-classes/#toollife), T is the abbreviation for toolNum (tool number) and 0 is the abbreviation for toolOffsetNum (tool offset number), indicating that the tool offset data in this message belongs to tool 9, offset 2.

timeLimit is the `<field>` data field; looking up the `<field>` data fields in [1.2.27. ToolLife: Tool Life Data](/en/conventions/data-classes/#toollife), "timeLimit" is the life limit [seconds].

Summary of this line: tool life data for tool 9, offset 2, from the machine with machine identifier 10; the life limit is 1800 seconds.

Line 4, `"10_ToolLife_T9_02_currentTime": 1620,`

Similar to line 3; summary of this line: tool life data for tool 9, offset 2, from the machine with machine identifier 10; the current life is 1620 seconds.

Line 5, `"10_ToolLife_T9_02_prewarningTime": 1680`

Similar to line 3; summary of this line: tool life data for tool 9, offset 2, from the machine with machine identifier 10; the pre-warning life is 1680 seconds.

#### Example 5, TB Mode {#example-5}

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

Line 2, `"机台10": [ {`

Its format is `"<alias>": [ {`,

where 机台10 is the `<alias>` machine or group name, set by the user in the gateway's machine configuration page, in the Add/Edit Machine (Group) dialog; if not set, the alias defaults to being the same as the entityID machine or group identifier.

Lines 3 to 6, `"ts": 1698908397751,`

`<ts>` Timestamp: the value 1698908397751 is the timestamp of this message.

Lines 4 to 8,

```json
"values": {
    "ToolLife_T9_02_timeLimit": 1800,
    "ToolLife_T9_02_currentTime": 1620,
    "ToolLife_T9_02_prewarningTime": 1680
}
```

`<values>` Data content. Taking line 5 as an example:

`"ToolLife_T9_02_timeLimit": 1800,`

Its format is `"<fieldID>_<field>": <value>`,

ToolLife_T9_02 is the `<fieldID>` data field identifier, where ToolLife is the `<type>` data class; using "ToolLife" as the keyword, you can find it in the `<type>` data class table in [1.2. Data Description](/en/conventions/data-classes/), which leads to [1.2.27. ToolLife: Tool Life Data](/en/conventions/data-classes/#toollife), identifying the data in this message as tool life data. T9 and 02 are combinations of `<tag>` data tag abbreviations and tag values; looking up `<tag>` in [1.2.27. ToolLife: Tool Life Data](/en/conventions/data-classes/#toollife), you can find that T is the abbreviation for toolNum (tool number) and 0 is the abbreviation for toolOffsetNum (tool offset number), indicating that the tool offset data in this message belongs to tool 9, offset 2.

timeLimit is the `<field>` data field; looking up the `<field>` data fields in [1.2.27. ToolLife: Tool Life Data](/en/conventions/data-classes/#toollife), "timeLimit" is the life limit [seconds].

The content of this line: tool life data for tool 9, offset 2; the life limit is 1800 seconds.

Similarly, the content of line 6: tool life data for tool 9, offset 2; the current life is 1620 seconds. The content of line 7: tool life data for tool 9, offset 2; the pre-warning life is 1680 seconds.

#### Example 6, IoTDA Mode {#example-6}

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

Line 4, `"device_id": "10",`

Its format is `"device_id": <entityID>`,

where 10 is the `<entityID>` machine or group identifier: here it is the machine identifier machineID, representing the machine that the current data belongs to. The content of this line indicates that the data in this message comes from the machine with machine identifier 10.

Line 7, `"service_id": "ToolLife",`

Its format is `"service_id": <type>`. Using "ToolLife" as the keyword, you can find it in the `<type>` data class table in [1.2. Data Description](/en/conventions/data-classes/), which leads to [1.2.27. ToolLife: Tool Life Data](/en/conventions/data-classes/#toollife), identifying the data in this message as tool life data.

Lines 8 to 11,

```json
"properties": {
    "T9_02_timeLimit": 1800,
    "T9_02_currentTime": 1620,
    "T9_02_prewarningTime": 1680},
```

T9_02 is the `<tagField>` field form of the tags; T9 and 02 are combinations of `<tag>` data tag abbreviations and tag values. Looking up the `<tag>` data tags in [1.2.27. ToolLife: Tool Life Data](/en/conventions/data-classes/#toollife), T is the abbreviation for toolNum (tool number) and 0 is the abbreviation for toolOffsetNum (tool offset number), indicating that the tool offset data in this message belongs to tool 9, offset 2.

timeLimit is the `<field>` data field; looking up the `<field>` data fields in [1.2.27. ToolLife: Tool Life Data](/en/conventions/data-classes/#toollife), "timeLimit" is the life limit [seconds], "currentTime" is the current life [seconds], and "prewarningTime" is the pre-warning life [seconds].

Summary of this section: tool life data for tool 9, offset 2; the life limit is 1800 seconds, the current life is 1620 seconds, and the pre-warning life is 1680 seconds.

Line 12, `"event_time": 1698908397751`

Its format is `"event_time": <time>`. The value 1698908397751 is the timestamp of this message.
