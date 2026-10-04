#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.join(__dirname, '..');
const { getPonytailInstructions, instructionVariant, isCompactModel } = require('../hooks/ponytail-instructions');

for (const model of ['gpt-6-astra', 'gpt-6-astra-high', 'gpt-6.1-sol', 'gpt-6.1-sol-high', 'gpt-6.1-sol:high', 'compact', 'astra']) {
  assert.equal(isCompactModel(model), true, model);
  assert.equal(instructionVariant(model), 'compact', model);
}
for (const model of ['gpt-5.6-sol', 'gpt-6-sol', 'gpt-6.2-sol', 'gpt-6.1-solstice', 'astra-unknown', '', null]) {
  assert.equal(isCompactModel(model), false, String(model));
  assert.equal(instructionVariant(model), 'legacy', String(model));
}
assert.equal(instructionVariant('gpt-5.6-sol'), 'legacy');
assert(getPonytailInstructions('full', 'gpt-6-astra').length < getPonytailInstructions('full', 'gpt-5.6-sol').length);
assert.equal(getPonytailInstructions('full', 'gpt-6.1-sol'), getPonytailInstructions('full', 'gpt-6-astra'));

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'ponytail-model-'));
process.on('exit', () => fs.rmSync(temp, { recursive: true, force: true }));
const env = { ...process.env, HOME: temp, USERPROFILE: temp, PLUGIN_DATA: path.join(temp, 'plugin-data'), PONYTAIL_DEFAULT_MODE: 'full' };
const activate = spawnSync(process.execPath, [path.join(root, 'hooks', 'ponytail-activate.js')], {
  env, input: JSON.stringify({ model: 'gpt-5.6-sol' }), encoding: 'utf8',
});
assert.equal(activate.status, 0, activate.stderr);
const switched = spawnSync(process.execPath, [path.join(root, 'hooks', 'ponytail-mode-tracker.js')], {
  env, input: JSON.stringify({ prompt: 'continue', model: 'gpt-6.1-sol' }), encoding: 'utf8',
});
assert.equal(switched.status, 0, switched.stderr);
const output = JSON.parse(switched.stdout);
assert.match(output.hookSpecificOutput.additionalContext, /PONYTAIL MODEL CHANGED — variant: compact/);
assert.match(output.hookSpecificOutput.additionalContext, /simplest maintainable solution/);
assert.doesNotMatch(output.hookSpecificOutput.additionalContext, /Can it be one line/);
const modeChanged = spawnSync(process.execPath, [path.join(root, 'hooks', 'ponytail-mode-tracker.js')], {
  env, input: JSON.stringify({ prompt: '/ponytail lite' }), encoding: 'utf8',
});
assert.equal(modeChanged.status, 0, modeChanged.stderr);
const modeOutput = JSON.parse(modeChanged.stdout);
assert.match(modeOutput.hookSpecificOutput.additionalContext, /PONYTAIL MODE CHANGED — level: lite/);
assert.doesNotMatch(modeOutput.hookSpecificOutput.additionalContext, /Can it be one line/);
const subagent = spawnSync(process.execPath, [path.join(root, 'hooks', 'ponytail-subagent.js')], { env, encoding: 'utf8' });
assert.equal(subagent.status, 0, subagent.stderr);
assert.match(JSON.parse(subagent.stdout).hookSpecificOutput.additionalContext, /simplest maintainable solution/);
const legacy = spawnSync(process.execPath, [path.join(root, 'hooks', 'ponytail-mode-tracker.js')], {
  env, input: JSON.stringify({ prompt: 'continue', model: 'gpt-6-sol' }), encoding: 'utf8',
});
assert.equal(legacy.status, 0, legacy.stderr);
assert.match(JSON.parse(legacy.stdout).hookSpecificOutput.additionalContext, /PONYTAIL MODEL CHANGED — variant: legacy/);
assert.match(JSON.parse(legacy.stdout).hookSpecificOutput.additionalContext, /Can it be one line/);
console.log('PASS: Astra and GPT-6.1 Sol use compact guidance, preserve it in subagents, and switch back to legacy');
