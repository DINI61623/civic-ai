import { Exam, Scheme, Scholarship, State, Department } from './fallbackData';

export interface ConversationFilters {
  qualification?: '10th Pass' | '12th Pass' | 'Graduate' | 'Diploma';
  stateId?: string;
  stateName?: string;
  age?: number;
  category?: 'SC' | 'ST' | 'OBC' | 'General';
  gender?: 'female' | 'male';
  interest?: 'SSC' | 'UPSC' | 'Railway' | 'Banking' | 'Defence' | 'Engineering' | 'General Technical';
  type?: 'exam' | 'scheme' | 'scholarship' | 'education';
  rawQuery?: string;
}

export interface OpportunityMatchResult {
  exams: Exam[];
  schemes: Scheme[];
  scholarships: Scholarship[];
  education: any[];
  hasFiltersApplied: boolean;
  filtersUsed: ConversationFilters;
  isDefenceQuery: boolean;
  isEngineeringQuery: boolean;
}

// Helper to extract age from text
function parseAge(text: string): number | undefined {
  const ageMatch = text.match(/\b(1[5-9]|[2-4][0-9]|50)\b/);
  if (ageMatch) {
    return parseInt(ageMatch[0], 10);
  }
  return undefined;
}

// Helper to parse age limit strings (e.g. "18-32 Years", "21 to 32 Years")
export function isAgeEligible(age: number | undefined, ageLimitStr: string): boolean {
  if (!age) return true;
  const numbers = ageLimitStr.match(/\d+/g);
  if (!numbers || numbers.length === 0) return true;
  
  if (numbers.length === 1) {
    const limit = parseInt(numbers[0], 10);
    if (ageLimitStr.includes('under') || ageLimitStr.includes('below') || ageLimitStr.includes('<')) {
      return age < limit;
    }
    return age >= limit;
  }
  
  const min = parseInt(numbers[0], 10);
  const max = parseInt(numbers[1], 10);
  return age >= min && age <= max;
}

