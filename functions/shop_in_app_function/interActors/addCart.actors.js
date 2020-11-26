const catalyst = require("zcatalyst-sdk-node");
const { getDataFromDb, getInsertedData, updateRow } = require("../utils/utils");
const productTable = "Products";
const cartTable = "Cart";
const colROWID = "ROWID";
const colUserId = "UserId";
const colImageId = "ImageId";
const colName = "Name";
const colBrandName = "BrandName";
const colPrice = "Price";
const colShippingCost = "DeliveryPrice";
const colChecked = "Checked";

const handleAddToCart = async (req, res) => {
  let path = req.body.imgPath;
  let id = req.query.id;
  let userId = req.userId;
  let catalystApp = catalyst.initialize(req);
  getCartItems(path, id, userId, catalystApp)
    .then((resObj) => {
      res.status(200).send(resObj);
    })
    .catch((err) => {
      console.log(err);
      let errObj = err.message
        ? err
        : {
            message: "Unable to find user",
          };
      res.status(400).send(errObj);
    });
};

const getCartItems = async (path, id, userId, catalystApp) => {
  let cartObj = await productDetails(catalystApp, userId, id, path);
  let cart = await checksCartAndInsertRow(userId, catalystApp, id, cartObj);
  if (cart) {
    return {
      cart: cart.cartArr,
      isUpdated: true,
      message: "your cart is saved successfully",
    };
  }
};

const productDetails = async (catalystApp, userId, id, imgPath) => {
  let query = `Select ${colImageId},${colName},${colBrandName},${colPrice},${colShippingCost},${colChecked} from ${productTable} where ${colROWID} = ${id}`;
  let productDetail = await getDataFromDb(catalystApp, query);
  if (productDetail.length === 0) {
    return Promise.reject({ message: "Request failed" });
  }
  let product = productDetail[0].Products;
  let cartObj = {
    ...product,
    UserId: userId,
    ProductId: id,
    ImgPath: imgPath,
  };
  //console.log(cartObj);
  return cartObj;
};
const setsCartRowData = async (cart) => {
  let rowData = {};
  rowData["ProductName"] = cart.Name;
  rowData["ImageId"] = cart.ImageId;
  rowData["BrandName"] = cart.BrandName;
  rowData["Price"] = cart.Price;
  rowData["Qty"] = 1;
  rowData["ShippingCost"] = cart.DeliveryPrice;
  rowData["Checked"] = true;
  rowData["ProductId"] = cart.ProductId;
  rowData["UserId"] = cart.UserId;
  rowData["ImgPath"] = cart.ImgPath;
  let rowArr = [];
  rowArr.push(rowData);
  //console.log(rowArr);
  return rowArr;
};

const getCart = async (userId, catalystApp) => {
  let cartQuery = `Select * from ${cartTable}`;
  let cartDetail = await getDataFromDb(catalystApp, cartQuery);
  if (cartDetail.length === 0) {
    return new Promise.reject({ message: "no cart available" });
  } else {
    let cart = arrayObj(cartDetail);
    let filter = cart.filter((cartItem) => {
      if (cartItem.UserId === userId) {
        return cartItem;
      }
    });
    return filter;
  }
};
// formats the list
const arrayObj = (list = []) => {
  let listArr = [];
  for (let i = 0; i < list.length; i++) {
    let obj = list[i].Cart;
    listArr.push(obj);
  }
  return listArr;
};

const arrayMap = (cart = []) => {
  let cartMap = cart.map((cartItem) => {
    let cart = formatCartData(cartItem);
    return cart;
  });
  return cartMap;
};

const formatCartData = (cartObj) => {
  let {
    ROWID,
    ProductName,
    BrandName,
    Price,
    Qty,
    ShippingCost,
    ProductId,
    ImgPath,
    Checked,
  } = cartObj;
  let cart = {
    ROWID,
    ProductName,
    BrandName,
    Price,
    Qty,
    ShippingCost,
    ProductId,
    ImgPath,
    Checked,
  };
  return cart;
};

const checksCartAndInsertRow = async (userId, catalystApp, id, cartObj) => {
  let cartList = await getCart(userId, catalystApp);
  let index = cartList.findIndex((item) => item.ProductId == id);
  let cart;
  if (index == -1) {
    let cartRow = await setsCartRowData(cartObj);
    let cartData = await getInsertedData(catalystApp, cartRow, cartTable);
    let cartDataObj = cartData[0];
    cart = formatCartData(cartDataObj);
    cartList.unshift(cart);
    let cartArr = arrayMap(cartList);
    return { cartArr, isAdd: true };
  } else {
    let addItem = cartList.find((item) => item.ProductId == id);
    let updatedRowData = {
      Checked: true,
      ROWID: addItem.ROWID,
    };
    let updatedRow = await updateRow(catalystApp, cartTable, updatedRowData);
    console.log(updatedRow);
    cart = formatCartData(updatedRow);
    cartList.splice(index, 1, cart);
    let cartArr = arrayMap(cartList);
    return { cartArr, isUpdate: true };
  }
};

module.exports = handleAddToCart;
