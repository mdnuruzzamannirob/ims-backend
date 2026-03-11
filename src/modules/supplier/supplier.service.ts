import { Supplier } from "./supplier.model";
import { NotFoundError } from "../../core/errors";

const create = async (data: Record<string, unknown>) => {
  return Supplier.create(data);
};

const getAll = async (query: { search?: string; isActive?: string }) => {
  const filter: Record<string, unknown> = {};
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: "i" } },
      { company: { $regex: query.search, $options: "i" } },
    ];
  }
  if (query.isActive !== undefined) {
    filter.isActive = query.isActive === "true";
  }
  return Supplier.find(filter).sort({ name: 1 });
};

const getById = async (id: string) => {
  const supplier = await Supplier.findById(id);
  if (!supplier) throw new NotFoundError("Supplier");
  return supplier;
};

const update = async (id: string, data: Record<string, unknown>) => {
  const supplier = await Supplier.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!supplier) throw new NotFoundError("Supplier");
  return supplier;
};

const remove = async (id: string) => {
  const supplier = await Supplier.findByIdAndDelete(id);
  if (!supplier) throw new NotFoundError("Supplier");
  return supplier;
};

export const supplierService = { create, getAll, getById, update, remove };
