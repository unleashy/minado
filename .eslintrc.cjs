module.exports = {
  root: true,
  extends: [
    "xo/browser",
    "xo-typescript/space",
    "xo-react/space",
    "plugin:react/jsx-runtime",
    "plugin:unicorn/recommended",
    "prettier"
  ],
  env: {
    browser: true,
    es2021: true
  },
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2021,
    ecmaFeatures: {
      impliedStrict: true,
      jsx: false
    }
  },
  rules: {
    // way too annoying
    "@typescript-eslint/naming-convention": "off",

    // has a lot of false positives
    "@typescript-eslint/restrict-template-expressions": "off",

    // non-capitalised comments are fine
    "capitalized-comments": "off",

    // enforce max complexity of 7 - arbitrary but a threshold nonetheless
    complexity: ["error", { max: 7 }],

    // this rule makes for actively less readable code
    "no-else-return": "off",

    // warning comments are fine
    "no-warning-comments": "off",

    // destructuring isn't always better
    "prefer-destructuring": "off",

    // ignore used variables
    "unicorn/prefer-export-from": ["error", { ignoreUsedVariables: true }],

    // ternaries are situational and generally worse than if-else
    "unicorn/prefer-ternary": "off",

    // i like abbreviating
    "unicorn/prevent-abbreviations": "off",

    // disabling this lets us name files after react components
    "unicorn/filename-case": "off",

    // allow things like 0 <= x && x <= 10
    yoda: "off"
  },
  overrides: [
    {
      files: "**/*.js",
      rules: {
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-unsafe-call": "off",
        "@typescript-eslint/no-unsafe-return": "off",
        "@typescript-eslint/restrict-template-expressions": "off"
      }
    }
  ],
  ignorePatterns: ["dist/**/*"]
};
