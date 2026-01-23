import type { Deal, MemoryItem, Message, Stage } from "@/types/chat";

// Helper to create dates relative to now
function daysAgo(days: number, hours = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(date.getHours() - hours);
  return date;
}

// Stages templates for car sales (Russian)
const stageTemplates = [
  { name: "Квалификация", target: "Проверить намерение и бюджет клиента" },
  {
    name: "Выявление потребностей",
    target: "Понять требования и предпочтения клиента",
  },
  { name: "Подбор автомобиля", target: "Представить подходящие варианты" },
  { name: "Тест-драйв", target: "Назначить и провести тест-драйв" },
  { name: "Переговоры", target: "Согласовать итоговую цену и условия" },
  { name: "Оформление", target: "Оформить кредит и документы" },
  { name: "Успешная сделка", target: "Выдать автомобиль и получить оплату" },
];

function getStageStatus(
  index: number,
  currentStageIndex: number
): "completed" | "active" | "pending" {
  if (index < currentStageIndex) {
    return "completed";
  }
  if (index === currentStageIndex) {
    return "active";
  }
  return "pending";
}

function createStages(dealId: string, currentStageIndex: number): Stage[] {
  return stageTemplates.map((template, index) => ({
    id: `${dealId}-stage-${index + 1}`,
    dealId,
    name: template.name,
    target: template.target,
    status: getStageStatus(index, currentStageIndex),
    order: index + 1,
    unreadCount:
      index === currentStageIndex ? Math.floor(Math.random() * 3) : 0,
  }));
}

// Deal 1: Toyota Camry - at Needs Assessment stage (stage 2)
const deal1Stages = createStages("deal-1", 1);
const deal1: Deal = {
  id: "deal-1",
  name: "Toyota Camry 2024",
  clientName: "Иван Петров",
  stages: deal1Stages,
  currentStageId: deal1Stages[1].id,
  unreadCount: 2,
};

// Deal 2: Honda Accord - at Negotiation stage (stage 5)
const deal2Stages = createStages("deal-2", 4);
const deal2: Deal = {
  id: "deal-2",
  name: "Honda Accord Sport",
  clientName: "Анна Сидорова",
  stages: deal2Stages,
  currentStageId: deal2Stages[4].id,
  unreadCount: 1,
};

// Deal 3: BMW X5 - Closed Won (stage 7)
const deal3Stages = createStages("deal-3", 6);
const deal3: Deal = {
  id: "deal-3",
  name: "BMW X5 2023",
  clientName: "Михаил Ким",
  stages: deal3Stages,
  currentStageId: deal3Stages[6].id,
  unreadCount: 0,
};

// Deal 4: Kia K5 - at Qualification stage (stage 1)
const deal4Stages = createStages("deal-4", 0);
const deal4: Deal = {
  id: "deal-4",
  name: "Kia K5 2024",
  clientName: "Елена Волкова",
  stages: deal4Stages,
  currentStageId: deal4Stages[0].id,
  unreadCount: 3,
};

// Deal 5: Mazda CX-5 - at Vehicle Selection stage (stage 3)
const deal5Stages = createStages("deal-5", 2);
const deal5: Deal = {
  id: "deal-5",
  name: "Mazda CX-5 2024",
  clientName: "Сергей Новиков",
  stages: deal5Stages,
  currentStageId: deal5Stages[2].id,
  unreadCount: 1,
};

// Deal 6: Hyundai Tucson - at Test Drive stage (stage 4)
const deal6Stages = createStages("deal-6", 3);
const deal6: Deal = {
  id: "deal-6",
  name: "Hyundai Tucson 2024",
  clientName: "Ольга Морозова",
  stages: deal6Stages,
  currentStageId: deal6Stages[3].id,
  unreadCount: 0,
};

// Deal 7: Mercedes GLC - at Documentation stage (stage 6)
const deal7Stages = createStages("deal-7", 5);
const deal7: Deal = {
  id: "deal-7",
  name: "Mercedes GLC 300",
  clientName: "Артём Козлов",
  stages: deal7Stages,
  currentStageId: deal7Stages[5].id,
  unreadCount: 2,
};

// Deal 8: Audi Q5 - at Qualification stage (stage 1)
const deal8Stages = createStages("deal-8", 0);
const deal8: Deal = {
  id: "deal-8",
  name: "Audi Q5 2024",
  clientName: "Дмитрий Соколов",
  stages: deal8Stages,
  currentStageId: deal8Stages[0].id,
  unreadCount: 1,
};

// Deal 9: Volkswagen Tiguan - at Needs Assessment stage (stage 2)
const deal9Stages = createStages("deal-9", 1);
const deal9: Deal = {
  id: "deal-9",
  name: "Volkswagen Tiguan 2024",
  clientName: "Наталья Федорова",
  stages: deal9Stages,
  currentStageId: deal9Stages[1].id,
  unreadCount: 0,
};

// Deal 10: Lexus RX - at Vehicle Selection stage (stage 3)
const deal10Stages = createStages("deal-10", 2);
const deal10: Deal = {
  id: "deal-10",
  name: "Lexus RX 350",
  clientName: "Александр Белов",
  stages: deal10Stages,
  currentStageId: deal10Stages[2].id,
  unreadCount: 2,
};

// Deal 11: Skoda Kodiaq - at Test Drive stage (stage 4)
const deal11Stages = createStages("deal-11", 3);
const deal11: Deal = {
  id: "deal-11",
  name: "Skoda Kodiaq 2024",
  clientName: "Мария Кузнецова",
  stages: deal11Stages,
  currentStageId: deal11Stages[3].id,
  unreadCount: 1,
};

// Deal 12: Nissan X-Trail - at Negotiation stage (stage 5)
const deal12Stages = createStages("deal-12", 4);
const deal12: Deal = {
  id: "deal-12",
  name: "Nissan X-Trail 2024",
  clientName: "Павел Иванов",
  stages: deal12Stages,
  currentStageId: deal12Stages[4].id,
  unreadCount: 3,
};

// Deal 13: Geely Monjaro - at Qualification stage (stage 1)
const deal13Stages = createStages("deal-13", 0);
const deal13: Deal = {
  id: "deal-13",
  name: "Geely Monjaro 2024",
  clientName: "Екатерина Смирнова",
  stages: deal13Stages,
  currentStageId: deal13Stages[0].id,
  unreadCount: 0,
};

// Deal 14: Chery Tiggo 8 Pro - at Documentation stage (stage 6)
const deal14Stages = createStages("deal-14", 5);
const deal14: Deal = {
  id: "deal-14",
  name: "Chery Tiggo 8 Pro",
  clientName: "Андрей Попов",
  stages: deal14Stages,
  currentStageId: deal14Stages[5].id,
  unreadCount: 1,
};

// Deal 15: Haval Jolion - Closed Won (stage 7)
const deal15Stages = createStages("deal-15", 6);
const deal15: Deal = {
  id: "deal-15",
  name: "Haval Jolion 2024",
  clientName: "Татьяна Орлова",
  stages: deal15Stages,
  currentStageId: deal15Stages[6].id,
  unreadCount: 0,
};

// Deal 16: Exeed TXL - at Needs Assessment stage (stage 2)
const deal16Stages = createStages("deal-16", 1);
const deal16: Deal = {
  id: "deal-16",
  name: "Exeed TXL 2024",
  clientName: "Виктор Лебедев",
  stages: deal16Stages,
  currentStageId: deal16Stages[1].id,
  unreadCount: 2,
};

// Deal 17: Omoda C5 - at Vehicle Selection stage (stage 3)
const deal17Stages = createStages("deal-17", 2);
const deal17: Deal = {
  id: "deal-17",
  name: "Omoda C5 2024",
  clientName: "Юлия Николаева",
  stages: deal17Stages,
  currentStageId: deal17Stages[2].id,
  unreadCount: 0,
};

// Deal 18: Lada Vesta - at Qualification stage (stage 1)
const deal18Stages = createStages("deal-18", 0);
const deal18: Deal = {
  id: "deal-18",
  name: "Lada Vesta SW Cross",
  clientName: "Роман Захаров",
  stages: deal18Stages,
  currentStageId: deal18Stages[0].id,
  unreadCount: 1,
};

// Deal 19: GAC GS8 - at Test Drive stage (stage 4)
const deal19Stages = createStages("deal-19", 3);
const deal19: Deal = {
  id: "deal-19",
  name: "GAC GS8 2024",
  clientName: "Светлана Егорова",
  stages: deal19Stages,
  currentStageId: deal19Stages[3].id,
  unreadCount: 2,
};

// Deal 20: Jetour Dashing - at Negotiation stage (stage 5)
const deal20Stages = createStages("deal-20", 4);
const deal20: Deal = {
  id: "deal-20",
  name: "Jetour Dashing 2024",
  clientName: "Игорь Макаров",
  stages: deal20Stages,
  currentStageId: deal20Stages[4].id,
  unreadCount: 0,
};

