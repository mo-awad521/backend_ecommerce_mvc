// tests/users.e2e.test.js
import request from "supertest";
import app from "../src/app.js"; // ملف express الرئيسي
import prisma from "../src/config/db.js";
import bcrypt from "bcrypt";

beforeAll(async () => {
  // تنظيف الجدول قبل الاختبار
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("E2E - User Auth", () => {
  it("should register a new user", async () => {
    const res = await request(app).post("/api/users/register").send({
      name: "Test User",
      email: "test@example.com",
      password: "mypassword123",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("Register New User");
    expect(res.body.data).toHaveProperty("id");
    expect(res.body.data.email).toBe("test@example.com");
  });

  it("should login successfully with correct credentials", async () => {
    // ⚡ هنا نعمل hash صحيح عشان نضمن الدخول
    const password = "mypassword123";
    const hashedPassword = await bcrypt.hash(password, 10);

    // نحدث كلمة المرور يدويًا في DB (تأكيد إنها مشفرة)
    await prisma.user.update({
      where: { email: "test@example.com" },
      data: { password: hashedPassword },
    });

    const res = await request(app).post("/api/users/login").send({
      email: "test@example.com",
      password,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Login Successfully");
    expect(res.body.data).toHaveProperty("token");
  });

  it("should fail with wrong password", async () => {
    const res = await request(app).post("/api/users/login").send({
      email: "test@example.com",
      password: "wrongPassword",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Login Faild");
  });
});
