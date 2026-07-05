import { Exam, Scheme, Scholarship, State, Department } from './fallbackData';

export interface ConversationFilters {
  qualification?: '10th Pass' | '12th Pass' | 'Graduate' | 'Diploma';
  stateId?: string;
  stateName?: string;
  age?: number;
  category?: 'SC' | 'ST' | 'OBC' | 'General';
  gender?: 'female' | 'male';
  interest?: 'SSC' | 'UPSC' | 'Railway' | 'Banking' | 'Defence';
  type?: 'exam' | 'scheme' | 'scholarship';
}

export interface OpportunityMatchResult {
  exams: Exam[];
  schemes: Scheme[];
  scholarships: Scholarship[];
  hasFiltersApplied: boolean;
  filtersUsed: ConversationFilters;
  isDefenceQuery: boolean;
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

  // 1. Parse Qualification
  if (text.includes('b.tech') || text.includes('btech') || text.includes('engineering') || text.includes('graduate') || text.includes('graduation') || text.includes('degree') || text.includes('b.e.') || text.includes('b.sc') || text.includes('b.com') || text.includes('b.a.')) {
    filters.qualification = 'Graduate';
  } else if (text.includes('diploma') || text.includes('polytechnic')) {
    filters.qualification = 'Diploma';
  } else if (text.includes('12th') || text.includes('12') || text.includes('hsc') || text.includes('intermediate') || text.includes('10+2') || text.includes('second year')) {
    filters.qualification = '12th Pass';
  } else if (text.includes('10th') || text.includes('10') || text.includes('ssc') && !text.includes('ssc cgl') && !text.includes('ssc chsl') || text.includes('matric') || text.includes('matriculation')) {
    // Note: avoid matching SSC exam initials to 10th standard unless specified
    if (!text.includes('exam') && !text.includes('notification')) {
      filters.qualification = '10th Pass';
    }
  }

  // 2. Parse State
  for (const state of states) {
    if (state.name.toLowerCase() === 'all india') continue;
    
    // Exact or partial name match
    if (text.includes(state.name.toLowerCase())) {
      filters.stateId = state.id;
      filters.stateName = state.name;
      break;
    }
  }
  
