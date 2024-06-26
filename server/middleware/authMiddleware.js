const asyncHandler = require("express-async-handler");
const User = require("../models/userModel.js");
const jwt = require("jsonwebtoken");

const protect = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies.token;
    // console.log(req.cookies);
    if (!token) {
      res.status(401);
      throw new Error("Not authorized, please login");
    }

    // Verify Token
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    // Get user id from token
    const user = await User.findById(verified.id).select("-password");

    if (!user) {
      res.status(401);
      throw new Error("User not found");
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    throw new Error("Not authorized, please login");
  }
});

function restrictTo(roles = []) {
  return function (req, res, next) {
    if (!req.user) {
      res.status(401);
      throw new Error("Not authorized, please login");
    }

    if (!roles.includes(req.user.role)) {
      res.status(401);
      throw new Error("Not authorized, please login as admin");
    }

    next();
  };
}

module.exports = { protect, restrictTo };