export function parseUserQuery(input: string, prevFilters: ConversationFilters, states: State[]): ConversationFilters {
  const text = input.toLowerCase();
  const filters: ConversationFilters = { ...prevFilters };
  filters.rawQuery = input;

  // 1. Parse Qualification
  if (text.includes('b.tech') || text.includes('btech') || text.includes('engineering') || text.includes('graduate') || text.includes('graduation') || text.includes('degree') || text.includes('b.e.') || text.includes('b.sc') || text.includes('b.com') || text.includes('b.a.') || text.includes('mtech') || text.includes('m.tech') || text.includes('postgraduate') || text.includes('phd') || text.includes('bachelors')) {
    filters.qualification = 'Graduate';
  } else if (text.includes('diploma') || text.includes('polytechnic')) {
    filters.qualification = 'Diploma';
  } else if (text.includes('12th') || text.includes('12') || text.includes('hsc') || text.includes('intermediate') || text.includes('10+2') || text.includes('second year') || text.includes('senior secondary')) {
    filters.qualification = '12th Pass';
  } else if (text.includes('10th') || text.includes('10') || text.includes('matric') || text.includes('matriculation') || text.includes('high school')) {
    filters.qualification = '10th Pass';
  }

  // 2. Parse State
  for (const state of states) {
    if (state.name.toLowerCase() === 'all india') continue;
    if (text.includes(state.name.toLowerCase())) {
      filters.stateId = state.id;
      filters.stateName = state.name;
      break;
    }
  }
  
  // State shortcodes
  if (!filters.stateId) {
    if (text.includes(' ts ') || text.includes('ts ') || text.includes(' ts') || text.includes('telangana')) {
      const ts = states.find(s => s.name.toLowerCase() === 'telangana');
      if (ts) {
        filters.stateId = ts.id;
        filters.stateName = ts.name;
      }
    } else if (text.includes(' ap ') || text.includes('ap ') || text.includes(' ap') || text.includes('andhra')) {
      const ap = states.find(s => s.name.toLowerCase() === 'andhra pradesh');
      if (ap) {
        filters.stateId = ap.id;
        filters.stateName = ap.name;
      }
    } else if (text.includes(' up ') || text.includes('up ') || text.includes(' up') || text.includes('uttar pradesh')) {
      const up = states.find(s => s.name.toLowerCase() === 'uttar pradesh');
      if (up) {
        filters.stateId = up.id;
        filters.stateName = up.name;
      }
    } else if (text.includes(' mh ') || text.includes('mh ') || text.includes(' mh') || text.includes('maharashtra')) {
      const mh = states.find(s => s.name.toLowerCase() === 'maharashtra');
      if (mh) {
        filters.stateId = mh.id;
        filters.stateName = mh.name;
      }
    }
  }

  // 3. Parse Age
  const age = parseAge(text);
  if (age !== undefined) {
    filters.age = age;
  }

  // 4. Parse Category
  if (text.includes(' sc ') || text.includes(' sc') || text.includes('sc ') || text.includes('scheduled caste')) {
    filters.category = 'SC';
  } else if (text.includes(' st ') || text.includes(' st') || text.includes('st ') || text.includes('scheduled tribe')) {
    filters.category = 'ST';
  } else if (text.includes('obc') || text.includes('other backward')) {
    filters.category = 'OBC';
  } else if (text.includes('general') || text.includes('open category') || text.includes(' unreserved ') || text.includes('ur')) {
    filters.category = 'General';
  }

  // 5. Parse Gender
  if (text.includes('girl') || text.includes('girls') || text.includes('women') || text.includes('woman') || text.includes('female') || text.includes('females') || text.includes('lady') || text.includes('ladies')) {
    filters.gender = 'female';
  } else if (text.includes('boy') || text.includes('boys') || text.includes('male') || text.includes('males') || text.includes('men') || text.includes('man')) {
    filters.gender = 'male';
  }

  // 6. Parse Interest / Department
  if (text.includes('ssc cgl') || text.includes('ssc chsl') || text.includes('ssc')) {
    filters.interest = 'SSC';
  } else if (text.includes('upsc') || text.includes('civil services') || text.includes('civil service') || text.includes('ias') || text.includes('ips')) {
    filters.interest = 'UPSC';
  } else if (text.includes('railway') || text.includes('railways') || text.includes('rrb') || text.includes('ntpc') || text.includes('alp')) {
    filters.interest = 'Railway';
  } else if (text.includes('bank') || text.includes('banking') || text.includes('ibps') || text.includes(' po ') || text.includes('clerk')) {
    filters.interest = 'Banking';
  } else if (text.includes('defence') || text.includes('defense') || text.includes('army') || text.includes('navy') || text.includes('air force') || text.includes('military') || text.includes('nda') || text.includes('cds') || text.includes('police') || text.includes('constable') || text.includes('sub inspector') || text.includes(' si ')) {
    filters.interest = 'Defence';
  } else if (text.includes('engineering') || text.includes('b.tech') || text.includes('btech') || text.includes('technical') || text.includes('technology') || text.includes('gate') || text.includes('je') || text.includes('junior engineer')) {
    filters.interest = 'Engineering';
  }

  // 7. Parse Opportunity Type
  if (text.includes('scheme') || text.includes('schemes') || text.includes('yojana') || text.includes('yojanas') || text.includes('welfare') || text.includes('farmers') || text.includes('subsidy')) {
    filters.type = 'scheme';
  } else if (text.includes('scholarship') || text.includes('scholarships') || text.includes('epass') || text.includes('financial aid') || text.includes('reimbursement')) {
    filters.type = 'scholarship';
  } else if (text.includes('exam') || text.includes('exams') || text.includes('job') || text.includes('jobs') || text.includes('notification') || text.includes('notifications') || text.includes('recruitment') || text.includes('postings')) {
    filters.type = 'exam';
  } else if (text.includes('education') || text.includes('college') || text.includes('university') || text.includes('universities') || text.includes('admission') || text.includes('admissions') || text.includes('fellowship') || text.includes('fellowships') || text.includes('phd') || text.includes('entrance')) {
    filters.type = 'education';
  }

  // Quick reset logic
  if (text.includes('clear') || text.includes('reset') || text.includes('start over') || text.includes('clean filters')) {
    return {};
  }

  return filters;
}

