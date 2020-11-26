const catalyst = require("zcatalyst-sdk-node");
const { getDataFromDb, downloadFile } = require("../utils/utils");
const tableName = "Products";
const columnName = "Name";
const columnPrice = "Price";
const columnImageId = "ImageId";
const coloumnRowId = "ROWID";

const handleProducts = async (req, res) => {
  let catalystApp = catalyst.initialize(req);
  getProducts(catalystApp)
    .then((resObj) => {
      res.status(200).send(resObj);
    })
    .catch((err) => {
      console.log(err);
      let errObj = err.message
        ? err
        : {
            message: "Unauthorized request",
          };
      res.status(400).send(errObj);
    });
};
const getProducts = async (catalystApp) => {
  let query = `Select ${columnName}, ${columnPrice},${columnImageId}, ${coloumnRowId} from ${tableName} `;
  let productsArr = await getDataFromDb(catalystApp, query);
  if (productsArr.length === 0) {
    return Promise.reject({ message: "No Products Found " });
  }
  let products = arrayObj(productsArr);

  return { products };
};

const arrayObj = (list = []) => {
  let listArr = [];
  for (let i = 0; i < list.length; i++) {
    let obj = list[i].Products;
    listArr.push(obj);
  }
  return listArr;
};
const modifiedList = async (list = [], catalystApp) => {
  let products = await Promise.all(
    list.map(async (product) => {
      let fileId = Number(product.ImageId);
      let fileObj = await downloadFile(catalystApp, fileId, folderId);
      product.ImageId = fileObj.toString();
      return product;
    })
  );
  return products;
};
module.exports = handleProducts;
