import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import { terser } from '@rollup/plugin-terser';
import copy from 'rollup-plugin-copy';
import html from 'rollup-plugin-html';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = !isProduction;

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/threejs-edit.esm.js',
      format: 'esm',
      sourcemap: !isProduction,
      name: 'ThreeJSEdit'
    },
    {
      file: 'dist/threejs-edit.umd.js',
      format: 'umd',
      sourcemap: !isProduction,
      name: 'ThreeJSEdit',
      globals: {
        three: 'THREE'
      }
    },
    {
      file: 'dist/threejs-edit.min.js',
      format: 'umd',
      sourcemap: !isProduction,
      name: 'ThreeJSEdit',
      globals: {
        three: 'THREE'
      },
      plugins: [terser()]
    }
  ],
  external: ['three'],
  plugins: [
    resolve({
      browser: true,
      preferBuiltins: false
    }),
    commonjs({
      include: 'node_modules/**'
    }),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              browsers: ['> 1%', 'last 2 versions', 'not dead']
            },
            modules: false,
            useBuiltIns: 'usage',
            corejs: 3
          }
        ]
      ],
      plugins: [
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-proposal-private-methods'
      ]
    }),
    copy({
      targets: [
        { src: 'src/docs', dest: 'dist' },
        { src: 'demo', dest: 'dist' },
        { src: 'README.md', dest: 'dist' },
        { src: 'LICENSE', dest: 'dist' }
      ]
    }),
    html({
      template: 'demo/index.html'
    }),
    isDevelopment && serve({
      contentBase: 'dist',
      port: 8080,
      open: true
    }),
    isDevelopment && livereload({
      watch: 'dist',
      verbose: true
    })
  ].filter(Boolean),
  watch: {
    include: 'src/**',
    exclude: 'node_modules/**'
  },
  onwarn(warning, warn) {
    // Suppress circular dependency warnings for Three.js
    if (warning.code === 'CIRCULAR_DEPENDENCY' && warning.message.includes('three')) {
      return;
    }
    warn(warning);
  }
}; 