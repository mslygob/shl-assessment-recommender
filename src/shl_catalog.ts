export interface SHLAssessment {
  name: string;
  url: string;
  test_type: "K" | "P" | "C" | "B";
  description: string;
  category: string;
  details: string;
  roles: string[];
  skills: string[];
}

export const shl_catalog: SHLAssessment[] = [
  {
    name: "OPQ32r",
    url: "https://www.shl.com/solutions/products/product-catalog/opq32r",
    test_type: "P",
    category: "Personality",
    description: "The Occupational Personality Questionnaire, assessing preferred work styles, behaviors, and relationships to predict job performance.",
    details: "Our flagship personality test. It measures 32 specific work-relevant personality traits grouped into Relationships with People, Thinking Styles, and Feelings/Emotions. Ideal for leadership, culture-fit, stakeholder management, and team collaboration.",
    roles: ["Manager", "Leader", "Consultant", "Account Manager", "Sales Representative", "HR Professional", "Project Manager"],
    skills: ["leadership", "stakeholder management", "teamwork", "empathy", "influence", "resilience", "decision-making", "communication"]
  },
  {
    name: "OPQ32i",
    url: "https://www.shl.com/solutions/products/product-catalog/opq32i",
    test_type: "P",
    category: "Personality",
    description: "The ipsative version of the Occupational Personality Questionnaire, using forced-choice questions to prevent faking and bias.",
    details: "Provides a deep, unbiased assessment of a candidate's natural behavioral preferences in high-stakes hiring scenarios, ensuring highly reliable work style profiles.",
    roles: ["Executive", "Senior Leader", "Financial Analyst", "Operations Director", "Risk Officer"],
    skills: ["integrity", "strategic thinking", "analytical mindset", "work ethic", "collaboration", "emotional stability"]
  },
  {
    name: "Java 8 (New)",
    url: "https://www.shl.com/solutions/products/product-catalog/java-8-new",
    test_type: "K",
    category: "Knowledge & Skills",
    description: "Evaluates proficiency in core Java 8 features, object-oriented concepts, streams, lambdas, and modern runtime execution.",
    details: "Measures practical backend engineering skills, multi-threading, memory management, exception handling, and standard libraries. Highly relevant for backend software engineers.",
    roles: ["Java Developer", "Backend Engineer", "Software Architect", "Full Stack Developer"],
    skills: ["java", "oop", "multithreading", "backend development", "streams", "lambdas", "software engineering"]
  },
  {
    name: "Python (New)",
    url: "https://www.shl.com/solutions/products/product-catalog/python-new",
    test_type: "K",
    category: "Knowledge & Skills",
    description: "Assesses Python programming mastery, from core syntax and data structures to object-oriented programming and libraries.",
    details: "Evaluates standard coding practices, scripting capability, list comprehensions, generators, error handling, and performance. Excellent for software, data, or ML roles.",
    roles: ["Python Developer", "Data Scientist", "Machine Learning Engineer", "DevOps Engineer", "Backend Developer"],
    skills: ["python", "scripting", "data structures", "algorithms", "data science", "backend development"]
  },
  {
    name: "C++ (New)",
    url: "https://www.shl.com/solutions/products/product-catalog/cpp-new",
    test_type: "K",
    category: "Knowledge & Skills",
    description: "Measures technical skills in C++ programming, emphasizing memory allocation, pointer operations, templates, and speed-optimized design.",
    details: "Covers standard templates library (STL), resource management, smart pointers, performance optimization, and hardware-near programming paradigms.",
    roles: ["C++ Engineer", "Systems Programmer", "Game Developer", "Embedded Engineer"],
    skills: ["c++", "memory management", "systems programming", "object oriented programming", "performance optimization"]
  },
  {
    name: "SQL (New)",
    url: "https://www.shl.com/solutions/products/product-catalog/sql-new",
    test_type: "K",
    category: "Knowledge & Skills",
    description: "Tests a candidate's ability to construct database queries, manipulate datasets, perform joins, and optimize schema performance.",
    details: "Measures proficiency in standard ANSI SQL syntax, subqueries, aggregations, database triggers, transactions, and index management.",
    roles: ["Database Administrator", "Data Analyst", "SQL Developer", "Business Intelligence Analyst", "Backend Developer"],
    skills: ["sql", "databases", "joins", "data querying", "query optimization", "data analysis"]
  },
  {
    name: "React (New)",
    url: "https://www.shl.com/solutions/products/product-catalog/react-new",
    test_type: "K",
    category: "Knowledge & Skills",
    description: "Assesses the candidate's capability in building interactive, high-performance web applications using the React library.",
    details: "Measures deep understanding of hooks, component lifecycle, virtual DOM, state management, props, context, routing, and modern JSX patterns.",
    roles: ["Frontend Developer", "React Engineer", "UI Developer", "Full Stack Engineer"],
    skills: ["react", "javascript", "frontend development", "state management", "hooks", "css", "html"]
  },
  {
    name: "JavaScript (New)",
    url: "https://www.shl.com/solutions/products/product-catalog/javascript-new",
    test_type: "K",
    category: "Knowledge & Skills",
    description: "Assesses core JavaScript concepts including asynchronous calls, closures, DOM manipulation, promises, and JSON parsing.",
    details: "Measures proficiency in ES6+ syntax, prototype chains, scope management, arrow functions, and generic client/server JavaScript execution.",
    roles: ["Frontend Developer", "Full Stack Developer", "Node.js Developer", "Web Programmer"],
    skills: ["javascript", "es6", "asynchronous programming", "frontend development", "node.js"]
  },
  {
    name: "Verify Interactive - General Ability Assessment",
    url: "https://www.shl.com/solutions/products/product-catalog/verify-interactive-general-ability-assessment",
    test_type: "C",
    category: "Cognitive Ability",
    description: "A fast, interactive, and mobile-enabled cognitive test measuring numerical, deductive, and inductive reasoning on unified tasks.",
    details: "Highly engaging, gamified assessment that measures general mental and problem-solving capability by asking candidates to perform interactive reasoning tasks. Excellent for screeners.",
    roles: ["Graduate Trainee", "Analyst", "Associate", "Administrative Staff", "Junior Engineer"],
    skills: ["problem solving", "cognitive ability", "numerical reasoning", "deductive logic", "inductive patterns", "quick thinking"]
  },
  {
    name: "Verify - GSA",
    url: "https://www.shl.com/solutions/products/product-catalog/verify-gsa",
    test_type: "C",
    category: "Cognitive Ability",
    description: "SHL's standard General Ability Assessment measuring core numerical, verbal, and abstract logic reasoning skills.",
    details: "Measures general intelligence, learning agility, and complex data-interpretation capability. Widely utilized for highly analytical and corporate environments.",
    roles: ["Management Consultant", "Business Analyst", "Strategy Manager", "Operations Lead", "Corporate Planner"],
    skills: ["general ability", "data interpretation", "logic", "learning agility", "analytical reasoning"]
  },
  {
    name: "Verify - Numerical Reasoning",
    url: "https://www.shl.com/solutions/products/product-catalog/verify-numerical-reasoning",
    test_type: "C",
    category: "Cognitive Ability",
    description: "Measures the ability to interpret complex financial data, graphs, and financial reports, drawing logical quantitative conclusions.",
    details: "Assesses commercial awareness, analytical computation, trend analysis, and ratio analysis. This is critical for roles requiring constant quantitative evaluation.",
    roles: ["Financial Analyst", "Accountant", "Actuary", "Data Analyst", "Investment Banker", "Budget Manager"],
    skills: ["numerical reasoning", "math", "financial analysis", "data interpretation", "quantitative thinking", "charts"]
  },
  {
    name: "Verify - Verbal Reasoning",
    url: "https://www.shl.com/solutions/products/product-catalog/verify-verbal-reasoning",
    test_type: "C",
    category: "Cognitive Ability",
    description: "Evaluates logical text comprehension, checking how well candidates identify facts, assumptions, and inferences from written articles.",
    details: "Focuses on text analysis, objective evaluation, business communication comprehension, and factual reasoning without drawing unstated conclusions.",
    roles: ["Policy Officer", "Lawyer", "HR Specialist", "Communications Lead", "Marketing Executive", "Editor"],
    skills: ["verbal reasoning", "reading comprehension", "critical thinking", "text analysis", "objectivity", "communication"]
  },
  {
    name: "Verify - Deductive Reasoning",
    url: "https://www.shl.com/solutions/products/product-catalog/verify-deductive-reasoning",
    test_type: "C",
    category: "Cognitive Ability",
    description: "Assesses the ability to solve logic puzzles, sequence variables, identify system dependencies, and draw logical proofs.",
    details: "Focuses on sequential problem solving, systematic troubleshooting, algorithm mapping, and deduction from a set of rules or premises.",
    roles: ["Software Developer", "QA Engineer", "Systems Architect", "Logistics Coordinator", "Network Engineer"],
    skills: ["deductive logic", "problem solving", "troubleshooting", "algorithms", "rule based reasoning"]
  },
  {
    name: "Verify - Inductive Reasoning",
    url: "https://www.shl.com/solutions/products/product-catalog/verify-inductive-reasoning",
    test_type: "C",
    category: "Cognitive Ability",
    description: "Measures the capacity to identify abstract geometric patterns, find rules among complex objects, and predict future states.",
    details: "Often referred to as abstract or diagrammatic reasoning, this test evaluates non-verbal conceptual agility and dynamic problem-solving capacity.",
    roles: ["Product Manager", "Researcher", "Creative Designer", "R&D Scientist", "Data Modeler"],
    skills: ["inductive reasoning", "pattern recognition", "abstract logic", "conceptual thinking", "creativity"]
  },
  {
    name: "Situational Judgment Test",
    url: "https://www.shl.com/solutions/products/product-catalog/situational-judgment-test",
    test_type: "B",
    category: "Behavioral & Situational",
    description: "Presents candidates with real-life operational and professional challenges to evaluate judgment and decision-making styles.",
    details: "Provides realistic previews of workplace dilemmas. Candidates evaluate actions to solve a problem, indicating their default responses. Perfect for customer, team, and managerial readiness.",
    roles: ["Customer Service Agent", "Team Leader", "Account Manager", "Operations Supervisor", "Consultant"],
    skills: ["situational judgment", "conflict resolution", "decision making", "professional ethics", "customer focus", "teamwork"]
  },
  {
    name: "Contact Center Simulation",
    url: "https://www.shl.com/solutions/products/product-catalog/contact-center-simulation",
    test_type: "B",
    category: "Behavioral & Situational",
    description: "An immersive, interactive customer support simulator checking listening, data entry, empathy, and multi-tasking skills.",
    details: "Puts candidates in a realistic virtual desktop environment mimicking real support tools, chat channels, and audio streams to assess real-time call handling quality.",
    roles: ["Call Center Agent", "Customer Support Specialist", "Helpdesk Technical Agent", "Helpdesk Representative"],
    skills: ["listening", "empathy", "multitasking", "customer support", "data entry", "patience", "problem solving"]
  },
  {
    name: "Customer Service Work Styles",
    url: "https://www.shl.com/solutions/products/product-catalog/customer-service-work-styles",
    test_type: "B",
    category: "Behavioral & Situational",
    description: "Behavioral questionnaire specifically calibrated to predict customer satisfaction, support quality, and service excellence.",
    details: "Focuses on patience, helpfulness, conflict handling, dependability, and supportive behaviors crucial in high-volume, client-facing service positions.",
    roles: ["Retail Associate", "Front Desk Representative", "Customer Success Specialist", "Technical Support Representative"],
    skills: ["customer service", "patience", "adaptability", "empathy", "supportiveness", "cooperation"]
  },
  {
    name: "Sales Work Styles",
    url: "https://www.shl.com/solutions/products/product-catalog/sales-work-styles",
    test_type: "B",
    category: "Behavioral & Situational",
    description: "Assesses behavioral attributes and habits that directly correlate with sales success, persistence, and revenue target acquisition.",
    details: "Measures commercial assertiveness, goal orientation, motivation, deal closure, persistence, competitive drive, and relationship nurturing.",
    roles: ["Account Executive", "Business Development Representative", "Sales Executive", "Real Estate Agent"],
    skills: ["sales ability", "negotiation", "persistence", "goal drive", "relationship building", "assertiveness"]
  },
  {
    name: "Mechanical Comprehension Test",
    url: "https://www.shl.com/solutions/products/product-catalog/mechanical-comprehension-test",
    test_type: "C",
    category: "Cognitive Ability",
    description: "Measures understanding of physical, mechanical, and spatial concepts to evaluate engineering and technical aptitudes.",
    details: "Tests comprehension of gears, pulleys, electrical circuits, fluid flow, and basic levers. Ideal for plant operations, technicians, and engineering apprentices.",
    roles: ["Mechanical Technician", "Production Operative", "Engineer Apprentice", "Field Service Engineer"],
    skills: ["mechanical reasoning", "physics", "spatial awareness", "technical understanding", "safety focus"]
  },
  {
    name: "MS Excel 365 Simulation",
    url: "https://www.shl.com/solutions/products/product-catalog/ms-excel-365-simulation",
    test_type: "K",
    category: "Knowledge & Skills",
    description: "Evaluates direct capability in using Microsoft Excel 365 through high-fidelity, interactive simulation tasks.",
    details: "Tests skills in cell formatting, formula application (e.g., VLOOKUP, SUMIFS), pivot tables, data sorting, charts, and macro creation. Essential for office administration and operations.",
    roles: ["Office Administrator", "Administrative Assistant", "Executive Assistant", "Financial Clerk", "Operations Specialist"],
    skills: ["excel", "data entry", "data organization", "formulas", "pivot tables", "office productivity"]
  }
];
