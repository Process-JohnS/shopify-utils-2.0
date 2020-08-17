
import shopify from 'shopify-api-node';


const wait = (x: any) => {};
const config = {};
const connectToShopify = (x: any) => {};


export class DiscountManager {
  _shop: any;

  constructor(shop) {
    this._shop = shop;
  }


  /* Price Rule - Queries */

  getPriceRules = async () => await this._shop.priceRule.list();
  countPriceRules = async () => (await this._shop.priceRule.list()).length;


  /* Price Rule - Actions */

  createPriceRule = async (priceRuleParams) => {
    console.log('Creating price rule...');
    let priceRule = await this._shop.priceRule.create(priceRuleParams);
    console.log('Done.');
    return {
      addDiscountCodes: async (discountCodes) => {
        console.log(discountCodes);
        console.log(`Creating ${discountCodes.length} discounts for price rule ${priceRule.id}...`);

        let discountErrors = [];
        let resetIndex = 0;
        for (let discountCode of discountCodes) {
          /* Wait for call limit to reset */
          if (resetIndex >= 50) {
            console.log('Waiting...');
            wait(30000);
            resetIndex = 0;
          }
          try {
            console.log(`Creating code ${discountCode}...`);
            await this._shop.discountCode.create(priceRule.id, { code: discountCode });
            console.log('Done.');
            resetIndex++;
          } catch (e) {
            console.error(`Error - Skipping ${discountCode}`);
            discountErrors.push(discountCode);
          }
        }
        console.log(`Discount codes created for price rule ${priceRule.id}.`);
        if (discountErrors.length > 0) {
          console.log('Errors:');
          console.log(discountErrors);
        }
      }
    };
  }

  deletePriceRule = async (priceRuleId) => {
    await this._shop.priceRule.delete(priceRuleId);
  }

  deleteAllPriceRules = async () => {
    let priceRules = await this.getPriceRules();
    if (priceRules.length <= 0) {
      console.log('No price rules to delete.');
      return;
    }
    let multiplePriceRules = priceRules.length > 1;
    console.log(`Deleting ${priceRules.length} price rule${multiplePriceRules ? 's' : ''}...`);
    for (let priceRule of priceRules) {
      this.deletePriceRule(priceRule.id);
    }
    console.log('Done.');
  }

}


const main = async () => {

  let shop = connectToShopify(config['johns-sandbox-store'].shopify);
  let discountManager = new DiscountManager(shop);


  await discountManager.deleteAllPriceRules();


  /* Create a price rule with discount codes */
  await (await discountManager.createPriceRule({
    title: '15OFF',
    target_type: 'line_item',
    target_selection: 'all',
    allocation_method: 'across',
    value_type: 'percentage',
    value: '-15.0',
    usage_limit: 1,
    customer_selection: 'all',
    starts_at: new Date()
  }))
  .addDiscountCodes([
    'ABC123',
    'DEF456',
    'GHI789'
  ]);


}


main().catch(console.error);
