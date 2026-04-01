import { generateArithmeticBasicQuestions } from "./arithmetic-basic";

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

    default:
      throw new Error(`Unsupported engine: ${ruleJson.engine}`);
  }
}