export const mockDeals: Deal[] = [
  deal1,
  deal2,
  deal3,
  deal4,
  deal5,
  deal6,
  deal7,
  deal8,
  deal9,
  deal10,
  deal11,
  deal12,
  deal13,
  deal14,
  deal15,
  deal16,
  deal17,
  deal18,
  deal19,
  deal20,
];

// Messages for Deal 1 - Needs Assessment stage (in Russian)
const deal1NeedsAssessmentMessages: Message[] = [
  {
    id: "msg-1-1",
    stageId: "deal-1-stage-2",
    authorId: "ai",
    authorName: "AI Ассистент",
    content:
      "Начинаю оценку потребностей клиента Иван Петров. Интересуется Toyota Camry 2024.",
    timestamp: daysAgo(2, 8),
    isAI: true,
  },
  {
    id: "msg-1-2",
    stageId: "deal-1-stage-2",
    authorId: "user-1",
    authorName: "Алексей (Менеджер)",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    content:
      "Добрый день, Иван! Спасибо, что пришли к нам. Расскажите, что подтолкнуло вас к покупке нового автомобиля?",
    timestamp: daysAgo(2, 7),
  },
  {
    id: "msg-1-3",
    stageId: "deal-1-stage-2",
    authorId: "client-1",
    authorName: "Иван Петров",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    content:
      "Моя машина уже старая, это Honda Civic 2015 года. Ищу что-то более комфортное для ежедневных поездок на работу — примерно 45 минут в одну сторону.",
    timestamp: daysAgo(2, 6),
  },
  {
    id: "msg-1-4",
    stageId: "deal-1-stage-2",
    authorId: "ai",
    authorName: "AI Ассистент",
    content:
      "📝 Записал: Клиент приоритизирует комфорт для длительных поездок (45 мин в одну сторону). Текущий автомобиль: Honda Civic 2015.",
    timestamp: daysAgo(2, 6),
    isAI: true,
  },
  {
    id: "msg-1-5",
    stageId: "deal-1-stage-2",
    authorId: "user-1",
    authorName: "Алексей (Менеджер)",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    content:
      "Отличная причина для обновления! Camry идеально подходит для ежедневных поездок. Какой бюджет вы рассматриваете?",
    timestamp: daysAgo(2, 5),
  },
  {
    id: "msg-1-6",
    stageId: "deal-1-stage-2",
    authorId: "client-1",
    authorName: "Иван Петров",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    content:
      "Думаю в районе 3-3,5 миллиона рублей. Хотел бы оформить в кредит, на 48 или 60 месяцев.",
    timestamp: daysAgo(2, 4),
  },
  {
    id: "msg-1-7",
    stageId: "deal-1-stage-2",
    authorId: "ai",
    authorName: "AI Ассистент",
    content:
      "💰 Бюджет подтверждён: 3-3,5 млн ₽. Предпочтение по кредиту: 48-60 месяцев.",
    timestamp: daysAgo(2, 4),
    isAI: true,
  },
  {
    id: "msg-1-8",
    stageId: "deal-1-stage-2",
    authorId: "user-1",
    authorName: "Алексей (Менеджер)",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    content:
      "Отлично! С таким бюджетом у нас много вариантов. Какие функции для вас важны? Системы безопасности, мультимедиа, расход топлива?",
    timestamp: daysAgo(2, 3),
  },
  {
    id: "msg-1-9",
    stageId: "deal-1-stage-2",
    authorId: "client-1",
    authorName: "Иван Петров",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    content:
      "Безопасность очень важна — хочу адаптивный круиз-контроль и систему удержания в полосе. И обязательно Apple CarPlay для поездок.",
    timestamp: daysAgo(2, 2),
  },
  {
    id: "msg-1-10",
    stageId: "deal-1-stage-2",
    authorId: "ai",
    authorName: "AI Ассистент",
    content:
      "🎯 Обязательные опции: адаптивный круиз-контроль, удержание в полосе, Apple CarPlay. Рекомендую комплектацию Престиж или Люкс.",
    timestamp: daysAgo(2, 2),
    isAI: true,
  },
  {
    id: "msg-1-11",
    stageId: "deal-1-stage-2",
    authorId: "user-1",
    authorName: "Алексей (Менеджер)",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    content:
      "Все эти опции есть в комплектации Престиж. Могу показать вам автомобиль на складе — есть в белом и чёрном цвете. Какой предпочитаете?",
    timestamp: daysAgo(2, 1),
  },
  {
    id: "msg-1-12",
    stageId: "deal-1-stage-2",
    authorId: "client-1",
    authorName: "Иван Петров",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    content:
      "Белый, пожалуйста. И ещё вопрос — есть ли у вас трейд-ин? Хочу сдать свой Civic.",
    timestamp: daysAgo(1, 6),
  },
  {
    id: "msg-1-13",
    stageId: "deal-1-stage-2",
    authorId: "ai",
    authorName: "AI Ассистент",
    content:
      "🚗 Предпочтительный цвет: белый. Клиент интересуется трейд-ин для Honda Civic 2015. Нужна оценка автомобиля.",
    timestamp: daysAgo(1, 6),
    isAI: true,
  },
  {
    id: "msg-1-14",
    stageId: "deal-1-stage-2",
    authorId: "user-1",
    authorName: "Алексей (Менеджер)",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    content:
      "Конечно, у нас отличная программа трейд-ин! Давайте оценим ваш Civic. Какой пробег и в каком состоянии машина?",
    timestamp: daysAgo(1, 5),
  },
  {
    id: "msg-1-15",
    stageId: "deal-1-stage-2",
    authorId: "client-1",
    authorName: "Иван Петров",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    content:
      "Пробег около 120 тысяч км. Машина в хорошем состоянии, регулярно проходил ТО у официального дилера.",
    timestamp: daysAgo(1, 4),
  },
  {
    id: "msg-1-16",
    stageId: "deal-1-stage-2",
    authorId: "ai",
    authorName: "AI Ассистент",
    content:
      "📊 Данные для трейд-ин: Honda Civic 2015, пробег ~120 тыс. км, хорошее состояние, официальный сервис. Ориентировочная оценка: 650-750 тыс. ₽",
    timestamp: daysAgo(1, 4),
    isAI: true,
  },
];

// Messages for Deal 2 - Negotiation stage (in Russian)
const deal2NegotiationMessages: Message[] = [
  {
    id: "msg-2-1",
    stageId: "deal-2-stage-5",
    authorId: "ai",
    authorName: "AI Ассистент",
    content:
      "Переходим к этапу переговоров. Анна прошла тест-драйв Honda Accord Sport и выразила сильный интерес к покупке.",
    timestamp: daysAgo(1, 10),
    isAI: true,
  },
  {
    id: "msg-2-2",
    stageId: "deal-2-stage-5",
    authorId: "user-2",
    authorName: "Мария (Менеджер)",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
    content:
      "Анна, как вам тест-драйв? Комплектация Sport действительно отлично управляется, правда?",
    timestamp: daysAgo(1, 9),
  },
  {
    id: "msg-2-3",
    stageId: "deal-2-stage-5",
    authorId: "client-2",
    authorName: "Анна Сидорова",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    content:
      "Мне очень понравилось! Управляемость потрясающая, и салон выглядит премиально. Давайте обсудим цену. Какая лучшая цена на белый?",
    timestamp: daysAgo(1, 8),
  },
  {
    id: "msg-2-4",
    stageId: "deal-2-stage-5",
    authorId: "ai",
    authorName: "AI Ассистент",
    content:
      "🎯 Клиент готов к переговорам. Предпочтительный цвет: белый. Обнаружены высокие сигналы покупки.",
    timestamp: daysAgo(1, 8),
    isAI: true,
  },
  {
    id: "msg-2-5",
    stageId: "deal-2-stage-5",
    authorId: "user-2",
    authorName: "Мария (Менеджер)",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
    content:
      "Белый перламутр — отличный выбор! РРЦ составляет 2 890 000 ₽, но я могу предложить вам специальную цену 2 750 000 ₽. Это скидка более 140 тысяч!",
    timestamp: daysAgo(1, 7),
  },
  {
    id: "msg-2-6",
    stageId: "deal-2-stage-5",
    authorId: "client-2",
    authorName: "Анна Сидорова",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    content:
      "Это уже ближе к тому, что я рассчитывала. А можно добавить коврики и первое ТО? Видела у конкурентов похожие предложения.",
    timestamp: daysAgo(1, 6),
  },
  {
    id: "msg-2-7",
    stageId: "deal-2-stage-5",
    authorId: "ai",
    authorName: "AI Ассистент",
    content:
      "⚠️ Клиент просит дополнения: коврики + первое ТО. Упомянуты конкуренты — нужно отработать возражение.",
    timestamp: daysAgo(1, 6),
    isAI: true,
  },
  {
    id: "msg-2-8",
    stageId: "deal-2-stage-5",
    authorId: "user-2",
    authorName: "Мария (Менеджер)",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
    content:
      "Конечно! Я могу включить оригинальные коврики и первое ТО в подарок. Это стандартная практика для наших постоянных клиентов. Когда планируете забрать автомобиль?",
    timestamp: daysAgo(1, 5),
  },
  {
    id: "msg-2-9",
    stageId: "deal-2-stage-5",
    authorId: "client-2",
    authorName: "Анна Сидорова",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    content:
      "Отлично! Хотела бы на этой неделе. Ещё вопрос — какие условия по кредиту? У меня есть одобрение от Сбербанка под 12%.",
    timestamp: daysAgo(1, 4),
  },
  {
    id: "msg-2-10",
    stageId: "deal-2-stage-5",
    authorId: "ai",
    authorName: "AI Ассистент",
    content:
      "💳 Клиент имеет одобрение кредита от Сбербанка под 12%. Проверить наши партнёрские программы — возможно предложить лучшую ставку.",
    timestamp: daysAgo(1, 4),
    isAI: true,
  },
  {
    id: "msg-2-11",
    stageId: "deal-2-stage-5",
    authorId: "user-2",
    authorName: "Мария (Менеджер)",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
    content:
      "У нас есть партнёрская программа с Альфа-Банком — могу предложить 9,9% при первоначальном взносе от 20%. Это сэкономит вам около 80 тысяч за весь срок!",
    timestamp: daysAgo(1, 3),
  },
  {
    id: "msg-2-12",
    stageId: "deal-2-stage-5",
    authorId: "client-2",
    authorName: "Анна Сидорова",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    content:
      "Отличное предложение! Давайте оформлять. Первоначальный взнос могу внести 600 тысяч.",
    timestamp: daysAgo(0, 6),
  },
  {
    id: "msg-2-13",
    stageId: "deal-2-stage-5",
    authorId: "ai",
    authorName: "AI Ассистент",
    content:
      "✅ Сделка согласована! Цена: 2 750 000 ₽, первоначальный взнос: 600 000 ₽, ставка: 9,9%, подарки: коврики + первое ТО.",
    timestamp: daysAgo(0, 6),
    isAI: true,
  },
];

