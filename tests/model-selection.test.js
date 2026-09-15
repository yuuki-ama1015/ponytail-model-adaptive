#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.join(__dirname, '..');
const { getPonytailInstructions, instructionVariant, isAstraModel } = require('../hooks/ponytail-instructions');

assert.equal(isAstraModel('gpt-6-astra'), true);
assert.equal(isAstraModel('gpt-6-astra-high'), true);
assert.equal(isAstraModel('gpt-5.6-sol'), false);
assert.equal(instructionVariant('gpt-6-astra'), 'astra');
assert.equal(instructionVariant('gpt-5.6-sol'), 'legacy');
assert(getPonytailInstructions('full', 'gpt-6-astra').length < getPonytailInstructions('full', 'gpt-5.6-sol').length);

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'ponytail-model-'));
process.on('exit', () => fs.rmSync(temp, { recursive: true, force: true }));
const env = { ...process.env, HOME: temp, USERPROFILE: temp, PLUGIN_DATA: path.join(temp, 'plugin-data'), PONYTAIL_DEFAULT_MODE: 'full' };
const activate = spawnSync(process.execPath, [path.join(root, 'hooks', 'ponytail-activate.js')], {
  env, input: JSON.stringify({ model: 'gpt-5.6-sol' }), encoding: 'utf8',
});
assert.equal(activate.status, 0, activate.stderr);
const switched = spawnSync(process.execPath, [path.join(root, 'hooks', 'ponytail-mode-tracker.js')], {
  env, input: JSON.stringify({ prompt: 'continue', model: 'gpt-6-astra' }), encoding: 'utf8',
});
assert.equal(switched.status, 0, switched.stderr);
const output = JSON.parse(switched.stdout);
assert.match(output.hookSpecificOutput.additionalContext, /PONYTAIL MODEL CHANGED — variant: astra/);
assert.match(output.hookSpecificOutput.additionalContext, /simplest maintainable solution/);
assert.doesNotMatch(output.hookSpecificOutput.additionalContext, /Can it be one line/);
const modeChanged = spawnSync(process.execPath, [path.join(root, 'hooks', 'ponytail-mode-tracker.js')], {
  env, input: JSON.stringify({ prompt: '/ponytail lite' }), encoding: 'utf8',
});
assert.equal(modeChanged.status, 0, modeChanged.stderr);
const modeOutput = JSON.parse(modeChanged.stdout);
assert.match(modeOutput.hookSpecificOutput.additionalContext, /PONYTAIL MODE CHANGED — level: lite/);
assert.doesNotMatch(modeOutput.hookSpecificOutput.additionalContext, /Can it be one line/);
console.log('PASS: Astra and legacy variants switch at startup and mid-session');
