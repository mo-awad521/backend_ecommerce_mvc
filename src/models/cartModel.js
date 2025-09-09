import prisma from "../config/db.js";

export default {
  getByUserId: (userId) => prisma.cart.findUnique({ where: { userId } }),
  createForUser: (userId) => prisma.cart.create({ data: { userId } }),
  getFullById: (id) =>
    prisma.cart.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    }),
  findItem: (cartId, productId) =>
    prisma.cartItem.findFirst({ where: { cartId, productId } }),
  addItem: (data) => prisma.cartItem.create({ data }),
  updateItemQty: (id, quantity) =>
    prisma.cartItem.update({ where: { id }, data: { quantity } }),
  removeItem: (id) => prisma.cartItem.delete({ where: { id } }),
  clear: (cartId) => prisma.cartItem.deleteMany({ where: { cartId } }),
};
