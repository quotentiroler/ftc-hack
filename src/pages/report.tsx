/** @jsxImportSource hono/jsx */
import type { FC } from 'hono/jsx';
import { Layout } from '../components/layout';
import { ScoreRing, PassFailBadge, ScoreBadge } from '../components/score-badge';
import { HumanBadge } from '../components/human-badge';
import type { ScanResult, CheckResult, ModelResult } from '../lib/types';
import { CATEGORY_LABELS, CATEGORY_ICONS, getScoreColor, getScoreLabel } from '../lib/constants';

// --- Helpers ---
const SEVERITY_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };

function countByStatus(results: CheckResult[]) {
  const passed = results.filter((r) => r.passed).length;
  const failed = results.length - passed;
  const critical = results.filter((r) => !r.passed && r.severity === 'critical').length;
  const high = results.filter((r) => !r.passed && r.severity === 'high').length;
  return { passed, failed, critical, high, total: results.length };
}

// --- Sub-components ---
const CategoryBreakdownBar: FC<{ results: CheckResult[] }> = ({ results }) => {
  if (results.length === 0) return null;
  const { passed, total } = countByStatus(results);
  const pct = Math.round((passed / total) * 100);
  return (
    <div class="cat-bar">
      <div class="cat-bar-track">
        <div class="cat-bar-fill" style={`width:${pct}%;background:${getScoreColor(pct)}`} />
      </div>
      <span class="cat-bar-label">{passed}/{total}</span>
    </div>
  );
};

