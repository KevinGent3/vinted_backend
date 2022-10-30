const User = require("../models/User");
const isAuthenticated = async (req, res, next) => {
  try {
    // console.log("je passe dans mon middle");
    if (req.headers.authorization) {
      const token = req.headers.authorization.replace("Bearer ", "");
      // console.log(token);
      const user = await User.findOne({ token: token }).select("account _id");
      // console.log(user);
      if (user) {
        req.user = user;
        next();
      } else {
        res.satus(401).json({ error: Unauthorized });
      }
    } else {
      res.satus(401).json({ error: Unauthorized });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
module.exports = isAuthenticated;
