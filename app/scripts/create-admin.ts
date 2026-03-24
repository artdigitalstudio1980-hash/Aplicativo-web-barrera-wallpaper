import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'barrerawallpaperai@gmail.com';
  const password = 'elementos8003';
  const name = 'Oscar Barrera';

  console.log(`🚀 Creando administrador: ${name} (${email})...`);

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      isAdmin: true,
      role: 'ADMIN',
      password: hashedPassword,
      name: name,
    },
    create: {
      email,
      name,
      password: hashedPassword,
      isAdmin: true,
      role: 'ADMIN',
    },
  });

  console.log('✅ ¡Administrador creado/actualizado con éxito!');
  console.log(`ID del usuario: ${user.id}`);
}

main()
  .catch((e) => {
    console.error('❌ Error al crear el administrador:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
