import { generateArithmeticBasicQuestions } from "./arithmetic-basic";
import { generateDecimalsBasicQuestions } from "./decimals-basic";
import { generateFractionsBasicQuestions } from "./fractions-basic";

type RuleJson = {
  engine?: string;
  question_count?: number;
  layout?: {
    type?: string;
  };
  rules?: Record<string, unknown>;
};

export function generateQuestionsFromTemplate(ruleJson: RuleJson) {
  if (!ruleJson?.engine) {
    throw new Error("Missing engine in rule_json");
  }

  switch (ruleJson.engine) {
    case "arithmetic_basic":
      return generateArithmeticBasicQuestions(
        ruleJson as Parameters<typeof generateArithmeticBasicQuestions>[0]
      );

    case "decimals_basic":
      return generateDecimalsBasicQuestions(
        ruleJson as Parameters<typeof generateDecimalsBasicQuestions>[0]
      );

    case "fractions_basic":
      return generateFractionsBasicQuestions(
        ruleJson as Parameters<typeof generateFractionsBasicQuestions>[0]
      );

    default:
      throw new Error(`Unsupported engine: ${ruleJson.engine}`);
  }
}