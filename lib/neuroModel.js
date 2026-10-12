/**
 * NEUROSHIFT — Cognitive & Neurobiological Computation Engine
 * ============================================================
 * Based on empirical neuroscience and addiction medicine literature:
 * 1. Eric J. Nestler (2001, 2011) - DeltaFosB molecular switch & transcriptional memory
 * 2. Nora D. Volkow et al. (1997, 2002, 2011) - Striatal Dopamine D2 Receptor (D2R) down-regulation & resensitization
 * 3. Goldstein & Volkow (2011) - Hypofrontality & Prefrontal Cortex (PFC/ACC) top-down inhibitory degradation
 * 4. G. Alan Marlatt (1985) - Abstinence Violation Effect (AVE) & Non-punitive relapse prevention
 * 5. Daniel M. Wegner (1994) - Ironic Process Theory & the counter-productivity of hyper-vigilant counters
 * 6. Andrew Huberman & David Spiegel (Cell Reports Medicine, 2023) - Cyclic Physiological Sigh & Autonomic Nervous Balance
 * 7. Sancar et al. (PNAS) - Circadian rhythm disruption & SCN-mediated prefrontal vulnerability
 */

class NeuroModel {
  /**
   * DeltaFosB half-life is ~9 days (k = ln(2)/9 ≈ 0.07701)
   * Chronic high levels cause stable chromatin remodeling in D1-MSNs in Nucleus Accumbens.
   * As clean days progress, DeltaFosB decays exponentially toward baseline.
   */
  static calculateDeltaFosB(cleanDays, recentLapseSeverity = 0) {
    const base = 10.0; // Baseline healthy physiological level (arbitrary units)
    const peak = 95.0; // Peak addiction state
    const k_decay = 0.07701; // Decay rate constant per day

    let current = base + (peak - base) * Math.exp(-k_decay * cleanDays);
    if (recentLapseSeverity > 0) {
      current = Math.min(100.0, current + recentLapseSeverity * 15.0);
    }
    return Math.round(current * 10) / 10;
  }

  /**
   * Dopamine D2 Receptor (D2R) Availability
   * Chronic super-normal stimulation downregulates D2R density in striatum to 40-50%.
   * Resensitization exhibits asymptotic saturation:
   * D2(t) = D2_min + (D2_max - D2_min) * (1 - exp(-t / tau_d2))
   * tau_d2 ≈ 28 days (4 weeks to reach ~63% recovery, ~90% at 90 days).
   */
  static calculateD2Availability(cleanDays, lapseCount = 0) {
    const D2_min = 34.0; // Downregulated minimum (%)
    const D2_max = 96.0; // Normal homeostasis ceiling (%)
    const tau_d2 = 28.0;

    let recovery = D2_min + (D2_max - D2_min) * (1 - Math.exp(-cleanDays / tau_d2));
    
    // Recent lapses apply mild acute internalization of receptors, but do not destroy structural regeneration
    if (lapseCount > 0) {
      const acuteDamping = Math.min(15.0, lapseCount * 4.5);
      recovery = Math.max(D2_min, recovery - acuteDamping);
    }
    return Math.round(recovery * 10) / 10;
  }

  /**
   * Prefrontal Cortex (PFC) Gray Matter & Top-Down Executive Inhibition Capacity
   * Evaluated via baseline structural recovery + functional engagement (Stroop cognitive test).
   */
  static calculatePFCDensity(cleanDays, stroopStats = { total: 0, accuracy: 1.0, avgReactionTimeMs: 450 }) {
    const pfc_base_min = 38.0;
    const pfc_base_max = 94.0;
    const tau_pfc = 35.0;

    const structuralRecovery = pfc_base_min + (pfc_base_max - pfc_base_min) * (1 - Math.exp(-cleanDays / tau_pfc));

    // Dynamic boost from active cognitive resistance exercises (Stroop saturation)
    let functionalMultiplier = 1.0;
    if (stroopStats.total > 0) {
      const accScore = Math.min(1.0, Math.max(0.4, stroopStats.accuracy));
      // Fast reaction time (<600ms) with high accuracy signifies robust Anterior Cingulate Cortex activation
      const speedFactor = Math.min(1.2, Math.max(0.8, 600 / Math.max(300, stroopStats.avgReactionTimeMs)));
      functionalMultiplier = 0.85 + 0.15 * (accScore * speedFactor);
    }

    const finalPFC = Math.min(99.0, Math.max(45.0, structuralRecovery * functionalMultiplier));
    return Math.round(finalPFC * 10) / 10;
  }

