import type { Deal, MemoryItem, Message, Stage } from "@/types/chat";

// Helper to create dates relative to now
function daysAgo(days: number, hours = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(date.getHours() - hours);
  return date;
}

// Stages templates for car sales
const stageTemplates = [
  { name: "Lead Qualification", target: "Verify customer intent and budget" },
  {
    name: "Needs Assessment",
    target: "Understand customer requirements and preferences",
  },
  { name: "Vehicle Selection", target: "Present matching vehicle options" },
  { name: "Test Drive", target: "Schedule and complete test drive" },
  { name: "Negotiation", target: "Agree on final price and terms" },
  { name: "Financing", target: "Complete financing and paperwork" },
  { name: "Closed Won", target: "Deliver vehicle and collect payment" },
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
  clientName: "John Smith",
  stages: deal1Stages,
  currentStageId: deal1Stages[1].id,
  unreadCount: 2,
};

// Deal 2: Honda Accord - at Negotiation stage (stage 5)
const deal2Stages = createStages("deal-2", 4);
const deal2: Deal = {
  id: "deal-2",
  name: "Honda Accord Sport",
  clientName: "Sarah Johnson",
  stages: deal2Stages,
  currentStageId: deal2Stages[4].id,
  unreadCount: 1,
};

// Deal 3: BMW X5 - Closed Won (stage 7)
const deal3Stages = createStages("deal-3", 6);
const deal3: Deal = {
  id: "deal-3",
  name: "BMW X5 2023",
  clientName: "Michael Chen",
  stages: deal3Stages,
  currentStageId: deal3Stages[6].id,
  unreadCount: 0,
};

export const mockDeals: Deal[] = [deal1, deal2, deal3];

// Messages for Deal 1 - Needs Assessment stage
const deal1NeedsAssessmentMessages: Message[] = [
  {
    id: "msg-1-1",
    stageId: "deal-1-stage-2",
    authorId: "ai",
    authorName: "AI Assistant",
    content:
      "Starting needs assessment for John Smith. He's interested in the Toyota Camry 2024.",
    timestamp: daysAgo(2, 4),
    isAI: true,
  },
  {
    id: "msg-1-2",
    stageId: "deal-1-stage-2",
    authorId: "user-1",
    authorName: "Alex (Sales)",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    content:
      "Hi John! Thanks for coming in today. What's prompting your interest in a new vehicle?",
    timestamp: daysAgo(2, 3),
  },
  {
    id: "msg-1-3",
    stageId: "deal-1-stage-2",
    authorId: "client-1",
    authorName: "John Smith",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    content:
      "My current car is getting old, it's a 2015 Honda Civic. Looking for something more comfortable for my daily commute - about 45 minutes each way.",
    timestamp: daysAgo(2, 2),
  },
  {
    id: "msg-1-4",
    stageId: "deal-1-stage-2",
    authorId: "ai",
    authorName: "AI Assistant",
    content:
      "Noted: Customer prioritizes comfort for long commute (45 min each way). Current vehicle: 2015 Honda Civic.",
    timestamp: daysAgo(2, 2),
    isAI: true,
  },
  {
    id: "msg-1-5",
    stageId: "deal-1-stage-2",
    authorId: "user-1",
    authorName: "Alex (Sales)",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    content:
      "That's a great reason to upgrade! The Camry is perfect for commuters. Do you have a budget range in mind?",
    timestamp: daysAgo(2, 1),
  },
  {
    id: "msg-1-6",
    stageId: "deal-1-stage-2",
    authorId: "client-1",
    authorName: "John Smith",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    content:
      "I'm thinking around $30,000 to $35,000. I'd prefer to finance if possible, maybe 48 or 60 months.",
    timestamp: daysAgo(1, 5),
  },
  {
    id: "msg-1-7",
    stageId: "deal-1-stage-2",
    authorId: "ai",
    authorName: "AI Assistant",
    content:
      "Budget confirmed: $30,000-$35,000. Financing preference: 48-60 months.",
    timestamp: daysAgo(1, 5),
    isAI: true,
  },
  {
    id: "msg-1-8",
    stageId: "deal-1-stage-2",
    authorId: "user-1",
    authorName: "Alex (Sales)",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    content:
      "Perfect! That budget gives us great options. Any specific features you're looking for? Safety tech, entertainment, fuel efficiency?",
    timestamp: daysAgo(1, 4),
  },
  {
    id: "msg-1-9",
    stageId: "deal-1-stage-2",
    authorId: "client-1",
    authorName: "John Smith",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    content:
      "Safety is important - I'd love adaptive cruise control and lane keeping. Also, Apple CarPlay is a must for my commute.",
    timestamp: daysAgo(1, 3),
  },
];

