import {
  benefitIcon1,
  benefitIcon2,
  benefitIcon3,
  benefitIcon4,
  benefitImage2,
  chromecast,
  disc02,
  discord,
  discordBlack,
  facebook,
  figma,
  file02,
  framer,
  homeSmile,
  instagram,
  notification2,
  notification3,
  notification4,
  notion,
  photoshop,
  plusSquare,
  protopie,
  raindrop,
  recording01,
  recording03,
  roadmap1,
  roadmap2,
  roadmap3,
  roadmap4,
  searchMd,
  slack,
  sliders04,
  telegram,
  twitter,
  yourlogo,
  boltnewLogo,
  geminiLogo,
  cursorLogo,
  n8nLogo,
  anthropicLogo,
  antigravityLogo,
  perplexityLogo,
  agentLogo,
  huggingfaceLogo,
  kaggleLogo,
  chatgptLogo,
  windsurfLogo,
} from "../assets";

export const navigation = [
  {
    id: "0",
    title: "Features",
    url: "#features",
  },
  {
    id: "1",
    title: "What You'll Learn",
    url: "#how-to-use",
  },
  {
    id: "2",
    title: "Pricing",
    url: "#pricing",
  },
  {
    id: "3",
    title: "Curriculum",
    url: "#roadmap",
  },
  {
    id: "4",
    title: "Timeline",
    url: "#timeline",
  },
  {
    id: "5",
    title: "Join the Cohort",
    url: "#pricing",
    onlyMobile: true,
  },
];

export const heroIcons = [homeSmile, file02, searchMd, plusSquare];

export const notificationImages = [notification4, notification3, notification2];

export const companyLogos = [boltnewLogo, geminiLogo, cursorLogo, n8nLogo, anthropicLogo, agentLogo, huggingfaceLogo, chatgptLogo, windsurfLogo];

export const brainwaveServices = [
  "Vibe Coding Sessions",
  "LangChain & LangGraph",
  "n8n Automation & Agentic AI",
];

export const brainwaveServicesIcons = [
  recording03,
  recording01,
  disc02,
  chromecast,
  sliders04,
];

export const roadmap = [
  {
    id: "0",
    title: "Week 1: Development & GenAI Basics",
    text: "Master Vibe Coding workflow, Frontend-Backend integration with React/Next.js, Auth & database (Supabase/Appwrite). Build: AI Chat App with Authentication.",
    date: "Week 1",
    status: "done",
    imageUrl: roadmap1,
    colorful: true,
  },
  {
    id: "1",
    title: "Week 2: LangChain & AI Systems",
    text: "Deep dive into LangChain, Vector embeddings, LangGraph workflows. Build: AI Personal Learning Assistant, AI Interviewer System, AI Code Reviewer, AI Resume & Job Matching System.",
    date: "Week 2",
    status: "progress",
    imageUrl: roadmap2,
  },
  {
    id: "2",
    title: "Week 3: Automation with n8n",
    text: "Master n8n workflow automation, webhooks & APIs, LLM-powered automation. Build: AI Email Auto-Responder, AI Lead Qualification Bot, AI Social Media Content Generator.",
    date: "Week 3",
    status: "done",
    imageUrl: roadmap3,
  },
  {
    id: "3",
    title: "Week 4: Agentic AI & Capstone",
    text: "Agentic AI architecture, goal-driven agents, tool usage & planning. Build: AI SEO Optimizer Agent, AI Trend Detector Agent, AI Landing Page Analyzer (Capstone on Kaggle).",
    date: "Week 4",
    status: "progress",
    imageUrl: roadmap4,
  },
];

export const collabText =
  "Weekend-only program with live Vibe Coding sessions. Build production-ready AI systems with LangChain, n8n, and Agentic AI on Kaggle.";

export const collabContent = [
  {
    id: "0",
    title: "Weekend Live Sessions",
    text: collabText,
  },
  {
    id: "1",
    title: "Kaggle Integration",
  },
  {
    id: "2",
    title: "10+ AI Projects",
  },
];

export const collabApps = [
  {
    id: "0",
    title: "Figma",
    icon: figma,
    width: 26,
    height: 36,
  },
  {
    id: "1",
    title: "Notion",
    icon: notion,
    width: 34,
    height: 36,
  },
  {
    id: "2",
    title: "Discord",
    icon: discord,
    width: 36,
    height: 28,
  },
  {
    id: "3",
    title: "Slack",
    icon: slack,
    width: 34,
    height: 35,
  },
  {
    id: "4",
    title: "Photoshop",
    icon: photoshop,
    width: 34,
    height: 34,
  },
  {
    id: "5",
    title: "Protopie",
    icon: protopie,
    width: 34,
    height: 34,
  },
  {
    id: "6",
    title: "Framer",
    icon: framer,
    width: 26,
    height: 34,
  },
  {
    id: "7",
    title: "Raindrop",
    icon: raindrop,
    width: 38,
    height: 32,
  },
];

