export type PortfolioChapter = {
  id:
    | "curiosity"
    | "design"
    | "development"
    | "cybersecurity"
    | "void"
    | "games"
    | "maggie"
    | "human"
    | "next";
  index: string;
  label: string;
  phase: 1 | 2 | 3 | 4 | 5;
};

/** The narrative spine shared by navigation and every future chapter. */
export const PORTFOLIO_CHAPTERS: PortfolioChapter[] = [
  { id: "curiosity", index: "01", label: "Curiosity", phase: 1 },
  { id: "design", index: "02", label: "Design", phase: 2 },
  { id: "development", index: "03", label: "Development", phase: 2 },
  { id: "cybersecurity", index: "04", label: "Cybersecurity", phase: 3 },
  { id: "void", index: "05", label: "VOID", phase: 3 },
  { id: "games", index: "06", label: "Games", phase: 3 },
  { id: "maggie", index: "07", label: "Maggie", phase: 4 },
  { id: "human", index: "08", label: "The human part", phase: 4 },
  { id: "next", index: "09", label: "What's next", phase: 5 },
];

export const PORTFOLIO_ROLES = [
  "Designer",
  "Developer",
  "Cybersecurity",
  "Game Developer",
  "Boxer",
] as const;

export const SECURITY_DISCIPLINES = [
  "Offensive security",
  "VAPT",
  "Application security",
  "Web application security",
  "Network security",
  "Reconnaissance",
  "Vulnerability assessment",
] as const;

export const SECURITY_TOOLS = [
  "Python",
  "Linux",
  "Burp Suite",
  "Nmap",
  "Metasploit",
  "Wireshark",
  "SQLMap",
  "ffuf",
  "Gobuster",
  "Scapy",
  "tcpdump",
  "Kali Linux",
  "TryHackMe",
  "Hack The Box",
] as const;

export const VOID_PIPELINE = [
  { index: "01", title: "Knowledge", detail: "Structured security knowledge and relationships" },
  { index: "02", title: "Meaning", detail: "Semantic chunking, metadata, and embeddings" },
  { index: "03", title: "Retrieval", detail: "Vector search and relevant context" },
  { index: "04", title: "Reasoning", detail: "LLM reasoning with session memory" },
  { index: "05", title: "Tools", detail: "Controlled security-tool integration" },
] as const;

export const GAME_PROJECTS = [
  "Obstacle Dodge",
  "Rocket Boost",
  "Galaxy Strike",
  "Royal Run",
  "Sharp Shooter",
] as const;

export const GAME_SKILL_GROUPS = [
  {
    label: "Systems",
    items: "Rigidbody physics · collisions · raycasting · player movement",
  },
  {
    label: "Intelligence",
    items: "Enemy AI · NavMesh · pathfinding · object pooling",
  },
  {
    label: "Worldbuilding",
    items: "VFX · animation · lighting · audio · level design",
  },
  {
    label: "Unity workflow",
    items: "Prefabs · scene management · coroutines · timeline · post processing",
  },
] as const;

export const MAGGIE_SERVICES = [
  "Branding",
  "Digital design",
  "Websites",
  "Applications",
  "Product experiences",
  "Creative development",
] as const;

export const MAGGIE_PROJECTS = [
  { index: "01", title: "DejureBook", variant: "dejure" },
  { index: "02", title: "Brutal", variant: "brutal" },
  { index: "03", title: "Gaura Techworks", variant: "gaura" },
  { index: "04", title: "VOID", variant: "void" },
] as const;
