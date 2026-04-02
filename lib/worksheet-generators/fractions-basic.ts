export type GeneratedQuestion = {
  prompt: string;
  answer: string;
};

type FractionOperation =
  | "equivalent"
  | "compare"
  | "simplify"
  | "add"
  | "subtract"
  | "improper_to_mixed"
  | "mixed_to_improper";

type FractionRules = {
  operation: FractionOperation;
  min_numerator?: number;
  max_numerator?: number;
  min_denominator: number;
  max_denominator: number;
  like_denominators_only?: boolean;
  proper_only?: boolean;
  simplify_answers?: boolean;
  non_negative_only?: boolean;
  unique_questions?: boolean;
};

type TemplateRuleJson = {
  engine: string;
  question_count: number;
  layout?: {
    type?: string;
  };
  rules: FractionRules;
};

type Fraction = {
  numerator: number;
  denominator: number;
};

export function generateFractionsBasicQuestions(
  ruleJson: TemplateRuleJson
): GeneratedQuestion[] {
  const questions: GeneratedQuestion[] = [];
  const seen = new Set<string>();

  const count = ruleJson.question_count;
  const rules = ruleJson.rules;

  while (questions.length < count) {
    let prompt = "";
    let answer = "";
    let key = "";

    if (rules.operation === "equivalent") {
      const base = generateFraction(rules);
      const simplifiedBase = simplify(base);
      const multiplier = randomInt(2, 6);

      const equivalent = {
        numerator: simplifiedBase.numerator * multiplier,
        denominator: simplifiedBase.denominator * multiplier,
      };

      prompt = `${formatFraction(simplifiedBase)} = _____ / ${equivalent.denominator}`;
      answer = String(equivalent.numerator);
      key = `equivalent:${simplifiedBase.numerator}/${simplifiedBase.denominator}:${equivalent.denominator}`;
    }

    if (rules.operation === "compare") {
      const a = generateFraction(rules);
      const b = generateFraction(rules);

      if (sameFraction(a, b)) continue;

      prompt = `${formatFraction(a)}  ___  ${formatFraction(b)}`;
      answer = compareFractions(a, b);
      key = `compare:${a.numerator}/${a.denominator}:${b.numerator}/${b.denominator}`;
    }

   if (rules.operation === "simplify") {
  const simplified = generateFraction({
    ...rules,
    proper_only: rules.proper_only ?? false,
  });

  let multiplierMin = 2;
  let multiplierMax = 4;

  if (rules.max_denominator >= 10) {
    multiplierMax = 6;
  }

  if (rules.max_denominator >= 16) {
    multiplierMax = 8;
  }

  const multiplier = randomInt(multiplierMin, multiplierMax);

  const unsimplified = {
    numerator: simplified.numerator * multiplier,
    denominator: simplified.denominator * multiplier,
  };

  prompt = `Simplify ${formatRawFraction(unsimplified)}`;
  answer = formatFraction(simplified);
  key = `simplify:${unsimplified.numerator}/${unsimplified.denominator}`;
}

    if (rules.operation === "add") {
      const a = generateFraction(rules);
      const b = generateFractionForOperation(rules, a);

      const result = addFractions(a, b);
      const finalResult = rules.simplify_answers === false ? result : simplify(result);

      prompt = `${formatFraction(a)} + ${formatFraction(b)} = _____`;
      answer = formatFraction(finalResult);
      key = `add:${a.numerator}/${a.denominator}:${b.numerator}/${b.denominator}`;
    }

    if (rules.operation === "subtract") {
      const a = generateFraction(rules);
      const b = generateFractionForOperation(rules, a);

      if (rules.non_negative_only) {
        const diff = fractionToNumber(a) - fractionToNumber(b);
        if (diff < 0) continue;
      }

      const result = subtractFractions(a, b);
      if (result.numerator < 0) continue;

      const finalResult = rules.simplify_answers === false ? result : simplify(result);

      prompt = `${formatFraction(a)} - ${formatFraction(b)} = _____`;
      answer = formatFraction(finalResult);
      key = `subtract:${a.numerator}/${a.denominator}:${b.numerator}/${b.denominator}`;
    }

    if (rules.operation === "improper_to_mixed") {
      const denominator = randomInt(rules.min_denominator, rules.max_denominator);
      const whole = randomInt(1, 5);
      const remainder = randomInt(1, denominator - 1);

      const improper = {
        numerator: whole * denominator + remainder,
        denominator,
      };

      prompt = `Convert ${formatFraction(improper)} to a mixed number`;
      answer = improperToMixed(improper);
      key = `improper_to_mixed:${improper.numerator}/${improper.denominator}`;
    }

    if (rules.operation === "mixed_to_improper") {
      const denominator = randomInt(rules.min_denominator, rules.max_denominator);
      const whole = randomInt(1, 5);
      const numerator = randomInt(1, denominator - 1);

      prompt = `Convert ${whole} ${formatFraction({
        numerator,
        denominator,
      })} to an improper fraction`;

      answer = formatFraction({
        numerator: whole * denominator + numerator,
        denominator,
      });

      key = `mixed_to_improper:${whole}:${numerator}/${denominator}`;
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

function generateFraction(rules: FractionRules): Fraction {
  const denominator = randomInt(rules.min_denominator, rules.max_denominator);

  const minNumerator = rules.min_numerator ?? 1;
  const maxNumeratorDefault = rules.proper_only ? denominator - 1 : denominator * 2;
  const maxNumerator = Math.max(
    minNumerator,
    Math.min(
      rules.max_numerator ?? maxNumeratorDefault,
      rules.proper_only ? denominator - 1 : rules.max_numerator ?? maxNumeratorDefault
    )
  );

  let numerator = randomInt(minNumerator, maxNumerator);

  if (rules.proper_only && numerator >= denominator) {
    numerator = Math.max(1, denominator - 1);
  }

  return { numerator, denominator };
}

function generateFractionForOperation(rules: FractionRules, first: Fraction): Fraction {
  if (rules.like_denominators_only) {
    const minNumerator = rules.min_numerator ?? 1;
    const maxNumeratorDefault = rules.proper_only
      ? first.denominator - 1
      : first.denominator * 2;
    const maxNumerator = Math.max(
      minNumerator,
      Math.min(
        rules.max_numerator ?? maxNumeratorDefault,
        rules.proper_only ? first.denominator - 1 : rules.max_numerator ?? maxNumeratorDefault
      )
    );

    let numerator = randomInt(minNumerator, maxNumerator);

    if (rules.proper_only && numerator >= first.denominator) {
      numerator = Math.max(1, first.denominator - 1);
    }

    return {
      numerator,
      denominator: first.denominator,
    };
  }

  return generateFraction(rules);
}

function simplify(fraction: Fraction): Fraction {
  if (fraction.numerator === 0) {
    return { numerator: 0, denominator: 1 };
  }

  const divisor = gcd(fraction.numerator, fraction.denominator);
  const normalizedDenominator = fraction.denominator / divisor;
  const normalizedNumerator = fraction.numerator / divisor;

  if (normalizedDenominator < 0) {
    return {
      numerator: -normalizedNumerator,
      denominator: -normalizedDenominator,
    };
  }

  return {
    numerator: normalizedNumerator,
    denominator: normalizedDenominator,
  };
}

function addFractions(a: Fraction, b: Fraction): Fraction {
  return {
    numerator: a.numerator * b.denominator + b.numerator * a.denominator,
    denominator: a.denominator * b.denominator,
  };
}

function subtractFractions(a: Fraction, b: Fraction): Fraction {
  return {
    numerator: a.numerator * b.denominator - b.numerator * a.denominator,
    denominator: a.denominator * b.denominator,
  };
}

function compareFractions(a: Fraction, b: Fraction): "<" | ">" | "=" {
  const left = a.numerator * b.denominator;
  const right = b.numerator * a.denominator;

  if (left < right) return "<";
  if (left > right) return ">";
  return "=";
}

function improperToMixed(fraction: Fraction): string {
  const simplifiedFraction = simplify(fraction);
  const whole = Math.floor(simplifiedFraction.numerator / simplifiedFraction.denominator);
  const remainder = simplifiedFraction.numerator % simplifiedFraction.denominator;

  if (remainder === 0) {
    return String(whole);
  }

  return `${whole} ${remainder}/${simplifiedFraction.denominator}`;
}

function formatFraction(fraction: Fraction): string {
  const simplifiedFraction = simplify(fraction);
  return `${simplifiedFraction.numerator}/${simplifiedFraction.denominator}`;
}

function fractionToNumber(fraction: Fraction): number {
  return fraction.numerator / fraction.denominator;
}

function sameFraction(a: Fraction, b: Fraction): boolean {
  const sa = simplify(a);
  const sb = simplify(b);
  return sa.numerator === sb.numerator && sa.denominator === sb.denominator;
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);

  while (y !== 0) {
    const temp = y;
    y = x % y;
    x = temp;
  }

  return x || 1;
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatRawFraction(fraction: Fraction): string {
  return `${fraction.numerator}/${fraction.denominator}`;
}