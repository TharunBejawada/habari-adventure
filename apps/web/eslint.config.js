import js from "@eslint/js";
import pluginNext from "@next/eslint-plugin-next";


export const nextJsConfig = [
  js.configs.recommended,
  {
    plugins: {
      "@next/next": pluginNext,
    },
    rules: {
      ...pluginNext.configs.recommended.rules,
      ...pluginNext.configs["core-web-vitals"].rules, 
    },
  },
];