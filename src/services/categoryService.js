import prisma from "../config/db.js";
import { CustomResponse, ResponseStatus } from "../utils/customResponse.js";

export const getAllCategories = async () => {
  return await prisma.category.findMany();
};

export const getCategoryById = async (id) => {
  return await prisma.category.findUniqueOrThrow({
    where: { id: Number(id) },
    include: { products: true },
  });
};

export const createCategory = async (data) => {
  return await prisma.category.create({ data });
};

export const updateCategory = async (id, data) => {
  return await prisma.category.update({
    where: { id: Number(id) },
    data,
  });
};

export const deleteCategory = async (id) => {
  return await prisma.category.delete({
    where: { id: Number(id) },
  });
};
