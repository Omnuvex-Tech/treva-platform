import globals from "globals";
import { nextJsConfig } from "@repo/eslint-config/next-js";

/** @type {import("eslint").Linter.Config[]} */
export default [
    ...nextJsConfig,
    {
        // next.config.js runs in Node, not the browser/service-worker globals the
        // shared config assumes, so `process` is legitimately defined there.
        files: ["next.config.js", "postcss.config.mjs"],
        languageOptions: {
            globals: {
                ...globals.node,
            },
        },
    },
];
