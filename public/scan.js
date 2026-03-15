(function () {
  'use strict';

  var STATUS_MESSAGES = [
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
    'Finalizing report...',
  ];

  var PROBE_LABELS = [
    '💉 Injection: DAN prefix attack',
    '💉 Injection: system prompt override',
    '🔓 Jailbreak: role-play escalation',
    '🔓 Jailbreak: hypothetical framing',
    '🎭 Output: fake system message',
    '🎲 Gaming: eval pattern detection',
    '📤 Exfil: prompt leakage test',
    '📤 Exfil: training data extraction',
  ];

  var form = document.getElementById('scan-form');
  var loading = document.getElementById('scan-loading');
  var errorEl = document.getElementById('scan-error');
  var errorMsg = document.getElementById('scan-error-msg');
  var statusEl = document.getElementById('scan-status');
  var progressBar = document.getElementById('scan-progress-bar');
  var timerEl = document.getElementById('scan-timer');
  var probesLive = document.getElementById('scan-probes-live');

  if (!form) return;

  function clearTimers(timers) {
    timers.forEach(function (t) { clearInterval(t); });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Show loading, hide form
    form.style.display = 'none';
    loading.style.display = 'flex';
    errorEl.style.display = 'none';

    // Timer
    var seconds = 0;
    var timer = setInterval(function () {
      seconds++;
      timerEl.textContent = seconds + 's elapsed';
    }, 1000);

    // Rotating status messages
    var msgIndex = 0;
    statusEl.textContent = STATUS_MESSAGES[0];
    var statusInterval = setInterval(function () {
      msgIndex++;
      if (msgIndex < STATUS_MESSAGES.length) {
        statusEl.style.opacity = '0';
        setTimeout(function () {
          statusEl.textContent = STATUS_MESSAGES[msgIndex];
          statusEl.style.opacity = '1';
        }, 200);
      }
    }, 2500);

    // Progress bar — fast start, slows down, never hits 100% until done
    var progress = 0;
    var progressInterval = setInterval(function () {
      if (progress < 70) progress += 1.2;
      else if (progress < 90) progress += 0.3;
      else if (progress < 96) progress += 0.05;
      progressBar.style.width = Math.min(progress, 96) + '%';
    }, 300);

    // Probe live feed
    var probeIdx = 0;
    var probeInterval = setInterval(function () {
      if (probeIdx >= PROBE_LABELS.length) return;
      var el = document.createElement('div');
      el.className = 'probe-line';
      el.textContent = PROBE_LABELS[probeIdx];
      probesLive.appendChild(el);
      while (probesLive.children.length > 4) {
        probesLive.removeChild(probesLive.firstChild);
      }
      probeIdx++;
    }, 3000);

    var allTimers = [timer, statusInterval, progressInterval, probeInterval];

    // Submit via fetch
    var formData = new FormData(form);

    fetch('/api/scan', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: formData,
    })
      .then(function (resp) {
        clearTimers(allTimers);
        if (!resp.ok) {
          return resp.text().then(function (t) {
            throw new Error(t || 'Scan failed with status ' + resp.status);
          });
        }
        return resp.json();
      })
      .then(function (data) {
        // Finish animation
        progressBar.style.width = '100%';
        statusEl.style.opacity = '0';
        setTimeout(function () {
          statusEl.textContent = 'Scan complete! Redirecting to report...';
          statusEl.style.opacity = '1';
        }, 150);
        setTimeout(function () {
          window.location.href = data.redirectUrl || '/report/' + data.id;
        }, 600);
      })
      .catch(function (err) {
        clearTimers(allTimers);
        loading.style.display = 'none';
        errorEl.style.display = 'flex';
        errorMsg.textContent = err.message || 'An unexpected error occurred.';
      });
  });
})();
