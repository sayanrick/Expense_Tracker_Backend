const Razorpay = require("razorpay");
const Order = require("../models/orders.js");

const userController = require("./users.js");

exports.purchasePremium = (req, res) => {
  console.log(process.env.RAZORPAY_KEY_ID);
  console.log(process.env.RAZORPAY_KEY_SECRET);
  try {
    let rzp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const amount = 2500;

    rzp.orders.create({ amount, currency: "INR" }, (err, order) => {
      if (err) {
        throw new Error(JSON.stringify(err));
      }

      req.user
        .createOrder({
          orderid: order.id,
          status: "PENDING",
        })
        .then(() => {
          return res.status(201).json({ order, key_id: rzp.key_id });
        })
        .catch((err) => {
          throw new Error(err);
        });
    });
  } catch (err) {
    console.error(err);
    res
      .status(403)
      .json({ message: "Something went wrong", error: err.message });
  }
};

exports.updateTransactionStatus = async (req, res) => {
  try {
    const userId = req.userId;
    const { payment_id, order_id } = req.body;

    const order = await Order.findOne({ where: { orderId: order_id } });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    const promise1 = order.update({
      paymentid: payment_id,
      status: "SUCCESSFUL",
    });
    const promise2 = req.user.update({ isPremiumUser: true });

    Promise.all([promise1, promise2])
      .then(() => {
        return res.status(202).json({
          success: true,
          message: "Transaction Successful",
          token: userController.generateAccessToken(userId, undefined, true),
        });
      })
      .catch((error) => {
        throw new Error(error);
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
