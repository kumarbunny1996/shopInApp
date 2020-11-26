const catalyst = require("zcatalyst-sdk-node");
const { getDataFromDb } = require("../utils/utils");
const cartTable = "Cart";
const addressTable = "DeliveryAddress";

const handleOrders = async (req, res) => {
  let userId = req.userId;
  let catalystApp = catalyst.initialize(req);
  getOrderObj(userId, catalystApp)
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
const getOrderObj = async (userId, catalystApp) => {
  let address$ = await getAddress(userId, catalystApp);
  let cartList = await getCart(userId, catalystApp);
  let { AddressName, Street, State, PinCode, Country } = address$;
  let addId = address$.ROWID;
  let address = {
    AddressName,
    Street,
    State,
    PinCode,
    Country,
    ROWID: addId,
  };
  let cartArr = arrayMap(cartList);
  let cart = cartArr.filter((item) => item.Checked === true);
  console.log(address, cart);
  return {
    address,
    cart,
    is_order: true,
  };
};

const getAddress = async (userId, catalystApp) => {
  let addressQuery = `Select * from ${addressTable} where UserId = ${userId}`;
  let addresssDetail = await getDataFromDb(catalystApp, addressQuery);
  if (addresssDetail.length === 0) {
    return new Promise.reject({ message: "no address available" });
  } else {
    let address = addresssDetail[0].DeliveryAddress;
    return address;
  }
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
    } = cartItem;
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
  });
  return cartMap;
};

module.exports = handleOrders;
