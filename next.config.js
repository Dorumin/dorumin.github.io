// https://github.com/vercel/next.js/blob/f0809316eec7eea09781a71cf514c0bacee4d7d2/packages/next/build/webpack/config/blocks/css/loaders/getCssModuleLocalIdent.ts
// Do not tamper with class names
function getCssModuleLocalIdent(_, __, exportName) {
    return exportName;
}

/** @type {import('next').NextConfig} */
module.exports = {
    reactStrictMode: true,
    images: {
        domains: ['cdn.discordapp.com'],
    },
    webpack(config) {
        const moduleLoader = config.module.rules
            .filter(rule => {
                return rule.oneOf && rule.oneOf.find(rule => rule.test.toString() === '/\\.module\\.css$/');
            })[0].oneOf
            .find(rule => {
                return rule.test.toString() === '/\\.module\\.css$/';
            });

        const sassModuleLoader = config.module.rules
            .filter(rule => {
                return rule.oneOf && rule.oneOf.find(rule => rule.test.toString() === '/\\.module\\.(scss|sass)$/');
            })[0].oneOf
            .find(rule => {
                return rule.test.toString() === '/\\.module\\.(scss|sass)$/';
            });

        const cssLoader = moduleLoader.use.find(loader => {
            return /\bcss-loader\b/.test(loader.loader);
        });

        const sassCssLoader = sassModuleLoader.use.find(loader => {
            return /\bcss-loader\b/.test(loader.loader);
        });

        cssLoader.options.modules.getLocalIdent = getCssModuleLocalIdent;
        sassCssLoader.options.modules.getLocalIdent = getCssModuleLocalIdent;

        return config;
    }
};
