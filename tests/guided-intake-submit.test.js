const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const sourcePath = path.join(__dirname, '..', 'src', 'components', 'GuidedIntake.tsx');
const source = fs.readFileSync(sourcePath, 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    jsx: ts.JsxEmit.ReactJSX,
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022
  }
}).outputText;

function findSubmitButton(node) {
  if (!node || typeof node !== 'object') return undefined;
  if (node.type === 'button' && node.props?.type === 'submit') return node;
  const children = node.props?.children;
  const items = Array.isArray(children) ? children : [children];
  for (const child of items) {
    const match = findSubmitButton(child);
    if (match) return match;
  }
  return undefined;
}

const sandbox = {
  exports: {},
  require(moduleName) {
    if (moduleName === 'react/jsx-runtime') return require('react/jsx-runtime');
    if (moduleName === '@/lib/issueCatalog') {
      return {
        findIssueCatalogItem: () => ({
          frequentIssues: [],
          relatedLawCandidates: ['상가건물 임대차보호법']
        })
      };
    }
    throw new Error(`Unexpected require: ${moduleName}`);
  }
};

vm.runInNewContext(compiled, sandbox, { filename: sourcePath });

const element = sandbox.exports.GuidedIntake({
  issueCard: 'lease',
  intakeMode: 'guided',
  businessType: '카페',
  stage: '운영 중',
  stakeholder: '임대인',
  documentStatus: '계약서 있음',
  interestIssue: '',
  question: '',
  loading: false,
  onChange() {},
  onSubmit() {}
});

const submitButton = findSubmitButton(element);
assert(submitButton, 'submit button should render');
assert.equal(submitButton.props.disabled, false, 'guided intake should allow submit with a situation card even when question is empty');