// Messages for Deal 3 - Closed Won stage (in Russian)
const deal3ClosedMessages: Message[] = [
  {
    id: "msg-3-1",
    stageId: "deal-3-stage-7",
    authorId: "ai",
    authorName: "AI Ассистент",
    content:
      "🎉 Сделка закрыта! Михаил Ким завершил покупку BMW X5 2023. Общая сумма: 6 250 000 ₽",
    timestamp: daysAgo(3, 8),
    isAI: true,
  },
  {
    id: "msg-3-2",
    stageId: "deal-3-stage-7",
    authorId: "user-3",
    authorName: "Дмитрий (Менеджер)",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    content:
      "Поздравляю, Михаил! Ваш новый X5 будет готов к выдаче завтра в 10:00. Все документы оформлены.",
    timestamp: daysAgo(3, 7),
  },
  {
    id: "msg-3-3",
    stageId: "deal-3-stage-7",
    authorId: "client-3",
    authorName: "Михаил Ким",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    content:
      "Спасибо большое, Дмитрий! Это был самый приятный опыт покупки автомобиля в моей жизни. До завтра!",
    timestamp: daysAgo(3, 6),
  },
  {
    id: "msg-3-4",
    stageId: "deal-3-stage-7",
    authorId: "ai",
    authorName: "AI Ассистент",
    content:
      "⭐ Уровень удовлетворённости: Очень высокий. Рекомендую запросить рекомендацию и отзыв на Яндекс.Картах.",
    timestamp: daysAgo(3, 6),
    isAI: true,
  },
  {
    id: "msg-3-5",
    stageId: "deal-3-stage-7",
    authorId: "user-3",
    authorName: "Дмитрий (Менеджер)",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    content:
      "Михаил, если у вас есть друзья или коллеги, которые планируют покупку автомобиля, буду рад помочь. У нас есть программа «Приведи друга» — бонус 30 000 ₽ на сервис!",
    timestamp: daysAgo(3, 5),
  },
  {
    id: "msg-3-6",
    stageId: "deal-3-stage-7",
    authorId: "client-3",
    authorName: "Михаил Ким",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    content:
      "Обязательно расскажу! Мой партнёр по бизнесу как раз присматривает X3. Дам ему ваш контакт.",
    timestamp: daysAgo(3, 4),
  },
  {
    id: "msg-3-7",
    stageId: "deal-3-stage-7",
    authorId: "ai",
    authorName: "AI Ассистент",
    content:
      "🔥 Потенциальный лид: партнёр клиента интересуется BMW X3. Создать новую сделку после получения контакта.",
    timestamp: daysAgo(3, 4),
    isAI: true,
  },
  {
    id: "msg-3-8",
    stageId: "deal-3-stage-7",
    authorId: "user-3",
    authorName: "Дмитрий (Менеджер)",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    content:
      "Буду ждать! Напомню: завтра в 10:00, не забудьте паспорт и права. Подготовим небольшой сюрприз к выдаче 🎁",
    timestamp: daysAgo(3, 3),
  },
  {
    id: "msg-3-9",
    stageId: "deal-3-stage-7",
    authorId: "client-3",
    authorName: "Михаил Ким",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    content:
      "Интригуете! Обязательно буду вовремя. Ещё раз спасибо за профессионализм!",
    timestamp: daysAgo(3, 2),
  },
  {
    id: "msg-3-10",
    stageId: "deal-3-stage-7",
    authorId: "ai",
    authorName: "AI Ассистент",
    content:
      "📋 Чек-лист на выдачу: ✅ Документы готовы, ✅ Автомобиль на мойке, ✅ Подарочный набор подготовлен, ⏰ Выдача: завтра 10:00",
    timestamp: daysAgo(3, 2),
    isAI: true,
  },
];

// Messages for Deal 4 - Qualification stage (in Russian)
const deal4QualificationMessages: Message[] = [
  {
    id: "msg-4-1",
    stageId: "deal-4-stage-1",
    authorId: "ai",
    authorName: "AI Ассистент",
    content:
      "Новый лид: Елена Волкова. Интересуется Kia K5 2024. Необходимо провести квалификацию.",
    timestamp: daysAgo(0, 4),
    isAI: true,
  },
  {
    id: "msg-4-2",
    stageId: "deal-4-stage-1",
    authorId: "user-4",
    authorName: "Павел (Менеджер)",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pavel",
    content:
      "Здравствуйте, Елена! Меня зовут Павел, я ваш персональный менеджер. Вижу, что вас заинтересовал Kia K5. Расскажите, что привело вас к нам?",
    timestamp: daysAgo(0, 3),
  },
  {
    id: "msg-4-3",
    stageId: "deal-4-stage-1",
    authorId: "client-4",
    authorName: "Елена Волкова",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena",
    content:
      "Добрый день! Да, мне понравился дизайн K5 на фотографиях. Хочу узнать больше о комплектациях и ценах.",
    timestamp: daysAgo(0, 2),
  },
  {
    id: "msg-4-4",
    stageId: "deal-4-stage-1",
    authorId: "ai",
    authorName: "AI Ассистент",
    content:
      "📌 Первичный интерес: дизайн. Клиент на этапе сбора информации. Рекомендую уточнить бюджет и сроки покупки.",
    timestamp: daysAgo(0, 2),
    isAI: true,
  },
];

// Messages for Deal 5 - Vehicle Selection stage (in Russian)
const deal5VehicleSelectionMessages: Message[] = [
  {
    id: "msg-5-1",
    stageId: "deal-5-stage-3",
    authorId: "ai",
    authorName: "AI Ассистент",
    content:
      "Переходим к этапу подбора автомобиля. Сергей ищет кроссовер для семьи с двумя детьми.",
    timestamp: daysAgo(1, 6),
    isAI: true,
  },
  {
    id: "msg-5-2",
    stageId: "deal-5-stage-3",
    authorId: "user-5",
    authorName: "Наталья (Менеджер)",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Natalia",
    content:
      "Сергей, на основе ваших требований я подобрала три варианта CX-5: комплектации Active, Supreme и Premium. Давайте разберём каждую.",
    timestamp: daysAgo(1, 5),
  },
  {
    id: "msg-5-3",
    stageId: "deal-5-stage-3",
    authorId: "client-5",
    authorName: "Сергей Новиков",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sergey",
    content:
      "Отлично! Меня особенно интересует безопасность — у нас маленькие дети. Какая комплектация лучше в этом плане?",
    timestamp: daysAgo(1, 4),
  },
  {
    id: "msg-5-4",
    stageId: "deal-5-stage-3",
    authorId: "ai",
    authorName: "AI Ассистент",
    content:
      "👨‍👩‍👧‍👦 Ключевой приоритет: безопасность для семьи с детьми. Рекомендую комплектацию Supreme или Premium с полным пакетом i-Activsense.",
    timestamp: daysAgo(1, 4),
    isAI: true,
  },
];

