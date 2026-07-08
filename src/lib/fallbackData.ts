export interface State {
  id: string;
  name: string;
}

export interface Department {
  id: string;
  name: string;
  state_id: string;
  is_central: boolean;
}

export interface Exam {
  id: string;
  title: string;
  description: string | null;
  eligibility: string;
  qualification: string;
  age_limit: string;
  state_id: string;
  department_id: string;
  start_date: string;
  last_date: string;
  official_website: string | null;
  notification_url: string | null;
  apply_link: string | null;
  salary: string | null;
  vacancies: number | null;
  category: string | null;
  selection_process: string | null;
  exam_pattern: string | null;
  syllabus_link: string | null;
  previous_papers_link: string | null;
  notification_date: string | null;
  
  // Custom fallback detailed info
  detailed_selection_process?: string;
  detailed_exam_pattern?: string;
  required_documents?: string[];
  preparation_resources?: { name: string; url: string }[];
}

export interface Scheme {
  id: string;
  title: string;
  category: string;
  description: string | null;
  benefits: string;
  eligibility: string;
  required_documents: string | null;
  state_id: string;
  department_id: string | null;
  official_website: string | null;
  apply_link: string | null;
  ministry: string | null;
  application_start_date: string | null;
  application_end_date: string | null;
}

export interface Scholarship {
  id: string;
  title: string;
  type: string; // Central / State
  description: string | null;
  eligibility: string;
  last_date: string;
  state_id: string;
  official_website: string | null;
  apply_link: string | null;
  income_limit: string | null;
  documents_required: string | null;
}

export const FALLBACK_STATES: State[] = [
  { id: "187b6a43-0abd-45b5-a2d3-506743532d80", name: "All India" },
  { id: "5ef1a38a-2139-47c7-bf43-dbe003fc714b", name: "Telangana" },
  { id: "2c87e7db-39d2-4496-a287-d9ad43d6929e", name: "Andhra Pradesh" },
  { id: "8b90948d-1327-477f-9960-4feae84720c9", name: "Uttar Pradesh" },
  { id: "f138bdf3-c9d9-4146-9f7a-d8f1d1cad9f3", name: "Maharashtra" }
];

export const FALLBACK_DEPARTMENTS: Department[] = [
  { id: "3fdc43ad-6a57-4b33-94c0-623c6c074b0a", name: "Union Public Service Commission (UPSC)", state_id: "187b6a43-0abd-45b5-a2d3-506743532d80", is_central: true },
  { id: "4e939c97-0d05-4eb6-8688-d2f371521543", name: "Staff Selection Commission (SSC)", state_id: "187b6a43-0abd-45b5-a2d3-506743532d80", is_central: true },
  { id: "9e166d47-1a66-4a4d-9b1f-10c899c5ea70", name: "Railway Recruitment Board (RRB)", state_id: "187b6a43-0abd-45b5-a2d3-506743532d80", is_central: true },
  { id: "64f58c58-13dd-471a-b762-1a12bdf29067", name: "Institute of Banking Personnel Selection (IBPS)", state_id: "187b6a43-0abd-45b5-a2d3-506743532d80", is_central: true },
  { id: "238b2d53-7157-40e1-90e1-73cf581af6fc", name: "Telangana State Public Service Commission (TSPSC)", state_id: "5ef1a38a-2139-47c7-bf43-dbe003fc714b", is_central: false },
  { id: "a669ae7e-1248-4b5d-8ae8-889b74a0b8c8", name: "Andhra Pradesh Public Service Commission (APPSC)", state_id: "2c87e7db-39d2-4496-a287-d9ad43d6929e", is_central: false }
];

