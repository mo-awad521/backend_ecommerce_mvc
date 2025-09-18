// tests/categories.test.js
import request from "supertest";
import app from "../src/app.js";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

let customerToken;
let adminToken;
let createdCategoryId;

beforeEach(async () => {
  console.log("🧹 Resetting test DB...");
  await prisma.review.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash("password123", 10);

  // 👤 إنشاء مستخدم customer
  await prisma.user.create({
    data: {
      name: "Customer User",
      email: "customer@example.com",
      password,
      role: "CUSTOMER",
      isVerified: true,
    },
  });

  // 👤 إنشاء مستخدم admin
  await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@example.com",
      password,
      role: "ADMIN",
      isVerified: true,
    },
  });

  // 🔑 تسجيل دخول customer
  const customerRes = await request(app).post("/api/users/login").send({
    email: "customer@example.com",
    password: "password123",
  });
  expect(customerRes.statusCode).toBe(200);
  customerToken = customerRes.body.data.token;

  // 🔑 تسجيل دخول admin
  const adminRes = await request(app).post("/api/users/login").send({
    email: "admin@example.com",
    password: "password123",
  });
  expect(adminRes.statusCode).toBe(200);
  adminToken = adminRes.body.data.token;
}, 15000);

afterAll(async () => {
  console.log("🛑 Disconnecting test DB...");
  await prisma.$disconnect();
});

describe("E2E - Categories API", () => {
  it("should return empty categories initially", async () => {
    const res = await request(app).get("/api/categories");
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it("should NOT allow creating category without token", async () => {
    const res = await request(app).post("/api/categories").send({
      name: "Electronics",
    });
    expect(res.statusCode).toBe(401);
  });

  it("should NOT allow creating category with customer token", async () => {
    const res = await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ name: "Electronics" });

    expect(res.statusCode).toBe(403);
  });

  it("should allow admin to create category", async () => {
    const res = await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Electronics" });

    expect(res.statusCode).toBe(201);
    expect(res.body.data).toHaveProperty("id");
    expect(res.body.data).toHaveProperty("name", "Electronics");
    createdCategoryId = res.body.data.id;
  });

  it("should get category by id", async () => {
    // إنشاء category أولاً
    const createRes = await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Books" });

    const id = createRes.body.data.id;

    const res = await request(app).get(`/api/categories/${id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty("id", id);
  });

  it("should return 404 if category not found", async () => {
    const res = await request(app).get("/api/categories/99999");
    expect(res.statusCode).toBe(404);
  });

  it("should allow admin to update category", async () => {
    // إنشاء category أولاً
    const createRes = await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Fashion" });

    const id = createRes.body.data.id;

    const res = await request(app)
      .put(`/api/categories/${id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Updated Fashion" });

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty("name", "Updated Fashion");
  });

  it("should NOT allow customer to update category", async () => {
    // إنشاء category أولاً
    const createRes = await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Sports" });

    const id = createRes.body.data.id;

    const res = await request(app)
      .put(`/api/categories/${id}`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ name: "Updated Sports" });

    expect(res.statusCode).toBe(403);
  });

  it("should allow admin to delete category", async () => {
    // إنشاء category أولاً
    const createRes = await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Delete Me" });

    const id = createRes.body.data.id;

    const res = await request(app)
      .delete(`/api/categories/${id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Deleted");
  });
});
