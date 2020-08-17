
import Shopify from 'shopify-api-node';
import { ShopifyConnector } from '../connectors/shopify-connector';




export class BaseDecorator {
  protected shop: Shopify = null;
  protected fetchLimit: number = 250;

  constructor(connector: ShopifyConnector) {
    this.shop = connector.getConnection();
  }

  protected async fetchResource(call: any, params: any): Promise<any[]> {
    let resourceList = [];
    try {
      const resourceCount = await this.shop.product.count();
      for (let page = 1; page <= Math.ceil(resourceCount / this.fetchLimit); page++) {
        let resourceBatch = await call.list({ ...params, limit: this.fetchLimit, page });
        resourceList.push(...resourceBatch);
      }
    } catch (err) {
      if (err.name == 'HTTPError') {
        console.error(`Fetch error: ${err.name}`);
      }
    }
    return resourceList;
  }

  protected async countResource(call: any): Promise<number> {
    let resourceCount: number = undefined;
    try {
      resourceCount = await call.count();
    } catch (err) {
      if (err.name == 'HTTPError') {
        console.error(`Count error: ${err.name}`);
      }
    }
    return resourceCount;
  }

}
