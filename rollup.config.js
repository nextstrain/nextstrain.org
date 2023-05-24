import babel from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import globals from 'rollup-plugin-node-globals';

/**
 * Rollup is used to bundle our client-side code ONLY
 * See ./src/client-components.
 *
 * There's lots missing here -- minimisation, production bundles etc,
 * however none of those improvements will change how we write our client-side
 * components.
 *
 * Currently we require the client-code to call `renderClientSide(RootComponent)`
 * but we could remove this slight inconvenience if we use Rollup's JS API
 */

// const isProduction = process.env.NODE_ENV === 'production';

export default {
  output: {
    dir: 'assets/bundles',
    format: 'es'
  },
  plugins: [
    babel({ babelHelpers: 'bundled' }),
    nodeResolve(),
    commonjs(),
    globals()
  ]
};
