/** @jsxImportSource hono/jsx */
import type { FC } from 'hono/jsx';
import { Layout } from '../components/layout';
import type { ScanResult } from '../lib/types';

export const VerifyPage: FC<{ scan: ScanResult }> = ({ scan }) => (
  <Layout title="Human Attestation">
    <section class="page-header">
      <div class="container center">
        <h1>👤 Human Attestation</h1>
        <p class="text-muted">
          Prove that a real person reviewed this safety evaluation using ZK proof-of-personhood.
        </p>
      </div>
    </section>

    <section class="section">
      <div class="container container-sm">
        <div class="verify-card">
          <h2>Scan #{scan.id.slice(0, 8)}...</h2>
          <p>
            <strong>Score:</strong> {scan.overallScore}/100 &nbsp;|&nbsp;
            <strong>Checks:</strong> {scan.results.length} &nbsp;|&nbsp;
            <strong>Date:</strong> {scan.createdAt}
          </p>

          {scan.humanVerified ? (
            <div class="verify-status verified">
              <div class="verify-icon">✓</div>
              <h3>Verified by Human</h3>
              <p>This evaluation was reviewed and attested by a verified human via human.tech ZK proof.</p>
              {scan.verifiedAt && <p class="text-muted text-sm">Verified at: {scan.verifiedAt}</p>}
            </div>
          ) : (
            <div class="verify-flow">
              <div class="verify-steps">
                <div class="step">
                  <div class="step-num">1</div>
                  <div>
                    <h4>Review the Findings</h4>
                    <p>Read through the <a href={`/report/${scan.id}`}>safety report</a> and verify the results are accurate.</p>
                  </div>
                </div>
                <div class="step">
                  <div class="step-num">2</div>
                  <div>
                    <h4>Prove Your Personhood</h4>
                    <p>Connect to human.tech and generate a ZK proof-of-personhood — no biometrics shared.</p>
                  </div>
                </div>
                <div class="step">
                  <div class="step-num">3</div>
                  <div>
                    <h4>Sign the Attestation</h4>
                    <p>Your ZK proof is linked to this scan, creating a tamper-proof human attestation record.</p>
                  </div>
                </div>
              </div>

              <div class="verify-widget">
                <div class="widget-placeholder verify-widget-enhanced">
                  <div class="verify-fingerprint">
                    <svg viewBox="0 0 80 80" width="64" height="64" class="fingerprint-svg">
                      <circle cx="40" cy="40" r="30" fill="none" stroke="#E8733A" stroke-width="2" stroke-dasharray="6 4" class="fp-ring fp-ring-1" />
                      <circle cx="40" cy="40" r="22" fill="none" stroke="#E8733A" stroke-width="2" stroke-dasharray="4 6" class="fp-ring fp-ring-2" />
                      <circle cx="40" cy="40" r="14" fill="none" stroke="#E8733A" stroke-width="2" class="fp-ring fp-ring-3" />
                      <circle cx="40" cy="40" r="4" fill="#22c55e" class="fp-core" />
                    </svg>
                    <div class="verify-scan-line"></div>
                  </div>
                  <p class="widget-label">human.tech ZK Proof-of-Personhood</p>
                  <p class="text-muted text-sm">
                    Zero-knowledge identity verification — no biometrics stored, no data shared.
                  </p>
                  <form method="post" action={`/api/verify/${scan.id}`} id="verify-form">
                    <button type="submit" class="btn btn-primary btn-lg verify-btn">
                      <span class="verify-btn-icon">🔐</span>
                      <span>Generate ZK Proof &amp; Attest</span>
                    </button>
                  </form>
                  <p class="text-muted" style="font-size:0.75rem;margin-top:0.8rem;opacity:0.5;">
                    Demo mode — simulates human.tech SDK verification flow
                  </p>
                </div>
              </div>

              <div class="info-box" style="margin-top:2rem;">
                <h4>Why does this matter?</h4>
                <p>
                  If AI safety evaluations can be run <em>and faked</em> by AI, the evaluations themselves
                  become untrustworthy. Human attestation via ZK proofs closes this loop.
                </p>
                <ul>
                  <li><strong>NIST AI RMF</strong> mandates human-in-the-loop for safety testing pipelines</li>
                  <li><strong>EU AI Act Art. 14</strong> requires human oversight for high-risk AI systems</li>
                  <li><strong>Constitutional AI</strong> uses human feedback to define safety boundaries</li>
                </ul>
                <p class="text-sm text-muted">
                  human.tech uses "Human Keys from Human Attributes" — unique identity via zero-knowledge
                  proofs, not just CAPTCHA. Privacy is preserved: no biometrics are ever shared.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  </Layout>
);
