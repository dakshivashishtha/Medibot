import { NextRequest, NextResponse } from "next/server";
import {
  buildDefaultModel,
  predict,
  SYMPTOMS,
  RED_FLAG_SYMPTOMS,
  NaiveBayesModel,
} from "@/lib/symptomClassifier";

// Train once per server instance. Training is deterministic and takes milliseconds.
let model: NaiveBayesModel | null = null;
function getModel(): NaiveBayesModel {
  if (!model) model = buildDefaultModel();
  return model;
}

const VALID_IDS = new Set(SYMPTOMS.map((s) => s.id));
const DISPLAY_TEMPERATURE = 3; // softens Naive Bayes over-confidence

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const symptoms: unknown = body?.symptoms;

    if (!Array.isArray(symptoms) || !symptoms.every((s) => typeof s === "string")) {
      return NextResponse.json(
        { error: "symptoms must be an array of symptom ids" },
        { status: 400 },
      );
    }

    const selected = Array.from(new Set(symptoms as string[])).filter((id) =>
      VALID_IDS.has(id),
    );

    if (selected.length < 2) {
      return NextResponse.json(
        { error: "Please select at least 2 symptoms for a meaningful result." },
        { status: 400 },
      );
    }
    if (selected.length > 15) {
      return NextResponse.json(
        { error: "Please select at most 15 symptoms." },
        { status: 400 },
      );
    }

    const predictions = predict(getModel(), selected, 3, DISPLAY_TEMPERATURE);
    const redFlags = selected.filter((id) => RED_FLAG_SYMPTOMS.includes(id));

    return NextResponse.json({
      predictions,
      urgentWarning:
        redFlags.length > 0
          ? "You selected a symptom that can be serious (shortness of breath or chest tightness). If it is severe, sudden, or getting worse, call emergency services (108 / 112 / 911) now instead of relying on this tool."
          : null,
      model: {
        type: "Bernoulli Naive Bayes",
        trainedOn: "synthetic data",
        conditionsKnown: getModel().conditionIds.length,
      },
    });
  } catch (error) {
    console.error("symptom-predict error:", error);
    return NextResponse.json({ error: "Prediction failed" }, { status: 500 });
  }
}
