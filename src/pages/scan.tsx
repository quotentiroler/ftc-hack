/** @jsxImportSource hono/jsx */
import type { FC } from 'hono/jsx';
import { html } from 'hono/html';
import { Layout } from '../components/layout';
import { ScanForm } from '../components/scan-form';

const scanScript = html`<script>
(function() {
  const STATUS_MESSAGES = [
    'Analyzing input quality...',
    'Classifying input threat level...',
    'Initializing multi-model probe engine...',
    'Loading adversarial attack vectors...',
    'Testing prompt injection vectors...',
    'Probing target models for hidden instruction following...',
    'Running jailbreak resistance checks...',
    'Trying DAN-style persona hijacks...',
    'Analyzing output manipulation defenses...',
    'Testing open-weight model responses...',
    'Checking evaluation gaming patterns...',
    'Testing data exfiltration defenses...',
    'Running LLM-as-Judge evaluation (GPT-5.4)...',
    'Comparing probe responses across models...',
    'Scoring results across OWASP categories...',
    'Aggregating per-model scores...',
    'Building comparative scorecard...',
    'Finalizing report...'
  ];

  const form = document.getElementById('scan-form');
  const loading = document.getElementById('scan-loading');
  const errorEl = document.getElementById('scan-error');
  const errorMsg = document.getElementById('scan-error-msg');
  const statusEl = document.getElementById('scan-status');
  const progressBar = document.getElementById('scan-progress-bar');
  const timerEl = document.getElementById('scan-timer');
  const probesLive = document.getElementById('scan-probes-live');

  if (!form) return;

  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    // Show loading, hide form
    form.style.display = 'none';
    loading.style.display = 'flex';
    errorEl.style.display = 'none';

    // Timer
    let seconds = 0;
    const timer = setInterval(function() {
      seconds++;
      timerEl.textContent = seconds + 's elapsed';
    }, 1000);

    // Rotating status messages
    let msgIndex = 0;
    statusEl.textContent = STATUS_MESSAGES[0];
    const statusInterval = setInterval(function() {
      msgIndex++;
      if (msgIndex < STATUS_MESSAGES.length) {
        statusEl.style.opacity = '0';
        setTimeout(function() {
          statusEl.textContent = STATUS_MESSAGES[msgIndex];
          statusEl.style.opacity = '1';
        }, 200);
      }
    }, 2500);

    // Progress bar — fast at first, slows down, never reaches 100% until done
    let progress = 0;
    const progressInterval = setInterval(function() {
      if (progress < 70) {
        progress += 1.2;
      } else if (progress < 90) {
        progress += 0.3;
      } else if (progress < 96) {
        progress += 0.05;
      }
      progressBar.style.width = Math.min(progress, 96) + '%';
    }, 300);

    // Probe live feed — show "probes" appearing
    const probeLabels = [
      '💉 Injection: DAN prefix attack',
      '💉 Injection: system prompt override',
      '🔓 Jailbreak: role-play escalation',
      '🔓 Jailbreak: hypothetical framing',
      '🎭 Output: fake system message',
      '🎲 Gaming: eval pattern detection',
      '📤 Exfil: prompt leakage test',
      '📤 Exfil: training data extraction'
    ];
    let probeIdx = 0;
    const probeInterval = setInterval(function() {
      if (probeIdx >= probeLabels.length) return;
      var el = document.createElement('div');
      el.className = 'probe-line';
      el.textContent = probeLabels[probeIdx];
      probesLive.appendChild(el);
      // Keep max 4 visible
      while (probesLive.children.length > 4) {
        probesLive.removeChild(probesLive.firstChild);
      }
      probeIdx++;
    }, 3000);

    // Build form data
    var formData = new FormData(form);

    try {
      var resp = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: formData
      });

      clearInterval(timer);
      clearInterval(statusInterval);
      clearInterval(progressInterval);
      clearInterval(probeInterval);

      if (!resp.ok) {
        var errorText = await resp.text();
        throw new Error(errorText || 'Scan failed with status ' + resp.status);
      }

      var data = await resp.json();
      // Finish animation
      progressBar.style.width = '100%';
      statusEl.style.opacity = '0';
      setTimeout(function() {
        statusEl.textContent = 'Scan complete! Redirecting to report...';
        statusEl.style.opacity = '1';
      }, 150);

      setTimeout(function() {
        window.location.href = data.redirectUrl || '/report/' + data.id;
      }, 600);
    } catch (err) {
      clearInterval(timer);
      clearInterval(statusInterval);
      clearInterval(progressInterval);
      clearInterval(probeInterval);
      loading.style.display = 'none';
      errorEl.style.display = 'flex';
      errorMsg.textContent = err.message || 'An unexpected error occurred.';
    }
  });
})();
</script>`;

export const ScanPage: FC = () => (
  <Layout title="Run a Safety Scan">
    <section class="page-header">
      <div class="container">
        <h1>🔍 Run a Safety Scan</h1>
        <p class="text-muted">
          Paste a system prompt below and select which attack categories to test.
          AEGIS will run research-backed safety checks and generate a detailed report.
        </p>
      </div>
    </section>
    <section class="section">
      <div class="container container-sm">
        <ScanForm />
      </div>
    </section>
    <section class="section">
      <div class="container container-sm">
        <div class="info-box">
          <h3>What gets tested?</h3>
          <ul>
            <li>
              <strong>💉 Prompt Injection</strong> — Tests if the model follows injected instructions hidden
              in user input. Based on UniGuardian's Prompt Trigger Attack taxonomy.
              <em>(Lin et al., 2025 — arXiv:2502.13141)</em>
            </li>
            <li>
              <strong>🔓 Jailbreak Resistance</strong> — Runs known jailbreak templates from
              JailbreakBench's standardized 100-behavior dataset.
              <em>(Chao et al., 2024 — arXiv:2404.01318)</em>
            </li>
            <li>
              <strong>🎭 Output Manipulation</strong> — Tests if model can be tricked into producing
              formatted outputs that mimic system messages or exhibit verbosity bias.
            </li>
            <li>
              <strong>🎲 Evaluation Gaming</strong> — Detects if a model behaves differently when it
              detects eval-like patterns. Uses Min-K% probability analysis.
              <em>(Shi et al., 2023 — arXiv:2310.17680)</em>
            </li>
            <li>
              <strong>📤 Data Exfiltration</strong> — Tests if the model can be coerced into leaking
              system prompt or training data via AdvBench-style probes.
            </li>
          </ul>
        </div>
      </div>
    </section>
    {scanScript}
  </Layout>
);
