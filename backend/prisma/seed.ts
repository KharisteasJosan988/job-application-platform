import { PrismaClient, JobType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  const company = await prisma.user.upsert({
    where: { email: 'hr@techcorp.id' },
    update: {},
    create: {
      email: 'hr@techcorp.id',
      password: passwordHash,
      name: 'HR TechCorp',
      role: 'COMPANY',
      companyName: 'TechCorp Indonesia',
    },
  });

  const jobSeeker = await prisma.user.upsert({
    where: { email: 'jobseeker@example.com' },
    update: {},
    create: {
      email: 'jobseeker@example.com',
      password: passwordHash,
      name: 'Budi Santoso',
      role: 'JOB_SEEKER',
    },
  });

  await prisma.job.createMany({
    data: [
      {
        title: 'Backend Developer',
        description: 'Membangun dan memelihara REST API menggunakan Node.js dan PostgreSQL.',
        location: 'Yogyakarta',
        salary: 'Rp 7.000.000 - Rp 10.000.000',
        jobType: JobType.FULL_TIME,
        companyId: company.id,
      },
      {
        title: 'Frontend Developer (React)',
        description: 'Mengembangkan antarmuka pengguna dengan React.js dan TypeScript.',
        location: 'Jakarta (Remote)',
        salary: 'Rp 8.000.000 - Rp 12.000.000',
        jobType: JobType.FULL_TIME,
        companyId: company.id,
      },
      {
        title: 'IT Intern',
        description: 'Membantu tim engineering dalam pengembangan fitur produk.',
        location: 'Yogyakarta',
        salary: 'Rp 1.500.000',
        jobType: JobType.INTERNSHIP,
        companyId: company.id,
      },
    ],
  });

  console.log('Seed selesai.');
  console.log('Akun Company  -> email: hr@techcorp.id       | password: password123');
  console.log('Akun JobSeeker-> email: jobseeker@example.com | password: password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
