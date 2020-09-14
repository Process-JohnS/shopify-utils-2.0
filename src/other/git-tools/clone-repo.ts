
import { Clone, Cred, Repository } from 'nodegit';
import * as fs from 'fs-extra';
import { existsSync } from 'fs-extra';


const username = 'Process-JohnS';
const password = 'nrR?Hrx3*CP4';

const protocol = 'https';
const gitDomain = 'github.com';
const gitOwner = 'Process-Creative';


export enum DeployType {
  YML = 'config.yml',
  ENV = '.env'
};

export type DeployParams = {
  shopName: string,
  shopPassword: string,
  themeId: string
};


export const cloneRepo = async (repoName: string) => {
  let repo: Repository;

  if (fs.existsSync(repoName)) {
    console.error('Clone directory already exists');
    return repo;
  }

  const cloneOptions = {
    fetchOpts: { callbacks: {
        credentials: () => Cred.userpassPlaintextNew(username, password)
    }}
  };

  let gitUrl = `${protocol}://${gitDomain}/${gitOwner}/${repoName}.git`;

  try {
    repo = await Clone.clone(gitUrl, repoName, cloneOptions);
    console.log(`${repoName} cloned`);
  }
  catch (e) {
    if (e.errno === -4) console.error(`Error: Output directory ${repoName} already exists`);
    else if (e.errno === -1) console.error(`Error: Remote authentication required`);
    else console.error(e);
  }

  return repo;
}


export const createDeployFile = (type: DeployType, { shopName, shopPassword, themeId }: DeployParams): void => {
  let deployFileContents: string;

  switch (type) {

    /* .env */
    case DeployType.ENV:
      deployFileContents =
      `SLATE_STORE=${shopName}.myshopify.com\n` +
      `SLATE_PASSWORD=${shopPassword}\n` +
      `SLATE_THEME_ID=${themeId}\n` +
      `SLATE_IGNORE_FILES=src/config/settings_data.json\n`;
      break;

    /* config.yml*/
    case DeployType.YML:
      deployFileContents =
      `development:\n` +
      `  password: ${shopPassword}\n` +
      `  theme_id: ${themeId}\n` +
      `  store: ${shopName}.myshopify.com\n` +
      `ignore_files:\n` +
      `    - settings_data.json\n`
      break;

    default:
      console.log('Error: Unknown deploy type');
      return;
  }

  let deployFilePath = `${shopName}/${type}`;

  if (!existsSync(deployFilePath)) {
    fs.writeFileSync(deployFilePath, deployFileContents);
    console.log(`${type} file created successfully`);
  } else {
    console.error(`Error: ${type} file already exists`);
  }

}