  /**
   * Circadian Vulnerability Risk Matrix
   * Prefrontal cortex glucose metabolism and executive control drop sharply during the biological night (SCN low point).
   * Hours 00:00 - 05:00: Highest risk (High amygdala reactivity, depleted inhibitory reserve).
   * Hours 06:00 - 12:00: Lowest risk (Cortisol awakening response, high vigilance).
   * Hours 12:00 - 18:00: Moderate risk (Post-prandial dip / afternoon fatigue).
   * Hours 18:00 - 24:00: Elevated risk (Evening social fatigue, circadian wind-down).
   */
  static getCircadianRisk(currentHour = new Date().getHours()) {
    const slots = [
      { range: "00:00 – 06:00", label: "۰۰–۰۶", riskScore: 84, level: "high", color: "rose", desc: "منطقه قرمز — افت شدید گلوکز پیش‌پیشانی و اوج تحریک‌پذیری سیستم لیمبیک" },
      { range: "06:00 – 12:00", label: "۰۶–۱۲", riskScore: 22, level: "low", color: "emerald", desc: "منطقه سبز — پیک کورتیزول بیداری، هوشیاری و اراده حداکثری" },
      { range: "12:00 – 18:00", label: "۱۲–۱۸", riskScore: 45, level: "medium", color: "amber", desc: "منطقه زرد — افت قند میانه روز و خستگی شناختی خفیف" },
      { range: "18:00 – 24:00", label: "۱۸–۲۴", riskScore: 71, level: "high", color: "rose", desc: "منطقه هشدار — خستگی تصمیم‌گیری پس از فعالیت و تنهایی محیطی" }
    ];

    let activeSlotIndex = 0;
    if (currentHour >= 0 && currentHour < 6) activeSlotIndex = 0;
    else if (currentHour >= 6 && currentHour < 12) activeSlotIndex = 1;
    else if (currentHour >= 12 && currentHour < 18) activeSlotIndex = 2;
    else activeSlotIndex = 3;

    return {
      currentHour,
      activeSlot: slots[activeSlotIndex],
      allSlots: slots
    };
  }

  /**
   * Neural Integrity Index (NII)
   * Anti-Marlatt non-punitive formula.
   * Moving rolling synthesis: 45% D2 receptor availability + 35% PFC density + 20% Habitual consistency.
   * If a lapse occurs, NII drops by a bounded physical increment (10-18 pts) representing acute receptor fatigue,
   * preserving 70-85% of accumulated neuroplastic rewiring.
   */
  static calculateNII({ cleanDays, d2Availability, pfcDensity, totalUrgesNeutralized = 0, recentLapses = [] }) {
    const d2Component = d2Availability * 0.45;
    const pfcComponent = pfcDensity * 0.35;
    const consistencyComponent = Math.min(20.0, (cleanDays * 0.5) + (totalUrgesNeutralized * 0.8));

    let baseNII = d2Component + pfcComponent + consistencyComponent;

    // Acute lapse friction deduction
    const now = Date.now();
    let lapseDeduction = 0;
    for (const lapse of recentLapses) {
      const hoursAgo = (now - new Date(lapse.timestamp).getTime()) / (1000 * 3600);
      if (hoursAgo < 72) {
        // Impact decays over 72 hours as acute neurochemical equilibrium returns
        const decayFactor = 1 - (hoursAgo / 72.0);
        lapseDeduction += 12.0 * decayFactor;
      }
    }

    const finalNII = cleanDays === 0 ? 25.0 : Math.max(25.0, Math.min(99.4, baseNII - lapseDeduction));
    return Math.round(finalNII * 10) / 10;
  }

  /**
   * Diurnal Neuroendocrine Biomarkers
   * Computes expected fluctuations based on time of day and clean streak.
   */
  static getBiomarkers(currentHour = new Date().getHours(), cleanDays = 1) {
    // Normal cortisol peaks around 08:00 (Cortisol Awakening Response) and drops at night
    let cortisolDelta = "+0%";
    let cortisolStatus = "good";
    // Acute stress of Day 0 vs adapted baseline
    if (cleanDays === 0) {
      return {
        cortisol: { value: "↑ 58%", status: "warn" },
        prolactin: { value: "↑ 42%", status: "warn" }
      };
    }

    if (currentHour >= 6 && currentHour <= 9) {
      cortisolDelta = "↑ 24% (پیک طبیعی بیداری)";
      cortisolStatus = "good";
    } else if (currentHour >= 23 || currentHour <= 4) {
      cortisolDelta = "↑ 18% (ریسک شبانه)";
      cortisolStatus = "warn";
    } else {
      cortisolDelta = "↓ 5% (سطح پایه)";
      cortisolStatus = "good";
    }

    // Prolactin stays low in healthy baseline, spikes post-orgasm (inhibiting dopamine)
    let prolactinDelta = "↓ 14% (تثبیت)";
    let prolactinStatus = "good";
    if (cleanDays < 2) {
      prolactinDelta = "↑ 22% (بالا)";
      prolactinStatus = "warn";
    }

    return {
      cortisol: { value: cortisolDelta, status: cortisolStatus },
      prolactin: { value: prolactinDelta, status: prolactinStatus }
    };
  }

