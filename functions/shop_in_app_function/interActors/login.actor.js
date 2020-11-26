const { generateAuthToken } = require("./../dependencies/authToken");
const { comparePasswords } = require("./../dependencies/encrypt");
const catalyst = require("zcatalyst-sdk-node");
const { getDataFromDb } = require("../utils/utils");
const tableName = "Users";
const columnEmail = "Email";
const columnMobileNo = "MobileNo";

const handleLogin = async (req, res) => {
  let user = req.body;
  //console.log(user);
  let catalystApp = catalyst.initialize(req);
  getUserLogin(user, catalystApp)
    .then((resObj) => {
      let token = resObj.token;
      if (!token) {
        res.status(400).send({ message: "Invalid Token" });
      } else {
        res.status(200).send(resObj);
      }
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

const getUserLogin = async (user, catalystApp) => {
  let query = `Select * from ${tableName} where ${columnEmail} = ${user.userInput} or ${columnMobileNo} = ${user.userInput} `;
  let userData = await getDataFromDb(catalystApp, query);
  if (userData.length === 0) {
    return Promise.reject({ message: "No User Found " });
  }
  let userObj = userData[0].Users;
  //console.log(userObj.Password);
  let correctPassword = comparePasswords(user.password, userObj.Password);

  if (correctPassword === false) {
    return Promise.reject({ message: "Incorrect password" });
  } else {
    return userLogin(userObj);
  }
};

let userLogin = (userData) => {
  return getTokenOfUser(userData);
};

let getTokenOfUser = (user) => {
  let { ROWID, Username, MobileNo, Email } = user;
  let userObj = {
    _id: ROWID,
    username: Username,
    mobile: MobileNo,
    email: Email,
  };
  console.log(userObj);

  let token = generateAuthToken(userObj);
  return {
    logged_in: true,
    message: "token is valid",
    token,
    userObj,
  };
};

module.exports = handleLogin;
