/**
 * NEUROSHIFT — Resilient Local Database Layer
 * Supports Node.js 22+ native node:sqlite with automatic fallback to JSON persistence.
 * Zero external compilation dependencies.
 */

const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const SQLITE_FILE = path.join(DB_DIR, 'neuroshift.db');
const JSON_FILE = path.join(DB_DIR, 'neuroshift_store.json');

class LocalDB {
  constructor() {
    this.useSqlite = false;
    this.sqliteDb = null;
    this.memoryData = {
      profile: {
        id: 1,
        displayName: 'کاربر',
        targetDays: 90,
        reminderTime: '08:00',
        highRiskAlert: true,
        autoGamma: true,
        deepFocusFriction: false,
        startDate: new Date(Date.now() - 18 * 86400 * 1000).toISOString() // default: 18 days in
      },
      incidents: [
        {
          id: 1,
          timestamp: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
          timeSlot: '00:00 – 06:00 (شب دیرهنگام)',
          trigger: 'محیط پرریسک (تختخواب + تنهایی)',
          tag: 'FRICTION',
          type: 'warn',
          title: 'شکاف اصطکاک شناسایی شد',
          analysis: 'تخریب بازداری شناختی شبانه‌روزی؛ تلفن همراه در دسترس در بستر خواب بدون ناظر'
        },
        {
          id: 2,
          timestamp: new Date(Date.now() - 96 * 3600 * 1000).toISOString(),
          timeSlot: '18:00 – 24:00 (شب)',
          trigger: 'استرس یا اضطراب',
          tag: 'CORTISOL',
          type: 'crit',
          title: 'اشباع کورتیزول — ۱۸٪ بالاتر از پایه',
          analysis: 'افزایش کورتیزول کاری منجر به جستجوی پاداش فوری دوپامینی شد'
        },
        {
          id: 3,
          timestamp: new Date(Date.now() - 180 * 3600 * 1000).toISOString(),
          timeSlot: '00:00 – 06:00 (شب دیرهنگام)',
          trigger: 'بی‌حوصلگی',
          tag: 'PATTERN',
          type: 'info',
          title: 'الگوی شبانه‌روزی — ۰۰:۰۰–۰۳:۰۰ منطقه قرمز',
          analysis: 'افت قند خون و خستگی مزمن؛ لزوم اعمال خاموشی دیجیتال'
        }
      ],
      stroop_sessions: [],
      sigh_sessions: [],
      friction_events: []
    };

    this.init();
  }

  init() {
    try {
      const { DatabaseSync } = require('node:sqlite');
      this.sqliteDb = new DatabaseSync(SQLITE_FILE);
      this.useSqlite = true;
      this.setupSqliteTables();
      console.log('[DB] Initialized with native node:sqlite engine at:', SQLITE_FILE);
      return;
    } catch (e) {
      console.log('[DB] node:sqlite not loaded (' + e.message + '), falling back to atomic JSON database.');
    }

    // JSON fallback
    if (fs.existsSync(JSON_FILE)) {
      try {
        const raw = fs.readFileSync(JSON_FILE, 'utf8');
        this.memoryData = Object.assign(this.memoryData, JSON.parse(raw));
      } catch (err) {
        console.warn('[DB] Could not parse json db, using defaults:', err.message);
      }
    } else {
      this.saveJson();
    }
  }

  setupSqliteTables() {
    this.sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS profile (
        id INTEGER PRIMARY KEY,
        displayName TEXT,
        targetDays INTEGER,
        reminderTime TEXT,
        highRiskAlert INTEGER,
        autoGamma INTEGER,
        deepFocusFriction INTEGER,
        startDate TEXT
      );

      CREATE TABLE IF NOT EXISTS incidents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT,
        timeSlot TEXT,
        trigger TEXT,
        tag TEXT,
        type TEXT,
        title TEXT,
        analysis TEXT
      );