  /**
   * Generates mathematical Dopamine Curve Simulation points
   * Outputs 120 high-fidelity points across time domain.
   */
  static generateDopamineCurves(mode = "stable", cleanDays = 14) {
    const pointsCount = 120;
    const stableCurve = [];
    const crashCurve = [];
    const userCurve = [];

    for (let i = 0; i < pointsCount; i++) {
      const t = (i / pointsCount) * Math.PI * 4;
      
      // 1. Stable Baseline: healthy oscillatory tonic dopamine with minor phasic pulses
      const stableY = 0.50 + Math.sin(t * 0.5) * 0.04 + Math.sin(t * 1.3) * 0.02;
      stableCurve.push({ x: i, y: Math.max(0, Math.min(1, stableY)) });

      // 2. Addiction Loop: massive spike (+400%) -> immediate rapid receptor internalization -> catastrophic sub-baseline dip (dysphoria)
      let crashY = 0.50;
      const normalizedI = i / pointsCount;
      if (normalizedI < 0.20) {
        crashY = 0.50 + (normalizedI / 0.20) * 0.45; // Extreme spike to 0.95
      } else if (normalizedI < 0.35) {
        const fallRatio = (normalizedI - 0.20) / 0.15;
        crashY = 0.95 - fallRatio * 0.85; // Sharp crash to 0.10 (severe deficit)
      } else {
        const recoveryRatio = (normalizedI - 0.35) / 0.65;
        crashY = 0.10 + Math.pow(recoveryRatio, 0.7) * 0.22; // Very slow and depressed baseline
      }
      crashCurve.push({ x: i, y: Math.max(0, Math.min(1, crashY)) });

      // 3. User Trajectory: dynamic curve reflecting current clean days
      const progress = Math.min(1.0, cleanDays / 60.0);
      const userBaseline = 0.32 + progress * 0.22; // Grows from 0.32 to 0.54
      const userY = userBaseline + Math.sin(t * 0.6 + 0.5) * (0.03 * (1 - progress * 0.5));
      userCurve.push({ x: i, y: Math.max(0, Math.min(1, userY)) });
    }

    return {
      pointsCount,
      stable: stableCurve,
      crash: crashCurve,
      user: userCurve,
      currentMode: mode
    };
  }

  /**
   * Root cause debrief analysis for Black Box entries (Aviation safety style)
   */
  static analyzeIncident({ timeSlot, trigger, haltState = {}, frictionGaps = [] }) {
    const analysis = {
      primaryVulnerability: "",
      physiologicalDriver: "",
      frictionDeficit: "",
      prescribedProtocol: ""
    };

    if (timeSlot && timeSlot.includes("00:00") || timeSlot && timeSlot.includes("شب")) {
      analysis.primaryVulnerability = "تخریب بازداری شناختی شبانه‌روزی (Circadian Inhibitory Failure)";
      analysis.physiologicalDriver = "افت دمای مرکزی بدن و کاهش گلیکوژن در کورتکس پیشانی که مقاومت تکانشی را مسدود کرده است.";
    } else {
      analysis.primaryVulnerability = "تحریک تکانشی واکنشی (Cue-Reactive Dopamine Spike)";
      analysis.physiologicalDriver = "فعال‌سازی مسیر جستجوی ناخودآگاه توسط محرک اولیه.";
    }

    if (trigger === "استرس یا اضطراب") {
      analysis.physiologicalDriver += " افزایش کورتیزول باعث شده مغز به دنبال اثر تسکین‌بخش فوری دوپامین باشد.";
      analysis.prescribedProtocol = "پروتکل ۵ چرخه تنفس فیزیولوژیک هاب‌من + تماس با آب سرد (فعال‌سازی عصب واگ)";
    } else if (trigger === "بی‌حوصلگی") {
      analysis.physiologicalDriver += " کمبود دوپامین تونیک پایه؛ مغز تلاش کرده برای فرار از بی‌حوصلگی یک پالس غیرطبیعی ایجاد کند.";
      analysis.prescribedProtocol = "تغییر فوری محیط فیزیکی، ۱۰ دقیقه پیاده‌روی بدون تلفن همراه، یا تمرین استروپ";
    } else if (trigger === "محیط پرریسک (تختخواب + تنهایی)") {
      analysis.frictionDeficit = "نبود اصطکاک فیزیکی — تلفن همراه در دسترس و موقعیت بدون ناظر";
      analysis.prescribedProtocol = "قانون انتقال دستگاه به خارج از اتاق خواب هنگام خوابیدن + روشن کردن چراغ اصلی";
    } else {
      analysis.prescribedProtocol = "قطع فوری حلقه محرک، ۵ دقیقه تنفس عمیق و ثبت مشاهدات بدون سرزنش اخلاقی";
    }

    return analysis;
  }
}

module.exports = NeuroModel;
