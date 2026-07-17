---
title: "1.1. 标识说明"
sidebar:
  label: "1.1. 标识说明"
---


用户在阅读本文档时，有些解释内容可以参考《彼络物联网关说明书》（以下简称为《说明书》）。

本章节解释的内容，应用于后续的章节中。用户可以在具体使用中根据引用提示查找本章节的说明内容。

在通讯中使用到的标识有 machineID 机台标识，groupID 机组标识，slaveID 从站标识，ID 数据库标识，以及 ID 文件标识。

## 1.1.1. machineID 机台标识 {#machineid}

网关支持同时连接多台机台设备，需要为每台连接的设备定义唯一的 machineID 机台标识。machineID 可以在网关机台配置页-添加/编辑机台-高级设置中由用户自定义（详见《说明书》[5.3.1.5. 高级设置](https://docs.bivrost.cn/usage/machines#advanced-settings)）。默认 machineID 由机台 IP 的第三段与第四段拼接得到，拼接后删除左侧的 0。如 IP 第三段不为 0，则第四段需要补齐三位数。例如 192.168.0.1 对应的 machineID 为 1，192.168.1.12 对应的 machineID 为 1012。

## 1.1.2. groupID 机组标识 {#groupid}

网关目前支持最多 16 组机组，需要为每组设备定义唯一的 groupID 机组标识。groupID 可以在网关机组配置页-添加/编辑机台-高级设置中由用户自定义（详见《说明书》[5.4.1.3. 高级设置](https://docs.bivrost.cn/usage/groups#group-advanced)）。默认 groupID 由字母 g 与机组号组成，如 "g2"。

## 1.1.3. slaveID 从站标识 {#slaveid}

slaveID 从站标识用于 MODBUS 通讯的机台数据标识，范围为 1-255。slaveID 可以在网关机台配置页-添加/编辑机台-高级设置中由用户自定义（详见《说明书》[5.3.1.5. 高级设置](https://docs.bivrost.cn/usage/machines#advanced-settings)）。默认 slaveID 为机台 IP 第四段。

## 1.1.4. ID 数据库标识 {#db-id}

ID 数据库标识是用户，机台，或机组在本地数据库中的标识。ID 在新建用户，机台，或机组时，在数据库中自动生成，不能由用户创建或修改。
