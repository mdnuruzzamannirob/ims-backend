import { Category } from "./category.model";
import { ConflictError, NotFoundError } from "../../core/errors";

const create = async (data: { name: string; description?: string }) => {
  const exists = await Category.findOne({ name: data.name });
  if (exists) throw new ConflictError("Category already exists");
  return Category.create(data);
};

const getAll = async (query: { search?: string; isActive?: string }) => {
  const filter: Record<string, unknown> = {};
  if (query.search) {
    filter.name = { $regex: query.search, $options: "i" };
  }
  if (query.isActive !== undefined) {
    filter.isActive = query.isActive === "true";
  }
  return Category.find(filter).sort({ name: 1 });
};

const getById = async (id: string) => {
  const category = await Category.findById(id);
  if (!category) throw new NotFoundError("Category");
  return category;
};

const update = async (
  id: string,
  data: Partial<{ name: string; description: string; isActive: boolean }>,
) => {
  const category = await Category.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!category) throw new NotFoundError("Category");
  return category;
};

const remove = async (id: string) => {
  const category = await Category.findByIdAndDelete(id);
  if (!category) throw new NotFoundError("Category");
  return category;
};

export const categoryService = { create, getAll, getById, update, remove };
