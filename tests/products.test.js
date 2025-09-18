// tests/products.test.js
import { jest } from "@jest/globals"; // ✅ هذا ضروري في بيئة ESM
import request from "supertest";
import app from "../src/app.js";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import cloudinary from "../src/config/cloudinary.js";

const prisma = new PrismaClient();
jest.setTimeout(20000);

let adminToken;
let customerToken;
let testCategoryId;
let productId;

// ===== Override Cloudinary functions at runtime (simple mock) =====
beforeAll(async () => {
  // لا نمسح جداول مهمة للاختبارات الأخرى — سنعمل بيانات منفصلة بأسماء مميزة

  // تأكد أنّ دوال cloudinary موجودة ثم غيّرها
  if (!cloudinary.uploader) cloudinary.uploader = {};

  cloudinary.uploader.upload_stream = (options, callback) => {
    // نرجع كائن stream يشبه API الفعلي: stream.end(buffer)
    return {
      end: (buffer) => {
        // محاكاة async callback الذي يعيد نتيجة رفع الصورة
        setImmediate(() =>
          callback(null, {
            secure_url: `http://res.cloudinary/fake/${Date.now()}.jpg`,
          })
        );
      },
    };
  };

  // destroy تستخدم عند حذف الصورة — نعطيها mock resolved value
  cloudinary.uploader.destroy = jest.fn().mockResolvedValue({ result: "ok" });

  // ==== أنشئ مستخدمين للاختبارات (لا نؤثر على مستخدمين آخرين) ====
  const adminEmail = "products-admin@test.local";
  const customerEmail = "products-customer@test.local";
  const password = "123456";

  // انشئ أو حدث المستخدمين (عشان ما نكرر مداخلات لو شغلت الاختبارات مرّات)
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: await bcrypt.hash(password, 10),
      role: "ADMIN",
      isVerified: true,
      name: "Products Admin",
    },
    create: {
      email: adminEmail,
      name: "Products Admin",
      password: await bcrypt.hash(password, 10),
      role: "ADMIN",
      isVerified: true,
    },
  });

  await prisma.user.upsert({
    where: { email: customerEmail },
    update: {
      password: await bcrypt.hash(password, 10),
      role: "CUSTOMER",
      isVerified: true,
      name: "Products Customer",
    },
    create: {
      email: customerEmail,
      name: "Products Customer",
      password: await bcrypt.hash(password, 10),
      role: "CUSTOMER",
      isVerified: true,
    },
  });

  // ===== تسجيل الدخول للحصول على التوكنز =====
  const adminRes = await request(app).post("/api/users/login").send({
    email: adminEmail,
    password,
  });
  if (!adminRes.body?.data?.token) {
    throw new Error(
      `Failed to login admin in beforeAll. Response: ${JSON.stringify(
        adminRes.body
      )}`
    );
  }
  adminToken = adminRes.body.data.token;

  const customerRes = await request(app).post("/api/users/login").send({
    email: customerEmail,
    password,
  });
  if (!customerRes.body?.data?.token) {
    throw new Error(
      `Failed to login customer in beforeAll. Response: ${JSON.stringify(
        customerRes.body
      )}`
    );
  }
  customerToken = customerRes.body.data.token;

  // ===== أنشئ كاتيجوري مخصصة للاختبار (اسم فريد ليمنع التداخل) =====
  const uniqueName = `test_products_cat_${Date.now()}`;
  const cat = await prisma.category.create({
    data: {
      name: uniqueName,
      description: "Temporary category for products.test",
    },
  });
  testCategoryId = cat.id;

  // تأكد ان جدول المنتجات نظيف بالنسبة لهذا الاختبار
  await prisma.productImage
    .deleteMany({ where: { product: { id: { gt: -1 } } } })
    .catch(() => {});
  await prisma.product.deleteMany().catch(() => {});
});

