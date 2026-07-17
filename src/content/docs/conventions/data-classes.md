---
title: "1.2. 数据说明"
sidebar:
  label: "1.2. 数据说明"
---


`<type>` 数据类如下表：

| 序号 | type | 说明 |
| --- | --- | --- |
| 1 | AlarmHistory | 警报历史 |
| 2 | AlarmLog | 当前警报 |
| 3 | AxialOverload | 伺服轴过载数据 |
| 4 | CNCStatus | 机台状态 |
| 5 | Count | 加工计数 |
| 6 | CurrentToolNumber | 当前刀号 |
| 7 | Cycle | 节拍数据 |
| 8 | EnergyConsum | 能耗数据 |
| 9 | Feed | 进给数据 |
| 10 | FeedAndSpindle | 进给倍率数据 |
| 11 | GroupCount | 机组加工计数 |
| 12 | GroupCumulativeTime | 机组累计状态时间 |
| 13 | GroupOEE | 机组 OEE 数据 |
| 14 | LaserPower | 激光功率 |
| 15 | Load | 负载数据 |
| 16 | LogHistory | 日志历史 |
| 17 | OEE | 机台 OEE 数据 |
| 18 | Offset | 刀补数据 |
| 19 | PLC | PLC 数据 |
| 20 | Position | 坐标数据 |
| 21 | ProgramBlock | 程序段 |
| 22 | ProgramInfo | 当前程序 |
| 23 | SpindleOverload | 主轴过载数据 |
| 24 | TimeData | 机台时间数据 |
| 25 | ToolLife | 刀具寿命数据 |

所有数据类中的 `<field>` 数据字段与 `<tag>` 数据标签如下。如数据类中未列出 `<tag>` 数据标签代表该数据类不需要数据标签。

## 1.2.1. AlarmHistory：警报历史 {#alarmhistory}

警报历史 `<field>` 数据字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| alarmActive | Bool | true：激活警报状态；false：解除警报状态 |
| alarmLevel | String | 警报级别 |
| alarmMsg | String | 警报内容 |

累计警报数为自从网关开始自动采集这台设备，累计的警报数。该值保存在网关中，与 machineID 机台标识绑定，不会被重置。

## 1.2.2. AlarmLog：当前警报 {#alarmlog}

当前警报 `<field>` 数据字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| alarmLevel | String[] | 警报级别 |
| alarmMsg | String[] | 警报内容 |
| alarmTime | String[] | 警报时间 |

## 1.2.3. AxialOverload：伺服轴过载数据 {#axialoverload}

伺服轴过载数据 `<field>` 数据字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| cumulativeTime | UInt32 | 累计过载时间[毫秒] |

累计轴过载时间为自从网关开始自动采集这台设备，累计的轴过载时间。该值保存在网关中，与 machineID 机台标识绑定，不会被重置。

伺服轴过载数据 `<tag>` 数据标签：

| 序号 | 标签 | 类型 | 缩写 | 说明 |
| --- | --- | --- | --- | --- |
| 1 | axisNo | Int32 | A | 轴号 |

## 1.2.4. CNCStatus：机台状态 {#cncstatus}

