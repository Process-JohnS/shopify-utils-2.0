
import { ShopifyConnector } from './connectors/shopify-connector';
import { QueryDecorator } from './decorators/query-decorator';
import { DiscountDecorator } from './decorators/discount-decorator';
import { FetchDecorator } from './decorators/fetch-decorator';


const main = async () => {

  let shopifyConnection = new ShopifyConnector({
    shopName: 'helly-hansen-nz.myshopify.com',
    apiKey: '966ba4d2b8bfdc3daec9b41aa512f126',
    password: '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'
  });

  let fetchDecorator = new FetchDecorator(shopifyConnection);
  let resources = await fetchDecorator.getCustomers();
  console.log(resources);

  let queryConnector = new QueryDecorator(shopifyConnection);
  // let discountDecorator = new DiscountDecorator(shopifyConnection);
  // console.log(await discountDecorator.getPriceRules());
  console.log(await queryConnector.countProducts());

}

main().catch(console.error);
