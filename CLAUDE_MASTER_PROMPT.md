# 🧠 NeuroShift — Master Product Blueprint & Agent System Prompt
> **Role & Persona for AI Coding Agent (Claude Code / Autonomous Dev Agent):**
> You are a world-class Principal Software Architect and Neurobiology Systems Engineer. You are tasked with engineering **NeuroShift**, a science-backed, privacy-first behavioral rewiring platform designed to overcome porn and masturbation compulsive habits by leveraging modern neuroplasticity research, cognitive behavioral therapy (CBT), and dopamine system resensitization.

---

## 🎯 Executive Vision & Core Philosophy

Conventional addiction counters fail because they rely on:
1. **Moralistic Guilt & Shaming:** Activating cortisol and self-loathing, which perversely drives the user right back into the habit loop for emotional relief.
2. **The "What-The-Hell" Effect (Marlatt's Fallacy):** Resetting a 30-day streak back to 0% after a single slip convinces the brain that all prior neural progress was erased, triggering multi-day binge relapses.
3. **Passive Counting:** Counting days without actively interrupting acute dopamine cravings or rewiring the prefrontal cortex (PFC).

### The NeuroShift Doctrine:
* **Neuroplasticity First:** A slip is treated as a single behavioral data point, NOT a complete loss of neural adaptation.
* **Dual-Metric Engine:** The user tracks both their active **Current Clean Streak** and their **Neuroplasticity Recovery Index (NRI)** (the percentage of clean days over the last 30/90 rolling window).
* **Active Interception:** When urges spike, the app hijacks the visual working memory and resets autonomic arousal before the limbic system overrides rational choice.
* **100% Local-First & Zero-Telemetry:** Compulsive habits demand absolute confidentiality. Zero user data leaves the client device.

---

## 🔬 Scientific Foundations & Research Anchors

1. **Visual Working Memory Hijacking (Plymouth University — Skorka-Brown et al., 2014):**
   * Sexual cravings require visual imagery within the visuospatial sketchpad.
   * Engaging the user in a 2 to 3-minute spatially demanding visual task (e.g., Tetris or dynamic block manipulation) saturates working memory capacity, terminating dopamine anticipation.

2. **Marlatt's Cognitive-Behavioral Relapse Prevention (Dr. G. Alan Marlatt):**
   * Differentiates a "lapse" (single mistake) from a "relapse" (resumption of compulsive pattern).
   * Relapse analysis via the **HALT Matrix** (Hungry, Angry, Lonely, Tired) pinpoints physiological deficits rather than moral weakness.

3. **Autonomic Reset via Physiological Sigh (Dr. Andrew Huberman, Stanford Neurobiology):**
   * Two rapid nasal inhalations followed by an extended, slow oral exhalation immediately unloads alveolar carbon dioxide, activates the parasympathetic vagus nerve, and lowers heart rate.

4. **Urge Surfing Dynamics:**
   * Neurochemical surges peak within 10 to 15 minutes and naturally subside if no new external stimuli or mental indulgence fuel them.

5. **Molecular Neurobiology of Compulsion (Nestler Lab, Mount Sinai):**
   * Compulsive supernormal stimulation induces the accumulation of transcription factor **ΔFosB (Delta-FosB)** in the nucleus accumbens, which maintains craving hypersensitivity.
   * Clearing ΔFosB and resensitizing dopamine D2 receptor density requires an unbroken period of 60 to 90 days of baseline regulation.

---

## 🛠 Product Architecture & Features

### 1. Neural Monitor Dashboard (Surface: Monitor)
* **Real-time Synaptic Stopwatch:** Days, Hours, Minutes, Seconds.
* **NRI (Neuroplasticity Recovery Index):** Mathematical formula: `(Clean Days in Last 30 Days / 30) × 100%`.
* **Biological Recovery Tiers:**
  * **Tier 1 (Days 1–3):** Baseline Stabilization & Acute Withdrawal Navigation.
  * **Tier 2 (Days 4–7):** Androgen Receptor Upregulation & Mental Fog Clearance.
  * **Tier 3 (Days 8–14):** Prefrontal Dendritic Growth & Impulse Control Strengthening.
  * **Tier 4 (Days 15–30):** Dopamine D2 Receptor Resensitization.
  * **Tier 5 (Days 31–60):** Habit Loop Disruption & Basal Ganglia Rewiring.
  * **Tier 6 (Days 90+):** Full ΔFosB Clearance & Prefrontal Mastery (Rewired).
* **Daily Science Micro-Dose:** Rotating peer-reviewed insights on neurochemistry and behavioral adaptation.

### 2. The SOS Emergency Interceptor (3-Stage Rescue Protocol)
Triggered instantly via a prominent, floating panic button:
* **Stage 1 — Autonomic Grounding:** Animated visual pacer executing 5 cycles of the Physiological Sigh.
* **Stage 2 — Cognitive Spatial Hijack:** Embedded playable mini-game (Neuro-Blocks / Tetris) with a 2-minute countdown timer designed to saturate visual working memory.
* **Stage 3 — Environmental Friction Shift:** Actionable physical directives (e.g., leaving the room, drinking cold water, pushups, face splash).

### 3. Non-Punitive Relapse Audit (HALT Assessment)
* **Tone:** Supportive, analytical, completely free of shame or alarms.
* **Data Logged:**
  * Internal Physiological State: Hungry, Angry/Stressed, Lonely, Tired/Sleep-deprived.
  * External Environmental Friction: Phone in bed, late-night doomscrolling, isolation.
* **Output:** Logs the event, adjusts streak, updates the NRI rolling percentage, and provides insight into the user's primary trigger pattern.

### 4. Data Privacy & Local-First Storage
* **Storage Engine:** LocalStorage / IndexedDB (Web) or local encrypted SQLite (Desktop).
* **Backup/Restore:** Single-click JSON export and import.
* **Zero Telemetry:** No Google Analytics, no third-party trackers, no remote databases.

---

## 💻 Tech Stack & Deployment Blueprint

* **Web Edition:** Pure modern HTML5 / CSS3 / Vanilla JS (or Vite + React/Svelte + Tailwind) as an offline-capable PWA.
* **Desktop Edition (Windows):** **Tauri v2** (Rust backend + lightweight webview frontend) or **Electron** for zero overhead, low RAM consumption, and native OS notifications.
* **CI/CD Automation:** GitHub Actions matrix workflow compiling stripped `.exe` binaries on `windows-latest` with SHA256 release checksums.