机台状态 `<field>` 数据字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| alarmStatus | String | 警报状态，见[警报状态](/conventions/variables/#alarm-status)、[警报级别](/conventions/variables/#alarm-level) |
| alarmLevel | String | 警报级别，如有多个警报，取这些警报中的最高级别。如无警报，则不返回。详见[警报级别](/conventions/variables/#alarm-level) |
| cncStatus | String | CNC 运行状态，见[运行状态](/conventions/variables/#cnc-status) |
| adjustedStatus | String | 修正的 CNC 运行状态。如果启用状态修正（详见《说明书》[5.5.8. 机台状态监控设置](https://docs.bivrost.cn/usage/tasks#status-monitor)），根据设定的规则得到修正后的机台状态。如未启用状态修正，此字段数据与 cncStatus 数据一致。在 OEE，状态累计时间等涉及机台状态的计算中，优先使用 adjustedStatus 判断状态。 |
| mode | String | \*运行模式，随系统型号 |
| programStatus | String | \*程序状态，随系统型号 |
| emergencyStatus | String | \*急停状态，见[急停状态](/conventions/variables/#emergency-status) |
| dryRunStatus | String | \*试运行状态，见[试运行状态](/conventions/variables/#dryrun-status) |
| OffTime | UInt32 | 累计关机时间[秒] |
| WaitTime | UInt32 | 累计待机时间[秒] |
| EmergencyTime | UInt32 | 累计急停时间[秒] |
| AutoRunTime | UInt32 | 累计自动运行时间[秒] |
| ManualTime | UInt32 | 累计调机时间[秒] |

累计状态时间为自从网关开始自动采集这台设备，累计的各状态时间。该值保存在网关中，与 machineID 机台标识绑定，不会被重置。

\*：状态详情，在以下情况返回：

1. 使用接口 [2.5.1.3. readCNCStatusDetails 读取机台状态详情](/http/direct-read/#readcncstatusdetails)，[2.5.2.1. readTaskData 读取机台任务数据](/http/cached-read/#readtaskdata)，或 [2.5.2.2. batchReadTaskData 批量读取机台任务数据](/http/cached-read/#batchreadtaskdata)。
2. 启用机台状态任务，且在任务配置-机台状态监控设置，启用状态详情，机台状态任务返回这些字段。

机台状态 `<tag>` 数据标签：

| 序号 | 标签 | 类型 | 缩写 | 说明 |
| --- | --- | --- | --- | --- |
| 1 | channel | Int32 | C | 通道号，如不存在则代表默认通道 |

## 1.2.5. Count：加工计数 {#count}

加工计数 `<field>` 数据字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| count | Int32 | 机台系统记录的当前加工件数 |
| cumulativeCount | UInt32 | 累计加工计数 |
| currentCount | Int32 | 当前产量 |

累计加工计数为自从网关开始自动采集这台设备，累计的加工计数。该值保存在网关中，与 machineID 机台标识绑定，不会被重置。当前产量为机台在监控时间内的产量统计。

## 1.2.6. CurrentToolNumber：当前刀号 {#currenttoolnumber}

当前刀号 `<field>` 数据字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| toolNumber | String | 当前刀号 |
| toolOffsetNum | String | 当前刀补号 |

当前刀号 `<tag>` 数据标签：

| 序号 | 标签 | 类型 | 缩写 | 说明 |
| --- | --- | --- | --- | --- |
| 1 | channel | Int32 | C | 通道号，如不存在则代表默认通道 |

## 1.2.7. Cycle：节拍数据 {#cycle}

节拍数据 `<field>` 数据字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| lastCycleTime | Int64 | 上次节拍时间[秒]，由网关机台节拍数据任务监测。如网关重启后第一个节拍尚未结束，此数值为 0。上次节拍时间定义上与 [1.2.24. TimeData：机台时间数据](#timedata)中的上次循环时间相同，区别在于：前者由网关统计，所有可统计产量与状态的机台都支持；后者由机台本身提供，只有部分机台支持。 |
| lastTotalTime | Int64 | 上次节拍结束到此次节拍结束的总时间[秒]，包括非运行时间。 |
| mainPrgmName | String | 上次节拍主程序名 |
| deltaCount | Int32 | 前后节拍计数变化值，当此值大于 1 时，节拍时间等于此次计数变化期间的运行时间除以计数变化值。 |

## 1.2.8. EnergyConsum：能耗数据 {#energyconsum}

能耗数据 `<field>` 数据字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| allServoAxes | Double | 所有伺服轴能耗[Wh] |
| coolantPump | Double | 冷却液泵能耗[Wh] |
| ctsPump | Double | CTS 泵[Wh] |
| chipFlusherPump | Double | 切屑冲洗器泵[Wh] |
| cyclonePump | Double | 离心式过滤器用泵[Wh] |
| system24V | Double | 24V 系统[Wh] |
| ncControl | Double | NC 控制[Wh] |
| lcdBacklight | Double | LCD 背光[Wh] |
| chipConveyor | Double | 排屑器[Wh] |
| screwConveyor | Double | 螺旋排屑器[Wh] |
| autoLubrication | Double | 自动注油设备（或自动注脂设备）[Wh] |
| spindleCoolingFan | Double | 主轴冷却风扇[Wh] |
| servoControl | Double | 伺服控制[Wh] |

目前此数据类仅支持部分新款 Brother 兄弟机型。

## 1.2.9. Feed：进给数据 {#feed}

进给数据 `<field>` 数据字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| actFeed | Float | 实际进给速度 |
| cmdFeed | Float | 指令进给速度 |
| overFeed | Float | 进给倍率[%] |
| overRapid | Float | 快速进给倍率[%] |

进给数据 `<tag>` 数据标签：

| 序号 | 标签 | 类型 | 缩写 | 说明 |
| --- | --- | --- | --- | --- |
| 1 | channel | Int32 | C | 通道号，如不存在则代表默认通道 |

## 1.2.10. FeedAndSpindle：进给倍率数据 {#feedandspindle}

进给倍率数据 `<field>` 数据字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| actFeed | Float | 实际进给速度 |
| actSpindle | Float | 第一主轴的实际转速 |
| cmdFeed | Float | 指令进给速度 |
| cmdSpindle | Float | 第一主轴的指令转速 |
| overFeed | Float | 进给倍率[%] |
| overRapid | Float | 快速进给倍率[%] |
| overSpindle | Float | 第一主轴的转速倍率[%] |

进给倍率数据 `<tag>` 数据标签：

| 序号 | 标签 | 类型 | 缩写 | 说明 |
| --- | --- | --- | --- | --- |
| 1 | channel | Int32 | C | 通道号，如不存在则代表默认通道 |

## 1.2.11. GroupCount：机组加工计数 {#groupcount}

机组加工计数 `<field>` 数据字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| cumulativeCount | UInt32 | 机组累计加工计数，即自从网关开始自动采集这组设备，累计的加工计数。详见《说明书》[6.1.3. 机组加工计数](https://docs.bivrost.cn/reference/glossary#group-count)。 |

## 1.2.12. GroupCumulativeTime：机组累计状态时间 {#groupcumulativetime}

机组累计状态时间 `<field>` 数据字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| OffTime | UInt32 | 累计关机时间[秒] |
| WaitTime | UInt32 | 累计待机时间[秒] |
| EmergencyTime | UInt32 | 累计急停时间[秒] |
| AutoRunTime | UInt32 | 累计自动运行时间[秒] |
| ManualTime | UInt32 | 累计调机时间[秒] |

累计状态时间为自从网关开始自动采集这组设备，累计的机组内所有设备的各状态时间和。

## 1.2.13. GroupOEE：机组 OEE {#groupoee}

机组 OEE `<field>` 数据字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| autoRunCount | Int32 | 当前机组中自动运行机台数量 |
| autoRunTime | Int64 | 机组自动运行时间[秒] |
| availability | Float | 机组开动率[%] |
| emergencyCount | Int32 | 当前机组中急停机台数量 |
| emergencyTime | Int64 | 机组急停时间[秒] |
| manualCount | Int32 | 当前机组中调机机床数量 |
| manualTime | Int64 | 机组调机时间[秒] |
| offCount | Int32 | 当前机组中关机机床数量 |
| offTime | Int64 | 机组关机时间[秒] |
| waitCount | Int32 | 当前机组中待机机床数量 |
| waitTime | Int64 | 机组待机时间[秒] |

此处机组各状态时间是机组中所有激活状态的机台在监控时间内的各状态时间之和。机组开动率是机组在监控时间内的开动率。详见《说明书》[6.1.2. 机组 OEE 数据](https://docs.bivrost.cn/reference/glossary#group-oee)。

## 1.2.14. LaserPower：激光功率 {#laserpower}

激光功率 `<field>` 数据字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| preset | Float | 预设功率[%] |
| actual | Float | 实际功率[%] |

## 1.2.15. Load：负载数据 {#load}

负载数据 `<field>` 数据字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| axialLoad | Float[] | 伺服轴负载[%]，依次对应 [1.2.20. Position：坐标数据](#position)中的 axisName 中的伺服轴名。 |
| spindleLoad | Float[] | 主轴负载[%]，依次对应第一主轴，第二主轴等。 |

负载数据 `<tag>` 数据标签：

| 序号 | 标签 | 类型 | 缩写 | 说明 |
| --- | --- | --- | --- | --- |
| 1 | channel | Int32 | C | 通道号，如不存在则代表默认通道 |

## 1.2.16. LogHistory：日志历史 {#loghistory}

日志历史 `<field>` 数据字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| msg | String | 日志内容 |

## 1.2.17. OEE：机台 OEE 数据 {#oee}

机台 OEE `<field>` 数据字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| autoRunTime | Int64 | 自动运行时间[秒] |
| availability | Float | 机台开动率[%] |
| emergencyTime | Int64 | 急停时间[秒] |
| manualTime | Int64 | 调机时间[秒] |
| offTime | Int64 | 关机时间[秒] |
| waitTime | Int64 | 待机时间[秒] |

:::note[注]
此处机台各状态时间是机台在监控时间内的各状态时间。机台开动率是机台在监控时间内的开动率。详见《说明书》[6.1.1. 机台 OEE 数据](https://docs.bivrost.cn/reference/glossary#machine-oee)。
:::

## 1.2.18. Offset：刀补数据 {#offset}

刀补数据 `<field>` 数据字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
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
表中为通用的刀补数据字段，一般情况下足以满足用户使用需求。有些机床支持一些不常用的数据字段，不在这里一一说明。**建议在第一次添加新类型机床时，测试可读取的字段。** 如需要获取机床中有但当前未添加的字段，请咨询客服。
:::

刀补数据 `<tag>` 数据标签：

| 序号 | 标签 | 类型 | 缩写 | 说明 |
| --- | --- | --- | --- | --- |
| 1 | toolNum | Int32 | T | 刀号 |
| 2 | offsetNum | Int32 | O | 刀补号 |
| 3 | channel | Int32 | C | 通道号，如不存在则代表默认通道 |

数据标签的组合与机台系统有关，不同系统设备需要的标签组合如下（刀补数据标签组合）：

| 系统型号 | toolNum 刀具号 | offsetNum 刀补号 |
| --- | --- | --- |
| Bosunman 博尚 | X | O |
| Brother 兄弟 | X | O |
| Delta 台达 | X | O |
| Fagor 法格 | X | O |
| Fanuc 发那科 | X | O |
| GSK 广数 | X | O |
| Heidenhain 海德汉 | O；刀具表 "T" 列 | X |
| Haas 哈斯 | X | O |
| Kede 科德 | X | O |
| Knd 凯恩帝 | X | O |
| Lynuc 铼纳克 | X | O |
| Mazak 马扎克 [Smart, Smooth] | X | O |
| Mitsubishi 三菱 | X | O |
| Mock 模拟机台 | O | O |
| Okuma 大隈 [P200L, P300L] | X | O；"NO." 列 |
| Okuma 大隈 [P300S(LP)] | O；刀具数据设定表中的 "TNo" 列 | O；由刀具数据设定表中的 "ENo" 列与 "PNo" 计算：offsetNum = (ENo-1)\*20+PNo，如没有 "ENo" 列，则 offsetNum = PNo |
| Okuma 大隈 [P200M, P300M, P300S(MP)] | X | O；刀具长补偿/刀具径补偿表 "NO." 列 |
| Siemens 西门子 | O；刀具表 "位置" 列 | O；刀具表 "D" 列 |
| Syntec 新代 | X | O |

O：需要；

X：不需要。

如果输出量与标签同名，输出结果也会出现在标签中，但此结果不作标识作用。

## 1.2.19. PLC：PLC 数据 {#plc}

PLC 数据包括外部 PLC 数据。

PLC 数据 `<field>` 数据字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| data | Object[] | 除 String 类型以外的 PLC 数据。 |
| msg | String | String 类型 PLC 数据。 |
| pArray | Object[] | 后处理得到的数组数据 |
| pInt64 | Int64 | 后处理得到的 Int64 数据 |
| pDouble | Double | 后处理得到的 Double 数据 |
| pString | String | 后处理得到的 String 数据 |
| pBool | Bool | 后处理得到的 Bool 数据 |

PLC 数据 `<tag>` 数据标签：

| 序号 | 标签 | 类型 | 缩写 | 说明 |
| --- | --- | --- | --- | --- |
| 1 | channel | Int32 | C | 通道号，如不存在则代表默认通道 |
| 2 | tag | String | T | 标签名或顺序号 |

如果在 PLC 任务命令中定义了标签（详见《说明书》[6.2.1. PLC 数据任务](https://docs.bivrost.cn/reference/command-format#plc-task)），则 tag 为命令中定义的标签，如 PLC 命令中标签为 "温度数据 1"，则 tag 为 "T 温度数据 1"。如未在 PLC 任务命令中定义标签，则 tag 为 T+顺序号，顺序号从 0 开始。如第一条 PLC 任务命令中未定义标签，其顺序号为 0，tag 为 T0。如有多条 PLC 采集命令时，顺序号根据每条命令指定的回复数据长度累加。

如前一条 PLC 任务命令的顺序号为 x，则后一条的顺序号为：

x + 前一条任务获取的数据长度

这里数据长度指数据对应的 16 位型的数量。

已知，PLC 任务命令的主要参数为：区域，起始地址，数据数量，数据类型。

若数据类型是 String：

数据长度 = (数据数量 + 1) / 2，得到的结果向下取整。

例如：

PLC 命令 `DB1,1,11,String`，数据长度 = (11 + 1) / 2，结果向下取整为 6。

若数据类型不是 String：

数据长度 = 单个数据长度 \* 数据数量，其中：

单个数据长度 = (单个数据类型 Bit 数量 + 15) / 16，得到的结果向下取整。

例如：

PLC 命令 `M,100,5,Bit0`，单个数据长度 = (1 + 15) / 16，结果向下取整为 1。数据长度 = 1 \* 5 = 5。

PLC 命令 `R,100,5,Byte`，单个数据长度 = (8 + 15) / 16，结果向下取整为 1。数据长度 = 1 \* 5 = 5。

PLC 命令 `R,100,5,Int16`，单个数据长度 = (16 + 15) / 16，结果向下取整为 1。数据长度 = 1 \* 5 = 5。

PLC 命令 `R,100,5,Int32`，单个数据长度 = (32 + 15) / 16，结果向下取整为 2。数据长度 = 2 \* 5 = 10。

PLC 命令 `R,100,5,Float`，单个数据长度 = (32 + 15) / 16，结果向下取整为 2。数据长度 = 2 \* 5 = 10。

PLC 命令 `R,100,5,Double`，单个数据长度 = (64 + 15) / 16，结果向下取整为 4。数据长度 = 4 \* 5 = 20。

第一条外部 PLC 任务的顺序号在最后一条 PLC 任务的顺序号之后继续编号。

## 1.2.20. Position：坐标数据 {#position}

坐标数据 `<field>` 数据字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| axisName | String[] | 轴名称，如["x", "y", "z"] |
| abs | Float[] | 绝对坐标，依次对应 axisName 中的坐标名 |
| dist | Float[] | 剩余距离，依次对应 axisName 中的坐标名 |
| mach | Float[] | 机械坐标，依次对应 axisName 中的坐标名 |
| rel | Float[] | 相对坐标，依次对应 axisName 中的坐标名 |
| unit | String[] | 轴坐标单位 |

坐标数据 `<tag>` 数据标签：

| 序号 | 标签 | 类型 | 缩写 | 说明 |
| --- | --- | --- | --- | --- |
| 1 | channel | Int32 | C | 通道号，如不存在则代表默认通道 |

## 1.2.21. ProgramBlock：程序段 {#programblock}

程序段 `<field>` 数据字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| currentBlock | String | 当前运行的程序段内容 |

程序段 `<tag>` 数据标签：

| 序号 | 标签 | 类型 | 缩写 | 说明 |
| --- | --- | --- | --- | --- |
| 1 | channel | Int32 | C | 通道号，如不存在则代表默认通道 |

## 1.2.22. ProgramInfo：当前程序 {#programinfo}

当前程序 `<field>` 数据字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| mainPrgmName | String | 当前主程序名 |
| programSeqNum | String | 当前执行子程序段顺序号 |
| runningPrgName | String | 当前执行子程序名 |
| programStack | String | 程序堆栈，仅支持 Siemens 西门子 [OPC UA] |

当前程序 `<tag>` 数据标签：

| 序号 | 标签 | 类型 | 缩写 | 说明 |
| --- | --- | --- | --- | --- |
| 1 | channel | Int32 | C | 通道号，如不存在则代表默认通道 |

## 1.2.23. SpindleOverLoad：主轴过载数据 {#spindleoverload}

主轴过载数据 `<field>` 数据字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| cumulativeTime | UInt32 | 累计主轴过载时间[毫秒] |

累计主轴过载时间为自从网关开始自动采集这台设备，累计的主轴过载时间。该值保存在网关中，与 machineID 机台标识绑定，不会被重置。

主轴过载数据 `<tag>` 数据标签：

| 序号 | 标签 | 类型 | 缩写 | 说明 |
| --- | --- | --- | --- | --- |
| 1 | spindleNo | Int32 | S | 主轴号 |
| 2 | channel | Int32 | C | 通道号，如不存在则代表默认通道 |

## 1.2.24. TimeData：机台时间数据 {#timedata}

机台时间数据 `<field>` 数据字段：

| 字段 | 类型 | 说明 |
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

各系统型号支持的时间数据如下表所示，其中：

O（下表中以 ✅ 表示）：机床支持的时间数据。每个时间数据分成两个 Int32 保存，时间 1 为超过 1 分钟的部分，单位为分钟。时间 2 为不到 1 分钟的部分，单位为毫秒。实际时间数据为时间 1 的部分与时间 2 的部分换算单位后相加。如：

```
cumulativeOperatingTimeMin = 6683, 累计运行时间 1
cumulativeOperatingTimeMs = 13328, 累计运行时间 2
累计运行时间 = [累计运行时间 1]*60*1000+[累计运行时间 2]
             = 6683*60*1000+13328
             = 400993328 毫秒
```

\*：部分西门子系统获取到的累计运行时间，累计加工（切削）时间，当前加工（切削）时间恒定为 0，是因为该系统中存在对应变量，但系统并未实际写入任何数值。

部分时间数据可以在机床系统上手动清零。

各系统型号支持的时间数据（✅ = 支持，空白 = 不支持）：

| 系统型号 | 累计通电时间 | 当前通电时间 | 累计运行时间 | 当前运行时间 | 累计加工(切削)时间 | 当前加工(切削)时间 | 上次循环时间 | 当前循环时间 | 当前加工工件切削时间 | 剩余循环时间 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 说明 | 累计的总通电时间 | 从这次通电开始计通电时间 | 累计的总自动运行时间 | 当前自动运行状态的时间 | 累计的总切削时间 | 当前自动运行状态下的切削时间 | 上一个加工件的循环时间 | 当前加工件的已进行的循环时间 | 当前加工件的已进行的切削时间 | 当前循环剩余的时间 |
| Bosunman 博尚 [DF 系列] |  |  |  | ✅ |  |  |  | ✅ |  |  |
| Bosunman 博尚 [BSK 系列] | ✅ | ✅ | ✅ | ✅ |  |  |  | ✅ |  |  |
| Brother 兄弟 [通用型] | ✅ |  | ✅ | ✅ |  |  |  |  |  |  |
| Brother 兄弟 [S 系列] | ✅ |  | ✅ | ✅ |  |  |  | ✅ | ✅ |  |
| Delta 台达 |  |  | ✅ | ✅ |  |  |  |  |  |  |
| Dmg Mori 德玛吉森精机 [730BM] |  |  |  |  |  |  |  |  |  |  |
| Dmg Mori 德玛吉森精机 [OPC UA] | ✅ |  | ✅ |  |  |  |  | ✅ |  |  |
| Fagor 法格 [8035, 8040, 8055] |  |  |  |  |  |  |  | ✅ |  |  |
| Fagor 法格 [8060, 8065, 8070] |  | ✅ |  |  |  |  |  | ✅ |  |  |
| Fanuc 发那科 | ✅ |  | ✅ |  | ✅ |  |  | ✅（程序结尾必须复位以清零） |  |  |
| Gsk 广州数控 |  |  |  | ✅ |  | ✅ |  |  |  |  |
| Haas 哈斯 [通用型，串口] | ✅ |  | ✅ |  |  |  | ✅ | ✅ |  |  |
| Haas 哈斯 [MT-CONNECT] |  |  |  |  |  |  | ✅ | ✅ |  | ✅ |
| Heidenhain 海德汉 | ✅ |  | ✅ |  |  |  |  |  |  |  |
| Hnc 华中数控 |  |  |  |  |  |  |  |  |  |  |
| Jingdiao 北京精雕 |  |  | ✅ | ✅ |  | ✅ |  | ✅ |  |  |
| Kede 科德 |  | ✅ |  |  |  |  |  | ✅ |  | ✅ |
| Knd 凯恩帝 |  |  | ✅ | ✅ |  |  |  |  |  |  |
| Lnc 宝元 |  |  |  |  | ✅ |  |  | ✅ |  |  |
| Lynuc 铼纳克 |  |  |  | ✅ |  | ✅ |  | ✅ |  |  |
| Mazak 马扎克 [MT-CONNECT] | ✅ |  | ✅ |  | ✅ |  |  |  |  |  |
| Mazak 马扎克 [Smart, Smooth] | ✅ | ✅ | ✅ | ✅ | ✅ |  |  |  |  |  |
| Mitsubishi 三菱 | ✅ |  | ✅ |  | ✅ |  |  | ✅ |  |  |
| Mock 模拟机台 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |  |
| Okuma 大隈 | ✅ |  | ✅ |  | ✅ |  |  |  |  |  |
| Rexroth 力士乐 [OPC UA] |  |  |  | ✅ |  |  |  | ✅ |  |  |
| Siemens 西门子 | ✅ | ✅ |  | ✅ | ✅ |  |  | ✅ |  |  |
| Syntec 新代 | ✅ | ✅ |  | ✅（当前程序的自动运行时间） | ✅ |  | ✅ | ✅ |  |  |

## 1.2.25. ToolLife：刀具寿命数据 {#toollife}

刀具寿命数据 `<field>` 数据字段：

**通用数据**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| timeLimit | Int32 | 寿命极限[秒]，最大可用时间 |
| currentTime | Int32 | 当前寿命[秒]，已经使用的时间 |
| prewarningTime | Int32 | 预警寿命[秒]，当前寿命达到此值时发出警报 |
| countLimit | Int32 | 寿命极限[次]，最大可用次数 |
| currentCount | Int32 | 当前寿命[次]，已经使用的次数 |
| prewarningCount | Int32 | 预警寿命[次]，当前寿命达到此值时发出警报 |
| wearLimit | Int32 | 寿命极限[机床默认长度单位]，最大可磨损量 |
| currentWear | Int32 | 当前寿命[机床默认长度单位]，当前磨损量 |
| prewarningWear | Int32 | 预警寿命[机床默认长度单位]，当前寿命达到此值时发出警报 |

**原始数据**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| rawToolLifeType | String | 刀具寿命类型 |
| rawToolLifeUnit | String | 时间单位，以下简称为[时间] |
| rawToolLifeStatus | String | 刀具寿命状态 |
| rawTimeLimit | Double | 寿命极限[时间] |
| rawTimeLimit1 | Double | 刀具最长寿命[时间]，仅 Heidenhain 海德汉 |
| rawTimeLimit1 | Double | 调用刀具的最长寿命[时间]，仅 Heidenhain 海德汉 |
| rawCurrentTime | Double | 当前寿命[时间] |
| rawOverTime | Double | 超出刀具寿命[时间]，仅 Heidenhain 海德汉 |
| rawRemainingTime | Double | 剩余寿命[时间] |
| rawPrewarningRemainingTime | Double | 预警剩余寿命[时间] |
| rawRemainingCount | Int32 | 剩余寿命[次] |
| rawPrewarningRemainingCount | Int32 | 预警剩余寿命[次] |
| rawRemainingWear | Double | 剩余寿命[机床默认长度单位] |
| rawPrewarningRemainingWear | Double | 预警剩余寿命[机床默认长度单位] |
| inventoryNum | String | 刀具识别码，仅 Heidenhain 海德汉 |

各字段意义详见 [2.5.1.21. readToolLife 读取刀具寿命](/http/direct-toollife/#readtoollife)与 [2.5.1.22. readToolLifeDetails 读取刀具寿命详情](/http/direct-toollife/#readtoollifedetails)中的例子。

原始数据在以下情况返回：

1. 使用接口 [2.5.1.22. readToolLifeDetails 读取刀具寿命详情](/http/direct-toollife/#readtoollifedetails)，[2.5.1.24. batchReadToolLifeDetails 批量读取刀具寿命详情](/http/direct-toollife/#batchreadtoollifedetails)，[2.5.2.1. readTaskData 读取机台任务数据](/http/cached-read/#readtaskdata)，或 [2.5.2.2. batchReadTaskData 批量读取机台任务数据](/http/cached-read/#batchreadtaskdata)。
2. 启用刀具寿命任务，且在任务配置-刀具寿命监控设置，启用刀具寿命详情，刀具寿命任务返回这些字段。

刀具寿命数据 `<tag>` 数据标签：

| 序号 | 标签 | 类型 | 缩写 | 说明 |
| --- | --- | --- | --- | --- |
| 1 | toolGroupNum | Int32 | G | 刀组号 |
| 2 | toolNum | Int32 | T | 刀号 |
| 3 | toolOffsetNum | Int32 | O | 刀补号 |
| 4 | toolIndex | Int32 | I | 序号 |

数据标签的组合与机台系统有关，不同系统设备需要的标签组合如下（刀具寿命数据标签组合）：

| 系统型号 | toolGroupNum 刀组号 | toolIndex 组内序号 | toolNum 刀具号 | toolOffsetNum 刀补号 |
| --- | --- | --- | --- | --- |
| Brother 兄弟 | X | X | O | X |
| Fanuc 发那科 | O | O | X | X |
| Gsk 广数 | O | O | X | X |
| Heidenhain 海德汉 | X | X | O | X |
| Kede 科德 | X | X | O | X |
| Lynuc 铼纳克 | X | X | O | X |
| Mazak 马扎克 [Smart, Smooth] | X | X | O；"TNo" 列 | X |
| Mock 模拟机台 | X | X | O | O |
| Okuma 大隈 [P200L, P300L] | X | X | O；"TOOL" 列 | X |
| Okuma 大隈 [P300S(LP)] | X | X | O；"TNo" 列 | O；"ENo" 列，如没有 "ENo"，则 offsetNum = 1 |
| Okuma 大隈 [P200M, P300M, P300S(MP)] | X | X | O；"TOOL NO." 列 | X |
| Siemens 西门子 | X | X | O；刀具表 "位置" 列 | O；刀具表 "D" 列 |
| Syntec 新代 | X | X | O | X |

O：需要；

X：不需要。

如果输出量与标签同名，输出结果也会出现在标签中，但此结果不作标识作用。如 Fanuc 发那科的刀具寿命时，标签 toolGroupNum 与 toolIndex 用于标识刀具，而标签 toolNum 是一个输出量，此时 toolNum 的结果会出现在标签中。

各系统型号支持的寿命类型（刀具寿命类型）：

| 系统型号 | Count 计数 | Time 计时 | Wear 计磨损量 |
| --- | --- | --- | --- |
| Brother 兄弟 | O | O | X |
| Fanuc 发那科 | O | O | X |
| Gsk 广数 | O | O | X |
| Heidenhain 海德汉 | X | O | X |
| Kede 科德 | O | O | O |
| Lynuc 铼纳克 | O | O | X |
| Mock 模拟机台 | O；ToolNum 1~10 | O；ToolNum 11~20 | O；ToolNum 21~30 |
| Okuma 大隈 | O | O | O |
| Siemens 西门子 | O | O | O |
| Syntec 新代 | O | O | X |

O：支持；

X：不支持。
