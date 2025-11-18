import { PrismaClient, UserRole, AssessmentType, ProtocolAudience } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seed...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@claramente.app' },
    update: {},
    create: {
      email: 'admin@claramente.app',
      name: 'ClaraMENTE Admin',
      password: adminPassword,
      role: UserRole.ADMIN,
      verified: true,
      onboardCompleted: true,
      termsAccepted: true,
    },
  })

  // Create professional user
  const professionalPassword = await bcrypt.hash('prof123', 10)
  const professional = await prisma.user.upsert({
    where: { email: 'psicolog@claramente.app' },
    update: {},
    create: {
      email: 'psicolog@claramente.app',
      name: 'Dr. Clara Psicóloga',
      password: professionalPassword,
      role: UserRole.PROFESSIONAL,
      verified: true,
      onboardCompleted: true,
      termsAccepted: true,
      professionalProfile: {
        create: {
          registrationNumber: 'CRP-123456',
          specialties: ['TCC', 'DBT', 'Ansiedade', 'Depressão'],
          bio: 'Psicóloga especializada em Terapia Cognitivo-Comportamental e Terapia Dialética Comportamental.',
          hourlyRate: 150.00,
          availability: {
            monday: ['09:00-12:00', '14:00-18:00'],
            tuesday: ['09:00-12:00', '14:00-18:00'],
            wednesday: ['09:00-12:00', '14:00-18:00'],
            thursday: ['09:00-12:00', '14:00-18:00'],
            friday: ['09:00-12:00', '14:00-16:00'],
          },
        },
      },
    },
  })

  // Create regular user
  const userPassword = await bcrypt.hash('user123', 10)
  const user = await prisma.user.upsert({
    where: { email: 'usuario@claramente.app' },
    update: {},
    create: {
      email: 'usuario@claramente.app',
      name: 'João Silva',
      password: userPassword,
      role: UserRole.USER,
      verified: true,
      onboardCompleted: true,
      termsAccepted: true,
    },
  })

  // Create PHQ-9 Assessment
  await prisma.assessment.upsert({
    where: { type_version: { type: AssessmentType.PHQ9, version: '1.0' } },
    update: {},
    create: {
      type: AssessmentType.PHQ9,
      name: 'Patient Health Questionnaire-9 (PHQ-9)',
      version: '1.0',
      description: 'Questionário para avaliação de sintomas depressivos',
      items: {
        questions: [
          'Pouco interesse ou prazer em fazer as coisas',
          'Se sentir desanimado(a), deprimido(a) ou sem esperança',
          'Dificuldade para adormecer, continuar dormindo ou dormir demais',
          'Se sentir cansado(a) ou com pouca energia',
          'Falta de apetite ou comer demais',
          'Se sentir mal consigo mesmo(a) - ou se sentir um fracasso ou ter se decepcionado ou ter decepcionado sua família',
          'Dificuldade de concentração nas coisas (como ler o jornal ou assistir televisão)',
          'Lentidão para se mover ou falar (a ponto de outras pessoas perceberem), ou o oposto - ficar muito agitado(a) ou inquieto(a)',
          'Pensar em se ferir de alguma maneira ou que seria melhor estar morto(a)'
        ],
        scale: [
          { value: 0, label: 'Nenhuma vez' },
          { value: 1, label: 'Vários dias' },
          { value: 2, label: 'Mais da metade dos dias' },
          { value: 3, label: 'Quase todos os dias' }
        ]
      },
      scoring: {
        ranges: [
          { min: 0, max: 4, severity: 'Mínimo', description: 'Sintomas mínimos de depressão' },
          { min: 5, max: 9, severity: 'Leve', description: 'Sintomas leves de depressão' },
          { min: 10, max: 14, severity: 'Moderado', description: 'Sintomas moderados de depressão' },
          { min: 15, max: 19, severity: 'Moderadamente Severo', description: 'Sintomas moderadamente severos de depressão' },
          { min: 20, max: 27, severity: 'Severo', description: 'Sintomas severos de depressão' }
        ]
      },
      publishedAt: new Date(),
    },
  })

  // Create GAD-7 Assessment
  await prisma.assessment.upsert({
    where: { type_version: { type: AssessmentType.GAD7, version: '1.0' } },
    update: {},
    create: {
      type: AssessmentType.GAD7,
      name: 'Generalized Anxiety Disorder 7-item (GAD-7)',
      version: '1.0',
      description: 'Questionário para avaliação de sintomas de ansiedade generalizada',
      items: {
        questions: [
          'Se sentir nervoso(a), ansioso(a) ou tenso(a)',
          'Não conseguir parar ou controlar as preocupações',
          'Se preocupar demais com diferentes coisas',
          'Dificuldade para relaxar',
          'Ficar tão inquieto(a) que se torna difícil permanecer sentado(a)',
          'Ficar facilmente irritado(a) ou chateado(a)',
          'Sentir medo como se algo terrível fosse acontecer'
        ],
        scale: [
          { value: 0, label: 'Nenhuma vez' },
          { value: 1, label: 'Vários dias' },
          { value: 2, label: 'Mais da metade dos dias' },
          { value: 3, label: 'Quase todos os dias' }
        ]
      },
      scoring: {
        ranges: [
          { min: 0, max: 4, severity: 'Mínimo', description: 'Sintomas mínimos de ansiedade' },
          { min: 5, max: 9, severity: 'Leve', description: 'Sintomas leves de ansiedade' },
          { min: 10, max: 14, severity: 'Moderado', description: 'Sintomas moderados de ansiedade' },
          { min: 15, max: 21, severity: 'Severo', description: 'Sintomas severos de ansiedade' }
        ]
      },
      publishedAt: new Date(),
    },
  })

  // Create TCC Protocol for Anxiety
  await prisma.protocol.upsert({
    where: { name_version: { name: 'TCC Ansiedade', version: '1.0' } },
    update: {},
    create: {
      name: 'TCC Ansiedade',
      version: '1.0',
      description: 'Protocolo de Terapia Cognitivo-Comportamental para tratamento de ansiedade',
      audience: ProtocolAudience.USER,
      steps: {
        sessions: [
          {
            id: 1,
            title: 'Psicoeducação sobre Ansiedade',
            description: 'Compreender o que é ansiedade e como ela funciona',
            activities: [
              {
                type: 'reading',
                title: 'O que é ansiedade?',
                content: 'A ansiedade é uma resposta natural do corpo a situações de perigo...'
              },
              {
                type: 'exercise',
                title: 'Identificando sintomas',
                instructions: 'Liste seus principais sintomas de ansiedade física e mental'
              }
            ]
          },
          {
            id: 2,
            title: 'Técnicas de Respiração',
            description: 'Aprender técnicas de respiração para controle da ansiedade',
            activities: [
              {
                type: 'breathing',
                title: 'Respiração Diafragmática',
                instructions: 'Inspire por 4 segundos, segure por 4, expire por 6',
                duration: 300
              }
            ]
          },
          {
            id: 3,
            title: 'Reestruturação Cognitiva',
            description: 'Identificar e modificar pensamentos ansiosos',
            activities: [
              {
                type: 'thought-record',
                title: 'Registro de Pensamentos',
                instructions: 'Anote pensamentos ansiosos e questione sua validade'
              }
            ]
          }
        ]
      },
      publishedAt: new Date(),
    },
  })

  // Create Resources
  await prisma.resource.upsert({
    where: { slug: 'tecnicas-respiracao-ansiedade' },
    update: {},
    create: {
      title: 'Técnicas de Respiração para Ansiedade',
      slug: 'tecnicas-respiracao-ansiedade',
      excerpt: 'Aprenda técnicas simples de respiração que podem ajudar a controlar a ansiedade no dia a dia.',
      content: `
# Técnicas de Respiração para Ansiedade

A respiração é uma das ferramentas mais poderosas que temos para controlar a ansiedade. Quando estamos ansiosos, nossa respiração se torna rápida e superficial, o que pode piorar os sintomas.

## Respiração Diafragmática

1. Coloque uma mão no peito e outra no abdome
2. Inspire lentamente pelo nariz, fazendo o abdome subir
3. Expire lentamente pela boca
4. Repita por 5-10 minutos

## Respiração 4-7-8

1. Inspire pelo nariz contando até 4
2. Segure a respiração contando até 7
3. Expire pela boca contando até 8
4. Repita 4 ciclos

## Dicas Importantes

- Pratique diariamente, mesmo quando não estiver ansioso
- Use essas técnicas no início dos sintomas de ansiedade
- Seja paciente - pode levar tempo para dominar
      `,
      tags: ['ansiedade', 'respiração', 'técnicas', 'autocuidado'],
      featured: true,
      publishedAt: new Date(),
    },
  })

  await prisma.resource.upsert({
    where: { slug: 'entendendo-depressao' },
    update: {},
    create: {
      title: 'Entendendo a Depressão',
      slug: 'entendendo-depressao',
      excerpt: 'Um guia completo para compreender a depressão, seus sintomas e como buscar ajuda.',
      content: `
# Entendendo a Depressão

A depressão é um transtorno mental comum que afeta como você se sente, pensa e lida com as atividades diárias.

## Sintomas Comuns

- Tristeza persistente
- Perda de interesse em atividades
- Fadiga e baixa energia
- Dificuldades de concentração
- Alterações no sono e apetite

## Tratamento

A depressão é tratável. As opções incluem:

- Psicoterapia (especialmente TCC)
- Medicamentos (quando necessário)
- Mudanças no estilo de vida
- Apoio social

## Quando Buscar Ajuda

Procure ajuda profissional se os sintomas persistem por mais de duas semanas e interferem na sua vida diária.
      `,
      tags: ['depressão', 'saúde mental', 'sintomas', 'tratamento'],
      featured: true,
      publishedAt: new Date(),
    },
  })

  // Create consent records for users
  await prisma.consent.createMany({
    data: [
      {
        userId: admin.id,
        docVersion: '1.0',
        acceptedAt: new Date(),
        ip: '127.0.0.1',
      },
      {
        userId: professional.id,
        docVersion: '1.0',
        acceptedAt: new Date(),
        ip: '127.0.0.1',
      },
      {
        userId: user.id,
        docVersion: '1.0',
        acceptedAt: new Date(),
        ip: '127.0.0.1',
      },
    ],
  })

  console.log('Database seeded successfully!')
  console.log('Users created:')
  console.log('- Admin: admin@claramente.app / admin123')
  console.log('- Professional: psicolog@claramente.app / prof123')
  console.log('- User: usuario@claramente.app / user123')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })