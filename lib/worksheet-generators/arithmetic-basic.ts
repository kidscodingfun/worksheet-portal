type ArithmeticRules = {
  operation: "addition" | "subtraction" | "multiplication" | "division";
  min_a: number;
  max_a: number;
  min_b: number;
  max_b: number;
  carry_required?: boolean;
  borrow_required?: boolean;
  non_negative_only?: boolean;
  exact_division_only?: boolean;
  unique_questions?: boolean;
};

type TemplateRuleJson = {
  engine: string;
  question_count: number;
  layout?: {
    type?: string;
  };
  rules: ArithmeticRules;
};

export type GeneratedQuestion = {
  prompt: string;
  answer: string;
};

export function generateArithmeticBasicQuestions(
  ruleJson: TemplateRuleJson
): GeneratedQuestion[] {
  const questions: GeneratedQuestion[] = [];
  const seen = new Set<string>();

  const count = ruleJson.question_count;
  const rules = ruleJson.rules;

  while (questions.length < count) {
    const a = randomInt(rules.min_a, rules.max_a);
    const b = randomInt(rules.min_b, rules.max_b);

    let prompt = "";
    let answer = "";
    let key = "";

    if (rules.operation === "addition") {
      const hasCarry = (a % 10) + (b % 10) >= 10;
      if (
        typeof rules.carry_required === "boolean" &&
        hasCarry !== rules.carry_required
      ) {
        continue;
      }

      prompt = `${a} + ${b} = _____`;
      answer = String(a + b);
      key = `${a}+${b}`;
    }

    if (rules.operation === "subtraction") {
      const top = a;
      const bottom = b;

      if (rules.non_negative_only && top < bottom) {
        continue;
      }

      const hasBorrow = (top % 10) < (bottom % 10);
      if (
        typeof rules.borrow_required === "boolean" &&
        hasBorrow !== rules.borrow_required
      ) {
        continue;
      }

      prompt = `${top} - ${bottom} = _____`;
      answer = String(top - bottom);
      key = `${top}-${bottom}`;
    }

    if (rules.operation === "multiplication") {
      prompt = `${a} × ${b} = _____`;
      answer = String(a * b);
      key = `${a}*${b}`;
    }

    if (rules.operation === "division") {
      if (b === 0) continue;

      if (rules.exact_division_only) {
        const quotient = a;
        const divisor = b;
        const dividend = quotient * divisor;

        prompt = `${dividend} ÷ ${divisor} = _____`;
        answer = String(quotient);
        key = `${dividend}/${divisor}`;
      } else {
        prompt = `${a} ÷ ${b} = _____`;
        answer = String(a / b);
        key = `${a}/${b}`;
      }
    }

    if (!prompt) continue;

    if (rules.unique_questions && seen.has(key)) {
      continue;
    }

    seen.add(key);
    questions.push({ prompt, answer });
  }

  return questions;
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}