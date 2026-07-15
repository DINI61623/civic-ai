/* eslint-disable @typescript-eslint/no-explicit-any */
import { Exam, Scheme, Scholarship } from '@/lib/fallbackData';

export interface Profile {
  fullName?: string;
  dob?: string;
  gender?: string;
  stateId?: string;
  stateName?: string;
  district?: string;
  category?: string;
  pwdStatus?: string;
  highestQualification?: string;
  currentQualification?: string;
  course?: string;
  stream?: string;
  passingYear?: string;
  percentage?: string;
  interests?: string[];
  preferredSector?: string;
  income?: string | number;
  skills?: string;
}

export interface MatchResult {
  score: number; // percentage, e.g. 98
  isEligible: boolean;
  reasons: string[];
  blockers: string[];
  suggestions: string[];
}

export interface RecommendedOpportunity {
  id: string;
  title: string;
  type: 'Govt Exam' | 'Welfare Scheme' | 'Scholarship';
  description: string;
  lastDate: string;
  officialWebsite: string;
  matchScore: number;
  isEligible: boolean;
  reasons: string[];
  blockers: string[];
  suggestions: string[];
}

// Calculates user age relative to local date: 2026-07-15
export function calculateAge(dobString?: string): number {
  if (!dobString) return 22; // default fallback age
  const dob = new Date(dobString);
  const today = new Date("2026-07-15");
  if (isNaN(dob.getTime())) return 22;
  
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

// Parses age limit string like "18-32 Years" or "Min 20 - Max 30"
export function parseAgeLimit(ageLimitStr?: string | null): { min: number; max: number } {
  const result = { min: 18, max: 35 };
  if (!ageLimitStr) return result;
  
  const numbers = ageLimitStr.match(/\d+/g);
  if (numbers && numbers.length >= 2) {
    result.min = parseInt(numbers[0]);
    result.max = parseInt(numbers[1]);
  } else if (numbers && numbers.length === 1) {
    if (ageLimitStr.toLowerCase().includes('max') || ageLimitStr.toLowerCase().includes('below')) {
      result.max = parseInt(numbers[0]);
    } else {
      result.min = parseInt(numbers[0]);
    }
  }
  return result;
}

// Parses scholarship/scheme income limit like "< 2.5 LPA" or "below 8.0 Lakhs"
export function parseIncomeLimit(incomeLimitStr?: string | null): number | null {
  if (!incomeLimitStr) return null;
  
  const cleanStr = incomeLimitStr.toLowerCase();
  const numbers = cleanStr.match(/[\d.]+/g);
  if (!numbers) return null;
  
  let val = parseFloat(numbers[0]);
  
  // Convert LPA/Lakhs to actual Rupees
  if (cleanStr.includes('lpa') || cleanStr.includes('lakh') || cleanStr.includes('lakhs')) {
    val = val * 100000;
  }
  return val;
}

// Helper to check qualification hierarchy levels
function getQualLevel(qual?: string): number {
  if (!qual) return 0;
  const q = qual.toLowerCase();
  if (q.includes('postgraduate') || q.includes('pg') || q.includes('master') || q.includes('phd')) return 4;
  if (q.includes('graduate') || q.includes('degree') || q.includes('bachelor') || q.includes('ug') || q.includes('b.tech') || q.includes('ba') || q.includes('bsc')) return 3;
  if (q.includes('12th') || q.includes('intermediate') || q.includes('hsc') || q.includes('diploma') || q.includes('polytechnic')) return 2;
  if (q.includes('10th') || q.includes('ssc') || q.includes('matric')) return 1;
  return 0;
}

export function matchOpportunity(
  opportunity: any, 
  type: 'exam' | 'scheme' | 'scholarship', 
  profile: Profile
): MatchResult {
  const reasons: string[] = [];
  const blockers: string[] = [];
  const suggestions: string[] = [];
  let score = 0;
  let isEligible = true;

  // Basic Profile values
  const userAge = calculateAge(profile.dob);
  const userQualLevel = getQualLevel(profile.highestQualification || 'Graduate');
  const userState = profile.stateName || 'All India';
  const userCategory = profile.category || 'General';
  const userIncome = profile.income ? parseFloat(profile.income.toString()) : null;

  // 1. EVALUATE GOVERNMENT EXAMS
  if (type === 'exam') {
    const exam = opportunity as Exam;
    
    // Qualification Match
    const reqQual = exam.qualification || exam.eligibility || 'Graduate';
    const reqQualLevel = getQualLevel(reqQual);
    
    if (userQualLevel >= reqQualLevel) {
      score += 30;
      reasons.push("Qualification Eligible");
    } else {
      isEligible = false;
      blockers.push(`Requires ${reqQual} (Your profile is ${profile.highestQualification || 'Graduate'})`);
      suggestions.push(`Complete standard qualifying courses matching the ${reqQual} requirements.`);
    }

    // Age Limits Match
    const { min: minAge, max: maxAge } = parseAgeLimit(exam.age_limit);
    if (userAge >= minAge && userAge <= maxAge) {
      score += 25;
      reasons.push("Age Eligible");
    } else {
      isEligible = false;
      if (userAge < minAge) {
        blockers.push(`Below minimum age limit of ${minAge} years (You are ${userAge})`);
        suggestions.push(`Re-evaluate application once you reach the age of ${minAge}.`);
      } else {
        blockers.push(`Exceeds maximum age limit of ${maxAge} years (You are ${userAge})`);
        suggestions.push("Check reservation categories (SC/ST/OBC) for active age relaxations.");
      }
    }

    // Domicile state check
    const oppState = (exam as any).states?.name || 'All India';
    if (oppState === 'All India' || oppState.toLowerCase() === userState.toLowerCase()) {
      score += 25;
      reasons.push("Domicile Eligible");
    } else {
      isEligible = false;
      blockers.push(`Requires Domicile in ${oppState}`);
      suggestions.push(`Residency requirement is restricted to ${oppState}. Search local state listings.`);
    }

    // Career interest matches
    const titleLower = exam.title.toLowerCase();
    const descLower = (exam.description || '').toLowerCase();
    let interestMatch = false;
    if (profile.interests && profile.interests.length > 0) {
      for (const interest of profile.interests) {
        if (titleLower.includes(interest.toLowerCase()) || descLower.includes(interest.toLowerCase())) {
          interestMatch = true;
          break;
        }
      }
    }
    if (interestMatch) {
      score += 15;
      reasons.push("Matches Career Interests");
    }

    // Preferred Sector check
    const sector = profile.preferredSector || 'Any';
    if (sector === 'Any' || (sector === 'Central Government' && oppState === 'All India') || (sector === 'State Government' && oppState !== 'All India')) {
      score += 5;
      reasons.push("Matches Preferred Sector");
    }
  }

  // 2. EVALUATE SCHOLARSHIPS
  else if (type === 'scholarship') {
    const scholarship = opportunity as Scholarship;

    // Qualification Match
    const eligibilityDesc = (scholarship.eligibility || '').toLowerCase();
    let qualMatch = true;
    
    if (eligibilityDesc.includes('post-matric') || eligibilityDesc.includes('class 11') || eligibilityDesc.includes('class 12')) {
      if (userQualLevel < 2) {
        qualMatch = false;
        blockers.push("Requires intermediate (11th/12th Pass) level");
        suggestions.push("Apply after completing secondary education credentials.");
      }
    } else if (eligibilityDesc.includes('graduate') || eligibilityDesc.includes('engineering') || eligibilityDesc.includes('diploma')) {
      if (userQualLevel < 2) {
        qualMatch = false;
        blockers.push("Requires higher degree / diploma enrollment");
        suggestions.push("Enroll in undergraduate courses to qualify.");
      }
    }

    if (qualMatch) {
      score += 30;
      reasons.push("Qualification Eligible");
    } else {
      isEligible = false;
    }

    // Domicile check
    const oppState = (scholarship as any).states?.name || 'All India';
    if (oppState === 'All India' || oppState.toLowerCase() === userState.toLowerCase()) {
      score += 30;
      reasons.push("Domicile Eligible");
    } else {
      isEligible = false;
      blockers.push(`Requires residency in ${oppState}`);
      suggestions.push(`Search state-level scholarships for ${userState}.`);
    }

    // Income threshold matches
    const incomeLimit = parseIncomeLimit(scholarship.income_limit);
    if (incomeLimit !== null) {
      if (userIncome === null) {
        // Income is optional, give benefit of doubt but list it
        score += 10;
        reasons.push("Income Limit Met (Self-Declaration)");
      } else if (userIncome <= incomeLimit) {
        score += 20;
        reasons.push("Annual Income Within Limits");
      } else {
        isEligible = false;
        blockers.push(`Annual income exceeding limit of ₹${incomeLimit.toLocaleString()}`);
        suggestions.push("Check merit-based slots that do not enforce EWS income limits.");
      }
    } else {
      score += 20;
      reasons.push("No Income Restraints");
    }

    // Category check (some scholarships target SC/ST/OBC/Minorities)
    const isReserved = eligibilityDesc.includes('sc') || eligibilityDesc.includes('st') || eligibilityDesc.includes('obc') || eligibilityDesc.includes('minority');
    if (isReserved) {
      if (userCategory !== 'General') {
        score += 20;
        reasons.push("Category Preference Match");
      } else {
        isEligible = false;
        blockers.push("Reserved category eligibility criteria");
        suggestions.push("Filter for general / open-category scholarship applications.");
      }
    } else {
      score += 20;
      reasons.push("General Merit Open Slot");
    }
  }

  // 3. EVALUATE WELFARE SCHEMES
  else if (type === 'scheme') {
    const scheme = opportunity as Scheme;

    // State / Domicile Check
    const oppState = (scheme as any).states?.name || 'All India';
    if (oppState === 'All India' || oppState.toLowerCase() === userState.toLowerCase()) {
      score += 40;
      reasons.push("Domicile Eligible");
    } else {
      isEligible = false;
      blockers.push(`Restricted to residents of ${oppState}`);
      suggestions.push(`Residency constraint is active. Search matching schemes in ${userState}.`);
    }

    // Category / Beneficiary Match
    const schemeCat = scheme.category || 'General';
    const profileInterests = (profile.interests || []).map(i => i.toLowerCase());
    let categoryMatch = false;

    if (schemeCat === 'Farmers' && profileInterests.includes('farmer')) categoryMatch = true;
    else if (schemeCat === 'Women' && profile.gender === 'Female') categoryMatch = true;
    else if (schemeCat === 'Senior Citizen' && userAge >= 60) categoryMatch = true;
    else if (schemeCat === 'Student' && userQualLevel > 0) categoryMatch = true;
    else if (schemeCat === 'General') categoryMatch = true;

    if (categoryMatch) {
      score += 40;
      reasons.push("Target Beneficiary Match");
    } else {
      isEligible = false;
      blockers.push(`Requires target profile: ${schemeCat}`);
      suggestions.push(`This scheme targets ${schemeCat}. Re-verify interests in your profile setup.`);
    }

    // Blocker matching for gender restriction
    if (schemeCat === 'Women' && profile.gender === 'Male') {
      isEligible = false;
      blockers.push("Exclusively reserved for Female candidates");
      suggestions.push("Search related schemes open to general citizens.");
    }

    score += 20; // baseline schemes weight
  }

  // Normalize final score bounds
  let finalScore = isEligible ? score : Math.max(score - 40, 5); // reduce match score for blockers
  finalScore = Math.min(finalScore, 100);

  return {
    score: Math.round(finalScore),
    isEligible,
    reasons,
    blockers,
    suggestions
  };
}

export function getRecommendations(
  exams: Exam[],
  schemes: Scheme[],
  scholarships: Scholarship[],
  profile: Profile
): RecommendedOpportunity[] {
  const today = new Date("2026-07-15");
  const list: RecommendedOpportunity[] = [];

  // Helper to parse dates securely
  const getParsedDate = (dateStr?: string | null) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  };

  // 1. Process Exams
  exams.forEach(exam => {
    const parsedLastDate = getParsedDate(exam.last_date);
    // Ignore expired opportunities
    if (parsedLastDate && parsedLastDate < today) return;

    const match = matchOpportunity(exam, 'exam', profile);
    list.push({
      id: exam.id,
      title: exam.title,
      type: 'Govt Exam',
      description: exam.description || 'Verified Government Job Opportunity',
      lastDate: exam.last_date,
      officialWebsite: exam.official_website || 'https://www.india.gov.in',
      matchScore: match.score,
      isEligible: match.isEligible,
      reasons: match.reasons,
      blockers: match.blockers,
      suggestions: match.suggestions
    });
  });

  // 2. Process Scholarships
  scholarships.forEach(scholarship => {
    const parsedLastDate = getParsedDate(scholarship.last_date);
    if (parsedLastDate && parsedLastDate < today) return;

    const match = matchOpportunity(scholarship, 'scholarship', profile);
    list.push({
      id: scholarship.id,
      title: scholarship.title,
      type: 'Scholarship',
      description: scholarship.description || 'Verified Student Scholarship Program',
      lastDate: scholarship.last_date,
      officialWebsite: scholarship.official_website || 'https://www.india.gov.in',
      matchScore: match.score,
      isEligible: match.isEligible,
      reasons: match.reasons,
      blockers: match.blockers,
      suggestions: match.suggestions
    });
  });

  // 3. Process Welfare Schemes
  schemes.forEach(scheme => {
    // Schemes are mostly open indefinitely, check end date if present
    const parsedLastDate = getParsedDate(scheme.application_end_date);
    if (parsedLastDate && parsedLastDate < today) return;

    const match = matchOpportunity(scheme, 'scheme', profile);
    list.push({
      id: scheme.id,
      title: scheme.title,
      type: 'Welfare Scheme',
      description: scheme.description || 'Citizen Welfare and Assistance Program',
      lastDate: scheme.application_end_date || 'Open indefinitely',
      officialWebsite: scheme.official_website || 'https://www.india.gov.in',
      matchScore: match.score,
      isEligible: match.isEligible,
      reasons: match.reasons,
      blockers: match.blockers,
      suggestions: match.suggestions
    });
  });

  // Dynamic sorting priority logic:
  // - High match scores first
  // - Tie-breaker: closing soon (within 7 days) gets boosted
  // - Filter out matches below 40% if candidates have higher compatible options
  return list.sort((a, b) => {
    // Check countdown dates
    const aDate = getParsedDate(a.lastDate);
    const bDate = getParsedDate(b.lastDate);

    let aBoost = 0;
    let bBoost = 0;

    if (aDate) {
      const diffTime = aDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays <= 3) aBoost = 15; // closing within 3 days gets massive boost
      else if (diffDays > 3 && diffDays <= 7) aBoost = 5;
    }

    if (bDate) {
      const diffTime = bDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays <= 3) bBoost = 15;
      else if (diffDays > 3 && diffDays <= 7) bBoost = 5;
    }

    const aEffectiveScore = a.matchScore + aBoost;
    const bEffectiveScore = b.matchScore + bBoost;

    return bEffectiveScore - aEffectiveScore;
  });
}
