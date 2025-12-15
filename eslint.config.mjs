import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});


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
      // 🔥 Disable annoying strict rules
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
      "@typescript-eslint/no-unnecessary-type-constraint": "off",
      "@typescript-eslint/no-empty-object-type": "off",

      // Optional sanity
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-unused-expressions": "off",   
  },
  },
];