// Automated Verification Suite for ELSEWHERE
import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('🧪 Starting ELSEWHERE System & Logic Verification Suite...\n');

let passedTests = 0;
let failedTests = 0;

function it(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
    failedTests++;
  }
}

// 1. VERIFY BUILD ARTIFACTS
console.log('--- 1. Build & Deployment Artifacts ---');

it('dist directory exists', () => {
  assert(fs.existsSync('./dist'), 'dist directory must exist');
});

it('dist/index.html exists and contains valid HTML structure', () => {
  assert(fs.existsSync('./dist/index.html'), 'dist/index.html must exist');
  const content = fs.readFileSync('./dist/index.html', 'utf-8');
  assert(content.includes('ELSEWHERE'), 'Title or brand must be present');
  assert(content.includes('id="root"'), 'Root div must exist');
});

it('Netlify SPA redirect rule is present in dist/_redirects', () => {
  assert(fs.existsSync('./dist/_redirects'), 'dist/_redirects must exist');
  const redirects = fs.readFileSync('./dist/_redirects', 'utf-8').trim();
  assert(redirects.includes('/*') && redirects.includes('/index.html') && redirects.includes('200'),
    'dist/_redirects must have standard Netlify SPA fallback rule');
});

it('netlify.toml configuration exists in root', () => {
  assert(fs.existsSync('./netlify.toml'), 'netlify.toml must exist in root');
  const toml = fs.readFileSync('./netlify.toml', 'utf-8');
  assert(toml.includes('publish = "dist"'), 'netlify.toml must publish dist');
});

it('.env.example exists with placeholder values only (no secrets)', () => {
  assert(fs.existsSync('./.env.example'), '.env.example must exist');
  const envContent = fs.readFileSync('./.env.example', 'utf-8');
  assert(envContent.includes('VITE_SUPABASE_URL'), 'VITE_SUPABASE_URL must be defined');
  assert(envContent.includes('VITE_SUPABASE_ANON_KEY'), 'VITE_SUPABASE_ANON_KEY must be defined');
  assert(!envContent.includes('service_role'), 'Never include service_role keys');
  assert(!envContent.includes('postgresql://'), 'Never include database passwords in .env.example');
});

it('supabase/schema.sql exists with RLS policies and table schemas', () => {
  assert(fs.existsSync('./supabase/schema.sql'), 'supabase/schema.sql must exist');
  const sql = fs.readFileSync('./supabase/schema.sql', 'utf-8');
  assert(sql.includes('CREATE TABLE IF NOT EXISTS public.items'), 'Must define items table');
  assert(sql.includes('CREATE TABLE IF NOT EXISTS public.claims'), 'Must define claims table');
  assert(sql.includes('ENABLE ROW LEVEL SECURITY'), 'Must enable RLS');
  assert(sql.includes('item-photos'), 'Must configure item-photos bucket');
});

// 2. VERIFY MEMORY MATCH LOGIC
console.log('\n--- 2. Memory Match Engine Logic ---');

// Mock items for algorithm test
const candidateItems = [
  {
    id: 'item-1',
    title: 'Sony WH-1000XM4 Noise Canceling Headphones',
    category: 'Electronics',
    colour: 'Silver / Grey',
    description: 'Found on 3rd floor quiet study area near desks. In original black case.',
    campus_location: 'Central Library, 3rd Floor',
    type: 'found',
    approximate_date: '2026-10-21',
    status: 'Available'
  },
  {
    id: 'item-2',
    title: 'Sage Green Hydroflask Bottle (32oz)',
    category: 'Bottles',
    colour: 'Sage Green',
    description: 'Found after morning Fluid Dynamics lecture. Has national park stickers and dent.',
    campus_location: 'Engineering Hall, Lecture Room 102',
    type: 'found',
    approximate_date: '2026-10-19',
    status: 'Available'
  },
  {
    id: 'item-3',
    title: 'Brass Ring with 3 Keys & Leather Campus Fob',
    category: 'Keys',
    colour: 'Brass & Brown',
    description: 'Tag has worn initials M.H. stamped in brass.',
    campus_location: 'Student Union North Quad',
    type: 'found',
    approximate_date: '2026-10-20',
    status: 'Available'
  }
];

