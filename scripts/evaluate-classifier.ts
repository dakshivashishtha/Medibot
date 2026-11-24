// Run with:  npx tsx scripts/evaluate-classifier.ts
import { evaluate, CONDITIONS, SYMPTOMS } from "../lib/symptomClassifier";

const r = evaluate();
console.log("Symptom classifier: Bernoulli Naive Bayes (synthetic data)");
console.log(`Conditions: ${CONDITIONS.length} | Symptoms: ${SYMPTOMS.length}`);
console.log(`Train: ${r.trainSize} | Test: ${r.testSize} (2-4 symptoms revealed per test patient)`);
console.log(`Top-1 accuracy: ${(r.top1Accuracy * 100).toFixed(1)}%`);
console.log(`Top-3 accuracy: ${(r.top3Accuracy * 100).toFixed(1)}%\n`);
for (const c of r.perCondition) {
  console.log(
    `${c.name.padEnd(40)} top1 ${(c.top1 * 100).toFixed(0).padStart(3)}%  top3 ${(c.top3 * 100).toFixed(0).padStart(3)}%  (n=${c.n})`,
  );
}
console.log("\nNote: test data comes from the same synthetic generator as the training data,");
console.log("so these numbers are optimistic and are not real-world clinical accuracy.");
