const catalyst = require("zcatalyst-sdk-node");
const { getDataFromDb, getInsertedData } = require("./../utils/utils");
const { hashPassword } = require("./../dependencies/encrypt");
const tableName = "Users";
const columnName = "Username";
const columnEmail = "Email";
const columnMobileNo = "MobileNo";
const columnPass = "Password";

const handleRegister = async (req, res) => {
  let user = req.body;
  let catalystApp = catalyst.initialize(req);
  saveUser(user, catalystApp)
    .then((resObj) => {
      res.status(200).send(resObj);
    })
    .catch((err) => {
      console.log(err);
      res.status(400).send({ message: "Account registration has been failed" });
    });
};

const saveUser = async (user, catalystApp) => {
  let query = `Select * from ${tableName} where ${columnEmail} = ${user.email} or ${columnMobileNo} = ${user.mobile} `;
  let userDetail = await getDataFromDb(catalystApp, query);
  if (userDetail.length == 0) {
    let rowArr = await setsRowData(user);
    let insertedData = await getInsertedData(catalystApp, rowArr, tableName);
    console.log(insertedData);
    return {
      message: "Your account has been registered successfully!",
      isAdded: true,
    };
  } else {
    //already applied
    return {
      message: "You have already registered to your account please login",
      isAdded: false,
    };
  }
};

const setsRowData = async (user) => {
  let password = await hashPassword(user.password);
  let rowData = {};
  rowData[columnName] = user.username;
  rowData[columnEmail] = user.email;
  rowData[columnMobileNo] = user.mobile;
  rowData[columnPass] = password;
  let rowArr = [];
  rowArr.push(rowData);
  return rowArr;
};
module.exports = handleRegister;
