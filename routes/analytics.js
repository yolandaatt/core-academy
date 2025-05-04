const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const isAdmin = require("../middleware/admin");

// Månadsintäkt för senaste 12 månaderna
router.get("/revenue-per-month", isAdmin, async (req, res) => {
  try {
    const last12Months = [];
    const currentMonth = new Date();

    for (let i = 0; i < 12; i++) {
      const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - i, 1);
      const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - i + 1, 0);

      const orders = await Order.find({
        purchasedAt: { $gte: monthStart, $lt: monthEnd }
      }).populate('courses'); 

      let totalRevenue = 0;

      orders.forEach(order => {
        order.courses.forEach(course => {
          totalRevenue += course.price;
        });
      });

      last12Months.push({
        [`${monthStart.toLocaleString('default', { month: 'long' })}-${monthStart.getFullYear()}`]: totalRevenue
      });
    }

    res.json(last12Months);
  } catch (error) {
    res.status(500).json({ message: "Error fetching revenue data", error: error.message });
  }
});


// Topp 10 största kunder
router.get("/top-customers", isAdmin, async (req, res) => {
  try {
    const topCustomers = await Order.aggregate([
      { $group: { _id: '$user', totalSpent: { $sum: '$totalPrice' } } },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 }
    ]);
    res.json(topCustomers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching top customers", error: error.message });
  }
});

module.exports = router;
