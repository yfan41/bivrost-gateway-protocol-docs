---
title: "彼络物联网关 通讯协议"
sidebar:
  label: "简介"
---


本文档为彼络物联网关的通讯协议参考，版本 v1.19.7，供需要通过程序对接网关的开发者使用。网关的安装、配置与网页管理界面的使用说明请参阅[《彼络物联网关 说明书》](https://bivrost.cn/docs/gateway-protocol)（以下简称《说明书》）。

网关支持以下通讯方式：

| 通讯方式 | 说明 |
| --- | --- |
| [HTTP 通讯](/http/) | 通过 HTTP 接口主动读写机台数据、传输文件、分析数据、配置网关。所有功能均有对应接口 |
| [MODBUS 通讯](/modbus/) | 网关作为 MODBUS 服务端（端口 502），将自动采集任务结果保存在对应地址位中 |
| [MQTT 通讯](/mqtt/upload-format/) | 网关将自动采集任务结果以 JSON 报文发布至指定 MQTT 服务器，并支持 [RPC 接口](/mqtt/rpc/) |
| [数据库通讯](/database/) | 网关将自动采集任务结果写入指定数据库（InfluxDB、MySQL、SQL Server、PostgreSQL 等） |

阅读顺序建议：先阅读[一、重要说明](/conventions/identifiers/)中通用的标识、数据类与变量定义，再根据所用通讯方式查阅对应章节。没有实际机床时，可使用[模拟机台](/mock-testing/)快速测试通讯协议。

:::note[注]
MODBUS、MQTT 与数据库通讯输出的都是**自动采集任务**的结果，使用前需要在网关管理页面开启目标机台/机组的自动采集任务（详见《说明书》[5.3.1.2. 任务设置](https://docs.bivrost.cn/usage/machines#task-settings)、[5.4.1.2. 机组任务设置](https://docs.bivrost.cn/usage/groups#group-tasks)）并重启服务。
:::
