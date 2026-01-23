import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

// Load .env from the server app where DATABASE_URL is defined
const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(__dirname, "../../../apps/server/.env") });

import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import {
  attribute,
  deal,
  entityDefinition,
  entityRecord,
  member,
  organization,
  stageDefinition,
  stageHistory,
  stageInstance,
  user,
  workflowDefinition,
} from "./schema";

// Create db connection after dotenv is loaded
const db = drizzle(process.env.DATABASE_URL || "", { schema });

const SEED_USER_ID = "kHyMagxCZuJJet61ddsVCzj77bZzvkWz";
const SEED_ORG_ID = "IyFktrjwFRoV3dBty8hRoKkuidswtmPw";

async function cleanupEntity(slug: string, label: string) {
  const entity = await db.query.entityDefinition.findFirst({
    where: eq(entityDefinition.slug, slug),
  });

  if (entity) {
    await db
      .delete(entityRecord)
      .where(eq(entityRecord.entityDefinitionId, entity.id));
    console.log(`  ✓ Deleted ${label} records`);

    await db
      .delete(attribute)
      .where(eq(attribute.entityDefinitionId, entity.id));
    console.log(`  ✓ Deleted ${label} attributes`);

    await db.delete(entityDefinition).where(eq(entityDefinition.id, entity.id));
    console.log(`  ✓ Deleted ${label} entity definition`);
  }
}

async function cleanup() {
  console.log("🧹 Cleaning up existing seed data...\n");

  // Find the workflow for this org
  const salesWorkflow = await db.query.workflowDefinition.findFirst({
    where: eq(workflowDefinition.name, "Воронка продаж"),
  });

  if (salesWorkflow) {
    // Get all deals for this workflow
    const deals = await db.query.deal.findMany({
      where: eq(deal.workflowDefinitionId, salesWorkflow.id),
    });

    for (const d of deals) {
      await db.delete(stageHistory).where(eq(stageHistory.dealId, d.id));
      await db.delete(stageInstance).where(eq(stageInstance.dealId, d.id));
    }
    console.log("  ✓ Deleted stage history and instances");

    await db
      .delete(deal)
      .where(eq(deal.workflowDefinitionId, salesWorkflow.id));
    console.log("  ✓ Deleted deals");

    await db
      .delete(stageDefinition)
      .where(eq(stageDefinition.workflowDefinitionId, salesWorkflow.id));
    console.log("  ✓ Deleted stage definitions");

    await db
      .delete(workflowDefinition)
      .where(eq(workflowDefinition.id, salesWorkflow.id));
    console.log("  ✓ Deleted workflow");
  }

  // Cleanup all entities
  await cleanupEntity("customer", "customer");
  await cleanupEntity("vehicle", "vehicle");
  await cleanupEntity("employee", "employee");
  await cleanupEntity("manufacturer", "manufacturer");

  console.log("\n✅ Cleanup completed!\n");
}

// Helper function to create entity with attributes
async function createEntityWithAttributes(
  slug: string,
  config: {
    singularName: string;
    pluralName: string;
    description: string;
    icon: string;
    color: string;
  },
  attributes: Array<{
    slug: string;
    name: string;
    type:
      | "short-text"
      | "long-text"
      | "number"
      | "select"
      | "multi-select"
      | "checkbox"
      | "date"
      | "url";
    isRequired?: boolean;
    order: number;
    config?: unknown;
  }>
) {
  let entity = await db.query.entityDefinition.findFirst({
    where: eq(entityDefinition.slug, slug),
  });

  if (entity) {
    console.log(`  → ${config.singularName} entity already exists`);
    return entity;
  }

  const result = await db
    .insert(entityDefinition)
    .values({
      organizationId: SEED_ORG_ID,
      slug,
      ...config,
    })
    .returning();
  entity = result[0];
  if (!entity) {
    throw new Error(`Failed to create ${slug} entity`);
  }
  console.log(`  ✓ ${config.singularName} entity created`);

  for (const attr of attributes) {
    await db.insert(attribute).values({
      entityDefinitionId: entity.id,
      isRequired: false,
      ...attr,
    });
  }
  console.log(`    ✓ ${attributes.length} attributes created`);

  return entity;
}

// Helper function to create entity records
async function createEntityRecords(
  entityDef: { id: string },
  records: Array<Record<string, unknown>>,
  label: string
) {
  const existing = await db.query.entityRecord.findMany({
    where: eq(entityRecord.entityDefinitionId, entityDef.id),
  });

  const recordIds: string[] = [];

  if (existing.length === 0) {
    for (const record of records) {
      const result = await db
        .insert(entityRecord)
        .values({
          entityDefinitionId: entityDef.id,
          values: record,
        })
        .returning();
      const created = result[0];
      if (created) {
        recordIds.push(created.id);
      }
    }
    console.log(`  ✓ ${records.length} ${label} records created`);
  } else {
    console.log(`  → ${existing.length} ${label} records already exist`);
    recordIds.push(...existing.map((r) => r.id));
  }

  return recordIds;
}

