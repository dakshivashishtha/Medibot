/**
 * Symptom -> Condition classifier (Bernoulli Naive Bayes)
 * ------------------------------------------------------
 * A small machine-learning model written from scratch (no external ML library).
 *
 * HOW IT WORKS
 * 1. Training data: synthetic "patients" are generated from the typical symptom
 *    pattern of each condition (see CONDITIONS below). A seeded random number
 *    generator makes the data, and therefore the model, reproducible.
 * 2. Training: for every condition c and symptom s the model learns
 *    theta[c][s] = P(symptom s present | condition c), using Laplace smoothing.
 * 3. Prediction: for the symptoms the user selected, each condition gets a score
 *    log P(c) + sum(log theta[c][s]). Scores are turned into relative
 *    probabilities with a softmax.
 *
 * DESIGN CHOICES (mention these in your report)
 * - Only symptoms the user REPORTS are used at prediction time. A symptom that
 *   was not selected is "not reported", not "confirmed absent".
 * - Priors are uniform because the synthetic class balance is arbitrary.
 *
 * LIMITATIONS (be honest about these in your report)
 * - The training data is synthetic, built from general medical knowledge. It is
 *   NOT real patient data and has NOT been clinically validated.
 * - Output probabilities are relative likelihoods among the conditions this model
 *   knows about, not real-world clinical probabilities.
 * - It is an educational decision-support demo, not a diagnostic tool.
 */

// ---------------------------------------------------------------------------
// Vocabulary
// ---------------------------------------------------------------------------

export interface SymptomDef {
  id: string;
  label: string;
}

export const SYMPTOMS: SymptomDef[] = [
  { id: "fever", label: "Fever" },
  { id: "chills", label: "Chills" },
  { id: "cough", label: "Cough" },
  { id: "sore_throat", label: "Sore throat" },
  { id: "runny_nose", label: "Runny nose" },
  { id: "sneezing", label: "Sneezing" },
  { id: "nasal_congestion", label: "Blocked nose" },
  { id: "headache", label: "Headache" },
  { id: "nausea", label: "Nausea" },
  { id: "vomiting", label: "Vomiting" },
  { id: "diarrhea", label: "Diarrhea" },
  { id: "abdominal_pain", label: "Abdominal pain" },
  { id: "fatigue", label: "Fatigue / weakness" },
  { id: "body_aches", label: "Body aches" },
  { id: "joint_pain", label: "Joint pain" },
  { id: "rash", label: "Skin rash" },
  { id: "itchy_eyes", label: "Itchy or watery eyes" },
  { id: "light_sensitivity", label: "Sensitivity to light" },
  { id: "shortness_of_breath", label: "Shortness of breath" },
  { id: "wheezing", label: "Wheezing" },
  { id: "chest_tightness", label: "Chest tightness" },
  { id: "heartburn", label: "Heartburn" },
  { id: "sour_taste", label: "Sour taste / regurgitation" },
  { id: "frequent_urination", label: "Frequent urination" },
  { id: "burning_urination", label: "Burning while urinating" },
  { id: "pelvic_pain", label: "Lower abdominal / pelvic pain" },
  { id: "increased_thirst", label: "Increased thirst" },
  { id: "blurred_vision", label: "Blurred vision" },
  { id: "weight_loss", label: "Unintended weight loss" },
  { id: "weight_gain", label: "Unexplained weight gain" },
  { id: "pale_skin", label: "Pale skin" },
  { id: "dizziness", label: "Dizziness" },
  { id: "loss_of_appetite", label: "Loss of appetite" },
  { id: "sweating", label: "Heavy sweating" },
  { id: "pain_behind_eyes", label: "Pain behind the eyes" },
  { id: "constipation", label: "Constipation" },
  { id: "cold_intolerance", label: "Feeling cold easily" },
  { id: "dry_skin", label: "Dry skin" },
];

/** Symptoms that should trigger an immediate "seek urgent care" warning. */
export const RED_FLAG_SYMPTOMS: string[] = ["shortness_of_breath", "chest_tightness"];

export interface ConditionDef {
  id: string;
  name: string;
  /** Type of doctor a patient could discuss this with. */
  specialist: string;
  /** One-line plain-language description. */
  summary: string;
  /** P(symptom present | condition): the typical presentation. */
  symptomProbs: Record<string, number>;
}

