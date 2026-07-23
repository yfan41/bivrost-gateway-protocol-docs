---
title: "7. FAQ"
sidebar:
  label: "7. FAQ"
---


## 7.1. HTTP communication returns "This site can't be reached (ERR_CONNECTION_REFUSED)" {#connection-refused}

Please check whether the computer you are using can access the gateway management page. If not, check whether the gateway is powered on and whether the network connection between the current computer and the gateway is normal.

## 7.2. HTTP communication returns `"errorCode":3` {#errorcode-3}

Please use the **Interface Test** feature on the gateway management page to check the communication between the gateway and the machine tool. (See the Bivrost Gateway Manual [5.8. Interface Test](https://docs.bivrost.cn/gateway/usage/api-test).) If you cannot find the target device in the "Select Machine" dropdown on the **Interface Test** page, it means the device has not been added or activated. Please refer to the Bivrost Gateway Manual [5.3. Machine Configuration](https://docs.bivrost.cn/gateway/usage/machines) to add and activate the machine. After completing the setup, you must click **Restart Service** on the **Home** page.

If you found the target device on the **Interface Test** page under "Select Machine" but clicking **Read Device** returns "Read Failed", please follow the "Troubleshooting" guidance shown below "Read Failed".

## 7.3. No data is received during MODBUS or MQTT communication {#no-data}

Please check the machine's automatic data collection settings (see the Bivrost Gateway Manual [5.3. Machine Configuration](https://docs.bivrost.cn/gateway/usage/machines)). After completing the setup, you must click **Restart Service** on the **Home** page.

Please check the task configuration (see the Bivrost Gateway Manual [5.5. Task Configuration](https://docs.bivrost.cn/gateway/usage/tasks)). After completing the setup, you must click **Restart Service** on the **Home** page.

If you still cannot receive any data, please follow the steps described in [7.2](#errorcode-3).

## 7.4. Valid data cannot be obtained at a given address during MODBUS communication {#modbus-invalid-address}

A common cause is a misconfigured MODBUS client — it should be configured as 0-based rather than 1-based. The gateway's MODBUS server is configured as 0-based; if the client is 1-based, the address must be incremented by 1. For testing, it is recommended to use the Modbus Poll software to read address data — when setting the address range, **do not check "(Base 1)"**, i.e. configure it as 0-based.

Some CNC models with older system software versions do not support certain data collection items; the address data corresponding to these items remains 0.

## 7.5. Machine data is received using any communication protocol, but no group data is received {#no-group-data}

Please check whether the group is correctly activated and whether group task settings are enabled (see the Bivrost Gateway Manual [5.4. Group Configuration](https://docs.bivrost.cn/gateway/usage/groups)). After completing the setup, you must click **Restart Service** on the **Home** page.

Please check the task configuration (see the Bivrost Gateway Manual [5.5. Task Configuration](https://docs.bivrost.cn/gateway/usage/tasks)). After completing the setup, you must click **Restart Service** on the **Home** page.

## 7.6. Using the interface to list files, or to receive/send/delete files, fails, even though the gateway program's Transfer page works normally {#url-encoding}

If the path or file name contains special symbols or unsafe characters such as spaces, they must be converted to URL encoding. For example: the path `TNC:\nc_prog` should be converted to `TNC%3A%5Cnc_prog`; `Sinumerik/FileSystem/Part Program` should be converted to `Sinumerik%2FFileSystem%2FPart%20Program`. In general, most browsers and testing tools perform URL encoding automatically, but when calling the interface from some software, manual conversion is still required.
