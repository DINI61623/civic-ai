import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('Starting database seed...');

  try {
    // 1. Seed States
    const { data: states, error: statesError } = await supabase.from('states').insert([
      { name: 'All India' },
      { name: 'Telangana' },
      { name: 'Andhra Pradesh' },
      { name: 'Uttar Pradesh' },
      { name: 'Maharashtra' }
    ]).select();
    
    if (statesError) throw statesError;
    console.log('States seeded.');
    
    const allIndiaId = states.find(s => s.name === 'All India').id;
    const tsId = states.find(s => s.name === 'Telangana').id;
    const apId = states.find(s => s.name === 'Andhra Pradesh').id;

    // 2. Seed Departments
    const { data: depts, error: deptsError } = await supabase.from('departments').insert([
      { name: 'Union Public Service Commission (UPSC)', state_id: allIndiaId, is_central: true },
      { name: 'Staff Selection Commission (SSC)', state_id: allIndiaId, is_central: true },
      { name: 'Railway Recruitment Board (RRB)', state_id: allIndiaId, is_central: true },
      { name: 'Institute of Banking Personnel Selection (IBPS)', state_id: allIndiaId, is_central: true },
      { name: 'Telangana State Public Service Commission (TSPSC)', state_id: tsId, is_central: false },
      { name: 'Andhra Pradesh Public Service Commission (APPSC)', state_id: apId, is_central: false }
    ]).select();

    if (deptsError) throw deptsError;
    console.log('Departments seeded.');

    const upscId = depts.find(d => d.name.includes('UPSC')).id;
    const sscId = depts.find(d => d.name.includes('SSC')).id;
    const rrbId = depts.find(d => d.name.includes('RRB')).id;
    const ibpsId = depts.find(d => d.name.includes('IBPS')).id;
    const tspscId = depts.find(d => d.name.includes('TSPSC')).id;
    const appscId = depts.find(d => d.name.includes('APPSC')).id;

    // 3. Seed Exams
    const { error: examsError } = await supabase.from('exams').insert([
      { title: 'UPSC Civil Services Examination 2026', eligibility: 'Any Graduate', qualification: 'Graduate', age_limit: '21-32 Years', state_id: allIndiaId, department_id: upscId, start_date: '2026-02-01', last_date: '2026-03-05' },
      { title: 'SSC CGL 2026', eligibility: 'Any Graduate', qualification: 'Graduate', age_limit: '18-32 Years', state_id: allIndiaId, department_id: sscId, start_date: '2026-04-10', last_date: '2026-05-12' },
      { title: 'SSC CHSL 2026', eligibility: '12th Pass', qualification: '12th Pass', age_limit: '18-27 Years', state_id: allIndiaId, department_id: sscId, start_date: '2026-06-01', last_date: '2026-07-01' },
      { title: 'RRB NTPC', eligibility: '12th / Graduate', qualification: 'Any Qualification', age_limit: '18-33 Years', state_id: allIndiaId, department_id: rrbId, start_date: '2026-08-01', last_date: '2026-09-01' },
      { title: 'IBPS PO 2026', eligibility: 'Any Graduate', qualification: 'Graduate', age_limit: '20-30 Years', state_id: allIndiaId, department_id: ibpsId, start_date: '2026-08-15', last_date: '2026-09-10' },
      { title: 'TSPSC Group 1', eligibility: 'Any Graduate', qualification: 'Graduate', age_limit: '18-44 Years', state_id: tsId, department_id: tspscId, start_date: '2026-03-01', last_date: '2026-04-01' },
      { title: 'APPSC Group 2', eligibility: 'Any Graduate', qualification: 'Graduate', age_limit: '18-42 Years', state_id: apId, department_id: appscId, start_date: '2026-05-01', last_date: '2026-06-01' }
    ]);

    if (examsError) throw examsError;
    console.log('Exams seeded.');

    // 4. Seed Schemes
    const { error: schemesError } = await supabase.from('schemes').insert([
      { title: 'PM-KISAN Samman Nidhi', category: 'Farmers', benefits: '₹6000/year', eligibility: 'Landholding farmers', state_id: allIndiaId },
      { title: 'Pradhan Mantri Awas Yojana (PMAY)', category: 'General', benefits: 'Housing subsidy', eligibility: 'EWS/LIG families', state_id: allIndiaId },
      { title: 'Sukanya Samriddhi Yojana', category: 'Women', benefits: 'High interest savings', eligibility: 'Girl child below 10 yrs', state_id: allIndiaId },
      { title: 'Rythu Bandhu', category: 'Farmers', benefits: 'Investment support for agriculture', eligibility: 'Farmers in Telangana', state_id: tsId },
      { title: 'YSR Rythu Bharosa', category: 'Farmers', benefits: 'Financial assistance to farmers', eligibility: 'Farmers in AP', state_id: apId }
    ]);

    if (schemesError) throw schemesError;
    console.log('Schemes seeded.');

    // 5. Seed Scholarships
    const { error: scholarError } = await supabase.from('scholarships').insert([
      { title: 'National Scholarship Portal (NSP)', type: 'Central', eligibility: 'Varies by scheme', last_date: '2026-10-31', state_id: allIndiaId },
      { title: 'TS ePASS Post Matric', type: 'State', eligibility: 'SC/ST/BC/EBC/Minority students', last_date: '2026-12-31', state_id: tsId },
      { title: 'Jagananna Vidya Deevena', type: 'State', eligibility: 'Students in AP pursuing higher education', last_date: '2026-11-30', state_id: apId }
    ]);

    if (scholarError) throw scholarError;
    console.log('Scholarships seeded.');

    // 6. Seed Education
    const { error: eduError } = await supabase.from('education').insert([
      { title: 'IIT JEE Advanced 2026', type: 'Entrance Exam', details: 'Admission to IITs across India', state_id: allIndiaId },
      { title: 'CUET UG 2026', type: 'Entrance Exam', details: 'Common University Entrance Test', state_id: allIndiaId },
      { title: 'Osmania University PG Admissions', type: 'University', details: 'Postgraduate admissions for OU', state_id: tsId },
      { title: 'Andhra University Research Admissions', type: 'University', details: 'PhD and MPhil programs', state_id: apId }
    ]);

    if (eduError) throw eduError;
    console.log('Education seeded.');

    console.log('✅ Database seeded successfully!');
  } catch (err) {
    console.error('Error seeding database:', err);
  }
}

seed();