// Messages for Deal 2 - Negotiation stage
const deal2NegotiationMessages: Message[] = [
  {
    id: "msg-2-1",
    stageId: "deal-2-stage-5",
    authorId: "ai",
    authorName: "AI Assistant",
    content:
      "Entering negotiation phase. Sarah has test driven the Accord Sport and expressed strong interest.",
    timestamp: daysAgo(1, 6),
    isAI: true,
  },
  {
    id: "msg-2-2",
    stageId: "deal-2-stage-5",
    authorId: "user-2",
    authorName: "Maria (Sales)",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
    content:
      "Sarah, what did you think of the test drive? The Sport trim really handles well, doesn't it?",
    timestamp: daysAgo(1, 5),
  },
  {
    id: "msg-2-3",
    stageId: "deal-2-stage-5",
    authorId: "client-2",
    authorName: "Sarah Johnson",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    content:
      "I loved it! The handling is amazing, and the interior is so premium. I'm ready to talk numbers. What's the best you can do on the white one?",
    timestamp: daysAgo(1, 4),
  },
  {
    id: "msg-2-4",
    stageId: "deal-2-stage-5",
    authorId: "ai",
    authorName: "AI Assistant",
    content:
      "Customer ready to negotiate. Preferred color: White. High buying signals detected.",
    timestamp: daysAgo(1, 4),
    isAI: true,
  },
  {
    id: "msg-2-5",
    stageId: "deal-2-stage-5",
    authorId: "user-2",
    authorName: "Maria (Sales)",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
    content:
      "The Platinum White is gorgeous! MSRP is $32,490, but I can offer you our internet special at $30,995. That's over $1,500 off.",
    timestamp: daysAgo(1, 3),
  },
  {
    id: "msg-2-6",
    stageId: "deal-2-stage-5",
    authorId: "client-2",
    authorName: "Sarah Johnson",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    content:
      "That's getting closer to what I had in mind. Can you include floor mats and the first service? I saw competitors offering similar deals.",
    timestamp: daysAgo(0, 4),
  },
  {
    id: "msg-2-7",
    stageId: "deal-2-stage-5",
    authorId: "ai",
    authorName: "AI Assistant",
    content:
      "Customer requesting add-ons: floor mats + first service. Competitor comparison mentioned - handle objection.",
    timestamp: daysAgo(0, 4),
    isAI: true,
  },
];

// Messages for Deal 3 - Closed Won stage
const deal3ClosedMessages: Message[] = [
  {
    id: "msg-3-1",
    stageId: "deal-3-stage-7",
    authorId: "ai",
    authorName: "AI Assistant",
    content:
      "Deal closed! Michael Chen has completed purchase of BMW X5 2023. Total value: $62,500.",
    timestamp: daysAgo(3, 2),
    isAI: true,
  },
  {
    id: "msg-3-2",
    stageId: "deal-3-stage-7",
    authorId: "user-3",
    authorName: "David (Sales)",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    content:
      "Congratulations Michael! Your new X5 will be ready for pickup tomorrow at 10 AM. All the paperwork is complete.",
    timestamp: daysAgo(3, 1),
  },
  {
    id: "msg-3-3",
    stageId: "deal-3-stage-7",
    authorId: "client-3",
    authorName: "Michael Chen",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    content:
      "Thank you so much David! This was the smoothest car buying experience I've ever had. See you tomorrow!",
    timestamp: daysAgo(3),
  },
  {
    id: "msg-3-4",
    stageId: "deal-3-stage-7",
    authorId: "ai",
    authorName: "AI Assistant",
    content:
      "Customer satisfaction: Very High. Recommend requesting referral and Google review.",
    timestamp: daysAgo(3),
    isAI: true,
  },
];

