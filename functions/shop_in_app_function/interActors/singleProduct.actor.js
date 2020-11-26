const catalyst = require("zcatalyst-sdk-node");
const { getDataFromDb } = require("../utils/utils");
const tableName = "Products";
const coloumnRowId = "ROWID";
const handleSingleProduct = async (req, res) => {
  let id = req.query.id;
  let catalystApp = catalyst.initialize(req);
  getProduct(id, catalystApp)
    .then((resObj) => {
      res.status(200).send(resObj);
    })
    .catch((err) => {
      console.log(err);
      let errObj = err.message
        ? err
        : {
            message: "Request has been failed, try again",
          };
      res.status(400).send(errObj);
    });
};
const getProduct = async (id, catalystApp) => {
  let query = `Select * from ${tableName} where ${coloumnRowId}=${id}`;
  let productsArr = await getDataFromDb(catalystApp, query);
  if (productsArr.length === 0) {
    return Promise.reject({ message: "No Product Found " });
  }
  let product = productsArr[0].Products;
  console.log(product);
  return { product };
};

module.exports = handleSingleProduct;
