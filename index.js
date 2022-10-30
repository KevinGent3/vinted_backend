//imports package
const express = require("express");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();
const cors = require("cors");
//création serveur et recevoir des body
const app = express();
app.use(cors());
app.use(express.json());
//connexion bdd
mongoose.connect(process.env.MONGODB_URI);

//import des routes
const userRoutes = require("./routes/user");
app.use(userRoutes);
const offerRoutes = require("./routes/offer");
app.use(offerRoutes);
//cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.all("*", (req, res) => {
  res.status(400).json({ message: "route do not exist" });
});

app.listen(process.env.PORT, () => {
  console.log("Server started");
});
