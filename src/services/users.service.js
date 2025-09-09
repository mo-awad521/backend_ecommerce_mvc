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
  if (!user) throw new Error("User not found");
  //CustomResponse(ResponseStatus.NOT_FOUND, "User not found");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

  return { user, token };
};

export const getProfile = async (userId) => {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: { addresses: true },
  });
};
