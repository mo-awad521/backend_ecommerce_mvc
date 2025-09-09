import prisma from "../config/db.js";

export default {
  create: (data) => prisma.order.create({ data }),
  createItems: (data) => prisma.orderItem.createMany({ data }),
  getMine: (userId) =>
    prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } } },
      orderBy: { id: "desc" },
    }),
  getAll: () =>
    prisma.order.findMany({
      include: {
        items: { include: { product: true } },
        payment: true,
        user: true,
      },
      orderBy: { id: "desc" },
    }),
  updateStatus: (id, status) =>
    prisma.order.update({ where: { id }, data: { status } }),
  findById: (id) =>
    prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        payment: true,
        user: true,
      },
    }),
};
