import test from 'node:test';
import assert from 'node:assert/strict';
import { parseReactDoctorScore } from './parse-react-doctor-score.mjs';

test('parses the standalone score printed by React Doctor after its progress output', () => {
  assert.equal(parseReactDoctorScore('Packages: +164\n✔ Select projects to scan › lexchain\n66\n'), 66);
});

test('uses the last labeled score when React Doctor prints one', () => {
  assert.equal(parseReactDoctorScore('Score: 58 / 100\nScore: 81 / 100'), 81);
});

test('rejects output without a valid score instead of reporting a false zero', () => {
  assert.equal(parseReactDoctorScore('Progress: resolved 224, done'), null);
  assert.equal(parseReactDoctorScore('101'), null);
});
