import { PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";
const prisma = new PrismaClient();
import { faker } from "@faker-js/faker";

async function main() {
  const hash = await argon2.hash("secret", {
    hashLength: 10,
  });

  const categories = [
    { name: "Electrician" },
    { name: "Computing" },
    { name: "ICT" },
    { name: "Mechanics" },
    { name: "Marketing" },
    { name: "Healthcare Services" },
  ];

  await prisma.category.createMany({
    data: categories,
  });

  const users = [];

  // Generate 8 freelancers
  for (let i = 0; i < 20; i++) {
    users.push({
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: faker.internet.email(),
      password: hash, // You should replace this with your own password hash
      pictureUrl: faker.image.avatar(),
      role: "freelancer",
      client: undefined,
      freelancer: {
        create: {
          Category: {
            connect: {
              id: (i % categories.length) + 1,
            },
          },
        },
      },
    });
  }

  // Generate 4 clients
  for (let i = 0; i < 10; i++) {
    users.push({
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: faker.internet.email(),
      password: hash, // You should replace this with your own password hash
      pictureUrl: faker.image.avatar(),
      role: "client",
      client: { create: {} },
      freelancer: undefined,
    });
  }

  users.forEach(async (user) => {
    await prisma.user.create({
      //@ts-ignore
      data: user,
    });
  });

  const clients = await prisma.client.findMany();
  const freelancers = await prisma.freelancer.findMany();
  const categoriesSeeded = await prisma.category.findMany();


  const jobs = [
    {
      title: "Software Developer",
      description:
        "We are looking for an experienced software developer to join our team. The ideal candidate will have strong programming skills and be familiar with a variety of software development tools and frameworks.",
      price: 800,
      priceType: "fixed",
      level: "expert",
      CategoryId: 1,
      ClientId: 1,
      FreelancerId: 1,
    },
    {
      title: "Marketing Coordinator",
      description:
        "We are seeking a Marketing Coordinator to support our marketing team. The ideal candidate will be detail-oriented, organized, and able to multitask in a fast-paced environment.",
      price: 30,
      priceType: "hourly",
      level: "intermediate",
      CategoryId: 2,
      ClientId: 1,
      FreelancerId: 2,
    },
    {
      title: "Graphic Designer",
      description:
        "We are looking for a creative and talented Graphic Designer to join our team. The ideal candidate will be proficient in Adobe Creative Suite and have experience creating designs for a variety of mediums.",
      price: 50,
      priceType: "hourly",
      level: "expert",
      CategoryId: 3,
      ClientId: 1,
      FreelancerId: 3,
    },
    {
      title: "Data Analyst",
      description:
        "We are seeking a Data Analyst to join our team. The ideal candidate will be familiar with data analysis tools and techniques, and be able to communicate complex data insights to stakeholders.",
      price: 500,
      priceType: "fixed",
      level: "intermediate",
      CategoryId: 4,
      ClientId: 2,
      FreelancerId: 4,
    },
    {
      title: "Customer Service Representative",
      description:
        "We are looking for a Customer Service Representative to join our team. The ideal candidate will have excellent communication skills and be able to handle a high volume of customer inquiries.",
      price: 20,
      priceType: "hourly",
      level: "beginner",
      CategoryId: 5,
      ClientId: 2,
      FreelancerId: 5,
    },
    {
      title: "Web Designer",
      description:
        "We are seeking a talented Web Designer to join our team. The ideal candidate will have experience designing and developing responsive web pages using HTML, CSS, and JavaScript.",
      price: 75,
      priceType: "hourly",
      level: "expert",
      CategoryId: 3,
      ClientId: 2,
      FreelancerId: 6,
    },
  ];

  clients.forEach((client) => {
    // Generate 3 jobs for each client
    for (let i = 0; i < 3; i++) {
      const freelancer =
        freelancers[Math.floor(Math.random() * freelancers.length)];
      const category =
        categoriesSeeded[Math.floor(Math.random() * categories.length)];

      jobs.forEach(async (job)=>{
       await  prisma.job.create({
          data: {
            title: job.title,
            description: job.description,
            price:job.price,
            priceType: job.priceType,
            level:job.level ,
            Category: {
              connect: {
                id: category.id,
              },
            },
            Client: {
              connect: {
                id: client.id,
              },
            },
            Freelancer: {
              connect: {
                id: freelancer.id,
              },
            },
          },
        })
      })
    }
  });

  //@ts-ignore
  await Promise.all(jobs);

  const seededJobs = await prisma.job.findMany({});

  for (let i = 0; i < seededJobs.length; i++) {
    await prisma.rating.create({
      data: {
        rating: faker.datatype.number({ min: 1, max: 5 }),
        client: {
          connect: {
            id: clients[
              faker.datatype.number({ min: 0, max: clients.length - 1 })
            ].id,
          },
        },
        Job: {
          connect: {
            id: seededJobs[i].id,
          },
        },
        comment: faker.lorem.paragraph(),
        freelancer: {
          connect: {
            id: freelancers[
              faker.datatype.number({ min: 0, max: freelancers.length - 1 })
            ].id,
          },
        },
      },
    });
  }
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
