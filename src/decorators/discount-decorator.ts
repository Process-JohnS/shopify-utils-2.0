
import { DiscountQueryDecorator } from './query-decorators/discount-query-decorator';
import { ShopifyConnector } from '../connectors/shopify-connector';



export class DiscountDecorator extends DiscountQueryDecorator {

  constructor(conn: ShopifyConnector) {
    super(conn);
  }

}