export const pricing = [
  {
    id: "0",
    title: "Basic",
    description: "Essential AI Development Skills | Pay once, use forever",
    price: "799",
    originalPrice: "1000",
    studentsJoined: 55,
    features: [
      "Vibe Coding 101 - Master modern development workflow",
      "Gen AI in Web Apps - Build intelligent applications",
      "3 Industry-Accepted Projects for your portfolio",
      "React, Next.js, and FastAPI fundamentals",
      "Lifetime access to recordings and materials",
      "WhatsApp community group access",
    ],
  },
  {
    id: "1",
    title: "Premium",
    description: "Full-Stack AI Mastery | Pay once, use forever",
    price: "1199",
    originalPrice: "1500",
    studentsJoined: 36,
    features: [
      "Build 5 Full-Stack AI Projects from scratch",
      "LangChain mastery - Chains, tools & memory",
      "LangGraph - Complex AI workflows & agents",
      "Agentic AI - Goal-driven autonomous agents",
      "Vector embeddings & RAG architecture",
      "Lifetime access to recordings and materials",
      "VPS setup guidance included",
      "WhatsApp community group access",
    ],
  },
  {
    id: "2",
    title: "Plus",
    description: "Everything Included | Pay once, use forever",
    price: "1499",
    originalPrice: "1800",
    studentsJoined: 30,
    features: [
      "8 live Vibe Coding sessions (every Sat & Sun)",
      "Build 10+ AI projects: GenAI, n8n automation, Agentic AI",
      "Full stack: React, Next.js, FastAPI, Supabase, Appwrite",
      "LangChain, LangGraph, Vector DB, n8n mastery",
      "Kaggle Notebook + GitHub portfolio capstone project",
      "Lifetime access to recordings and materials",
      "VPS setup for n8n automation included",
      "WhatsApp community group access",
    ],
  },
];

export const benefits = [
  {
    id: "0",
    title: "Vibe Coding Weekends",
    text: "Live sessions every Saturday & Sunday. Code together, build AI products in real-time, and get instant feedback from instructors.",
    backgroundUrl: "./src/assets/benefits/card-1.svg",
    iconUrl: benefitIcon1,
    imageUrl: benefitImage2,
  },
  {
    id: "1",
    title: "10+ AI Projects",
    text: "Build AI Interviewer, Personal Learning Assistant, Code Reviewer, Email Auto-Responder, Lead Bot, SEO Optimizer, Trend Detector & more.",
    backgroundUrl: "./src/assets/benefits/card-2.svg",
    iconUrl: benefitIcon2,
    imageUrl: benefitImage2,
    light: true,
  },
  {
    id: "2",
    title: "Full Tech Stack",
    text: "Master React, Next.js, Node.js, FastAPI, Supabase, Appwrite, PocketBase, LangChain, LangGraph, Vector DB, and n8n automation.",
    backgroundUrl: "./src/assets/benefits/card-3.svg",
    iconUrl: benefitIcon3,
    imageUrl: benefitImage2,
  },
  {
    id: "3",
    title: "Kaggle Portfolio",
    text: "Build your capstone Agentic AI project on Kaggle. Create impressive notebooks that showcase your skills to recruiters and companies.",
    backgroundUrl: "./src/assets/benefits/card-4.svg",
    iconUrl: benefitIcon4,
    imageUrl: benefitImage2,
    light: true,
  },
  {
    id: "4",
    title: "Agentic AI Mastery",
    text: "Go beyond basic AI. Build goal-driven agents that plan, use tools, and solve complex tasks autonomously with LangGraph architecture.",
    backgroundUrl: "./src/assets/benefits/card-5.svg",
    iconUrl: benefitIcon1,
    imageUrl: benefitImage2,
  },
  {
    id: "5",
    title: "Weekend Friendly",
    text: "Perfect for working professionals. Learn on weekends, build your portfolio, and level up your AI skills without quitting your job.",
    backgroundUrl: "./src/assets/benefits/card-6.svg",
    iconUrl: benefitIcon2,
    imageUrl: benefitImage2,
  },
];

export const socials = [
  {
    id: "0",
    title: "Discord",
    iconUrl: discordBlack,
    url: "https://discord.gg/GGAnSN3E",
  },
  {
    id: "1",
    title: "Instagram",
    iconUrl: instagram,
    url: "https://www.instagram.com/letsrevamp.here/",
  },
];

export const timeline = [
  {
    id: "0",
    title: "Event Launch & Registration",
    date: "Day 1-2",
    description: "Program kickoff with orientation and community setup",
    highlights: [
      "WhatsApp community group created",
      "Welcome session and program overview",
      "Tech stack setup and environment configuration",
      "Meet your cohort and instructors",
    ],
  },
  {
    id: "1",
    title: "Week 1: Dev & GenAI",
    date: "Days 3-9",
    description: "Master full-stack development and GenAI fundamentals",
    highlights: [
      "Vibe Coding: Frontend-Backend integration",
      "Auth with Supabase/Appwrite/PocketBase",
      "GenAI basics & prompt engineering",
      "Project: AI Chat App with Authentication",
    ],
  },
  {
    id: "2",
    title: "Week 2: LangChain Systems",
    date: "Days 10-16",
    description: "Build intelligent AI systems with LangChain & LangGraph",
    highlights: [
      "LangChain chains, tools, and memory",
      "Vector embeddings & RAG architecture",
      "Projects: AI Interviewer, Learning Assistant",
      "Projects: Code Reviewer, Resume Matcher",
    ],
  },
  {
    id: "3",
    title: "Week 3: n8n Automation",
    date: "Days 17-23",
    description: "Master workflow automation with n8n and LLMs",
    highlights: [
      "n8n workflow automation & webhooks",
      "VPS setup for production deployments",
      "Projects: Email Auto-Responder, Lead Bot",
      "Project: AI Social Media Content Generator",
    ],
  },
  {
    id: "4",
    title: "Week 4: Agentic AI",
    date: "Days 24-30",
    description: "Build autonomous agents and capstone project",
    highlights: [
      "Agentic AI architecture & goal-driven agents",
      "Projects: SEO Optimizer, Trend Detector",
      "Capstone: AI Landing Page Analyzer on Kaggle",
      "Final presentations & GitHub portfolio review",
    ],
  },
];
