import dotenv from "dotenv";

import prisma from "../src/config/db.js";
//const { PrismaClient } = require("@prisma/client");
// تأكد إن Jest يستخدم .env.test
dotenv.config({ path: ".env.test" });

//const prisma = new PrismaClient();

beforeAll(async () => {
  console.log("⚡ Setting up test DB...");
  await prisma.$connect();
});

// تنظيف البيانات بعد كل اختبار
afterEach(async () => {
  console.log("🧹 Resetting test DB...");
  await prisma.$transaction([
    prisma.review.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.cartItem.deleteMany(),
    prisma.cart.deleteMany(),
    prisma.address.deleteMany(),
    prisma.product.deleteMany(),
    prisma.category.deleteMany(),
    prisma.user.deleteMany(),
  ]);
});

afterAll(async () => {
  console.log("🛑 Disconnecting test DB...");
  await prisma.$disconnect();
});

export default prisma;