export const CONDITIONS: ConditionDef[] = [
  {
    id: "common_cold",
    name: "Common cold",
    specialist: "General Physician",
    summary: "A mild viral infection of the nose and throat.",
    symptomProbs: { runny_nose: 0.85, sneezing: 0.7, sore_throat: 0.65, nasal_congestion: 0.75, cough: 0.6, headache: 0.3, fatigue: 0.35, fever: 0.15, body_aches: 0.2 },
  },
  {
    id: "influenza",
    name: "Influenza (flu)",
    specialist: "General Physician",
    summary: "A viral infection with sudden fever, body aches and tiredness.",
    symptomProbs: { fever: 0.9, chills: 0.65, body_aches: 0.8, headache: 0.65, fatigue: 0.8, cough: 0.75, sore_throat: 0.4, runny_nose: 0.35, nasal_congestion: 0.3, loss_of_appetite: 0.4 },
  },
  {
    id: "allergic_rhinitis",
    name: "Allergic rhinitis (hay fever)",
    specialist: "General Physician / ENT",
    summary: "An allergic reaction causing sneezing, runny nose and itchy eyes.",
    symptomProbs: { sneezing: 0.9, runny_nose: 0.85, itchy_eyes: 0.8, nasal_congestion: 0.7, headache: 0.25, cough: 0.25, fatigue: 0.2 },
  },
  {
    id: "migraine",
    name: "Migraine",
    specialist: "General Physician / Neurologist",
    summary: "Recurring severe headaches, often with nausea and light sensitivity.",
    symptomProbs: { headache: 0.98, nausea: 0.6, light_sensitivity: 0.8, vomiting: 0.3, dizziness: 0.25, fatigue: 0.3, blurred_vision: 0.15 },
  },
  {
    id: "gastroenteritis",
    name: "Gastroenteritis (stomach infection)",
    specialist: "General Physician",
    summary: "Stomach and gut infection causing diarrhea, vomiting and cramps.",
    symptomProbs: { diarrhea: 0.9, vomiting: 0.7, nausea: 0.8, abdominal_pain: 0.75, fever: 0.4, body_aches: 0.3, fatigue: 0.5, loss_of_appetite: 0.5, headache: 0.2 },
  },
  {
    id: "typhoid",
    name: "Typhoid fever",
    specialist: "General Physician",
    summary: "A bacterial infection with prolonged fever and abdominal symptoms.",
    symptomProbs: { fever: 0.95, headache: 0.6, abdominal_pain: 0.6, loss_of_appetite: 0.65, constipation: 0.4, diarrhea: 0.3, fatigue: 0.7, nausea: 0.3, rash: 0.15 },
  },
  {
    id: "dengue",
    name: "Dengue fever",
    specialist: "General Physician",
    summary: "A mosquito-borne viral fever with severe headache and joint or muscle pain.",
    symptomProbs: { fever: 0.95, headache: 0.8, pain_behind_eyes: 0.6, joint_pain: 0.7, body_aches: 0.8, rash: 0.45, nausea: 0.5, vomiting: 0.3, fatigue: 0.7 },
  },
  {
    id: "malaria",
    name: "Malaria",
    specialist: "General Physician",
    summary: "A mosquito-borne infection with cycles of fever, chills and sweating.",
    symptomProbs: { fever: 0.95, chills: 0.85, sweating: 0.7, headache: 0.7, nausea: 0.5, vomiting: 0.4, body_aches: 0.55, fatigue: 0.6 },
  },
  {
    id: "asthma",
    name: "Asthma",
    specialist: "General Physician / Pulmonologist",
    summary: "A long-term airway condition causing wheezing and breathlessness.",
    symptomProbs: { shortness_of_breath: 0.85, wheezing: 0.9, cough: 0.7, chest_tightness: 0.75, fatigue: 0.2 },
  },
  {
    id: "gerd",
    name: "Acid reflux (GERD)",
    specialist: "General Physician / Gastroenterologist",
    summary: "Stomach acid flowing back into the food pipe, causing heartburn.",
    symptomProbs: { heartburn: 0.9, sour_taste: 0.75, chest_tightness: 0.2, cough: 0.2, nausea: 0.25, abdominal_pain: 0.3 },
  },
  {
    id: "uti",
    name: "Urinary tract infection (UTI)",
    specialist: "General Physician",
    summary: "An infection of the urinary system causing burning and frequent urination.",
    symptomProbs: { burning_urination: 0.9, frequent_urination: 0.85, pelvic_pain: 0.55, fever: 0.25, nausea: 0.15, fatigue: 0.2 },
  },
  {
    id: "diabetes",
    name: "Diabetes (high blood sugar)",
    specialist: "General Physician / Endocrinologist",
    summary: "High blood sugar causing thirst, frequent urination and tiredness. Needs a blood test to confirm.",
    symptomProbs: { increased_thirst: 0.8, frequent_urination: 0.8, fatigue: 0.6, blurred_vision: 0.4, weight_loss: 0.25, dry_skin: 0.15 },
  },
  {
    id: "anemia",
    name: "Iron-deficiency anemia",
    specialist: "General Physician",
    summary: "Low red blood cells from low iron, causing tiredness and pale skin. Needs a blood test to confirm.",
    symptomProbs: { fatigue: 0.9, pale_skin: 0.75, dizziness: 0.6, shortness_of_breath: 0.3, headache: 0.3, cold_intolerance: 0.3 },
  },
  {
    id: "hypothyroidism",
    name: "Hypothyroidism (underactive thyroid)",
    specialist: "General Physician / Endocrinologist",
    summary: "A slow thyroid causing tiredness, weight gain and feeling cold. Needs a blood test to confirm.",
    symptomProbs: { fatigue: 0.85, weight_gain: 0.7, cold_intolerance: 0.7, dry_skin: 0.6, constipation: 0.5 },
  },
];

