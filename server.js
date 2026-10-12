/**
 * NEUROSHIFT — Core API & Clinical Telemetry Server
 * Built with native Node.js HTTP & SQLite for zero-friction cross-platform execution.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const db = require('./lib/db');
const NeuroModel = require('./lib/neuroModel');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1e6) { // 1MB limit
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function computeTelemetry() {
  const profile = db.getProfile();
  const incidents = db.getIncidents(10);
  const stroopStats = db.getStroopStats();

  // Calculate clean days
  const startMs = new Date(profile.startDate).getTime();
  const nowMs = Date.now();
  const cleanDays = Math.max(0, Math.floor((nowMs - startMs) / (1000 * 86400)));

  // Calculate recent lapses (incidents with type 'crit')
  const recentLapses = incidents.filter(inc => inc.type === 'crit');

  const d2Availability = NeuroModel.calculateD2Availability(cleanDays, recentLapses.length);
  const pfcDensity = NeuroModel.calculatePFCDensity(cleanDays, stroopStats);
  const deltaFosB = NeuroModel.calculateDeltaFosB(cleanDays, recentLapses.length > 0 ? 1 : 0);
  const nii = NeuroModel.calculateNII({
    cleanDays,
    d2Availability,
    pfcDensity,
    totalUrgesNeutralized: stroopStats.totalSessions,
    recentLapses
  });

  const currentHour = new Date().getHours();
  const circadian = NeuroModel.getCircadianRisk(currentHour);
  const biomarkers = NeuroModel.getBiomarkers(currentHour, cleanDays);

  return {
    nii: {
      score: nii,
      label: 'Neural Integrity & Synaptic Stability Index',
      sevenDayDelta: '+3.2',
      description: 'میانگین متحرک تراکم سیناپسی پیش‌پیشانی در ۳۰ روز — مستقل از خطای منفرد',
      percentage: nii
    },
    streak: {
      days: cleanDays,
      targetDays: profile.targetDays,
      phaseTitle: cleanDays >= 90 ? 'تثبیت پایدار نورونی' : cleanDays >= 30 ? 'فاز بازسازی دندریتی' : 'سم‌زدایی گیرنده‌های D2',
      progressRatio: Math.min(1.0, cleanDays / Math.max(1, profile.targetDays))
    },
    receptors: {
      d2: { value: `${d2Availability}%`, numeric: d2Availability, status: d2Availability > 70 ? 'good' : 'warn' },
      pfc: { value: `${pfcDensity}%`, numeric: pfcDensity, status: pfcDensity > 75 ? 'good' : 'warn' },
      deltaFosB: { value: `${deltaFosB}`, numeric: deltaFosB, status: deltaFosB < 30 ? 'good' : 'warn' },
      cortisol: biomarkers.cortisol,
      prolactin: biomarkers.prolactin
    },
    circadian,
    profile,
    stroopStats
  };
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  // ─── API ROUTES ───
  if (pathname.startsWith('/api/')) {
    try {
      // 1. GET /api/status - Live telemetry
      if (pathname === '/api/status' && method === 'GET') {
        const telemetry = computeTelemetry();
        sendJson(res, 200, { success: true, data: telemetry });
        return;
      }

      // 2. GET /api/dopamine/simulation - Dopamine curve
      if (pathname === '/api/dopamine/simulation' && method === 'GET') {
        const mode = parsedUrl.searchParams.get('mode') || 'stable';
        const profile = db.getProfile();
        const startMs = new Date(profile.startDate).getTime();
        const cleanDays = Math.max(0, Math.floor((Date.now() - startMs) / (1000 * 86400)));
        const curves = NeuroModel.generateDopamineCurves(mode, cleanDays);
        sendJson(res, 200, { success: true, data: curves });
        return;
      }

      // 3. POST /api/emergency/stroop - Record Stroop session
      if (pathname === '/api/emergency/stroop' && method === 'POST') {
        const body = await parseJsonBody(req);
        const { score = 0, total = 0, accuracy = 0, avgReactionTimeMs = 500 } = body;
        const session = db.addStroopSession({
          score: Number(score),
          total: Number(total),
          accuracy: Number(accuracy),
          avgReactionTimeMs: Number(avgReactionTimeMs)
        });
        const telemetry = computeTelemetry();
        sendJson(res, 200, {
          success: true,
          message: 'جلسه تمرین استروپ ثبت شد؛ قشر قدامی کمربندی (ACC) درگیر شد.',
          data: { session, updatedTelemetry: telemetry }
        });
        return;
      }

      // 4. POST /api/emergency/sigh - Record Physiological Sigh
      if (pathname === '/api/emergency/sigh' && method === 'POST') {
        const body = await parseJsonBody(req);
        const { cycles = 5, completed = true } = body;
        const session = db.addSighSession({ cycles: Number(cycles), completed: Boolean(completed) });
        sendJson(res, 200, {
          success: true,
          message: 'پروتکل تنفس فیزیولوژیک ثبت شد؛ عصب واگ تحریک و تون سمپاتیک تعدیل گردید.',
          data: session
        });
        return;
      }

      // 5. POST /api/emergency/friction - Record friction checklist
      if (pathname === '/api/emergency/friction' && method === 'POST') {
        const body = await parseJsonBody(req);
        const { actionId = 'generic', actionTitle = 'اصطکاک محیطی' } = body;
        const entry = db.addFrictionEvent({ actionId, actionTitle });
        sendJson(res, 200, {
          success: true,
          message: 'اصطکاک فیزیکی فعال شد.',
          data: entry
        });
        return;
      }

      // 6. GET /api/blackbox - List debrief incidents
      if (pathname === '/api/blackbox' && method === 'GET') {
        const limit = Number(parsedUrl.searchParams.get('limit')) || 20;
        const incidents = db.getIncidents(limit);
        sendJson(res, 200, { success: true, data: incidents });
        return;
      }

      // 7. POST /api/blackbox - Log debrief incident & get root cause analysis
      if (pathname === '/api/blackbox' && method === 'POST') {
        const body = await parseJsonBody(req);
        const { timeSlot = '12:00 – 18:00', trigger = 'ناشناخته' } = body;

        const analysisResult = NeuroModel.analyzeIncident({ timeSlot, trigger });
        
        let tag = 'FRICTION';
        let type = 'warn';
        let title = `رویداد ثبت شد — ${trigger}`;

        if (trigger.includes('استرس')) {
          tag = 'CORTISOL';
          type = 'crit';
          title = 'اشباع کورتیزول و تکانه پاداش';
        } else if (trigger.includes('تختخواب') || trigger.includes('محیط')) {
          tag = 'FRICTION';
          type = 'warn';
          title = 'شکاف اصطکاک محیطی';
        } else if (timeSlot.includes('00:00')) {
          tag = 'PATTERN';
          type = 'info';
          title = 'آسیب‌پذیری ریتم شبانه‌روزی';
        }

        const incident = db.addIncident({
          timeSlot,
          trigger,
          tag,
          type,
          title,
          analysis: `${analysisResult.primaryVulnerability} | ${analysisResult.physiologicalDriver}`
        });

        const updatedTelemetry = computeTelemetry();

        sendJson(res, 201, {
          success: true,
          message: 'رویداد در جعبه سیاه ضبط شد (فاقد قضاوت اخلاقی؛ ثبت داده هوانوردی).',
          data: {
            incident,
            rootCause: analysisResult,
            updatedTelemetry
          }
        });
        return;
      }

      // 8. GET /api/settings - User profile
      if (pathname === '/api/settings' && method === 'GET') {
        const profile = db.getProfile();
        sendJson(res, 200, { success: true, data: profile });
        return;
      }

      // 9. PUT /api/settings - Update profile
      if (pathname === '/api/settings' && method === 'PUT') {
        const body = await parseJsonBody(req);
        const updated = db.updateProfile(body);
        sendJson(res, 200, { success: true, message: 'تنظیمات ذخیره شد.', data: updated });
        return;
      }

      // 404 for unknown API
      sendJson(res, 404, { success: false, error: 'Endpoint not found' });
      return;

    } catch (apiErr) {
      console.error('[API Error]', apiErr);
      sendJson(res, 500, { success: false, error: apiErr.message });
      return;
    }
  }

  // ─── STATIC FILE SERVING ───
  let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '') safePath = '/index.html';

  const filePath = path.join(PUBLIC_DIR, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for SPA routes
      const indexPath = path.join(PUBLIC_DIR, 'index.html');
      fs.readFile(indexPath, (indexErr, content) => {
        if (indexErr) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(content);
        }
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600'
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

if (require.main === module) {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n======================================================`);
    console.log(`🧠 NEUROSHIFT Scientific Telemetry Engine`);
    console.log(`📡 Server running at http://localhost:${PORT}`);
    console.log(`======================================================\n`);
  });
}

module.exports = server;
