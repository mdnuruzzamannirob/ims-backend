import { Inventory } from "./inventory.model";
import { Product } from "../product/product.model";
import { BadRequestError, NotFoundError } from "../../core/errors";
import logger from "../../core/logger";

const getAll = async (query: {
  lowStock?: string;
  page?: string;
  limit?: string;
}) => {
  const page = parseInt(query.page || "1", 10);
  const limit = parseInt(query.limit || "20", 10);
  const skip = (page - 1) * limit;

  const pipeline: any[] = [
    {
      $lookup: {
        from: "products",
        localField: "product",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
  ];

  if (query.lowStock === "true") {
    pipeline.push({
      $match: {
        $expr: { $lte: ["$quantity", "$product.reorderLevel"] },
      },
    });
  }

  pipeline.push({ $sort: { "product.name": 1 } });

  const countPipeline = [...pipeline, { $count: "total" }];
  pipeline.push({ $skip: skip }, { $limit: limit });

  const [items, countResult] = await Promise.all([
    Inventory.aggregate(pipeline),
    Inventory.aggregate(countPipeline),
  ]);

  const total = countResult[0]?.total || 0;

  return {
    items,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const getByProductId = async (productId: string) => {
  const inventory = await Inventory.findOne({ product: productId }).populate(
    "product",
    "name sku reorderLevel",
  );
  if (!inventory) throw new NotFoundError("Inventory record");
  return inventory;
};

const adjustStock = async (
  productId: string,
  data: { quantity: number; reason: string },
) => {
  const product = await Product.findById(productId);
  if (!product) throw new NotFoundError("Product");

  let inventory = await Inventory.findOne({ product: productId });
  if (!inventory) {
    inventory = await Inventory.create({ product: productId, quantity: 0 });
  }

  const newQuantity = inventory.quantity + data.quantity;
  if (newQuantity < 0) {
    throw new BadRequestError("Insufficient stock");
  }

  inventory.quantity = newQuantity;
  await inventory.save();

  logger.info(
    `Stock adjusted for product ${productId}: ${data.quantity > 0 ? "+" : ""}${data.quantity} (${data.reason}). New quantity: ${newQuantity}`,
  );

  return inventory;
};

const getLowStockAlerts = async () => {
  return Inventory.aggregate([
    {
      $lookup: {
        from: "products",
        localField: "product",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
    {
      $match: {
        $expr: { $lte: ["$quantity", "$product.reorderLevel"] },
      },
    },
    { $sort: { quantity: 1 } },
  ]);
};

export const inventoryService = {
  getAll,
  getByProductId,
  adjustStock,
  getLowStockAlerts,
};
