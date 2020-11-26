const catalyst = require("zcatalyst-sdk-node");
const { getDataFromDb } = require("../utils/utils");
const tableName = "Users";
const columnName = "Username";
const columnEmail = "Email";
const columnMobileNo = "MobileNo";
const columnRowId = "ROWID";
const handleProfile = async (req, res) => {
  let id = req.userId;
  console.log(id);
  let catalystApp = catalyst.initialize(req);
  getProfile(id, catalystApp)
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
const getProfile = async (id, catalystApp) => {
  let query = `Select ${columnName}, ${columnEmail}, ${columnMobileNo} from ${tableName} where ${columnRowId} = ${id} `;
  let userData = await getDataFromDb(catalystApp, query);
  if (userData.length === 0) {
    return Promise.reject({ message: "No User Found " });
  }
  let userObj = userData[0].Users;
  let { Username, MobileNo, Email } = userObj;
  let user = {
    _id: id,
    username: Username,
    mobile: MobileNo,
    email: Email,
  };
  console.log(user);
  return {
    user,
  };
};

module.exports = handleProfile;
