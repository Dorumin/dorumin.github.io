import js from '@eslint/js';
import { includeIgnoreFile } from '@eslint/compat';
import svelte from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';
import globals from 'globals';
import { fileURLToPath } from 'node:url';
import ts from 'typescript-eslint';
import svelteConfig from './svelte.config.js';
import stylistic from '@stylistic/eslint-plugin';

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

const styles = stylistic.configs.customize({
    indent: 4,
    quotes: 'single',
    semi: true,
    jsx: true,
    braceStyle: '1tbs',
});

export default ts.config(
    includeIgnoreFile(gitignorePath),
    js.configs.recommended,
    ...ts.configs.recommended,
    ...svelte.configs.recommended,
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
    },
    {
        files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
        ignores: ['eslint.config.js', 'svelte.config.js'],

        languageOptions: {
            parser: svelteParser,
            parserOptions: {
                projectService: true,
                extraFileExtensions: ['.svelte'],
                parser: ts.parser,
                svelteConfig,
            },
        },
    },
    // Addendum
    {
        plugins: {
            '@stylistic': stylistic,
        },
        rules: {
            ...styles.rules,
            '@typescript-eslint/no-unused-vars': ['warn', {
                argsIgnorePattern: '^_',
                caughtErrorsIgnorePattern: '^_',
                destructuredArrayIgnorePattern: '^_',
                varsIgnorePattern: '^_',
            }],

            // Possible errors
            'svelte/infinite-reactive-loop': 'warn',
            'svelte/no-dom-manipulating': 'warn',
            'svelte/no-dupe-else-if-blocks': 'warn',
            'svelte/no-dupe-on-directives': 'warn',
            'svelte/no-dupe-style-properties': 'warn',
            'svelte/no-dupe-use-directives': 'warn',
            'svelte/no-dynamic-slot-name': 'warn',
            'svelte/no-export-load-in-svelte-module-in-kit-pages': 'warn',
            'svelte/no-not-function-handler': 'warn',
            'svelte/no-object-in-text-mustaches': 'warn',
            'svelte/no-reactive-reassign': 'warn',
            'svelte/no-shorthand-style-property-overrides': 'warn',
            'svelte/no-store-async': 'warn',
            'svelte/no-unknown-style-directive-property': 'warn',
            'svelte/require-store-callbacks-use-set-param': 'warn',
            'svelte/require-store-reactive-access': 'warn',
            'svelte/valid-compile': [
                'off',
                {
                    ignoreWarnings: false,
                },
            ],
            'svelte/valid-prop-names-in-kit-pages': 'off',

            // Security vulnerabilities
            'svelte/no-at-html-tags': 'off',
            'svelte/no-target-blank': 'off',

            // Best practices
            'svelte/block-lang': [
                'warn',
                {
                    enforceScriptPresent: false,
                    enforceStylePresent: false,
                    script: 'ts',
                    style: 'scss',
                },
            ],
            'svelte/button-has-type': [
                'warn',
                {
                    button: true,
                    submit: true,
                    reset: true,
                },
            ],
            'svelte/no-at-debug-tags': 'off',
            'svelte/no-ignored-unsubscribe': 'warn',
            'svelte/no-immutable-reactive-statements': 'warn',
            'svelte/no-inline-styles': [
                'off',
                {
                    allowTransitions: false,
                },
            ],
            'svelte/no-inspect': 'warn',
            'svelte/no-reactive-functions': 'warn',
            'svelte/no-reactive-literals': 'warn',
            'svelte/no-unused-class-name': 'off',
            'svelte/no-unused-svelte-ignore': 'warn',
            'svelte/no-useless-mustaches': [
                'warn',
                {
                    ignoreIncludesComment: false,
                    ignoreStringEscape: true,
                },
            ],
            'svelte/prefer-destructured-store-props': 'off',
            'svelte/require-each-key': 'warn',
            'svelte/require-event-dispatcher-types': 'warn',
            'svelte/require-optimized-style-attribute': 'off',
            'svelte/require-stores-init': 'warn',
            'svelte/valid-each-key': 'warn',

            // Stylistic issues
            'svelte/derived-has-same-inputs-outputs': 'off', // No other way
            'svelte/first-attribute-linebreak': [
                'warn',
                {
                    multiline: 'below',
                    singleline: 'beside',
                },
            ],
            'svelte/html-closing-bracket-spacing': [
                'warn',
                {
                    startTag: 'never',
                    endTag: 'never',
                    selfClosingTag: 'always',
                },
            ],
            'svelte/html-closing-bracket-new-line': [
                'warn',
                {
                    singleline: 'never',
                    multiline: 'always',
                    selfClosingTag: {
                        singleline: 'never',
                        multiline: 'always',
                    },
                },
            ],
            'svelte/html-quotes': [
                'warn',
                {
                    prefer: 'double',
                    dynamic: {
                        quoted: false,
                        avoidInvalidUnquotedInHTML: false,
                    },
                },
            ],
            'svelte/html-self-closing': [
                'warn',
                'default',
            ],
            'svelte/indent': [
                'warn',
                {
                    indent: 4,
                    ignoredNodes: [],
                    switchCase: 1,
                    alignAttributesVertically: false,
                },
            ],
            'svelte/max-attributes-per-line': [
                'warn',
                {
                    multiline: 1,
                    singleline: 4,
                },
            ],
            'svelte/mustache-spacing': [
                'warn',
                {
                    textExpressions: 'never',
                    attributesAndProps: 'never',
                    directiveExpressions: 'never',
                    tags: {
                        openingBrace: 'never',
                        closingBrace: 'never',
                    },
                },
            ],
            'svelte/no-extra-reactive-curlies': 'warn',
            'svelte/no-restricted-html-elements': 'off',
            'svelte/no-spaces-around-equal-signs-in-attribute': 'warn',

            // Doru might prefer otherwise, though
            'svelte/prefer-class-directive': 'off',
            'svelte/prefer-style-directive': 'off',
            'svelte/shorthand-attribute': 'warn',
            'svelte/shorthand-directive': 'warn',
            'svelte/sort-attributes': 'off',
            'svelte/spaced-html-comment': [
                'warn',
                'always',
            ],

            // Extension rules
            'svelte/no-inner-declarations': 'off', // I don't know how this works
            'svelte/no-trailing-spaces': 'warn',

            // System
            'svelte/comment-directive': [
                'off',
                {
                    reportUnusedDisableDirectives: true,
                },
            ],
        },
    },
);
