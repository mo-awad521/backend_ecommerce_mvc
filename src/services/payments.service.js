import prisma from "../config/db.js";

export const createPayment = async (
  orderId,
  provider,
  transactionId,
  status
) => {
  return await prisma.payment.create({
    data: { orderId, provider, transactionId, status },
  });
};

export const getPaymentByOrder = async (orderId) => {
  return await prisma.payment.findUnique({ where: { orderId } });
};

export const updatePaymentStatus = async (orderId, status) => {
  return await prisma.payment.update({
    where: { orderId },
    data: { status },
  });
};

//-------------------- Admin Features -------------------------

export const getAllPayments = async (filters = {}) => {
  const { status, page = 1, limit = 10 } = filters;

  const where = status ? { status } : {};
  const skip = (page - 1) * limit;
  const take = parseInt(limit);

  const total = await prisma.payment.count({ where });

  const payments = await prisma.payment.findMany({
    where,
    skip,
    take,
    orderBy: { createdAt: "desc" },
    include: {
      order: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  return {
    page: Number(page),
    limit: take,
    total,
    totalPages: Math.ceil(total / take),
    payments,
  };
};
