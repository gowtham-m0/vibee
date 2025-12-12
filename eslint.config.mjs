import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// build base configs
const base = compat.extends(
  "next/core-web-vitals",
  "next/typescript"
);

export default [
  ...base,
  {
    ignores: [
      "**/generated/**",        // ignore all generated code
      "**/src/generated/**",    // ignore TS compiled outputs
      "**/src/**/generated/**",
      "**/node_modules/**",
      "**/.next/**",            // important for Vercel
      "**/prisma/**",           // prisma wasm lives here
      "**/src/generated/prisma/**",
    ],
    rules: {
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-this-alias": "off",            // 🆕 ADDED
      "@typescript-eslint/no-explicit-any": "warn",        // optional
    },
  },
];
