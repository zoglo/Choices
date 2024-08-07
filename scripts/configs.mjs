import replace from '@rollup/plugin-replace';
import nodeResolve from'@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import * as fs from 'node:fs';

// @ts-ignore
const pckg = require('../package.json');

const OUTPUT_TYPES = (process.env.OUTPUT_TYPES || 'umd,cjs,es').split(',')

const FILENAME = 'choices'
const VERSION = process.env.VERSION || pckg.version
const AUTHOR = pckg.author
const HOMEPAGE = pckg.homepage
const banner = `/*! choices.js v${VERSION} | © ${new Date().getFullYear()} ${AUTHOR} | ${HOMEPAGE} */\n`

const withDeclarations = !!process.env.WITH_D_TS_FILES;
if (withDeclarations) {
  [
    'public/types/src',
    'public/assets/scripts',
  ].forEach((p) => {
    if (fs.existsSync(p)) {
      fs.rmSync(p, { recursive: true });
    }

    fs.mkdirSync(p, { recursive: true });
  });
}


const buildFeatures = {
  SEARCH: "fuse-full", // "fuse-basic" / ""
}

const builds = [
  {
    name: ".",
    features: {
      ...buildFeatures,
//      ... {
//        SEARCH: "fuse-full"
//      }
    }
  },
];
const candidateBuilds = process.env.TARGET
  ? builds.filter((build) => build.name === process.env.TARGET)
  : builds;

function formatToExt(format) {
  switch (format) {
    case 'umd': return 'js';
    case 'cjs': return 'cjs';
    case 'es': return 'mjs';
    default: return '';
  }
}

function genConfig(buildConfig) {
  // built-in vars
  const vars = {
    __VERSION__: VERSION,
    preventAssignment: true,
    'process.env.NODE_ENV': JSON.stringify('production')
  }

  if ('featureFlags' in buildConfig) {
    Object.keys(buildConfig.featureFlags).forEach((key) => {
      vars[`process.env.${key}`] = JSON.stringify(buildConfig.featureFlags[key])
    })
  }

  const config = {
    input: 'src/entry.js',
    plugins: [
      nodeResolve(),
      typescript({
        tsconfig: 'src/tsconfig.json',
        // https://github.com/rollup/plugins/issues/1495
        // @rollup/plugin-typescript just doesn't want to reliably generate .d.ts files when "composite" is true, so just copy the tsconfig.json definition around
        // Additionally tsc no longer accepts relative directories which escape declarationDir
        "declaration": withDeclarations,
        // declarationDir in src/tsconfig.json with a value of "./" magically maps to "./src" here...
        "declarationDir": withDeclarations ? "./src" : undefined,
        "declarationMap": false,
      }),
      replace(vars)
    ],
    output: [],
  }

  const output = [false, true];
  output.forEach((minify) => {
    OUTPUT_TYPES.forEach((format) => {
      const ext = formatToExt(format);
      if (!ext) {
        return;
      }
      const output = {
        banner,
        file: `public/assets/scripts/${FILENAME}${minify ? '.min' : ''}${buildConfig.name !== '.' ? '.' + buildConfig.name : ''}.${ext}`,
        format: format,
        name: 'Choices.js',
        exports: 'default',
        plugins: []
      };
      if (format !== 'es') {
        config.plugins.push(babel({ babelHelpers: 'bundled' }))
      }

      if (minify) {
        output.plugins.push(terser())
      }

      config.output.push(output);
    })
  });

  if (config.output.length === 0) {
    return false;
  }

  return config
}

let buildConfig = [];
candidateBuilds.forEach((build) => {
  buildConfig.push(genConfig(build));
});

buildConfig = buildConfig.filter((b) => !!b);
if (buildConfig.length === 0) {
  console.log('No valid build targets or feature combinations.');
}

// noinspection JSUnusedGlobalSymbols
export default buildConfig;