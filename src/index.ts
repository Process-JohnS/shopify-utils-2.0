
import { ShopifyConnector } from './connectors/shopify-connector';
import { QueryDecorator } from './decorators/query-decorator';
import { FetchDecorator } from './decorators/fetch-decorator';

import { CustomComponent } from './resource-components/custom-component';
import { ResourceIterator } from './iterators/iterator';


import { cloneRepo, createDeployFile, DeployType, DeployParams } from './other/git-tools/clone-repo';
import { SlateVersion } from './other/git-tools/read-package';


import { getPackageJson, getSlateVersion } from './other/git-tools/read-package';


const createComponents = () => {
  let components = [];
  for (let i = 0; i < 200; i++) {
    components.push(new CustomComponent(i.toString()));
  }
  return components;
}



const readAndClone = async () => {

  try {

    const storeName = 'O-M';
    let packageJson = await getPackageJson(storeName);
    let slateVersion = getSlateVersion(packageJson);
    console.log(slateVersion);

    await cloneRepo(storeName);
    const storeCredentials = {
      shopName: storeName,
      shopPassword: 'XXX',
      themeId: 'XXX'
    };
    if (slateVersion == SlateVersion.V0) {
      createDeployFile(DeployType.YML, storeCredentials);
    } else if (slateVersion == SlateVersion.V1) {
      createDeployFile(DeployType.ENV, storeCredentials);
    }
  }
  catch (e) {
    console.error(e.message);
  }

}



const burstUploaderDemo = async () => {
  /* Burst Uploader Code */

  let components = createComponents();
  let iter = new ResourceIterator<CustomComponent>(components);


  let promise = new Promise((resolve) => {

    let doCallBurst = () => {
      for (let i = 0; i < 10; i++) {

        let next = iter.next();
        let component = <CustomComponent>next.value;
        let done = next.done;

        if (done) return resolve('Done');

        console.log(component);
      }
    }

    for (let i = 0; i < 50; i++) doCallBurst();
  });


  try {
    let result = await promise;
    console.log(result);
  } catch (e) {
    console.error(e.message);
  }


}




const main = async () => {


  let shopifyConnection = new ShopifyConnector({
    shopName: 'helly-hansen-nz.myshopify.com',
    apiKey: '966ba4d2b8bfdc3daec9b41aa512f126',
    password: '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'
  });

  let fetchDecorator = new FetchDecorator(shopifyConnection);
  let resources = await fetchDecorator.getProducts();
  console.log(resources.length);


  let queryConnector = new QueryDecorator(shopifyConnection);
  // let discountDecorator = new DiscountDecorator(shopifyConnection);
  // console.log(await discountDecorator.getPriceRules());
  console.log(await queryConnector.countProducts());



}

main().catch(console.error);