// Messages for Deal 6 - Test Drive stage (in Russian)
const deal6TestDriveMessages: Message[] = [
  {
    id: "msg-6-1",
    stageId: "deal-6-stage-4",
    authorId: "ai",
    authorName: "AI Ассистент",
    content:
      "Тест-драйв назначен на сегодня в 15:00. Ольга хочет проверить Hyundai Tucson в городских условиях.",
    timestamp: daysAgo(0, 8),
    isAI: true,
  },
  {
    id: "msg-6-2",
    stageId: "deal-6-stage-4",
    authorId: "user-6",
    authorName: "Игорь (Менеджер)",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Igor",
    content:
      "Ольга, автомобиль готов к тест-драйву. Проложил маршрут через центр и по трассе — так вы сможете оценить все режимы работы.",
    timestamp: daysAgo(0, 7),
  },
  {
    id: "msg-6-3",
    stageId: "deal-6-stage-4",
    authorId: "client-6",
    authorName: "Ольга Морозова",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Olga",
    content:
      "Спасибо! Буду через полчаса. Можно ли взять с собой мужа? Он тоже хочет попробовать.",
    timestamp: daysAgo(0, 6),
  },
  {
    id: "msg-6-4",
    stageId: "deal-6-stage-4",
    authorId: "ai",
    authorName: "AI Ассистент",
    content:
      "👥 Муж присоединится к тест-драйву — положительный сигнал, семейное решение. Подготовить информацию для обоих водителей.",
    timestamp: daysAgo(0, 6),
    isAI: true,
  },
];

// Messages for Deal 7 - Documentation stage (in Russian)
const deal7DocumentationMessages: Message[] = [
  {
    id: "msg-7-1",
    stageId: "deal-7-stage-6",
    authorId: "ai",
    authorName: "AI Ассистент",
    content:
      "Сделка на этапе оформления. Mercedes GLC 300 для Артёма Козлова. Сумма: 5 890 000 ₽, кредит одобрен.",
    timestamp: daysAgo(0, 10),
    isAI: true,
  },
  {
    id: "msg-7-2",
    stageId: "deal-7-stage-6",
    authorId: "user-7",
    authorName: "Виктория (Менеджер)",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Victoria",
    content:
      "Артём, кредит одобрен на отличных условиях: 8,5% годовых на 5 лет. Осталось подписать договор и внести первоначальный взнос.",
    timestamp: daysAgo(0, 9),
  },
  {
    id: "msg-7-3",
    stageId: "deal-7-stage-6",
    authorId: "client-7",
    authorName: "Артём Козлов",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Artem",
    content: "Отлично! Когда можно подъехать? И какие документы нужны с собой?",
    timestamp: daysAgo(0, 8),
  },
  {
    id: "msg-7-4",
    stageId: "deal-7-stage-6",
    authorId: "ai",
    authorName: "AI Ассистент",
    content:
      "📄 Чек-лист документов: паспорт, СНИЛС, водительское удостоверение. Клиент готов к финальному этапу.",
    timestamp: daysAgo(0, 8),
    isAI: true,
  },
  {
    id: "msg-7-5",
    stageId: "deal-7-stage-6",
    authorId: "user-7",
    authorName: "Виктория (Менеджер)",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Victoria",
    content:
      "Жду вас завтра с 10:00 до 20:00. С собой: паспорт, права и СНИЛС. Оформление займёт около часа.",
    timestamp: daysAgo(0, 7),
  },
];

// Messages for Deal 1 - Qualification stage (stage 1)
const deal1QualificationMessages: Message[] = [
  {
    id: "msg-1-q-1",
    stageId: "deal-1-stage-1",
    authorId: "ai",
    authorName: "AI Ассистент",
    content:
      "Новый лид: Иван Петров. Источник: сайт. Интересуется Toyota Camry 2024.",
    timestamp: daysAgo(3, 10),
    isAI: true,
  },
  {
    id: "msg-1-q-2",
    stageId: "deal-1-stage-1",
    authorId: "user-1",
    authorName: "Алексей (Менеджер)",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    content:
      "Здравствуйте, Иван! Меня зовут Алексей. Вижу, что вас интересует Toyota Camry. Когда планируете покупку?",
    timestamp: daysAgo(3, 9),
  },
  {
    id: "msg-1-q-3",
    stageId: "deal-1-stage-1",
    authorId: "client-1",
    authorName: "Иван Петров",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    content:
      "Добрый день! Планирую в ближайший месяц. Хочу сначала узнать про комплектации и цены.",
    timestamp: daysAgo(3, 8),
  },
  {
    id: "msg-1-q-4",
    stageId: "deal-1-stage-1",
    authorId: "ai",
    authorName: "AI Ассистент",
    content:
      "✅ Квалификация пройдена: клиент готов к покупке в течение месяца. Переходим к выявлению потребностей.",
    timestamp: daysAgo(3, 7),
    isAI: true,
  },
];

// Messages for Deal 2 - Previous stages (stages 1-4)
const deal2QualificationMessages: Message[] = [
  {
    id: "msg-2-q-1",
    stageId: "deal-2-stage-1",
    authorId: "ai",
    authorName: "AI Ассистент",
    content:
      "Новый лид: Анна Сидорова. Источник: рекомендация. Интересуется Honda Accord.",
    timestamp: daysAgo(7, 12),
    isAI: true,
  },
  {
    id: "msg-2-q-2",
    stageId: "deal-2-stage-1",
    authorId: "user-2",
    authorName: "Мария (Менеджер)",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
    content:
      "Здравствуйте, Анна! Рада, что вы к нам обратились. Когда вам удобно приехать на консультацию?",
    timestamp: daysAgo(7, 11),
  },
  {
    id: "msg-2-q-3",
    stageId: "deal-2-stage-1",
    authorId: "client-2",
    authorName: "Анна Сидорова",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    content:
      "Здравствуйте! Могу в эту субботу. Мне друзья очень хвалили Honda Accord.",
    timestamp: daysAgo(7, 10),
  },
  {
    id: "msg-2-q-4",
    stageId: "deal-2-stage-1",
    authorId: "ai",
    authorName: "AI Ассистент",
    content:
      "✅ Квалификация: горячий лид по рекомендации, визит назначен на субботу.",
    timestamp: daysAgo(7, 10),
    isAI: true,
  },
];

const deal2NeedsAssessmentMessages: Message[] = [
  {
    id: "msg-2-na-1",
    stageId: "deal-2-stage-2",
    authorId: "ai",
    authorName: "AI Ассистент",
    content: "Анна пришла на консультацию. Начинаем выявление потребностей.",
    timestamp: daysAgo(5, 10),
    isAI: true,
  },
  {
    id: "msg-2-na-2",
    stageId: "deal-2-stage-2",
    authorId: "user-2",
    authorName: "Мария (Менеджер)",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
    content:
      "Анна, расскажите, для каких целей вам нужен автомобиль? Какой стиль вождения предпочитаете?",
    timestamp: daysAgo(5, 9),
  },
  {
    id: "msg-2-na-3",
    stageId: "deal-2-stage-2",
    authorId: "client-2",
    authorName: "Анна Сидорова",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    content:
      "Мне нужен динамичный автомобиль. Люблю быструю езду, но важен и комфорт. Бюджет до 3 миллионов.",
    timestamp: daysAgo(5, 8),
  },
  {
    id: "msg-2-na-4",
    stageId: "deal-2-stage-2",
    authorId: "ai",
    authorName: "AI Ассистент",
    content:
      "📝 Профиль клиента: динамичное вождение, комфорт, бюджет до 3 млн ₽. Рекомендация: Honda Accord Sport.",
    timestamp: daysAgo(5, 8),
    isAI: true,
  },
];

const deal2VehicleSelectionMessages: Message[] = [
  {
    id: "msg-2-vs-1",
    stageId: "deal-2-stage-3",
    authorId: "ai",
    authorName: "AI Ассистент",
    content: "Этап подбора автомобиля. Показываем Honda Accord Sport и EX-L.",
    timestamp: daysAgo(4, 10),
    isAI: true,
  },
  {
    id: "msg-2-vs-2",
    stageId: "deal-2-stage-3",
    authorId: "user-2",
    authorName: "Мария (Менеджер)",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
    content:
      "Анна, вот Honda Accord Sport — 2.0 турбо, 252 л.с. Идеально для вашего стиля вождения!",
    timestamp: daysAgo(4, 9),
  },
  {
    id: "msg-2-vs-3",
    stageId: "deal-2-stage-3",
    authorId: "client-2",
    authorName: "Анна Сидорова",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    content: "Вау, мощность впечатляет! А какие цвета есть в наличии?",
    timestamp: daysAgo(4, 8),
  },
  {
    id: "msg-2-vs-4",
    stageId: "deal-2-stage-3",
    authorId: "ai",
    authorName: "AI Ассистент",
    content:
      "✅ Клиент заинтересован в Sport. В наличии: белый перламутр, чёрный, серый. Переходим к тест-драйву.",
    timestamp: daysAgo(4, 8),
    isAI: true,
  },
];

