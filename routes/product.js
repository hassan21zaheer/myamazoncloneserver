const express = require("express");
const productRouter = express.Router();
const auth = require("../middlewares/auth");
const { Product } = require("../models/product");

// ----------------------------create a get request to search products based on category and get them
productRouter.get("/api/products/", auth, async (req, res) => {
  try {
    const products = await Product.find({ category: req.query.category });
    res.json(products);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ----------------------------create a get request to search products and get them
// /api/products/search/i

productRouter.get("/api/products/search/:name", auth, async (req, res) => {
  try {
    const products = await Product.find({
        //we could also use name: req.params.name but for this the searched name should be the same but when using regex it could search for simailars also 
      name: { $regex: req.params.name, $options: "i" },
    });

    res.json(products);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ----------------------------create a post request route to rate the product.

productRouter.post("/api/rate-product", auth, async (req, res) => {
  try {
    const { id, rating } = req.body;
    let product = await Product.findById(id);

    //loops in the product rating list ,then deletes the list item if the user id who is rating the product is already in the item of the list
    for (let i = 0; i < product.ratings.length; i++) {
      if (product.ratings[i].userId == req.user) {
        product.ratings.splice(i, 1);
        break;
      }
    }

    const ratingSchema = {
      userId: req.user,
      rating,
    };
//adding into rating list the user id and the product rating
    product.ratings.push(ratingSchema);
    product = await product.save();
    res.json(product);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ----------------------------deal of day
productRouter.get("/api/deal-of-day", auth, async (req, res) => {
  try {
    let products = await Product.find({});
//here the product who has highest rating will be deal of day
    products = products.sort((a, b) => {
      let aSum = 0;
      let bSum = 0;

      for (let i = 0; i < a.ratings.length; i++) {
        aSum += a.ratings[i].rating;
      }

      for (let i = 0; i < b.ratings.length; i++) {
        bSum += b.ratings[i].rating;
      }
      return aSum < bSum ? 1 : -1;
    });

    res.json(products[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = productRouter;