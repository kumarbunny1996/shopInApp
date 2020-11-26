const catalyst = require("zcatalyst-sdk-node");
const {
  getDataFromDb,
  getInsertedData,
  deleteRowData,
  updateRow,
} = require("../utils/utils");
const productTable = "Products";
const cartTable = "Cart";
const addressTable = "DeliveryAddress";
const colImageId = "ImageId";
const colName = "Name";
const colBrandName = "BrandName";
const colPrice = "Price";
const colShippingCost = "DeliveryPrice";
const colChecked = "Checked";
const colROWID = "ROWID";
const colAddName = "AddressName";
const colStreet = "Street";
const colState = "State";
const colCountry = "Country";
const colPincode = "PinCode";
const colUserId = "UserId";

const saveAddressandCart = async (req, res) => {
  let catalystApp = catalyst.initialize(req);
  let userId = req.userId;
  let data = req.body;
  let id = req.query.id;
  saveLogic(catalystApp, data, id, userId)
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

const saveLogic = async (catalystApp, data, id, userId) => {
  let address = data;
  //console.log(address);
  let cartObj = await productDetails(catalystApp, userId, id, address);
  let addData = await getsAddressObj(catalystApp, userId, address);
  console.log(addData);
  let addDataObj = addData[0];
  let address$ = formatAddressData(addDataObj);
  let cart = await checksCartAndInsertRow(userId, catalystApp, id, cartObj);
  if (cart) {
    return {
      address$,
      cart: cart.cartArr,
      isUpdated: true,
      message: "your Address is saved successfully",
    };
  }
};

const getsAddressObj = async (catalystApp, userId, address) => {
  let addressQuery = `Select * from ${addressTable} where UserId = ${userId}`;
  let addresssDetail = await getDataFromDb(catalystApp, addressQuery);
  if (addresssDetail.length > 0) {
    let rowId = addresssDetail[0].DeliveryAddress.ROWID;
    let deleteRow = await deleteRowData(catalystApp, addressTable, rowId);
    console.log(deleteRow);
  }
  let addRowArr = await setsAddressRowData(address, userId);
  let addData = await getInsertedData(catalystApp, addRowArr, addressTable);
  return addData;
};

const productDetails = async (catalystApp, userId, id, address) => {
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
    ImgPath: address.imgPath,
  };
  //console.log(cartObj);
  return cartObj;
};

const setsAddressRowData = async (address, userId) => {
  let rowData = {};
  rowData[colAddName] = address.name;
  rowData[colStreet] = address.street;
  rowData[colState] = address.state;
  rowData[colCountry] = address.country;
  rowData[colPincode] = address.pincode;
  rowData[colUserId] = Number(userId);
  let rowArr = [];
  rowArr.push(rowData);
  return rowArr;
};

const setsCartRowData = async (cart) => {
  let rowData = {};
  rowData["ProductName"] = cart.Name;
  rowData[colImageId] = cart.ImageId;
  rowData[colBrandName] = cart.BrandName;
  rowData[colPrice] = cart.Price;
  rowData["Qty"] = 1;
  rowData["ShippingCost"] = cart.DeliveryPrice;
  rowData[colChecked] = true;
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
const formatAddressData = (addDataObj) => {
  let { AddressName, Street, State, PinCode, Country } = addDataObj;
  let addId = addDataObj.ROWID;
  let address$ = {
    AddressName,
    Street,
    State,
    PinCode,
    Country,
    ROWID: addId,
  };
  return address$;
};

const checksCartAndInsertRow = async (userId, catalystApp, id, cartObj) => {
  let cartList = await getCart(userId, catalystApp);
  let updatedRows = await buyItemLogic(cartList, catalystApp);
  console.log(updatedRows);
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
    let buyItem = cartList.find((item) => item.ProductId == id);
    let updatedRowData = {
      Checked: true,
      ROWID: buyItem.ROWID,
    };
    let updatedRow = await updateRow(catalystApp, cartTable, updatedRowData);
    console.log(updatedRow);
    cart = formatCartData(updatedRow);
    cartList.splice(index, 1, cart);
    let cartArr = arrayMap(cartList);
    return { cartArr, isUpdate: true };
  }
};

const buyItemLogic = async (cart = [], catalystApp) => {
  let updatedRows = await Promise.all(
    cart.map(async (item) => {
      let updatedRowData = {
        Checked: false,
        ROWID: item.ROWID,
      };
      let row = await updateRow(catalystApp, cartTable, updatedRowData);
      return row;
    })
  );
  return updatedRows;
};
module.exports = saveAddressandCart;