// ---------------------------------------------------------------------------
// Synthetic training data
// ---------------------------------------------------------------------------

/** Small seeded PRNG so results are reproducible (mulberry32). */
export function makeRng(seed: number): () => number {
  let a = seed | 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface Patient {
  conditionId: string;
  /** Symptom ids present in this patient. */
  symptoms: string[];
}

/**
 * Generate synthetic patients. Each listed symptom appears with its typical
 * probability; every other symptom appears with a small noise probability so
 * the model does not learn that unlisted symptoms are impossible.
 */
export function generatePatients(
  perCondition: number,
  seed = 42,
  noise = 0.02,
): Patient[] {
  const rng = makeRng(seed);
  const patients: Patient[] = [];

  for (const cond of CONDITIONS) {
    let made = 0;
    while (made < perCondition) {
      const present: string[] = [];
      for (const s of SYMPTOMS) {
        const p = cond.symptomProbs[s.id] ?? noise;
        if (rng() < p) present.push(s.id);
      }
      // A patient with fewer than 2 symptoms is not informative; resample.
      if (present.length >= 2) {
        patients.push({ conditionId: cond.id, symptoms: present });
        made++;
      }
    }
  }
  return patients;
}

// ---------------------------------------------------------------------------
// Model
// ---------------------------------------------------------------------------

export interface NaiveBayesModel {
  symptomIds: string[];
  conditionIds: string[];
  /** theta[c][s] = P(symptom s present | condition c) */
  theta: number[][];
  trainingSize: number;
}

/** Train a Bernoulli Naive Bayes model with Laplace smoothing. */
export function train(patients: Patient[], alpha = 1): NaiveBayesModel {
  const symptomIds = SYMPTOMS.map((s) => s.id);
  const conditionIds = CONDITIONS.map((c) => c.id);
  const sIndex = new Map(symptomIds.map((id, i) => [id, i]));
  const cIndex = new Map(conditionIds.map((id, i) => [id, i]));

  const counts: number[][] = conditionIds.map(() => symptomIds.map(() => 0));
  const classTotals: number[] = conditionIds.map(() => 0);

  for (const p of patients) {
    const c = cIndex.get(p.conditionId);
    if (c === undefined) continue;
    classTotals[c]++;
    for (const sid of p.symptoms) {
      const s = sIndex.get(sid);
      if (s !== undefined) counts[c][s]++;
    }
  }

  const theta = counts.map((row, c) =>
    row.map((count) => (count + alpha) / (classTotals[c] + 2 * alpha)),
  );

  return { symptomIds, conditionIds, theta, trainingSize: patients.length };
}

export interface Prediction {
  conditionId: string;
  name: string;
  specialist: string;
  summary: string;
  /** Relative likelihood among the conditions known to the model (0 to 1). */
  probability: number;
  /** Selected symptoms that are typical for this condition. */
  matchedSymptoms: string[];
}

/**
 * Rank conditions for the given reported symptoms.
 * Unknown symptom ids are ignored. Returns [] when no known symptom is given.
 *
 * `temperature` softens the probabilities. Naive Bayes is known to be
 * over-confident because it treats symptoms as independent, so the app uses a
 * temperature above 1 for display. The ranking does not change with temperature.
 */
export function predict(
  model: NaiveBayesModel,
  reportedSymptomIds: string[],
  topK = 3,
  temperature = 1,
): Prediction[] {
  const sIndex = new Map(model.symptomIds.map((id, i) => [id, i]));
  const known = Array.from(new Set(reportedSymptomIds)).filter((id) => sIndex.has(id));
  if (known.length === 0) return [];

  // Uniform prior, so the prior term is the same for every condition and cancels out.
  const logScores = model.theta.map((row) =>
    known.reduce((sum, id) => sum + Math.log(row[sIndex.get(id) as number]), 0),
  );

  // Softmax with temperature (subtract the max for numerical stability).
  const max = Math.max(...logScores);
  const exps = logScores.map((v) => Math.exp((v - max) / temperature));
  const total = exps.reduce((a, b) => a + b, 0);

  const symptomLabel = new Map(SYMPTOMS.map((s) => [s.id, s.label]));

  return model.conditionIds
    .map((condId, c) => {
      const def = CONDITIONS.find((x) => x.id === condId) as ConditionDef;
      return {
        conditionId: condId,
        name: def.name,
        specialist: def.specialist,
        summary: def.summary,
        probability: exps[c] / total,
        matchedSymptoms: known
          .filter((id) => (model.theta[c][sIndex.get(id) as number] ?? 0) >= 0.3)
          .map((id) => symptomLabel.get(id) ?? id),
      };
    })
    .sort((a, b) => b.probability - a.probability)
    .slice(0, topK);
}

/** Convenience: train on a fixed synthetic dataset. Deterministic. */
export function buildDefaultModel(): NaiveBayesModel {
  return train(generatePatients(300, 42));
}

// ---------------------------------------------------------------------------
// Evaluation
// ---------------------------------------------------------------------------

export interface EvaluationResult {
  trainSize: number;
  testSize: number;
  top1Accuracy: number;
  top3Accuracy: number;
  perCondition: { name: string; top1: number; top3: number; n: number }[];
}

/**
 * Hold-out evaluation. The model is trained on 80% of the synthetic patients and
 * tested on the other 20%. For each test patient only a random 2 to 4 of their
 * symptoms are revealed, which imitates a user who reports just a few symptoms.
 *
 * NOTE: test data comes from the same synthetic generator as the training data,
 * so these numbers are optimistic. They show the model learned the patterns it
 * was given; they are not proof of real-world clinical accuracy.
 */
export function evaluate(perCondition = 300, seed = 42): EvaluationResult {
  const rng = makeRng(seed + 1);
  const all = generatePatients(perCondition, seed);

  // Shuffle (Fisher-Yates), then split 80/20.
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  const cut = Math.floor(all.length * 0.8);
  const trainSet = all.slice(0, cut);
  const testSet = all.slice(cut);
  const model = train(trainSet);

  const stats = new Map<string, { top1: number; top3: number; n: number }>();
  for (const c of CONDITIONS) stats.set(c.id, { top1: 0, top3: 0, n: 0 });

  let top1 = 0;
  let top3 = 0;

  for (const p of testSet) {
    // Reveal a random subset of 2 to 4 symptoms.
    const shuffled = [...p.symptoms];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const reveal = Math.min(shuffled.length, 2 + Math.floor(rng() * 3));
    const preds = predict(model, shuffled.slice(0, reveal), 3);

    const s = stats.get(p.conditionId) as { top1: number; top3: number; n: number };
    s.n++;
    if (preds[0]?.conditionId === p.conditionId) {
      top1++;
      s.top1++;
    }
    if (preds.some((x) => x.conditionId === p.conditionId)) {
      top3++;
      s.top3++;
    }
  }

  return {
    trainSize: trainSet.length,
    testSize: testSet.length,
    top1Accuracy: top1 / testSet.length,
    top3Accuracy: top3 / testSet.length,
    perCondition: CONDITIONS.map((c) => {
      const s = stats.get(c.id) as { top1: number; top3: number; n: number };
      return {
        name: c.name,
        n: s.n,
        top1: s.n ? s.top1 / s.n : 0,
        top3: s.n ? s.top3 / s.n : 0,
      };
    }),
  };
}
