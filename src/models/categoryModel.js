import prisma from "../config/db.js";

export default {
  findAll: () => prisma.category.findMany({ orderBy: { id: "asc" } }),
  create: (data) => prisma.category.create({ data }),
  update: (id, data) => prisma.category.update({ where: { id }, data }),
  remove: (id) => prisma.category.delete({ where: { id } }),
  findById: (id) => prisma.category.findUnique({ where: { id } }),
};
