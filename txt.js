// import prisma from "../prismaClient.js";

// /**
//  * إنشاء طلب جديد من الـ Cart
//  */
// export const createOrderFromCart = async (userId, paymentMethod) => {
//   // جلب السلة الخاصة بالمستخدم مع العناصر
//   const cart = await prisma.cart.findUnique({
//     where: { userId },
//     include: { items: { include: { product: true } } },
//   });

//   if (!cart || cart.items.length === 0) {
//     throw new Error("Cart is empty");
//   }

//   // حساب المجموع الكلي
//   const totalAmount = cart.items.reduce((sum, item) => {
//     return sum + item.product.price * item.quantity;
//   }, 0);

//   // إنشاء الطلب + العناصر + الدفع
//   const order = await prisma.order.create({
//     data: {
//       userId,
//       totalAmount,
//       paymentMethod,
//       status: "PENDING",
//       items: {
//         create: cart.items.map((item) => ({
//           productId: item.productId,
//           quantity: item.quantity,
//           price: item.product.price,
//         })),
//       },
//       payment: {
//         create: {
//           provider: paymentMethod || "CASH_ON_DELIVERY",
//           status: "PENDING",
//         },
//       },
//     },
//     include: {
//       items: { include: { product: true } },
//       payment: true,
//     },
//   });

//   // تفريغ السلة بعد الطلب (اختياري)
//   await prisma.cartItem.deleteMany({
//     where: { cartId: cart.id },
//   });

//   return order;
// };

// /**
//  * جلب الطلبات الخاصة بالمستخدم
//  */
// export const getUserOrders = async (userId) => {
//   return prisma.order.findMany({
//     where: { userId },
//     include: {
//       items: { include: { product: true } },
//       payment: true,
//     },
//     orderBy: { createdAt: "desc" },
//   });
// };

// /**
//  * جلب طلب محدد (يتأكد أنه تابع للمستخدم)
//  */
// export const getOrderById = async (userId, orderId) => {
//   const order = await prisma.order.findFirst({
//     where: { id: orderId, userId },
//     include: {
//       items: { include: { product: true } },
//       payment: true,
//     },
//   });

//   if (!order) {
//     throw new Error("Order not found or not authorized");
//   }

//   return order;
// };

// /**
//  * إلغاء طلب
//  */
// export const cancelOrder = async (userId, orderId) => {
//   const order = await prisma.order.findFirst({
//     where: { id: orderId, userId },
//   });

//   if (!order) throw new Error("Order not found or not authorized");
//   if (order.status !== "PENDING")
//     throw new Error("Only pending orders can be canceled");

//   return prisma.order.update({
//     where: { id: orderId },
//     data: { status: "CANCELED" },
//   });
// };

// /**
//  * تحديث حالة الطلب (Admin فقط)
//  */
// export const updateOrderStatus = async (orderId, status) => {
//   return prisma.order.update({
//     where: { id: orderId },
//     data: { status },
//   });
// };

// //import * as orderService from "../services/orderService.js";

// /**
// * إنشاء طلب من Cart (Checkout)
// */
// export const createOrder = async (req, res) => {
//   try {
//     const userId = req.user.id; // من الـ JWT
//     const { paymentMethod } = req.body;

//     const order = await orderService.createOrderFromCart(userId, paymentMethod);

//     res.status(201).json({
//       message: "Order created successfully from cart",
//       order,
//     });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

// /**
// * جلب الطلبات الخاصة بالمستخدم
// */
// export const getOrders = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const orders = await orderService.getUserOrders(userId);
//     res.json(orders);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

// /**
// * جلب تفاصيل طلب محدد
// */
// export const getOrderById = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const orderId = parseInt(req.params.id, 10);

//     const order = await orderService.getOrderById(userId, orderId);

//     res.json(order);
//   } catch (error) {
//     res.status(404).json({ error: error.message });
//   }
// };

// /**
// * إلغاء الطلب (للمستخدم)
// */
// export const cancelOrder = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const orderId = parseInt(req.params.id, 10);

//     const order = await orderService.cancelOrder(userId, orderId);

//     res.json({ message: "Order canceled successfully", order });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

// /**
// * تحديث حالة الطلب (Admin فقط)
// */
// export const updateOrderStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;

//     const order = await orderService.updateOrderStatus(parseInt(id, 10), status);

//     res.json({ message: "Order status updated", order });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

import express from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
} from "./src/controllers/orderController.js";
import {
  authMiddleware,
  adminMiddleware,
} from "./src/middlewares/authMiddleware.js";

const router = express.Router();

// المستخدم: Checkout من Cart
router.post("/", authMiddleware, createOrder);

// المستخدم: عرض الطلبات
router.get("/", authMiddleware, getOrders);

