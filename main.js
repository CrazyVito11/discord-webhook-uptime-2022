import axios from 'axios';
import fs from 'fs';
import { outputDomainsAsList } from './helper/outputHelper.js';
import { sendDomainGoneOfflineNotification, sendDomainBackOnlineNotification } from './helper/notificationHelper.js';

console.log(`⚙️  Reading the config file...`);
const configFile       = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const timeBetweenScans = configFile.seconds_between_scans * 1000;
const domainsToMonitor = configFile.domains.map((domain) => ({ ...domain, isDown: false, failedScanCount: 0 }));

console.log(`🚀 We will check ${domainsToMonitor.length} domain(s) every ${configFile.seconds_between_scans} second(s)`);

outputDomainsAsList(domainsToMonitor);
console.log(`\n-----------------------------------------------\n`);

setInterval(() => {
    console.log("\n🔍 Checking all the domains...");

    domainsToMonitor.forEach((domain) => {
        console.log(`  🔍 Checking domain "${domain.name}" (${domain.url})...`);
        axios.get(domain.url)
             .then(() => {
                 if (!domain.isDown && domain.failedScanCount === 0) {
                     // We have already notified that the domain is back, ignore
                     console.log(`  ✅ Domain "${domain.name}" (${domain.url}) is still available`);

                     return;
                 }

                 if (!domain.isDown && domain.failedScanCount > 0) {
                     // The domain is back up, but we didn't send the "domain down" notification yet
                     console.log(`  ℹ️ Domain "${domain.name}" (${domain.url}) is back up, but the failed count only hit ${domain.failedScanCount} failed attempt(s)`);

                     domain.failedScanCount = 0;

                     return;
                 }

                 console.log(`  🥳 Domain "${domain.name}" (${domain.url}) is back up!`);

                 sendDomainBackOnlineNotification(domain);

                 domain.isDown = false;
                 domain.failedScanCount = 0;
                 domain.unavailableStartTimestamp = null;
             })
             .catch((error) => {
                 domain.failedScanCount++;

                 if (domain.isDown) {
                     // We have already notified that the domain is down, ignore

                     console.log(`  ❌ Domain "${domain.name}" (${domain.url}) is still down! Currently at ${domain.failedScanCount} failed attempt(s)`);

                     return;
                 }

                 if (domain.failedScanCount >= domain.failedScanCountUntilNotification) {
                     console.log(`  ❌ Domain "${domain.name}" (${domain.url}) has reached the failed count threshold, sending notification...`);

                     domain.unavailableStartTimestamp = new Date();
                     domain.isDown = true;

                     sendDomainGoneOfflineNotification(domain, error);

                     return;
                 }

                 console.log(`  ⚠️ Domain "${domain.url}" seems down, currently at ${domain.failedScanCount} failed attempt(s)`);
             });
    });
}, timeBetweenScans);