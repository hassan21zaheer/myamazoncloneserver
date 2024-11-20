const express = require("express");
const userRouter = express.Router();
const auth = require("../middlewares/auth");
const Order = require("../models/order");
const { Product } = require("../models/product");
const User = require("../models/user");

///------------------------------Add to Cart
userRouter.post("/api/add-to-cart", auth, async (req, res) => {
  try {
    const { id } = req.body;
    const product = await Product.findById(id);
    //user id taken from token (auth middleware )
    let user = await User.findById(req.user);

    if (user.cart.length == 0) {
      user.cart.push({ product, quantity: 1 });
    } else {
      let isProductFound = false;
      for (let i = 0; i < user.cart.length; i++) {
        //we are just here finding if product already is in cart
        if (user.cart[i].product._id.equals(product._id)) {
          isProductFound = true;
        }
      }
//now here if the product is in list , then we assign that product to a variable to increment its quantity
      if (isProductFound) {
        let producttt = user.cart.find((productt) =>
          productt.product._id.equals(product._id)
        );
        producttt.quantity += 1;
      } else {
        user.cart.push({ product, quantity: 1 });
      }
    }
    user = await user.save();
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

///------------------------------delete from Cart

userRouter.delete("/api/remove-from-cart/:id", auth, async (req, res) => {
  try {
    //const { id } = req.params.id;  this will not work, and will cause error
   // const id = req.params.id;  This works because you're directly accessing the value

    const { id } = req.params;
    const product = await Product.findById(id);
    let user = await User.findById(req.user);

    for (let i = 0; i < user.cart.length; i++) {
      if (user.cart[i].product._id.equals(product._id)) {
        if (user.cart[i].quantity == 1) {
             //if the quantity is equal to 1 then the entire product from cart gets deleted
          user.cart.splice(i, 1);
        } else {
            //if the quantity is greater than 1 then decrease by 1
          user.cart[i].quantity -= 1;
        }
      }
    }
    user = await user.save();
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

///------------------------------Save user Address

userRouter.post("/api/save-user-address", auth, async (req, res) => {
  try {
    const { address } = req.body;
    let user = await User.findById(req.user);
    user.address = address;
    user = await user.save();
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

///------------------------------Order a Product

userRouter.post("/api/order", auth, async (req, res) => {
  try {
    const { cart, totalPrice, address } = req.body;
    let products = [];

    for (let i = 0; i < cart.length; i++) {
      ///check if the prodiuct quantity is avaiable 
      let product = await Product.findById(cart[i].product._id);
      if (product.quantity >= cart[i].quantity) {
        product.quantity -= cart[i].quantity;
        products.push({ product, quantity: cart[i].quantity });
        await product.save();
      } else {
        return res
          .status(400)
          .json({ msg: `${product.name} is out of stock!` });
      }
    }

    let user = await User.findById(req.user);
    user.cart = [];
    user = await user.save();

    let order = new Order({
      products,
      totalPrice,
      address,
      userId: req.user,
      orderedAt: new Date().getTime(),
    });
    order = await order.save();
    res.json(order);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

///------------------------------Show My Order

userRouter.get("/api/orders/me", auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user });
    res.json(orders);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = userRouter;