export const FALLBACK_EXAMS: Exam[] = [
  {
    id: "ae5fd35b-dd1b-4c21-bf05-8b083b8a2d81",
    title: "UPSC Civil Services Examination (CSE) 2026",
    description: "The premier civil service recruitment exam for selecting IAS, IPS, IFS, and other central Class A services in India.",
    eligibility: "Any Graduate in any discipline from a recognized university.",
    qualification: "Graduate",
    age_limit: "21-32 Years",
    state_id: "187b6a43-0abd-45b5-a2d3-506743532d80",
    department_id: "3fdc43ad-6a57-4b33-94c0-623c6c074b0a",
    start_date: "2026-02-01",
    last_date: "2026-03-05",
    official_website: "https://www.upsc.gov.in",
    notification_url: "https://www.upsc.gov.in/examinations/active-exams",
    apply_link: "https://upsconline.nic.in",
    salary: "₹56,100 - ₹2,50,000 (Level 10 of 7th CPC)",
    vacancies: 1056,
    category: "Civil Services",
    selection_process: "Three Stages: 1. Civil Services (Preliminary) Exam (Objective), 2. Civil Services (Main) Exam (Written), 3. Interview / Personality Test.",
    exam_pattern: "Prelims: Paper I (General Studies) - 200 marks, Paper II (CSAT - qualifying 33%) - 200 marks. Mains: 9 descriptive papers (2 qualifying languages + 1 essay + 4 general studies + 2 optional papers) totaling 1750 marks. Personality Test: 275 marks.",
    syllabus_link: "https://www.upsc.gov.in/sites/default/files/Notification-CSM-2026-Engl.pdf",
    previous_papers_link: "https://www.upsc.gov.in/examinations/previous-question-papers",
    notification_date: "2026-02-01",
    
    // Details
    detailed_selection_process: "1. Preliminary Exam: Screening test consisting of two objective papers.\n2. Main Written Exam: 9 papers of conventional essay type.\n3. Personality Test (Interview): Evaluation of academic knowledge, social traits, and current affairs awareness.",
    detailed_exam_pattern: "• Stage 1 (Prelims): Two papers (GS I & GS II/CSAT) of 200 marks each, objective multiple choice.\n• Stage 2 (Mains): 9 written descriptive papers, total 1750 marks.\n• Stage 3 (Interview): Oral personal interview of 275 marks.",
    required_documents: ["Graduation Degree Certificate / Marksheet", "Aadhaar Card or valid Photo ID", "Category Certificate (SC/ST/OBC/EWS) if applicable", "Scanned Photograph & Signature"],
    preparation_resources: [
      { name: "Official UPSC Syllabus Guide", url: "https://www.upsc.gov.in" },
      { name: "NCERT Textbooks (Class VI to XII)", url: "https://ncert.nic.in" },
      { name: "PIB News & Press Releases", url: "https://pib.gov.in" }
    ]
  },
  {
    id: "ae5fd35a-dd1b-4c21-bf05-8b083b8a2d82",
    title: "SSC CGL 2026",
    description: "Combined Graduate Level examination conducted to recruit staff for various Group B and Group C posts in Ministries and Departments.",
    eligibility: "Bachelor's Degree in any discipline from a recognized university.",
    qualification: "Graduate",
    age_limit: "18-32 Years",
    state_id: "187b6a43-0abd-45b5-a2d3-506743532d80",
    department_id: "4e939c97-0d05-4eb6-8688-d2f371521543",
    start_date: "2026-04-10",
    last_date: "2026-05-12",
    official_website: "https://ssc.gov.in",
    notification_url: "https://ssc.gov.in/candidate-portal/notifications",
    apply_link: "https://ssc.gov.in",
    salary: "₹25,500 - ₹1,51,100 depending on post grade",
    vacancies: 8500,
    category: "General SSC",
    selection_process: "Two tiers of computer-based exams (Tier 1 and Tier 2) followed by document verification.",
    exam_pattern: "Tier 1: 100 questions of 200 marks (Intelligence, Reasoning, Quantitative Aptitude, English, GA) - 60 minutes. Tier 2: Paper-I (Mathematical Abilities, Reasoning, English, General Awareness, Computer Knowledge) - 2 hours 15 mins.",
    syllabus_link: "https://ssc.gov.in",
    previous_papers_link: "https://ssc.gov.in",
    notification_date: "2026-04-10",

    detailed_selection_process: "1. Tier I (Computer Based Examination) - Qualifying status.\n2. Tier II (Computer Based Examination) - Final merit scores.\n3. Data Entry Speed Test (DEST) & Physical/Medical Standards (for specific posts).",
    detailed_exam_pattern: "• Tier 1: Objective MCQ. 4 sections (25 Qs each, 2 marks per question, negative marking of 0.50).\n• Tier 2: Mathematical Abilities (30 Qs), Reasoning (30 Qs), English (45 Qs), General Awareness (25 Qs), Computer Knowledge (20 Qs).",
    required_documents: ["Graduation Degree / Provisional Certificate", "10th & 12th Class Marksheets", "Caste/Category Certificate if applicable", "Valid ID Proof (Aadhaar/Voter ID)"],
    preparation_resources: [
      { name: "SSC Official Sample Papers", url: "https://ssc.gov.in" },
      { name: "Quantitative Aptitude Mock Test Series", url: "https://ssc.gov.in" }
    ]
  },
  {
    id: "1a44655e-5d58-40c9-b2e5-f6a70b95aa92",
    title: "SSC CHSL 2026",
    description: "Combined Higher Secondary Level Exam to recruit Lower Divisional Clerks (LDC), Junior Secretariat Assistants (JSA), and Data Entry Operators (DEO).",
    eligibility: "Must have passed 12th Standard or equivalent exam from a recognized board.",
    qualification: "12th Pass",
    age_limit: "18-27 Years",
    state_id: "187b6a43-0abd-45b5-a2d3-506743532d80",
    department_id: "4e939c97-0d05-4eb6-8688-d2f371521543",
    start_date: "2026-06-01",
    last_date: "2026-07-01",
    official_website: "https://ssc.gov.in",
    notification_url: "https://ssc.gov.in/candidate-portal/notifications",
    apply_link: "https://ssc.gov.in",
    salary: "₹19,900 - ₹81,100 (Level 2 to Level 4)",
    vacancies: 3712,
    category: "Clerical SSC",
    selection_process: "Computer Based Examination (Tier-I & Tier-II) and Skill Test / Typing Test.",
    exam_pattern: "Tier-I: 100 objective questions for 200 marks. Tier-II: Sectional exams (Maths, Reasoning, English, General Awareness, Computer Skill) and Typing Test.",
    syllabus_link: "https://ssc.gov.in",
    previous_papers_link: "https://ssc.gov.in",
    notification_date: "2026-06-01",

    detailed_selection_process: "1. Tier-I Objective Exam.\n2. Tier-II Objective + Skill Test (Typing Test: 35 wpm in English / 30 wpm in Hindi).",
    detailed_exam_pattern: "• Tier I: General Intelligence, English Language, Quantitative Aptitude, General Awareness (25 Qs each).\n• Tier II: Paper 1 (Section I: Maths & Reasoning; Section II: English & GA; Section III: Computer module), Paper 2 (Typing/Skill Test).",
    required_documents: ["12th Class Pass Certificate / Marksheet", "10th Class Marksheet (for Date of Birth proof)", "Aadhaar Card", "Recent Color Passport Photograph"],
    preparation_resources: [
      { name: "SSC English Grammer Guide", url: "https://ssc.gov.in" },
      { name: "Typing Speed Practice Guide", url: "https://ssc.gov.in" }
    ]
  },
  {
    id: "bda6aeee-0428-4a7f-abd3-d0761bc32ae2",
    title: "RRB NTPC 2026",
    description: "Railway Recruitment Board Non-Technical Popular Categories exam for recruitment of Station Masters, Ticket Clerks, Goods Guards, and Apprentices.",
    eligibility: "12th Pass or Graduate depending on the specific post applied for.",
    qualification: "Any Qualification",
    age_limit: "18-33 Years",
    state_id: "187b6a43-0abd-45b5-a2d3-506743532d80",
    department_id: "9e166d47-1a66-4a4d-9b1f-10c899c5ea70",
    start_date: "2026-08-01",
    last_date: "2026-09-01",
    official_website: "https://www.rrcb.gov.in",
    notification_url: "https://www.rrcb.gov.in/notifications.html",
    apply_link: "https://www.rrcb.gov.in",
    salary: "₹19,900 - ₹35,400 (Initial Pay levels 2 to 6)",
    vacancies: 11558,
    category: "Railways",
    selection_process: "1st Stage Computer Based Test (CBT), 2nd Stage CBT, Typing Skill Test (if applicable), Document Verification and Medical Exam.",
    exam_pattern: "CBT 1: 100 questions (General Awareness 40, Mathematics 30, Reasoning 30) - 90 minutes. CBT 2: 120 questions (General Awareness 50, Mathematics 35, Reasoning 35) - 90 minutes.",
    syllabus_link: "https://www.rrcb.gov.in",
    previous_papers_link: "https://www.rrcb.gov.in",
    notification_date: "2026-08-01",

    detailed_selection_process: "1. CBT Stage 1 (Screening Test).\n2. CBT Stage 2 (Post-specific Difficulty).\n3. Computer Based Aptitude Test (CBAT) for Station Master or Typing Test for Clerks.\n4. Medical Fitness Test & Document Verification.",
    detailed_exam_pattern: "• CBT 1: 100 Questions, 90 Mins. Negative marking of 1/3 mark for each wrong response.\n• CBT 2: 120 Questions, 90 Mins. Negative marking of 1/3 mark.",
    required_documents: ["10th, 12th mark sheets or Graduation Certificate", "Caste Certificate for reservation claims", "Medical Standard Fitness Certificate", "Self-declaration forms"],
    preparation_resources: [
      { name: "RRB General Science Reference Book", url: "https://www.rrcb.gov.in" },
      { name: "Mathematics for RRB Exams", url: "https://www.rrcb.gov.in" }
    ]
  },
  {
    id: "ad142e05-a2e5-43c0-8843-38f7dd339cd3",
    title: "IBPS PO 2026",
    description: "Institute of Banking Personnel Selection Probationary Officer exam for recruitment in public sector banks across India.",
    eligibility: "Bachelor's Degree in any discipline from a recognized university.",
    qualification: "Graduate",
    age_limit: "20-30 Years",
    state_id: "187b6a43-0abd-45b5-a2d3-506743532d80",
    department_id: "64f58c58-13dd-471a-b762-1a12bdf29067",
    start_date: "2026-08-15",
    last_date: "2026-09-10",
    official_website: "https://www.ibps.in",
    notification_url: "https://www.ibps.in/index.php/crp-po-mt/",
    apply_link: "https://www.ibps.in",
    salary: "₹52,000 - ₹57,000 including allowances",
    vacancies: 4455,
    category: "Banking",
    selection_process: "Preliminary Exam, Main Written Exam (Objective + Descriptive), and Common Interview.",
    exam_pattern: "Prelims: English (30 Qs), Quantitative Aptitude (35 Qs), Reasoning Ability (35 Qs). Mains: Reasoning & Computer (45 Qs), General/Economy/Banking Awareness (40 Qs), English (35 Qs), Data Analysis (35 Qs) + Descriptive English (2 Qs).",
    syllabus_link: "https://www.ibps.in",
    previous_papers_link: "https://www.ibps.in",
    notification_date: "2026-08-15",

    detailed_selection_process: "1. Preliminary Exam: Qualifying round.\n2. Main Exam: Scoring round.\n3. Common Interview: Co-ordinated by nodal bank (Weightage 80:20 Main to Interview).",
    detailed_exam_pattern: "• Prelims: 100 Marks, 60 minutes (20 minutes sectional timing).\n• Mains: 200 Marks Objective (3 hours) + 25 Marks Descriptive English (30 minutes).",
    required_documents: ["Graduation Degree Certificate/Percentage Details", "Aadhaar Card / Pan Card", "Category Certificate if claiming concessions", "Passport size photograph"],
    preparation_resources: [
      { name: "IBPS Banking Awareness Guide", url: "https://www.ibps.in" },
      { name: "Quantitative Aptitude for Bank PO", url: "https://www.ibps.in" }
    ]
  },
  {
    id: "4acd9152-3275-4799-abba-409cfeea2974",
    title: "TSPSC Group 1 Examination",
    description: "The top-tier state administrative services exam for recruitment of Deputy Collectors, DSPs, CTOs, and Regional Transport Officers in Telangana.",
    eligibility: "Degree in any discipline from a recognized University.",
    qualification: "Graduate",
    age_limit: "18-44 Years",
    state_id: "5ef1a38a-2139-47c7-bf43-dbe003fc714b",
    department_id: "238b2d53-7157-40e1-90e1-73cf581af6fc",
    start_date: "2026-03-01",
    last_date: "2026-04-01",
    official_website: "https://www.tspsc.gov.in",
    notification_url: "https://www.tspsc.gov.in/notifications",
    apply_link: "https://www.tspsc.gov.in",
    salary: "₹58,850 - ₹1,37,050",
    vacancies: 563,
    category: "Civil Services",
    selection_process: "Preliminary Test (Objective Type) and Written Examination (Main) of Descriptive Type.",
    exam_pattern: "Prelims: General Studies and Mental Ability - 150 marks (2.5 hours). Mains: 6 descriptive papers + 1 qualifying English paper. Total Marks: 900.",
    syllabus_link: "https://www.tspsc.gov.in",
    previous_papers_link: "https://www.tspsc.gov.in",
    notification_date: "2026-03-01",

    detailed_selection_process: "1. Preliminary Exam: Qualifying (OMR or CBT based).\n2. Main Exam: 6 papers of descriptive type.\n3. Detailed verification of credentials (No interview phase in current rules).",
    detailed_exam_pattern: "• Prelims: GS & Mental Ability (150 MCQ questions, 150 marks).\n• Mains: General English (Qualifying), Paper 1: General Essay, Paper 2: History & Geography, Paper 3: Indian Society & Constitution, Paper 4: Telangana Economy & Development, Paper 5: Science & Technology, Paper 6: Telangana Movement & State Formation.",
    required_documents: ["Degree Convocation / Provisional Certificate", "Study/Bonafide Certificate (Class 1 to 10 for local candidate proof)", "Integrated Community Certificate (Caste)", "TSPSC One-Time Registration (OTR) ID"],
    preparation_resources: [
      { name: "Telangana History & Culture (Telugu Academy)", url: "https://www.tspsc.gov.in" },
      { name: "Telangana Economy Handbooks", url: "https://www.tspsc.gov.in" }
    ]
  },
  {
    id: "15d5a877-f3f8-4403-afdc-71240d86c8ae",
    title: "APPSC Group 2 Examination",
    description: "State civil services examination to recruit Executive posts (Municipal Commissioners, Sub-Registrars, AP Commercial Taxes) and Non-Executive posts in Andhra Pradesh.",
    eligibility: "Bachelor's Degree in any discipline from a recognized University.",
    qualification: "Graduate",
    age_limit: "18-42 Years",
    state_id: "2c87e7db-39d2-4496-a287-d9ad43d6929e",
    department_id: "a669ae7e-1248-4b5d-8ae8-889b74a0b8c8",
    start_date: "2026-05-01",
    last_date: "2026-06-01",
    official_website: "https://psc.ap.gov.in",
    notification_url: "https://psc.ap.gov.in/#/Notifications",
    apply_link: "https://psc.ap.gov.in",
    salary: "₹28,940 - ₹85,250",
    vacancies: 897,
    category: "Civil Services",
    selection_process: "Screening Test (Preliminary) - OMR and Main Written Examination - Objective (Computer Based).",
    exam_pattern: "Prelims: General Studies & Mental Ability (150 Marks). Mains: Paper-I (Social & Cultural History of AP, Indian Constitution) - 150 marks; Paper-II (Indian & AP Economy, Science & Technology) - 150 marks.",
    syllabus_link: "https://psc.ap.gov.in",
    previous_papers_link: "https://psc.ap.gov.in",
    notification_date: "2026-05-01",

    detailed_selection_process: "1. Screening Test (Prelims) - MCQ type.\n2. Main Examination - MCQ type (Two papers, 150 marks each, 300 marks total).\n3. Computer Proficiency Test (CPT) - Qualifying.",
    detailed_exam_pattern: "• Prelims: General Studies, History, Constitution, Economy, Geography, Mental Ability (150 Qs, 150 Mins).\n• Mains: Paper 1 (Social History of AP & General Constitution) - 150 Marks; Paper 2 (Indian & AP Economy, Science & Tech) - 150 Marks.",
    required_documents: ["Degree Convocation or Transcript", "Local Residence/Study Certificates (4th to 10th Class)", "Non-Creamy Layer Certificate (OBC)", "APPSC OTPR ID Registration"],
    preparation_resources: [
      { name: "AP History and Economy Reference", url: "https://psc.ap.gov.in" },
      { name: "APPSC Official Syllabus PDF", url: "https://psc.ap.gov.in" }
    ]
  },
  {
    id: "ae5fd35a-dd1b-4c21-bf05-8b083b8a2d83",
    title: "SSC Junior Engineer (JE) 2026",
    description: "Recruitment of Junior Engineers (JE) Group B Non-Gazetted in Civil, Mechanical, and Electrical branches for various ministries of Government of India.",
    eligibility: "Degree or Diploma in Civil, Electrical or Mechanical Engineering from a recognized university or board.",
    qualification: "Diploma",
    age_limit: "18-30 Years",
    state_id: "187b6a43-0abd-45b5-a2d3-506743532d80",
    department_id: "4e939c97-0d05-4eb6-8688-d2f371521543",
    start_date: "2026-03-20",
    last_date: "2026-04-18",
    official_website: "https://ssc.gov.in",
    notification_url: "https://ssc.gov.in",
    apply_link: "https://ssc.gov.in",
    salary: "₹35,400 - ₹1,12,400 (Level 6 of 7th CPC)",
    vacancies: 968,
    category: "Technical SSC",
    selection_process: "Computer Based Examination (Paper-I & Paper-II) followed by document verification.",
    exam_pattern: "Paper-I (Objective MCQ): General Intelligence (50 marks), General Awareness (50 marks), General Engineering branch specific (100 marks). Paper-II (Computer Based Exam): branch specific (300 marks).",
    syllabus_link: "https://ssc.gov.in",
    previous_papers_link: "https://ssc.gov.in",
    notification_date: "2026-03-20",
    detailed_selection_process: "1. Paper I: Computer Based Examination (Objective MCQ).\n2. Paper II: Computer Based Examination (Objective MCQ, higher difficulty).\n3. Document Verification and Departmental Allotment based on combined merit.",
    detailed_exam_pattern: "• Paper I: 200 Questions, 2 Hours. Section A (General Intelligence & Reasoning), Section B (General Awareness), Section C (General Engineering).\n• Paper II: 100 Questions, 2 Hours. Complete discipline-specific technical section.",
    required_documents: ["Engineering Degree/Diploma Certificate", "10th and 12th Marks Memo", "Caste Certificate (if applicable)", "Aadhaar Card"],
    preparation_resources: [
      { name: "SSC JE Technical Handbook", url: "https://ssc.gov.in" },
      { name: "General Engineering Sample Practice Set", url: "https://ssc.gov.in" }
    ]
  },
  {
    id: "ae5fd35a-dd1b-4c21-bf05-8b083b8a2d84",
    title: "RRB Assistant Loco Pilot (ALP) 2026",
    description: "Recruitment for selecting Assistant Loco Pilots (ALP) to drive trains across different zones of Indian Railways.",
    eligibility: "10th Pass plus ITI, or Diploma / Degree in Mechanical, Electrical, Electronics, or Automobile Engineering.",
    qualification: "Diploma",
    age_limit: "18-30 Years",
    state_id: "187b6a43-0abd-45b5-a2d3-506743532d80",
    department_id: "9e166d47-1a66-4a4d-9b1f-10c899c5ea70",
    start_date: "2026-01-20",
    last_date: "2026-02-19",
    official_website: "https://www.rrcb.gov.in",
    notification_url: "https://www.rrcb.gov.in",
    apply_link: "https://www.rrcb.gov.in",
    salary: "₹19,900 (Pay Level 2 of 7th CPC) plus allowances",
    vacancies: 5696,
    category: "Railways",
    selection_process: "CBT 1, CBT 2, Computer Based Aptitude Test (CBAT), Document Verification, and Medical Examination (A1 Standard).",
    exam_pattern: "CBT 1: 75 questions (60 mins) testing Maths, Reasoning, General Science, and GA. CBT 2: Part A (100 Qs - Maths/Reasoning/Science) and Part B (75 Qs - Trade specific qualifying 35%). CBAT: 5 battery aptitude tests.",
    syllabus_link: "https://www.rrcb.gov.in",
    previous_papers_link: "https://www.rrcb.gov.in",
    notification_date: "2026-01-20",
    detailed_selection_process: "1. CBT 1 (Screening Test).\n2. CBT 2 (Post-specific Merit List and trade evaluation).\n3. CBAT (Psychometric test for safety category).\n4. High-standard Medical Fitness Verification (A-1 visual standard).",
    detailed_exam_pattern: "• CBT 1: 75 MCQs, 60 Mins. Negative marking 1/3.\n• CBT 2: Part A (100 MCQs, 90 mins, determines merit), Part B (75 MCQs, 60 mins, technical trade subject).\n• CBAT: Focuses on memory, spatial scans, concentration and depth perception.",
    required_documents: ["Matriculation/Secondary certificate", "ITI certificate or Engineering Diploma/Degree", "Medical visual fitness form", "Caste validation certificate"],
    preparation_resources: [
      { name: "RRB ALP Trade Technical Preparation Guide", url: "https://www.rrcb.gov.in" },
      { name: "A-1 Visual Fitness Standards", url: "https://www.rrcb.gov.in" }
    ]
  }
];