const deal2TestDriveMessages: Message[] = [
  {
    id: "msg-2-td-1",
    stageId: "deal-2-stage-4",
    authorId: "ai",
    authorName: "AI Ассистент",
    content: "Тест-драйв Honda Accord Sport. Маршрут: город + трасса.",
    timestamp: daysAgo(3, 10),
    isAI: true,
  },
  {
    id: "msg-2-td-2",
    stageId: "deal-2-stage-4",
    authorId: "user-2",
    authorName: "Мария (Менеджер)",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
    content: "Анна, как вам ускорение? Турбина раскрывается на 2000 оборотах.",
    timestamp: daysAgo(3, 9),
  },
  {
    id: "msg-2-td-3",
    stageId: "deal-2-stage-4",
    authorId: "client-2",
    authorName: "Анна Сидорова",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    content:
      "Потрясающе! Разгон очень плавный и мощный. И шумоизоляция на высоте. Я влюбилась в эту машину!",
    timestamp: daysAgo(3, 8),
  },
  {
    id: "msg-2-td-4",
    stageId: "deal-2-stage-4",
    authorId: "ai",
    authorName: "AI Ассистент",
    content:
      "🎯 Тест-драйв успешен! Клиент выразил сильное желание купить. Готова к переговорам.",
    timestamp: daysAgo(3, 8),
    isAI: true,
  },
];

// Messages for Deal 3 - All previous stages (stages 1-6)
const deal3QualificationMessages: Message[] = [
  {
    id: "msg-3-q-1",
    stageId: "deal-3-stage-1",
    authorId: "ai",
    authorName: "AI Ассистент",
    content: "VIP-лид: Михаил Ким. Владелец бизнеса. Интересуется BMW X5.",
    timestamp: daysAgo(14, 10),
    isAI: true,
  },
  {
    id: "msg-3-q-2",
    stageId: "deal-3-stage-1",
    authorId: "user-3",
    authorName: "Дмитрий (Менеджер)",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    content:
      "Михаил, добрый день! Для вас подготовлю персональное предложение на BMW X5. Какая комплектация интересует?",
    timestamp: daysAgo(14, 9),
  },
  {
    id: "msg-3-q-3",
    stageId: "deal-3-stage-1",
    authorId: "client-3",
    authorName: "Михаил Ким",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    content:
      "Добрый день! Интересует максимальная комплектация. Бюджет не ограничен, важно качество.",
    timestamp: daysAgo(14, 8),
  },
  {
    id: "msg-3-q-4",
    stageId: "deal-3-stage-1",
    authorId: "ai",
    authorName: "AI Ассистент",
    content:
      "💎 VIP-клиент: бюджет не ограничен, приоритет — качество. Максимальное внимание к сервису.",
    timestamp: daysAgo(14, 8),
    isAI: true,
  },
];

const deal3NeedsMessages: Message[] = [
  {
    id: "msg-3-na-1",
    stageId: "deal-3-stage-2",
    authorId: "ai",
    authorName: "AI Ассистент",
    content:
      "Выявление потребностей VIP-клиента. Важно: статус, комфорт, технологии.",
    timestamp: daysAgo(12, 10),
    isAI: true,
  },
  {
    id: "msg-3-na-2",
    stageId: "deal-3-stage-2",
    authorId: "user-3",
    authorName: "Дмитрий (Менеджер)",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    content:
      "Михаил, какие функции для вас наиболее важны? Часто ездите на дальние расстояния?",
    timestamp: daysAgo(12, 9),
  },
  {
    id: "msg-3-na-3",
    stageId: "deal-3-stage-2",
    authorId: "client-3",
    authorName: "Михаил Ким",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    content:
      "Да, часто езжу между городами. Важны комфорт на трассе, мощный двигатель и премиальный салон.",
    timestamp: daysAgo(12, 8),
  },
  {
    id: "msg-3-na-4",
    stageId: "deal-3-stage-2",
    authorId: "ai",
    authorName: "AI Ассистент",
    content:
      "📝 Потребности: дальние поездки, комфорт, мощность, премиум. Рекомендация: X5 xDrive40i M Sport.",
    timestamp: daysAgo(12, 8),
    isAI: true,
  },
];

const deal3VehicleMessages: Message[] = [
  {
    id: "msg-3-vs-1",
    stageId: "deal-3-stage-3",
    authorId: "ai",
    authorName: "AI Ассистент",
    content: "Презентация BMW X5 xDrive40i M Sport для VIP-клиента.",
    timestamp: daysAgo(10, 10),
    isAI: true,
  },
  {
    id: "msg-3-vs-2",
    stageId: "deal-3-stage-3",
    authorId: "user-3",
    authorName: "Дмитрий (Менеджер)",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    content:
      "Михаил, вот X5 в комплектации M Sport: 340 л.с., пневмоподвеска, салон Vernasca, панорамная крыша.",
    timestamp: daysAgo(10, 9),
  },
  {
    id: "msg-3-vs-3",
    stageId: "deal-3-stage-3",
    authorId: "client-3",
    authorName: "Михаил Ким",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    content:
      "Отличная комплектация! Какие цвета доступны? Предпочитаю что-то статусное.",
    timestamp: daysAgo(10, 8),
  },
  {
    id: "msg-3-vs-4",
    stageId: "deal-3-stage-3",
    authorId: "ai",
    authorName: "AI Ассистент",
    content:
      "🎨 Предложены цвета: Carbon Black, Mineral White, Phytonic Blue. Клиент выбрал Carbon Black.",
    timestamp: daysAgo(10, 8),
    isAI: true,
  },
];

const deal3TestDriveMessages: Message[] = [
  {
    id: "msg-3-td-1",
    stageId: "deal-3-stage-4",
    authorId: "ai",
    authorName: "AI Ассистент",
    content: "VIP тест-драйв BMW X5. Расширенный маршрут с трассой.",
    timestamp: daysAgo(8, 10),
    isAI: true,
  },
  {
    id: "msg-3-td-2",
    stageId: "deal-3-stage-4",
    authorId: "user-3",
    authorName: "Дмитрий (Менеджер)",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    content:
      "Михаил, обратите внимание на работу пневмоподвески в режиме Comfort. На трассе она творит чудеса.",
    timestamp: daysAgo(8, 9),
  },
  {
    id: "msg-3-td-3",
    stageId: "deal-3-stage-4",
    authorId: "client-3",
    authorName: "Михаил Ким",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    content:
      "Впечатляет! Машина просто летит, а в салоне тишина. Это то, что мне нужно.",
    timestamp: daysAgo(8, 8),
  },
  {
    id: "msg-3-td-4",
    stageId: "deal-3-stage-4",
    authorId: "ai",
    authorName: "AI Ассистент",
    content:
      "✅ Тест-драйв превзошёл ожидания. Клиент готов к оформлению сделки.",
    timestamp: daysAgo(8, 8),
    isAI: true,
  },
];

const deal3NegotiationMessages: Message[] = [
  {
    id: "msg-3-n-1",
    stageId: "deal-3-stage-5",
    authorId: "ai",
    authorName: "AI Ассистент",
    content: "Переговоры по BMW X5. Клиент VIP — максимальный сервис.",
    timestamp: daysAgo(6, 10),
    isAI: true,
  },
  {
    id: "msg-3-n-2",
    stageId: "deal-3-stage-5",
    authorId: "user-3",
    authorName: "Дмитрий (Менеджер)",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    content:
      "Михаил, для вас специальная цена: 6 250 000 ₽. В подарок: зимние шины, защитная плёнка и 3 года сервиса.",
    timestamp: daysAgo(6, 9),
  },
  {
    id: "msg-3-n-3",
    stageId: "deal-3-stage-5",
    authorId: "client-3",
    authorName: "Михаил Ким",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    content:
      "Отличное предложение! Оплачу сразу, без кредита. Когда можно забрать?",
    timestamp: daysAgo(6, 8),
  },
  {
    id: "msg-3-n-4",
    stageId: "deal-3-stage-5",
    authorId: "ai",
    authorName: "AI Ассистент",
    content:
      "💰 Сделка согласована: 6 250 000 ₽, полная оплата. VIP-подарки включены.",
    timestamp: daysAgo(6, 8),
    isAI: true,
  },
];

