/** @jsxImportSource hono/jsx */
import type { FC } from 'hono/jsx';
import { Layout } from '../components/layout';
import type { ScanResult, Category } from '../lib/types';
import { getScoreColor, getScoreLabel, CATEGORY_LABELS, CATEGORY_ICONS, SEVERITY_COLORS } from '../lib/constants';

interface DashboardStats {
  avg: number;
  verified: number;
  total: number;
}

function computeCategoryBreakdown(scans: ScanResult[]) {
  const cats: Record<string, { total: number; failed: number }> = {};
  for (const scan of scans) {
    for (const r of scan.results) {
      if (!cats[r.category]) cats[r.category] = { total: 0, failed: 0 };
      cats[r.category].total++;
      if (!r.passed) cats[r.category].failed++;
    }
  }
  return cats;
}

function computeSeverityDistribution(scans: ScanResult[]) {
  const dist = { low: 0, medium: 0, high: 0, critical: 0 };
  for (const scan of scans) {
    for (const r of scan.results) {
      if (!r.passed) dist[r.severity]++;
    }
  }
  return dist;
}

function computeScoreBuckets(scans: ScanResult[]) {
  const buckets = { safe: 0, moderate: 0, risky: 0, critical: 0 };
  for (const s of scans) {
    if (s.overallScore >= 80) buckets.safe++;
    else if (s.overallScore >= 60) buckets.moderate++;
    else if (s.overallScore >= 40) buckets.risky++;
    else buckets.critical++;
  }
  return buckets;
}

const EmptyDashboard: FC = () => (
  <Layout title="Dashboard">
    <section class="section">
      <div class="container" style="max-width:640px;text-align:center;padding:4rem 1rem;">
        <div style="font-size:3rem;margin-bottom:1rem;">🔍</div>
        <h1 style="margin-bottom:0.5rem;">No scans yet</h1>
        <p class="text-muted" style="margin-bottom:2rem;font-size:1.1rem;">
          Run your first safety evaluation to see real-time insights here — score breakdowns, threat severity, category analysis, and attestation tracking.
        </p>
        <a href="/scan" class="btn btn-primary btn-lg">Run Your First Scan →</a>
      </div>
    </section>
  </Layout>
);