      CREATE TABLE IF NOT EXISTS stroop_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT,
        score INTEGER,
        total INTEGER,
        accuracy REAL,
        avgReactionTimeMs REAL
      );

      CREATE TABLE IF NOT EXISTS sigh_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT,
        cycles INTEGER,
        completed INTEGER
      );

      CREATE TABLE IF NOT EXISTS friction_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT,
        actionId TEXT,
        actionTitle TEXT
      );
    `);

    // Seed profile if empty
    const row = this.sqliteDb.prepare('SELECT COUNT(*) as count FROM profile').get();
    if (row.count === 0) {
      this.sqliteDb.prepare(`
        INSERT INTO profile (id, displayName, targetDays, reminderTime, highRiskAlert, autoGamma, deepFocusFriction, startDate)
        VALUES (1, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        this.memoryData.profile.displayName,
        this.memoryData.profile.targetDays,
        this.memoryData.profile.reminderTime,
        this.memoryData.profile.highRiskAlert ? 1 : 0,
        this.memoryData.profile.autoGamma ? 1 : 0,
        this.memoryData.profile.deepFocusFriction ? 1 : 0,
        this.memoryData.profile.startDate
      );

      // Seed initial incidents
      for (const inc of this.memoryData.incidents) {
        this.sqliteDb.prepare(`
          INSERT INTO incidents (timestamp, timeSlot, trigger, tag, type, title, analysis)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(inc.timestamp, inc.timeSlot, inc.trigger, inc.tag, inc.type, inc.title, inc.analysis);
      }
    }
  }

  saveJson() {
    try {
      fs.writeFileSync(JSON_FILE, JSON.stringify(this.memoryData, null, 2), 'utf8');
    } catch (e) {
      console.error('[DB] Error writing JSON db:', e);
    }
  }

  getProfile() {
    if (this.useSqlite) {
      const row = this.sqliteDb.prepare('SELECT * FROM profile WHERE id = 1').get();
      if (row) {
        return {
          id: row.id,
          displayName: row.displayName,
          targetDays: row.targetDays,
          reminderTime: row.reminderTime,
          highRiskAlert: Boolean(row.highRiskAlert),
          autoGamma: Boolean(row.autoGamma),
          deepFocusFriction: Boolean(row.deepFocusFriction),
          startDate: row.startDate
        };
      }
    }
    return this.memoryData.profile;
  }

  updateProfile(updates) {
    if (this.useSqlite) {
      const current = this.getProfile();
      const updated = { ...current, ...updates };
      this.sqliteDb.prepare(`
        UPDATE profile SET
          displayName = ?,
          targetDays = ?,
          reminderTime = ?,
          highRiskAlert = ?,
          autoGamma = ?,
          deepFocusFriction = ?,
          startDate = ?
        WHERE id = 1
      `).run(
        updated.displayName,
        updated.targetDays,
        updated.reminderTime,
        updated.highRiskAlert ? 1 : 0,
        updated.autoGamma ? 1 : 0,
        updated.deepFocusFriction ? 1 : 0,
        updated.startDate
      );
      return updated;
    }

    this.memoryData.profile = { ...this.memoryData.profile, ...updates };
    this.saveJson();
    return this.memoryData.profile;
  }

  getIncidents(limit = 20) {
    if (this.useSqlite) {
      return this.sqliteDb.prepare('SELECT * FROM incidents ORDER BY id DESC LIMIT ?').all(limit);
    }
    return [...this.memoryData.incidents].sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, limit);
  }

  addIncident({ timeSlot, trigger, tag = 'FRICTION', type = 'warn', title, analysis }) {
    const timestamp = new Date().toISOString();
    if (this.useSqlite) {
      const res = this.sqliteDb.prepare(`
        INSERT INTO incidents (timestamp, timeSlot, trigger, tag, type, title, analysis)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(timestamp, timeSlot, trigger, tag, type, title, analysis);
      return { id: Number(res.lastInsertRowid), timestamp, timeSlot, trigger, tag, type, title, analysis };
    }

    const newEntry = {
      id: Date.now(),
      timestamp,
      timeSlot,
      trigger,
      tag,
      type,
      title,
      analysis
    };
    this.memoryData.incidents.unshift(newEntry);
    this.saveJson();
    return newEntry;
  }

  addStroopSession({ score, total, accuracy, avgReactionTimeMs }) {
    const timestamp = new Date().toISOString();
    if (this.useSqlite) {
      const res = this.sqliteDb.prepare(`
        INSERT INTO stroop_sessions (timestamp, score, total, accuracy, avgReactionTimeMs)
        VALUES (?, ?, ?, ?, ?)
      `).run(timestamp, score, total, accuracy, avgReactionTimeMs);
      return { id: Number(res.lastInsertRowid), timestamp, score, total, accuracy, avgReactionTimeMs };
    }

    const session = { id: Date.now(), timestamp, score, total, accuracy, avgReactionTimeMs };
    this.memoryData.stroop_sessions.push(session);
    this.saveJson();
    return session;
  }

  getStroopStats() {
    if (this.useSqlite) {
      const row = this.sqliteDb.prepare(`
        SELECT COUNT(*) as count, AVG(accuracy) as avgAcc, AVG(avgReactionTimeMs) as avgRT, SUM(score) as sumScore
        FROM stroop_sessions
      `).get();
      return {
        totalSessions: row.count || 0,
        accuracy: row.avgAcc || 0.9,
        avgReactionTimeMs: row.avgRT || 480,
        totalScore: row.sumScore || 0
      };
    }

    const count = this.memoryData.stroop_sessions.length;
    if (count === 0) return { totalSessions: 0, accuracy: 0.9, avgReactionTimeMs: 480, totalScore: 0 };
    const avgAcc = this.memoryData.stroop_sessions.reduce((acc, s) => acc + s.accuracy, 0) / count;
    const avgRT = this.memoryData.stroop_sessions.reduce((acc, s) => acc + s.avgReactionTimeMs, 0) / count;
    const sumScore = this.memoryData.stroop_sessions.reduce((acc, s) => acc + s.score, 0);
    return { totalSessions: count, accuracy: avgAcc, avgReactionTimeMs: avgRT, totalScore: sumScore };
  }

  addSighSession({ cycles, completed }) {
    const timestamp = new Date().toISOString();
    if (this.useSqlite) {
      const res = this.sqliteDb.prepare(`
        INSERT INTO sigh_sessions (timestamp, cycles, completed)
        VALUES (?, ?, ?)
      `).run(timestamp, cycles, completed ? 1 : 0);
      return { id: Number(res.lastInsertRowid), timestamp, cycles, completed };
    }

    const entry = { id: Date.now(), timestamp, cycles, completed };
    this.memoryData.sigh_sessions.push(entry);
    this.saveJson();
    return entry;
  }

  addFrictionEvent({ actionId, actionTitle }) {
    const timestamp = new Date().toISOString();
    if (this.useSqlite) {
      const res = this.sqliteDb.prepare(`
        INSERT INTO friction_events (timestamp, actionId, actionTitle)
        VALUES (?, ?, ?)
      `).run(timestamp, actionId, actionTitle);
      return { id: Number(res.lastInsertRowid), timestamp, actionId, actionTitle };
    }

    const entry = { id: Date.now(), timestamp, actionId, actionTitle };
    this.memoryData.friction_events.push(entry);
    this.saveJson();
    return entry;
  }
}

module.exports = new LocalDB();
