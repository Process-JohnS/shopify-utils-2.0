
import { BaseDecorator } from './base-decorator';
import { ShopifyConnector } from '../connectors/shopify-connector';



export class FetchDecorator extends BaseDecorator {

  constructor(conn: ShopifyConnector) {
    super(conn);
  }

  /**
   * Public Methods
   */
  public async getProducts(params?: any): Promise<any[]> {
    return await this.fetchResource(this.shop.product, params);
  }
  public async getCustomers(params?: any): Promise<any[]> {
    return await this.fetchResource(this.shop.customer, params);
  }
  public async getOrders(params?: any): Promise<any[]> {
    return await this.fetchResource(this.shop.order, params);
  }

}