export const DashboardPage: FC<{ scans: ScanResult[]; stats: DashboardStats }> = ({ scans, stats }) => {
  if (scans.length === 0) return <EmptyDashboard />;

  const catBreakdown = computeCategoryBreakdown(scans);
  const severity = computeSeverityDistribution(scans);
  const buckets = computeScoreBuckets(scans);
  const attestRate = stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0;
  const totalFindings = Object.values(severity).reduce((a, b) => a + b, 0);

  return (
    <Layout title="Dashboard">
      {/* KPI strip */}
      <section class="section" style="padding-bottom:0;">
        <div class="container">
          <div class="grid-4">
            <div class="stat">
              <div class="stat-number">{stats.total}</div>
              <div class="stat-label">Total Scans</div>
            </div>
            <div class="stat">
              <div class="stat-number" style={`color:${getScoreColor(stats.avg)}`}>{stats.avg}</div>
              <div class="stat-label">Avg Safety Score</div>
            </div>
            <div class="stat">
              <div class="stat-number">{totalFindings}</div>
              <div class="stat-label">Findings</div>
            </div>
            <div class="stat">
              <div class="stat-number">{attestRate}%</div>
              <div class="stat-label">Attestation Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Two-column insights */}
      <section class="section">
        <div class="container">
          <div class="grid-2">

            {/* Score distribution */}
            <div class="card">
              <h3 style="margin-bottom:1rem;">Score Distribution</h3>
              {[
                { label: 'Safe (80-100)', count: buckets.safe, color: '#22c55e' },
                { label: 'Moderate (60-79)', count: buckets.moderate, color: '#eab308' },
                { label: 'Risky (40-59)', count: buckets.risky, color: '#f97316' },
                { label: 'Critical (0-39)', count: buckets.critical, color: '#ef4444' },
              ].map((b) => {
                const pct = stats.total > 0 ? Math.round((b.count / stats.total) * 100) : 0;
                return (
                  <div style="margin-bottom:0.75rem;" key={b.label}>
                    <div style="display:flex;justify-content:space-between;font-size:0.85rem;margin-bottom:0.25rem;">
                      <span>{b.label}</span>
                      <span style={`color:${b.color};font-weight:600;`}>{b.count} ({pct}%)</span>
                    </div>
                    <div style="background:var(--bg-alt);border-radius:4px;height:8px;overflow:hidden;">
                      <div style={`width:${pct}%;background:${b.color};height:100%;border-radius:4px;transition:width 0.3s;`}></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Threat severity */}
            <div class="card">
              <h3 style="margin-bottom:1rem;">Threat Severity</h3>
              {totalFindings === 0 ? (
                <p class="text-muted" style="text-align:center;padding:2rem 0;">No failures detected — all checks passed.</p>
              ) : (
                (['critical', 'high', 'medium', 'low'] as const).map((sev) => {
                  const count = severity[sev];
                  const pct = totalFindings > 0 ? Math.round((count / totalFindings) * 100) : 0;
                  return (
                    <div style="margin-bottom:0.75rem;" key={sev}>
                      <div style="display:flex;justify-content:space-between;font-size:0.85rem;margin-bottom:0.25rem;">
                        <span style="text-transform:capitalize;">{sev}</span>
                        <span style={`color:${SEVERITY_COLORS[sev]};font-weight:600;`}>{count}</span>
                      </div>
                      <div style="background:var(--bg-alt);border-radius:4px;height:8px;overflow:hidden;">
                        <div style={`width:${pct}%;background:${SEVERITY_COLORS[sev]};height:100%;border-radius:4px;`}></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Category breakdown */}
      <section class="section" style="padding-top:0;">
        <div class="container">
          <div class="card">
            <h3 style="margin-bottom:1rem;">Category Breakdown</h3>
            <div class="grid-5-auto">
              {(Object.keys(CATEGORY_LABELS) as Category[]).map((cat) => {
                const data = catBreakdown[cat] ?? { total: 0, failed: 0 };
                const passRate = data.total > 0 ? Math.round(((data.total - data.failed) / data.total) * 100) : 100;
                const color = passRate >= 80 ? '#22c55e' : passRate >= 60 ? '#eab308' : passRate >= 40 ? '#f97316' : '#ef4444';
                return (
                  <div style="text-align:center;padding:1rem 0.5rem;" key={cat}>
                    <div style="font-size:1.5rem;">{CATEGORY_ICONS[cat]}</div>
                    <div style={`font-size:1.5rem;font-weight:700;color:${color};margin:0.25rem 0;`}>{passRate}%</div>
                    <div style="font-size:0.75rem;color:var(--text-muted);">{CATEGORY_LABELS[cat]}</div>
                    <div style="font-size:0.7rem;color:var(--text-muted);">{data.failed} / {data.total} failed</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Scan history table */}
      <section class="section" style="padding-top:0;">
        <div class="container">
          <h2 style="margin-bottom:1rem;">Recent Scans</h2>
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Target</th>
                  <th>Models</th>
                  <th>Score</th>
                  <th>Rating</th>
                  <th>Checks</th>
                  <th>Attested</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {scans.map((s) => {
                  const color = getScoreColor(s.overallScore);
                  const label = getScoreLabel(s.overallScore);
                  const failed = s.results.filter((r) => !r.passed).length;
                  const models = s.modelResults ?? [];
                  return (
                    <tr key={s.id}>
                      <td class="text-sm">{new Date(s.createdAt).toLocaleDateString()}</td>
                      <td class="text-sm mono" style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                        {s.targetValue.slice(0, 50)}
                      </td>
                      <td class="text-sm">
                        {models.length > 0 ? (
                          <span style="display:flex;flex-wrap:wrap;gap:0.25rem;">
                            {models.map((m) => (
                              <span key={m.modelId} class={`provider-tag provider-${m.provider}`} style="font-size:0.7rem;">
                                {m.modelName}
                              </span>
                            ))}
                          </span>
                        ) : (
                          <span class="text-muted">—</span>
                        )}
                      </td>
                      <td>
                        {models.length > 1 ? (
                          <span style="display:flex;flex-direction:column;gap:0.15rem;">
                            {models.map((m) => (
                              <span key={m.modelId} style={`color:${getScoreColor(m.overallScore)};font-weight:700;font-size:0.9rem;`}>
                                {m.overallScore}
                              </span>
                            ))}
                          </span>
                        ) : (
                          <span style={`color:${color};font-weight:700;font-size:1.1rem;`}>{s.overallScore}</span>
                        )}
                      </td>
                      <td>
                        {models.length > 1 ? (
                          <span style="display:flex;flex-direction:column;gap:0.15rem;">
                            {models.map((m) => (
                              <span key={m.modelId} style={`color:${getScoreColor(m.overallScore)};font-size:0.75rem;font-weight:600;`}>
                                {getScoreLabel(m.overallScore)}
                              </span>
                            ))}
                          </span>
                        ) : (
                          <span style={`color:${color};font-size:0.8rem;font-weight:600;`}>{label}</span>
                        )}
                      </td>
                      <td class="text-sm">
                        {models.length > 1 ? (
                          <span style="display:flex;flex-direction:column;gap:0.15rem;">
                            {models.map((m) => {
                              const mFailed = m.results.filter((r) => !r.passed).length;
                              const mColor = mFailed > 0 ? '#ef4444' : '#22c55e';
                              return (
                                <span key={m.modelId} style={`color:${mColor};font-size:0.75rem;`}>
                                  {m.results.length - mFailed}/{m.results.length} {m.modelName}
                                </span>
                              );
                            })}
                          </span>
                        ) : (
                          <span>{s.results.length - failed}/{s.results.length} passed</span>
                        )}
                      </td>
                      <td>{s.humanVerified ? <span style="color:#22c55e;">✓ Yes</span> : <span class="text-muted">—</span>}</td>
                      <td>
                        <a href={`/report/${s.id}`} class="btn btn-sm">View →</a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </Layout>
  );
};
