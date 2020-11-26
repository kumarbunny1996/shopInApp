const { verifyToken } = require("./../dependencies/authToken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const accessToken = authHeader && authHeader.split(" ")[1];
  if (accessToken == null) {
    return res.status(400).send({ message: "Access is denied" });
  }
  verifyToken(accessToken)
    .then((user) => {
      if (!user._id) {
        console.log("Invalid user");
      } else {
        req.userId = user._id;
        next();
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(400).send({ message: "verification failed" });
    });
};

module.exports = authenticateToken;
