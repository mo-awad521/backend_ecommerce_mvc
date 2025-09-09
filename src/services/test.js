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
} from "../controllers/orderController.js";
import {
  authMiddleware,
  adminMiddleware,
} from "../middlewares/authMiddleware.js";

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
