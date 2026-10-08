import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export function parseReactDoctorScore(output) {
  const labeledScores = [...output.matchAll(/Score:\s*(\d{1,3})\b/gi)];
  const standaloneScores = [...output.matchAll(/^\s*(\d{1,3})\s*$/gm)];
  const score = Number((labeledScores.at(-1) ?? standaloneScores.at(-1))?.[1]);
  return Number.isInteger(score) && score >= 0 && score <= 100 ? score : null;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const score = parseReactDoctorScore(readFileSync(0, 'utf8'));
  if (score === null) {
    console.error('Unable to parse a React Doctor score from its output.');
    process.exitCode = 1;
  } else {
    process.stdout.write(String(score));
  }
}
