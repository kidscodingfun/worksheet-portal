export function generateGrade3AdditionQuestions() {
  const questions: string[] = [];
  const seen = new Set<string>();

  while (questions.length < 20) {
    const a = randomInt(10, 99);
    const b = randomInt(10, 99);

    const hasCarry = (a % 10) + (b % 10) >= 10;
    if (hasCarry) continue;

    const key = `${a}+${b}`;
    if (seen.has(key)) continue;

    seen.add(key);
    questions.push(`${a} + ${b} = _____`);
  }

  return questions;
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}