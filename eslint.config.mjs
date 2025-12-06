import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// build base next configs first
const base = compat.extends(
  "next/core-web-vitals",
  "next/typescript"
);

// now export final config
export default [
  ...base,
  {
    ignores: [
      "**/generated/*",
      "**/src/generated/*",
      "**/src/**/generated/*",
      "**/node_modules/**",
    ],
    rules: {
      "@typescript-eslint/no-unused-expressions": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-require-imports": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
];