export const FALLBACK_SCHEMES: Scheme[] = [
  {
    id: "4c45375c-b129-4419-82f2-c297864798db",
    title: "PM Kisan Samman Nidhi",
    category: "Farmers",
    description: "A Central Sector welfare scheme to provide income support to all landholding farmers' families in the country to enable them to take care of agricultural and domestic expenses.",
    benefits: "Direct financial benefit of ₹6,000 per year, transferred in three equal installments of ₹2,000 directly into the bank accounts of farmers.",
    eligibility: "All small and marginal landholding farmer families who have cultivable landholding in their names.",
    required_documents: "Aadhaar Card, Landholding documents (Patta/Chitta), Bank Account details (for DBT), Mobile Number linked to Aadhaar.",
    state_id: "187b6a43-0abd-45b5-a2d3-506743532d80",
    department_id: null,
    official_website: "https://pmkisan.gov.in",
    apply_link: "https://pmkisan.gov.in/RegistrationFormNew.aspx",
    ministry: "Ministry of Agriculture and Farmers Welfare",
    application_start_date: "2019-02-01",
    application_end_date: null
  },
  {
    id: "16e6c3ad-1834-49be-8d25-8ba6e9f31129",
    title: "Pradhan Mantri Awas Yojana (PMAY)",
    category: "General",
    description: "An initiative by the Government of India in which affordable housing will be provided to the urban and rural poor with a target of building 2 crore affordable houses.",
    benefits: "Interest subsidy of up to 6.5% on housing loans for a tenure of 20 years, saving around ₹2.67 Lakhs per beneficiary.",
    eligibility: "Families belonging to Economically Weaker Section (EWS) / Low Income Group (LIG) / Middle Income Group (MIG). The beneficiary family should not own a pucca house in their name anywhere in India.",
    required_documents: "Identity Proof (Voter ID/Pan/Aadhaar), Address Proof, Income Certificate, Property Valuer Certificate, Bank Passbook.",
    state_id: "187b6a43-0abd-45b5-a2d3-506743532d80",
    department_id: null,
    official_website: "https://pmaymis.gov.in",
    apply_link: "https://pmaymis.gov.in",
    ministry: "Ministry of Housing and Urban Affairs",
    application_start_date: "2015-06-01",
    application_end_date: null
  },
  {
    id: "c4c68258-d5b0-4d9d-a7f3-3d39051d27a2",
    title: "Sukanya Samriddhi Yojana (SSY)",
    category: "Women",
    description: "A small deposit scheme of the Government of India targeted at the parent of a girl child. The scheme encourages parents to build a fund for the future education and marriage expenses of their female child.",
    benefits: "High-interest savings account (currently 8.2% per annum), tax deductions under Section 80C, and tax-free maturity amount.",
    eligibility: "Parents or legal guardians can open an account in the name of a girl child from her birth till she attains the age of 10 years. Only two accounts per family are allowed.",
    required_documents: "Girl Child Birth Certificate, Address Proof of Guardian, Photo ID of Parent/Guardian, PAN of Guardian.",
    state_id: "187b6a43-0abd-45b5-a2d3-506743532d80",
    department_id: null,
    official_website: "https://www.indiapost.gov.in",
    apply_link: "https://www.indiapost.gov.in",
    ministry: "Ministry of Finance / India Post",
    application_start_date: "2015-01-22",
    application_end_date: null
  },
  {
    id: "344877e2-18cc-410e-89d1-27c0949ce701",
    title: "Telangana Rythu Bharosa Scheme",
    category: "Farmers",
    description: "Financial assistance program by the Government of Telangana to support farmers' investment for crop cultivation, replacing the older Rythu Bandhu scheme.",
    benefits: "Direct crop investment support of ₹15,000 per acre per year paid directly to landholders and registered tenant farmers in seasonal installments.",
    eligibility: "All landowning farmers and registered tenant farmers in the state of Telangana.",
    required_documents: "Pattadar Passbook, Aadhaar Card, Tenant agreement (if applicable), Bank Account details linked to Aadhaar.",
    state_id: "5ef1a38a-2139-47c7-bf43-dbe003fc714b",
    department_id: null,
    official_website: "https://telangana.gov.in",
    apply_link: "https://telangana.gov.in",
    ministry: "Department of Agriculture, Telangana",
    application_start_date: "2024-06-01",
    application_end_date: null
  },
  {
    id: "0c9aca4d-f33f-48c7-8c43-051ec8e5886a",
    title: "YSR Rythu Bharosa",
    category: "Farmers",
    description: "Welfare program designed to support farmers in Andhra Pradesh by providing financial assistance, free borewells, and zero-interest loans.",
    benefits: "Financial assistance of ₹13,500 per year (₹7,500 by State, ₹6,000 by PM-Kisan) to all eligible farmers, including tenant farmers.",
    eligibility: "Farmers owning agricultural land in Andhra Pradesh. Landless tenant farmers belonging to SC/ST/BC/Minority categories are also eligible.",
    required_documents: "Aadhaar Card, Land ownership papers (Adangal/1B) or tenant agreement, Bank details, Caste Certificate (for tenant farmers).",
    state_id: "2c87e7db-39d2-4496-a287-d9ad43d6929e",
    department_id: null,
    official_website: "https://ysrrythubharosa.ap.gov.in",
    apply_link: "https://ysrrythubharosa.ap.gov.in",
    ministry: "Department of Agriculture, Andhra Pradesh",
    application_start_date: "2019-10-15",
    application_end_date: null
  },
  {
    id: "4c45375c-b129-4419-82f2-c297864798dc",
    title: "PM Surya Ghar: Muft Bijli Yojana",
    category: "General",
    description: "A central government scheme aimed at providing free electricity to households in India by promoting solar rooftop installations.",
    benefits: "Subsidy of up to ₹78,000 for solar rooftop systems, plus up to 300 units of free electricity per month for the household.",
    eligibility: "All Indian households with a suitable rooftop space for solar panel installation and a valid electricity connection.",
    required_documents: "Electricity bill (recent), Land ownership proof/rooftop permission, Aadhaar Card, Bank account details.",
    state_id: "187b6a43-0abd-45b5-a2d3-506743532d80",
    department_id: null,
    official_website: "https://pmsuryaghar.gov.in",
    apply_link: "https://pmsuryaghar.gov.in",
    ministry: "Ministry of New and Renewable Energy",
    application_start_date: "2024-02-15",
    application_end_date: null
  },
  {
    id: "4c45375c-b129-4419-82f2-c297864798dd",
    title: "Lakhpati Didi Scheme",
    category: "Women",
    description: "A national initiative to empower women in Self-Help Groups (SHGs) to earn a sustainable income of at least ₹1 Lakh per year through technical and entrepreneurial training.",
    benefits: "Skill training in drone operation, plumbing, tailoring, LED bulb making, along with financial interest subventions and business credit linkages.",
    eligibility: "Women who are active members of registered Self-Help Groups (SHGs) in rural or urban areas.",
    required_documents: "SHG membership ID, Aadhaar Card, Bank Passbook, Residence Proof.",
    state_id: "187b6a43-0abd-45b5-a2d3-506743532d80",
    department_id: null,
    official_website: "https://lakhpatididi.gov.in",
    apply_link: "https://lakhpatididi.gov.in",
    ministry: "Ministry of Rural Development",
    application_start_date: "2023-08-15",
    application_end_date: null
  }
];

