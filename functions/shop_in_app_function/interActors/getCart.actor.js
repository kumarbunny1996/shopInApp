const catalyst = require("zcatalyst-sdk-node");
const { getDataFromDb } = require("../utils/utils");
const cartTable = "Cart";
const handleGetCart = async (req, res) => {
  let userId = req.userId;
  //console.log(user);
  let catalystApp = catalyst.initialize(req);
  getCartItems(userId, catalystApp)
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

const getCartItems = async (userId, catalystApp) => {
  let cartQuery = `Select * from ${cartTable}`;
  let cartDetail = await getDataFromDb(catalystApp, cartQuery);
  if (cartDetail.length === 0) {
    return new Promise.reject({ message: "no cart available" });
  } else {
    let cartArr = arrayObj(cartDetail);
    let filter = cartArr.filter((cartItem) => {
      if (cartItem.UserId === userId) {
        return cartItem;
      }
    });
    let cart = arrayMap(filter);
    return {
      cart,
    };
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

module.exports = handleGetCart;
