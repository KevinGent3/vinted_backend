const express = require("express");
const Offer = require("../models/Offer");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
const router = express.Router();
const convertToBase64 = require("../functions/convertToBase64");
const isAuthenticated = require("../Middlewares/isAuthenticated");

router.post(
  "/offer/publish",
  isAuthenticated,
  fileUpload(),
  async (req, res) => {
    try {
      // console.log(req.headers.authorization);
      const { title, description, price, condition, city, brand, size, color } =
        req.body;
      // console.log(req.body);
      // console.log(req.files);
      const newOffer = new Offer({
        product_name: title,
        product_description: description,
        product_price: price,
        product_details: [
          {
            MARQUE: brand,
          },
          { TAILLE: size },
          { ÉTAT: condition },
          { COULEUR: color },
          { EMPLACEMENT: city },
        ],
        // product_image: req.files,
        owner: req.user, //comportera l'id de l'user qui est stocké dans req.user
      });
      const result = await cloudinary.uploader.upload(
        convertToBase64(req.files.picture)
      );
      newOffer.product_image = result;
      await newOffer.save();
      console.log(result);
      // console.log(newOffer);
      res.json(newOffer);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

router.get("/offers", async (req, res) => {
  try {
    const filters = {};
    if (req.query.title) {
      filters.product_name = new RegExp("pantalon", "i");
    }
    if (req.query.priceMin) {
      filters.product_price = { $gte: Number(req.query.priceMin) };
    }
    if (req.query.priceMax) {
      if (filters.product_price) {
        filters.product_price.$lte = Number(req.query.priceMax);
      } else {
        filters.product_price = { $lte: Number(req.query.priceMax) };
      }
    }
    const sort = {};
    if (req.query.sort === "price-desc") {
      sort.product_price = -1;
    } else if (req.query.sort === "price-asc") {
      sort.product_price = "asc";
    }
    let page = 1;
    if (req.query.page) {
      page = req.query.page;
    }
    let limit = 5;
    let skip = (page - 1) * limit;
    const results = await Offer.find(filters)
      .sort(sort)
      .skip(skip)
      .limit(limit);
    // .select("product_name product_price _id"); on peut l'enlever seulement pour faciliter la lecture.
    const count = await Offer.countDocuments(filters);
    // console.log(results);
    res.json({ count: count, offers: results });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
router.get("/offer/:id", async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate(
      "owner",
      "account"
    );
    res.json(offer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
module.exports = router;
