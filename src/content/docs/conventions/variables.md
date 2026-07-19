---
title: "1.3. 变量说明"
sidebar:
  label: "1.3. 变量说明"
---


## 1.3.1. 机台状态 {#machine-status}

### 1.3.1.1. CNCStatus：运行状态 {#cnc-status}

:::note[注]
变量名为 CNCStatus，实际不仅限于 CNC，也适用于机器人，激光切割机等设备的状态。
:::

运行状态：

| 状态码 | 返回 String | 运行状态 | 说明 |
| --- | --- | --- | --- |
| 0 | OFF | 关机或离线 |  |
| 1 | EMERGENCY | 紧急停止 | 按下急停按键 |
| 2 | WAIT | 待机状态：一般待机 | 1. 自动（含远程自动）模式下程序未运行，无法识别具体状态；2. 未识别的运行模式 |
| 3 | WAIT_HOLD | 待机状态：程序暂停 | 自动（含远程自动）模式下程序暂停状态 |
| 4 | WAIT_STOP | 待机状态：程序停止 | 自动（含远程自动）模式下程序停止状态 |
| 5 | WAIT_IDLE | 待机状态：空闲 | 自动模式或远程自动模式下，空闲或就绪状态 |
| 10 | AUTO_RUN | 自动运行状态 | 自动模式下程序运行 |
| 11 | AUTO_RUN_REMOTE | 远程自动运行状态 | 远程自动模式下程序运行 |
| 20 | MANUAL | 调机状态：一般调机 | 非自动状态，无法识别具体调机状态 |
| 21 | MANUAL_EDIT | 调机状态：程序编辑 |  |
| 22 | MANUAL_MDI | 调机状态：手动数据输入 |  |
| 23 | MANUAL_HANDLE | 调机状态：手动手轮进给 |  |
| 24 | MANUAL_HANDLE_TCH | 调机状态：手动手轮进给示教 |  |
| 25 | MANUAL_JOG | 调机状态：手动连续进给 |  |
| 26 | MANUAL_JOG_TCH | 调机状态：手动连续进给示教 |  |
| 27 | MANUAL_INC | 调机状态：增量进给/步进 |  |
| 28 | MANUAL_REF | 调机状态：回参考点 |  |
| 29 | MANUAL_REMOTE | 调机状态：远程 |  |
| 30 | MANUAL_MSTR | 调机状态：刀具回退/重新定位 |  |
| 31 | MANUAL_DRY_RUN | 调机状态：试运行 |  |
| 32 | MANUAL_RAPID | 调机状态：快速定位 |  |
| 33 | MANUAL_SINGLE_BLOCK | 调机状态：单段运行 |  |
| 34 | MANUAL_MDI_RUN | 调机状态：MDI 模式下运行程序 |  |
| 35 | MANUAL_HOLD | 调机状态：暂停 | 非自动（含远程自动）模式下暂停 |

:::note[注]
状态码仅用于 MODBUS 通讯。
:::

### 1.3.1.2. AlarmStatus：警报状态 {#alarm-status}

| 返回 String | 警报状态 |
| --- | --- |
| ALARM | 有警报 |
| NO_ALARM | 无警报 |

### 1.3.1.3. EmergencyStatus：急停状态 {#emergency-status}

| 返回 String | 急停状态 |
| --- | --- |
| EMG | 急停 |
| NOT_EMG | 非急停 |

### 1.3.1.4. DryRunStatus：试运行状态 {#dryrun-status}

| 返回 String | 试运行状态 |
| --- | --- |
| DRY_RUN | 试运行 |
| NOT_DRY_RUN | 非试运行 |

## 1.3.2. 警报信息 {#alarm-info}

### 1.3.2.1. AlarmLevel：警报级别 {#alarm-level}

按优先级由高到低分为错误（ERR），警告（WRN），消息（INF）三个级别。用户可参照《说明书》[5.5.7. 警报监控设置](https://gateway.docs.bivrost.cn/usage/tasks#alarm-monitor)，以关键字设置警报级别，过滤低于最低报警级别的警报。未设置级别的警报默认为 WRN 警告级别。

| 返回 String | 警报级别 |
| --- | --- |
| ERR | 错误 |
| WRN | 警告 |
| INF | 消息 |

## 1.3.3. 服务信息 {#service-info}

### 1.3.3.1. ServiceRunningStatus：服务运行状态 {#service-running-status}

网关各项服务的运行状态。

| 返回 Int32 | 运行状态 |
| --- | --- |
| 0 | Disabled 关闭 |
| 1 | Initiated 已启动 |
| 2 | Ready 等待连接 |
| 3 | Running 运行中 |
| 4 | Delayed 延误 |
| 5 | Error 错误 |