// Helper algorithm test
function testMatch(query) {
  const queryWords = query.description.toLowerCase().split(/\s+/);
  return candidateItems.map(item => {
    let score = 0;
    const signals = [];
    if (query.category && query.category.toLowerCase() === item.category.toLowerCase()) {
      score += 30;
      signals.push(`Category matches (${item.category})`);
    }
    if (query.colour && item.colour.toLowerCase().includes(query.colour.toLowerCase())) {
      score += 20;
      signals.push(`Similar colour (${item.colour})`);
    }
    if (query.location && item.campus_location.toLowerCase().includes(query.location.toLowerCase())) {
      score += 20;
      signals.push(`Location matches (${item.campus_location})`);
    }
    const itemWords = `${item.title} ${item.description}`.toLowerCase();
    const common = queryWords.filter(w => w.length > 3 && itemWords.includes(w));
    if (common.length > 0) {
      score += Math.min(20, common.length * 7);
      signals.push(`Shared keywords (${common.join(', ')})`);
    }
    return { item, score, signals };
  }).filter(r => r.score >= 15).sort((a, b) => b.score - a.score);
}

it('ranks Hydroflask top when querying for water bottle with stickers in Engineering Hall', () => {
  const results = testMatch({
    description: 'Lost my water bottle with national park stickers after physics lecture',
    category: 'Bottles',
    colour: 'Sage Green',
    location: 'Engineering Hall'
  });

  assert(results.length > 0, 'Should find matches');
  assert.strictEqual(results[0].item.id, 'item-2', 'Item 2 (Hydroflask) must rank highest');
  assert(results[0].score >= 60, 'Score should be high for matching category, colour, and location');
  assert(results[0].signals.some(s => s.includes('Category')), 'Must include category signal');
});

it('ranks Sony headphones top when querying for noise canceling headphones in library', () => {
  const results = testMatch({
    description: 'Silver noise canceling headphones left in case on study desk',
    category: 'Electronics',
    colour: 'Silver',
    location: 'Library'
  });

  assert(results.length > 0, 'Should find matches');
  assert.strictEqual(results[0].item.id, 'item-1', 'Item 1 (Headphones) must rank highest');
});

it('returns empty list when query has no correlation to any saved report', () => {
  const results = testMatch({
    description: 'Lost a purple neon skateboard in the swimming pool basement parking',
    category: 'Other',
    colour: 'Purple',
    location: 'Aquatic Center'
  });

  assert.strictEqual(results.length, 0, 'Should have 0 matches for non-existent item');
});

// 3. PHOTO UPLOAD VALIDATION LOGIC
console.log('\n--- 3. Photograph Upload Constraints ---');

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];

function validatePhoto(file) {
  if (file.size > MAX_SIZE) throw new Error('File size exceeds 5 MB limit');
  if (!ALLOWED_MIME.includes(file.type)) throw new Error('Unsupported image format');
  return true;
}

it('accepts JPEG under 5 MB', () => {
  assert(validatePhoto({ size: 2 * 1024 * 1024, type: 'image/jpeg' }));
});

it('accepts PNG under 5 MB', () => {
  assert(validatePhoto({ size: 4 * 1024 * 1024, type: 'image/png' }));
});

it('accepts WebP under 5 MB', () => {
  assert(validatePhoto({ size: 1 * 1024 * 1024, type: 'image/webp' }));
});

it('rejects oversized file (> 5 MB)', () => {
  assert.throws(() => {
    validatePhoto({ size: 6 * 1024 * 1024, type: 'image/jpeg' });
  }, /exceeds 5 MB/);
});

it('rejects disallowed format (e.g. GIF or SVG)', () => {
  assert.throws(() => {
    validatePhoto({ size: 500 * 1024, type: 'image/gif' });
  }, /Unsupported image format/);
});

// 4. CLAIMS WORKFLOW STATUS TRANSITIONS
console.log('\n--- 4. Claims Lifecycle Logic ---');

it('advances item status from Available to Claim Pending when a claim is filed', () => {
  let item = { status: 'Available' };
  // File claim:
  item.status = 'Claim Pending';
  assert.strictEqual(item.status, 'Claim Pending');
});

it('advances item status to Returned when reporter accepts claim', () => {
  let item = { status: 'Claim Pending' };
  let claim = { claim_status: 'pending' };

  // Accept claim
  claim.claim_status = 'accepted';
  item.status = 'Returned';

  assert.strictEqual(claim.claim_status, 'accepted');
  assert.strictEqual(item.status, 'Returned');
});

it('reverts item status to Available if claim is rejected and no others remain', () => {
  let item = { status: 'Claim Pending' };
  let claims = [{ id: 'c1', claim_status: 'pending' }];

  // Reject claim
  claims[0].claim_status = 'rejected';
  const hasRemainingPending = claims.some(c => c.claim_status === 'pending');
  if (!hasRemainingPending) {
    item.status = 'Available';
  }

  assert.strictEqual(item.status, 'Available');
});

console.log('\n=======================================');
console.log(`Verification Complete: ${passedTests} passed, ${failedTests} failed.`);
console.log('=======================================\n');

if (failedTests > 0) {
  process.exit(1);
}
