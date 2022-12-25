# discord-webhook-uptime-2022
A simple NodeJS application that can monitor one or multiple domains to see if the service is down, and send a notification on Discord to let you know of the incident.

## Config parameters
These are all the parameters that can be configured inside the `config.json` file.
An example is also available, see `config.json.example` for a working example.

> ### `seconds_between_scans`
> - **Required**: ✅
> - **Example value**: `60`
> - **Description**: This determines how long we should wait between each scan in seconds of all the domains.
> 
> ### `domains`
> - **Required**: ✅
> - **Example value**: `[]`
> - **Description**: The list of domains we need to monitor. Each domain is expected to be provided in a specific format, so please check all the `domains[]` parameters to see what data you need to provide.
> 
> ### `domains[].name`
> - **Required**: ✅
> - **Example value**: `"Google"`
> - **Description**: The name of the domain/service that you are monitoring, it's pretty much a label that you can use to indicate what this domain/service is exactly.
> 
> ### `domains[].url`
> - **Required**: ✅
> - **Example value**: `"https://google.com/"`
> - **Description**: The URL of the domain we need to ping, as long as we don't receive a 4XX or 5XX or any network error on that URL, we mark it as available.
> 
> ### `domains[].discordWebhookUrl`
> - **Required**: ✅
> - **Example value**: `"https://discord.com/api/webhooks/XXXXXXXXXXXXXXXXXXX/XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"`
> - **Description**: The Discord webhook URL we need to trigger once a domain has been marked as unavailable.
> 
> ### `domains[].failedScanCountUntilNotification`
> - **Required**: ✅
> - **Example value**: `3`
> - **Description**: The amount of times the check needs to fail in a row before we mark the domain as unavailable.
> 
> ### `domains[].roleIdToMention`
> - **Required**: ❌
> - **Example value**: `"1033772800198070345"`
> - **Description**: The ID of the role you want to mention inside the uptime notification for that domain. Can be left omitted or set to `null` if you do not need this. 

## Example service
**discord-webhook-uptime-2022.service**
```
[Unit]
After=network-online.target
Wants=network-online.target systemd-networkd-wait-online.service
Description="Service to launch the discord-webhook-uptime application to monitor specific URLs"

StartLimitIntervalSec=300
StartLimitBurst=5


[Service]
WorkingDirectory=/home/pi/projects/discord-webhook-uptime-2022/
ExecStartPre=/bin/bash -c 'until host discord.com; do sleep 1; done; sleep 10'
ExecStart=/home/pi/projects/discord-webhook-uptime-2022/start_service.sh
Restart=on-failure
RestartSec=10s

[Install]
WantedBy=default.target
```

**start_service.sh**
```shell
#!/bin/bash
echo "Changing node version with NVM..."
. /home/pi/.nvm/nvm.sh;
nvm use
echo "Starting script..."
node main.js
```