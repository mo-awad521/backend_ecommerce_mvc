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
