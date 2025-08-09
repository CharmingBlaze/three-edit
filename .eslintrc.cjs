/* eslint-env node */
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["import"],
  extends: [
    "eslint:recommended",
  ],
  env: { es2022: true, node: true },
  ignorePatterns: ["dist/**/*"],
  overrides: [
    {
      files: ["**/*.ts"],
      parserOptions: { sourceType: "module" },
      rules: {
        "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
        "import/no-duplicates": "error"
      }
    }
  ]
};