export function filterOpportunities(
  filters: ConversationFilters,
  data: {
    exams: Exam[];
    schemes: Scheme[];
    scholarships: Scholarship[];
    education: any[];
    states: State[];
    departments: Department[];
  }
): OpportunityMatchResult {
  let matchedExams = [...data.exams];
  let matchedSchemes = [...data.schemes];
  let matchedScholarships = [...data.scholarships];
  let matchedEducation = data.education ? [...data.education] : [];
  
  const hasFiltersApplied = Object.keys(filters).length > 0;
  const isDefenceQuery = filters.interest === 'Defence';
  const isEngineeringQuery = filters.interest === 'Engineering' || (filters.qualification === 'Graduate' && /engineering|btech|b\.tech|technical/.test(JSON.stringify(filters)));

  // 1. Filter by Qualification
  if (filters.qualification) {
    const q = filters.qualification;
    
    // Exams
    matchedExams = matchedExams.filter(exam => {
      if (exam.qualification === 'Any Qualification') return true;
      if (q === 'Graduate') return true; // Graduate can do any
      if (q === 'Diploma') {
        return exam.qualification === 'Diploma' || exam.qualification === '12th Pass' || exam.qualification === '10th Pass' || (exam.eligibility?.toLowerCase().includes('diploma') ?? false);
      }
      if (q === '12th Pass') {
        return exam.qualification === '12th Pass' || exam.qualification === '10th Pass';
      }
      if (q === '10th Pass') {
        return exam.qualification === '10th Pass';
      }
      return false;
    });

    // Scholarships
    matchedScholarships = matchedScholarships.filter(s => {
      const eligibilityText = (s.eligibility || '').toLowerCase();
      if (q === 'Graduate') return true;
      if (q === 'Diploma') return eligibilityText.includes('diploma') || eligibilityText.includes('polytechnic') || eligibilityText.includes('varies') || eligibilityText.includes('matric');
      if (q === '12th Pass') return eligibilityText.includes('12') || eligibilityText.includes('post-matric') || eligibilityText.includes('matric') || eligibilityText.includes('varies');
      if (q === '10th Pass') return eligibilityText.includes('10') || eligibilityText.includes('post-matric') || eligibilityText.includes('matric') || eligibilityText.includes('varies');
      return true;
    });

    // Education
    matchedEducation = matchedEducation.filter(item => {
      const nameText = (item.name || item.title || '').toLowerCase();
      const detailsText = (item.details || '').toLowerCase();
      if (q === 'Graduate') return true; // Higher research, fellowships, PG
      if (q === 'Diploma') return detailsText.includes('diploma') || detailsText.includes('polytechnic') || nameText.includes('nit') || nameText.includes('entrance');
      if (q === '12th Pass') return nameText.includes('cuet') || nameText.includes('jee') || nameText.includes('nit') || nameText.includes('iit') || detailsText.includes('undergraduate') || !detailsText.includes('postgraduate');
      if (q === '10th Pass') return detailsText.includes('10th') || detailsText.includes('matric') || detailsText.includes('admission');
      return true;
    });
  }

  // 2. Filter by State
  if (filters.stateId) {
    const allIndiaState = data.states.find(s => s.name.toLowerCase() === 'all india');
    const allIndiaId = allIndiaState ? allIndiaState.id : '187b6a43-0abd-45b5-a2d3-506743532d80';
    
    matchedExams = matchedExams.filter(exam => exam.state_id === allIndiaId || exam.state_id === filters.stateId);
    matchedSchemes = matchedSchemes.filter(scheme => scheme.state_id === allIndiaId || scheme.state_id === filters.stateId);
    matchedScholarships = matchedScholarships.filter(s => s.state_id === allIndiaId || s.state_id === filters.stateId);
    matchedEducation = matchedEducation.filter(item => {
      // Find state id mapping for education item
      const itemStateId = item.state_id || (item.state === 'All India' ? allIndiaId : data.states.find(s => s.name === item.state)?.id);
      return !itemStateId || itemStateId === allIndiaId || itemStateId === filters.stateId;
    });
  }

  // 3. Filter by Age
  if (filters.age !== undefined) {
    matchedExams = matchedExams.filter(exam => exam.age_limit ? isAgeEligible(filters.age, exam.age_limit) : true);
  }

  // 4. Filter by Category
  if (filters.category) {
    if (filters.category === 'SC' || filters.category === 'ST') {
      matchedScholarships = matchedScholarships.filter(s => {
        const text = (s.eligibility || '').toLowerCase();
        return text.includes('sc') || text.includes('st') || text.includes('varies') || !text.includes('only');
      });
      matchedSchemes = matchedSchemes.filter(s => {
        const text = (s.eligibility || '').toLowerCase();
        return text.includes('sc') || text.includes('st') || !text.includes('only');
      });
    }
  }

  // 5. Filter by Gender
  if (filters.gender === 'female') {
    matchedSchemes = matchedSchemes.filter(s => {
      const text = (s.eligibility || '').toLowerCase() + ' ' + (s.title || '').toLowerCase();
      if (text.includes('girl') || text.includes('women') || text.includes('female') || text.includes('sukanya') || text.includes('pragati') || text.includes('didi')) {
        return true;
      }
      return !text.includes('only male') && !text.includes('boys only');
    });
    matchedScholarships = matchedScholarships.filter(s => {
      const text = (s.eligibility || '').toLowerCase() + ' ' + (s.title || '').toLowerCase();
      if (text.includes('girl') || text.includes('women') || text.includes('female') || text.includes('pragati')) {
        return true;
      }
      return !text.includes('only male') && !text.includes('boys only');
    });
  } else if (filters.gender === 'male') {
    matchedSchemes = matchedSchemes.filter(s => {
      const text = (s.eligibility || '').toLowerCase() + ' ' + (s.title || '').toLowerCase();
      return !text.includes('girl child') && !text.includes('girl students') && !text.includes('girls only') && !text.includes('didi');
    });
    matchedScholarships = matchedScholarships.filter(s => {
      const text = (s.eligibility || '').toLowerCase() + ' ' + (s.title || '').toLowerCase();
      return !text.includes('girl students') && !text.includes('girls only') && !text.includes('pragati');
    });
  }

  // 6. Filter by Interest / Department
  if (filters.interest) {
    const interest = filters.interest.toLowerCase();
    
    if (interest === 'ssc') {
      matchedExams = matchedExams.filter(exam => exam.title.toLowerCase().includes('ssc'));
    } else if (interest === 'upsc') {
      matchedExams = matchedExams.filter(exam => exam.title.toLowerCase().includes('upsc'));
    } else if (interest === 'railway') {
      matchedExams = matchedExams.filter(exam => exam.title.toLowerCase().includes('rrb') || exam.title.toLowerCase().includes('railway') || exam.title.toLowerCase().includes('alp'));
    } else if (interest === 'banking') {
      matchedExams = matchedExams.filter(exam => exam.title.toLowerCase().includes('ibps') || exam.title.toLowerCase().includes('bank') || exam.title.toLowerCase().includes('po'));
    } else if (interest === 'defence') {
      matchedExams = []; // Trigger fallback since we don't have direct defence exams
    } else if (interest === 'engineering') {
      matchedExams = matchedExams.filter(exam => exam.title.toLowerCase().includes('engineer') || exam.title.toLowerCase().includes('je') || (exam.eligibility?.toLowerCase().includes('engineering') ?? false) || (exam.eligibility?.toLowerCase().includes('diploma') ?? false));
    }
  }

  // 7. Filter by Type
  if (filters.type) {
    if (filters.type === 'exam') {
      matchedSchemes = [];
      matchedScholarships = [];
      matchedEducation = [];
    } else if (filters.type === 'scheme') {
      matchedExams = [];
      matchedScholarships = [];
      matchedEducation = [];
    } else if (filters.type === 'scholarship') {
      matchedExams = [];
      matchedSchemes = [];
      matchedEducation = [];
    } else if (filters.type === 'education') {
      matchedExams = [];
      matchedSchemes = [];
      matchedScholarships = [];
    }
  }

  // Smart Keyword Search Filter - Boost items containing relevant terms
  // e.g. "Engineering scholarships" should only return engineering/technical scholarships!
  const textQuery = (filters.rawQuery || [filters.qualification, filters.stateName, filters.interest, filters.type].join(' ')).toLowerCase();
  const rawTerms = textQuery.split(/\s+/).filter(w => w.length > 2);
  
  // Keyword boosters
  const targetKeywords = ['engineering', 'b.tech', 'btech', 'diploma', 'polytechnic', 'scholarship', 'exam', 'scheme', 'farmer', 'women', 'girl', 'railway', 'bank', 'ssc', 'upsc', 'je', 'alp', 'surya', 'didi', 'welfare'];
  const activeKeywords = targetKeywords.filter(kw => textQuery.includes(kw) || textQuery.includes(kw));

  if (activeKeywords.length > 0) {
    const checkKeywordMatch = (item: any, fields: string[]) => {
      return activeKeywords.some(kw => {
        return fields.some(field => {
          const val = item[field];
          if (!val) return false;
          if (Array.isArray(val)) {
            return val.some(v => (v.name || v || '').toString().toLowerCase().includes(kw));
          }
          return val.toString().toLowerCase().includes(kw);
        });
      });
    };

    // If matches exist after strict keyword filtering, restrict the lists to only items matching keywords
    const filteredExamsKw = matchedExams.filter(e => checkKeywordMatch(e, ['title', 'description', 'eligibility', 'qualification', 'category']));
    if (filteredExamsKw.length > 0) matchedExams = filteredExamsKw;

    const filteredSchemesKw = matchedSchemes.filter(s => checkKeywordMatch(s, ['title', 'description', 'eligibility', 'category', 'benefits']));
    if (filteredSchemesKw.length > 0) matchedSchemes = filteredSchemesKw;

    const filteredScholarshipsKw = matchedScholarships.filter(s => checkKeywordMatch(s, ['title', 'description', 'eligibility', 'type']));
    if (filteredScholarshipsKw.length > 0) matchedScholarships = filteredScholarshipsKw;

    const filteredEduKw = matchedEducation.filter(e => checkKeywordMatch(e, ['name', 'title', 'details', 'type']));
    if (filteredEduKw.length > 0) matchedEducation = filteredEduKw;
  }

  return {
    exams: matchedExams,
    schemes: matchedSchemes,
    scholarships: matchedScholarships,
    education: matchedEducation,
    hasFiltersApplied,
    filtersUsed: filters,
    isDefenceQuery,
    isEngineeringQuery
  };
}

