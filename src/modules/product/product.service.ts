import { Product } from "./product.model";
import { ConflictError, NotFoundError } from "../../core/errors";

const create = async (data: Record<string, any>) => {
  const exists = await Product.findOne({ sku: data.sku } as any);
  if (exists) throw new ConflictError("Product with this SKU already exists");
  return Product.create(data);
};

const getAll = async (query: {
  search?: string;
  category?: string;
  supplier?: string;
  isActive?: string;
  page?: string;
  limit?: string;
}) => {
  const filter: Record<string, unknown> = {};
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: "i" } },
      { sku: { $regex: query.search, $options: "i" } },
    ];
  }
  if (query.category) filter.category = query.category;
  if (query.supplier) filter.supplier = query.supplier;
  if (query.isActive !== undefined) filter.isActive = query.isActive === "true";

  const page = parseInt(query.page || "1", 10);
  const limit = parseInt(query.limit || "20", 10);
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name")
      .populate("supplier", "name company")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  return {
    products,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const getById = async (id: string) => {
  const product = await Product.findById(id)
    .populate("category", "name")
    .populate("supplier", "name company phone email");
  if (!product) throw new NotFoundError("Product");
  return product;
};

const update = async (id: string, data: Record<string, unknown>) => {
  const product = await Product.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!product) throw new NotFoundError("Product");
  return product;
};

const remove = async (id: string) => {
  const product = await Product.findByIdAndDelete(id);
  if (!product) throw new NotFoundError("Product");
  return product;
};

export const productService = { create, getAll, getById, update, remove };
