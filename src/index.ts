
import { ShopifyConnector } from './connectors/shopify-connector';
import { QueryDecorator } from './decorators/query-decorator';
import { FetchDecorator } from './decorators/fetch-decorator';

import { CustomComponent } from './resource-components/custom-component';
import { ResourceIterator } from './iterators/iterator';


import { cloneRepo, createDeployFile, DeployType, DeployParams } from './other/git-tools/clone-repo';


import { requestPackageJson } from './other/git-tools/read-package';


const createComponents = () => {
  let components = [];
  for (let i = 0; i < 200; i++) {
    components.push(new CustomComponent(i.toString()));
  }
  return components;
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

  // process.exit();

  let queryConnector = new QueryDecorator(shopifyConnection);
  // let discountDecorator = new DiscountDecorator(shopifyConnection);
  // console.log(await discountDecorator.getPriceRules());
  console.log(await queryConnector.countProducts());





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


  // try {
  //   let result = await promise;
  //   console.log(result);
  // } catch (e) {
  //   console.error(e.message);
  // }


  // let repo = await cloneRepo('Steele');
  // createDeployFile(DeployType.ENV, <DeployParams>{
  //   shopName: 'Steele',
  //   shopPassword: 'XXX',
  //   themeId: 'XXX'
  // })
  // console.log(repo);


  try {
    let packageJson = await requestPackageJson('steele');
    console.log(packageJson);
  }
  catch (e) {
    console.error(e.message);
  }



}

main().catch(console.error);
