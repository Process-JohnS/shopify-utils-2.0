// import { connectToShopify } from './connections';
// import config from './config';
import fs from 'fs';


const wait = (ms) => {
  let start = new Date().getTime(), end = start;
  while (end < start + ms) end = new Date().getTime();
};

const shop = connectToShopify(config['slh-au'].shopify);
shop.on('callLimits', e => console.log(e));


let splitCSVButIgnoreCommasInDoublequotes = (str) => {
  //split the str first
  //then merge the elments between two double quotes
  var delimiter = ',';
  var quotes = '"';
  var elements = str.split(delimiter);
  var newElements = [];
  for (var i = 0; i < elements.length; ++i) {
      if (elements[i].indexOf(quotes) >= 0) {//the left double quotes is found
          var indexOfRightQuotes = -1;
          var tmp = elements[i];
          //find the right double quotes
          for (var j = i + 1; j < elements.length; ++j) {
              if (elements[j].indexOf(quotes) >= 0) {
                  indexOfRightQuotes = j;
                  break;
              }
          }
          //found the right double quotes
          //merge all the elements between double quotes
          if (-1 != indexOfRightQuotes) {
              for (var j = i + 1; j <= indexOfRightQuotes; ++j) {
                  tmp = tmp + delimiter + elements[j];
              }
              tmp = tmp.replace(/"/g, '');
              newElements.push(tmp);
              i = indexOfRightQuotes;
          }
          else { //right double quotes is not found
              newElements.push(elements[i]);
          }
      }
      else {//no left double quotes is found
          newElements.push(elements[i]);
      }  
  }  

  return newElements;
}



let getProductDataFromCSV = (inputPath) => {
  console.log('Reading csv...');
  let fileData = fs.readFileSync(inputPath, 'utf8');
  let fileRows = fileData.split('\n').map(line => line.trim());

  let headers = [];
  let productData = [];

  for (let i = 0; i < fileRows.length; i++) {
    let line = splitCSVButIgnoreCommasInDoublequotes(fileRows[i]).map(x => x.trim());

    if (i == 0) headers = line;
    else {
      let product = {};
      for (let i = 0; i < line.length; i++) {
        let value = line[i];
        let headerTitle = headers[i];
        if (headerTitle == 'height' ||
            headerTitle == 'width' ||
            headerTitle == 'length') {
          value = parseInt(value);
        }
        product[headerTitle] = value;
      }
      productData.push(product);
    }
  }

  return productData;
}


const getAllVariants = async () => {

  /* Get all current products */
  console.log('Getting current products...');

  let params = { limit: 250 };
  let products = [];

  while (typeof params !== typeof undefined) {
    let productBatch = await shop.product.list(params);
    products.push(...productBatch);
    params = productBatch.nextPageParameters;
  }

  let variantDict = {};

  for (let product of products) {
    let firstVariant = product.variants[0];
    let { id, sku, product_id } = firstVariant;
    variantDict[sku] = { id, product_id };
  }

  return variantDict;
}


const getProductMetafields = async (productID) => {
  return await shop
    .metafield
    .list({
      metafield: { owner_resource: 'product', owner_id: productID }
    });
}


const listProductMetafields = async (productID) => {
  console.log(`Getting metafields for ${productID}...`);

  let metafields = await getProductMetafields(productID);
  metafields = metafields.map(({ id, namespace, key, value }) => ({ id, namespace, key, value }));

  if (metafields.length > 0) {
    console.log('\n');
    for (const m of metafields) {
      console.log(m);
      console.log('\n');
    }
  }
  else console.log('No metafields.');
}


const getArticleMetafields = async (articleID) => {
  return await shop
    .metafield
    .list({
      metafield: { owner_resource: 'article', owner_id: articleID }
    });
}

const listArticleMetafields = async (articleID) => {
  console.log(`Getting metafields for ${articleID}...`);

  let metafields = await getArticleMetafields(articleID);
  metafields = metafields.map(({ id, namespace, key, value }) => ({ id, namespace, key, value }));

  if (metafields.length > 0) {
    console.log('\n');
    for (const m of metafields) {
      console.log(m);
      console.log('\n');
    }
  }
  else console.log('No metafields.');
}


const createProductMetafield = async (productID, data) => {
  let { key, value, namespace, valueType } = data;
  console.log(`Creating metafield ${key} for product ${productID}...`);
  console.log(data);
  try {
    await shop.metafield.create({
      key: key,
      value: value,
      namespace: namespace,
      value_type: valueType, // string, integer
      owner_resource: 'product',
      owner_id: productID
    });
    console.log('Metafield created.');
  } catch (e) {
    console.error(`Metafield ${key} for product ${productID} could not be created`);
    console.log(value);
    console.error(e);
  }
}


const deleteMetafields = async (metafieldIDs) => {

  for (let metafieldID of metafieldIDs) {
    try {
      await shop.metafield.delete(metafieldID);
      console.log(`Deleted metafield ${metafieldID}.`);
    } catch (_) {
      console.error(`Could not delete metafield ${metafieldID} - does not exist.`);
    }
  }

}


const deleteAllProductMetafields = async (productID) => {

  let metafields = await getProductMetafields(productID);
  let metafieldIDs = metafields.map(({ id }) => id);
  await deleteMetafields(metafieldIDs);

}


const createSLHMetafields = async (productID, data) => {

  let { dimensions } = data;

  let values = [];
  for (let dimension of dimensions) {
    let { webDimensions, height, width, length, cubicMeters } = dimension;
    console.log(dimension);
    values.push(`${webDimensions}\r\nHeight (cm): ${height}\r\nWidth (cm): ${width}\r\nLength (cm): ${length}\r\nCubic Meters: ${cubicMeters}`);
  }

  console.log('Creating metafields for values:');
  console.log(values);

  // Dimensions
  await createProductMetafield(productID, {
    key: 'dimensions',
    value: JSON.stringify(values),
    namespace: 'product-description',
    valueType: 'json_string'
  });

  return;

  // Dimensions
  await createProductMetafield(productID, {
    key: 'web_dimensions',
    value: webDimensions,
    namespace: 'product-description',
    valueType: 'string'
  });
  // Height
  await createProductMetafield(productID, {
    key: 'height',
    value: height,
    namespace: 'product-description',
    valueType: 'integer'
  });
  // Width
  await createProductMetafield(productID, {
    key: 'width',
    value: width,
    namespace: 'product-description',
    valueType: 'integer'
  });
  // Length
  await createProductMetafield(productID, {
    key: 'length',
    value: length,
    namespace: 'product-description',
    valueType: 'integer'
  });
  // Cubic Meters
  await createProductMetafield(productID, {
    key: 'cubic_meters',
    value: cubicMeters,
    namespace: 'product-description',
    valueType: 'string'
  });
  // Flat Pack
  await createProductMetafield(productID, {
    key: 'flat_pack',
    value: flatPack,
    namespace: 'product-description',
    valueType: 'string'
  });

}


const getProduct = async (productID) => {
  return await shop.product.get(productID);
}


const addProductTags = async (productID, newTags) => {
  newTags = newTags.map(tag => tag.trim());
  for (const newTag of newTags) {
    await addProductTag(productID, newTag);
  }
}


const addProductTag = async (productID, newTag) => {

  let product = await getProduct(productID);
  let tags = product.tags.split(',').map(tag => tag.trim());

  let params = {
    tags: [...tags, newTag]
  };

  try {
    console.log(`Adding tag ${newTag} to product ${productID}`);
    await shop.product.update(productID, params);
    console.log('Tag added.');
  } catch (e) {
    console.error(`Could not add tag for product ${productID}`);
    console.error(e);
  }

}


const updateDescription = async (productID, description) => {
  try {
    console.log(`Updating product ${productID} description`);
    await shop.product.update(productID, {
      body_html: description
    });
    console.log('Done.');
  } catch (e) {
    console.error(`Could not update description for product ${productID}`);
  }
}



(async () => {


  console.log('one');

  let metafields = await getProductMetafields(4672078348387);
  console.log(metafields);

  process.exit();




  let updatedCount = 0;

  let variantDict = await getAllVariants();
  console.log(variantDict);

  let cin7Products = getProductDataFromCSV('src/SLH_Products.csv');
  console.log(cin7Products);

  // process.exit();

  let productCount = await shop.product.count();
  console.log(productCount);


  // Update a single product
  // await deleteAllProductMetafields(4673321205859);
  /*
  await createSLHMetafields(4673321205859, {

      dimensions: [
        {
          webDimensions: 'W 130 x D 130 x H 46',
          height: 46,
          width: 130,
          length: 130,
          cubicMeters: '0.93'
        },
        {
          webDimensions: 'W 130 x D 130 x H 46',
          height: 46,
          width: 130,
          length: 130,
          cubicMeters: '0.93'
        }
      ]

  });
  */





  // process.exit();


  // Loop through all Cin7 products
  let index = 0;
  for (let c7p of cin7Products) {

    if (index >= 100) {
      console.log('Waiting...');
      wait(30000);
      index = 0;
    }

    // Variant lookup
    let variant = variantDict[c7p.code];

    // If variant is in Shopify
    if (variant != undefined) {
      let productID = variant.product_id;
      let { description, style_code, cubic_meters, height, length, width, web_dimensions, flat_pack } = c7p;
      console.log(`\n${updatedCount} of ${productCount} - ${c7p.code} is from product ${productID}.`);

      // Delete all metafields
      // await deleteAllProductMetafields(productID);

      // Add style code and categories as tags
      // let { category, sub_category, tier_3_category } = c7p;
      // let categoryTags = [category, sub_category, tier_3_category].filter(Boolean);
      // await addProductTags(productID, [style_code, ...categoryTags]);

      // Create SLH product metafields - OLD
      // await createSLHMetafields(productID, {
      //   webDimensions: web_dimensions,
      //   height: height,
      //   width: width,
      //   length: length,
      //   cubicMeters: cubic_meters,
      //   flatPack: flat_pack
      // });


      // Create SLH product metafields - NEW
      await createSLHMetafields(productID, {
        dimensions: [
          {
            webDimensions: web_dimensions,
            height: height,
            width: width,
            length: length,
            cubicMeters: cubic_meters
          }
        ]
      });


      // Update product description
      // await updateDescription(productID, description);
      // console.log(`Description fields for product ${productID} added.`);
      updatedCount++;

      // Only update the wait index if calls to Shopify happenned
      index++;
    }

  }

  console.log(`\n${updatedCount} products have been updated.\n`);

  process.exit();

  const productID = 4668892708963;

  // Style Code
  await addProductTags(productID, ['Framed Art']);
  // process.exit();

  /* Delete all product metafields */
  await deleteAllProductMetafields(productID);
  // process.exit();

  /* Create SLH product metafields */
  await createSLHMetafields(productID, {
    webDimensions: '140 x 4 x 100',
    width: 140,
    width: 4,
    length: 100,
    cubicMeters: '0.119999',
  });

  /* List product metafields */
  await listProductMetafields(productID);

})().catch(console.error);
