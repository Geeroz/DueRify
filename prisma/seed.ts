import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Hash password for all test users
  const password = await bcrypt.hash('Password123!', 12)

  // 1. Create Incubator Admin (Super Admin)
  const incubatorAdmin = await prisma.user.upsert({
    where: { email: 'admin@duerify.com' },
    update: {},
    create: {
      email: 'admin@duerify.com',
      name: 'Incubator Admin',
      password,
      role: 'INCUBATOR_ADMIN',
    },
  })
  console.log('✅ Created Incubator Admin:', incubatorAdmin.email)

  // 2. Create Test Startups
  const startup1 = await prisma.startup.upsert({
    where: { id: 'startup-1' },
    update: {},
    create: {
      id: 'startup-1',
      name: 'TechVenture AI',
      domain: 'techventure.ai',
      industry: 'Artificial Intelligence',
      description: 'AI-powered solutions for enterprise automation',
      website: 'https://techventure.ai',
    },
  })
  console.log('✅ Created Startup:', startup1.name)

  const startup2 = await prisma.startup.upsert({
    where: { id: 'startup-2' },
    update: {},
    create: {
      id: 'startup-2',
      name: 'GreenEnergy Solutions',
      domain: 'greenenergy.io',
      industry: 'CleanTech',
      description: 'Renewable energy solutions for businesses',
      website: 'https://greenenergy.io',
    },
  })
  console.log('✅ Created Startup:', startup2.name)

  const startup3 = await prisma.startup.upsert({
    where: { id: 'startup-3' },
    update: {},
    create: {
      id: 'startup-3',
      name: 'HealthTech Pro',
      domain: 'healthtech.pro',
      industry: 'HealthTech',
      description: 'Digital health platform for patient care',
      website: 'https://healthtech.pro',
    },
  })
  console.log('✅ Created Startup:', startup3.name)

  // 3. Create Startup Admins
  const startupAdmin1 = await prisma.user.upsert({
    where: { email: 'admin@techventure.ai' },
    update: {},
    create: {
      email: 'admin@techventure.ai',
      name: 'Alice Johnson',
      password,
      role: 'STARTUP_ADMIN',
    },
  })
  console.log('✅ Created Startup Admin:', startupAdmin1.email)

  const startupAdmin2 = await prisma.user.upsert({
    where: { email: 'admin@greenenergy.io' },
    update: {},
    create: {
      email: 'admin@greenenergy.io',
      name: 'Bob Smith',
      password,
      role: 'STARTUP_ADMIN',
    },
  })
  console.log('✅ Created Startup Admin:', startupAdmin2.email)

  // 4. Create Startup Users
  const startupUser1 = await prisma.user.upsert({
    where: { email: 'user@techventure.ai' },
    update: {},
    create: {
      email: 'user@techventure.ai',
      name: 'Charlie Brown',
      password,
      role: 'STARTUP_USER',
    },
  })
  console.log('✅ Created Startup User:', startupUser1.email)

  // 5. Create Investor
  const investor = await prisma.user.upsert({
    where: { email: 'investor@example.com' },
    update: {},
    create: {
      email: 'investor@example.com',
      name: 'Diana Investor',
      password,
      role: 'INVESTOR_VIEWER',
    },
  })
  console.log('✅ Created Investor:', investor.email)

  // 6. Link Incubator Admin to all startups
  await prisma.startupUser.upsert({
    where: {
      userId_startupId: {
        userId: incubatorAdmin.id,
        startupId: startup1.id,
      },
    },
    update: {},
    create: {
      userId: incubatorAdmin.id,
      startupId: startup1.id,
      role: 'INCUBATOR_ADMIN',
    },
  })

  await prisma.startupUser.upsert({
    where: {
      userId_startupId: {
        userId: incubatorAdmin.id,
        startupId: startup2.id,
      },
    },
    update: {},
    create: {
      userId: incubatorAdmin.id,
      startupId: startup2.id,
      role: 'INCUBATOR_ADMIN',
    },
  })

  await prisma.startupUser.upsert({
    where: {
      userId_startupId: {
        userId: incubatorAdmin.id,
        startupId: startup3.id,
      },
    },
    update: {},
    create: {
      userId: incubatorAdmin.id,
      startupId: startup3.id,
      role: 'INCUBATOR_ADMIN',
    },
  })
  console.log('✅ Linked Incubator Admin to all startups')

  // 7. Link Startup Admins to their startups
  await prisma.startupUser.upsert({
    where: {
      userId_startupId: {
        userId: startupAdmin1.id,
        startupId: startup1.id,
      },
    },
    update: {},
    create: {
      userId: startupAdmin1.id,
      startupId: startup1.id,
      role: 'STARTUP_ADMIN',
    },
  })

  await prisma.startupUser.upsert({
    where: {
      userId_startupId: {
        userId: startupAdmin2.id,
        startupId: startup2.id,
      },
    },
    update: {},
    create: {
      userId: startupAdmin2.id,
      startupId: startup2.id,
      role: 'STARTUP_ADMIN',
    },
  })
  console.log('✅ Linked Startup Admins to their startups')

  // 8. Link Startup Users
  await prisma.startupUser.upsert({
    where: {
      userId_startupId: {
        userId: startupUser1.id,
        startupId: startup1.id,
      },
    },
    update: {},
    create: {
      userId: startupUser1.id,
      startupId: startup1.id,
      role: 'STARTUP_USER',
    },
  })
  console.log('✅ Linked Startup User to TechVenture AI')

  // 9. Grant investor access to startup1
  await prisma.investorGrant.upsert({
    where: {
      investorId_startupId: {
        investorId: investor.id,
        startupId: startup1.id,
      },
    },
    update: {},
    create: {
      investorId: investor.id,
      startupId: startup1.id,
      grantedBy: incubatorAdmin.id,
    },
  })
  console.log('✅ Granted investor access to TechVenture AI')

  // 10. Create sample assessments
  await prisma.assessment.create({
    data: {
      startupId: startup1.id,
      trlScore: 75.5,
      mrlScore: 60.0,
      crlScore: 80.0,
      brlScore: 70.5,
      overallScore: 71.5,
      trlData: { level: 7, description: 'System prototype demonstration' },
      completedAt: new Date(),
    },
  })
  console.log('✅ Created assessment for TechVenture AI')

  console.log('\n🎉 Database seeded successfully!')
  console.log('\n📝 Test Accounts Created:')
  console.log('┌─────────────────────────────────────────────────────────┐')
  console.log('│ Super Admin (Incubator Admin)                           │')
  console.log('│ Email: admin@duerify.com                                │')
  console.log('│ Password: Password123!                                  │')
  console.log('│ Role: INCUBATOR_ADMIN (access to all startups)          │')
  console.log('├─────────────────────────────────────────────────────────┤')
  console.log('│ Startup Admin (TechVenture AI)                          │')
  console.log('│ Email: admin@techventure.ai                             │')
  console.log('│ Password: Password123!                                  │')
  console.log('│ Role: STARTUP_ADMIN (full access to TechVenture AI)     │')
  console.log('├─────────────────────────────────────────────────────────┤')
  console.log('│ Startup Admin (GreenEnergy Solutions)                   │')
  console.log('│ Email: admin@greenenergy.io                             │')
  console.log('│ Password: Password123!                                  │')
  console.log('│ Role: STARTUP_ADMIN (full access to GreenEnergy)        │')
  console.log('├─────────────────────────────────────────────────────────┤')
  console.log('│ Startup User (TechVenture AI)                           │')
  console.log('│ Email: user@techventure.ai                              │')
  console.log('│ Password: Password123!                                  │')
  console.log('│ Role: STARTUP_USER (limited access)                     │')
  console.log('├─────────────────────────────────────────────────────────┤')
  console.log('│ Investor                                                │')
  console.log('│ Email: investor@example.com                             │')
  console.log('│ Password: Password123!                                  │')
  console.log('│ Role: INVESTOR_VIEWER (read-only access)                │')
  console.log('└─────────────────────────────────────────────────────────┘')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
