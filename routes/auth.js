const express = require('express');
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const authRouter =  express.Router();
const User = require("../models/user");
const auth = require("../middlewares/auth");


// signup api ----- post
authRouter.post("/api/signup", async (req, res) => {
    try {
      const { name, email, password } = req.body;
  
      const existingUser = await User.findOne({ email : email });
      if (existingUser) {
        return res
          .status(400)
          .json({ msg: "User with same email already exists!" });
      }
  
      const hashedPassword = await bcryptjs.hash(password, 8);
  
      let user = new User({
        email,
        password: hashedPassword,
        name,
      });
      user = await user.save();
      // const userResponse = user.toObject(); // Convert to plain JavaScript object
      // delete userResponse._id;
      // delete userResponse.__v;
  
      // res.json(userResponse);
      res.json(user);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

// signin api ----- post
  authRouter.post("/api/signin", async (req, res) => {
    try {
      const { email, password } = req.body;
  
      const user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ msg: "User with this email does not exist!" });
      }
  
      const isMatch = await bcryptjs.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: "Incorrect password." });
      }
  
      const token = jwt.sign({ id: user._id }, "passwordKey");
      //The ... spread operator extracts all the properties of user._doc and includes them in the response, 
      //so the client receives all the user’s details (like name, email, etc.) alongside the token.
      const userData = { ...user._doc };
      delete userData.__v;
  
      res.json({ token, ...userData });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

// isTokenValid ---- post
  authRouter.post("/tokenIsValid", async (req, res) => {
    try {
      const token = req.header("x-auth-token");
      if (!token) return res.json(false);
      const verified = jwt.verify(token, "passwordKey");
      if (!verified) return res.json(false);
  
      const user = await User.findById(verified.id);
      if (!user) return res.json(false);
      res.json(true);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  
  // get user data ---- get
  authRouter.get("/", auth, async (req, res) => {
    const user = await User.findById(req.user);
    res.json({ ...user._doc, token: req.token });
  });

module.exports = authRouter;