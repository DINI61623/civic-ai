

const targets = [
  { url: 'http://localhost:3000/', name: 'Home Page' },
  { url: 'http://localhost:3000/exams', name: 'Exams Catalog' },
  { url: 'http://localhost:3000/exams/fdf89d1c-9251-4243-9e94-a64cb31e8743', name: 'Exam Details (UPSC db-id)' },
  { url: 'http://localhost:3000/exams/ae5fd35a-dd1b-4c21-bf05-8b083b8a2d82', name: 'Exam Details (SSC CGL fallback-id)' },
  { url: 'http://localhost:3000/schemes', name: 'Schemes Catalog' },
  { url: 'http://localhost:3000/schemes/4c45375c-b129-4419-82f2-c297864798db', name: 'Scheme Details (PM Kisan)' },
  { url: 'http://localhost:3000/scholarships', name: 'Scholarships Catalog' },
  { url: 'http://localhost:3000/scholarships/142540bf-15ff-485e-ba1d-29c317bf5c83', name: 'Scholarship Details (NSP)' },
  { url: 'http://localhost:3000/education', name: 'Education Catalog' },
  { url: 'http://localhost:3000/education/a5085e9f-b671-49c3-8584-5233b7586480', name: 'Education Details (IIT JEE)' }
];

async function verify() {
  console.log('🚀 Starting URL verification...');
  let successCount = 0;
  for (const target of targets) {
    try {
      const res = await fetch(target.url);
      if (res.ok) {
        console.log(`✅ ${target.name}: Success (Status: ${res.status})`);
        successCount++;
      } else {
        console.error(`❌ ${target.name}: Failed (Status: ${res.status})`);
      }
    } catch (err) {
      console.error(`❌ ${target.name}: Connection Error:`, err.message);
    }
  }
  
  if (successCount === targets.length) {
    console.log('\n🎉 All target URLs resolved successfully!');
    process.exit(0);
  } else {
    console.error(`\n⚠️ Only ${successCount}/${targets.length} targets succeeded.`);
    process.exit(1);
  }
}

verify();
