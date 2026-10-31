// ESLint for the page script and the browser check (npm i --no-save eslint@9 @eslint/js@9 globals@15).
// Empty catch blocks are intentional (storage may be unavailable); errors fail CI, warnings do not.
import js from "@eslint/js";
import globals from "globals";

const rules = {
  "no-unused-vars": ["warn", { args: "none", caughtErrors: "none" }],
  "no-empty": ["error", { allowEmptyCatch: true }],
  "no-useless-escape": "warn",
};

export default [
  js.configs.recommended,
  {
    files: ["site/assets/**/*.js"],
    languageOptions: { ecmaVersion: 2022, sourceType: "script", globals: { ...globals.browser } },
    rules,
  },
  {
    // Node script; the callbacks it passes to page.evaluate() run in the browser.
    files: ["tests/**/*.cjs"],
    languageOptions: { ecmaVersion: 2022, sourceType: "commonjs", globals: { ...globals.node, ...globals.browser } },
    rules,
  },
];