export function getFallbackRecommendations(
  filters: ConversationFilters,
  data: { exams: Exam[]; schemes: Scheme[]; scholarships: Scholarship[]; education: any[] }
): Exam[] {
  if (filters.interest === 'Defence') {
    return data.exams.filter(exam => exam.title.toLowerCase().includes('upsc') || exam.title.toLowerCase().includes('ssc cgl'));
  }
  
  const qual = filters.qualification || 'Graduate';
  return data.exams.filter(exam => {
    if (exam.qualification === 'Any Qualification') return true;
    if (qual === 'Graduate') return true;
    if (qual === 'Diploma' && exam.qualification !== 'Graduate') return true;
    if (qual === '12th Pass' && (exam.qualification === '12th Pass' || exam.qualification === '10th Pass')) return true;
    if (qual === '10th Pass' && exam.qualification === '10th Pass') return true;
    return false;
  }).slice(0, 2);
}

export type Intent = 'greeting' | 'small_talk' | 'exams' | 'schemes' | 'scholarships' | 'education' | 'eligibility' | 'unknown';

export function classifyIntent(query: string): Intent {
  const text = query.trim().toLowerCase();
  if (!text) return 'greeting';

  // 1. Standalone or clear Greetings
  const greetings = [
    'hi', 'hello', 'hey', 'good morning', 'good evening', 'good afternoon', 
    'namaste', 'greetings', 'yo', 'hi there', 'hello there', 'start over', 'clear', 'reset'
  ];
  
  // Topic keywords to avoid classifying message as greeting if user says "Hi, show me exams"
  const targetKeywords = [
    'exam', 'scheme', 'scholarship', 'education', 'yojana', 'job', 'recruit', 
    'eligibility', 'eligible', 'qualify', 'qualification', 'apply', 'admission',
    'upsc', 'ssc', 'banking', 'railway', 'defence', 'btech', 'diploma'
  ];
  
  const hasTopicKeyword = targetKeywords.some(kw => text.includes(kw));
  
  if (greetings.includes(text) || (greetings.some(g => text.startsWith(g)) && !hasTopicKeyword)) {
    return 'greeting';
  }

  // 2. Small Talk
  const howAreYou = ['how are you', 'how is it going', 'how do you do', 'are you fine', 'how are u', "how's it going"];
  const whoAreYou = ['who are you', 'what is your name', 'who created you', 'what do you do', 'what is this site', 'about you'];
  const thanks = ['thank you', 'thanks', 'thank u', 'appreciate it', 'great help', 'awesome help', 'thanks a lot'];
  const bye = ['bye', 'goodbye', 'see you', 'see u', 'quit', 'exit'];
  const quickAck = ['cool', 'awesome', 'nice', 'ok', 'okay', 'sure', 'yes', 'no'];
  
  if (howAreYou.some(phrase => text.includes(phrase))) return 'small_talk';
  if (whoAreYou.some(phrase => text.includes(phrase))) return 'small_talk';
  if (thanks.some(phrase => text.includes(phrase))) return 'small_talk';
  if (bye.some(phrase => text.includes(phrase))) return 'small_talk';
  if (quickAck.includes(text)) return 'small_talk';

  // 3. Category Specific Intents (only trigger if it has the keyword and is NOT an eligibility analysis)
  const isEligibilityQuery = text.includes('eligible') || text.includes('eligibility') || text.includes('qualify') || text.includes('qualification') || text.includes('what can i') || text.includes('after btech') || text.includes('after graduation') || text.includes('after 12th') || text.includes('after 10th') || text.includes('after diploma') || text.includes('my age is') || text.includes('i am 22') || text.includes('years old');
  
  if (!isEligibilityQuery) {
    if (text.includes('scholarship') || text.includes('scholarships') || text.includes('financial aid') || text.includes('financial assistance') || text.includes('epass') || text.includes('reimbursement') || text.includes('grant') || text.includes('grants')) {
      return 'scholarships';
    }
    if (text.includes('scheme') || text.includes('schemes') || text.includes('yojana') || text.includes('yojanas') || text.includes('welfare') || text.includes('subsidy') || text.includes('subsidies') || text.includes('farmers')) {
      return 'schemes';
    }
    if (text.includes('exam') || text.includes('exams') || text.includes('job') || text.includes('jobs') || text.includes('notification') || text.includes('notifications') || text.includes('recruitment') || text.includes('upsc') || text.includes('ssc') || text.includes('banking') || text.includes('railway') || text.includes('defence') || text.includes('postings')) {
      return 'exams';
    }
    if (text.includes('education') || text.includes('college') || text.includes('university') || text.includes('universities') || text.includes('admission') || text.includes('admissions') || text.includes('fellowship') || text.includes('fellowships') || text.includes('entrance')) {
      return 'education';
    }
  }

  // 4. Eligibility queries
  if (isEligibilityQuery) {
    return 'eligibility';
  }

  // 5. Check if it contains general domain concepts. If not, it is unknown/off-topic.
  const domainConcepts = [
    'student', 'candidate', 'profile', 'state', 'age', 'category', 'general', 'sc', 'st', 'obc', 'female', 'male', 'stream', 'course',
    'government', 'gov', 'govt', 'civil', 'post', 'vacancy', 'apply', 'portal', 'website', 'preparation', 'syllabus', 'dates', 'deadline',
    'btech', 'graduate', 'degree', 'diploma', 'matric', '10th', '12th', 'science', 'arts', 'commerce', 'engineering'
  ];
  
  const hasDomainConcept = domainConcepts.some(concept => text.includes(concept)) || hasTopicKeyword;
  if (!hasDomainConcept) {
    return 'unknown';
  }

  return 'eligibility'; // Default to eligibility mapping
}

