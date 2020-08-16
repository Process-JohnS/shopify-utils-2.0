
import Shopify from 'shopify-api-node';
import { Connector } from './connector';


export class ShopifyConnector implements Connector<Shopify> {

  static readonly callLimitPollDelayMillis: number = 500;
  static readonly pollDelayMillis: number = 3000;
  conn: Shopify;

  constructor({ shopName, apiKey, password }: { shopName: string; apiKey: string; password: string; }) {
    this.conn = new Shopify({ shopName, apiKey, password });
  }

  public getConnection() {
    return this.conn;
  }

}
