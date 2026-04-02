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

export function generateFractionsBasicQuestions(ruleJson: TemplateRuleJson) {
  const questions: string[] = [];
  const seen = new Set<string>();

  const count = ruleJson.question_count;
  const rules = ruleJson.rules;

  while (questions.length < count) {
    let question = "";
    let key = "";

    if (rules.operation === "equivalent") {
      const base = generateFraction(rules);
      const multiplier = randomInt(2, 6);

      const left = simplify(base);
      const right = {
        numerator: left.numerator * multiplier,
        denominator: left.denominator * multiplier,
      };

      question = `${formatFraction(left)} = _____ / ${right.denominator}`;
      key = `equivalent:${left.numerator}/${left.denominator}:${right.denominator}`;
    }

    if (rules.operation === "compare") {
      const a = generateFraction(rules);
      const b = generateFraction(rules);

      if (sameFraction(a, b)) continue;

      question = `${formatFraction(a)}  ___  ${formatFraction(b)}`;
      key = `compare:${a.numerator}/${a.denominator}:${b.numerator}/${b.denominator}`;
    }

    if (rules.operation === "simplify") {
      const base = generateFraction(rules);
      const multiplier = randomInt(2, 6);

      const unsimplified = {
        numerator: base.numerator * multiplier,
        denominator: base.denominator * multiplier,
      };

      question = `Simplify ${formatFraction(unsimplified)}`;
      key = `simplify:${unsimplified.numerator}/${unsimplified.denominator}`;
    }

    if (rules.operation === "add") {
      const a = generateFraction(rules);
      const b = generateFraction({
        ...rules,
        min_denominator: rules.like_denominators_only ? a.denominator : rules.min_denominator,
        max_denominator: rules.like_denominators_only ? a.denominator : rules.max_denominator,
      });

      question = `${formatFraction(a)} + ${formatFraction(b)} = _____`;
      key = `add:${a.numerator}/${a.denominator}:${b.numerator}/${b.denominator}`;
    }

    if (rules.operation === "subtract") {
      const a = generateFraction(rules);
      const b = generateFraction({
        ...rules,
        min_denominator: rules.like_denominators_only ? a.denominator : rules.min_denominator,
        max_denominator: rules.like_denominators_only ? a.denominator : rules.max_denominator,
      });

      if (rules.non_negative_only) {
        const diff = fractionToNumber(a) - fractionToNumber(b);
        if (diff < 0) continue;
      }

      question = `${formatFraction(a)} - ${formatFraction(b)} = _____`;
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

      question = `Convert ${formatFraction(improper)} to a mixed number`;
      key = `improper_to_mixed:${improper.numerator}/${improper.denominator}`;
    }

    if (rules.operation === "mixed_to_improper") {
      const denominator = randomInt(rules.min_denominator, rules.max_denominator);
      const whole = randomInt(1, 5);
      const numerator = randomInt(1, denominator - 1);

      question = `Convert ${whole} ${formatFraction({ numerator, denominator })} to an improper fraction`;
      key = `mixed_to_improper:${whole}:${numerator}/${denominator}`;
    }

    if (!question) continue;

    if (rules.unique_questions && seen.has(key)) {
      continue;
    }

    seen.add(key);
    questions.push(question);
  }

  return questions;
}

function generateFraction(rules: FractionRules): Fraction {
  const denominator = randomInt(rules.min_denominator, rules.max_denominator);

  const minNumerator = rules.min_numerator ?? 1;
  const maxNumeratorDefault = rules.proper_only ? denominator - 1 : denominator * 2;
  const maxNumerator = Math.max(
    minNumerator,
    Math.min(rules.max_numerator ?? maxNumeratorDefault, rules.proper_only ? denominator - 1 : rules.max_numerator ?? maxNumeratorDefault)
  );

  let numerator = randomInt(minNumerator, maxNumerator);

  if (rules.proper_only && numerator >= denominator) {
    numerator = Math.max(1, denominator - 1);
  }

  return { numerator, denominator };
}

function simplify(fraction: Fraction): Fraction {
  const divisor = gcd(fraction.numerator, fraction.denominator);
  return {
    numerator: fraction.numerator / divisor,
    denominator: fraction.denominator / divisor,
  };
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

function formatFraction(fraction: Fraction): string {
  return `${fraction.numerator}/${fraction.denominator}`;
}

function fractionToNumber(fraction: Fraction): number {
  return fraction.numerator / fraction.denominator;
}

function sameFraction(a: Fraction, b: Fraction): boolean {
  return a.numerator === b.numerator && a.denominator === b.denominator;
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}