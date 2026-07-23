---
title: "Bivrost Gateway Protocol"
sidebar:
  label: "Introduction"
---


This document is the communication protocol reference for the Bivrost gateway, version v1.19.7, intended for developers who need to integrate with the gateway programmatically. For instructions on installing and configuring the gateway and using its web management interface, please refer to the [Bivrost Gateway Manual](https://docs.bivrost.cn/gateway/) (referred to below as the "Manual").

The gateway supports the following communication methods:

| Communication Method | Description |
| --- | --- |
| [HTTP Communication](/en/http/) | Actively read/write machine data, transfer files, analyze data, and configure the gateway via HTTP interfaces. All features have corresponding interfaces |
| [MODBUS Communication](/en/modbus/) | The gateway acts as a MODBUS server (port 502), storing automatic data collection task results in the corresponding address locations |
| [MQTT Communication](/en/mqtt/upload-format/) | The gateway publishes automatic data collection task results as JSON messages to the specified MQTT server, and supports an [RPC interface](/en/mqtt/rpc/) |
| [Database Communication](/en/database/) | The gateway writes automatic data collection task results to the specified database (InfluxDB, MySQL, SQL Server, PostgreSQL, etc.) |

Suggested reading order: first read [I. Important Notes](/en/conventions/identifiers/) for the common identifiers, data classes, and variable definitions, then consult the corresponding section based on the communication method you use. If you don't have an actual machine tool available, you can use the [mock machine](/en/mock-testing/) to quickly test the communication protocol.

:::note[Note]
MODBUS, MQTT, and database communication all output the results of **automatic data collection tasks**. Before use, you need to enable the automatic data collection task for the target machine/group on the gateway management page (see the Bivrost Gateway Manual [5.3.1.2. Task Settings](https://docs.bivrost.cn/gateway/usage/machines#task-settings), [5.4.1.2. Group Task Settings](https://docs.bivrost.cn/gateway/usage/groups#group-tasks)) and restart the service.
:::
