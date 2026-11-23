const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer-core');

const OUTPUT_VIDEO = path.join(__dirname, '../public/medivoice_demo_walkthrough.mp4');
const FPS = 24;
const WIDTH = 1920;
const HEIGHT = 1080;

(async () => {
  console.log('--- Starting Enhanced MediVoice AI Demo Walkthrough with Sign-In & Onboarding ---');
  console.log(`Target: ${OUTPUT_VIDEO}`);
  console.log(`Resolution: ${WIDTH}x${HEIGHT} @ ${FPS}fps`);

  const outDir = path.dirname(OUTPUT_VIDEO);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Spawn Python OpenCV VideoWriter
  const pyScript = `
import cv2, sys, numpy as np

output_path = '${OUTPUT_VIDEO}'
writer = cv2.VideoWriter(output_path, cv2.VideoWriter_fourcc(*'avc1'), ${FPS}, (${WIDTH}, ${HEIGHT}))
stdin = sys.stdin.buffer

total_frames = 0
while True:
    header = stdin.read(8)
    if not header or len(header) < 8:
        break
    length = int.from_bytes(header[:4], 'big')
    repeat = int.from_bytes(header[4:8], 'big')
    jpeg_data = stdin.read(length)
    if len(jpeg_data) < length:
        break
    arr = np.frombuffer(jpeg_data, dtype=np.uint8)
    frame = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if frame is not None:
        if frame.shape[0] != ${HEIGHT} or frame.shape[1] != ${WIDTH}:
            frame = cv2.resize(frame, (${WIDTH}, ${HEIGHT}))
        for _ in range(repeat):
            writer.write(frame)
            total_frames += 1

writer.release()
print(f'Done! Successfully wrote {total_frames} frames to {output_path}')
`;

  const py = spawn('python3', ['-c', pyScript]);
  py.stdout.on('data', d => console.log('[Python]', d.toString().trim()));
  py.stderr.on('data', d => console.error('[Python Error]', d.toString().trim()));

  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      `--window-size=${WIDTH},${HEIGHT}`,
      '--font-render-hinting=max',
      '--force-color-profile=srgb',
      '--disable-web-security'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });

  async function sendFrame(repeat = 1) {
    const buf = await page.screenshot({ type: 'jpeg', quality: 90 });
    const header = Buffer.alloc(8);
    header.writeUInt32BE(buf.length, 0);
    header.writeUInt32BE(repeat, 4);
    py.stdin.write(header);
    py.stdin.write(buf);
  }

  // Inject sleek modern mouse cursor
  async function initCursor(x = 960, y = 540) {
    await page.evaluate(({ initX, initY }) => {
      let cur = document.getElementById('demo-cursor');
      if (!cur) {
        cur = document.createElement('div');
        cur.id = 'demo-cursor';
        cur.innerHTML = `
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" style="filter: drop-shadow(0 3px 6px rgba(0,0,0,0.45));">
            <path d="M5.5 3.2L18.8 12.2L12.5 13.5L9.5 19.8L5.5 3.2Z" fill="#a4161a" stroke="#ffffff" stroke-width="1.8" stroke-linejoin="round"/>
          </svg>
        `;
        cur.style.position = 'fixed';
        cur.style.zIndex = '9999999';
        cur.style.pointerEvents = 'none';
        cur.style.transition = 'none';
        document.body.appendChild(cur);
      }
      cur.style.left = initX + 'px';
      cur.style.top = initY + 'px';
    }, { initX: x, initY: y });
  }

  async function setCursor(x, y) {
    await page.evaluate(({ cx, cy }) => {
      const cur = document.getElementById('demo-cursor');
      if (cur) {
        cur.style.left = cx + 'px';
        cur.style.top = cy + 'px';
      }
    }, { cx: x, cy: y });
  }

  // Smooth scroll helper with ease-in-out curve
  async function smoothScroll(fromY, toY, durationSec, cursorFrom, cursorTo) {
    const steps = Math.max(12, Math.round(durationSec * 20));
    const repeatPerStep = Math.max(1, Math.round((durationSec * FPS) / steps));

    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const curY = Math.round(fromY + (toY - fromY) * ease);

      const curX = cursorFrom && cursorTo ? Math.round(cursorFrom.x + (cursorTo.x - cursorFrom.x) * ease) : 960;
      const curMouseY = cursorFrom && cursorTo ? Math.round(cursorFrom.y + (cursorTo.y - cursorFrom.y) * ease) : 540;

      await page.evaluate(({ scrollY, mx, my }) => {
        window.scrollTo(0, scrollY);
        const cur = document.getElementById('demo-cursor');
        if (cur) {
          cur.style.left = mx + 'px';
          cur.style.top = my + 'px';
        }
      }, { scrollY: curY, mx: curX, my: curMouseY });

      await sendFrame(repeatPerStep);
    }
  }

  // Cursor glide helper without scrolling
  async function glideCursor(fromX, fromY, toX, toY, durationSec) {
    const steps = Math.max(8, Math.round(durationSec * 16));
    const repeatPerStep = Math.max(1, Math.round((durationSec * FPS) / steps));

    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      const curX = Math.round(fromX + (toX - fromX) * ease);
      const curY = Math.round(fromY + (toY - fromY) * ease);

      await setCursor(curX, curY);
      await sendFrame(repeatPerStep);
    }
  }

  // Click animation on element
  async function clickAnimation(x, y) {
    await page.evaluate(({ cx, cy }) => {
      const clickRipple = document.createElement('div');
      clickRipple.style.position = 'fixed';
      clickRipple.style.zIndex = '9999998';
      clickRipple.style.left = (cx - 15) + 'px';
      clickRipple.style.top = (cy - 15) + 'px';
      clickRipple.style.width = '30px';
      clickRipple.style.height = '30px';
      clickRipple.style.borderRadius = '50%';
      clickRipple.style.border = '2px solid #a4161a';
      clickRipple.style.backgroundColor = 'rgba(164, 22, 26, 0.25)';
      clickRipple.style.pointerEvents = 'none';
      clickRipple.id = 'demo-click-ripple';
      document.body.appendChild(clickRipple);
    }, { cx: x, cy: y });
    await sendFrame(6);

    await page.evaluate(() => {
      const r = document.getElementById('demo-click-ripple');
      if (r) r.remove();
    });
  }

  // -------------------------------------------------------------
  // SCENE 1: LANDING PAGE - HERO & FIRST IMPRESSIONS (0:00 - 0:14)
  // -------------------------------------------------------------
  console.log('[Scene 1] Landing Page: Hero & AI Voice Header');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await page.waitForSelector('h1', { timeout: 10000 }).catch(() => {});
  await initCursor(820, 320);

  // Pause at hero for 3.5s (84 frames)
  await sendFrame(84);

  // Glide cursor to CTA button "+ Consult With Doctor"
  await glideCursor(820, 320, 960, 560, 1.8);
  await sendFrame(24);

  // -------------------------------------------------------------
  // SCENE 2: LANDING PAGE - PLATFORM CAPABILITIES & SPECIALISTS (0:14 - 0:30)
  // -------------------------------------------------------------
  console.log('[Scene 2] Landing Page: Platform Capabilities & Specialists');
  await smoothScroll(0, 780, 2.8, { x: 960, y: 560 }, { x: 700, y: 450 });
  await sendFrame(60); // 2.5s pause

  // Smooth scroll down to AI Doctor Specialist Gallery
  await smoothScroll(780, 1550, 3.0, { x: 700, y: 450 }, { x: 800, y: 540 });
  await sendFrame(72); // 3.0s pause on Dr. Elliot, Dr. Sophia, Dr. Sid

  // Smooth scroll back to navbar
  await smoothScroll(1550, 0, 3.0, { x: 800, y: 540 }, { x: 1250, y: 40 });
  await sendFrame(24); // 1.0s

  // Glide cursor to "Sign In" button in top-right navbar
  await glideCursor(1250, 40, 1340, 40, 1.5);
  await clickAnimation(1340, 40);
  await sendFrame(18);

  // -------------------------------------------------------------
  // SCENE 3: SIGN IN PAGE (0:30 - 0:45)
  // -------------------------------------------------------------
  console.log('[Scene 3] Navigating to Sign-In Experience');
  await page.goto('http://localhost:3000/sign-in', { waitUntil: 'networkidle2' });
  await initCursor(960, 350);

  // Pause to view the Slack-style centered auth screen with MediVoice AI logo & Clerk form
  await sendFrame(60); // 2.5s

  // Glide cursor toward the email input
  await glideCursor(960, 350, 960, 480, 1.6);
  await clickAnimation(960, 480);
  await sendFrame(24);

  // Glide cursor toward "Continue / Sign In" button
  await glideCursor(960, 480, 960, 560, 1.6);
  await clickAnimation(960, 560);
  await sendFrame(30);

  // -------------------------------------------------------------
  // SCENE 4: FIRST-TIME SIGN IN & ONBOARDING SETUP MODAL (0:45 - 1:05)
  // -------------------------------------------------------------
  console.log('[Scene 4] Launching First-Time Onboarding Setup Modal');
  await page.goto('http://localhost:3000/dashboard?demo=1&onboarding=1', { waitUntil: 'networkidle2' });
  await initCursor(960, 250);

  // Pause to view the Onboarding Modal: "Personalize Your Profile"
  await sendFrame(72); // 3.0s

  // Move cursor to Full Name input
  await glideCursor(960, 250, 960, 360, 1.5);
  await clickAnimation(960, 360);
  await sendFrame(24);

  // Move cursor to Blood Group & Emergency Contact
  await glideCursor(960, 360, 850, 440, 1.4);
  await clickAnimation(850, 440);
  await sendFrame(20);

  await glideCursor(850, 440, 1080, 440, 1.4);
  await clickAnimation(1080, 440);
  await sendFrame(20);

  // Move cursor to AI Doctor Voice Persona
  await glideCursor(1080, 440, 960, 600, 1.5);
  await clickAnimation(960, 600);
  await sendFrame(24);

  // Move cursor to "Seed sample medical data" checkbox
  await glideCursor(960, 600, 780, 670, 1.4);
  await clickAnimation(780, 670);
  await sendFrame(24);

  // Move cursor to "Complete Setup & Launch Portal" button
  await glideCursor(780, 670, 960, 740, 1.6);
  await clickAnimation(960, 740);
  await sendFrame(36); // 1.5s

  // -------------------------------------------------------------
  // SCENE 5: DASHBOARD - PATIENT COMMAND CENTER (1:05 - 1:22)
  // -------------------------------------------------------------
  console.log('[Scene 5] Transitioning to Active Dashboard Command Center');
  await page.goto('http://localhost:3000/dashboard?demo=1', { waitUntil: 'networkidle0' });
  await page.evaluate(() => window.scrollTo(0, 0));
  await initCursor(500, 180);

  // Pause at top dashboard header
  await sendFrame(72); // 3.0s

  // Glide cursor to Smart Symptom Checker Banner
  await glideCursor(500, 180, 850, 280, 1.8);
  await sendFrame(36);

  // Smooth scroll down to overview widgets: Appointments, Medication, Vitals
  await smoothScroll(0, 480, 2.8, { x: 850, y: 280 }, { x: 960, y: 400 });
  await sendFrame(72); // 3.0s

  // Smooth scroll to Consultation History & SOAP Reports preview
  await smoothScroll(480, 950, 2.8, { x: 960, y: 400 }, { x: 750, y: 500 });
  await sendFrame(60); // 2.5s

  // -------------------------------------------------------------
  // SCENE 6: PRESCRIPTION TRACKER & DAILY DOSE LOGGING (1:22 - 1:40)
  // -------------------------------------------------------------
  console.log('[Scene 6] Navigating to Prescription Tracker & Dose Logging');
  await page.goto('http://localhost:3000/prescriptions?demo=1', { waitUntil: 'networkidle0' });
  await page.evaluate(() => window.scrollTo(0, 0));
  await initCursor(960, 120);

  // Pause on page banner ("Prescription Tracker")
  await sendFrame(72); // 3.0s

  // Glide cursor to Today's Dosage Checklist: Morning Dose (8:00 AM)
  await glideCursor(960, 120, 450, 340, 2.0);
  await sendFrame(36); // 1.5s

  // Glide to "Mark Taken" button on Morning Dose slot
  await glideCursor(450, 340, 580, 370, 1.4);
  await clickAnimation(580, 370);
  await sendFrame(36); // 1.5s

  // Smooth scroll down to Active Prescriptions grid (Amoxicillin, Metformin, Pantoprazole, Atorvastatin)
  await smoothScroll(0, 450, 2.6, { x: 580, y: 370 }, { x: 650, y: 480 });
  // Pause to view doses progress bars (1/30, 4/30) and doctor instructions
  await sendFrame(72); // 3.0s

  // -------------------------------------------------------------
  // SCENE 7: HEALTH VITALS MONITOR (1:40 - 1:52)
  // -------------------------------------------------------------
  console.log('[Scene 7] Navigating to Health Vitals Monitor');
  await page.goto('http://localhost:3000/vitals?demo=1', { waitUntil: 'networkidle0' });
  await page.evaluate(() => window.scrollTo(0, 0));
  await initCursor(500, 140);

  // Pause on vital stat cards: Heart rate, BP, Blood Oxygen, Glucose
  await sendFrame(72); // 3.0s

  // Glide cursor across metrics
  await glideCursor(500, 140, 1100, 220, 2.0);
  await sendFrame(36); // 1.5s

  // Smooth scroll down to vital logs & trends table
  await smoothScroll(0, 450, 2.4, { x: 1100, y: 220 }, { x: 800, y: 450 });
  await sendFrame(48); // 2.0s

  // -------------------------------------------------------------
  // SCENE 8: DOCTOR APPOINTMENTS (1:52 - 2:04)
  // -------------------------------------------------------------
  console.log('[Scene 8] Navigating to Doctor Appointments');
  await page.goto('http://localhost:3000/appointments?demo=1', { waitUntil: 'networkidle0' });
  await page.evaluate(() => window.scrollTo(0, 0));
  await initCursor(600, 150);

  // Pause on doctor appointment cards and booking slots
  await sendFrame(72); // 3.0s

  // Smooth scroll through booking options
  await smoothScroll(0, 380, 2.4, { x: 600, y: 150 }, { x: 850, y: 380 });
  await sendFrame(48); // 2.0s

  // -------------------------------------------------------------
  // SCENE 9: NEARBY CARE & MEDICINE DELIVERY (2:04 - 2:16)
  // -------------------------------------------------------------
  console.log('[Scene 9] Navigating to Nearby Care & Medicine Delivery');
  await page.goto('http://localhost:3000/nearby?demo=1', { waitUntil: 'networkidle0' });
  await page.evaluate(() => window.scrollTo(0, 0));
  await initCursor(700, 160);

  // Pause on nearby pharmacies & 20-30m Express delivery tracker
  await sendFrame(72); // 3.0s

  // Smooth scroll down to delivery tracker & pharmacy cards
  await smoothScroll(0, 420, 2.4, { x: 700, y: 160 }, { x: 900, y: 460 });
  await sendFrame(48); // 2.0s

  // -------------------------------------------------------------
  // SCENE 10: PATIENT PROFILE & ABOUT (2:16 - 2:32)
  // -------------------------------------------------------------
  console.log('[Scene 10] Navigating to Patient Profile & About');
  await page.goto('http://localhost:3000/profile?demo=1', { waitUntil: 'networkidle0' });
  await page.evaluate(() => window.scrollTo(0, 0));
  await initCursor(600, 180);

  // Pause on Verified Patient profile, Blood group, Emergency contact & AI Voice Accent
  await sendFrame(72); // 3.0s

  // Smooth scroll down to HIPAA security box
  await smoothScroll(0, 400, 2.2, { x: 600, y: 180 }, { x: 750, y: 400 });
  await sendFrame(48); // 2.0s

  // Navigate to About Page
  await page.goto('http://localhost:3000/about?demo=1', { waitUntil: 'networkidle0' });
  await page.evaluate(() => window.scrollTo(0, 0));
  await initCursor(960, 400);

  // Final closing pause on About page & MediVoice AI mission
  await sendFrame(84); // 3.5s

  // Finalize
  console.log('Finalizing video stream...');
  py.stdin.end();
  await new Promise(resolve => py.on('close', resolve));
  await browser.close();

  // Also copy to artifacts directory for easy embedding
  const artifactDest = '/Users/sandy/.gemini/antigravity/brain/621ee443-1356-4e14-9831-1019265087ad/medivoice_demo_walkthrough.mp4';
  try {
    fs.copyFileSync(OUTPUT_VIDEO, artifactDest);
    console.log(`Copied video to artifacts directory: ${artifactDest}`);
  } catch (err) {
    console.warn('Artifact copy warning:', err.message);
  }

  const stats = fs.statSync(OUTPUT_VIDEO);
  console.log(`Video created successfully! Size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
  console.log('--- MediVoice AI Demo Video Generation Complete ---');
})();