  // State shortcodes mapping
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
  } else if (text.includes('railway') || text.includes('railways') || text.includes('rrb') || text.includes('ntpc')) {
    filters.interest = 'Railway';
  } else if (text.includes('bank') || text.includes('banking') || text.includes('ibps') || text.includes(' po ') || text.includes('clerk')) {
    filters.interest = 'Banking';
  } else if (text.includes('defence') || text.includes('defense') || text.includes('army') || text.includes('navy') || text.includes('air force') || text.includes('military') || text.includes('nda') || text.includes('cds') || text.includes('police')) {
    filters.interest = 'Defence';
  }

  // 7. Parse Opportunity Type
  if (text.includes('scheme') || text.includes('schemes') || text.includes('yojana') || text.includes('yojanas') || text.includes('welfare') || text.includes('farmers')) {
    filters.type = 'scheme';
  } else if (text.includes('scholarship') || text.includes('scholarships') || text.includes('fellowship') || text.includes('fellowships') || text.includes('epass')) {
    filters.type = 'scholarship';
  } else if (text.includes('exam') || text.includes('exams') || text.includes('job') || text.includes('jobs') || text.includes('notification') || text.includes('notifications') || text.includes('recruitment')) {
    filters.type = 'exam';
  }

  // Quick reset logic if user asks to start over
  if (text.includes('clear') || text.includes('reset') || text.includes('start over')) {
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
    states: State[];
    departments: Department[];
  }
): OpportunityMatchResult {
  let matchedExams = [...data.exams];
  let matchedSchemes = [...data.schemes];
  let matchedScholarships = [...data.scholarships];
  
  const hasFiltersApplied = Object.keys(filters).length > 0;
  const isDefenceQuery = filters.interest === 'Defence';

  // Apply Qualification filter
  if (filters.qualification) {
    const q = filters.qualification;
    
    // Filter Exams
    matchedExams = matchedExams.filter(exam => {
      // "Any Qualification" or "Any Graduate" or matches exactly
      if (exam.qualification === 'Any Qualification') return true;
      
      if (q === 'Graduate') {
        // Graduates can apply for graduate, 12th, and 10th level jobs
        return true;
      }
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

    // Filter Scholarships
    matchedScholarships = matchedScholarships.filter(s => {
      const eligibilityText = s.eligibility.toLowerCase();
      if (q === 'Graduate') return true; // general assumption
      if (q === 'Diploma') return eligibilityText.includes('diploma') || eligibilityText.includes('polytechnic') || eligibilityText.includes('varies') || eligibilityText.includes('matric');
      if (q === '12th Pass') return eligibilityText.includes('12') || eligibilityText.includes('post-matric') || eligibilityText.includes('matric') || eligibilityText.includes('varies');
      if (q === '10th Pass') return eligibilityText.includes('10') || eligibilityText.includes('post-matric') || eligibilityText.includes('matric') || eligibilityText.includes('varies');
      return true;
    });
  }

  // Apply State filter
  if (filters.stateId) {
    const allIndiaState = data.states.find(s => s.name.toLowerCase() === 'all india');
    const allIndiaId = allIndiaState ? allIndiaState.id : '187b6a43-0abd-45b5-a2d3-506743532d80';
    
    // State opportunities match if they are national (All India) or specific to the selected state
    matchedExams = matchedExams.filter(exam => exam.state_id === allIndiaId || exam.state_id === filters.stateId);
    matchedSchemes = matchedSchemes.filter(scheme => scheme.state_id === allIndiaId || scheme.state_id === filters.stateId);
    matchedScholarships = matchedScholarships.filter(s => s.state_id === allIndiaId || s.state_id === filters.stateId);
  }

  // Apply Age filter
  if (filters.age !== undefined) {
    matchedExams = matchedExams.filter(exam => isAgeEligible(filters.age, exam.age_limit));
  }

  // Apply Category filter
  if (filters.category) {
    // Typically SC/ST get age relaxations or custom scholarships
    // We can filter schemes or scholarships targeting specific categories
    if (filters.category === 'SC' || filters.category === 'ST') {
      // Keep SC/ST specific + general
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

  // Apply Gender filter
  if (filters.gender === 'female') {
    // Keep female-specific + general
    matchedSchemes = matchedSchemes.filter(s => {
      const text = s.eligibility.toLowerCase() + ' ' + s.title.toLowerCase();
      if (text.includes('girl') || text.includes('women') || text.includes('female') || text.includes('sukanya')) {
        return true;
      }
      return !text.includes('only male') && !text.includes('boys only');
    });
    matchedScholarships = matchedScholarships.filter(s => {
      const text = s.eligibility.toLowerCase() + ' ' + s.title.toLowerCase();
      if (text.includes('girl') || text.includes('women') || text.includes('female')) {
        return true;
      }
      return !text.includes('only male') && !text.includes('boys only');
    });
  } else if (filters.gender === 'male') {
    // Filter out strictly female-only opportunities (like Sukanya Samriddhi or AICTE Pragati for Girls)
    matchedSchemes = matchedSchemes.filter(s => {
      const text = s.eligibility.toLowerCase() + ' ' + s.title.toLowerCase();
      return !text.includes('girl child') && !text.includes('girl students') && !text.includes('girls only');
    });
    matchedScholarships = matchedScholarships.filter(s => {
      const text = s.eligibility.toLowerCase() + ' ' + s.title.toLowerCase();
      return !text.includes('girl students') && !text.includes('girls only') && !text.includes('pragati');
    });
  }

  // Apply Interest / Department filter
  if (filters.interest) {
    const interest = filters.interest.toLowerCase();
    
    if (interest === 'ssc') {
      matchedExams = matchedExams.filter(exam => exam.title.toLowerCase().includes('ssc'));
    } else if (interest === 'upsc') {
      matchedExams = matchedExams.filter(exam => exam.title.toLowerCase().includes('upsc'));
    } else if (interest === 'railway') {
      matchedExams = matchedExams.filter(exam => exam.title.toLowerCase().includes('rrb') || exam.title.toLowerCase().includes('railway'));
    } else if (interest === 'banking') {
      matchedExams = matchedExams.filter(exam => exam.title.toLowerCase().includes('ibps') || exam.title.toLowerCase().includes('bank') || exam.title.toLowerCase().includes('po'));
    } else if (interest === 'defence') {
      // Defence doesn't exist in our mock/database exam listings, so clear matches to trigger fallback
      matchedExams = [];
    }
  }

  // Apply Type Filter
  if (filters.type) {
    if (filters.type === 'exam') {
      matchedSchemes = [];
      matchedScholarships = [];
    } else if (filters.type === 'scheme') {
      matchedExams = [];
      matchedScholarships = [];
    } else if (filters.type === 'scholarship') {
      matchedExams = [];
      matchedSchemes = [];
    }
  }

  return {
    exams: matchedExams,
    schemes: matchedSchemes,
    scholarships: matchedScholarships,
    hasFiltersApplied,
    filtersUsed: filters,
    isDefenceQuery
  };
}

export function getFallbackRecommendations(
  filters: ConversationFilters,
  data: { exams: Exam[]; schemes: Scheme[]; scholarships: Scholarship[] }
): Exam[] {
  // If defence is asked, suggest some relevant Central exams
  if (filters.interest === 'Defence') {
    return data.exams.filter(exam => exam.title.toLowerCase().includes('upsc') || exam.title.toLowerCase().includes('ssc cgl'));
  }
  
  // Otherwise, suggest general/popular exams open to the user's qualification level
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
