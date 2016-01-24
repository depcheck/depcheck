export default [
  {
    name: 'find unused dependencies',
    module: 'bad',
    options: {
      withoutDev: true,
    },
    expected: {
      dependencies: ['optimist'],
      devDependencies: [],
      missing: {},
      using: {},
    },
  },
  {
    name: 'find unused dependencies in ES6 files',
    module: 'bad_es6',
    options: {
    },
    expected: {
      dependencies: ['dont-find-me'],
      devDependencies: [],
      missing: {},
      using: {
        'find-me': ['index.js'],
        'default-member-import': ['index.js'],
        'member-alias-import': ['index.js'],
        'member-import': ['index.js'],
        'mixed-default-star-import': ['index.js'],
        'mixed-member-alias-import': ['index.js'],
        'mixed-name-memeber-import': ['index.js'],
        'multiple-member-import': ['index.js'],
        'name-import': ['index.js'],
        'star-import': ['index.js'],
      },
    },
  },
  {
    name: 'find all dependencies',
    module: 'good',
    options: {
      withoutDev: true,
    },
    expected: {
      dependencies: [],
      devDependencies: [],
      missing: {},
      using: {
        optimist: ['index.js'],
      },
    },
  },
  {
    // See `good_es6/index.js` file for more information about the unsupported
    // ES6 import syntax, which we assert here as the expected missing import.
    name: 'find all dependencies in ES6 files',
    module: 'good_es6',
    options: {
      withoutDev: true,
    },
    expected: {
      dependencies: ['unsupported-syntax'],
      devDependencies: [],
      missing: {},
      using: {
        'basic-import': ['index.js'],
        'default-member-import': ['index.js'],
        'member-alias-import': ['index.js'],
        'member-import': ['index.js'],
        'mixed-default-star-import': ['index.js'],
        'mixed-member-alias-import': ['index.js'],
        'mixed-name-memeber-import': ['index.js'],
        'multiple-member-import': ['index.js'],
        'name-import': ['index.js'],
        'star-import': ['index.js'],
      },
    },
  },
  {
    name: 'recognize experimental ES7 syntax enabled in Babel by default',
    module: 'good_es7',
    options: {
      withoutDev: true,
    },
    expected: {
      dependencies: [],
      devDependencies: [],
      missing: {},
      using: {
        'ecmascript-rest-spread': ['index.js'],
      },
    },
  },
  {
    name: 'find dependencies used in code but not declared in package.json',
    module: 'missing',
    options: {
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
  },
  {
    name: 'ignore the missing dependencies in nested module',
    module: 'missing_nested',
    options: {
    },
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
  },
  {
    name: 'find grunt dependencies',
    module: 'grunt',
    options: {
      withoutDev: true,
    },
    expected: {
      dependencies: [],
      devDependencies: [],
      missing: {},
      using: {
        'grunt-contrib-jshint': ['index.js'],
      },
    },
  },
  {
    name: 'find grunt task dependencies',
    module: 'grunt-tasks',
    options: {
      withoutDev: true,
    },
    expected: {
      dependencies: [],
      devDependencies: [],
      missing: {},
      using: {
        'grunt-contrib-jshint': ['index.js'],
      },
    },
  },
  {
    name: 'find unused package in devDependencies',
    module: 'dev',
    options: {
      withoutDev: false,
    },
    expected: {
      dependencies: [],
      devDependencies: ['unused-dev-dep'],
      missing: {},
      using: {
        'used-dep': ['index.js'],
      },
    },
  },
  {
    name: 'recognize peer dependencies',
    module: 'peer_dep',
    options: {
    },
    expected: {
      dependencies: ['unused-dep'],
      devDependencies: [],
      missing: {},
      using: {
        host: ['index.js'],
        peer: ['index.js'],
      },
    },
  },
  {
    name: 'recognize nested peer dependencies',
    module: 'peer_dep_nested',
    options: {
    },
    expected: {
      dependencies: ['unused-nested-dep'],
      devDependencies: [],
      missing: {},
      using: {
        host: ['nested/index.js'],
        peer: ['nested/index.js'],
      },
    },
  },
  {
    name: 'recognize optional dependencies',
    module: 'optional_dep',
    options: {
    },
    expected: {
      dependencies: ['unused-dep'],
      devDependencies: [],
      missing: {},
      using: {
        host: ['index.js'],
        optional: ['index.js'],
      },
    },
  },
  {
    name: 'recognize nested requires',
    module: 'nested',
    options: {
    },
    expected: {
      dependencies: [],
      devDependencies: [],
      missing: {},
      using: {
        optimist: ['index.js'],
      },
    },
  },
  {
    name: 'handle empty JavaScript file',
    module: 'empty_file',
    options: {
    },
    expected: {
      dependencies: ['empty-package'],
      devDependencies: [],
      missing: {},
      using: {},
    },
  },
  {
    name: 'handle script file with node shebang',
    module: 'shebang',
    options: {
    },
    expected: {
      dependencies: ['shebang'],
      devDependencies: [],
      missing: {},
      using: {
        'shebang-script': ['index.js'],
      },
    },
  },
  {
    name: 'handle a package without any dependencies',
    module: 'empty_dep',
    options: {
    },
    expected: {
      dependencies: [],
      devDependencies: [],
      missing: {},
      using: {},
    },
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
  },
  {
    name: 'report unused bin dependencies if ignoreBinPackage equal false',
    module: 'bin_js',
    options: {
      ignoreBinPackage: false,
    },
    expected: {
      dependencies: ['anybin'],
      devDependencies: [],
      missing: {},
      using: {},
    },
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
      },
    },
  },
  {
    name: 'not ignore bin dependencies when ignoreBinPackage is false',
    module: 'bin_js',
    options: {
      ignoreBinPackage: false,
    },
    expected: {
      dependencies: ['anybin'],
      devDependencies: [],
      missing: {},
      using: {},
    },
  },
  {
    name: 'handle require call without parameters',
    module: 'require_nothing',
    options: {
    },
    expected: {
      dependencies: ['require-nothing'],
      devDependencies: [],
      missing: {},
      using: {},
    },
  },
  {
    name: 'handle require call with dynamic expression',
    module: 'require_dynamic',
    options: {
    },
    expected: {
      dependencies: [],
      devDependencies: [],
      missing: {},
      using: {
        dynamic: ['index.js'],
      },
    },
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
  },
  {
    name: 'support jsx syntax',
    module: 'jsx',
    options: {
    },
    expected: {
      dependencies: [],
      devDependencies: [],
      missing: {},
      using: {
        react: ['index.jsx'],
      },
    },
  },
  {
    name: 'parser jsx syntax in JavaScript file by default',
    module: 'jsx_js',
    options: {
    },
    expected: {
      dependencies: [],
      devDependencies: [],
      missing: {},
      using: {
        react: ['index.js'],
        'jsx-as-js': ['index.js'],
      },
    },
  },
  {
    name: 'support CoffeeScript syntax',
    module: 'coffee_script',
    options: {
    },
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
  },
  {
    name: 'support scoped modules',
    module: 'scoped_module',
    options: {
    },
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
  },
  {
    name: 'ignore require number',
    module: 'ignore_number',
    options: {
    },
    expected: {
      dependencies: ['number'],
      devDependencies: [],
      missing: {},
      using: {},
    },
  },
  {
    name: 'discover dependencies from mocha opts specified by scripts',
    module: 'mocha_opts',
    options: {
    },
    expected: {
      dependencies: [],
      devDependencies: ['mocha'],
      missing: {},
      using: {
        babel: ['package.json'],
        chai: ['package.json'],
      },
    },
  },
];
