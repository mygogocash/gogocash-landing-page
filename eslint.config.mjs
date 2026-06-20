import { fixupConfigRules } from "@eslint/compat";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "coverage/**",
      "e2e/**",
      "playwright.config.ts",
    ],
  },
  ...fixupConfigRules(nextCoreWebVitals),
  ...fixupConfigRules(nextTypescript),
];

export default eslintConfig;
