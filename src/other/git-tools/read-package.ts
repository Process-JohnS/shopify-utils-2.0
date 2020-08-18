
import https from 'https';
import { IncomingMessage } from 'http';



const personalAccessToken = '02f30c4c10f1f601503ff29d1279b9b7a009d857';



export const requestPackageJson = (shopName: string) => {
    return new Promise((resolve, reject) => {

        const options = {
            hostname: 'raw.githubusercontent.com',
            path: `/Process-Creative/${shopName.trim()}/master/package.json`,
            headers: { Authorization: `token ${personalAccessToken}` }
        }

        let request = https.get(options, (response) => {

            /* Reject on bad status */
            if (response.statusCode !== 200) {
                reject(new Error(`Bad status: ${response.statusCode} (no package.json or incorrect repo name)`));
            }

            /* Cumulate data */
            let body: IncomingMessage[] = [];
            response.on('data', chunk => body.push(chunk));

            /* Resolve on end */
            response.on('end', () => {
                try {
                    body = JSON.parse(Buffer.concat(<any[]>body).toString());
                } catch (_) {
                    reject(new Error(`Error parsing JSON`));
                }
                resolve(body);
            });
        });

        /* Reject on request error */
        request.on('error', (_) => {
            reject(new Error('Request threw an error'));
        });

        request.end();
    });
}
