import prisma from "../config/db.js";
import { CustomResponse, ResponseStatus } from "../utils/customResponse.js";

export const getAddressesByUser = async (userId) => {
  return await prisma.address.findMany({ where: { userId } });
};

export const createAddress = async (userId, data) => {
  return await prisma.address.create({ data: { ...data, userId } });
};

export const updateAddress = async (userId, addressId, data) => {
  // تحقق هل العنوان يعود للمستخدم
  const address = await prisma.address.findUnique({
    where: { id: addressId },
  });

  if (!address || address.userId !== userId) {
    //console.log(address.userId);
    //console.log(userId);
    throw new CustomResponse(
      ResponseStatus.FORBIDDEN,
      "Not authorized to update this address"
    );
  }

  return await prisma.address.update({
    where: { id: addressId },
    data,
  });
};

export const deleteAddress = async (userId, addressId) => {
  // تحقق هل العنوان يعود للمستخدم
  const address = await prisma.address.findUnique({
    where: { id: addressId },
  });

  if (!address || address.userId !== userId) {
    throw new CustomResponse(
      ResponseStatus.FORBIDDEN,
      "Not authorized to Delete this address"
    );
  }
  return await prisma.address.delete({ where: { id: addressId } });
};