const deal3DocumentationMessages: Message[] = [
  {
    id: "msg-3-d-1",
    stageId: "deal-3-stage-6",
    authorId: "ai",
    authorName: "AI Ассистент",
    content: "Оформление документов для VIP-клиента. Ускоренная процедура.",
    timestamp: daysAgo(4, 10),
    isAI: true,
  },
  {
    id: "msg-3-d-2",
    stageId: "deal-3-stage-6",
    authorId: "user-3",
    authorName: "Дмитрий (Менеджер)",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    content:
      "Михаил, все документы готовы. Осталось только подписать договор купли-продажи.",
    timestamp: daysAgo(4, 9),
  },
  {
    id: "msg-3-d-3",
    stageId: "deal-3-stage-6",
    authorId: "client-3",
    authorName: "Михаил Ким",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    content: "Отлично! Приеду сегодня после обеда подписать.",
    timestamp: daysAgo(4, 8),
  },
  {
    id: "msg-3-d-4",
    stageId: "deal-3-stage-6",
    authorId: "ai",
    authorName: "AI Ассистент",
    content:
      "📋 Документы подписаны. Оплата получена. Выдача назначена на завтра.",
    timestamp: daysAgo(4, 6),
    isAI: true,
  },
];

// Messages for Deal 5 - Previous stages (stages 1-2)
const deal5QualificationMessages: Message[] = [
  {
    id: "msg-5-q-1",
    stageId: "deal-5-stage-1",
    authorId: "ai",
    authorName: "AI Ассистент",
    content: "Новый лид: Сергей Новиков. Семья с детьми ищет кроссовер.",
    timestamp: daysAgo(5, 10),
    isAI: true,
  },
  {
    id: "msg-5-q-2",
    stageId: "deal-5-stage-1",
    authorId: "user-5",
    authorName: "Наталья (Менеджер)",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Natalia",
    content:
      "Здравствуйте, Сергей! Какой кроссовер рассматриваете? Какие приоритеты?",
    timestamp: daysAgo(5, 9),
  },
  {
    id: "msg-5-q-3",
    stageId: "deal-5-stage-1",
    authorId: "client-5",
    authorName: "Сергей Новиков",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sergey",
    content:
      "Добрый день! Смотрю Mazda CX-5. Главное — безопасность, у нас двое детей.",
    timestamp: daysAgo(5, 8),
  },
  {
    id: "msg-5-q-4",
    stageId: "deal-5-stage-1",
    authorId: "ai",
    authorName: "AI Ассистент",
    content:
      "👨‍👩‍👧‍👦 Семейный клиент. Приоритет: безопасность для детей. CX-5 — отличный выбор с i-Activsense.",
    timestamp: daysAgo(5, 8),
    isAI: true,
  },
];

const deal5NeedsMessages: Message[] = [
  {
    id: "msg-5-na-1",
    stageId: "deal-5-stage-2",
    authorId: "ai",
    authorName: "AI Ассистент",
    content:
      "Выявление потребностей: семейный кроссовер с акцентом на безопасность.",
    timestamp: daysAgo(3, 10),
    isAI: true,
  },
  {
    id: "msg-5-na-2",
    stageId: "deal-5-stage-2",
    authorId: "user-5",
    authorName: "Наталья (Менеджер)",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Natalia",
    content:
      "Сергей, помимо безопасности, что ещё важно? Часто ездите за город?",
    timestamp: daysAgo(3, 9),
  },
  {
    id: "msg-5-na-3",
    stageId: "deal-5-stage-2",
    authorId: "client-5",
    authorName: "Сергей Новиков",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sergey",
    content:
      "Да, каждые выходные на дачу. Нужен полный привод и вместительный багажник для коляски и вещей.",
    timestamp: daysAgo(3, 8),
  },
  {
    id: "msg-5-na-4",
    stageId: "deal-5-stage-2",
    authorId: "ai",
    authorName: "AI Ассистент",
    content:
      "📝 Требования: безопасность, полный привод, большой багажник. Бюджет: уточнить.",
    timestamp: daysAgo(3, 8),
    isAI: true,
  },
];

// Messages for Deal 6 - Previous stages (stages 1-3)
const deal6QualificationMessages: Message[] = [
  {
    id: "msg-6-q-1",
    stageId: "deal-6-stage-1",
    authorId: "ai",
    authorName: "AI Ассистент",
    content: "Новый лид: Ольга Морозова. Интересуется Hyundai Tucson.",
    timestamp: daysAgo(4, 12),
    isAI: true,
  },
  {
    id: "msg-6-q-2",
    stageId: "deal-6-stage-1",
    authorId: "user-6",
    authorName: "Игорь (Менеджер)",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Igor",
    content: "Ольга, здравствуйте! Что привлекло вас в Tucson?",
    timestamp: daysAgo(4, 11),
  },
  {
    id: "msg-6-q-3",
    stageId: "deal-6-stage-1",
    authorId: "client-6",
    authorName: "Ольга Морозова",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Olga",
    content:
      "Здравствуйте! Нравится дизайн и соотношение цена/качество. Хочу современный и надёжный автомобиль.",
    timestamp: daysAgo(4, 10),
  },
  {
    id: "msg-6-q-4",
    stageId: "deal-6-stage-1",
    authorId: "ai",
    authorName: "AI Ассистент",
    content:
      "✅ Квалификация: ценит дизайн, соотношение цена/качество. Горячий лид.",
    timestamp: daysAgo(4, 10),
    isAI: true,
  },
];

const deal6NeedsMessages: Message[] = [
  {
    id: "msg-6-na-1",
    stageId: "deal-6-stage-2",
    authorId: "ai",
    authorName: "AI Ассистент",
    content: "Выявление потребностей: современный надёжный кроссовер.",
    timestamp: daysAgo(2, 10),
    isAI: true,
  },
  {
    id: "msg-6-na-2",
    stageId: "deal-6-stage-2",
    authorId: "user-6",
    authorName: "Игорь (Менеджер)",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Igor",
    content:
      "Ольга, какой бюджет рассматриваете? И какие функции для вас обязательны?",
    timestamp: daysAgo(2, 9),
  },
  {
    id: "msg-6-na-3",
    stageId: "deal-6-stage-2",
    authorId: "client-6",
    authorName: "Ольга Морозова",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Olga",
    content:
      "До 2,5 миллионов. Обязательно: камера заднего вида, подогрев сидений, Apple CarPlay.",
    timestamp: daysAgo(2, 8),
  },
  {
    id: "msg-6-na-4",
    stageId: "deal-6-stage-2",
    authorId: "ai",
    authorName: "AI Ассистент",
    content:
      "📝 Бюджет: до 2,5 млн ₽. Требования: камера, подогрев, CarPlay. Рекомендация: Comfort Plus.",
    timestamp: daysAgo(2, 8),
    isAI: true,
  },
];

const deal6VehicleMessages: Message[] = [
  {
    id: "msg-6-vs-1",
    stageId: "deal-6-stage-3",
    authorId: "ai",
    authorName: "AI Ассистент",
    content: "Подбор автомобиля: Hyundai Tucson Comfort Plus.",
    timestamp: daysAgo(1, 10),
    isAI: true,
  },
  {
    id: "msg-6-vs-2",
    stageId: "deal-6-stage-3",
    authorId: "user-6",
    authorName: "Игорь (Менеджер)",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Igor",
    content:
      "Ольга, комплектация Comfort Plus включает всё, что вы хотели, и укладывается в бюджет: 2 390 000 ₽.",
    timestamp: daysAgo(1, 9),
  },
  {
    id: "msg-6-vs-3",
    stageId: "deal-6-stage-3",
    authorId: "client-6",
    authorName: "Ольга Морозова",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Olga",
    content:
      "Отлично! Хочу посмотреть вживую и прокатиться. Когда можно записаться на тест-драйв?",
    timestamp: daysAgo(1, 8),
  },
  {
    id: "msg-6-vs-4",
    stageId: "deal-6-stage-3",
    authorId: "ai",
    authorName: "AI Ассистент",
    content: "🚗 Клиент готов к тест-драйву. Назначить на ближайшее время.",
    timestamp: daysAgo(1, 8),
    isAI: true,
  },
];

// Messages for Deal 7 - Previous stages (stages 1-5)
const deal7QualificationMessages: Message[] = [
  {
    id: "msg-7-q-1",
    stageId: "deal-7-stage-1",
    authorId: "ai",
    authorName: "AI Ассистент",
    content: "Премиум-лид: Артём Козлов. Интересуется Mercedes GLC.",
    timestamp: daysAgo(10, 12),
    isAI: true,
  },
  {
    id: "msg-7-q-2",
    stageId: "deal-7-stage-1",
    authorId: "user-7",
    authorName: "Виктория (Менеджер)",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Victoria",
    content:
      "Артём, добрый день! Mercedes GLC — отличный выбор. Какую версию рассматриваете?",
    timestamp: daysAgo(10, 11),
  },
  {
    id: "msg-7-q-3",
    stageId: "deal-7-stage-1",
    authorId: "client-7",
    authorName: "Артём Козлов",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Artem",
    content:
      "Добрый день! Смотрю GLC 300. Хочу что-то представительное для работы.",
    timestamp: daysAgo(10, 10),
  },
  {
    id: "msg-7-q-4",
    stageId: "deal-7-stage-1",
    authorId: "ai",
    authorName: "AI Ассистент",
    content:
      "💼 Бизнес-клиент: представительский автомобиль для работы. GLC 300 идеально подходит.",
    timestamp: daysAgo(10, 10),
    isAI: true,
  },
];

