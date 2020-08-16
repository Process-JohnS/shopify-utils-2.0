
import { BaseDecorator } from './base-decorator';
import { ShopifyConnector } from '../connectors/shopify-connector';
import { wait } from './../utils/utils';


export class QueryDecorator extends BaseDecorator {

  constructor(conn: ShopifyConnector) {
    super(conn);
  }

  /**
   * Public Methods
   */
  public async countProducts(): Promise<number> {
    return await this.countResource(this.shop.product);
  }
  public async countCustomers(): Promise<number> {
    return await this.countResource(this.shop.customer);
  }
  public async countOrders(): Promise<number> {
    return await this.countResource(this.shop.order);
  }
  public async getCallLimit(): Promise<number> {
    let callLimit: number;
    (<any>this.shop).once('callLimits', ({ max }) => callLimit = max);
    await this.countCustomers();
    while (!callLimit) wait(ShopifyConnector.callLimitPollDelayMillis);
    return callLimit;
  }

}
