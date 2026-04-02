export type GeneratedQuestion = {
  prompt: string;
  answer: string;
};

type DecimalRules = {
  operation: "addition" | "subtraction" | "multiplication" | "division";
  min_whole: number;
  max_whole: number;
  min_whole_b?: number;
  max_whole_b?: number;
  decimal_places: number;
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
  rules: DecimalRules;
};

export function generateDecimalsBasicQuestions(
  ruleJson: TemplateRuleJson
): GeneratedQuestion[] {
  const questions: GeneratedQuestion[] = [];
  const seen = new Set<string>();

  const count = ruleJson.question_count;
  const rules = ruleJson.rules;

  while (questions.length < count) {
    const a = generateDecimal(
      rules.min_whole,
      rules.max_whole,
      rules.decimal_places
    );

    const b = generateDecimal(
      rules.min_whole_b ?? rules.min_whole,
      rules.max_whole_b ?? rules.max_whole,
      rules.decimal_places
    );

    let prompt = "";
    let answer = "";
    let key = "";

    if (rules.operation === "addition") {
      prompt = `${formatNumber(a, rules.decimal_places)} + ${formatNumber(
        b,
        rules.decimal_places
      )} = _____`;
      answer = formatNumber(a + b, rules.decimal_places);
      key = `${a}+${b}`;
    }

    if (rules.operation === "subtraction") {
      if (rules.non_negative_only && a < b) {
        continue;
      }

      prompt = `${formatNumber(a, rules.decimal_places)} - ${formatNumber(
        b,
        rules.decimal_places
      )} = _____`;
      answer = formatNumber(a - b, rules.decimal_places);
      key = `${a}-${b}`;
    }

    if (rules.operation === "multiplication") {
      prompt = `${formatNumber(a, rules.decimal_places)} × ${formatNumber(
        b,
        rules.decimal_places
      )} = _____`;
      answer = formatNumber(a * b, rules.decimal_places * 2);
      key = `${a}*${b}`;
    }

    if (rules.operation === "division") {
      if (b === 0) continue;

      if (rules.exact_division_only) {
        const quotient = a;
        const divisor = b;
        const dividend = roundToPlaces(
          quotient * divisor,
          rules.decimal_places
        );

        prompt = `${formatNumber(
          dividend,
          rules.decimal_places
        )} ÷ ${formatNumber(divisor, rules.decimal_places)} = _____`;
        answer = formatNumber(quotient, rules.decimal_places);
        key = `${dividend}/${divisor}`;
      } else {
        prompt = `${formatNumber(a, rules.decimal_places)} ÷ ${formatNumber(
          b,
          rules.decimal_places
        )} = _____`;
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

function generateDecimal(
  minWhole: number,
  maxWhole: number,
  decimalPlaces: number
) {
  const whole = randomInt(minWhole, maxWhole);
  const scale = Math.pow(10, decimalPlaces);
  const decimalPart = randomInt(0, scale - 1);
  return roundToPlaces(whole + decimalPart / scale, decimalPlaces);
}

function roundToPlaces(value: number, decimalPlaces: number) {
  return Number(value.toFixed(decimalPlaces));
}

function formatNumber(value: number, decimalPlaces: number) {
  return value.toFixed(decimalPlaces);
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}