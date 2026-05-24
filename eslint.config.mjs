import eslint from "@eslint/js";
import tseslintPlugin from "@typescript-eslint/eslint-plugin";
import tseslintParser from "@typescript-eslint/parser";
import reactPlugin from "eslint-plugin-react";
import globals from "globals";

export default [
    eslint.configs.recommended,
    {
        files: ["**/*.{ts,tsx}"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            parser: tseslintParser,
            globals: {
                ...globals.node,
                ...globals.browser,
                NodeJS: "readonly",
            },
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        plugins: {
            "@typescript-eslint": tseslintPlugin,
            react: reactPlugin,
        },
        settings: {
            react: {
                version: "detect",
            },
        },
        rules: {
            ...tseslintPlugin.configs.recommended.rules,
            ...reactPlugin.configs.recommended.rules,
            indent: ["error", 4, { SwitchCase: 1 }],
            quotes: ["error", "double"],
            semi: ["error", "always"],
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/ban-ts-comment": "off",
            "@typescript-eslint/triple-slash-reference": "off",
            "@typescript-eslint/no-non-null-assertion": "off",
            "react/react-in-jsx-scope": "off",
            "eol-last": "error",
        },
    },
    {
        files: ["**/*.{js,jsx}"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                ...globals.node,
                ...globals.browser,
                NodeJS: "readonly",
            },
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        plugins: {
            react: reactPlugin,
        },
        settings: {
            react: {
                version: "detect",
            },
        },
        rules: {
            ...reactPlugin.configs.recommended.rules,
            indent: ["error", 4, { SwitchCase: 1 }],
            quotes: ["error", "double"],
            semi: ["error", "always"],
            "react/react-in-jsx-scope": "off",
            "eol-last": "error",
        },
    },
    {
        ignores: ["dist/**", "node_modules/**"],
    },
];