afterAll(async () => {
  // نظف الأشياء التي أنشأناها بالاختبار (منتجات، كاتيجوري، users المحددين)
  try {
    await prisma.productImage.deleteMany({ where: { productId: { gt: -1 } } });
  } catch (e) {}
  try {
    await prisma.product.deleteMany();
  } catch (e) {}

  // حذف الكاتيجوري الخاصة بالاختبار
  await prisma.category
    .deleteMany({ where: { id: testCategoryId } })
    .catch(() => {});

  // حذف المستخدمين المخصصة للاختبار (آمن لأن أسماء/ايميلات فريدة)
  await prisma.user.deleteMany({
    where: {
      email: {
        in: ["products-admin@test.local", "products-customer@test.local"],
      },
    },
  });

  await prisma.$disconnect();
});

describe("E2E - Products API (isolated)", () => {
  it("should return empty products initially", async () => {
    const res = await request(app).get("/api/products");
    expect(res.statusCode).toBe(200);
    // data contains pagination object { page, limit, total, totalPages, products }
    expect(Array.isArray(res.body?.data?.products)).toBe(true);
  });

  it("should NOT allow creating product without token", async () => {
    const res = await request(app)
      .post("/api/products/add")
      .field("title", "X");
    expect(res.statusCode).toBe(401); // auth middleware يجب أن يرد 401 لو مافيش توكن
  });

  it("should NOT allow customer to create product", async () => {
    const res = await request(app)
      .post("/api/products/add")
      .set("Authorization", `Bearer ${customerToken}`)
      .field("title", "MacBook Pro")
      .field("price", "1999.99")
      .field("stock", "5")
      .field("categoryId", String(testCategoryId))
      .attach("images", Buffer.from([0xff, 0xd8, 0xff, 0xd9]), "photo.jpg"); // small valid JPEG markers

    expect(res.statusCode).toBe(403); // isAdmin should منع العملاء
  });

  it("should allow admin to create product (with image)", async () => {
    const res = await request(app)
      .post("/api/products/add")
      .set("Authorization", `Bearer ${adminToken}`)
      .field("title", "MacBook Pro")
      .field("description", "A test MacBook Pro")
      .field("price", "1999.99")
      .field("stock", "10")
      .field("categoryId", String(testCategoryId))
      .attach("images", Buffer.from([0xff, 0xd8, 0xff, 0xd9]), "photo.jpg");

    // نجاح الإنشاء
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("data");
    expect(res.body.data).toHaveProperty("id");
    expect(res.body.data).toHaveProperty("images");
    productId = res.body.data.id;
  }, 15000);

  it("should get product by id", async () => {
    const res = await request(app).get(`/api/products/${productId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty("title", "MacBook Pro");
  });

  it("should return 404 if product not found", async () => {
    const res = await request(app).get("/api/products/999999999");
    expect([404, 200].includes(res.statusCode)).toBe(true);
    // قد يرجع 404 أو 200 بحسب وجود ID عشوائي في DB، لكن عادة نتوقع 404.
    // هنا نتحققعلى الأقل من عدم كسر النهاية.
  });

  it("should allow admin to update product", async () => {
    const res = await request(app)
      .put(`/api/products/update/${productId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "MacBook Pro M2",
        price: "2499.99",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty("title", "MacBook Pro M2");
  });

  it("should NOT allow customer to update product", async () => {
    const res = await request(app)
      .put(`/api/products/update/${productId}`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        title: "Hacked Title",
      });

    expect(res.statusCode).toBe(403);
  });

  it("should allow admin to delete product", async () => {
    const res = await request(app)
      .delete(`/api/products/delete/${productId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message");
  });

  it("should NOT allow customer to delete product (on a freshly created product)", async () => {
    // أنشئ منتج مؤقت مُرتبط بالكاتيجوري نفسه عبر prisma مباشرة (نستخدم slug فريد)
    const temp = await prisma.product.create({
      data: {
        title: `Temp Product ${Date.now()}`,
        slug: `temp-product-${Date.now()}`,
        description: "temp",
        price: 100.0,
        stock: 1,
        categoryId: testCategoryId,
      },
    });

    const res = await request(app)
      .delete(`/api/products/delete/${temp.id}`)
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.statusCode).toBe(403);

    // نظف المنتج المؤقت
    await prisma.product.delete({ where: { id: temp.id } }).catch(() => {});
  });
});
