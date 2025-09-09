import prisma from "../config/db.js";

export const addReview = async (userId, productId, { rating, comment }) => {
  // تحقق إذا كان المستخدم قيّم المنتج من قبل
  const existingReview = await prisma.review.findUnique({
    where: { productId_userId: { productId, userId } },
  });

  if (existingReview) {
    throw new Error("You already reviewed this product");
  }

  // إضافة مراجعة جديدة
  const review = await prisma.review.create({
    data: {
      rating,
      comment,
      productId,
      userId,
    },
  });

  // تحديث متوسط التقييم
  await updateProductAvgRating(productId);

  return review;
};

export const updateReview = async (userId, productId, { rating, comment }) => {
  const review = await prisma.review.update({
    where: { productId_userId: { productId, userId } },
    data: { rating, comment },
  });

  await updateProductAvgRating(productId);
  return review;
};

export const deleteReview = async (userId, productId) => {
  await prisma.review.delete({
    where: { productId_userId: { productId, userId } },
  });

  await updateProductAvgRating(productId);
  return true;
};

export const getProductReviews = async (productId) => {
  return await prisma.review.findMany({
    where: { productId },
    include: {
      user: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

const updateProductAvgRating = async (productId) => {
  const result = await prisma.review.aggregate({
    where: { productId },
    _avg: { rating: true },
  });

  await prisma.product.update({
    where: { id: productId },
    data: { avgRating: result._avg.rating || 0 },
  });
};
