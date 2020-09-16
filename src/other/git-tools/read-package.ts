
import https from 'https';
import { IncomingMessage } from 'http';
import { personalAccessToken } from './../../config';


export enum SlateVersion {
    V0 = 'Slate v0',
    V1 = 'Slate v1',
    V2 = 'Slate v2'
}


export const getSlateVersion = (packageJson: any) => {
    const SHOPIFY_SLATE_TOOLS = '@shopify/slate-tools';
    const SHOPIFY_SLATE = '@shopify/slate';
    const PC_SLATE_TOOLS = '@process-creative/slate-tools';

    let dependencies = 'dependencies' in packageJson ? packageJson['dependencies'] : undefined;
    let devDependencies = 'devDependencies' in packageJson ? packageJson['devDependencies'] : undefined;
    let version = 'version' in packageJson ? packageJson['version'] : undefined;

    /* Slate v0 */
    if ((version && version == '0.0.1') ||
        (dependencies && SHOPIFY_SLATE_TOOLS in dependencies && dependencies[SHOPIFY_SLATE_TOOLS].substring(0, 2) == '^0') ||
        (devDependencies && SHOPIFY_SLATE_TOOLS in devDependencies && devDependencies[SHOPIFY_SLATE_TOOLS].substring(0, 2) == '^0') ||
        (dependencies && SHOPIFY_SLATE in dependencies && dependencies[SHOPIFY_SLATE].substring(0, 2) == '^0') ||
        (devDependencies && SHOPIFY_SLATE in devDependencies && devDependencies[SHOPIFY_SLATE].substring(0, 2) == '^0')
    ) return SlateVersion.V0;

    /* Slate v1 */
    if ((dependencies && SHOPIFY_SLATE_TOOLS in dependencies && dependencies[SHOPIFY_SLATE_TOOLS].substring(0, 2) == '^1') ||
        (devDependencies && SHOPIFY_SLATE_TOOLS in devDependencies && devDependencies[SHOPIFY_SLATE_TOOLS].substring(0, 2) == '^1')
    ) return SlateVersion.V1;

    /* Slate v2 */
    if ((dependencies && PC_SLATE_TOOLS in dependencies && dependencies[PC_SLATE_TOOLS].substring(0, 2) == '^2') ||
    (devDependencies && PC_SLATE_TOOLS in devDependencies && devDependencies[PC_SLATE_TOOLS].substring(0, 2) == '^2')
    ) return SlateVersion.V2;
}


export const getPackageJson = (shopName: string) => {
    const HOST_NAME = 'raw.githubusercontent.com';
    const PACKAGE_PATH = `/Process-Creative/${shopName.trim()}/master/package.json`;
    const AUTH = `token ${personalAccessToken}`;

    return new Promise((resolve, reject) => {
        const options = {
            hostname: HOST_NAME,
            path: PACKAGE_PATH,
            headers: { Authorization: AUTH }
        }

        let request = https.get(options, (response) => {

            /* Reject on bad status */
            if (response.statusCode !== 200) {
                reject(new Error(`Bad status: ${response.statusCode} - no package.json (themeKit) incorrect repo name, or access token revoked`));
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