export function getAIResponseText(
  query: string, 
  filters: ConversationFilters, 
  count: number,
  opportunities?: {
    exams: Exam[];
    schemes: Scheme[];
    scholarships: Scholarship[];
    education: any[];
  },
  intent: Intent = 'eligibility'
): string {
  const text = query.toLowerCase();

  // Helper to format dates
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Always Open / Ongoing';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // 1. Handle GREETING Intent
  if (intent === 'greeting') {
    return `### Welcome to CivicAI! 👋\n\nI am your **AI Government Career Advisor**. I specialize in matching you with official Indian government opportunities based on your personal eligibility criteria.\n\nTo find matching options, just tell me:\n• Your **highest qualification** (e.g. 10th Pass, 12th Pass, Graduate, Diploma)\n• Your **domicile state** (e.g. Telangana, Andhra Pradesh, Uttar Pradesh)\n• Any specific fields or interests (e.g. Banking, UPSC, SSC, Scholarships)\n\n*How can I guide your career path today?*`;
  }

  // 2. Handle SMALL TALK Intent
  if (intent === 'small_talk') {
    const isThanks = text.includes('thank') || text.includes('thanks');
    const isHowAreYou = text.includes('how are you') || text.includes('how is it') || text.includes('how do you');
    const isWhoAreYou = text.includes('who are you') || text.includes('what is your name') || text.includes('who created') || text.includes('what do you');
    const isBye = text.includes('bye') || text.includes('goodbye') || text.includes('see you');

    if (isThanks) {
      return `You are very welcome! I'm glad I could help you navigate your opportunities. Let me know if you want to explore more exams, scholarships, or schemes!`;
    }
    if (isHowAreYou) {
      return `I'm doing great, thank you for asking! I am ready to help you find your next career opportunity. How can I assist you today?`;
    }
    if (isWhoAreYou) {
      return `I am **CivicAI**, your AI-powered citizen assistant. My goal is to help you discover verified government exams, student scholarships, welfare schemes, and higher education paths that match your age, domicile state, and academic background.`;
    }
    if (isBye) {
      return `Goodbye! I wish you the best of luck with your career and exam preparations. Feel free to come back whenever you need to match with new opportunities!`;
    }
    return `I am here to help you search for citizen yojanas, competitive exams, and student support. How can I help you progress today?`;
  }

  // 3. Handle UNKNOWN Intent (Off-topic filtering)
  if (intent === 'unknown') {
    return `### I specialize in Indian Citizen Opportunities 🇮🇳\n\nI apologize, but I am focused exclusively on helping you discover and qualify for:\n• **Government Exams** (recruitment notifications, age limits, syllabus)\n• **Scholarships** (financial assistance, post-matric support)\n• **Government Schemes** (welfare benefits, yojanas, direct benefit transfers)\n• **Higher Education** (university entrances, fellowships, PG programs)\n\nCould you please ask a question related to these topics? For example: *'What government jobs can I get after a Diploma?'* or *'Are there schemes for girls?'*`;
  }

  // 4. Honest fallback explainer if no matches found
  if (count === 0 || !opportunities || (
    opportunities.exams.length === 0 &&
    opportunities.schemes.length === 0 &&
    opportunities.scholarships.length === 0 &&
    opportunities.education.length === 0
  )) {
    let fallbackText = `### No Exact Match Found in Database\n\nI searched our database for opportunities matching your criteria (Qualification: **${filters.qualification || 'Any'}**, Region: **${filters.stateName || 'All India'}**, Age: **${filters.age || 'Any'}**), but **no exact matches were found**.\n\nRather than show you unverified information, I want to explain honestly: we currently do not have an exact matching entry. \n\nHowever, here is the closest verified recommendation you qualify for:\n\n`;

    const fallbackList = opportunities?.exams && opportunities.exams.length > 0 ? opportunities.exams : [];
    if (fallbackList.length > 0) {
      const topFallback = fallbackList[0];
      fallbackText += `#### Recommended: **${topFallback.title}**\n\n`;
      fallbackText += `• **Summary**: ${topFallback.description || 'A premium government recruitment examination.'}\n`;
      fallbackText += `• **Eligibility**: ${topFallback.eligibility} (Age limit: ${topFallback.age_limit})\n`;
      fallbackText += `• **Important Dates**: Last date to apply is **${formatDate(topFallback.last_date)}**\n`;
      fallbackText += `• **Official Website**: [${topFallback.official_website || 'Official Site'}](${topFallback.official_website})\n`;
      fallbackText += `• **Useful Suggestions**: Since this has general graduate eligibility, preparing for its syllabus will build a strong foundation for multiple other state and central exams.`;
    } else {
      fallbackText += `• **Useful Suggestions**: Try searching for a broader term, or clear your profile filters to browse all options.`;
    }
    return fallbackText;
  }

  // Find the top matched item to display dynamic detailed summary
  let topItem: any = null;
  let itemType: 'exam' | 'scheme' | 'scholarship' | 'education' = 'exam';

  if (opportunities.exams && opportunities.exams.length > 0) {
    topItem = opportunities.exams[0];
    itemType = 'exam';
  } else if (opportunities.schemes && opportunities.schemes.length > 0) {
    topItem = opportunities.schemes[0];
    itemType = 'scheme';
  } else if (opportunities.scholarships && opportunities.scholarships.length > 0) {
    topItem = opportunities.scholarships[0];
    itemType = 'scholarship';
  } else if (opportunities.education && opportunities.education.length > 0) {
    topItem = opportunities.education[0];
    itemType = 'education';
  }

  // Pre-generate response headers for core keyword requests
  let header = '';
  if (intent === 'exams') {
    header = `### Government Exams matching your profile\n\nI filtered our database for government recruitment notifications matching your profile (Qualification: **${filters.qualification || 'Any'}**, State: **${filters.stateName || 'All India'}**). We found **${count} matching exams**.\n\n`;
  } else if (intent === 'schemes') {
    header = `### Government Schemes & Welfare Yojanas\n\nI retrieved welfare schemes and yojanas you qualify for based on your domicile and category. We found **${count} matched schemes**.\n\n`;
  } else if (intent === 'scholarships') {
    header = `### Student Scholarship Programs\n\nHere are scholarships and student financial aids matching your qualification level. We found **${count} matched scholarships**.\n\n`;
  } else if (intent === 'education') {
    header = `### Higher Education & Fellowship Entries\n\nHere are higher education options, entrance tests, and fellowships matching your background. We found **${count} matched programs**.\n\n`;
  } else if (text.includes('b.tech') || text.includes('btech') || text.includes('engineering')) {
    header = `### Opportunities for B.Tech & Engineering Candidates\n\nAs an engineering student or graduate, you qualify for both core technical posts and general administrative civil services. We found **${count} matched opportunities**.\n\n`;
  } else if (text.includes('diploma') || text.includes('polytechnic')) {
    header = `### Technical Government Jobs after Diploma\n\nDiploma holders have dedicated technical pathways in railways, central works, and defense. We found **${count} matching opportunities**.\n\n`;
  } else if (text.includes('degree') || text.includes('graduate') || text.includes('graduation')) {
    header = `### Opportunities after Graduation / Degree\n\nCompleting a degree in any field qualifies you for premium officer recruitments in civil services, banking, and staff commissions. We found **${count} matches**.\n\n`;
  } else {
    header = `### AI Career Recommendations\n\nBased on your active search and filters (Qualification: **${filters.qualification || 'Graduate'}**, Region: **${filters.stateName || 'All India'}**), I retrieved **${count} verified opportunities** from our database.\n\n`;
  }

  // Add the dynamic detailed summary for the top matching item
  if (topItem) {
    header += `Here is a summary of the top matching option (**${topItem.title || topItem.name}**):\n\n`;
    
    if (itemType === 'exam') {
      header += `• **Summary**: ${topItem.description || 'Verified government career recruitment notification.'}\n`;
      header += `• **Eligibility**: ${topItem.eligibility} (Age limit: ${topItem.age_limit})\n`;
      header += `• **Important Dates**: Application timeline: **${formatDate(topItem.start_date)}** to **${formatDate(topItem.last_date)}**\n`;
      header += `• **Official Website**: [${topItem.official_website || 'Official Portal'}](${topItem.official_website})\n`;
      header += `• **Useful Suggestions**: Download the official notification syllabus. Solve at least 5 years of previous papers, and verify your reservation details early.`;
    } else if (itemType === 'scheme') {
      header += `• **Summary**: ${topItem.description || 'Verified citizen welfare scheme.'}\n`;
      header += `• **Eligibility**: ${topItem.eligibility} (Benefits: ${topItem.benefits})\n`;
      header += `• **Important Dates**: Direct Benefit Transfer (DBT) registrations are currently open.\n`;
      header += `• **Official Website**: [${topItem.official_website || 'Official Scheme Website'}](${topItem.official_website})\n`;
      header += `• **Useful Suggestions**: Keep your Aadhaar linked to your bank account and mobile number, and prepare required land or category documents for hassle-free processing.`;
    } else if (itemType === 'scholarship') {
      header += `• **Summary**: ${topItem.description || 'Verified student scholarship program.'}\n`;
      header += `• **Eligibility**: ${topItem.eligibility} (Income limit: ${topItem.income_limit || 'Varies'})\n`;
      header += `• **Important Dates**: Deadline for application is **${formatDate(topItem.last_date)}**\n`;
      header += `• **Official Website**: [${topItem.official_website || 'Scholarship Portal'}](${topItem.official_website})\n`;
      header += `• **Useful Suggestions**: Apply early on the official portal. Make sure your previous year marks sheets are uploaded and verify your course fee receipt details.`;
    } else if (itemType === 'education') {
      header += `• **Summary**: ${topItem.details || 'Verified higher education program/university entry.'}\n`;
      header += `• **Eligibility**: ${topItem.admission_criteria || 'Admission requirements vary by qualification.'}\n`;
      header += `• **Important Dates**: Timelines are updated on the portal regularly.\n`;
      header += `• **Official Website**: [${topItem.website || 'University/Portal Web'}](${topItem.website})\n`;
      header += `• **Useful Suggestions**: Check previous years' cutoff scores or GATE/JEE rank requirements, and review course program details.`;
    }
  }

  return header;
}
