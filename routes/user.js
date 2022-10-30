const express = require("express");
const router = express.Router();

//import des models
const User = require("../models/User");
//import salt +encryptage
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

router.post("/user/signup", async (req, res) => {
  try {
    const { email, username, password, newsletter } = req.body;
    if (!username || !password || !newsletter || !email) {
      return res.status(401).json({ message: "missing parameters" });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(401).json({ message: "this email is already used" });
    }

    const salt = uid2(16);
    const hash = SHA256(password + salt).toString(encBase64);
    const token = uid2(16);
    const newUser = new User({
      email,
      account: { username },
      newsletter,
      token,
      hash,
      salt,
    });
    await newUser.save();
    res.status(200).json({
      _id: newUser._id,
      token: newUser.token,
      account: newUser.account,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
router.post("/user/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.json({ message: "user do not exist" });
    }
    newHash = SHA256(password + user.salt).toString(encBase64);
    if (newHash !== user.hash) {
      return res.json({ message: "Unauthorized" });
    }
    res
      .status(200)
      .json({ _id: user._id, token: user.token, account: user.account });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
module.exports = router;
