const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedServices() {
  try {
    const services = [
      {
        name: 'Basic Photo Editing',
        cost: 10,
      },
      {
        name: 'Premium Photo Editing',
        cost: 25,
      },
      {
        name: 'Video Editing (Short)',
        cost: 50,
      },
      {
        name: 'Video Editing (Long)',
        cost: 100,
      },
      {
        name: 'Graphic Design',
        cost: 75,
      },
    ];

    for (const service of services) {
      await prisma.service.create({
        data: service,
      });
      console.log(`Created service: ${service.name}`);
    }

    console.log('Service seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding services:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedServices();