import { Sale } from "../sale/sale.model";
import { Purchase } from "../purchase/purchase.model";
import { Inventory } from "../inventory/inventory.model";
import { Product } from "../product/product.model";
import { Customer } from "../customer/customer.model";
import { User } from "../user/user.model";
import { Payment } from "../payment/payment.model";

const buildDateFilter = (query: any) => {
  const filter: any = {};
  if (query.startDate || query.endDate) {
    filter.createdAt = {};
    if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
    if (query.endDate) filter.createdAt.$lte = new Date(query.endDate);
  }
  return filter;
};

const getDashboardStats = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const [
    totalProducts,
    totalCustomers,
    totalUsers,
    lowStockCount,
    todaySales,
    monthlySales,
    todayPurchases,
    monthlyPurchases,
    recentSales,
    recentPurchases,
  ] = await Promise.all([
    Product.countDocuments({ isActive: true }),
    Customer.countDocuments({ isActive: true }),
    User.countDocuments({ isActive: true }),
    // Low stock: items where quantity <= reorderLevel
    Inventory.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      {
        $match: {
          $expr: { $lte: ["$quantity", "$productInfo.reorderLevel"] },
          "productInfo.isActive": true,
        },
      },
      { $count: "count" },
    ]),
    // Today's sales
    Sale.aggregate([
      {
        $match: {
          createdAt: { $gte: today, $lt: tomorrow },
          status: "completed",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
    ]),
    // Monthly sales
    Sale.aggregate([
      { $match: { createdAt: { $gte: monthStart }, status: "completed" } },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
    ]),
    // Today's purchases
    Purchase.aggregate([
      { $match: { createdAt: { $gte: today, $lt: tomorrow } } },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
    ]),
    // Monthly purchases
    Purchase.aggregate([
      { $match: { createdAt: { $gte: monthStart } } },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
    ]),
    // Recent sales (last 5)
    Sale.find().sort({ createdAt: -1 }).limit(5).populate("createdBy", "name"),
    // Recent purchases (last 5)
    Purchase.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("supplier", "name"),
  ]);

  return {
    totalProducts,
    totalCustomers,
    totalUsers,
    lowStockCount: lowStockCount[0]?.count || 0,
    todaySales: {
      total: todaySales[0]?.total || 0,
      count: todaySales[0]?.count || 0,
    },
    monthlySales: {
      total: monthlySales[0]?.total || 0,
      count: monthlySales[0]?.count || 0,
    },
    todayPurchases: {
      total: todayPurchases[0]?.total || 0,
      count: todayPurchases[0]?.count || 0,
    },
    monthlyPurchases: {
      total: monthlyPurchases[0]?.total || 0,
      count: monthlyPurchases[0]?.count || 0,
    },
    recentSales,
    recentPurchases,
  };
};

const getSalesReport = async (query: any) => {
  const dateFilter = buildDateFilter(query);
  const matchStage: any = { status: "completed", ...dateFilter };

  const [summary, dailyBreakdown] = await Promise.all([
    Sale.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: "$totalAmount" },
          maxOrder: { $max: "$totalAmount" },
          minOrder: { $min: "$totalAmount" },
        },
      },
    ]),
    Sale.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  return {
    summary: summary[0] || {
      totalSales: 0,
      totalOrders: 0,
      avgOrderValue: 0,
      maxOrder: 0,
      minOrder: 0,
    },
    dailyBreakdown,
  };
};

const getPurchaseReport = async (query: any) => {
  const dateFilter = buildDateFilter(query);
  const matchStage: any = { ...dateFilter };

  const [summary, byStatus, dailyBreakdown] = await Promise.all([
    Purchase.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: "$totalAmount" },
        },
      },
    ]),
    Purchase.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          total: { $sum: "$totalAmount" },
        },
      },
    ]),
    Purchase.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  return {
    summary: summary[0] || { totalAmount: 0, totalOrders: 0, avgOrderValue: 0 },
    byStatus,
    dailyBreakdown,
  };
};

const getInventoryReport = async () => {
  const [overview, lowStockItems, categoryBreakdown] = await Promise.all([
    Inventory.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      { $match: { "productInfo.isActive": true } },
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          totalQuantity: { $sum: "$quantity" },
          totalValue: {
            $sum: { $multiply: ["$quantity", "$productInfo.price"] },
          },
        },
      },
    ]),
    Inventory.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      {
        $match: {
          $expr: { $lte: ["$quantity", "$productInfo.reorderLevel"] },
          "productInfo.isActive": true,
        },
      },
      {
        $project: {
          productName: "$productInfo.name",
          sku: "$productInfo.sku",
          quantity: 1,
          reorderLevel: "$productInfo.reorderLevel",
          price: "$productInfo.price",
        },
      },
      { $sort: { quantity: 1 } },
    ]),
    Inventory.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      {
        $lookup: {
          from: "categories",
          localField: "productInfo.category",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },
      { $unwind: { path: "$categoryInfo", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$categoryInfo.name",
          totalItems: { $sum: 1 },
          totalQuantity: { $sum: "$quantity" },
          totalValue: {
            $sum: { $multiply: ["$quantity", "$productInfo.price"] },
          },
        },
      },
      { $sort: { totalValue: -1 } },
    ]),
  ]);

  return {
    overview: overview[0] || { totalItems: 0, totalQuantity: 0, totalValue: 0 },
    lowStockItems,
    categoryBreakdown,
  };
};

const getProfitLossReport = async (query: any) => {
  const dateFilter = buildDateFilter(query);

  const [salesTotal, purchasesTotal, paymentsReceived, paymentsMade] =
    await Promise.all([
      Sale.aggregate([
        { $match: { status: "completed", ...dateFilter } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Purchase.aggregate([
        { $match: { status: "received", ...dateFilter } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Payment.aggregate([
        { $match: { type: "sale", status: "completed", ...dateFilter } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Payment.aggregate([
        { $match: { type: "purchase", status: "completed", ...dateFilter } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

  const revenue = salesTotal[0]?.total || 0;
  const costOfGoods = purchasesTotal[0]?.total || 0;
  const grossProfit = revenue - costOfGoods;

  return {
    revenue,
    costOfGoods,
    grossProfit,
    grossProfitMargin:
      revenue > 0 ? ((grossProfit / revenue) * 100).toFixed(2) : "0.00",
    paymentsReceived: paymentsReceived[0]?.total || 0,
    paymentsMade: paymentsMade[0]?.total || 0,
  };
};

const getTopProducts = async (query: any) => {
  const { limit = 10, startDate, endDate } = query;
  const dateFilter: any = {};
  if (startDate || endDate) {
    dateFilter.createdAt = {};
    if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
    if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
  }

  const topBySales = await Sale.aggregate([
    { $match: { status: "completed", ...dateFilter } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.product",
        totalQuantitySold: { $sum: "$items.quantity" },
        totalRevenue: { $sum: "$items.total" },
      },
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: Number(limit) },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
    {
      $project: {
        _id: 0,
        productId: "$_id",
        name: "$product.name",
        sku: "$product.sku",
        totalQuantitySold: 1,
        totalRevenue: 1,
      },
    },
  ]);

  return topBySales;
};

export const reportService = {
  getDashboardStats,
  getSalesReport,
  getPurchaseReport,
  getInventoryReport,
  getProfitLossReport,
  getTopProducts,
};
