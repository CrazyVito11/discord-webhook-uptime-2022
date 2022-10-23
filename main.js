const axios = require('axios');
const fs    = require("fs");

const configFile       = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const timeBetweenScans = configFile.seconds_between_scans * 1000;
const domainsToMonitor = configFile.domains;

function sendDomainGoneOfflineNotification(domain, error) {
    const roleMention = domain.roleIdToMention ? `<@&${domain.roleIdToMention}> ` : null;

    axios.post(domain.discordWebhookUrl, {
        content: roleMention,
        embeds: [
            {
                "type": "rich",
                "title": `Domain \"${domain.name}\" is DOWN!`,
                "description": `The following URL returned "${error.code}" when we tried to access it!`,
                "color": 0xff0000,
                "fields": [
                    {
                        "name": `URL`,
                        "value": domain.url
                    },
                    {
                        "name": `Down since`,
                        "value": domain.unavailableStartTimestamp
                    }
                ]
            }
        ]
    })
         .catch(() => {
             console.error(`Unable to trigger the webhook for ${domain.name}`);
         });
}

function sendDomainBackOnlineNotification(domain) {
    const roleMention         = domain.roleIdToMention ? `<@&${domain.roleIdToMention}> ` : null;
    const difference          = Math.abs(new Date() - domain.unavailableStartTimestamp);
    const differenceInMinutes = ((difference / 1000) / 60).toFixed(1);

    axios.post(domain.discordWebhookUrl, {
        content: roleMention,
        embeds: [
            {
                "type": "rich",
                "title": `Domain \"${domain.name}\" is back up!`,
                "description": `The following URL has gone back up and should be accessable again.`,
                "color": 0x00ff00,
                "fields": [
                    {
                        "name": `URL`,
                        "value": domain.url
                    },
                    {
                        "name": `Down for`,
                        "value": `${differenceInMinutes} minute(s)`
                    }
                ]
            }
        ]
    })
         .catch(() => {
             console.error(`Unable to trigger the webhook for ${domain.name}`);
         });
}

setInterval(() => {
    console.log("Checking domains...");

    domainsToMonitor.forEach((domain) => {
        console.log(`Checking domain ${domain.name} (${domain.url})...`);
        axios.get(domain.url)
             .then(() => {
                 if (!domain.unavailableStartTimestamp) {
                     // We have already notified that the domain is back, ignore

                     return;
                 }

                 console.log(`Domain "${domain.url}" is back up!`);

                 sendDomainBackOnlineNotification(domain);
                 domain.unavailableStartTimestamp = null;
             })
             .catch((error) => {
                 if (domain.unavailableStartTimestamp) {
                     // We have already notified that the domain is down, ignore

                     console.log(`Domain "${domain.url}" is still down!`);

                     return;
                 }

                 console.log(`Domain "${domain.url}" has gone down!`);

                 domain.unavailableStartTimestamp = new Date();

                 sendDomainGoneOfflineNotification(domain, error);
             });
    });
}, timeBetweenScans);