// المستخدم: عرض تفاصيل طلب محدد
router.get("/:id", authMiddleware, getOrderById);

// المستخدم: إلغاء طلب
router.patch("/:id/cancel", authMiddleware, cancelOrder);

// أدمن: تحديث حالة الطلب
router.patch("/:id/status", authMiddleware, adminMiddleware, updateOrderStatus);

export default router;

///تحبني أضيفلك كمان endpoint لحساب متوسط التقييم (avgRating) للمنتج بحيث تجيبه مع /reviews/product/:id بدل ما ترجع بس المراجعات؟

import prisma from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { CustomResponse, ResponseStatus } from "../utils/customResponse.js";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js"; // تحتاج تعمل util لإرسال البريد

export const register = async ({
  name,
  email,
  password,
  role = "CUSTOMER",
}) => {
  if (await prisma.user.findUnique({ where: { email } }))
    throw new CustomResponse(ResponseStatus.FORBIDDEN, "Email already in use");

  const hashedPassword = await bcrypt.hash(password, 10);

  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // ساعة واحدة

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      verificationToken,
      verificationTokenExpires,
    },
  });

  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

  await sendEmail(
    email,
    "Verify Your Account",
    `Click here to verify your account: ${verificationUrl}`
  );

  return user;
};

export const verifyEmail = async (token) => {
  const user = await prisma.user.findFirst({
    where: { verificationToken: token },
  });

  if (!user) {
    // check لو الحساب متفعل مسبقًا لكن التوكن null
    const alreadyUser = await prisma.user.findFirst({
      where: { isVerified: true },
    });

    if (alreadyUser) {
      return { alreadyVerified: true, message: "Account already verified" };
    }

    throw new CustomResponse(
      ResponseStatus.NOT_FOUND,
      "Invalid or expired token"
    );
  }

  if (user.isVerified) {
    return { alreadyVerified: true, message: "Account already verified" };
  }

  if (user.verificationTokenExpires < new Date()) {
    throw new CustomResponse(ResponseStatus.FORBIDDEN, "Token expired");
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      verificationToken: null,
      verificationTokenExpires: null,
    },
  });

  return updatedUser;
};

// export const verifyEmail = async (token) => {
//   const user = await prisma.user.findFirst({
//     where: { verificationToken: token },
//   });

//   if (!user) throw new Error("Invalid or expired token");

//   const updatedUser = await prisma.user.update({
//     where: { id: Number(user.id) },
//     data: {
//       isVerified: true,
//       verificationToken: null,
//     },
//   });

//   console.log("✅ Updated User:", updatedUser);
//   return updatedUser;
// };

export const resendVerificationEmail = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.isVerified) {
    throw new Error("Account already verified");
  }

  // 🔑 إنشاء توكن جديد
  const verificationToken = crypto.randomBytes(32).toString("hex");

  // تحديث المستخدم بالتوكن الجديد وصلاحيته
  await prisma.user.update({
    where: { id: user.id },
    data: {
      verificationToken,
      verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
    },
  });

  // 🔗 رابط التفعيل
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

  // ✉️ إرسال الإيميل
  await sendEmail({
    to: user.email,
    subject: "Verify Your Email (Resent Link)",
    html: `<p>Please verify your email by clicking the link below:</p>
           <a href="${verificationUrl}">${verificationUrl}</a>`,
  });

  return { message: "Verification email resent successfully" };
};

export const requestPasswordReset = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");

  const resetToken = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 3600000); // ساعة صلاحية

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken: resetToken,
      resetPasswordExpires: expires,
    },
  });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  await sendEmail(
    email,
    "Reset Password",
    `Reset your password here: ${resetUrl}`
  );

  return true;
};

export const resetPassword = async (token, newPassword) => {
  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: token,
      resetPasswordExpires: { gt: new Date() },
    },
  });

  if (!user) throw new Error("Invalid or expired token");

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    },
  });

  return true;
};

// old register
export const register1 = async ({
  name,
  email,
  password,
  role = "CUSTOMER",
}) => {
  if (email === (await prisma.user.findUnique({ where: { email } }))?.email)
    throw new CustomResponse(
      ResponseStatus.FORBIDDEN,
      "This email is Already used"
    );

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, role },
  });
  return user;
};

export const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });

  // المستخدم غير موجود
  if (!user) {
    throw new CustomResponse(400, "Login Failed");
  }

  // كلمة المرور غير صحيحة
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new CustomResponse(400, "Login Failed");
  }

  // الحساب غير مفعل
  if (!user.isVerified) {
    throw new CustomResponse(403, "Please verify your email first");
  }

  // إنشاء التوكن
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  return new CustomResponse(200, "Login Successfully", {
    token,
    user,
  });
};

export const getProfile = async (userId) => {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: { addresses: true },
  });
};
