---
title: "七、常见问题"
sidebar:
  label: "七、常见问题"
---


## 7.1. HTTP 通讯时，返回"无法访问此网站(ERR_CONNECTION_REFUSED)" {#connection-refused}

请检查当前使用的计算机能否访问网关管理页面。如果不能，请检查网关是否开机，当前计算机与网关的网络连接是否正常。

## 7.2. HTTP 通讯时，返回 `"errorCode":3` {#errorcode-3}

请使用网关管理页面的**接口测试**功能检查网关与机台之间的通讯。（详见《说明书》[5.8. 接口测试](https://docs.bivrost.cn/gateway/usage/api-test)）。如在**接口测试**页"选择机台"右侧下拉框找不到目标设备，说明该设备未被添加或激活，请参照《说明书》[5.3. 机台配置](https://docs.bivrost.cn/gateway/usage/machines)添加与激活机台。完成设置后，必须在**主页**点击**重启服务**。

如在**接口测试**页"选择机台"处找到了目标设备，点击**读取设备**，返回"读取失败"，请根据"读取失败"下方的"故障排查"提示处理。

## 7.3. MODBUS 或 MQTT 通讯时，没有收到任何数据 {#no-data}

请检查机台的自动采集设置（详见《说明书》[5.3. 机台配置](https://docs.bivrost.cn/gateway/usage/machines)）。完成设置后，必须在**主页**点击**重启服务**。

请检查任务配置（详见《说明书》[5.5. 任务配置](https://docs.bivrost.cn/gateway/usage/tasks)）。完成设置后，必须在**主页**点击**重启服务**。

如仍然无法收到任何数据，请按照 [7.2](#errorcode-3) 所述步骤处理。

## 7.4. MODBUS 通讯时，在给定的地址位无法获取有效数据 {#modbus-invalid-address}

常见原因是 MODBUS 客户端设置设置问题，应设置为基于 0 位，而不是基于 1 位。网关的 MODBUS 服务端设置是基于 0 位的，如果客户端基于 1 位，地址位应加 1。测试时，推荐使用 Modbus Poll 软件获取地址位数据，在设置地址位范围时**不要勾选"(Base 1)"**，即设置为基于 0 位。

有部分型号系统软件版本较低的 CNC，不支持部分采集内容，这些内容对应的地址位数据保持为 0。

## 7.5. 使用任意通讯协议，可以收到机台数据，但收不到机组数据 {#no-group-data}

请检查机组是否正确激活以及是否开启了机组任务设置（详见《说明书》[5.4. 机组配置](https://docs.bivrost.cn/gateway/usage/groups)）。完成设置后，必须在**主页**点击**重启服务**。

请检查任务配置（详见《说明书》[5.5. 任务配置](https://docs.bivrost.cn/gateway/usage/tasks)）。完成设置后，必须在**主页**点击**重启服务**。

## 7.6. 使用接口查看文件列表，或者接收/发送/删除文件时失败，同时网关程序传输页可以正常使用 {#url-encoding}

路径或文件名中有特殊符号或空格等不安全字符，需要转换成 url 编码。如：路径 `TNC:\nc_prog` 应转为 `TNC%3A%5Cnc_prog`；`Sinumerik/FileSystem/Part Program` 应转为 `Sinumerik%2FFileSystem%2FPart%20Program`。一般情况下，大部分浏览器和测试工具会自动转换 url 编码，但在一些软件中调用接口时，仍需要手动转换。
