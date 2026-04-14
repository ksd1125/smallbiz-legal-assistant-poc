const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function makeElement(initial = {}) {
  return {
    value: initial.value ?? '',
    textContent: '',
    innerHTML: '',
    dataset: initial.dataset ?? {},
    style: {},
    classList: { toggle() {} },
    addEventListener(type, handler) {
      this[`on${type}`] = handler;
    }
  };
}

const elements = {
  '#issueGrid': makeElement(),
  '#frequentIssues': makeElement(),
  '#guidedModeButton': makeElement(),
  '#openModeButton': makeElement(),
  '#businessType': makeElement({ value: '<img src=x onerror=alert(1)>' }),
  '#stage': makeElement({ value: '분쟁 발생' }),
  '#stakeholder': makeElement({ value: '임대인' }),
  '#documentStatus': makeElement({ value: '계약서 있음' }),
  '#question': makeElement({ value: '<script>alert(1)</script>' }),
  '#analyzeButton': makeElement(),
  '#geminiApiKey': makeElement({ value: 'test-gemini-key' }),
  '#openLawOc': makeElement(),
  '#provider': makeElement({ value: 'openlaw_direct' }),
  '#copyEnvButton': makeElement(),
  '#clearKeysButton': makeElement(),
  '#envPreview': makeElement(),
  '#apiMessage': makeElement(),
  '#resultContent': makeElement()
};

const tabButtons = [
  makeElement({ dataset: { tab: 'summary' } }),
  makeElement({ dataset: { tab: 'sources' } }),
  makeElement({ dataset: { tab: 'checklist' } }),
  makeElement({ dataset: { tab: 'next' } })
];

const document = {
  querySelector(selector) {
    return elements[selector];
  },
  querySelectorAll(selector) {
    return selector === '.tabButton' ? tabButtons : [];
  }
};

const source = fs.readFileSync(path.join(__dirname, '..', 'docs', 'js', 'app.js'), 'utf8');

vm.runInNewContext(source, {
  document,
  URLSearchParams,
  navigator: { clipboard: { writeText: async () => {} } }
});

elements['#analyzeButton'].onclick();

const resultHtml = elements['#resultContent'].innerHTML;

assert(!resultHtml.includes('<script>'), 'question input must not render raw script tags');
assert(!resultHtml.includes('<img'), 'business type input must not render raw HTML tags');
assert(resultHtml.includes('&lt;script&gt;alert(1)&lt;/script&gt;'), 'question input should render as escaped text');
assert(resultHtml.includes('&lt;img src=x onerror=alert(1)&gt;'), 'business type input should render as escaped text');

assert(elements['#envPreview'].textContent.includes('GEMINI_API_KEY=test-gemini-key'), 'Gemini API key should be included in the local env preview');

elements['#clearKeysButton'].onclick();
assert.equal(elements['#geminiApiKey'].value, '', 'clear button should clear Gemini API key input');
