<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OverMix Pro - OBS Studio Stream Overlay</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      background: transparent !important;
      font-family: 'Segoe UI', -apple-system, sans-serif;
      color: #fff;
      overflow: hidden;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      height: 100vh;
      width: 100vw;
      padding: 20px;
    }
    .obs-overlay-card {
      background: rgba(10, 14, 23, 0.85);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(56, 189, 248, 0.35);
      border-radius: 12px;
      padding: 14px 18px;
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.8), 0 0 20px rgba(6, 182, 212, 0.2);
      display: flex;
      align-items: center;
      gap: 18px;
      animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes slideUp {
      from { transform: translateY(50px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .obs-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      border-right: 1px solid rgba(255, 255, 255, 0.1);
      padding-right: 14px;
    }
    .obs-logo {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: linear-gradient(135deg, #06b6d4, #8b5cf6);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      box-shadow: 0 0 12px rgba(6, 182, 212, 0.6);
    }
    .obs-title {
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.05em;
      color: #f1f5f9;
      text-transform: uppercase;
    }
    .obs-badge {
      font-size: 9px;
      font-family: monospace;
      color: #10b981;
      font-weight: 700;
    }
    .obs-visualizer-box {
      width: 160px;
      height: 48px;
      background: rgba(0, 0, 0, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 6px;
      overflow: hidden;
      position: relative;
    }
    canvas {
      width: 100%;
      height: 100%;
      display: block;
    }
    .obs-vu-meters {
      display: flex;
      gap: 4px;
      height: 48px;
      background: #000;
      padding: 3px;
      border-radius: 6px;
      border: 1px solid #1f2937;
    }
    .obs-vu-ch {
      width: 8px;
      height: 100%;
      display: flex;
      flex-direction: column-reverse;
      gap: 2px;
      background: #090c10;
    }
    .obs-vu-led {
      flex: 1;
      border-radius: 1px;
      background: #181d24;
      transition: background 0.05s ease;
    }
    .obs-vu-led.green.active { background: #10b981; box-shadow: 0 0 4px #10b981; }
    .obs-vu-led.yellow.active { background: #f59e0b; box-shadow: 0 0 4px #f59e0b; }
    .obs-vu-led.red.active { background: #ef4444; box-shadow: 0 0 6px #ef4444; }
    .obs-info-box {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 110px;
    }
    .obs-timecode {
      font-family: monospace;
      font-size: 14px;
      font-weight: 800;
      color: #38bdf8;
      letter-spacing: 0.05em;
    }
    .obs-preset-tag {
      font-size: 10px;
      color: #f59e0b;
      font-weight: 700;
      white-space: nowrap;
    }
  </style>
</head>
<body>

  <div class="obs-overlay-card">
    <!-- Brand -->
    <div class="obs-brand">
      <div class="obs-logo" style="background:#090d14; border:1px solid #1e293b;">
        <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
          <defs>
            <linearGradient id="obsWave" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#06b6d4"/>
              <stop offset="100%" stop-color="#a855f7"/>
            </linearGradient>
          </defs>
          <rect x="8" y="20" width="4.5" height="12" rx="2.25" fill="url(#obsWave)"/>
          <rect x="15.5" y="12" width="4.5" height="24" rx="2.25" fill="url(#obsWave)"/>
          <rect x="23" y="6" width="4.5" height="36" rx="2.25" fill="#38bdf8"/>
          <rect x="30.5" y="14" width="4.5" height="20" rx="2.25" fill="url(#obsWave)"/>
          <rect x="38" y="18" width="4.5" height="14" rx="2.25" fill="url(#obsWave)"/>
          <circle cx="25.25" cy="16" r="3" fill="#ffffff" stroke="#080b10" stroke-width="1.5"/>
        </svg>
      </div>
      <div>
        <div class="obs-title">OverMix Pro</div>
        <div class="obs-badge">🔴 ON-AIR MASTER</div>
      </div>
    </div>

    <!-- Mini Spectrum Visualizer -->
    <div class="obs-visualizer-box">
      <canvas id="obs-spectrum-canvas" width="160" height="48"></canvas>
    </div>

    <!-- Stereo VU Meter LEDs -->
    <div class="obs-vu-meters">
      <div class="obs-vu-ch" id="obs-vu-left"></div>
      <div class="obs-vu-ch" id="obs-vu-right"></div>
    </div>

    <!-- Info & Timecode -->
    <div class="obs-info-box">
      <div class="obs-timecode" id="obs-timecode">00:00.00</div>
      <div class="obs-preset-tag" id="obs-dsp-preset">DSP: STUDIO CLEAN</div>
    </div>
  </div>

  <script>
    // Build 12 LED segments per channel
    const leftVu = document.getElementById('obs-vu-left');
    const rightVu = document.getElementById('obs-vu-right');
    const buildLeds = (container) => {
      for (let i = 0; i < 12; i++) {
        const seg = document.createElement('div');
        let color = 'green';
        if (i >= 8 && i < 10) color = 'yellow';
        else if (i >= 10) color = 'red';
        seg.className = `obs-vu-led ${color}`;
        container.appendChild(seg);
      }
    };
    buildLeds(leftVu);
    buildLeds(rightVu);

    const canvas = document.getElementById('obs-spectrum-canvas');
    const ctx = canvas.getContext('2d');
    const timecodeEl = document.getElementById('obs-timecode');
    const presetEl = document.getElementById('obs-dsp-preset');

    // BroadcastChannel sync from main mixer window
    const bc = new BroadcastChannel('studiomaster_obs_sync');
    let latestData = {
      timecode: '00:00.00',
      preset: 'STUDIO CLEAN',
      leftLevel: 0,
      rightLevel: 0,
      freqData: new Array(32).fill(0)
    };

    bc.onmessage = (e) => {
      if (e.data) {
        latestData = { ...latestData, ...e.data };
        if (latestData.timecode) timecodeEl.textContent = latestData.timecode;
        if (latestData.preset) presetEl.textContent = `DSP: ${latestData.preset.toUpperCase()}`;
      }
    };

    // Render loop for Spectrum and VU LEDs
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw spectrum bars
      const bars = 24;
      const barWidth = canvas.width / bars;
      const freq = latestData.freqData || [];

      for (let i = 0; i < bars; i++) {
        const val = freq[i] !== undefined ? freq[i] : Math.sin(Date.now() * 0.005 + i) * 10 + 5;
        const height = (val / 255) * canvas.height;
        const x = i * barWidth;
        const y = canvas.height - height;

        const grad = ctx.createLinearGradient(0, y, 0, canvas.height);
        grad.addColorStop(0, '#38bdf8');
        grad.addColorStop(1, '#8b5cf6');
        ctx.fillStyle = grad;
        ctx.fillRect(x + 1, y, barWidth - 2, height);
      }

      // Update VU meters
      const updateVuLeds = (container, level) => {
        const segments = container.children;
        const activeCount = Math.round(level * 12);
        for (let i = 0; i < segments.length; i++) {
          segments[i].classList.toggle('active', i < activeCount);
        }
      };

      updateVuLeds(leftVu, latestData.leftLevel || 0);
      updateVuLeds(rightVu, latestData.rightLevel || 0);

      requestAnimationFrame(render);
    };

    requestAnimationFrame(render);
  </script>
</body>
</html>
