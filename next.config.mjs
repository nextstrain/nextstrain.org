// <https://beta.nextjs.org/docs/api-reference/next-config>
// <https://nextjs.org/docs/api-reference/next.config.js/introduction>

export const experimental = {
  /* Enable use of beta app/ directory for dynamic, server-side rendering.
   * <https://beta.nextjs.org/docs/getting-started>
   */
  appDir: true,
};

export const webpack = (config) => ({
  ...config,
  experiments: {
    ...config.experiments,

    /* Allow our Next.js code to import other parts of the codebase which use
     * top-level await.
     */
    topLevelAwait: true,
  },
});
