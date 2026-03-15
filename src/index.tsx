/** @jsxImportSource hono/jsx */
import { Hono } from 'hono';
import { HomePage } from './pages/home';
import { ScanPage } from './pages/scan';
import { ReportPage } from './pages/report';
import { VerifyPage } from './pages/verify';
import { DashboardPage } from './pages/dashboard';
import { AboutPage } from './pages/about';
import { runSafetyChecks } from './lib/safety-checks';
import { calculateOverallScore } from './lib/scoring';
import { generateDemoProof } from './lib/human-verify';
import { globalErrorHandler, globalNotFoundHandler } from './lib/errors';
import type { Category, ScanResult, ScanRow, AppEnv } from './lib/types';
import { ALL_CATEGORIES } from './lib/constants';

const app = new Hono<AppEnv>();

// Global error boundary
app.onError(globalErrorHandler);
app.notFound(globalNotFoundHandler);

// --- Helper: convert DB row to ScanResult ---
function rowToScan(row: ScanRow): ScanResult {
  return {
    id: row.id,
    targetType: row.target_type as 'prompt' | 'endpoint',
    targetValue: row.target_value,
    overallScore: row.overall_score,
    categories: JSON.parse(row.categories),
    results: JSON.parse(row.results),
    humanVerified: row.human_verified === 1,
    humanProof: row.human_proof ?? undefined,
    verifiedAt: row.verified_at ?? undefined,
    createdAt: row.created_at,
  };
}

// ===================== PAGES =====================

app.get('/', async (c) => {
  const stats = await c.env.DB.prepare(
    `SELECT
       COUNT(*) as total,
       SUM(CASE WHEN overall_score < 60 THEN 1 ELSE 0 END) as threats,
       SUM(human_verified) as verified
     FROM scans`,
  ).first<{ total: number; threats: number; verified: number }>();

  return c.html(
    <HomePage
      totalScans={stats?.total ?? 0}
      threats={stats?.threats ?? 0}
      attestations={stats?.verified ?? 0}
    />,
  );
});

app.get('/scan', (c) => c.html(<ScanPage />));

app.get('/report/:id', async (c) => {
  const id = c.req.param('id');
  const row = await c.env.DB.prepare('SELECT * FROM scans WHERE id = ?').bind(id).first<ScanRow>();
  if (!row) return c.text('Scan not found', 404);
  return c.html(<ReportPage scan={rowToScan(row)} />);
});

app.get('/verify/:id', async (c) => {
  const id = c.req.param('id');
  const row = await c.env.DB.prepare('SELECT * FROM scans WHERE id = ?').bind(id).first<ScanRow>();
  if (!row) return c.text('Scan not found', 404);
  return c.html(<VerifyPage scan={rowToScan(row)} />);
});

app.get('/dashboard', async (c) => {
  const rows = await c.env.DB.prepare('SELECT * FROM scans ORDER BY created_at DESC LIMIT 50').all<ScanRow>();
  const scans = (rows.results ?? []).map(rowToScan);
  const total = scans.length;
  const avg = total > 0 ? Math.round(scans.reduce((s, r) => s + r.overallScore, 0) / total) : 0;
  const verified = scans.filter((s) => s.humanVerified).length;
  return c.html(<DashboardPage scans={scans} stats={{ avg, verified, total }} />);
});

app.get('/about', (c) => c.html(<AboutPage />));

// ===================== API =====================

app.post('/api/scan', async (c) => {
  try {
    const body = await c.req.parseBody({ all: true });
    const target = String(body['target'] ?? '').trim();
    if (!target) return c.text('Missing target prompt', 400);

    // Parse selected categories
    const rawCats = body['categories'];
    let cats: string[];
    if (Array.isArray(rawCats)) {
      cats = rawCats.map(String);
    } else if (typeof rawCats === 'string') {
      cats = [rawCats];
    } else {
      cats = [...ALL_CATEGORIES];
    }
    const categories = cats.filter((c): c is Category =>
      (ALL_CATEGORIES as readonly string[]).includes(c),
    );

    const apiKey = c.env.OPENAI_API_KEY;
    if (!apiKey) return c.text('OPENAI_API_KEY not configured', 500);

    // Run safety checks
    const results = await runSafetyChecks(target, categories, apiKey);
    const overallScore = calculateOverallScore(results);

    // Generate scan ID
    const id = crypto.randomUUID();

    // Store in D1
    await c.env.DB.prepare(
      `INSERT INTO scans (id, target_type, target_value, overall_score, categories, results)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
      .bind(id, 'prompt', target, overallScore, JSON.stringify(categories), JSON.stringify(results))
      .run();

    // Return JSON for fetch requests, redirect for normal form POSTs
    // Auto-redirect to verify page for critical/risky scans (<60) to nudge attestation
    const destination = overallScore < 60 ? `/verify/${id}` : `/report/${id}`;
    const wantsJson = (c.req.header('accept') ?? '').includes('application/json');
    if (wantsJson) {
      return c.json({ id, redirectUrl: destination, overallScore });
    }
    return c.redirect(destination);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Scan error:', msg);
    return c.text(`Scan failed: ${msg}`, 500);
  }
});

app.post('/api/verify/:id', async (c) => {
  const id = c.req.param('id');
  const row = await c.env.DB.prepare('SELECT * FROM scans WHERE id = ?').bind(id).first<ScanRow>();
  if (!row) return c.text('Scan not found', 404);

  const proof = generateDemoProof(id);
  const now = new Date().toISOString();

  await c.env.DB.prepare(
    'UPDATE scans SET human_verified = 1, human_proof = ?, verified_at = ? WHERE id = ?',
  )
    .bind(proof, now, id)
    .run();

  return c.redirect(`/verify/${id}`);
});

app.get('/api/report/:id/json', async (c) => {
  const id = c.req.param('id');
  const row = await c.env.DB.prepare('SELECT * FROM scans WHERE id = ?').bind(id).first<ScanRow>();
  if (!row) return c.json({ error: 'Scan not found' }, 404);
  return c.json(rowToScan(row));
});

export default app;