const deal7NeedsMessages: Message[] = [
  {
    id: "msg-7-na-1",
    stageId: "deal-7-stage-2",
    authorId: "ai",
    authorName: "AI Ассистент",
    content:
      "Выявление потребностей: бизнес-использование, представительность.",
    timestamp: daysAgo(8, 10),
    isAI: true,
  },
  {
    id: "msg-7-na-2",
    stageId: "deal-7-stage-2",
    authorId: "user-7",
    authorName: "Виктория (Менеджер)",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Victoria",
    content:
      "Артём, часто возите клиентов или партнёров? Какие опции критичны?",
    timestamp: daysAgo(8, 9),
  },
  {
    id: "msg-7-na-3",
    stageId: "deal-7-stage-2",
    authorId: "client-7",
    authorName: "Артём Козлов",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Artem",
    content:
      "Да, регулярно. Важны комфорт задних пассажиров, качественная аудиосистема и навигация.",
    timestamp: daysAgo(8, 8),
  },
  {
    id: "msg-7-na-4",
    stageId: "deal-7-stage-2",
    authorId: "ai",
    authorName: "AI Ассистент",
    content:
      "📝 Требования: комфорт для пассажиров, Burmester аудио, MBUX навигация.",
    timestamp: daysAgo(8, 8),
    isAI: true,
  },
];

const deal7VehicleMessages: Message[] = [
  {
    id: "msg-7-vs-1",
    stageId: "deal-7-stage-3",
    authorId: "ai",
    authorName: "AI Ассистент",
    content: "Презентация Mercedes GLC 300 AMG Line.",
    timestamp: daysAgo(6, 10),
    isAI: true,
  },
  {
    id: "msg-7-vs-2",
    stageId: "deal-7-stage-3",
    authorId: "user-7",
    authorName: "Виктория (Менеджер)",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Victoria",
    content:
      "Артём, GLC 300 AMG Line: 258 л.с., пакет Premium Plus, Burmester, панорама. Цена: 5 890 000 ₽.",
    timestamp: daysAgo(6, 9),
  },
  {
    id: "msg-7-vs-3",
    stageId: "deal-7-stage-3",
    authorId: "client-7",
    authorName: "Артём Козлов",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Artem",
    content:
      "AMG Line выглядит солидно. Есть в чёрном цвете? И какие сроки доставки?",
    timestamp: daysAgo(6, 8),
  },
  {
    id: "msg-7-vs-4",
    stageId: "deal-7-stage-3",
    authorId: "ai",
    authorName: "AI Ассистент",
    content: "✅ Чёрный GLC 300 AMG Line в наличии. Клиент заинтересован.",
    timestamp: daysAgo(6, 8),
    isAI: true,
  },
];

const deal7TestDriveMessages: Message[] = [
  {
    id: "msg-7-td-1",
    stageId: "deal-7-stage-4",
    authorId: "ai",
    authorName: "AI Ассистент",
    content: "Бизнес тест-драйв Mercedes GLC 300 для Артёма.",
    timestamp: daysAgo(4, 10),
    isAI: true,
  },
  {
    id: "msg-7-td-2",
    stageId: "deal-7-stage-4",
    authorId: "user-7",
    authorName: "Виктория (Менеджер)",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Victoria",
    content:
      "Артём, оцените работу Burmester на любимой музыке. И обратите внимание на плавность хода.",
    timestamp: daysAgo(4, 9),
  },
  {
    id: "msg-7-td-3",
    stageId: "deal-7-stage-4",
    authorId: "client-7",
    authorName: "Артём Козлов",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Artem",
    content:
      "Звук потрясающий! И управляется очень легко для такого размера. Я определился — беру.",
    timestamp: daysAgo(4, 8),
  },
  {
    id: "msg-7-td-4",
    stageId: "deal-7-stage-4",
    authorId: "ai",
    authorName: "AI Ассистент",
    content: "🎯 Решение принято! Клиент готов к покупке после тест-драйва.",
    timestamp: daysAgo(4, 8),
    isAI: true,
  },
];

const deal7NegotiationMessages: Message[] = [
  {
    id: "msg-7-n-1",
    stageId: "deal-7-stage-5",
    authorId: "ai",
    authorName: "AI Ассистент",
    content: "Переговоры по Mercedes GLC 300. Клиент готов к покупке.",
    timestamp: daysAgo(2, 10),
    isAI: true,
  },
  {
    id: "msg-7-n-2",
    stageId: "deal-7-stage-5",
    authorId: "user-7",
    authorName: "Виктория (Менеджер)",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Victoria",
    content:
      "Артём, для вас специальные условия: кредит от 8,5% и зимние шины в подарок.",
    timestamp: daysAgo(2, 9),
  },
  {
    id: "msg-7-n-3",
    stageId: "deal-7-stage-5",
    authorId: "client-7",
    authorName: "Артём Козлов",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Artem",
    content:
      "Хорошо! Оформляю в кредит на 5 лет. Первоначальный взнос — 1,5 миллиона.",
    timestamp: daysAgo(2, 8),
  },
  {
    id: "msg-7-n-4",
    stageId: "deal-7-stage-5",
    authorId: "ai",
    authorName: "AI Ассистент",
    content:
      "💰 Условия согласованы: 5 890 000 ₽, кредит 5 лет, ПВ 1,5 млн ₽. Ставка 8,5%.",
    timestamp: daysAgo(2, 8),
    isAI: true,
  },
];

export const mockMessages: Record<string, Message[]> = {
  // Deal 1 - stages 1-2
  "deal-1-stage-1": deal1QualificationMessages,
  "deal-1-stage-2": deal1NeedsAssessmentMessages,
  // Deal 2 - stages 1-5
  "deal-2-stage-1": deal2QualificationMessages,
  "deal-2-stage-2": deal2NeedsAssessmentMessages,
  "deal-2-stage-3": deal2VehicleSelectionMessages,
  "deal-2-stage-4": deal2TestDriveMessages,
  "deal-2-stage-5": deal2NegotiationMessages,
  // Deal 3 - stages 1-7
  "deal-3-stage-1": deal3QualificationMessages,
  "deal-3-stage-2": deal3NeedsMessages,
  "deal-3-stage-3": deal3VehicleMessages,
  "deal-3-stage-4": deal3TestDriveMessages,
  "deal-3-stage-5": deal3NegotiationMessages,
  "deal-3-stage-6": deal3DocumentationMessages,
  "deal-3-stage-7": deal3ClosedMessages,
  // Deal 4 - stage 1 only
  "deal-4-stage-1": deal4QualificationMessages,
  // Deal 5 - stages 1-3
  "deal-5-stage-1": deal5QualificationMessages,
  "deal-5-stage-2": deal5NeedsMessages,
  "deal-5-stage-3": deal5VehicleSelectionMessages,
  // Deal 6 - stages 1-4
  "deal-6-stage-1": deal6QualificationMessages,
  "deal-6-stage-2": deal6NeedsMessages,
  "deal-6-stage-3": deal6VehicleMessages,
  "deal-6-stage-4": deal6TestDriveMessages,
  // Deal 7 - stages 1-6
  "deal-7-stage-1": deal7QualificationMessages,
  "deal-7-stage-2": deal7NeedsMessages,
  "deal-7-stage-3": deal7VehicleMessages,
  "deal-7-stage-4": deal7TestDriveMessages,
  "deal-7-stage-5": deal7NegotiationMessages,
  "deal-7-stage-6": deal7DocumentationMessages,
};

// Memory items for Deal 1 (in Russian)
const deal1Memory: MemoryItem[] = [
  {
    id: "mem-1-1",
    dealId: "deal-1",
    type: "client",
    label: "Текущий автомобиль",
    value: "Honda Civic 2015",
    isPinned: false,
    isNew: false,
  },
  {
    id: "mem-1-2",
    dealId: "deal-1",
    type: "requirement",
    label: "Основное использование",
    value: "Ежедневные поездки (45 мин в одну сторону)",
    isPinned: true,
    isNew: false,
  },
  {
    id: "mem-1-3",
    dealId: "deal-1",
    type: "budget",
    label: "Бюджет",
    value: "3 000 000 - 3 500 000 ₽",
    isPinned: true,
    isNew: false,
  },
  {
    id: "mem-1-4",
    dealId: "deal-1",
    type: "preference",
    label: "Кредитование",
    value: "Предпочтительно 48-60 месяцев",
    isPinned: false,
    isNew: false,
  },
  {
    id: "mem-1-5",
    dealId: "deal-1",
    stageId: "deal-1-stage-2",
    type: "preference",
    label: "Обязательные опции",
    value: "Адаптивный круиз-контроль, удержание в полосе, Apple CarPlay",
    isPinned: true,
    isNew: true,
  },
  {
    id: "mem-1-6",
    dealId: "deal-1",
    stageId: "deal-1-stage-2",
    type: "requirement",
    label: "Приоритет",
    value: "Комфорт для длительных поездок",
    isPinned: false,
    isNew: true,
  },
];

