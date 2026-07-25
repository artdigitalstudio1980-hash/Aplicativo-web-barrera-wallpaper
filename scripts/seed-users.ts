import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const USERS = [
  {
    firstName: 'Admin',
    lastName: 'Barrera',
    name: 'Admin Barrera',
    email: 'admin@barrera.com',
    password: 'Admin123!',
    phone: '+1 (305) 555-0100',
    role: 'ADMIN' as const,
    isAdmin: true,
  },
  {
    firstName: 'Maria',
    lastName: 'Garcia',
    name: 'Maria Garcia',
    email: 'maria@email.com',
    password: 'Visitor1!',
    phone: '+1 (305) 555-0101',
    role: 'USER' as const,
    isAdmin: false,
  },
  {
    firstName: 'Carlos',
    lastName: 'Lopez',
    name: 'Carlos Lopez',
    email: 'carlos@email.com',
    password: 'Visitor2!',
    phone: '+1 (305) 555-0102',
    role: 'USER' as const,
    isAdmin: false,
  },
];

async function main() {
  console.log('🌱 Seeding users...');

  for (const userData of USERS) {
    const existing = await prisma.user.findUnique({ where: { email: userData.email } });

    if (existing) {
      console.log(`  ⏭️  ${userData.email} already exists, skipping`);
      continue;
    }

    const hashedPassword = await bcrypt.hash(userData.password, 12);

    await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
      },
    });

    console.log(`  ✅ Created ${userData.email} (${userData.isAdmin ? 'Admin' : 'Visitor'})`);
  }

  console.log('\n✅ Seed complete!');
  console.log('   Credentials:');
  console.log('   ┌──────────────────────┬──────────────┬──────────────┐');
  console.log('   │ Email                │ Password     │ Role         │');
  console.log('   ├──────────────────────┼──────────────┼──────────────┤');
  console.log('   │ admin@barrera.com    │ Admin123!    │ Admin        │');
  console.log('   │ maria@email.com      │ Visitor1!    │ Visitor      │');
  console.log('   │ carlos@email.com     │ Visitor2!    │ Visitor      │');
  console.log('   └──────────────────────┴──────────────┴──────────────┘');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
