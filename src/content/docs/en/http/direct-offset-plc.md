---
title: "2.5.1. Direct Read/Write: Tool Offsets, Coordinates, Program & PLC"
sidebar:
  label: "2.5.1. Direct Read/Write · Offsets/Coordinates/Program/PLC"
---


This page continues from [2.5.1. Direct Read/Write](/en/http/direct-read/#direct) and covers endpoints 2.5.1.12–2.5.1.20: tool offset data, coordinate data, program block/program information, PLC data read/write, and machine time data.

## 2.5.1.12. readOffsetData - Read Tool Offset Data {#readoffsetdata}

```http
GET /api/cnc/readOffsetData?machineID=MACHINEID&channel=CHANNEL&toolNum=TOOLNUM&offsetNum=OFFSETNUM
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| machineID | String | (Required) Target machine identifier, see [1.1.1. machineID Machine Identifier](/en/conventions/identifiers/#machineid) |
| channel | Int32 | Machine channel number. Defaults to 0 (the main channel) if not supplied. |
| toolNum, offsetNum | Int32 | Supply toolNum (tool number) or offsetNum (offset number) to identify the target tool. These request parameters correspond to the tags in [Tool offset data `<tag>` data tags](/en/conventions/data-classes/#offset). Refer to the per-system tag combination table in [Tool offset data tag combinations](/en/conventions/data-classes/#offset) to supply the correct combination of request parameters. |

Example 1, Heidenhain:

Request to get the tool offset data for T (tool number) 1 on the machine with machineID 1010:

```
/api/cnc/readOffsetData?machineID=1010&toolNum=1
```

Response example

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

Example 2, Siemens:

Request to get the tool offset data for position (tool number) 2, D (offset number) 1, on the machine with machineID 1010:

```
/api/cnc/readOffsetData?machineID=1010&toolNum=2&offsetNum=1
```

Response example

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

Example 3, other systems:

Request to get the tool offset data for offset number 1 on channel 2 of the machine with machineID 1010:

```
/api/cnc/readOffsetData?machineID=1010&offsetNum=1&channel=2
```

Response example

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

| Response Parameter | Type | Description |
| --- | --- | --- |
| channel | Int32 | Machine channel number; appears only when channel is supplied in the request and is not 0 |
| toolNum | Int32 | Tool number |
| offsetNum | Int32 | Offset number |
| toolName | String | Tool name |
| toolType | String | Tool type |
| lengthUnit | String | Tool offset length unit |
| toolNose | Int32 | (Imaginary) tool nose position / cutting edge type |
| lengthWear | Double | Length wear |
| radiuWear | Double | Radius wear |
| lengthGeom | Double | Length geometry |
| radiusGeom | Double | Radius geometry |
| wearX | Double | Length X wear |
| wearY | Double | Length Y wear |
| wearZ | Double | Length Z wear |
| wearR | Double | Radius wear |
| geomX | Double | Length X |
| geomY | Double | Length Y |
| geomZ | Double | Length Z |
| geomR | Double | Radius |

:::note[Note]
The table lists the common tool offset parameters, but not all of them. Some machines have less common offset settings that are not individually documented here. **We recommend testing which offset parameters can be read the first time a new machine type is added.** If, in actual use, you need to obtain an offset setting parameter that the machine has but this endpoint does not yet support, please contact support.
:::

## 2.5.1.13. batchReadOffsetData - Batch Read Tool Offsets {#batchreadoffsetdata}

This endpoint is the batch version of [2.5.1.12. readOffsetData - Read Tool Offset Data](#readoffsetdata). By supplying a list of target tools in the request body, you can read multiple sets of data in a single call.

```http
POST /api/cnc/batchReadOffsetData?machineID=MACHINEID
```

Request body example, application/json

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

The request parameters are the same as [2.5.1.12. readOffsetData - Read Tool Offset Data](#readoffsetdata).

| Request Parameter | Type | Description |
| --- | --- | --- |
| machineID | String | (Required) Target machine identifier, see [1.1.1. machineID Machine Identifier](/en/conventions/identifiers/#machineid) |
| channel | Int32 | Machine channel number. Defaults to 0 (the main channel) if not supplied. |
| toolNum, offsetNum | Int32 | Supply toolNum (tool number) or offsetNum (offset number) to identify the target tool. These request parameters correspond to the tags in [Tool offset data `<tag>` data tags](/en/conventions/data-classes/#offset). Refer to the per-system tag combination table in [Tool offset data tag combinations](/en/conventions/data-classes/#offset) to supply the correct combination of request parameters. |

Response example

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

The response parameters are the same as [2.5.1.12. readOffsetData - Read Tool Offset Data](#readoffsetdata). If an individual request fails, the corresponding position in the returned array contains the error information for that request.

| Response Parameter | Type | Description |
| --- | --- | --- |
| channel | Int32 | Machine channel number; appears only when channel is supplied in the request and is not 0 |
| toolNum | Int32 | Tool number |
| offsetNum | Int32 | Offset number |
| toolName | String | Tool name |
| toolType | String | Tool type |
| lengthUnit | String | Tool offset length unit |
| toolNose | Int32 | (Imaginary) tool nose position / cutting edge type |
| lengthWear | Double | Length wear |
| radiuWear | Double | Radius wear |
| lengthGeom | Double | Length geometry |
| radiusGeom | Double | Radius geometry |
| wearX | Double | Length X wear |
| wearY | Double | Length Y wear |
| wearZ | Double | Length Z wear |
| wearR | Double | Radius wear |
| geomX | Double | Length X |
| geomY | Double | Length Y |
| geomZ | Double | Length Z |
| geomR | Double | Radius |

:::note[Note]
The table lists the common tool offset parameters, but not all of them. Some machines have less common offset settings that are not individually documented here. **We recommend testing which offset parameters can be read the first time a new machine type is added.** If, in actual use, you need to obtain an offset setting parameter that the machine has but this endpoint does not yet support, please contact support.
:::

## 2.5.1.14. writeOffsetData - Write Tool Offset Data {#writeoffsetdata}

```http
POST /api/cnc/writeOffsetData?machineID=MACHINEID&channel=CHANNEL&toolNum=TOOLNUM&offsetNum=OFFSETNUM
```

Request body example, application/json

```json
{
  "toolNose": 3,
  "lengthWear": 0.0001,
  "radiusWear": 0.03,
  "lengthGeom": 5.0,
  "radiusGeom": 0.2
}
```

:::note[Note]
Include only the parameters you want to write in the request body. Parameters that should remain unchanged do not need to be included.
:::

| Request Parameter | Type | Description |
| --- | --- | --- |
| machineID | String | (Required) Target machine identifier, see [1.1.1. machineID Machine Identifier](/en/conventions/identifiers/#machineid) |
| channel | Int32 | Machine channel number. Defaults to 0 (the main channel) if not supplied. |
| toolNum, offsetNum | Int32 | Supply toolNum (tool number) or offsetNum (offset number) to identify the target tool. These request parameters correspond to the tags in [Tool offset data `<tag>` data tags](/en/conventions/data-classes/#offset). Refer to the per-system tag combination table in [Tool offset data tag combinations](/en/conventions/data-classes/#offset) to supply the correct combination of request parameters. |
| toolName | String | Tool name; on Siemens systems this is a read-only parameter and cannot be written |
| toolType | String | Tool type; on Okuma systems this is a read-only parameter and cannot be written |
| lengthUnit | String | Tool offset length unit |
| toolNose | Int32 | (Imaginary) tool nose position / cutting edge type |
| lengthWear | Double | Length wear |
| radiuWear | Double | Radius wear |
| lengthGeom | Double | Length geometry |
| radiusGeom | Double | Radius geometry |
| wearX | Double | Length X wear |
| wearY | Double | Length Y wear |
| wearZ | Double | Length Z wear |
| wearR | Double | Radius wear |
| geomX | Double | Length X |
| geomY | Double | Length Y |
| geomZ | Double | Length Z |
| geomR | Double | Radius |

:::note[Note]
The table lists the common tool offset parameters, but not all of them. Some machines have less common offset settings that are not individually documented here. Generally, any offset parameter that can be read via [2.5.1.12. readOffsetData - Read Tool Offset Data](#readoffsetdata) can also be written, but on some machines certain offset parameters are read-only and cannot be written, such as the toolName parameter on Siemens systems. **We recommend first testing reads of tool offset data to determine which offset parameters a machine supports when adding a new machine system model, then testing writes to check for any read-only parameters.** If, in actual use, you need to write an offset parameter that the machine has but this endpoint does not yet support, please contact support.
:::

Response example

```json
{
  "errorCode": 0,
  "errorMsg": "Success"
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| errorCode | Int32 | (Required) Error code; 0 indicates success. |
| errorMsg | String | (Required) Error message |

## 2.5.1.15. readPosition - Read Coordinate Data {#readposition}

```http
GET /api/cnc/readPosition?machineID=MACHINEID&channel=CHANNEL
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| machineID | String | (Required) Target machine identifier, see [1.1.1. machineID Machine Identifier](/en/conventions/identifiers/#machineid) |
| channel | Int32 | Machine channel number. Defaults to 0 (the main channel) if not supplied. |

Response example

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

| Response Parameter | Type | Description |
| --- | --- | --- |
| axisName | String[] | (Required) Axis name |
| unit | String[] | Unit |
| mach | Float[] | Machine coordinates |
| abs | Float[] | Absolute coordinates |
| rel | Float[] | Relative coordinates |
| dist | Float[] | Remaining distance |
| channel | Int32 | Machine channel number; appears only when channel is supplied in the request and is not 0 |

Each coordinate data array corresponds by index to the axis names in axisName.

## 2.5.1.16. readProgramBlock - Read Program Block {#readprogramblock}

This endpoint reads the program block currently running on the machine.

```http
GET /api/cnc/readProgramBlock?machineID=MACHINEID&channel=CHANNEL
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| machineID | String | (Required) Target machine identifier, see [1.1.1. machineID Machine Identifier](/en/conventions/identifiers/#machineid) |
| channel | Int32 | Machine channel number. Defaults to 0 (the main channel) if not supplied. |

Response example

```json
{
  "currentBlock": "Y70.800",
  "channel": 2
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| currentBlock | String | (Required) Content of the currently running program block |
| channel | Int32 | Machine channel number; appears only when channel is supplied in the request and is not 0 |

## 2.5.1.17. readProgramInfo - Read Machining Program Information {#readprograminfo}

```http
GET /api/cnc/readProgramInfo?machineID=MACHINEID&channel=CHANNEL
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| machineID | String | (Required) Target machine identifier, see [1.1.1. machineID Machine Identifier](/en/conventions/identifiers/#machineid) |
| channel | Int32 | Machine channel number. Defaults to 0 (the main channel) if not supplied. |

Response example

```json
{
  "mainPrgmName": "1234",
  "runningPrgName": "abcd",
  "programSeqNum": "N30",
  "programStack": "A/B/1234/abcd",
  "channel": 2
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| mainPrgmName | String | (Required) Main program name |
| runningPrgName | String | (Required) Name of the currently executing subprogram |
| programSeqNum | String | Sequence number of the currently executing subprogram block |
| programStack | String | Program stack; currently only supported on Siemens and the simulated machine |
| channel | Int32 | Machine channel number; appears only when channel is supplied in the request and is not 0 |

For Fanuc, a leading zero in a standard program name (letter O + digits) is automatically stripped — for example, a program shown on the machine as O0010 is returned as O10.

## 2.5.1.18. readPlcData - Read PLC Data {#readplcdata}

Before using this endpoint, you need to know the PLC area address and type of the target data. Consult the equipment manual or contact the equipment manufacturer for this information.

```http
GET /api/cnc/readPlcData?machineID=MACHINEID&area=AREA&start=START&count=COUNT&type=TYPE
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| machineID | String | (Required) Target machine identifier, see [1.1.1. machineID Machine Identifier](/en/conventions/identifiers/#machineid) |
| area | String | (Required) Area. Format is `{areaName}\|{parameter1}\|{paramter2}…`, where areaName is the area name and parameter is an additional parameter. areaName is a PLC area such as R, X, Y, etc., obtainable from the machine manual or manufacturer; see [PLC Data - Common Areas and Parameters](#plc-regions) for the area format. When using the standard protocol MODBUS for communication, areaName is a segment name such as 0x, 1x, 3x, 4x, etc. The gateway also supports some special area names, including the $MACRO$ macro variable, $PARAM$ system parameter, and $TAG$ tag, etc.; see [PLC Data - Special Areas and Parameters](#plc-special-regions). The parameter field supplies additional data, e.g. axis=AXIS to specify an axis number, level=LEVEL to specify an execution level, type=TYPE to specify a type, and name=NAME to specify a tag name. |
| start | String | Start address. If not base 10, add the appropriate prefix per [PLC Address Numeric Base Prefixes](#plc-prefixes). |
| count | Int32 | (Required) Data count. For non-String types, this is the number of data items; for the String type, this is the length of the target string (in bytes). |
| type | String | (Required) Data type. See [PLC Data Types](#plc-types) for the currently supported data types. |
| channel | Int32 | Machine channel number. Defaults to 0 (the main channel) if not supplied. |

### PLC Data - Common Areas and Parameters {#plc-regions}

| Device System | Area | area Example | Notes |
| --- | --- | --- | --- |
| All device systems | Ordinary area | `X` | The X area of the PLC device |
| All device systems | Ordinary area | `X\|s=S` | To communicate with another PLC connected to the currently connected PLC, you can supply station, slot, or slaveID (MODBUS); if s is not supplied, it defaults to communicating with the currently connected PLC. This parameter is currently supported only by some PLC devices. |

### PLC Data - Special Areas and Parameters {#plc-special-regions}

| System Model | Area | area Example | Notes |
| --- | --- | --- | --- |
| Bosunman | MODBUS address | `0x` or `1x` or `4x` | |
| Brother | Macro variable | `$MACRO$` | |
| Delta | Macro variable | `$MACRO$` | |
| Fagor [8035,8040,8055] | Macro variable (precise to 5 decimal places) | `$MACRO$\|type=local\|level=LEVEL` | Local arithmetic parameter; if the nesting level is not 1, supply the execution level, e.g. level=7 |
| Fagor [8035,8040,8055] | Macro variable (precise to 5 decimal places) | `$MACRO$\|type=global` | Global arithmetic parameter |
| Fagor [8035,8040,8055] | Tag (variable name) | `$TAG$\|name=NAME` | Supply the name tag (variable name) |
| Fagor [8060,8065,8070] | Macro variable (precise to 4 decimal places) | `$MACRO$\|type=local\|level=LEVEL` | Local arithmetic parameter; if the nesting level is not 1, supply the execution level, e.g. level=7 |
| Fagor [8060,8065,8070] | Macro variable (precise to 4 decimal places) | `$MACRO$\|type=global` | Global arithmetic parameter |
| Fagor [8060,8065,8070] | Macro variable (precise to 4 decimal places) | `$MACRO$\|type=common` | Common arithmetic parameter |
| Fagor [8060,8065,8070] | Tag (variable name) | `$TAG$\|name=NAME` | Supply the name tag (variable name) |
| Fanuc | Diagnostic data | `$DIAG$` | |
| Fanuc | Macro variable | `$MACRO$` | |
| Fanuc | System parameter | `$PARAM$` | Supports Byte, Int16, Int32, and Double types, among others. |
| Fanuc | System parameter | `$PARAM$\|axis=AXIS` | Some parameters require an axis number, e.g. axis=1 |
| Gsk [980, 988] | Macro variable | `$MACRO$` | |
| Gsk [Ethernet, serial-to-Ethernet, 986 V4.15] | Macro variable | `$MACRO$` | |
| Gsk [Ethernet, serial-to-Ethernet, 986 V4.15] | MODBUS address | `0x` or `1x` or `4x` | |
| Haas [general-purpose] | Macro variable | `$MACRO$` | |
| Hnc | Macro variable | `$MACRO$` | |
| Jingdiao | Macro variable | `$MACRO$` | |
| Kede | Macro variable | `$MACRO$` | # variable |
| Kede | Tag (variable name) | `$TAG$\|name=NAME` | PLC variable, e.g. `$TAG$\|name=PLC_PRG.C_Workpiece` |
| Kede | Tag (variable name) | `$TAG$\|name=NAME\|type=cncVar` | cncVar-type variable, i.e. a variable used for interaction between the PLC and the CNC system, e.g. `$TAG$\|name=PEW4190.1\|type=cncVar` |
| Lynuc | Macro variable | `$MACRO$` | |
| Lynuc | Tag (variable name) | `$TAG$\|name=NAME` | Supply the name tag (variable name), e.g. `$TAG$\|name=MOU31.25.28` |
| Mazak [Smart, Smooth] | Macro variable | `$MACRO$\|type=R` | R variable |
| Mitsubishi | Macro variable (local or common variable) | `$MACRO$` | Default execution level 0 |
| Mitsubishi | Macro variable (local or common variable) | `$MACRO$\|level=LEVEL` | If the execution level is not 0, supply the execution level, e.g. level=1 |
| Mock simulated machine | Macro variable | `$MACRO$` | |
| Mock simulated machine | System parameter | `$PARAM$` | |
| Mock simulated machine | Tag (variable name) | `$TAG$\|name=NAME` | Supply the name tag (variable name) |
| Siemens | Macro variable | `$MACRO$\|type=R` | R parameter |
| Siemens | Macro variable | `$MACRO$\|type=RG` | RG parameter |
| Siemens [general-purpose] | Tag (variable name) | `$TAG$\|area=AREA\|block=BLOCK\|name=NAME\|areaNo=AREANO\|row=ROW\|column=COLUMN` | S7 variable; supply the parameters Area, Block (Component), VariableName, AreaNo. (default 1), Row (default 1), Column (default 1), e.g.: `$TAG$\|area=C\|block=AUXFU\|name=status\|areaNo=2\|row=3` |
| Siemens [OPC UA] | Tag (variable name) | `$TAG$\|name=NAME\|ns=NS` | OPC UA server variable address; supply the parameters name (variable name) and ns (name space index, default 2), e.g.: `$TAG$\|area=/Channel/State/actParts\|ns=2` |
| Syntec | Macro variable | `$MACRO$` | |
| Allen-Bradley | Tag (variable name) | `$TAG$\|name=NAME` | Supply the name tag (variable name) |

:::note[Note]
Note 1: The $MACRO$ macro variable generally supports only the Double data type.

Note 2: When using the $TAG$ method, the Start start address does not need to be supplied.
:::

### PLC Address Numeric Base Prefixes {#plc-prefixes}

| Base | Prefix (digit 0 + letter) | Example |
| --- | --- | --- |
| Base 2 | 0b | 0b1001 |
| Base 8 | 0 | 03671 |
| Base 10 | none | 123 |
| Base 16 | 0x | 0x5A7 |

### PLC Data Types {#plc-types}

| Data Type | Bit | Byte | SByte | Int16 | UInt16 | Float | Int32 | UInt32 | Double | String |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Data length | 1 bit | 8 bits | 8 bits | 16 bits | 16 bits | 32 bits | 32 bits | 32 bits | 64 bits | variable |
| Bosunman | O | O | O | O | O | O | O | O | O | O |
| Brother | O | | | O | | | | | | |
| Delta | O | O | O | O | O | O | O | O | O | O |
| Fagor [8060,8065,8070] | | | | | | | O | | O | O |
| Fanuc | | O | O | O | O | | O | O | \* | |
| Gsk [988,980] | | O | | | | | | | \* | |
| Gsk [Ethernet, serial-to-Ethernet, 986 V4.15] | O | O | O | O | O | O | O | O | O | O |
| Haas [general-purpose] | | | | O | O | O | O | O | O | O |
| Heidenhain | O | | O | O | | | O | | | O |
| Hnc | | O | | O | | | O | O | O | |
| Jingdiao | | O | | O | O | | O | O | O | |
| Knd | | O | O | O | O | | O | O | | |
| Lnc | O | | | | | O | O | | | |
| Mitsubishi | O | O | | O | O | O | O | O | \* | |
| Mock simulated machine | O | O | O | O | O | O | O | O | O | O |
| Siemens | O | O | | O | O | O | O | O | O | O |
| Syntec | | O | | O | | | O | | \* | |
| External module | | | | | O | O | | | | |

O: Supported.

\*: This data type is supported only for macro variables (local variables, common variables, etc.).

### Request Examples {#readplcdata-examples}

Examples 1-2 are ordinary area examples.

Example 1, reading an Int32 array:

Request to get 8 Int32 values from the machine with machineID 1010, starting at PLC address R0 (inclusive):

```
/api/cnc/readPLCData?machineID=1010&area=R&start=0&count=8&type=Int32
```

Response format:

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

Example 2, reading a String:

Request to get a String value of up to 16 bytes from the machine with machineID 1010, starting at PLC address S0 (inclusive):

```
/api/cnc/readPLCData?machineID=1010&area=S&start=0&count=16&type=String
```

Response format:

```json
{
  "msg": "Test string"
}
```

Examples 3-6 are special area examples.

Example 3, reading $MACRO$:

Request to get macro variables (local variable, common variable, etc.) numbered 1 through 3 on the machine with machineID 1010:

```
/api/cnc/readPLCData?machineID=1010&area=$MACRO$&start=1&count=3&type=Double
```

Response format:

```json
{
  "data": [
    -1.7976931348623157E+308,
    0.0,
    1.2345]
}
```

Here, -1.7976931348623157E+308 is the minimum value of the Double type, indicating the variable has not been set.

Example 4, reading $PARAM$:

Request to get system parameters numbered 100 through 102, of type Byte, on the machine with machineID 1010:

```
/api/cnc/readPLCData?machineID=1010&area=$PARAM$&start=100&count=3&type=Byte
```

Response format:

```json
{
  "data": [
    4,
    1,
    0]
}
```

Example 5, reading a single value by tag:

Request to get 1 value of type UInt32, with tag name A.B, on the machine with machineID 1010:

```
/api/cnc/readPLCData?machineID=1010&area=$TAG$|name=A.B&count=1&type=UInt32
```

Example 6, reading multiple values from an array by tag:

Request to get elements 0 through 7 of the Float array with tag name AB.C, on the machine with machineID 1010:

```
/api/cnc/readPLCData?MachineID=1010&area=$TAG$|name=AB.C[0]&count=8&type=Float
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| data | Array[Object] | When the type parameter in the request is any type other than String, the response body outputs data, an array of the type specified in the request, with length equal to the requested count. |
| msg | String | When the type parameter in the request is String, the response body outputs msg. Trailing blanks at the end of msg are automatically trimmed. If the actual String length read exceeds the length defined in the request parameters, error errorCode 179 is returned. |
| channel | Int32 | Machine channel number; appears only when channel is supplied in the request and is not 0 |

:::note[Note]
Note 1: Some devices impose a limit on the maximum amount of PLC data that can be read in a single request, to avoid affecting machine operation.

Note 2: The Syntec system automatically selects the output type based on the input address. As a result, even if the input type is incorrect, data may still be returned, but its output type will not match the type specified in the request.

Note 3: On some systems, such as Brother, the Int16 type can accommodate results of types such as Bit and Byte.
:::

## 2.5.1.19. writePlcData - Write PLC Data {#writeplcdata}

Writing PLC data carries a degree of risk. Be sure to understand the risks and write data only when it is safe to do so. By default, the gateway blocks this endpoint; before use, enable the corresponding option on the **Settings** page of the gateway management console.

Before using this endpoint, you need to know the PLC area address and type of the target data. Consult the equipment manual or contact the equipment manufacturer for this information.

```http
POST /api/cnc/writePlcData?machineID=MACHINEID&area=AREA&start=START&type=TYPE
```

Request body example, application/json

When the data being written is not of type String:

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

When the data being written is of type String:

```json
{
  "msg": "Test string"
}
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| machineID | String | (Required) Target machine identifier, see [1.1.1. machineID Machine Identifier](/en/conventions/identifiers/#machineid) |
| area | String | (Required) Area. Format is `{areaName}\|{parameter1}\|{paramter2}…`, where areaName is the area name and parameter is an additional parameter. areaName is a PLC area such as R, X, Y, etc., obtainable from the machine manual or manufacturer; see [PLC Data - Common Areas and Parameters](#plc-regions) for the area format. When using the standard protocol MODBUS for communication, areaName is a segment name such as 0x, 1x, 3x, 4x, etc. The gateway also supports some special area names, including the $MACRO$ macro variable, $PARAM$ system parameter, and $TAG$ tag, etc.; see [PLC Data - Special Areas and Parameters](#plc-special-regions). The parameter field supplies additional data, e.g. axis=AXIS to specify an axis number, level=LEVEL to specify an execution level, type=TYPE to specify a type, and name=NAME to specify a tag name. |
| start | String | Start address. If not base 10, add the appropriate prefix per [PLC Address Numeric Base Prefixes](#plc-prefixes). |
| type | String | (Required) Data type. See [PLC Data Types](#plc-types) for the currently supported data types. |
| data | Array[Object] | When the type parameter in the request is any type other than String, supply data in the request body, an array of the type specified in the request. |
| msg | String | When the type parameter in the request is String, supply msg in the request body. |
| channel | Int32 | Machine channel number. Defaults to 0 (the main channel) if not supplied. |

Response example

```json
{
  "errorCode": 0,
  "errorMsg": "Success"
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| errorCode | Int32 | (Required) Error code; 0 indicates success. |
| errorMsg | String | (Required) Error message |

## 2.5.1.20. readTimeData - Read Machine Time Data {#readtimedata}

```http
GET /api/cnc/readTimeData?machineID=MACHINEID
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| machineID | String | (Required) Target machine identifier, see [1.1.1. machineID Machine Identifier](/en/conventions/identifiers/#machineid) |

Response example

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

| Response Parameter | Type | Description |
| --- | --- | --- |
| cumulativePowerOnTimeMin | Int32 | Cumulative power-on time, part 1 [minutes] |
| cumulativePowerOnTimeMs | Int32 | Cumulative power-on time, part 2 [milliseconds] |
| powerOnTimeMin | Int32 | Current power-on time, part 1 [minutes] |
| powerOnTimeMs | Int32 | Current power-on time, part 2 [milliseconds] |
| cumulativeOperatingTimeMin | Int32 | Cumulative operating time, part 1 [minutes] |
| cumulativeOperatingTimeMs | Int32 | Cumulative operating time, part 2 [milliseconds] |
| operatingTimeMin | Int32 | Current operating time, part 1 [minutes] |
| operatingTimeMs | Int32 | Current operating time, part 2 [milliseconds] |
| cumulativeCuttingTimeMin | Int32 | Cumulative machining (cutting) time, part 1 [minutes] |
| cumulativeCuttingTimeMs | Int32 | Cumulative machining (cutting) time, part 2 [milliseconds] |
| cuttingTimeMin | Int32 | Current machining (cutting) time, part 1 [minutes] |
| cuttingTimeMs | Int32 | Current machining (cutting) time, part 2 [milliseconds] |
| lastCycleTimeMin | Int32 | Last cycle time, part 1 [minutes] |
| lastCycleTimeMs | Int32 | Last cycle time, part 2 [milliseconds] |
| currentCycleTimeMin | Int32 | Current cycle time, part 1 [minutes] |
| currentCycleTimeMs | Int32 | Current cycle time, part 2 [milliseconds] |
| currentCuttingTimeMin | Int32 | Current cutting time, part 1 [minutes] |
| currentCuttingTimeMs | Int32 | Current cutting time, part 2 [milliseconds] |
| remainingCycleTimeMin | Int32 | Remaining cycle time, part 1 [minutes] |
| remainingCycleTimeMs | Int32 | Remaining cycle time, part 2 [milliseconds] |

**This endpoint returns only the time data supported by the machine's system.** Each time value is computed by converting and summing its corresponding time 1 and time 2; see [1.2.24. TimeData: Machine Time Data](/en/conventions/data-classes/#timedata) for the calculation method.
