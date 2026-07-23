---
title: "2.10.2. Gateway Service Function Interfaces"
sidebar:
  label: "2.10.2. Gateway Service Functions"
---


Base URL `/api/gateway`.

## 2.10.2.1. alias - Get gateway name {#alias}

This interface takes no request parameters.

```http
GET /api/gateway/alias
```

Response example

```json
{
  "alias": "iotgw"
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| alias | String | (Required) Gateway name |

## 2.10.2.2. update-alias - Update gateway name {#update-alias}

This interface takes no request parameters. Note: this change takes effect after the hardware is rebooted.

```http
POST /api/gateway/update-alias
```

Request body example application/json

```json
{
  "alias": "newAlias"
}
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| alias | String | (Required) Gateway name |

Response example

```json
{
  "errorCode": 0,
  "errorMsg": "Success"
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| errorCode | Int32 | (Required) Error code, 0 indicates success. |
| errorMsg | String | (Required) Error message |

## 2.10.2.3. reboot - Reboot gateway hardware {#reboot}

Equivalent to clicking the "Power" - "Reboot" button on the gateway management page. This interface takes no request parameters.

```http
GET /api/gateway/reboot
```

Response example

```json
{
  "errorCode": 0,
  "errorMsg": "Success"
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| errorCode | Int32 | (Required) Error code, 0 indicates success. |
| errorMsg | String | (Required) Error message |

## 2.10.2.4. restart - Restart all services {#restart}

This interface restarts both the Core service and the Gateway service. This restart differs in function from the "Restart Service" button on the gateway home page. This interface takes no request parameters.

```http
GET /api/gateway/restart
```

Response example

```json
{
  "errorCode": 0,
  "errorMsg": "Success"
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| errorCode | Int32 | (Required) Error code, 0 indicates success. |
| errorMsg | String | (Required) Error message |

## 2.10.2.5. restart-service - Restart the Core service {#restart-service}

After a user modifies machine configuration, machine group configuration, task configuration, or communication configuration, this interface must be called; it is equivalent to clicking the "Restart Service" button on the gateway home page. This interface takes no request parameters.

```http
GET /api/gateway/restart-service
```

Response example

```json
{
  "errorCode": 0,
  "errorMsg": "Success"
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| errorCode | Int32 | (Required) Error code, 0 indicates success. |
| errorMsg | String | (Required) Error message |

## 2.10.2.6. shut-down - Shut down the gateway {#shut-down}

Equivalent to clicking the "Power" - "Shut Down" button on the gateway management page. This interface takes no request parameters.

```http
GET /api/gateway/shut-down
```

Response example

```json
{
  "errorCode": 0,
  "errorMsg": "Success"
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| errorCode | Int32 | (Required) Error code, 0 indicates success. |
| errorMsg | String | (Required) Error message |

## 2.10.2.7. internet-connection - Get gateway network status {#internet-connection}

Gets the gateway's connection status to the internet. This interface takes no request parameters.

```http
GET /api/gateway/internet-connection
```

Response example

```json
{
  "isOnline": true
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| isOnline | Bool | (Required) Whether connected to the internet, true = connected, false = not connected. |

## 2.10.2.8. hardware-resources - Get gateway hardware resources {#hardware-resources}

Gets the gateway's CPU, memory, and disk usage, for monitoring gateway operating load. This interface takes no request parameters.

```http
GET /api/gateway/hardware-resources
```

Response example

```json
{
  "cpuUsage": 12.5,
  "physicalMemoryUsage": 48.3,
  "pagingMemoryUsage": 35.1,
  "virtualMemoryUsage": 22.7,
  "diskTotalBytes": 500000000000,
  "diskUsedBytes": 205800000000,
  "diskUsage": 41.16
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| cpuUsage | Float | CPU usage (percentage, 0-100). |
| physicalMemoryUsage | Float | Physical memory usage (percentage, 0-100). |
| pagingMemoryUsage | Float | Paging memory (page file) usage (percentage, 0-100). |
| virtualMemoryUsage | Float | Virtual memory usage (percentage, 0-100). |
| diskTotalBytes | Int64 | Total disk capacity (bytes). |
| diskUsedBytes | Int64 | Used disk capacity (bytes). |
| diskUsage | Float | Disk usage (percentage, 0-100). |

:::note[Note]
All of the response parameters above are optional. CPU usage is one item; physical memory, paging memory, and virtual memory form one group of memory metrics; total disk capacity, used capacity, and disk usage form one group of disk metrics. If the gateway cannot obtain a given group of metrics (e.g. because the host system does not support it), that group of fields is omitted entirely from the response.
:::

## 2.10.2.9. time - Get the gateway's current time {#time}

This interface takes no request parameters.

```http
GET /api/gateway/time
```

Response example

```json
{
  "localTime": "2025-06-30T13:51:19.2864043+08:00"
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| localTime | String | (Required) Gateway local time (ISO 8601) |

## 2.10.2.10. sync-time - Synchronize gateway time {#sync-time}

```http
GET /api/gateway/sync-time
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| timeServerAddress | String | (Required) Time server address(es). Multiple addresses are separated by ";"; the gateway first attempts to synchronize with the first address, and if that fails, tries the next address. Example: ntp1.aliyun.com;ntp2.aliyun.com;ntp3.aliyun.com;ntp4.aliyun.com; |

Response example

```json
{
  "errorCode": 0,
  "errorMsg": "Success"
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| errorCode | Int32 | (Required) Error code, 0 indicates success. |
| errorMsg | String | (Required) Error message |

## 2.10.2.11. time-zone - Get gateway time zone {#time-zone}

This interface takes no request parameters.

```http
GET /api/gateway/time-zone
```

Response example

```json
{
  "timeZoneID": "China Standard Time"
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| timeZoneID | String | (Required) Gateway time zone (Microsoft Windows time zone ID) |

## 2.10.2.12. time-zones - Get time zone options {#time-zones}

This interface takes no request parameters.

```http
GET /api/gateway/time-zones
```

Response example

```json
{
  "timeZoneIDs": [
  "Dateline Standard Time",
  "UTC-11",
  "Hawaiian Standard Time",
  "Aleutian Standard Time",
  "…",
  "China Standard Time",
  "…"
  ]
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| timeZoneIDs | String[] | (Required) Available gateway time zone options (Microsoft Windows time zone IDs) |

## 2.10.2.13. update-time-zone - Update gateway time zone {#update-time-zone}

```http
POST /api/gateway/update-time-zone
```

Request body example application/json

```json
{
  "timeZoneID": "China Standard Time"
}
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| timeZoneID | String | (Required) Gateway time zone (Microsoft Windows time zone ID). Available options can be obtained via [2.10.2.12. time-zones - Get time zone options](#time-zones). |

Response example

```json
{
  "errorCode": 0,
  "errorMsg": "Success"
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| errorCode | Int32 | (Required) Error code, 0 indicates success. |
| errorMsg | String | (Required) Error message |

## 2.10.2.14. network-adapters - Get gateway network adapter list {#network-adapters}

This interface takes no request parameters.

```http
GET /api/gateway/network-adapters
```

Response example

```json
{
  "names": [
  "LAN1",
  "LAN2",
  "WLAN"
  ]
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| names | String[] | (Required) Network adapter names |

## 2.10.2.15. lan - Get wired network settings {#lan}

```http
GET /api/gateway/lan
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| name | String | (Required) Network adapter name, valid range: LAN1 or LAN2. |

Response example

```json
{
  "name": "LAN1",
  "macAddress": "00:E0:71:BC:D2:53",
  "state": "Disconnected",
  "isDHCPEnabled": false,
  "ipAddress": "192.168.100.1",
  "subMask": "255.255.0.0",
  "defaultGateway": "",
  "isDNSServerDHCPEnabled": false,
  "dnsServer1": "",
  "dnsServer2": ""
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| name | String | (Required) Network adapter name, valid range: LAN1 or LAN2. |
| macAddress | String | (Required) MAC address |
| state | String | (Required) State, valid range: Connected, Disconnected. |
| isDHCPEnabled | Bool | (Required) Obtain IP address automatically |
| ipAddress | String | (Required) IP address |
| subMask | String | (Required) Subnet mask |
| defaultGateway | String | (Required) Default gateway |
| isDNSServerDHCPEnabled | Bool | (Required) Obtain DNS server address automatically |
| dnsServer1 | String | (Required) Preferred DNS server |
| dnsServer2 | String | (Required) Alternate DNS server |

## 2.10.2.16. update-lan - Update gateway wired network settings {#update-lan}

```http
POST /api/gateway/update-lan
```

Request body example application/json

```json
{
  "name": "LAN1",
  "isDHCPEnabled": false,
  "ipAddress": "192.168.100.1",
  "subMask": "255.255.0.0",
  "defaultGateway": "",
  "isDNSServerDHCPEnabled": false,
  "dnsServer1": "",
  "dnsServer2": ""
}
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| name | String | (Required) Target network adapter name, valid range: LAN1 or LAN2. |
| isDHCPEnabled | Bool | Obtain IP address automatically |
| ipAddress | String | IP address |
| subMask | String | Subnet mask |
| defaultGateway | String | Default gateway |
| isDNSServerDHCPEnabled | Bool | Obtain DNS server address automatically |
| dnsServer1 | String | Preferred DNS server |
| dnsServer2 | String | Alternate DNS server |

Response example

```json
{
  "name": "LAN1",
  "macAddress": "00:E0:71:BC:D2:53",
  "state": "Disconnected",
  "isDHCPEnabled": false,
  "ipAddress": "192.168.100.1",
  "subMask": "255.255.0.0",
  "defaultGateway": "",
  "isDNSServerDHCPEnabled": false,
  "dnsServer1": "",
  "dnsServer2": ""
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| name | String | (Required) Network adapter name, valid range: LAN1 or LAN2. |
| macAddress | String | (Required) MAC address |
| state | String | (Required) State, valid range: Connected, Disconnected. |
| isDHCPEnabled | Bool | (Required) Obtain IP address automatically |
| ipAddress | String | (Required) IP address |
| subMask | String | (Required) Subnet mask |
| defaultGateway | String | (Required) Default gateway |
| isDNSServerDHCPEnabled | Bool | (Required) Obtain DNS server address automatically |
| dnsServer1 | String | (Required) Preferred DNS server |
| dnsServer2 | String | (Required) Alternate DNS server |

## 2.10.2.17. wifi - Get wireless network settings {#wifi}

This interface takes no request parameters.

```http
GET /api/gateway/wifi
```

Response example

```json
{
  "wifiName": "myWifi-5G",
  "signalStrength": 99,
  "macAddress": "00:A0:71:BD:E2:63",
  "state": "Connected",
  "isDHCPEnabled": true,
  "ipAddress": "192.168.1.88",
  "subMask": "255.255.255.0",
  "defaultGateway": "192.168.1.1",
  "isDNSServerDHCPEnabled": true,
  "dnsServer1": "192.168.211.1",
  "dnsServer2": "8.8.8.8"
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| wifiName | String | (Required) Wireless network SSID |
| signalStrength | Int32 | Range: 0-100, the higher the value the stronger the signal |
| macAddress | String | (Required) MAC address |
| state | String | (Required) State, valid range: Connected, Disconnected. |
| isDHCPEnabled | Bool | (Required) Obtain IP address automatically |
| ipAddress | String | (Required) IP address |
| subMask | String | (Required) Subnet mask |
| defaultGateway | String | (Required) Default gateway |
| isDNSServerDHCPEnabled | Bool | (Required) Obtain DNS server address automatically |
| dnsServer1 | String | (Required) Preferred DNS server |
| dnsServer2 | String | (Required) Alternate DNS server |

## 2.10.2.18. update-wifi - Update wireless network settings {#update-wifi}

```http
POST /api/gateway/update-wifi
```

Request body example application/json

```json
{
  "isDHCPEnabled": true,
  "ipAddress": "192.168.1.88",
  "subMask": "255.255.255.0",
  "defaultGateway": "192.168.1.1",
  "isDNSServerDHCPEnabled": true,
  "dnsServer1": "192.168.211.1",
  "dnsServer2": "8.8.8.8"
}
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| isDHCPEnabled | Bool | Obtain IP address automatically |
| ipAddress | String | IP address |
| subMask | String | Subnet mask |
| defaultGateway | String | Default gateway |
| isDNSServerDHCPEnabled | Bool | Obtain DNS server address automatically |
| dnsServer1 | String | Preferred DNS server |
| dnsServer2 | String | Alternate DNS server |

Response example

```json
{
  "wifiName": "myWifi-5G",
  "signalStrength": 99,
  "macAddress": "00:A0:71:BD:E2:63",
  "state": "Connected",
  "isDHCPEnabled": true,
  "ipAddress": "192.168.1.88",
  "subMask": "255.255.255.0",
  "defaultGateway": "192.168.1.1",
  "isDNSServerDHCPEnabled": true,
  "dnsServer1": "192.168.211.1",
  "dnsServer2": "8.8.8.8"
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| wifiName | String | (Required) Wireless network SSID |
| signalStrength | Int32 | Range: 0-100, the higher the value the stronger the signal |
| macAddress | String | (Required) MAC address |
| state | String | (Required) State, valid range: Connected, Disconnected. |
| isDHCPEnabled | Bool | (Required) Obtain IP address automatically |
| ipAddress | String | (Required) IP address |
| subMask | String | (Required) Subnet mask |
| defaultGateway | String | (Required) Default gateway |
| isDNSServerDHCPEnabled | Bool | (Required) Obtain DNS server address automatically |
| dnsServer1 | String | (Required) Preferred DNS server |
| dnsServer2 | String | (Required) Alternate DNS server |

## 2.10.2.19. search-wifi - Search for wireless networks {#search-wifi}

This interface takes no request parameters.

```http
GET /api/gateway/search-wifi
```

Response example

```json
[
  {
    "wifiName": "myWifi-5G",
    "signalStrength": 99,
    "state": "Connected"
  },
  {
    "wifiName": "myWifi-2.4G",
    "signalStrength": 99,
    "state": "Disconnected"
  }
]
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| wifiName | String | (Required) Wireless network SSID |
| signalStrength | Int32 | Range: 0-100, the higher the value the stronger the signal |
| state | String | (Required) State, valid range: Connected, Disconnected. |

## 2.10.2.20. connect-wifi - Connect to a wireless network {#connect-wifi}

```http
GET /api/gateway/connect-wifi
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| wifiName | String | (Required) Target wireless network SSID |
| wifiPassword | String | Target wireless network password |

Response example

```json
{
  "errorCode": 0,
  "errorMsg": "Success"
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| errorCode | Int32 | (Required) Error code, 0 indicates success. |
| errorMsg | String | (Required) Error message |

## 2.10.2.21. disconnect-wifi - Disconnect from wireless network {#disconnect-wifi}

This interface takes no request parameters.

```http
GET /api/gateway/disconnect-wifi
```

Response example

```json
{
  "errorCode": 0,
  "errorMsg": "Success"
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| errorCode | Int32 | (Required) Error code, 0 indicates success. |
| errorMsg | String | (Required) Error message |

## 2.10.2.22. static-routing - Get static routing settings {#static-routing}

This interface takes no request parameters.

```http
GET /api/gateway/static-routing
```

Response example

```json
{
  "staticRouting": "0.0.0.0, 0.0.0.0, 192.168.100.1;"
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| staticRouting | Int32 | (Required) Static routing. |

## 2.10.2.23. update-static-routing - Update static routing settings {#update-static-routing}

```http
POST /api/gateway/update-static-routing
```

Request body example application/json

```json
{
  "staticRouting": "0.0.0.0, 0.0.0.0, 192.168.100.1;"
}
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| staticRouting | Int32 | (Required) Static routing. |

Response example

```json
{
  "staticRouting": "0.0.0.0, 0.0.0.0, 192.168.100.1;"
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| staticRouting | Int32 | (Required) Static routing. |

## 2.10.2.24. connect-remote-host - Connect to remote server {#connect-remote-host}

This interface takes no request parameters.

```http
GET /api/gateway/connect-remote-host
```

Response example

```json
{
  "errorCode": 0,
  "errorMsg": "Success"
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| errorCode | Int32 | (Required) Error code, 0 indicates success. |
| errorMsg | String | (Required) Error message |

## 2.10.2.25. disconnect-remote-host - Disconnect from remote server {#disconnect-remote-host}

This interface takes no request parameters.

```http
GET /api/gateway/disconnect-remote-host
```

Response example

```json
{
  "errorCode": 0,
  "errorMsg": "Success"
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| errorCode | Int32 | (Required) Error code, 0 indicates success. |
| errorMsg | String | (Required) Error message |

## 2.10.2.26. file-server-items - Get gateway file server item list {#file-server-items}

Gets the list of files and subdirectories under the root directory of the gateway file server. Subdirectories correspond to machines, named after the machine's IP address. This interface takes no request parameters.

```http
GET /api/gateway/file-server-items
```

Response example

```json
{
  "totalSpace": "10.00 GB",
  "usedSpace": "120 B",
  "files": [
  ],
  "subDirs": [
    {
      "name": "127.0.0.1",
      "size": "20 B",
      "machineName": "1",
      "machineID": "1",
      "ip": "127.0.0.1",
      "status": "Activated"
    },
    {
      "name": "127.0.0.2",
      "size": "100 B",
      "machineName": "2",
      "machineID": "2",
      "ip": "127.0.0.2",
      "status": "Activated"
    }
  ]
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| totalSpace | String | (Required) Total space |
| usedSpace | String | (Required) Used space |
| files | Object[] | (Required) List of files under the root directory, usually empty. |
| subDirs | Object[] | (Required) List of subdirectories under the root directory. |
| name | String | File/directory name |
| size | String | File/directory size |
| machineName | String | Associated machine name |
| machineID | String | Associated machine identifier |
| ip | String | Associated machine IP |
| status | String | Status, valid range: Unlinked, Activated, Unactivated. |

## 2.10.2.27. delete-file-server-item - Delete a gateway file server item {#delete-file-server-item}

Deletes the specified file or subdirectory under the root directory.

```http
GET /api/gateway/delete-file-server-item
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| fileName | String | File name |
| dirName | String | Subdirectory name |

Response example

```json
{
  "errorCode": 0,
  "errorMsg": "Success"
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| errorCode | Int32 | (Required) Error code, 0 indicates success. |
| errorMsg | String | (Required) Error message |