export const FALLBACK_SCHOLARSHIPS: Scholarship[] = [
  {
    id: "142540bf-15ff-485e-ba1d-29c317bf5c83",
    title: "National Scholarship Portal (NSP)",
    type: "Central",
    description: "One-stop solution through which various services starting from student application, application receipt, processing, sanction, and disbursal of various scholarships are enabled.",
    eligibility: "Varies by specific scheme (typically students from Class 1 to Ph.D. with minimum 50% marks in previous examinations and family income below set thresholds).",
    last_date: "2026-10-31",
    state_id: "187b6a43-0abd-45b5-a2d3-506743532d80",
    official_website: "https://scholarships.gov.in",
    apply_link: "https://scholarships.gov.in",
    income_limit: "Varies (typically < ₹2.5 LPA for post-matric)",
    documents_required: "Student Photograph, Category Certificate, Income Certificate, Fee receipt of current course, Bank Account linked to Aadhaar, Previous Marksheet."
  },
  {
    id: "4250e1f5-c558-4831-a136-fd0cd31971db",
    title: "TS ePASS Post Matric Scholarship",
    type: "State",
    description: "Online education scholarship portal of Telangana state offering reimbursement of tuition fees and maintenance fees for higher education.",
    eligibility: "SC, ST, BC, EBC, and Minority category students pursuing Post-Matric courses (Intermediate, Degree, PG, Professional) in Telangana with good attendance.",
    last_date: "2026-12-31",
    state_id: "5ef1a38a-2139-47c7-bf43-dbe003fc714b",
    official_website: "https://telanganaepass.cgg.gov.in",
    apply_link: "https://telanganaepass.cgg.gov.in",
    income_limit: "SC/ST family income < ₹2.0 LPA (rural) or < ₹1.5 LPA (urban). BC/EBC < ₹1.0 LPA.",
    documents_required: "SSC Hall Ticket Number, Bonafide Certificate, Income Certificate issued by Meeseva, Caste Certificate, Bank Passbook, Aadhaar Card."
  },
  {
    id: "1f9da3e7-26d3-4ca6-a995-02fb60be8146",
    title: "Jagananna Vidya Deevena",
    type: "State",
    description: "Fee reimbursement scheme implemented by the Andhra Pradesh government to enable poor students to pursue higher professional education without burdening their families.",
    eligibility: "AP students pursuing Polytechnic, ITI, Degree, Engineering, Medicine, and Post-Graduate courses in government or government-aided colleges.",
    last_date: "2026-11-30",
    state_id: "2c87e7db-39d2-4496-a287-d9ad43d6929e",
    official_website: "https://navasakam.ap.gov.in",
    apply_link: "https://navasakam.ap.gov.in",
    income_limit: "Family annual income should be less than ₹2.5 Lakhs. Landholding less than 10 acres of wet or 25 acres of dry land.",
    documents_required: "College Admission Certificate, Tuition Fee receipt, Aadhaar Card, Integrated Caste and Income Certificates, Bank Account linked to Mother's Aadhaar."
  },
  {
    id: "142540bf-15ff-485e-ba1d-29c317bf5c84",
    title: "AICTE Pragati Scholarship for Girl Students 2026",
    type: "Central",
    description: "An initiative by the Ministry of Education to support girls pursuing technical education (Degree or Diploma) in AICTE approved institutions.",
    eligibility: "Girl students admitted to 1st year of Degree/Diploma course in AICTE approved institution. Max 2 girls per family. Family income < ₹8.0 LPA.",
    last_date: "2026-11-30",
    state_id: "187b6a43-0abd-45b5-a2d3-506743532d80",
    official_website: "https://www.aicte-india.org",
    apply_link: "https://scholarships.gov.in",
    income_limit: "< ₹8.0 Lakhs Per Annum",
    documents_required: "Aadhaar Card, Annual Income Certificate, Admission Fee Receipt, Marksheet of 10th/12th, Study Certificate."
  }
];

