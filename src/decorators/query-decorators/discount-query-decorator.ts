import { BaseDecorator } from '../base-decorator';
import { ShopifyConnector } from '../../connectors/shopify-connector';
import Shopify from 'shopify-api-node';


export class DiscountQueryDecorator extends BaseDecorator {

  constructor(conn: ShopifyConnector) {
    super(conn);
  }

  public async getPriceRules(): Promise<Shopify.IPriceRule[]> {
    return await this.fetchResource(this.shop.priceRule);
  }

}