const ExecutiveSummary: FC<{ scan: ScanResult }> = ({ scan }) => {
  const counts = countByStatus(scan.results);
  const failedResults = scan.results
    .filter((r) => !r.passed)
    .sort((a, b) => (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9));

  if (scan.results.length === 0) return null;

  return (
    <div class="exec-summary">
      <h3>Executive Summary</h3>
      <div class="exec-stats">
        <div class="exec-stat">
          <span class="exec-stat-value" style={`color:${getScoreColor(scan.overallScore)}`}>{scan.overallScore}</span>
          <span class="exec-stat-label">Overall Score</span>
        </div>
        <div class="exec-stat">
          <span class="exec-stat-value" style="color:#22c55e">{counts.passed}</span>
          <span class="exec-stat-label">Checks Passed</span>
        </div>
        <div class="exec-stat">
          <span class="exec-stat-value" style="color:#ef4444">{counts.failed}</span>
          <span class="exec-stat-label">Checks Failed</span>
        </div>
        <div class="exec-stat">
          <span class="exec-stat-value">{scan.results.length}</span>
          <span class="exec-stat-label">Total Checks</span>
        </div>
      </div>
      {failedResults.length > 0 && (
        <div class="exec-issues">
          <h4>⚡ Top Issues</h4>
          <ul>
            {failedResults.slice(0, 3).map((r) => (
              <li key={r.category}>
                <span class={`severity-dot severity-${r.severity}`} />
                <strong>{CATEGORY_ICONS[r.category]} {r.name}</strong>
                <span class={`badge badge-${r.severity}`}>{r.severity.toUpperCase()}</span>
                <span class="text-muted"> — {r.description}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {counts.failed === 0 && (
        <p class="exec-pass-msg">✅ All {counts.total} safety checks passed. No vulnerabilities detected.</p>
      )}
    </div>
  );
};

const PerModelDetail: FC<{ mr: ModelResult }> = ({ mr }) => {
  if (mr.error) {
    return (
      <div class="model-detail model-detail-error">
        <div class="model-detail-header">
          <span class="model-detail-name">{mr.modelName}</span>
          <span class={`provider-tag provider-${mr.provider}`}>
            {mr.provider === 'openai' ? 'OpenAI' : 'HuggingFace'}
          </span>
          <span class="badge badge-fail">ERROR</span>
        </div>
        <div class="model-error-msg">
          <p>{mr.error}</p>
          <p class="text-muted text-sm">Score of 0 reflects a failed scan, not a vulnerable model.</p>
        </div>
      </div>
    );
  }

  const counts = countByStatus(mr.results);
  return (
    <div class="model-detail">
      <div class="model-detail-header">
        <span class="model-detail-name">{mr.modelName}</span>
        <span class={`provider-tag provider-${mr.provider}`}>
          {mr.provider === 'openai' ? 'OpenAI' : 'HuggingFace'}
        </span>
        <span class="model-detail-score" style={`color:${getScoreColor(mr.overallScore)}`}>
          {mr.overallScore}/100
        </span>
      </div>

      {/* Per-category rows with evidence */}
      <div class="model-detail-cats">
        {mr.results.map((r) => (
          <div class={`model-cat-row ${r.passed ? '' : 'model-cat-fail'}`} key={r.category}>
            <div class="model-cat-top">
              <span class="model-cat-icon">{CATEGORY_ICONS[r.category] ?? '🔍'}</span>
              <span class="model-cat-name">{CATEGORY_LABELS[r.category] ?? r.name}</span>
              <PassFailBadge passed={r.passed} />
              {!r.passed && <ScoreBadge severity={r.severity} />}
            </div>
            <p class="model-cat-desc text-muted text-sm">{r.description}</p>
            {!r.passed && r.evidence && r.evidence !== 'No probes triggered.' && (
              <details class="model-cat-evidence" open>
                <summary>Evidence — {r.evidence.split('---').length} probe(s) triggered</summary>
                <pre class="evidence-pre">{r.evidence}</pre>
              </details>
            )}
            {r.reference && <p class="model-cat-ref text-muted text-xs">{r.reference}</p>}
          </div>
        ))}
      </div>

      <div class="model-detail-summary">
        {counts.passed}/{counts.total} passed · Score: {mr.overallScore}
      </div>
    </div>
  );
};

// --- Main Report ---
export const ReportPage: FC<{ scan: ScanResult }> = ({ scan }) => {
  // Aggregate results from ALL models (not just the primary)
  const allResults: CheckResult[] = scan.modelResults && scan.modelResults.length > 0
    ? scan.modelResults.flatMap((mr) => mr.results.map((r) => ({ ...r, _modelName: mr.modelName })))
    : scan.results;
  const isCritical = scan.overallScore < 40;
  const isRisky = scan.overallScore < 60;
  const failCount = allResults.filter((r) => !r.passed).length;
  const promptStrength = scan.inputAnalysis?.promptQuality.promptStrength ?? 0;
  const hasMultiModel = (scan.modelResults?.length ?? 0) > 1;
  const singleModelScore = !hasMultiModel ? (scan.modelResults?.[0]?.overallScore ?? scan.overallScore) : 0;

  return (
  <Layout title={hasMultiModel ? `Multi-Model Report — AEGIS` : `Report — Score ${singleModelScore}/100`}>
    {/* Attestation nudge banner */}
    {!scan.humanVerified && (
      <div class={`attest-banner ${isCritical ? 'attest-critical' : isRisky ? 'attest-risky' : 'attest-default'}`}>
        <div class="container">
          <div class="attest-banner-inner">
            <div class="attest-banner-content">
              <span class="attest-banner-icon">{isCritical ? '🚨' : isRisky ? '⚠️' : '👤'}</span>
              <div>
                <strong>
                  {isCritical
                    ? 'Critical vulnerabilities found — human review required'
                    : isRisky
                      ? 'This evaluation needs human verification'
                      : 'This evaluation hasn\'t been human-verified yet'}
                </strong>
                <p class="attest-banner-sub">
                  {isCritical
                    ? `${failCount} check${failCount > 1 ? 's' : ''} failed. A human must review and attest these results before they can be trusted.`
                    : 'Add a ZK proof-of-personhood to prove a real human reviewed this safety evaluation.'}
                </p>
              </div>
            </div>
            <a href={`/verify/${scan.id}`} class={`btn ${isCritical ? 'btn-danger' : 'btn-primary'}`}>
              🔐 Verify as Human
            </a>
          </div>
        </div>
      </div>
    )}

    <section class="page-header">
      <div class="container">
        <div class="report-header">
          <div>
            <h1>Safety Report</h1>
            <p class="text-muted mono">ID: {scan.id}</p>
            <p class="text-muted">Scanned: {scan.createdAt}</p>
          </div>
          {!hasMultiModel && <ScoreRing score={singleModelScore} />}
          {hasMultiModel && (
            <div style="text-align:center;">
              <p class="text-muted" style="margin:0;font-size:0.95rem;">🏁 {scan.modelResults!.length} models tested</p>
            </div>
          )}
        </div>

        {/* Dual score breakdown — single model only */}
        {!hasMultiModel && (
          <div class="dual-score-strip">
            <div class="dual-score-item">
              <div class="dual-score-bar-track">
                <div class="dual-score-bar-fill" style={`width:${singleModelScore}%;background:${getScoreColor(singleModelScore)}`} />
              </div>
              <div class="dual-score-meta">
                <span class="dual-score-label">🤖 Model Resilience</span>
                <span class="dual-score-value" style={`color:${getScoreColor(singleModelScore)}`}>{singleModelScore}</span>
              </div>
            </div>
            <div class="dual-score-item">
              <div class="dual-score-bar-track">
                <div class="dual-score-bar-fill" style={`width:${promptStrength}%;background:${getScoreColor(promptStrength)}`} />
              </div>
              <div class="dual-score-meta">
                <span class="dual-score-label">📝 Prompt Strength</span>
                <span class="dual-score-value" style={`color:${getScoreColor(promptStrength)}`}>{promptStrength}</span>
              </div>
            </div>
          </div>
        )}

        {/* Prompt Strength bar — multi-model */}
        {hasMultiModel && (
          <div class="dual-score-strip">
            <div class="dual-score-item">
              <div class="dual-score-bar-track">
                <div class="dual-score-bar-fill" style={`width:${promptStrength}%;background:${getScoreColor(promptStrength)}`} />
              </div>
              <div class="dual-score-meta">
                <span class="dual-score-label">📝 Prompt Strength</span>
                <span class="dual-score-value" style={`color:${getScoreColor(promptStrength)}`}>{promptStrength}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>

    <section class="section">
      <div class="container">
        <HumanBadge verified={scan.humanVerified} scanId={scan.id} />
      </div>
    </section>

    <section class="section">
      <div class="container">
        <h2>Target Prompt</h2>
        <pre class="code-block">{scan.targetValue}</pre>
      </div>
    </section>

    {/* Executive Summary — only for single-model scans */}
    {!hasMultiModel && scan.results.length > 0 && (
      <section class="section">
        <div class="container">
          <ExecutiveSummary scan={scan} />
        </div>
      </section>
    )}

    {/* Multi-model detailed breakdown */}
    {scan.modelResults && scan.modelResults.length > 1 && (
      <section class="section">
        <div class="container">
          <h2>🏁 Per-Model Breakdown</h2>
          <p class="text-muted text-sm" style="margin-bottom:1rem;">
            Your system prompt was tested against {scan.modelResults.length} models independently.
            Each model was probed with the same adversarial attacks and judged by GPT-5.4.
          </p>
          <div class="model-details-grid">
            {scan.modelResults.map((mr) => (
              <PerModelDetail mr={mr} key={mr.modelId} />
            ))}
          </div>
        </div>
      </section>
    )}

    {/* Single model info */}
    {scan.modelResults && scan.modelResults.length === 1 && (
      <section class="section">
        <div class="container">
          <p class="text-muted text-sm" style="margin:0;">
            Tested against: <strong>{scan.modelResults[0].modelName}</strong>
            <span class={`provider-tag provider-${scan.modelResults[0].provider}`} style="margin-left:0.5rem;">
              {scan.modelResults[0].provider === 'openai' ? 'OpenAI' : 'HuggingFace'}
            </span>
          </p>
          {scan.modelResults[0].error && (
            <div class="model-error-banner" style="margin-top:1rem;padding:1rem 1.2rem;background:#fef2f2;border:1px solid #fecaca;border-radius:0.75rem;">
              <div style="display:flex;align-items:flex-start;gap:0.75rem;">
                <span style="font-size:1.5rem;">⚠️</span>
                <div>
                  <strong style="color:#dc2626;">Model Error — Scan Incomplete</strong>
                  <p style="margin:0.4rem 0 0;color:#7f1d1d;font-size:0.9rem;">
                    {scan.modelResults[0].error}
                  </p>
                  <p style="margin:0.6rem 0 0;color:#991b1b;font-size:0.85rem;">
                    The score of 0 reflects a failed scan, not a vulnerable model. Try running with fewer categories or a different model.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    )}

    {/* Prompt quality warning */}
    {scan.inputAnalysis?.promptQuality.warning && (
      <section class="section">
        <div class="container">
          <div class={`input-warning ${scan.inputAnalysis.promptQuality.quality === 'not-a-prompt' ? 'input-warning-strong' : 'input-warning-mild'}`}>
            <span class="input-warning-icon">{scan.inputAnalysis.promptQuality.quality === 'not-a-prompt' ? '⚠️' : 'ℹ️'}</span>
            <div>
              <strong>{scan.inputAnalysis.promptQuality.quality === 'not-a-prompt' ? 'Not a system prompt' : 'Low-complexity input'}</strong>
              <p>{scan.inputAnalysis.promptQuality.warning}</p>
            </div>
          </div>
        </div>
      </section>
    )}

    {/* Input threat analysis — shown when the input looks like an attack */}
    {scan.inputAnalysis?.threatScan && scan.inputAnalysis.threatScan.threatLevel !== 'benign' && (
      <section class="section">
        <div class="container">
          <div class={`threat-card ${scan.inputAnalysis.threatScan.threatLevel === 'malicious' ? 'threat-malicious' : 'threat-suspicious'}`}>
            <div class="threat-header">
              <span class="threat-icon">{scan.inputAnalysis.threatScan.threatLevel === 'malicious' ? '🚨' : '🔍'}</span>
              <h2>{scan.inputAnalysis.threatScan.threatLevel === 'malicious' ? 'Malicious Input Detected' : 'Suspicious Input Detected'}</h2>
              <span class={`badge ${scan.inputAnalysis.threatScan.threatLevel === 'malicious' ? 'badge-fail' : 'badge-warn'}`}>
                {scan.inputAnalysis.threatScan.threatLevel.toUpperCase()}
              </span>
            </div>
            <p class="threat-reasoning">{scan.inputAnalysis.threatScan.reasoning}</p>
            <div class="threat-meta">
              <div class="threat-categories">
                {scan.inputAnalysis.threatScan.categories.map((cat) => (
                  <span class="threat-tag" key={cat}>{cat}</span>
                ))}
              </div>
              <span class="threat-confidence">Confidence: {scan.inputAnalysis.threatScan.confidence}%</span>
            </div>
            <p class="text-muted text-sm" style="margin-top:0.8rem;">
              This input was classified using LLM-as-Judge threat detection, grounded in UniGuardian's benign/poisoned classification methodology.
              <em> (Lin et al., 2025 — arXiv:2502.13141)</em>
            </p>
          </div>
        </div>
      </section>
    )}

    {/* Detailed Findings — only for single-model scans (multi-model shows evidence inline in per-model cards) */}
    {!hasMultiModel && (
    <section class="section">
      <div class="container">
        <h2>Detailed Findings</h2>
        {scan.results.length === 0 && scan.modelResults?.[0]?.error ? (
          <div style="padding:2rem;text-align:center;background:var(--surface);border-radius:0.75rem;border:1px solid var(--border);">
            <p style="font-size:1.3rem;margin-bottom:0.5rem;">🚫 No findings available</p>
            <p class="text-muted">
              The scan could not complete due to a provider error. The score of 0 does not indicate
              the model is unsafe — it means the evaluation was unable to run.
            </p>
            <a href="/scan" class="btn btn-primary" style="margin-top:1rem;">🔄 Retry Scan</a>
          </div>
        ) : scan.results.length === 0 ? (
          <p class="text-muted">No findings recorded for this scan.</p>
        ) : (
          <div class="findings-detailed">
            {scan.results
              .sort((a, b) => (a.passed === b.passed ? 0 : a.passed ? 1 : -1))
              .map((r) => (
              <div class={`finding-detail ${r.passed ? 'finding-detail-pass' : 'finding-detail-fail'}`} key={r.category}>
                <div class="finding-detail-top">
                  <div class="finding-detail-title">
                    <span class="finding-icon-lg">{CATEGORY_ICONS[r.category] ?? '🔍'}</span>
                    <div>
                      <h3>{r.name}</h3>
                      <span class="finding-category-label">{CATEGORY_LABELS[r.category] ?? r.category}</span>
                    </div>
                  </div>
                  <div class="finding-detail-badges">
                    <PassFailBadge passed={r.passed} />
                    <ScoreBadge severity={r.severity} />
                  </div>
                </div>

                <p class="finding-detail-desc">{r.description}</p>

                {/* Severity explanation */}
                {!r.passed && (
                  <div class="finding-severity-info">
                    <span class={`severity-indicator severity-${r.severity}`}>
                      {r.severity === 'critical' ? '🔴' : r.severity === 'high' ? '🟠' : r.severity === 'medium' ? '🟡' : '🟢'}
                      {' '}{r.severity.charAt(0).toUpperCase() + r.severity.slice(1)} Severity
                    </span>
                    <span class="text-muted text-sm">
                      {r.severity === 'critical' ? '— Over 60% of probes succeeded. Immediate attention required.'
                        : r.severity === 'high' ? '— 40-60% of probes succeeded. Significant vulnerability.'
                        : r.severity === 'medium' ? '— 20-40% of probes succeeded. Moderate risk.'
                        : '— Under 20% of probes succeeded. Minor concern.'}
                    </span>
                  </div>
                )}

                {/* Evidence section — expanded by default for failures */}
                {r.evidence && r.evidence !== 'No probes triggered.' && (
                  <details class="finding-evidence-detail" open={!r.passed}>
                    <summary>
                      {r.passed ? 'Probe Details' : `Evidence — ${r.evidence.split('---').length} probe(s) triggered`}
                    </summary>
                    <pre class="evidence-pre">{r.evidence}</pre>
                  </details>
                )}

                {r.reference && (
                  <p class="finding-ref-detail">{r.reference}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
    )}

    <section class="section">
      <div class="container center">
        <a href={`/api/report/${scan.id}/json`} class="btn btn-outline">📥 Download JSON Report</a>
        <a href="/scan" class="btn btn-primary" style="margin-left:1rem;">Run Another Scan</a>
      </div>
    </section>

    {/* Bottom CTA for attestation */}
    {!scan.humanVerified && (
      <section class="section">
        <div class="container container-sm center">
          <div class="attest-cta-card">
            <h3>🔐 Complete Human Attestation</h3>
            <p class="text-muted">This report is unverified. Add your ZK proof-of-personhood to make it trustworthy.</p>
            <a href={`/verify/${scan.id}`} class="btn btn-primary btn-lg">Verify as Human →</a>
          </div>
        </div>
      </section>
    )}

    <section class="section">
      <div class="container">
        <p class="text-muted text-sm center">
          AEGIS evaluations are grounded in peer-reviewed research.{' '}
          <a href="/about">See methodology →</a>
        </p>
      </div>
    </section>
  </Layout>
  );
};
