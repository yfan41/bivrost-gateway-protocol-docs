---
title: "2.5.1. 直接读写：刀补、坐标、程序与 PLC"
sidebar:
  label: "2.5.1. 直接读写 · 刀补/坐标/程序/PLC"
---


本页承接 [2.5.1. 直接读写](/http/direct-read/#direct)，收录 2.5.1.12–2.5.1.20 各接口：刀补数据、坐标数据、程序段/程序信息、PLC 数据读写与机台时间数据。

## 2.5.1.12. readOffsetData 读取刀补数据 {#readoffsetdata}

```http
GET /api/cnc/readOffsetData?machineID=MACHINEID&channel=CHANNEL&toolNum=TOOLNUM&offsetNum=OFFSETNUM
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| machineID | String | (必需)目标机台标识，详见 [1.1.1. machineID 机台标识](/conventions/identifiers/#machineid) |
| channel | Int32 | 机台通道号，如不补充则默认为 0，即主通道 |
| toolNum、offsetNum | Int32 | 补充 toolNum 刀具号或 offsetNum 刀补号，以确定目标刀具。请求参数对应[刀补数据 `<tag>` 数据标签](/conventions/data-classes/#offset)中的标签。参考[刀补数据标签组合](/conventions/data-classes/#offset)中各系统的标签组合表，补充请求参数组合。 |

示例 1，Heidenhain 海德汉：

获取 machineID 为 1010 的机台的 T（刀具号）为 1 的刀补数据，请求如下：

```
/api/cnc/readOffsetData?machineID=1010&toolNum=1
```

返回示例

```json
{
  "toolNum": 1,
  "toolName": "MILL_D2_ROUGH",
  "toolType": "9",
  "lengthWear": 0.6,
  "radiusWear": 0.5,
  "lengthGeom": 30.0,
  "radiusGeom": 1.0,
  "radius2Wear": 0.2,
  "radius2Geom": 2.0
}
```

示例 2，Siemens 西门子：

获取 machineID 为 1010 的机台的位置（刀具号）为 2，D（刀补号）为 1 的刀补数据，请求如下：

```
/api/cnc/readOffsetData?machineID=1010&toolNum=2&offsetNum=1
```

返回示例

```json
{
  "toolNum": 2,
  "offsetNum": 1,
  "toolName": "ROUGHING_T80 A",
  "toolType": 500,
  "toolNose": 3,
  "wearX": 0.88,
  "wearZ": 0.78,
  "wearR": 0.05,
  "geomX": 55.0,
  "geomZ": 39.0,
  "geomR": 0.8
}
```

示例 3，其它系统：

获取 machineID 为 1010 的机台的第 2 通道的刀补号为 1 的刀补数据，请求如下：

```
/api/cnc/readOffsetData?machineID=1010&offsetNum=1&channel=2
```

返回示例

```json
{
  "offsetNum": 1,
  "lengthUnit": "MM",
  "toolNose": 3,
  "lengthWear": 0.0001,
  "radiusWear": 0.03,
  "lengthGeom": 5.0,
  "radiusGeom": 0.2,
  "channel": 2
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| channel | Int32 | 机台通道号，仅当请求中补充 channel 且不为 0 时出现 |
| toolNum | Int32 | 刀具号 |
| offsetNum | Int32 | 刀补号 |
| toolName | String | 刀具名称 |
| toolType | String | 刀具类型 |
| lengthUnit | String | 刀补长度单位 |
| toolNose | Int32 | （假想）刀尖位置/刀沿类型 |
| lengthWear | Double | 长度磨损 |
| radiuWear | Double | 半径磨损 |
| lengthGeom | Double | 长度形状 |
| radiusGeom | Double | 半径形状 |
| wearX | Double | 长度 X 磨损 |
| wearY | Double | 长度 Y 磨损 |
| wearZ | Double | 长度 Z 磨损 |
| wearR | Double | 半径磨损 |
| geomX | Double | 长度 X |
| geomY | Double | 长度 Y |
| geomZ | Double | 长度 Z |
| geomR | Double | 半径 |

:::note[注]
表中为通用的刀补参数，但不是全部刀补参数。有些机床有一些不常用的刀补设置参数，不在这里一一说明。**建议在第一次添加新类型机床时测试可读取的刀补参数。**如在实际使用中需要获取机床中有但当前接口中未添加的刀补设置参数，请咨询客服。
:::

## 2.5.1.13. batchReadOffsetData 批量读取刀具补偿 {#batchreadoffsetdata}

此接口为 [2.5.1.12. readOffsetData 读取刀补数据](#readoffsetdata)的批量化版本，通过在请求体中补充目标刀具列表，可以一次读取多组数据。

```http
POST /api/cnc/batchReadOffsetData?machineID=MACHINEID
```

请求体示例 application/json

```json
[
  {
    "toolNum": 1,
    "offsetNum": 1,
    "channel": 2
  },
  {
    "toolNum": 1,
    "offsetNum": 2,
    "channel": 2
  }
]
```

请求参数与 [2.5.1.12. readOffsetData 读取刀补数据](#readoffsetdata)一致。

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| machineID | String | (必需)目标机台标识，详见 [1.1.1. machineID 机台标识](/conventions/identifiers/#machineid) |
| channel | Int32 | 机台通道号，如不补充则默认为 0，即主通道 |
| toolNum、offsetNum | Int32 | 补充 toolNum 刀具号或 offsetNum 刀补号，以确定目标刀具。请求参数对应[刀补数据 `<tag>` 数据标签](/conventions/data-classes/#offset)中的标签。参考[刀补数据标签组合](/conventions/data-classes/#offset)中各系统的标签组合表，补充请求参数组合。 |

返回示例

```json
[
  {
    "toolNum": 1,
    "offsetNum": 1,
    "lengthUnit": "MM",
    "toolNose": 3,
    "lengthWear": 0.0001,
    "radiusWear": 0.03,
    "lengthGeom": 5.0,
    "radiusGeom": 0.2,
    "channel": 2
  },
  {
    "toolNum": 1,
    "offsetNum": 2,
    "lengthUnit": "MM",
    "toolNose": 4,
    "lengthWear": 0.01,
    "radiusWear": 0.02,
    "lengthGeom": 6.0,
    "radiusGeom": 0.3,
    "channel": 2
  }
]
```

返回参数与 [2.5.1.12. readOffsetData 读取刀补数据](#readoffsetdata)一致。如果某条请求失败，则返回数组中对应位置为该请求的错误信息。

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| channel | Int32 | 机台通道号，仅当请求中补充 channel 且不为 0 时出现 |
| toolNum | Int32 | 刀具号 |
| offsetNum | Int32 | 刀补号 |
| toolName | String | 刀具名称 |
| toolType | String | 刀具类型 |
| lengthUnit | String | 刀补长度单位 |
| toolNose | Int32 | （假想）刀尖位置/刀沿类型 |
| lengthWear | Double | 长度磨损 |
| radiuWear | Double | 半径磨损 |
| lengthGeom | Double | 长度形状 |
| radiusGeom | Double | 半径形状 |
| wearX | Double | 长度 X 磨损 |
| wearY | Double | 长度 Y 磨损 |
| wearZ | Double | 长度 Z 磨损 |
| wearR | Double | 半径磨损 |
| geomX | Double | 长度 X |
| geomY | Double | 长度 Y |
| geomZ | Double | 长度 Z |
| geomR | Double | 半径 |

:::note[注]
表中为通用的刀补参数，但不是全部刀补参数。有些机床有一些不常用的刀补设置参数，不在这里一一说明。**建议在第一次添加新类型机床时测试可读取的刀补参数。**如在实际使用中需要获取机床中有但当前接口中未添加的刀补设置参数，请咨询客服。
:::

## 2.5.1.14. writeOffsetData 写入刀补数据 {#writeoffsetdata}

```http
POST /api/cnc/writeOffsetData?machineID=MACHINEID&channel=CHANNEL&toolNum=TOOLNUM&offsetNum=OFFSETNUM
```

请求体示例 application/json

```json
{
  "toolNose": 3,
  "lengthWear": 0.0001,
  "radiusWear": 0.03,
  "lengthGeom": 5.0,
  "radiusGeom": 0.2
}
```

:::note[注]
请求体中仅补充需要写入的参数。不改动的参数不用补充。
:::

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| machineID | String | (必需)目标机台标识，详见 [1.1.1. machineID 机台标识](/conventions/identifiers/#machineid) |
| channel | Int32 | 机台通道号，如不补充则默认为 0，即主通道 |
| toolNum、offsetNum | Int32 | 补充 toolNum 刀具号或 offsetNum 刀补号，以确定目标刀具。请求参数对应[刀补数据 `<tag>` 数据标签](/conventions/data-classes/#offset)中的标签。参考[刀补数据标签组合](/conventions/data-classes/#offset)中各系统的标签组合表，补充请求参数组合。 |
| toolName | String | 刀具名称；Siemens 西门子系统中为只读参数，不可写入 |
| toolType | String | 刀具类型；Okuma 大隈系统中为只读参数，不可写入 |
| lengthUnit | String | 刀补长度单位 |
| toolNose | Int32 | （假想）刀尖位置/刀沿类型 |
| lengthWear | Double | 长度磨损 |
| radiuWear | Double | 半径磨损 |
| lengthGeom | Double | 长度形状 |
| radiusGeom | Double | 半径形状 |
| wearX | Double | 长度 X 磨损 |
| wearY | Double | 长度 Y 磨损 |
| wearZ | Double | 长度 Z 磨损 |
| wearR | Double | 半径磨损 |
| geomX | Double | 长度 X |
| geomY | Double | 长度 Y |
| geomZ | Double | 长度 Z |
| geomR | Double | 半径 |

:::note[注]
表中为通用的刀补参数，但不是全部刀补参数。有些机床有一些不常用的刀补设置参数，不在这里一一说明。一般能通过 [2.5.1.12. readOffsetData 读取刀补数据](#readoffsetdata)读到的刀补参数都可以写入，但部分机床的部分刀补参数是只读参数，不可写入，如西门子系统中的 toolName 刀具名称。**建议在第一次添加新机台系统型号时先测试读取刀补数据以获得机台支持的刀补参数，再测试写入刀补参数检查是否存在只读参数。**如在实际使用中需要写入机床中有但当前接口尚不支持的刀补参数，请咨询客服。
:::

返回示例

```json
{
  "errorCode": 0,
  "errorMsg": "Success"
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| errorCode | Int32 | (必需)错误码，0 代表成功。 |
| errorMsg | String | (必需)错误内容 |

## 2.5.1.15. readPosition 读取坐标数据 {#readposition}

```http
GET /api/cnc/readPosition?machineID=MACHINEID&channel=CHANNEL
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| machineID | String | (必需)目标机台标识，详见 [1.1.1. machineID 机台标识](/conventions/identifiers/#machineid) |
| channel | Int32 | 机台通道号，如不补充则默认为 0，即主通道 |

返回示例

```json
{
  "axisName": [
        "X",
        "Y",
        "Z"],
  "unit": [
        "mm",
        "mm",
        "mm"],
  "mach": [
        150.12,
        0,
        -31.35],
  "abs": [
        150.12,
        0,
        -31.35],
  "rel": [
        150.12,
        0,
        -31.35],
  "dist": [
        9.88,
        0,
        31.35],
  "channel": 2
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| axisName | String[] | (必需)轴名称 |
| unit | String[] | 单位 |
| mach | Float[] | 机械坐标 |
| abs | Float[] | 绝对坐标 |
| rel | Float[] | 相对坐标 |
| dist | Float[] | 剩余距离 |
| channel | Int32 | 机台通道号，仅当请求中补充 channel 且不为 0 时出现 |

各坐标数据与 axisName 中的坐标名按顺序对应。

## 2.5.1.16. readProgramBlock 读取程序段 {#readprogramblock}

此接口读取机台正在运行的程序段。

```http
GET /api/cnc/readProgramBlock?machineID=MACHINEID&channel=CHANNEL
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| machineID | String | (必需)目标机台标识，详见 [1.1.1. machineID 机台标识](/conventions/identifiers/#machineid) |
| channel | Int32 | 机台通道号，如不补充则默认为 0，即主通道 |

返回示例

```json
{
  "currentBlock": "Y70.800",
  "channel": 2
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| currentBlock | String | (必需)当前运行的程序段内容 |
| channel | Int32 | 机台通道号，仅当请求中补充 channel 且不为 0 时出现 |

## 2.5.1.17. readProgramInfo 读取加工程序信息 {#readprograminfo}

```http
GET /api/cnc/readProgramInfo?machineID=MACHINEID&channel=CHANNEL
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| machineID | String | (必需)目标机台标识，详见 [1.1.1. machineID 机台标识](/conventions/identifiers/#machineid) |
| channel | Int32 | 机台通道号，如不补充则默认为 0，即主通道 |

返回示例

```json
{
  "mainPrgmName": "1234",
  "runningPrgName": "abcd",
  "programSeqNum": "N30",
  "programStack": "A/B/1234/abcd",
  "channel": 2
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| mainPrgmName | String | (必需)主程序名 |
| runningPrgName | String | (必需)当前执行子程序名 |
| programSeqNum | String | 当前执行子程序段顺序号 |
| programStack | String | 程序堆栈，当前仅支持西门子和模拟机台 |
| channel | Int32 | 机台通道号，仅当请求中补充 channel 且不为 0 时出现 |

对于 Fanuc 发那科，标准程序名（字母 O+数字）中数字开头的零会自动去除，如在机床中显示程序名为 O0010，则返回程序名为 O10。

## 2.5.1.18. readPlcData 读取 PLC 数据 {#readplcdata}

使用此接口前，需要已知目标数据的 PLC 区域地址以及目标数据的类型。用户可以查找设备手册或联系设备厂家以获取相应信息。

```http
GET /api/cnc/readPlcData?machineID=MACHINEID&area=AREA&start=START&count=COUNT&type=TYPE
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| machineID | String | (必需)目标机台标识，详见 [1.1.1. machineID 机台标识](/conventions/identifiers/#machineid) |
| area | String | (必需)区域。格式为 `{areaName}\|{parameter1}\|{paramter2}…`，其中 areaName 为区域名，parameter 是补充参数。areaName 区域名为 PLC 的区域，比如 R，X，Y 等，可以从机床手册或厂家获取，区域格式请参照 [PLC 数据通用区域与参数](#plc-regions)；如使用标准协议-MODBUS 通信，areaName 为 0x,1x,3x,4x 等分区名；网关支持一些特殊区域名，包括 $MACRO$ 宏变量，$PARAM$ 系统参数，$TAG$ 标签等，请参照 [PLC 数据特殊区域与参数](#plc-special-regions)。parameter 补充参数用于补充一些数据，比如 axis=AXIS 用于指定轴号，level=LEVEL 用于指定执行级别，type=TYPE 用于指定类型，name=NAME 用于指定标签名。 |
| start | String | 起始地址。如非 10 进制，请参照 [PLC 地址位进制前缀](#plc-prefixes)添加前缀。 |
| count | Int32 | (必需)数据数量。对于非 String 类型，是目标数据的数量；对于 String 类型，是目标 String 的长度（以 Byte 计）。 |
| type | String | (必需)数据类型。目前支持的数据类型详见 [PLC 数据类型](#plc-types)。 |
| channel | Int32 | 机台通道号，如不补充则默认为 0，即主通道 |

### PLC 数据通用区域与参数 {#plc-regions}

| 设备系统 | 区域 | area 示例 | 备注 |
| --- | --- | --- | --- |
| 全部设备系统 | 普通区域 | `X` | PLC 设备的 X 区域 |
| 全部设备系统 | 普通区域 | `X\|s=S` | 如与当前连接的 PLC 所连接的其它 PLC 通信，可补充 station 或 slot 或 salveID（MODBUS）；不补充 s 则默认为与当前连接的 PLC 通信。此参数目前仅部分 PLC 设备支持。 |

### PLC 数据特殊区域与参数 {#plc-special-regions}

| 系统型号 | 区域 | area 示例 | 备注 |
| --- | --- | --- | --- |
| Bosunman 博尚 | MODBUS 地址 | `0x` 或 `1x` 或 `4x` | |
| Brother 兄弟 | 宏变量 | `$MACRO$` | |
| Delta 台达 | 宏变量 | `$MACRO$` | |
| Fagor 法格 [8035,8040,8055] | 宏变量（精确到小数点后 5 位） | `$MACRO$\|type=local\|level=LEVEL` | 局部算数参数，如嵌套级 level 不为 1，需要补充执行级别，如 level=7 |
| Fagor 法格 [8035,8040,8055] | 宏变量（精确到小数点后 5 位） | `$MACRO$\|type=global` | 全局算数参数 |
| Fagor 法格 [8035,8040,8055] | 标签（变量名） | `$TAG$\|name=NAME` | 补充 name 标签（变量名） |
| Fagor 法格 [8060，8065，8070] | 宏变量（精确到小数点后 4 位） | `$MACRO$\|type=local\|level=LEVEL` | 局部算数参数，如嵌套级 level 不为 1，需要补充执行级别，如 level=7 |
| Fagor 法格 [8060，8065，8070] | 宏变量（精确到小数点后 4 位） | `$MACRO$\|type=global` | 全局算数参数 |
| Fagor 法格 [8060，8065，8070] | 宏变量（精确到小数点后 4 位） | `$MACRO$\|type=common` | 通用算数参数 |
| Fagor 法格 [8060，8065，8070] | 标签（变量名） | `$TAG$\|name=NAME` | 补充 name 标签（变量名） |
| Fanuc 发那科 | 诊断数据 | `$DIAG$` | |
| Fanuc 发那科 | 宏变量 | `$MACRO$` | |
| Fanuc 发那科 | 系统参数 | `$PARAM$` | 支持 Byte，Int16，Int32，与 Double 等类型。 |
| Fanuc 发那科 | 系统参数 | `$PARAM$\|axis=AXIS` | 部分参数需要补充轴号，如 axis=1 |
| Gsk 广州数控 [980, 988] | 宏变量 | `$MACRO$` | |
| Gsk 广州数控 [以太网, 串口转网口, 986 V4.15] | 宏变量 | `$MACRO$` | |
| Gsk 广州数控 [以太网, 串口转网口, 986 V4.15] | MODBUS 地址 | `0x` 或 `1x` 或 `4x` | |
| Haas 哈斯 [通用型] | 宏变量 | `$MACRO$` | |
| Hnc 华中数控 | 宏变量 | `$MACRO$` | |
| Jingdiao 北京精雕 | 宏变量 | `$MACRO$` | |
| Kede 科德 | 宏变量 | `$MACRO$` | #变量 |
| Kede 科德 | 标签（变量名） | `$TAG$\|name=NAME` | PLC 变量，如 `$TAG$\|name=PLC_PRG.C_Workpiece` |
| Kede 科德 | 标签（变量名） | `$TAG$\|name=NAME\|type=cncVar` | cncVar 类型变量，即 PLC 与数控系统进行交互的变量，如 `$TAG$\|name=PEW4190.1\|type=cncVar` |
| Lynuc 铼纳克 | 宏变量 | `$MACRO$` | |
| Lynuc 铼纳克 | 标签（变量名） | `$TAG$\|name=NAME` | 补充 name 标签（变量名），如 `$TAG$\|name=MOU31.25.28` |
| Mazak 马扎克 [Smart，Smooth] | 宏变量 | `$MACRO$\|type=R` | R 变量 |
| Mitsubishi 三菱 | 宏变量（本地变量或公共变量） | `$MACRO$` | 默认执行级别 0 |
| Mitsubishi 三菱 | 宏变量（本地变量或公共变量） | `$MACRO$\|level=LEVEL` | 如执行级别不为 0，需要补充执行级别，如 level=1 |
| Mock 模拟机台 | 宏变量 | `$MACRO$` | |
| Mock 模拟机台 | 系统参数 | `$PARAM$` | |
| Mock 模拟机台 | 标签（变量名） | `$TAG$\|name=NAME` | 补充 name 标签（变量名） |
| Siemens 西门子 | 宏变量 | `$MACRO$\|type=R` | R 参数 |
| Siemens 西门子 | 宏变量 | `$MACRO$\|type=RG` | RG 参数 |
| Siemens 西门子 [通用型] | 标签（变量名） | `$TAG$\|area=AREA\|block=BLOCK\|name=NAME\|areaNo=AREANO\|row=ROW\|column=COLUMN` | S7 变量，补充参数 Area，Block(Component)，VariableName，AreaNo.（默认为 1），Row（默认为 1），Column（默认为 1），如：`$TAG$\|area=C\|block=AUXFU\|name=status\|areaNo=2\|row=3` |
| Siemens 西门子 [OPC UA] | 标签（变量名） | `$TAG$\|name=NAME\|ns=NS` | OPC UA 服务器变量地址，补充参数 name（变量名），ns（name space index，默认为 2），如：`$TAG$\|area=/Channel/State/actParts\|ns=2` |
| Syntec 新代 | 宏变量 | `$MACRO$` | |
| Allen-Bradley 罗克韦尔 | 标签（变量名） | `$TAG$\|name=NAME` | 补充 name 标签（变量名） |

:::note[注]
注 1：$MACRO$ 宏变量一般只支持 Double 数据类型。

注 2：使用 $TAG$ 方式不需要补充 Start 起始地址。
:::

### PLC 地址位进制前缀 {#plc-prefixes}

| 进制 | 前缀(数字 0+字母) | 示例 |
| --- | --- | --- |
| 2 进制 | 0b | 0b1001 |
| 8 进制 | 0 | 03671 |
| 10 进制 | 无 | 123 |
| 16 进制 | 0x | 0x5A7 |

### PLC 数据类型 {#plc-types}

| 数据类型 | Bit | Byte | SByte | Int16 | UInt16 | Float | Int32 | UInt32 | Double | String |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 数据长度 | 1 位 | 8 位 | 8 位 | 16 位 | 16 位 | 32 位 | 32 位 | 32 位 | 64 位 | 不固定 |
| 博尚 | O | O | O | O | O | O | O | O | O | O |
| 兄弟 | O | | | O | | | | | | |
| 台达 | O | O | O | O | O | O | O | O | O | O |
| 法格 [8060,8065,8070] | | | | | | | O | | O | O |
| 发那科 | | O | O | O | O | | O | O | \* | |
| 广数 [988,980] | | O | | | | | | | \* | |
| 广数 [以太网, 串口转网口, 986 V4.15] | O | O | O | O | O | O | O | O | O | O |
| 哈斯 [通用型] | | | | O | O | O | O | O | O | O |
| 海德汉 | O | | O | O | | | O | | | O |
| 华中数控 | | O | | O | | | O | O | O | |
| 北京精雕 | | O | | O | O | | O | O | O | |
| 凯恩帝 | | O | O | O | O | | O | O | | |
| 宝元 | O | | | | | O | O | | | |
| 三菱 | O | O | | O | O | O | O | O | \* | |
| 模拟机台 | O | O | O | O | O | O | O | O | O | O |
| 西门子 | O | O | | O | O | O | O | O | O | O |
| 新代 | | O | | O | | | O | | \* | |
| 外接模块 | | | | | O | O | | | | |

O：支持。

\*：仅支持宏变量（本地变量，公共变量等）使用该数据类型。

### 请求示例 {#readplcdata-examples}

示例 1-2 为普通区域示例。

示例 1，读取 Int32 数组：

获取 machineID 为 1010 的机台从 PLC 地址位 R0 开始（包括 R0）的 8 个类型为 Int32 的数据，请求如下：

```
/api/cnc/readPLCData?machineID=1010&area=R&start=0&count=8&type=Int32
```

返回格式如下：

```json
{
  "data": [
     2147483647,
     -616240881,
     1351548766,
     1408080714,
     -1677592641,
     681965706,
     1002992212,
     -1588442413]
}
```

示例 2，读取 String：

获取 machineID 为 1010 的机台从 PLC 地址位 S0 开始（包括 S0）的最大长度为 16 个 Byte 的类型为 String 的数据，请求如下：

```
/api/cnc/readPLCData?machineID=1010&area=S&start=0&count=16&type=String
```

返回格式如下：

```json
{
  "msg": "Test string"
}
```

示例 3-6 为特殊区域示例。

示例 3，读取 $MACRO$：

获取 machineID 为 1010 的机台的第 1 到 3 号宏变量（本地变量，公共变量等），请求如下：

```
/api/cnc/readPLCData?machineID=1010&area=$MACRO$&start=1&count=3&type=Double
```

返回格式如下：

```json
{
  "data": [
    -1.7976931348623157E+308,
    0.0,
    1.2345]
}
```

其中 -1.7976931348623157E+308 为 Double 类型最小值，代表该变量未设置。

示例 4，读取 $PARAM$：

获取 machineID 为 1010 的机台的类型为 Byte 的第 100 到 102 号系统参数，请求如下：

```
/api/cnc/readPLCData?machineID=1010&area=$PARAM$&start=100&count=3&type=Byte
```

返回格式如下：

```json
{
  "data": [
    4,
    1,
    0]
}
```

示例 5，以标签形式读取单个数据：

获取 machineID 为 1010 的机台，标签名为 A.B 的 1 个类型为 UInt32 的数据，请求如下：

```
/api/cnc/readPLCData?machineID=1010&area=$TAG$|name=A.B&count=1&type=UInt32
```

示例 6，以标签形式读取读取一个数组中的多个数据：

获取 machineID 为 1010 的机台，标签名为 AB.C 的 Float 数组的第 0 位到第 7 位，请求如下：

```
/api/cnc/readPLCData?MachineID=1010&area=$TAG$|name=AB.C[0]&count=8&type=Float
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| data | Array[Object] | 请求参数中的 type 类型为除 String 类型以外的类型时，返回体中输出 data，类型为请求参数中指定的 type 类型数组，长度为请求参数中输入的数据数量 count。 |
| msg | String | 请求参数中的 type 类型为 String 类型时，返回体中输出 msg。msg 末尾的空位会自动截去。如实际读取到的 String 长度大于请求参数中定义的长度，会返回报错 errorCode 179。 |
| channel | Int32 | 机台通道号，仅当请求中补充 channel 且不为 0 时出现 |

:::note[注]
注 1：部分设备做了单次读取 PLC 数据最大数量的限制，以避免影响机床运行。

注 2：Syntec 新代系统会自动根据输入的地址位选择输出类型。因此在输入类型错误的情况下，仍可输出数据，但其输出类型与输入时指定的类型不一致。

注 3：部分系统，如兄弟，用 Int16 类型可以兼容 Bit，Byte 等类型结果。
:::

## 2.5.1.19. writePlcData 写入 PLC 数据 {#writeplcdata}

写入 PLC 数据有一定危险性，请务必理解其风险，仅在安全情况下写入。默认设置下，网关屏蔽了该接口，使用前需要在网关管理页面**设置**页面打开对应选项。

使用此接口前，需要已知目标数据的 PLC 区域地址以及目标数据的类型。用户可以查找设备手册或联系设备厂家以获取相应信息。

```http
POST /api/cnc/writePlcData?machineID=MACHINEID&area=AREA&start=START&type=TYPE
```

请求体示例 application/json

当写入数据为非 String 类型时：

```json
{
  "data": [
    2147483647,
    -616240881,
    1351548766,
    1408080714,
    -1677592641,
    681965706,
    1002992212,
    -1588442413]
}
```

当写入数据为 String 类型时：

```json
{
  "msg": "Test string"
}
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| machineID | String | (必需)目标机台标识，详见 [1.1.1. machineID 机台标识](/conventions/identifiers/#machineid) |
| area | String | (必需)区域。格式为 `{areaName}\|{parameter1}\|{paramter2}…`，其中 areaName 为区域名，parameter 是补充参数。areaName 区域名为 PLC 的区域，比如 R，X，Y 等，可以从机床手册或厂家获取，区域格式请参照 [PLC 数据通用区域与参数](#plc-regions)；如使用标准协议-MODBUS 通信，areaName 为 0x,1x,3x,4x 等分区名；网关支持一些特殊区域名，包括 $MACRO$ 宏变量，$PARAM$ 系统参数，$TAG$ 标签等，请参照 [PLC 数据特殊区域与参数](#plc-special-regions)。parameter 补充参数用于补充一些数据，比如 axis=AXIS 用于指定轴号，level=LEVEL 用于指定执行级别，type=TYPE 用于指定类型，name=NAME 用于指定标签名。 |
| start | String | 起始地址。如非 10 进制，请参照 [PLC 地址位进制前缀](#plc-prefixes)添加前缀。 |
| type | String | (必需)数据类型。目前支持的数据类型详见 [PLC 数据类型](#plc-types)。 |
| data | Array[Object] | 请求参数中的 type 类型为除 String 类型以外的类型时，请求体中输入 data，类型为请求参数中指定的 type 类型数组。 |
| msg | String | 请求参数中的 type 类型为 String 类型时，请求体中输入 msg。 |
| channel | Int32 | 机台通道号，如不补充则默认为 0，即主通道 |

返回示例

```json
{
  "errorCode": 0,
  "errorMsg": "Success"
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| errorCode | Int32 | (必需)错误码，0 代表成功。 |
| errorMsg | String | (必需)错误内容 |

## 2.5.1.20. readTimeData 读取机台时间数据 {#readtimedata}

```http
GET /api/cnc/readTimeData?machineID=MACHINEID
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| machineID | String | (必需)目标机台标识，详见 [1.1.1. machineID 机台标识](/conventions/identifiers/#machineid) |

返回示例

```json
{
  "cumulativePowerOnTimeMin": 34194,
  "cumulativePowerOnTimeMs": 0,
  "powerOnTimeMin": 2944,
  "powerOnTimeMs": 0,
  "cumulativeOperatingTimeMin": 6683,
  "cumulativeOperatingTimeMs": 13328,
  "operatingTimeMin": 0,
  "operatingTimeMs": 0,
  "cumulativeCuttingTimeMin": 0,
  "cumulativeCuttingTimeMs": 0,
  "cuttingTimeMin": 0,
  "cuttingTimeMs": 0,
  "lastCycleTimeMin": 4,
  "lastCycleTimeMs": 43000,
  "currentCycleTimeMin": 0,
  "currentCycleTimeMs": 0,
  "currentCuttingTimeMin": 0,
  "currentCuttingTimeMs": 0,
  "remaingingCycleTimeMin": 0,
  "remaingingCycleTimeMs": 0
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| cumulativePowerOnTimeMin | Int32 | 累计通电时间 1[分钟] |
| cumulativePowerOnTimeMs | Int32 | 累计通电时间 2[毫秒] |
| powerOnTimeMin | Int32 | 当前通电时间 1[分钟] |
| powerOnTimeMs | Int32 | 当前通电时间 2[毫秒] |
| cumulativeOperatingTimeMin | Int32 | 累计运行时间 1[分钟] |
| cumulativeOperatingTimeMs | Int32 | 累计运行时间 2[毫秒] |
| operatingTimeMin | Int32 | 当前运行时间 1[分钟] |
| operatingTimeMs | Int32 | 当前运行时间 2[毫秒] |
| cumulativeCuttingTimeMin | Int32 | 累计加工（切削）时间 1[分钟] |
| cumulativeCuttingTimeMs | Int32 | 累计加工（切削）时间 2[毫秒] |
| cuttingTimeMin | Int32 | 当前加工（切削）时间 1[分钟] |
| cuttingTimeMs | Int32 | 当前加工（切削）时间 2[毫秒] |
| lastCycleTimeMin | Int32 | 上次循环时间 1[分钟] |
| lastCycleTimeMs | Int32 | 上次循环时间 2[毫秒] |
| currentCycleTimeMin | Int32 | 当前循环时间 1[分钟] |
| currentCycleTimeMs | Int32 | 当前循环时间 2[毫秒] |
| currentCuttingTimeMin | Int32 | 当前切削时间 1[分钟] |
| currentCuttingTimeMs | Int32 | 当前切削时间 2[毫秒] |
| remainingCycleTimeMin | Int32 | 剩余循环时间 1[分钟] |
| remainingCycleTimeMs | Int32 | 剩余循环时间 2[毫秒] |

**接口仅返回机台系统支持的时间数据**，各时间数据由对应的时间 1 和时间 2 换算相加得到，计算方法详见 [1.2.24. TimeData：机台时间数据](/conventions/data-classes/#timedata)。