// Memory items for Deal 2 (in Russian)
const deal2Memory: MemoryItem[] = [
  {
    id: "mem-2-1",
    dealId: "deal-2",
    type: "client",
    label: "Сроки решения",
    value: "Готова купить сегодня",
    isPinned: true,
    isNew: false,
  },
  {
    id: "mem-2-2",
    dealId: "deal-2",
    type: "budget",
    label: "Целевая цена",
    value: "Около 2 750 000 ₽",
    isPinned: true,
    isNew: false,
  },
  {
    id: "mem-2-3",
    dealId: "deal-2",
    type: "preference",
    label: "Предпочитаемый цвет",
    value: "Белый перламутр",
    isPinned: false,
    isNew: false,
  },
  {
    id: "mem-2-4",
    dealId: "deal-2",
    type: "preference",
    label: "Комплектация",
    value: "Sport",
    isPinned: true,
    isNew: false,
  },
  {
    id: "mem-2-5",
    dealId: "deal-2",
    stageId: "deal-2-stage-5",
    type: "requirement",
    label: "Запрошенные дополнения",
    value: "Коврики, первое ТО в подарок",
    isPinned: true,
    isNew: true,
  },
  {
    id: "mem-2-6",
    dealId: "deal-2",
    stageId: "deal-2-stage-5",
    type: "timeline",
    label: "Упоминание конкурентов",
    value: "Сравнивала предложения других дилеров",
    isPinned: false,
    isNew: true,
  },
];

// Memory items for Deal 3 (in Russian)
const deal3Memory: MemoryItem[] = [
  {
    id: "mem-3-1",
    dealId: "deal-3",
    type: "budget",
    label: "Итоговая цена",
    value: "6 250 000 ₽",
    isPinned: true,
    isNew: false,
  },
  {
    id: "mem-3-2",
    dealId: "deal-3",
    type: "client",
    label: "Уровень удовлетворённости",
    value: "Очень высокий",
    isPinned: true,
    isNew: false,
  },
  {
    id: "mem-3-3",
    dealId: "deal-3",
    type: "preference",
    label: "Модель",
    value: "BMW X5 2023",
    isPinned: false,
    isNew: false,
  },
  {
    id: "mem-3-4",
    dealId: "deal-3",
    type: "timeline",
    label: "Доставка",
    value: "Назначена выдача",
    isPinned: false,
    isNew: false,
  },
  {
    id: "mem-3-5",
    dealId: "deal-3",
    stageId: "deal-3-stage-7",
    type: "requirement",
    label: "Следующее действие",
    value: "Запросить рекомендацию и отзыв на Яндекс.Картах",
    isPinned: true,
    isNew: false,
  },
];

// Memory items for Deal 4 (in Russian)
const deal4Memory: MemoryItem[] = [
  {
    id: "mem-4-1",
    dealId: "deal-4",
    type: "client",
    label: "Источник",
    value: "Заявка с сайта",
    isPinned: false,
    isNew: true,
  },
  {
    id: "mem-4-2",
    dealId: "deal-4",
    type: "preference",
    label: "Интерес",
    value: "Дизайн автомобиля",
    isPinned: true,
    isNew: true,
  },
  {
    id: "mem-4-3",
    dealId: "deal-4",
    stageId: "deal-4-stage-1",
    type: "requirement",
    label: "Статус",
    value: "Сбор информации",
    isPinned: false,
    isNew: true,
  },
];

// Memory items for Deal 5 (in Russian)
const deal5Memory: MemoryItem[] = [
  {
    id: "mem-5-1",
    dealId: "deal-5",
    type: "client",
    label: "Семья",
    value: "Двое детей",
    isPinned: true,
    isNew: false,
  },
  {
    id: "mem-5-2",
    dealId: "deal-5",
    type: "budget",
    label: "Бюджет",
    value: "2 500 000 - 3 000 000 ₽",
    isPinned: true,
    isNew: false,
  },
  {
    id: "mem-5-3",
    dealId: "deal-5",
    type: "requirement",
    label: "Приоритет",
    value: "Безопасность для семьи",
    isPinned: true,
    isNew: true,
  },
  {
    id: "mem-5-4",
    dealId: "deal-5",
    stageId: "deal-5-stage-3",
    type: "preference",
    label: "Рекомендация",
    value: "Supreme или Premium с i-Activsense",
    isPinned: false,
    isNew: true,
  },
];

// Memory items for Deal 6 (in Russian)
const deal6Memory: MemoryItem[] = [
  {
    id: "mem-6-1",
    dealId: "deal-6",
    type: "client",
    label: "Принятие решения",
    value: "Совместно с мужем",
    isPinned: true,
    isNew: false,
  },
  {
    id: "mem-6-2",
    dealId: "deal-6",
    type: "preference",
    label: "Комплектация",
    value: "Comfort Plus",
    isPinned: false,
    isNew: false,
  },
  {
    id: "mem-6-3",
    dealId: "deal-6",
    stageId: "deal-6-stage-4",
    type: "timeline",
    label: "Тест-драйв",
    value: "Сегодня в 15:00",
    isPinned: true,
    isNew: true,
  },
];

// Memory items for Deal 7 (in Russian)
const deal7Memory: MemoryItem[] = [
  {
    id: "mem-7-1",
    dealId: "deal-7",
    type: "budget",
    label: "Сумма сделки",
    value: "5 890 000 ₽",
    isPinned: true,
    isNew: false,
  },
  {
    id: "mem-7-2",
    dealId: "deal-7",
    type: "preference",
    label: "Кредит",
    value: "8,5% на 5 лет, одобрен",
    isPinned: true,
    isNew: false,
  },
  {
    id: "mem-7-3",
    dealId: "deal-7",
    stageId: "deal-7-stage-6",
    type: "requirement",
    label: "Документы",
    value: "Паспорт, права, СНИЛС",
    isPinned: true,
    isNew: true,
  },
  {
    id: "mem-7-4",
    dealId: "deal-7",
    stageId: "deal-7-stage-6",
    type: "timeline",
    label: "Подписание",
    value: "Завтра с 10:00 до 20:00",
    isPinned: false,
    isNew: true,
  },
];

export const mockMemory: Record<string, MemoryItem[]> = {
  "deal-1": deal1Memory,
  "deal-2": deal2Memory,
  "deal-3": deal3Memory,
  "deal-4": deal4Memory,
  "deal-5": deal5Memory,
  "deal-6": deal6Memory,
  "deal-7": deal7Memory,
};

// Helper functions for accessing data
export function getDealById(dealId: string): Deal | undefined {
  return mockDeals.find((d) => d.id === dealId);
}

export function getStageById(
  dealId: string,
  stageId: string
): Stage | undefined {
  const deal = getDealById(dealId);
  return deal?.stages.find((s) => s.id === stageId);
}

export function getMessagesForStage(stageId: string): Message[] {
  return mockMessages[stageId] || [];
}

/**
 * Get all messages from stage 1 up to and including the given stage
 * Messages are sorted by timestamp (oldest first)
 */
export function getMessagesUpToStage(
  dealId: string,
  stageId: string
): Message[] {
  const deal = getDealById(dealId);
  if (!deal) return [];

  const currentStage = deal.stages.find((s) => s.id === stageId);
  if (!currentStage) return [];

  // Get all stages up to and including the current one
  const relevantStages = deal.stages.filter(
    (s) => s.order <= currentStage.order
  );

  // Collect all messages from these stages
  const allMessages: Message[] = [];
  for (const stage of relevantStages) {
    const stageMessages = mockMessages[stage.id] || [];
    allMessages.push(...stageMessages);
  }

  // Sort by timestamp (oldest first)
  return allMessages.sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
  );
}

export function getMemoryForDeal(dealId: string): MemoryItem[] {
  return mockMemory[dealId] || [];
}

export function getMemoryForStage(
  dealId: string,
  stageId: string
): MemoryItem[] {
  const dealMemory = getMemoryForDeal(dealId);
  return dealMemory.filter((m) => m.stageId === stageId);
}

export function getDealLevelMemory(dealId: string): MemoryItem[] {
  const dealMemory = getMemoryForDeal(dealId);
  return dealMemory.filter((m) => !m.stageId);
}
