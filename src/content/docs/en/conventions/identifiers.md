---
title: "1.1. Identifiers"
sidebar:
  label: "1.1. Identifiers"
---


While reading this documentation, some explanations may refer to the Bivrost Gateway Manual (referred to hereafter as the "Manual").

The content explained in this chapter applies to later chapters. Users can look up the explanations in this chapter based on the reference hints in specific use cases.

The identifiers used in communication include machineID (machine identifier), groupID (group identifier), slaveID (slave identifier), ID (database identifier), and ID (file identifier).

## 1.1.1. machineID (Machine Identifier) {#machineid}

The gateway supports connecting to multiple machine devices simultaneously, and a unique machineID must be defined for each connected device. The machineID can be customized by the user on the gateway's machine configuration page, under Add/Edit Machine - Advanced Settings (see the Bivrost Gateway Manual [5.3.1.5. Advanced Settings](https://docs.bivrost.cn/gateway/usage/machines#advanced-settings)). By default, the machineID is derived by concatenating the third and fourth octets of the machine's IP address, then stripping leading zeros. If the third octet is not 0, the fourth octet is padded to three digits. For example, the machineID corresponding to 192.168.0.1 is 1, and the machineID corresponding to 192.168.1.12 is 1012.

## 1.1.2. groupID (Group Identifier) {#groupid}

The gateway currently supports up to 16 groups, and a unique groupID must be defined for each group of devices. The groupID can be customized by the user on the gateway's group configuration page, under Add/Edit Machine - Advanced Settings (see the Bivrost Gateway Manual [5.4.1.3. Advanced Settings](https://docs.bivrost.cn/gateway/usage/groups#group-advanced)). By default, the groupID consists of the letter "g" followed by the group number, e.g. "g2".

## 1.1.3. slaveID (Slave Identifier) {#slaveid}

The slaveID is used as the machine data identifier for MODBUS communication, with a range of 1-255. The slaveID can be customized by the user on the gateway's machine configuration page, under Add/Edit Machine - Advanced Settings (see the Bivrost Gateway Manual [5.3.1.5. Advanced Settings](https://docs.bivrost.cn/gateway/usage/machines#advanced-settings)). By default, the slaveID is the fourth octet of the machine's IP address.

## 1.1.4. ID (Database Identifier) {#db-id}

The ID (database identifier) is the identifier for a user, machine, or group in the local database. The ID is automatically generated in the database when a user, machine, or group is created, and cannot be created or modified by the user.