export const mockMessages: Record<string, Message[]> = {
  "deal-1-stage-2": deal1NeedsAssessmentMessages,
  "deal-2-stage-5": deal2NegotiationMessages,
  "deal-3-stage-7": deal3ClosedMessages,
};

// Memory items for Deal 1
const deal1Memory: MemoryItem[] = [
  {
    id: "mem-1-1",
    dealId: "deal-1",
    type: "client",
    label: "Current Vehicle",
    value: "2015 Honda Civic",
    isPinned: false,
    isNew: false,
  },
  {
    id: "mem-1-2",
    dealId: "deal-1",
    type: "requirement",
    label: "Primary Use",
    value: "Daily commute (45 min each way)",
    isPinned: true,
    isNew: false,
  },
  {
    id: "mem-1-3",
    dealId: "deal-1",
    type: "budget",
    label: "Budget Range",
    value: "$30,000 - $35,000",
    isPinned: true,
    isNew: false,
  },
  {
    id: "mem-1-4",
    dealId: "deal-1",
    type: "preference",
    label: "Financing",
    value: "48-60 months preferred",
    isPinned: false,
    isNew: false,
  },
  {
    id: "mem-1-5",
    dealId: "deal-1",
    stageId: "deal-1-stage-2",
    type: "preference",
    label: "Must-Have Features",
    value: "Adaptive cruise control, lane keeping, Apple CarPlay",
    isPinned: true,
    isNew: true,
  },
  {
    id: "mem-1-6",
    dealId: "deal-1",
    stageId: "deal-1-stage-2",
    type: "requirement",
    label: "Priority",
    value: "Comfort for long commute",
    isPinned: false,
    isNew: true,
  },
];

// Memory items for Deal 2
const deal2Memory: MemoryItem[] = [
  {
    id: "mem-2-1",
    dealId: "deal-2",
    type: "client",
    label: "Decision Timeline",
    value: "Ready to buy today",
    isPinned: true,
    isNew: false,
  },
  {
    id: "mem-2-2",
    dealId: "deal-2",
    type: "budget",
    label: "Target Price",
    value: "Around $31,000",
    isPinned: true,
    isNew: false,
  },
  {
    id: "mem-2-3",
    dealId: "deal-2",
    type: "preference",
    label: "Preferred Color",
    value: "Platinum White",
    isPinned: false,
    isNew: false,
  },
  {
    id: "mem-2-4",
    dealId: "deal-2",
    type: "preference",
    label: "Trim",
    value: "Sport",
    isPinned: true,
    isNew: false,
  },
  {
    id: "mem-2-5",
    dealId: "deal-2",
    stageId: "deal-2-stage-5",
    type: "requirement",
    label: "Requested Add-ons",
    value: "Floor mats, first service included",
    isPinned: true,
    isNew: true,
  },
  {
    id: "mem-2-6",
    dealId: "deal-2",
    stageId: "deal-2-stage-5",
    type: "timeline",
    label: "Competitor Mention",
    value: "Compared other dealer offers",
    isPinned: false,
    isNew: true,
  },
];

// Memory items for Deal 3
const deal3Memory: MemoryItem[] = [
  {
    id: "mem-3-1",
    dealId: "deal-3",
    type: "budget",
    label: "Final Price",
    value: "$62,500",
    isPinned: true,
    isNew: false,
  },
  {
    id: "mem-3-2",
    dealId: "deal-3",
    type: "client",
    label: "Satisfaction Level",
    value: "Very High",
    isPinned: true,
    isNew: false,
  },
  {
    id: "mem-3-3",
    dealId: "deal-3",
    type: "preference",
    label: "Model",
    value: "BMW X5 2023",
    isPinned: false,
    isNew: false,
  },
  {
    id: "mem-3-4",
    dealId: "deal-3",
    type: "timeline",
    label: "Delivery",
    value: "Scheduled for pickup",
    isPinned: false,
    isNew: false,
  },
  {
    id: "mem-3-5",
    dealId: "deal-3",
    stageId: "deal-3-stage-7",
    type: "requirement",
    label: "Follow-up Action",
    value: "Request referral and Google review",
    isPinned: true,
    isNew: false,
  },
];

export const mockMemory: Record<string, MemoryItem[]> = {
  "deal-1": deal1Memory,
  "deal-2": deal2Memory,
  "deal-3": deal3Memory,
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
