
export function outputArrayAsList(listName, listItems) {
    console.log(`🗐 ${listName}`);
    listItems.forEach((item, index, list) => {
        let prefix = '  |─';

        if (index === list.length - 1) {
            prefix = `  +─`;
        }

        console.log(`${prefix} ${item}`);
    });
}

export function outputDomainsAsList(domains) {
    outputArrayAsList("Domain list", domains.map((domain) => `"${domain.name}" (${domain.url})`));
}
