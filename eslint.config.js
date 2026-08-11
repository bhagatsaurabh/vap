import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: { ecmaVersion: "latest", sourceType: "module", ecmaFeatures: { jsx: true } },
    },
    plugins: { react: reactPlugin, "react-hooks": reactHooks, "react-refresh": reactRefresh },
    settings: { react: { version: "detect" } },
    rules: {
      "react-refresh/only-export-components": "warn",
    },
  },
  {
    files: ["**/*.cjs", ".eslintrc.cjs"],
    languageOptions: { ecmaVersion: "latest", sourceType: "script" },
    rules: {},
  },
];
