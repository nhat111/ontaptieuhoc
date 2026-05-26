// Next 16 dropped `next lint`; eslint-config-next now ships a native flat
// config, so we import it directly (no @eslint/eslintrc FlatCompat).
import next from "eslint-config-next";

const eslintConfig = [
  ...next,
  {
    // eslint-config-next 16 bundles the aggressive react-hooks v6 rules.
    // These flag long-standing, intentional patterns in this codebase
    // (cascading subject/chapter fetch effects — see CLAUDE.md — and the
    // answersRef mirror in QuizClient). Keep them as warnings rather than
    // build-breaking errors instead of rewriting working code.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/static-components": "warn",
    },
  },
  {
    ignores: [".next/**", "node_modules/**", "scripts/**", "next-env.d.ts"],
  },
];

export default eslintConfig;
