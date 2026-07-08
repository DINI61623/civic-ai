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
        return exam.qualification === 'Diploma' || exam.qualification === '12th Pass' || exam.qualification === '10th Pass' || exam.eligibility.toLowerCase().includes('diploma');
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
      const eligibilityText = s.eligibility.toLowerCase();
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
    matchedExams = matchedExams.filter(exam => isAgeEligible(filters.age, exam.age_limit));
  }

  // 4. Filter by Category
  if (filters.category) {
    if (filters.category === 'SC' || filters.category === 'ST') {
      matchedScholarships = matchedScholarships.filter(s => {
        const text = s.eligibility.toLowerCase();
        return text.includes('sc') || text.includes('st') || text.includes('varies') || !text.includes('only');
      });
      matchedSchemes = matchedSchemes.filter(s => {
        const text = s.eligibility.toLowerCase();
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
      matchedExams = matchedExams.filter(exam => exam.title.toLowerCase().includes('engineer') || exam.title.toLowerCase().includes('je') || exam.eligibility.toLowerCase().includes('engineering') || exam.eligibility.toLowerCase().includes('diploma'));
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

export function getAIResponseText(query: string, filters: ConversationFilters, count: number): string {
  const text = query.toLowerCase();
  
  if (text.includes('b.tech') || text.includes('btech') || text.includes('engineering') || text.includes('i\'m a b.tech') || text.includes('i am a b.tech')) {
    return `### Opportunities for B.Tech & Engineering Candidates\n\nAs a B.Tech / Engineering student or graduate, you are eligible for both core technical recruitments and general administrative officer posts:\n\n• **Core Engineering Jobs (SSC JE, RRB ALP, PSUs)**: Dedicated recruitments for Civil, Mechanical, and Electrical disciplines.\n• **UPSC Civil Services (CSE)**: Engineers have a strong track record here and can choose science/engineering optionals.\n• **Prestigious Fellowships**: You are eligible for research programs like the Prime Minister Research Fellowship (PMRF).\n• **Technical Scholarships**: AICTE Pragati Scholarship provides up to ₹50,000/year to female engineering students.\n\nHere are **${count} matched opportunities** from our database:`;
  }
  
  if (text.includes('upsc after') || text.includes('upsc and engineering') || text.includes('upsc for engineer')) {
    return `### UPSC Guidance for Engineering Graduates\n\nEngineering graduates constitute a significant percentage of successful Civil Services candidates due to their structured analytical background:\n\n• **UPSC Civil Services (CSE)**: You are fully eligible. Popular optional subjects include Mathematics, Physics, or engineering options (Civil, Electrical, Mechanical).\n• **UPSC Engineering Services (ESE)**: Class I technocrat officer recruitments in public sectors.\n• **Preparation Timeline**: Notifications usually release in Feb/March, with the Prelims exam in May/June.\n\nHere are the relevant UPSC and graduate officer listings:`;
  }

  if (text.includes('diploma') || text.includes('polytechnic')) {
    return `### Technical Government Jobs after Diploma\n\nDiploma holders in engineering fields have dedicated technical career pathways in railway, central public works, and defense sectors:\n\n• **SSC Junior Engineer (JE)**: Technical postings in CPWD, MES, and CWC (for Civil, Electrical, Mechanical).\n• **RRB Assistant Loco Pilot (ALP)**: Safety category operations in Indian Railways.\n• **State PSC Sub-Engineer**: Technical positions in state irrigation, building, and power corporations.\n\nHere are **${count} verified career opportunities**:`;
  }

  if (text.includes('scholarship') || text.includes('scholarships')) {
    return `### Verified Scholarship Schemes\n\nFinancial assistance is available from central and state departments based on academic merit, household income, and candidate categories:\n\n• **National Scholarship Portal (NSP)**: Portal for all central technical, post-matric, and merit-cum-means scholarships.\n• **AICTE Pragati**: Dedicated ₹50,000 per annum support for female technical students.\n• **State ePASS Reimbursements**: Direct-benefit-transfer schemes for reserved category students.\n\nHere are **${count} active scholarship programs** matching your search:`;
  }

  if (text.includes('central') || text.includes('central government')) {
    return `### Central Government Career Tracks\n\nCentral government opportunities offer national salary scales, stable promotions, and long-term benefits across the country:\n\n• **UPSC**: Class-A administrative, technical, and police service officer roles.\n• **SSC (Staff Selection Commission)**: Group B & C postings in central ministries.\n• **RRB (Railways)**: Technical and operations roles in Indian Railways.\n\nHere are **${count} central listings**:`;
  }

  if (text.includes('degree') || text.includes('graduate') || text.includes('graduation')) {
    return `### Opportunities after Graduation / Degree\n\nCompleting a bachelor's degree in any discipline (B.A., B.Sc, B.Com, B.Tech) qualifies you for all premium officer recruitments in India:\n\n• **Civil Services (UPSC CSE, State PSCs)**: Selecting IAS, IPS, IFS, and deputy collectors.\n• **Banking Officer (IBPS PO, SBI PO)**: Officer and clerk roles in public banks.\n• **Staff Selection (SSC CGL)**: Audit officer, income tax inspector, and executive assistant roles.\n\nHere are the **${count} matched opportunities** you qualify for:`;
  }

  if (text.includes('eligible') || text.includes('eligibility')) {
    return `### Your Dynamic Eligibility Matcher\n\nI have matched your active profile criteria against our verified opportunity database:\n\n• **Qualification**: ${filters.qualification || 'Any'}\n• **Domicile Region**: ${filters.stateName || 'All India'}\n• **Reservation Category**: ${filters.category || 'General'}\n\nHere are the **${count} verified listings** you qualify for:`;
  }

  return `### AI Career Recommendations\n\nBased on your active search and filters (Qualification: **${filters.qualification || 'Graduate'}**, Region: **${filters.stateName || 'All India'}**), I have retrieved the closest relevant matches in our database:\n\nWe found **${count} verified opportunities** matching your parameters:`;
}