async function seed() {
  console.log("🌱 Starting seed...\n");

  // 1. Create User
  console.log("Creating user...");
  const existingUser = await db.query.user.findFirst({
    where: eq(user.id, SEED_USER_ID),
  });

  if (existingUser) {
    console.log("  → User already exists");
  } else {
    await db.insert(user).values({
      id: SEED_USER_ID,
      name: "Администратор",
      email: "admin@autosalon.ru",
      emailVerified: true,
    });
    console.log("  ✓ User created: Администратор");
  }

  // 2. Create Organization
  console.log("Creating organization...");
  const existingOrg = await db.query.organization.findFirst({
    where: eq(organization.id, SEED_ORG_ID),
  });

  if (existingOrg) {
    console.log("  → Organization already exists");
  } else {
    await db.insert(organization).values({
      id: SEED_ORG_ID,
      name: "Автосалон Премиум",
      slug: "autosalon-premium",
    });
    console.log("  ✓ Organization created: Автосалон Премиум");
  }

  // 3. Create Member (link user to org)
  console.log("Creating member...");
  const existingMember = await db.query.member.findFirst({
    where: eq(member.userId, SEED_USER_ID),
  });

  if (existingMember) {
    console.log("  → Member already exists");
  } else {
    await db.insert(member).values({
      id: crypto.randomUUID(),
      userId: SEED_USER_ID,
      organizationId: SEED_ORG_ID,
      role: "owner",
    });
    console.log("  ✓ Member created: Администратор as owner");
  }

  // ============================================
  // ENTITY DEFINITIONS
  // ============================================

  // 4. Create Customer Entity
  console.log("\nCreating Customer entity...");
  const customerEntity = await createEntityWithAttributes(
    "customer",
    {
      singularName: "Клиент",
      pluralName: "Клиенты",
      description: "База клиентов автосалона",
      icon: "Users",
      color: "#3B82F6",
    },
    [
      {
        slug: "name",
        name: "ФИО",
        type: "short-text",
        isRequired: true,
        order: 0,
      },
      {
        slug: "email",
        name: "Email",
        type: "short-text",
        isRequired: true,
        order: 1,
      },
      {
        slug: "phone",
        name: "Телефон",
        type: "short-text",
        isRequired: true,
        order: 2,
      },
      { slug: "city", name: "Город", type: "short-text", order: 3 },
      {
        slug: "source",
        name: "Источник",
        type: "select",
        order: 4,
        config: {
          options: [
            { value: "website", label: "Сайт", color: "#60A5FA" },
            { value: "referral", label: "Рекомендация", color: "#34D399" },
            { value: "walk-in", label: "Визит в салон", color: "#A78BFA" },
            { value: "phone", label: "Звонок", color: "#FB923C" },
            { value: "ads", label: "Реклама", color: "#F472B6" },
          ],
        },
      },
      {
        slug: "status",
        name: "Статус",
        type: "select",
        isRequired: true,
        order: 5,
        config: {
          options: [
            { value: "lead", label: "Лид", color: "#FCD34D" },
            { value: "prospect", label: "Потенциальный", color: "#60A5FA" },
            { value: "customer", label: "Клиент", color: "#34D399" },
            { value: "vip", label: "VIP", color: "#A78BFA" },
          ],
        },
      },
      { slug: "budget", name: "Бюджет", type: "short-text", order: 6 },
      { slug: "notes", name: "Заметки", type: "long-text", order: 7 },
    ]
  );

  // 5. Create Manufacturer Entity
  console.log("\nCreating Manufacturer entity...");
  const manufacturerEntity = await createEntityWithAttributes(
    "manufacturer",
    {
      singularName: "Производитель",
      pluralName: "Производители",
      description: "Автомобильные бренды",
      icon: "Building2",
      color: "#8B5CF6",
    },
    [
      {
        slug: "name",
        name: "Название",
        type: "short-text",
        isRequired: true,
        order: 0,
      },
      { slug: "country", name: "Страна", type: "short-text", order: 1 },
      { slug: "founded", name: "Год основания", type: "number", order: 2 },
      {
        slug: "segment",
        name: "Сегмент",
        type: "select",
        order: 3,
        config: {
          options: [
            { value: "economy", label: "Эконом", color: "#34D399" },
            { value: "standard", label: "Стандарт", color: "#60A5FA" },
            { value: "premium", label: "Премиум", color: "#A78BFA" },
            { value: "luxury", label: "Люкс", color: "#FCD34D" },
          ],
        },
      },
      { slug: "website", name: "Сайт", type: "url", order: 4 },
    ]
  );

  // 6. Create Vehicle Entity
  console.log("\nCreating Vehicle entity...");
  const vehicleEntity = await createEntityWithAttributes(
    "vehicle",
    {
      singularName: "Автомобиль",
      pluralName: "Автомобили",
      description: "Склад автомобилей",
      icon: "Car",
      color: "#10B981",
    },
    [
      {
        slug: "model",
        name: "Модель",
        type: "short-text",
        isRequired: true,
        order: 0,
      },
      {
        slug: "brand",
        name: "Марка",
        type: "short-text",
        isRequired: true,
        order: 1,
      },
      {
        slug: "year",
        name: "Год выпуска",
        type: "number",
        isRequired: true,
        order: 2,
      },
      { slug: "vin", name: "VIN", type: "short-text", order: 3 },
      { slug: "color", name: "Цвет", type: "short-text", order: 4 },
      { slug: "mileage", name: "Пробег (км)", type: "number", order: 5 },
      { slug: "engine", name: "Двигатель", type: "short-text", order: 6 },
      {
        slug: "transmission",
        name: "КПП",
        type: "select",
        order: 7,
        config: {
          options: [
            { value: "automatic", label: "Автомат", color: "#60A5FA" },
            { value: "manual", label: "Механика", color: "#34D399" },
            { value: "robot", label: "Робот", color: "#A78BFA" },
            { value: "variator", label: "Вариатор", color: "#FB923C" },
          ],
        },
      },
      {
        slug: "drive",
        name: "Привод",
        type: "select",
        order: 8,
        config: {
          options: [
            { value: "fwd", label: "Передний", color: "#60A5FA" },
            { value: "rwd", label: "Задний", color: "#34D399" },
            { value: "awd", label: "Полный", color: "#A78BFA" },
          ],
        },
      },
      {
        slug: "price",
        name: "Цена (₽)",
        type: "number",
        isRequired: true,
        order: 9,
      },
      {
        slug: "status",
        name: "Статус",
        type: "select",
        isRequired: true,
        order: 10,
        config: {
          options: [
            { value: "available", label: "В наличии", color: "#34D399" },
            { value: "reserved", label: "Забронирован", color: "#FCD34D" },
            { value: "sold", label: "Продан", color: "#EF4444" },
            { value: "in-transit", label: "В пути", color: "#60A5FA" },
          ],
        },
      },
      { slug: "features", name: "Опции", type: "long-text", order: 11 },
    ]
  );

  // 7. Create Employee Entity
  console.log("\nCreating Employee entity...");
  const employeeEntity = await createEntityWithAttributes(
    "employee",
    {
      singularName: "Сотрудник",
      pluralName: "Сотрудники",
      description: "Команда автосалона",
      icon: "UserCog",
      color: "#F59E0B",
    },
    [
      {
        slug: "name",
        name: "ФИО",
        type: "short-text",
        isRequired: true,
        order: 0,
      },
      {
        slug: "position",
        name: "Должность",
        type: "select",
        isRequired: true,
        order: 1,
        config: {
          options: [
            {
              value: "manager",
              label: "Менеджер по продажам",
              color: "#60A5FA",
            },
            {
              value: "senior-manager",
              label: "Старший менеджер",
              color: "#A78BFA",
            },
            { value: "director", label: "Директор", color: "#FCD34D" },
            {
              value: "finance",
              label: "Финансовый консультант",
              color: "#34D399",
            },
            { value: "service", label: "Сервис-консультант", color: "#FB923C" },
          ],
        },
      },
      {
        slug: "email",
        name: "Email",
        type: "short-text",
        isRequired: true,
        order: 2,
      },
      { slug: "phone", name: "Телефон", type: "short-text", order: 3 },
      { slug: "hireDate", name: "Дата найма", type: "date", order: 4 },
      {
        slug: "salesTarget",
        name: "План продаж (шт)",
        type: "number",
        order: 5,
      },
      { slug: "commission", name: "Комиссия (%)", type: "number", order: 6 },
    ]
  );

  // ============================================
  // ENTITY RECORDS
  // ============================================

  // Customer Records (20 Russian customers)
  console.log("\nCreating customer records...");
  const customers = [
    {
      name: "Иван Петров",
      email: "ivan.petrov@mail.ru",
      phone: "+7 (999) 123-45-67",
      city: "Москва",
      source: "website",
      status: "lead",
      budget: "3-3.5 млн ₽",
      notes: "Интересуется Toyota Camry 2024",
    },
    {
      name: "Анна Сидорова",
      email: "anna.sidorova@gmail.com",
      phone: "+7 (999) 234-56-78",
      city: "Москва",
      source: "referral",
      status: "prospect",
      budget: "2.5-3 млн ₽",
      notes: "Рекомендация от Михаила Ким",
    },
    {
      name: "Михаил Ким",
      email: "m.kim@yandex.ru",
      phone: "+7 (999) 345-67-89",
      city: "Москва",
      source: "referral",
      status: "vip",
      budget: "6+ млн ₽",
      notes: "Купил BMW X5, очень доволен",
    },
    {
      name: "Елена Волкова",
      email: "e.volkova@mail.ru",
      phone: "+7 (999) 456-78-90",
      city: "Санкт-Петербург",
      source: "website",
      status: "lead",
      budget: "2-2.5 млн ₽",
      notes: "Интересуется Kia K5",
    },
    {
      name: "Сергей Новиков",
      email: "s.novikov@gmail.com",
      phone: "+7 (999) 567-89-01",
      city: "Москва",
      source: "walk-in",
      status: "prospect",
      budget: "2.5-3 млн ₽",
      notes: "Ищет семейный кроссовер",
    },
    {
      name: "Ольга Морозова",
      email: "o.morozova@yandex.ru",
      phone: "+7 (999) 678-90-12",
      city: "Казань",
      source: "ads",
      status: "prospect",
      budget: "2-2.5 млн ₽",
      notes: "Записалась на тест-драйв Tucson",
    },
    {
      name: "Артём Козлов",
      email: "a.kozlov@mail.ru",
      phone: "+7 (999) 789-01-23",
      city: "Москва",
      source: "phone",
      status: "prospect",
      budget: "5-6 млн ₽",
      notes: "Бизнесмен, нужен представительский авто",
    },
    {
      name: "Наталья Белова",
      email: "n.belova@gmail.com",
      phone: "+7 (999) 890-12-34",
      city: "Екатеринбург",
      source: "website",
      status: "lead",
      budget: "1.5-2 млн ₽",
      notes: "Первый автомобиль",
    },
    {
      name: "Дмитрий Соколов",
      email: "d.sokolov@yandex.ru",
      phone: "+7 (999) 901-23-45",
      city: "Новосибирск",
      source: "referral",
      status: "customer",
      budget: "4-5 млн ₽",
      notes: "Постоянный клиент, 3 покупки",
    },
    {
      name: "Мария Кузнецова",
      email: "m.kuznetsova@mail.ru",
      phone: "+7 (999) 012-34-56",
      city: "Москва",
      source: "walk-in",
      status: "lead",
      budget: "2.5-3 млн ₽",
      notes: "Смотрела Mazda CX-5",
    },
    {
      name: "Александр Попов",
      email: "a.popov@gmail.com",
      phone: "+7 (999) 111-22-33",
      city: "Самара",
      source: "ads",
      status: "prospect",
      budget: "3-4 млн ₽",
      notes: "Интересуется Tesla Model 3",
    },
    {
      name: "Екатерина Лебедева",
      email: "e.lebedeva@yandex.ru",
      phone: "+7 (999) 222-33-44",
      city: "Москва",
      source: "website",
      status: "vip",
      budget: "7+ млн ₽",
      notes: "Жена владельца компании",
    },
    {
      name: "Павел Смирнов",
      email: "p.smirnov@mail.ru",
      phone: "+7 (999) 333-44-55",
      city: "Краснодар",
      source: "phone",
      status: "lead",
      budget: "2-2.5 млн ₽",
      notes: "Звонил по рекламе",
    },
    {
      name: "Виктория Орлова",
      email: "v.orlova@gmail.com",
      phone: "+7 (999) 444-55-66",
      city: "Москва",
      source: "walk-in",
      status: "customer",
      budget: "3-4 млн ₽",
      notes: "Купила Audi Q5",
    },
    {
      name: "Андрей Федоров",
      email: "a.fedorov@yandex.ru",
      phone: "+7 (999) 555-66-77",
      city: "Нижний Новгород",
      source: "referral",
      status: "prospect",
      budget: "2.5-3 млн ₽",
      notes: "Друг Дмитрия Соколова",
    },
    {
      name: "Татьяна Михайлова",
      email: "t.mikhailova@mail.ru",
      phone: "+7 (999) 666-77-88",
      city: "Москва",
      source: "ads",
      status: "lead",
      budget: "1.8-2.2 млн ₽",
      notes: "Ищет экономичный авто",
    },
    {
      name: "Игорь Васильев",
      email: "i.vasiliev@gmail.com",
      phone: "+7 (999) 777-88-99",
      city: "Ростов-на-Дону",
      source: "website",
      status: "prospect",
      budget: "4-5 млн ₽",
      notes: "Интересуется BMW X3",
    },
    {
      name: "Юлия Николаева",
      email: "y.nikolaeva@yandex.ru",
      phone: "+7 (999) 888-99-00",
      city: "Москва",
      source: "walk-in",
      status: "lead",
      budget: "2-2.5 млн ₽",
      notes: "Пришла с мужем",
    },
    {
      name: "Роман Егоров",
      email: "r.egorov@mail.ru",
      phone: "+7 (999) 999-00-11",
      city: "Воронеж",
      source: "phone",
      status: "customer",
      budget: "3.5-4 млн ₽",
      notes: "Купил Lexus NX",
    },
    {
      name: "Светлана Захарова",
      email: "s.zakharova@gmail.com",
      phone: "+7 (999) 000-11-22",
      city: "Москва",
      source: "referral",
      status: "vip",
      budget: "8+ млн ₽",
      notes: "Корпоративный клиент, автопарк",
    },
  ];
  const customerRecordIds = await createEntityRecords(
    customerEntity,
    customers,
    "customer"
  );

  // Manufacturer Records
  console.log("\nCreating manufacturer records...");
  const manufacturers = [
    {
      name: "Toyota",
      country: "Япония",
      founded: 1937,
      segment: "standard",
      website: "https://toyota.ru",
    },
    {
      name: "Honda",
      country: "Япония",
      founded: 1948,
      segment: "standard",
      website: "https://honda.ru",
    },
    {
      name: "BMW",
      country: "Германия",
      founded: 1916,
      segment: "premium",
      website: "https://bmw.ru",
    },
    {
      name: "Mercedes-Benz",
      country: "Германия",
      founded: 1926,
      segment: "luxury",
      website: "https://mercedes-benz.ru",
    },
    {
      name: "Audi",
      country: "Германия",
      founded: 1909,
      segment: "premium",
      website: "https://audi.ru",
    },
    {
      name: "Kia",
      country: "Южная Корея",
      founded: 1944,
      segment: "standard",
      website: "https://kia.ru",
    },
    {
      name: "Hyundai",
      country: "Южная Корея",
      founded: 1967,
      segment: "standard",
      website: "https://hyundai.ru",
    },
    {
      name: "Mazda",
      country: "Япония",
      founded: 1920,
      segment: "standard",
      website: "https://mazda.ru",
    },
    {
      name: "Lexus",
      country: "Япония",
      founded: 1989,
      segment: "luxury",
      website: "https://lexus.ru",
    },
    {
      name: "Volkswagen",
      country: "Германия",
      founded: 1937,
      segment: "standard",
      website: "https://volkswagen.ru",
    },
  ];
  await createEntityRecords(manufacturerEntity, manufacturers, "manufacturer");

  // Vehicle Records
  console.log("\nCreating vehicle records...");
  const vehicles = [
    {
      model: "Camry",
      brand: "Toyota",
      year: 2024,
      vin: "XW7BF4FK10S123456",
      color: "Белый перламутр",
      mileage: 0,
      engine: "2.5L 4-цил. 200 л.с.",
      transmission: "automatic",
      drive: "fwd",
      price: 3_250_000,
      status: "available",
      features: "Комплектация Престиж, адаптивный круиз, Apple CarPlay",
    },
    {
      model: "Camry",
      brand: "Toyota",
      year: 2024,
      vin: "XW7BF4FK10S123457",
      color: "Чёрный металлик",
      mileage: 0,
      engine: "2.5L 4-цил. 200 л.с.",
      transmission: "automatic",
      drive: "fwd",
      price: 3_150_000,
      status: "available",
      features: "Комплектация Комфорт",
    },
    {
      model: "Accord Sport",
      brand: "Honda",
      year: 2024,
      vin: "1HGCV2F34PA123456",
      color: "Белый перламутр",
      mileage: 0,
      engine: "2.0L Turbo 252 л.с.",
      transmission: "automatic",
      drive: "fwd",
      price: 2_890_000,
      status: "reserved",
      features: "Спортивный пакет, кожаный салон",
    },
    {
      model: "X5 xDrive40i",
      brand: "BMW",
      year: 2023,
      vin: "WBAJB9C50LB123456",
      color: "Carbon Black",
      mileage: 12_500,
      engine: "3.0L 6-цил. 340 л.с.",
      transmission: "automatic",
      drive: "awd",
      price: 6_250_000,
      status: "sold",
      features: "M Sport пакет, пневмоподвеска, Vernasca салон",
    },
    {
      model: "K5",
      brand: "Kia",
      year: 2024,
      vin: "KNAG341ABPA123456",
      color: "Серебристый",
      mileage: 0,
      engine: "2.5L 4-цил. 194 л.с.",
      transmission: "automatic",
      drive: "fwd",
      price: 2_450_000,
      status: "available",
      features: "GT-Line, панорамная крыша",
    },
    {
      model: "CX-5",
      brand: "Mazda",
      year: 2024,
      vin: "JM3KFBDM1P0123456",
      color: "Soul Red Crystal",
      mileage: 0,
      engine: "2.5L 4-цил. 194 л.с.",
      transmission: "automatic",
      drive: "awd",
      price: 2_890_000,
      status: "available",
      features: "Supreme, i-Activsense, BOSE",
    },
    {
      model: "Tucson",
      brand: "Hyundai",
      year: 2024,
      vin: "KMHJ3814BPU123456",
      color: "Белый",
      mileage: 0,
      engine: "2.0L 4-цил. 150 л.с.",
      transmission: "automatic",
      drive: "fwd",
      price: 2_390_000,
      status: "available",
      features: "Comfort Plus, Apple CarPlay, подогрев сидений",
    },
    {
      model: "GLC 300",
      brand: "Mercedes-Benz",
      year: 2024,
      vin: "WDC0G4KB1PF123456",
      color: "Obsidian Black",
      mileage: 0,
      engine: "2.0L Turbo 258 л.с.",
      transmission: "automatic",
      drive: "awd",
      price: 5_890_000,
      status: "reserved",
      features: "AMG Line, Premium Plus, Burmester, панорама",
    },
    {
      model: "Q5",
      brand: "Audi",
      year: 2024,
      vin: "WAUZZZFY0P2123456",
      color: "Mythos Black",
      mileage: 0,
      engine: "2.0L TFSI 265 л.с.",
      transmission: "automatic",
      drive: "awd",
      price: 5_450_000,
      status: "available",
      features: "S line, виртуальная кабина, B&O звук",
    },
    {
      model: "NX 350h",
      brand: "Lexus",
      year: 2024,
      vin: "JTJDARDZ0P2123456",
      color: "Sonic Titanium",
      mileage: 0,
      engine: "2.5L Hybrid 244 л.с.",
      transmission: "variator",
      drive: "awd",
      price: 5_290_000,
      status: "available",
      features: "F Sport, Mark Levinson, HUD",
    },
    {
      model: "X3 xDrive30i",
      brand: "BMW",
      year: 2024,
      vin: "WBAJC9C50PB123457",
      color: "Alpine White",
      mileage: 0,
      engine: "2.0L Turbo 245 л.с.",
      transmission: "automatic",
      drive: "awd",
      price: 4_890_000,
      status: "available",
      features: "M Sport, Vernasca кожа, Harman Kardon",
    },
    {
      model: "RAV4",
      brand: "Toyota",
      year: 2024,
      vin: "JTMR13FV0PD123456",
      color: "Dynamic Blue",
      mileage: 0,
      engine: "2.5L Hybrid 222 л.с.",
      transmission: "variator",
      drive: "awd",
      price: 3_450_000,
      status: "available",
      features: "Престиж Safety Sense, JBL",
    },
    {
      model: "Tiguan",
      brand: "Volkswagen",
      year: 2024,
      vin: "WVGZZZ5NZPW123456",
      color: "Oryx White",
      mileage: 0,
      engine: "2.0L TSI 220 л.с.",
      transmission: "robot",
      drive: "awd",
      price: 3_890_000,
      status: "in-transit",
      features: "R-Line, DCC, Harman Kardon",
    },
    {
      model: "Santa Fe",
      brand: "Hyundai",
      year: 2024,
      vin: "KMHS381CBPU123456",
      color: "Серый металлик",
      mileage: 0,
      engine: "2.2L Diesel 202 л.с.",
      transmission: "automatic",
      drive: "awd",
      price: 4_250_000,
      status: "available",
      features: "High-Tech, 7 мест, панорама",
    },
    {
      model: "Sorento",
      brand: "Kia",
      year: 2024,
      vin: "KNAG381ABPA123457",
      color: "Snow White Pearl",
      mileage: 0,
      engine: "2.5L Turbo 281 л.с.",
      transmission: "robot",
      drive: "awd",
      price: 4_590_000,
      status: "available",
      features: "Prestige, 7 мест, Meridian",
    },
  ];
  await createEntityRecords(vehicleEntity, vehicles, "vehicle");

  // Employee Records
  console.log("\nCreating employee records...");
  const employees = [
    {
      name: "Алексей Иванов",
      position: "manager",
      email: "a.ivanov@autosalon.ru",
      phone: "+7 (495) 111-11-01",
      hireDate: "2021-03-15",
      salesTarget: 8,
      commission: 1.5,
    },
    {
      name: "Мария Петрова",
      position: "senior-manager",
      email: "m.petrova@autosalon.ru",
      phone: "+7 (495) 111-11-02",
      hireDate: "2019-06-01",
      salesTarget: 12,
      commission: 2.0,
    },
    {
      name: "Дмитрий Сергеев",
      position: "manager",
      email: "d.sergeev@autosalon.ru",
      phone: "+7 (495) 111-11-03",
      hireDate: "2022-01-10",
      salesTarget: 8,
      commission: 1.5,
    },
    {
      name: "Наталья Козлова",
      position: "finance",
      email: "n.kozlova@autosalon.ru",
      phone: "+7 (495) 111-11-04",
      hireDate: "2020-09-01",
      salesTarget: 0,
      commission: 0.5,
    },
    {
      name: "Игорь Федоров",
      position: "manager",
      email: "i.fedorov@autosalon.ru",
      phone: "+7 (495) 111-11-05",
      hireDate: "2023-02-20",
      salesTarget: 6,
      commission: 1.5,
    },
    {
      name: "Виктория Смирнова",
      position: "manager",
      email: "v.smirnova@autosalon.ru",
      phone: "+7 (495) 111-11-06",
      hireDate: "2022-08-15",
      salesTarget: 8,
      commission: 1.5,
    },
    {
      name: "Андрей Новиков",
      position: "director",
      email: "a.novikov@autosalon.ru",
      phone: "+7 (495) 111-11-07",
      hireDate: "2018-01-01",
      salesTarget: 0,
      commission: 0.3,
    },
    {
      name: "Елена Белова",
      position: "service",
      email: "e.belova@autosalon.ru",
      phone: "+7 (495) 111-11-08",
      hireDate: "2021-11-01",
      salesTarget: 0,
      commission: 0,
    },
  ];
  await createEntityRecords(employeeEntity, employees, "employee");

  // ============================================
  // WORKFLOW & DEALS
  // ============================================

  // Create Sales Pipeline Workflow
  console.log("\nCreating workflow...");
  let salesWorkflow = await db.query.workflowDefinition.findFirst({
    where: eq(workflowDefinition.name, "Воронка продаж"),
  });

  if (salesWorkflow) {
    console.log("  → Workflow already exists");
  } else {
    const result = await db
      .insert(workflowDefinition)
      .values({
        organizationId: SEED_ORG_ID,
        name: "Воронка продаж",
        description: "Процесс продажи автомобиля от лида до закрытия сделки",
        triggerEntityId: customerEntity.id,
        icon: "TrendingUp",
        color: "#10B981",
        status: "active",
      })
      .returning();
    salesWorkflow = result[0];
    if (!salesWorkflow) {
      throw new Error("Failed to create workflow");
    }
    console.log("  ✓ Workflow created: Воронка продаж");
  }

  // Create Stage Definitions (Russian)
  console.log("Creating stage definitions...");
  const stages = [
    {
      name: "Квалификация",
      target: "Проверить намерение и бюджет клиента",
      order: 0,
      isInitial: true,
      isFinal: false,
      icon: "UserPlus",
      color: "#FCD34D",
    },
    {
      name: "Выявление потребностей",
      target: "Понять требования и предпочтения клиента",
      order: 1,
      isInitial: false,
      isFinal: false,
      icon: "ClipboardList",
      color: "#60A5FA",
    },
    {
      name: "Подбор автомобиля",
      target: "Представить подходящие варианты",
      order: 2,
      isInitial: false,
      isFinal: false,
      icon: "Car",
      color: "#A78BFA",
    },
    {
      name: "Тест-драйв",
      target: "Назначить и провести тест-драйв",
      order: 3,
      isInitial: false,
      isFinal: false,
      icon: "Navigation",
      color: "#F472B6",
    },
    {
      name: "Переговоры",
      target: "Согласовать итоговую цену и условия",
      order: 4,
      isInitial: false,
      isFinal: false,
      icon: "HandCoins",
      color: "#FB923C",
    },
    {
      name: "Оформление",
      target: "Оформить кредит и документы",
      order: 5,
      isInitial: false,
      isFinal: false,
      icon: "FileText",
      color: "#4ADE80",
    },
    {
      name: "Успешная сделка",
      target: "Выдать автомобиль и получить оплату",
      order: 6,
      isInitial: false,
      isFinal: true,
      icon: "Trophy",
      color: "#34D399",
    },
  ];

  const existingStages = await db.query.stageDefinition.findMany({
    where: eq(stageDefinition.workflowDefinitionId, salesWorkflow.id),
  });

  const stageDefinitionIds: string[] = [];

  if (existingStages.length === 0) {
    for (const stage of stages) {
      const result = await db
        .insert(stageDefinition)
        .values({ workflowDefinitionId: salesWorkflow.id, ...stage })
        .returning();
      const stageRecord = result[0];
      if (stageRecord) {
        stageDefinitionIds.push(stageRecord.id);
      }
    }
    console.log(`  ✓ ${stages.length} stage definitions created`);
  } else {
    console.log(`  → ${existingStages.length} stage definitions already exist`);
    stageDefinitionIds.push(
      ...existingStages.sort((a, b) => a.order - b.order).map((s) => s.id)
    );
  }

  // Create Deals (matching mock data)
  console.log("Creating deals...");
  const dealConfigs = [
    {
      name: "Toyota Camry 2024",
      customerIndex: 0,
      currentStageIndex: 1,
      status: "open" as const,
    },
    {
      name: "Honda Accord Sport",
      customerIndex: 1,
      currentStageIndex: 4,
      status: "open" as const,
    },
    {
      name: "BMW X5 2023",
      customerIndex: 2,
      currentStageIndex: 6,
      status: "won" as const,
    },
    {
      name: "Kia K5 2024",
      customerIndex: 3,
      currentStageIndex: 0,
      status: "open" as const,
    },
    {
      name: "Mazda CX-5 2024",
      customerIndex: 4,
      currentStageIndex: 2,
      status: "open" as const,
    },
    {
      name: "Hyundai Tucson 2024",
      customerIndex: 5,
      currentStageIndex: 3,
      status: "open" as const,
    },
    {
      name: "Mercedes GLC 300",
      customerIndex: 6,
      currentStageIndex: 5,
      status: "open" as const,
    },
  ];

  const existingDeals = await db.query.deal.findMany({
    where: eq(deal.workflowDefinitionId, salesWorkflow.id),
  });

  if (existingDeals.length === 0) {
    for (const dealConfig of dealConfigs) {
      const customerId = customerRecordIds[dealConfig.customerIndex];
      if (!customerId) continue;

      const dealResult = await db
        .insert(deal)
        .values({
          organizationId: SEED_ORG_ID,
          workflowDefinitionId: salesWorkflow.id,
          name: dealConfig.name,
          triggerRecordId: customerId,
          status: dealConfig.status,
          ownerId: SEED_USER_ID,
        })
        .returning();
      const newDeal = dealResult[0];
      if (!newDeal) continue;

      const stageInstanceIds: string[] = [];
      for (let i = 0; i < stageDefinitionIds.length; i++) {
        const stageDefId = stageDefinitionIds[i];
        if (!stageDefId) continue;

        const isCurrentOrPast = i <= dealConfig.currentStageIndex;
        const isCurrent = i === dealConfig.currentStageIndex;
        const isPast = i < dealConfig.currentStageIndex;

        let instanceStatus: "pending" | "active" | "completed" | "skipped" =
          "pending";
        if (isCurrent) instanceStatus = "active";
        else if (isPast) instanceStatus = "completed";

        const instanceResult = await db
          .insert(stageInstance)
          .values({
            dealId: newDeal.id,
            stageDefinitionId: stageDefId,
            status: instanceStatus,
            enteredAt: isCurrentOrPast ? new Date() : null,
            completedAt: isPast ? new Date() : null,
            completedBy: isPast ? SEED_USER_ID : null,
            values: {},
          })
          .returning();
        const instance = instanceResult[0];
        if (!instance) continue;

        stageInstanceIds.push(instance.id);

        if (isCurrentOrPast) {
          await db.insert(stageHistory).values({
            dealId: newDeal.id,
            stageInstanceId: instance.id,
            action: "entered",
            performedBy: SEED_USER_ID,
            metadata: { automated: true, reason: "seed" },
          });

          if (isPast) {
            await db.insert(stageHistory).values({
              dealId: newDeal.id,
              stageInstanceId: instance.id,
              action: "completed",
              performedBy: SEED_USER_ID,
              metadata: { automated: true, reason: "seed" },
            });
          }
        }
      }

      const currentStageInstanceId =
        stageInstanceIds[dealConfig.currentStageIndex];
      if (currentStageInstanceId) {
        await db
          .update(deal)
          .set({ currentStageId: currentStageInstanceId })
          .where(eq(deal.id, newDeal.id));
      }
    }
    console.log(`  ✓ ${dealConfigs.length} deals created`);
  } else {
    console.log(`  → ${existingDeals.length} deals already exist`);
  }

  console.log("\n✅ Seed completed successfully!");
  console.log("\nСводка:");
  console.log("  - 1 Пользователь (Администратор)");
  console.log("  - 1 Организация (Автосалон Премиум)");
  console.log(
    "  - 4 Типа сущностей (Клиенты, Производители, Автомобили, Сотрудники)"
  );
  console.log(`  - ${customers.length} Клиентов`);
  console.log(`  - ${manufacturers.length} Производителей`);
  console.log(`  - ${vehicles.length} Автомобилей`);
  console.log(`  - ${employees.length} Сотрудников`);
  console.log("  - 1 Рабочий процесс (Воронка продаж)");
  console.log(`  - ${stages.length} Этапов`);
  console.log(`  - ${dealConfigs.length} Сделок`);
}

async function main() {
  try {
    await cleanup();
    await seed();
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
}

main();
