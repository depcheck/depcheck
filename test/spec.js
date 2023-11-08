import path from 'path';
import depcheck from '../src/index';

export default [
  {
    name:
      'detect missing module for dynamic import() when missing in package.json',
    module: 'import_function_missing',
    options: {},
    expected: {
      dependencies: [],
      devDependencies: [],
      missing: {
        anyone: ['index.js'],
      },
      using: {
        anyone: ['index.js'],
      },
    },
    expectedErrorCode: -1,
  },
  {
    name: 'find module for dynamic import() when present',
    module: 'import_function',
    options: {},
    expected: {
      dependencies: [],
      devDependencies: [],
      missing: {},
      using: {
        optimist: ['index.js'],
      },
    },
    expectedErrorCode: 0,
  },
  {
    name: 'find module for dynamic import(`template-literal`) when present',
    module: 'import_function_template_literal',
    options: {},
    expected: {
      dependencies: [],
      devDependencies: [],
      missing: {},
      using: {
        optimist: ['index.js'],
      },
    },
    expectedErrorCode: 0,
  },
  {
    name: 'find module for dynamic import() with magic Webpack comment',
    module: 'import_function_webpack',
    options: {},
    expected: {
      dependencies: [],
      devDependencies: [],
      missing: {},
      using: {
        optimist: ['index.js'],
      },
    },
    expectedErrorCode: 0,
  },
  {
    name: 'missing module for require.resolve when missing in package.json',
    module: 'require_resolve_missing',
    options: {},
    expected: {
      dependencies: [],
      devDependencies: [],
      missing: {
        anyone: ['index.js'],
      },
      using: {
        anyone: ['index.js'],
      },
    },
    expectedErrorCode: -1,
  },
  {
    name: 'find module for require.resolve when present',
    module: 'require_resolve',
    options: {},
    expected: {
      dependencies: [],
      devDependencies: [],
      missing: {},
      using: {
        optimist: ['index.js'],
      },
    },
    expectedErrorCode: 0,
  },
  {
    name: 'find unused dependencies',
    module: 'bad',
    options: {},
    expected: {
      dependencies: ['optimist'],
      devDependencies: [],
      missing: {},
      using: {},
    },
    expectedErrorCode: -1,
  },
  {
    name: 'find unused dependencies in ES6 files',
    module: 'bad_es6',
    options: {},
    expected: {
      dependencies: ['dont-find-me'],
      devDependencies: [],
      missing: {},
      using: {
        'find-me': ['index.js'],
        'default-export': ['index.js'],
        'default-member-import': ['index.js'],
        'member-alias-export': ['index.js'],
        'member-alias-import': ['index.js'],
        'member-import': ['index.js'],
        'mixed-default-star-import': ['index.js'],
        'mixed-member-alias-import': ['index.js'],
        'mixed-name-memeber-import': ['index.js'],
        'multiple-member-import': ['index.js'],
        'named-export': ['index.js'],
        'name-import': ['index.js'],
        'star-export': ['index.js'],
        'star-import': ['index.js'],
      },
    },
    expectedErrorCode: -1,
  },
  {
    name: 'find all dependencies',
    module: 'good',
    options: {},
    expected: {
      dependencies: [],
      devDependencies: [],
      missing: {},
      using: {
        optimist: ['index.js'],
        foo: ['index.js'],
      },
    },
    expectedErrorCode: 0,
  },
  {
    // See `good_es6/index.js` file for more information about the unsupported
    // ES6 import syntax, which we assert here as the expected missing import.
    name: 'find all dependencies in ES6 files',
    module: 'good_es6',
    options: {},
    expected: {
      dependencies: ['unsupported-syntax'],
      devDependencies: [],
      missing: {},
      using: {
        'basic-import': ['index.js'],
        'default-export': ['index.js'],
        'default-member-import': ['index.js'],
        'member-alias-export': ['index.js'],
        'member-alias-import': ['index.js'],
        'member-import': ['index.js'],
        'mixed-default-star-import': ['index.js'],
        'mixed-member-alias-import': ['index.js'],
        'mixed-name-memeber-import': ['index.js'],
        'multiple-member-import': ['index.js'],
        'named-export': ['index.js'],
        'name-import': ['index.js'],
        'star-export': ['index.js'],
        'star-import': ['index.js'],
      },
    },
    expectedErrorCode: -1,
  },
  {
    name: 'find all dependencies gatsby',
    module: 'gatsby',
    options: {},
    expected: {
      dependencies: ['gatsby-plugin-react-helmet', 'gatsby-plugin-sass'],
      devDependencies: [],
      missing: {},
      using: {},
    },
    expectedErrorCode: -1,
  },
  {
    name: 'recognize experimental ES7 syntax enabled in Babel by default',
    module: 'good_es7',
    options: {},
    expected: {
      dependencies: [],
      devDependencies: [],
      missing: {},
      using: {
        'ecmascript-rest-spread': ['index.js'],
      },
    },
    expectedErrorCode: 0,
  },
  {
    name: 'support flow syntax in ES7 modules',
    module: 'good_es7_flow',
    options: {},
    expected: {
      dependencies: [],
      devDependencies: [],
      missing: {},
      using: {
        'ecmascript-rest-spread': ['index.js'],
      },
    },
    expectedErrorCode: 0,
  },
  {
    name: 'support TypeScript syntax',
    module: 'typescript',
    options: {},
    expected: {
      dependencies: ['unused-dep'],
      devDependencies: [],
      missing: {},
      using: {
        react: ['component.tsx'],
        '@types/react': ['component.tsx'],
        '@types/node': ['esnext.ts'],
        '@types/org__org-pkg': ['esnext.ts'],
        '@types/another-typeless-module': ['typeOnly.ts'],
        '@types/typeless-module': ['typeOnly.ts'],
        '@org/org-pkg': ['esnext.ts'],
        'ts-dep-1': ['index.ts'],
        'ts-dep-2': ['index.ts'],
        'ts-dep-esnext': ['esnext.ts'],
        'ts-dep-typedef': ['typedef.d.ts'],
      },
    },
    expectedErrorCode: -1,
  },
  {
    name: 'support tsconfig extends and types fields',
    module: 'tsconfig',
    options: {},
    expected: {
      dependencies: [],
      devDependencies: ['@types/unused'],
      missing: {
        '@types/jest': ['tsconfig.json'],
        'tsconfig-base': ['tsconfig.build.json'],
      },
      using: {
        '@mybrand/tsconfig': ['tsconfig.json'],
        '@types/jest': ['tsconfig.json'],
        '@types/node': ['tsconfig.json'],
        'tsconfig-base': ['tsconfig.build.json'],
      },
    },
    expectedErrorCode: -1,
  },
  {
    name: 'support SASS/SCSS syntax',
    module: 'sass',
    options: {},
    expected: {
      dependencies: ['unused-sass-dep'],
      devDependencies: [],
      missing: {
        '@test-dep/aFile': ['sass2.sass'],
        '@test-dep/aFile2': ['scss2.scss'],
        '@test-dep/aFile3': ['scss2.scss'],
        '@test-dep/aFile4': ['scss2.scss'],
        sass: ['scss2.scss'],
      },
      using: {
        'sass-dep': ['sass.sass', 'sass2.sass'],
        'sass-dep2': ['sass.sass', 'sass2.sass'],
        '@scss-deps/fonts': ['scss.scss'],
        'scss-dep-2': ['scss.scss'],
        'scss-dep-3': ['scss.scss'],
        'scss-dep': ['_variables.scss', 'scss.scss'],
        '@test-dep/aFile': ['sass2.sass'],
        '@test-dep/aFile2': ['scss2.scss'],
        '@test-dep/aFile3': ['scss2.scss'],
        '@test-dep/aFile4': ['scss2.scss'],
        sass: ['scss2.scss'],
      },
    },
    expectedErrorCode: -1,
  },
  {
    name: 'support Vue syntax',
    module: 'vue',
    options: {},
    expected: {
      dependencies: ['unused-dep'],
      devDependencies: [],
      missing: {},
      using: {
        vue: ['index.js'],
        'vue-dep-1': ['component.vue'],
        'vue-dep-2': ['component.vue'],
      },
    },
    expectedErrorCode: -1,
  },
  {
    name: 'support Vue 3 syntax',
    module: 'vue3',
    options: {},
    expected: {
      dependencies: ['unused-dep'],
      devDependencies: [],
      missing: {},
      using: {
        vue: ['index.js'],
        'vue-dep-1': ['component.vue'],
        'vue-dep-2': ['component.vue'],
      },
    },
    expectedErrorCode: -1,
  },
  {
    name: 'support Vue 3 setup script syntax',
    module: 'vue3_setup',
    options: {},
    expected: {
      dependencies: ['unused-dep'],
      devDependencies: [],
      missing: {},
      using: {
        vue: ['index.js'],
        'vue-dep-1': ['component.vue'],
        'vue-dep-2': ['component.vue'],
        'vue-ts-dep-1': ['component_ts.vue'],
      },
    },
    expectedErrorCode: -1,
  },
  {
    name: 'find dependencies used in code but not declared in package.json',
    module: 'missing',
    options: {},
    expected: {
      dependencies: [],
      devDependencies: [],
      missing: {
        'missing-dep': ['index.js'],
      },
      using: {
        'missing-dep': ['index.js'],
      },
    },
    expectedErrorCode: -1,
  },
  {
    name: 'ignore the missing dependencies in nested module',
    module: 'missing_nested',
    options: {},
    expected: {
      dependencies: [],
      devDependencies: [],
      missing: {
        'outer-missing-dep': ['index.js'],
      },
      using: {
        'outer-missing-dep': ['index.js'],
        'used-dep': ['index.js'],
      },
    },
    expectedErrorCode: -1,
  },
  {
    name: 'not report peer and optional dependencies as missing',
    module: 'missing_peer_deps',
    options: {},
    expected: {
      dependencies: [],
      devDependencies: [],
      missing: {
        'missing-this-dep': ['index.js'],
      },
      using: {
        'missing-this-dep': ['index.js'],
        'peer-dep': ['index.js'],
        'optional-dep': ['index.js'],
      },
    },
    expectedErrorCode: -1,
  },
  {
    name: 'find grunt dependencies',
    module: 'grunt',
    options: {},
    expected: {
      dependencies: [],
      devDependencies: [],
      missing: {},
      using: {
        'grunt-contrib-jshint': ['index.js'],
      },
    },
    expectedErrorCode: 0,
  },
  {
    name: 'find grunt task dependencies',
    module: 'grunt-tasks',
    options: {},
    expected: {
      dependencies: [],
      devDependencies: [],
      missing: {},
      using: {
        'grunt-contrib-jshint': ['index.js'],
      },
    },
    expectedErrorCode: 0,
  },
  {
    name: 'find unused package in devDependencies',
    module: 'dev',
    options: {},
    expected: {
      dependencies: [],
      devDependencies: ['unused-dev-dep'],
      missing: {},
      using: {
        'used-dep': ['index.js'],
      },
    },
    expectedErrorCode: -1,
  },
  {
    name: 'recognize peer dependencies',
    module: 'peer_dep',
    options: {},
    expected: {
      dependencies: ['unused-dep'],
      devDependencies: [],
      missing: {},
      using: {
        host: ['index.js'],
        peer: ['index.js'],
      },
    },
    expectedErrorCode: -1,
  },
  {
    name: 'recognize nested peer dependencies',
    module: 'peer_dep_nested',
    options: {},
    expected: {
      dependencies: ['unused-nested-dep'],
      devDependencies: [],
      missing: {},
      using: {
        host: ['nested/index.js'],
        peer: ['nested/index.js'],
      },
    },
    expectedErrorCode: -1,
  },
  {
    name: 'recognize optional dependencies',
    module: 'optional_dep',
    options: {},
    expected: {
      dependencies: ['unused-dep'],
      devDependencies: [],
      missing: {},
      using: {
        host: ['index.js'],
        optional: ['index.js'],
      },
    },
    expectedErrorCode: -1,
  },
  {
    name: 'recognize nested requires',
    module: 'nested',
    options: {},
    expected: {
      dependencies: [],
      devDependencies: [],
      missing: {},
      using: {
        optimist: ['index.js'],
      },
    },
    expectedErrorCode: 0,
  },
  {
    name: 'handle empty JavaScript file',
    module: 'empty_file',
    options: {},
    expected: {
      dependencies: ['empty-package'],
      devDependencies: [],
      missing: {},
      using: {},
    },
    expectedErrorCode: -1,
  },
  {
    name: 'handle script file with node shebang',
    module: 'shebang',
    options: {},
    expected: {
      dependencies: ['shebang'],
      devDependencies: [],
      missing: {},
      using: {
        'shebang-script': ['index.js'],
      },
    },
    expectedErrorCode: -1,
  },
  {
    name: 'handle a package without any dependencies',
    module: 'empty_dep',
    options: {},
    expected: {
      dependencies: [],
      devDependencies: [],
      missing: {},
      using: {},
    },
    expectedErrorCode: 0,
  },
  {
    name: 'exclude bin dependencies if ignoreBinPackage equal true',
    module: 'bin_js',
    options: {
      ignoreBinPackage: true,
    },
    expected: {
      dependencies: [],
      devDependencies: [],
      missing: {},
      using: {},
    },
    expectedErrorCode: 0,
  },
  {
    name: 'report unused bin dependencies if ignoreBinPackage equal false',
    module: 'bin_js',
    options: {
      ignoreBinPackage: false,
    },
    expected: {
      dependencies: ['anybin', 'upperbin'],
      devDependencies: [],
      missing: {},
      using: {},
    },
    expectedErrorCode: -1,
  },
  {
    name: 'handle dependencies without bin if ignoreBinPackage equal true',
    module: 'good',
    options: {
      ignoreBinPackage: true,
    },
    expected: {
      dependencies: [],
      devDependencies: [],
      missing: {},
      using: {
        optimist: ['index.js'],
        foo: ['index.js'],
      },
    },
    expectedErrorCode: 0,
  },
  {
    name: 'output empty missing dependencies when skipMissing is true',
    module: 'missing',
    options: {
      skipMissing: true,
    },
    expected: {
      dependencies: [],
      devDependencies: [],
      missing: {},
      using: {
        'missing-dep': ['index.js'],
      },
    },
    expectedErrorCode: 0,
  },
  {
    name: 'output missing dependencies when skipMissing is false',
    module: 'missing',
    options: {
      skipMissing: false,
    },
    expected: {
      dependencies: [],
      devDependencies: [],
      missing: {
        'missing-dep': ['index.js'],
      },
      using: {
        'missing-dep': ['index.js'],
      },
    },
    expectedErrorCode: -1,
  },
  {
    name: 'handle require call without parameters',
    module: 'require_nothing',
    options: {},
    expected: {
      dependencies: ['require-nothing'],
      devDependencies: [],
      missing: {},
      using: {},
    },
    expectedErrorCode: -1,
  },
  {
    name: 'handle require call with dynamic expression',
    module: 'require_dynamic',
    options: {},
    expected: {
      dependencies: [],
      devDependencies: [],
      missing: {},
      using: {
        dynamic: ['index.js'],
      },
    },
    expectedErrorCode: 0,
  },
  {
    name: 'ignore ignoreDirs',
    module: 'bad_deep',
    options: {
      ignoreDirs: ['sandbox'],
    },
    expected: {
      dependencies: ['module_bad_deep'],
      devDependencies: [],
      missing: {},
      using: {},
    },
    expectedErrorCode: -1,
  },
  {
    name: 'ignore ignoreMatches',
    module: 'bad',
    options: {
      ignoreMatches: ['o*'],
    },
    expected: {
      dependencies: [],
      devDependencies: [],
      missing: {},
      using: {},
    },
    expectedErrorCode: 0,
  },
  {
    name: 'ignore ignoreMatches for missing',
    module: 'missing_ignore',
    options: {
      ignoreMatches: ['missing-ignore-*', '!missing-ignore-not'],
    },
    expected: {
      dependencies: [],
      devDependencies: [],
      missing: {
        'missing-dep': ['index.js'],
        'missing-ignore-not': ['index.js'],
      },
      using: {
        'missing-dep': ['index.js'],
        'missing-ignore-dep': ['index.js'],
        'missing-ignore-not': ['index.js'],
      },
    },
    expectedErrorCode: -1,
  },
  {
    name: 'support jsx syntax',
    module: 'jsx',
    options: {},
    expected: {
      dependencies: [],
      devDependencies: [],
      missing: {},
      using: {
        react: ['index.jsx'],
      },
    },
    expectedErrorCode: 0,
  },
  {
    name: 'support flow syntax in jsx modules',
    module: 'jsx_flow',
    options: {},
    expected: {
      dependencies: [],
      devDependencies: [],
      missing: {},
      using: {
        react: ['index.jsx'],
      },
    },
    expectedErrorCode: 0,
  },
  {
    name: 'parser jsx syntax in JavaScript file by default',
    module: 'jsx_js',
    options: {},
    expected: {
      dependencies: [],
      devDependencies: [],
      missing: {},
      using: {
        react: ['index.js'],
        'jsx-as-js': ['index.js'],
      },
    },
    expectedErrorCode: 0,
  },
  {
    name: 'support CoffeeScript syntax',
    module: 'coffee_script',
    options: {},
    expected: {
      dependencies: ['coffee'],
      devDependencies: [],
      missing: {},
      using: {
        bar: ['index.coffee'],
        baz: ['index.coffee'],
        foo: ['index.coffee'],
      },
    },
    expectedErrorCode: -1,
  },
  {
    name: 'support scoped modules',
    module: 'scoped_module',
    options: {},
    expected: {
      dependencies: ['@unused/package'],
      devDependencies: [],
      missing: {},
      using: {
        '@owner/package': ['index.js'],
        '@secondowner/package': ['index.js'],
        '@org/parent': ['index.js'],
        'name-import': ['index.js'],
        'child-import': ['index.js'],
      },
    },
    expectedErrorCode: -1,
  },
  {
    name: 'ignore require number',
    module: 'ignore_number',
    options: {},
    expected: {
      dependencies: ['number'],
      devDependencies: [],
      missing: {},
      using: {},
    },
    expectedErrorCode: -1,
  },
  {
    name: 'discover dependencies from mocha opts specified by scripts',
    module: 'mocha_opts',
    options: {},
    expected: {
      dependencies: [],
      devDependencies: ['mocha'],
      missing: {},
      using: {
        babel: ['package.json'],
        chai: ['package.json'],
      },
    },
    expectedErrorCode: -1,
  },
  {
    name: 'discover dependency from express view engine setting',
    module: 'express_view_engine',
    options: {
      detectors: [
        depcheck.detector.requireCallExpression,
        depcheck.detector.expressViewEngine,
      ],
    },
    expected: {
      dependencies: [],
      devDependencies: [],
      missing: {},
      using: {
        ejs: ['index.js'],
        express: ['index.js'],
      },
    },
    expectedErrorCode: 0,
  },
  {
    name: 'follow simlinks',
    module: path.join('simlink', 'package'),
    options: {},
    expected: {
      dependencies: [],
      devDependencies: [],
      missing: {
        lodash: ['index.js'],
        react: ['lib/lib.js'],
      },
      using: {
        lodash: ['index.js'],
        react: ['lib/lib.js'],
      },
    },
    expectedErrorCode: -1,
  },
  {
    name: 'allow decorators',
    module: 'decorators',
    options: {},
    expected: {
      dependencies: [],
      devDependencies: [],
      missing: {},
      using: {
        mobx: ['index.tsx'],
      },
    },
    expectedErrorCode: 0,
  },
  {
    name: 'discover webpack inline loaders',
    module: 'webpack_inline_loader',
    options: {},
    expected: {
      dependencies: [],
      devDependencies: [],
      missing: {
        'another-loader': ['index.js'],
        'script-loader': ['index.js', 'index.ts'],
      },
      using: {
        'another-loader': ['index.js'],
        'script-loader': ['index.js', 'index.ts'],
        'slick-carousel': ['index.js'],
        'slickity-slick': ['index.ts'],
      },
    },
    expectedErrorCode: -1,
  },
  {
    name: 'discover webpack inline loaders with parameters',
    module: 'webpack_loader_with_parameters',
    options: {},
    expected: {
      dependencies: [],
      devDependencies: [],
      missing: {},
      using: {
        'file-loader': ['index.js'],
      },
    },
    expectedErrorCode: 0,
  },
  {
    name: 'support .depcheckignore',
    module: 'depcheckignore',
    options: {},
    expected: {
      dependencies: [],
      devDependencies: ['debug'],
      missing: {
        react: ['used.js'],
      },
      using: {
        lodash: ['used.js'],
        react: ['used.js'],
      },
    },
    expectedErrorCode: -1,
  },
  {
    name: 'support ignorePath',
    module: 'depcheckignore',
    options: { ignorePath: '.depcheckignore' },
    expected: {
      dependencies: [],
      devDependencies: ['debug'],
      missing: {
        react: ['used.js'],
      },
      using: {
        lodash: ['used.js'],
        react: ['used.js'],
      },
    },
    expectedErrorCode: -1,
  },
  {
    name: 'find unused dependencies in Svelte files',
    module: 'svelte',
    options: {},
    expected: {
      dependencies: ['dont-find-me'],
      devDependencies: [],
      missing: {},
      using: {
        'find-me': ['App.svelte'],
        svelte: ['App.svelte'],
      },
    },
    expectedErrorCode: -1,
  },
  {
    name: 'find dependencies in graphql files',
    module: 'graphql',
    options: {},
    expected: {
      dependencies: ['unused'],
      devDependencies: [],
      missing: {
        '@scope/missing': ['test.graphql'],
        missing: ['test.graphql'],
      },
      using: {
        '@scope/missing': ['test.graphql'],
        '@scope/ok': ['test.graphql'],
        missing: ['test.graphql'],
        ok: ['test.graphql'],
      },
    },
    expectedErrorCode: -1,
  },
  {
    name: 'detect dependencies in storybook configuration',
    module: 'storybook',
    options: {},
    expected: {
      dependencies: [],
      devDependencies: ['@storybook/addon-unused'],
      missing: {
        '@storybook/addon-links': ['.storybook/main.js'],
        '@storybook/builder-webpack5': ['.storybook/main.js'],
        '@storybook/manager-webpack5': ['.storybook/main.js'],
      },
      using: {
        '@nx/react': ['.storybook/main.js'],
        '@storybook/addon-essentials': ['.storybook/main.js'],
        '@storybook/addon-links': ['.storybook/main.js'],
        '@storybook/builder-webpack5': ['.storybook/main.js'],
        '@storybook/manager-webpack5': ['.storybook/main.js'],
        '@storybook/react': ['.storybook/main.js'],
        typescript: ['.storybook/main.js'],
      },
    },
    expectedErrorCode: -1,
  },
  {
    name: 'allows url imports',
    module: 'url_import',
    options: {},
    expected: {
      dependencies: [],
      devDependencies: [],
      missing: {},
      using: {},
    },
    expectedErrorCode: 0,
  },
];
