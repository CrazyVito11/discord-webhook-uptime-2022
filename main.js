import axios from 'axios';
import fs from 'fs';
import { sendDomainGoneOfflineNotification, sendDomainBackOnlineNotification } from './helper/notificationHelper.js';

console.log(`⚙️  Reading the config file...`);
const configFile       = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const timeBetweenScans = configFile.seconds_between_scans * 1000;
const domainsToMonitor = configFile.domains.map((domain) => ({ ...domain, isDown: false, failedScanCount: 0 }));

console.log(`🚀 We will check ${domainsToMonitor.length} domain(s) every ${configFile.seconds_between_scans} second(s)\n-----------------------------------------------\n`);

setInterval(() => {
    console.log("\n🔍 Checking all the domains...");

    domainsToMonitor.forEach((domain) => {
        console.log(`   🔍 Checking domain ${domain.name} (${domain.url})...`);
        axios.get(domain.url)
             .then(() => {
                 if (!domain.isDown) {
                     // We have already notified that the domain is back, ignore
                     console.log(`  ✅ Domain "${domain.url}" is still available`);

                     return;
                 }

                 console.log(`  🥳 Domain "${domain.url}" is back up!`);

                 sendDomainBackOnlineNotification(domain);

                 domain.isDown = false;
                 domain.failedScanCount = 0;
                 domain.unavailableStartTimestamp = null;
             })
             .catch((error) => {
                 domain.failedScanCount++;

                 if (domain.isDown) {
                     // We have already notified that the domain is down, ignore

                     console.log(`  ❌ Domain "${domain.url}" is still down! Currently at ${domain.failedScanCount} failed attempt(s)`);

                     return;
                 }

                 if (domain.failedScanCount >= domain.failedScanCountUntilNotification) {
                     console.log(`  ❌ Domain "${domain.url}" has reached the failed count threshold, sending notification...`);

                     domain.unavailableStartTimestamp = new Date();
                     domain.isDown = true;

                     sendDomainGoneOfflineNotification(domain, error);

                     return;
                 }

                 console.log(`  ⚠️Domain "${domain.url}" seems down, currently at ${domain.failedScanCount} failed attempt(s)`);
             });
    });
}, timeBetweenScans);