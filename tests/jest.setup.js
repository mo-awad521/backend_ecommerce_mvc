const prisma = new PrismaClient();

beforeAll(async () => {
  // تأكد أن الـ DB نظيفة
  await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0;`;
  const tables = await prisma.$queryRaw`
    SELECT table_name FROM information_schema.tables WHERE table_schema = 'ecommerce_test';
  `;
  for (const { table_name } of tables) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${table_name};`);
  }
  await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1;`;
});

afterAll(async () => {
  await prisma.$disconnect();
});