export const FALLBACK_EDUCATION = [
  {
    id: '1',
    name: 'National Institute of Technology (NIT)',
    type: 'Government University',
    details: 'Premier engineering institutes located across India offering Undergraduate, Postgraduate, and Doctorate degrees in various engineering and technology branches.',
    state: 'All India',
    website: 'https://www.nitcouncil.org.in',
    admission_criteria: 'Admissions are made based on ranks secured in Joint Entrance Examination - Main (JEE Main) through JoSAA counseling.',
    programs: 'B.Tech, M.Tech, MCA, MBA, Ph.D.',
    facilities: 'Hostel accommodation, state-of-the-art libraries, high-performance computing centers, research laboratories, sports complexes.'
  },
  {
    id: '2',
    name: 'CUET (UG) 2026',
    type: 'Entrance Exam',
    details: 'Common University Entrance Test for admission to undergraduate programs in Central, State, Private, and Deemed Universities across India.',
    state: 'All India',
    website: 'https://cuet.samarth.ac.in',
    admission_criteria: 'Computer-based examination testing Section IA & IB (Languages), Section II (Domain Specific Subjects), Section III (General Test).',
    programs: 'Undergraduate degrees (BA, B.Sc, B.Com, BBA, BCA, etc.) in participating institutions.',
    facilities: 'Exam help centers, reservations as per government norms, online mock test platforms.'
  },
  {
    id: '3',
    name: 'Prime Minister Research Fellowship (PMRF)',
    type: 'Fellowship',
    details: 'PMRF scheme has been designed for improving the quality of research in various higher educational institutions in the country.',
    state: 'All India',
    website: 'https://pmrf.in',
    admission_criteria: 'Direct entry or Lateral entry for students who have completed or are pursuing B.Tech/M.Sc/M.Tech in IISc, IITs, NITs, IISERs, IIITs with high CGPA/GATE score.',
    programs: 'Ph.D. fellowships in science and technology fields.',
    facilities: 'Fellowship of ₹70,000 - ₹80,000 per month, research contingency grant of ₹2 Lakhs per year.'
  }
];
