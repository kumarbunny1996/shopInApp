const jwt = require("jsonwebtoken");
//require("dotenv").config();

let accessSecretKey =
  "ehehjsdni22ijjpwojedfn11jvnijivkknklnk8833llkdjjj45opw00koasocjfi88hvjdjc77scdocoko222kckEEJ";

const generateAuthToken = (payload = null, options = {}) => {
  //console.log(process.env);
  console.log(accessSecretKey);
  let token = jwt.sign(payload, accessSecretKey, options);
  console.log(token);
  return `ShopInApp ${token}`;
};

const verifyToken = (token = undefined, options = {}) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, accessSecretKey, options, (err, data) => {
      if (err) {
        return reject(err);
      } else {
        return resolve(data);
      }
    });
  });
};

module.exports = Object.freeze({
  generateAuthToken,
  verifyToken,
});
