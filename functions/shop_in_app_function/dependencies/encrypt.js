const bcrypt = require("bcrypt");

const hashPassword = (password) => {
  return bcrypt
    .genSalt(10)
    .then((salt) => {
      return bcrypt.hashSync(password, salt);
    })
    .catch((err) => Promise.reject(err));
};

const comparePasswords = (currentPassword, dbPassword) => {
  return bcrypt.compareSync(currentPassword, dbPassword);
};

module.exports = Object.freeze({
  hashPassword,
  comparePasswords,
});
