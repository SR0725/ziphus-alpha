/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["standard", "@repo/eslint-config/next.js"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
  },
  rules: {
    "no-restricted-imports": [
      "error",
      {
        paths: [
          {
            name: "@material-tailwind/react",
            message:
              "Please import from '@/components/material-tailwind' instead.",
          },
          {
            name: "clsx",
            importNames: ["default", "clsx"],
            message: "Please import from '@/utils/cn' instead.",
          },
        ],
      },
    ],
    "no-useless-constructor": "off",
    quotes: [2, "single"],
    "comma-dangle": [
      "error",
      {
        arrays: "always-multiline",
        objects: "always-multiline",
        imports: "always-multiline",
        exports: "always-multiline",
        functions: "only-multiline",
      },
    ],
    semi: ["error", "always"],
  },
  overrides: [
    {
      files: ["./src/utils/cn.ts"], // Allow `clsx` import in `cn.ts`
      rules: {
        "no-restricted-imports": ["off"],
      },
    },
  ],
};
