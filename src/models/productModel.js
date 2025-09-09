import prisma from "../config/db.js";

export default {
  findMany: (args = {}) => prisma.product.findMany(args),
  count: (where = {}) => prisma.product.count({ where }),
  create: (data) => prisma.product.create({ data }),
  update: (id, data) => prisma.product.update({ where: { id }, data }),
  remove: (id) => prisma.product.delete({ where: { id } }),
  findById: (id) =>
    prisma.product.findUnique({ where: { id }, include: { category: true } }),
};
