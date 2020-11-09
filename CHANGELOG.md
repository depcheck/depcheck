# Changelog

## [1.3.1](https://github.com/depcheck/depcheck/tree/1.3.1) (2020-11-09)

[Full Changelog](https://github.com/depcheck/depcheck/compare/1.3.0...1.3.1)

**Merged pull requests:**

- Fix extracting dependencies from webpack [\#602](https://github.com/depcheck/depcheck/pull/602) ([rumpl](https://github.com/rumpl))

## [1.3.0](https://github.com/depcheck/depcheck/tree/1.3.0) (2020-11-09)

[Full Changelog](https://github.com/depcheck/depcheck/compare/1.2.0...1.3.0)

**Fixed bugs:**

- False positive: eslint import resolvers [\#571](https://github.com/depcheck/depcheck/issues/571)

**Closed issues:**

- false alert for React 17 [\#591](https://github.com/depcheck/depcheck/issues/591)
- false alert with typescript path aliases [\#590](https://github.com/depcheck/depcheck/issues/590)
- Allow to define patterns against absolute file path \(again\) [\#589](https://github.com/depcheck/depcheck/issues/589)
- Can't read property 'name' of undefined [\#579](https://github.com/depcheck/depcheck/issues/579)
- Support .\*ignore files [\#497](https://github.com/depcheck/depcheck/issues/497)

**Merged pull requests:**

- Update dependencies [\#599](https://github.com/depcheck/depcheck/pull/599) ([rumpl](https://github.com/rumpl))
- Support webpack's `oneOf` in rules [\#598](https://github.com/depcheck/depcheck/pull/598) ([rumpl](https://github.com/rumpl))
- Fix eslint when eslint-plugin-import is used [\#597](https://github.com/depcheck/depcheck/pull/597) ([rumpl](https://github.com/rumpl))
- The error thrown is not always a YAML error [\#596](https://github.com/depcheck/depcheck/pull/596) ([rumpl](https://github.com/rumpl))
- Support parser patterns based on file paths [\#595](https://github.com/depcheck/depcheck/pull/595) ([rumpl](https://github.com/rumpl))
- Support react \>= 17.0.0 that doesn't need to be imported [\#594](https://github.com/depcheck/depcheck/pull/594) ([rumpl](https://github.com/rumpl))
- Use the promise version of the api in the example [\#593](https://github.com/depcheck/depcheck/pull/593) ([rumpl](https://github.com/rumpl))
- Add option to run depcheck through npx [\#586](https://github.com/depcheck/depcheck/pull/586) ([elrumordelaluz](https://github.com/elrumordelaluz))
- fix\(sass-parser\): ignore local import in scss  [\#581](https://github.com/depcheck/depcheck/pull/581) ([YonatanKra](https://github.com/YonatanKra))
- Improved webpack support [\#580](https://github.com/depcheck/depcheck/pull/580) ([cwillisf](https://github.com/cwillisf))

## [1.2.0](https://github.com/depcheck/depcheck/tree/1.2.0) (2020-08-12)

[Full Changelog](https://github.com/depcheck/depcheck/compare/1.0.0...1.2.0)

**Closed issues:**

- Sass 'use' syntax not working [\#576](https://github.com/depcheck/depcheck/issues/576)
- depcheck should ignore depcheck by default [\#565](https://github.com/depcheck/depcheck/issues/565)
- False unused dev dependencies report  [\#560](https://github.com/depcheck/depcheck/issues/560)
- False alert for eslint packages [\#554](https://github.com/depcheck/depcheck/issues/554)
- Bug: specials are not working [\#551](https://github.com/depcheck/depcheck/issues/551)
- depcheck should ignore hidden folders and files [\#543](https://github.com/depcheck/depcheck/issues/543)
- ignore-patterns option from readme description is not supported in latest release [\#537](https://github.com/depcheck/depcheck/issues/537)
- Option to exit without error code \(when running via "npm run depcheck"\) [\#533](https://github.com/depcheck/depcheck/issues/533)
- babelrc format [\#527](https://github.com/depcheck/depcheck/issues/527)
- Support Gatsby plugins with resolve [\#525](https://github.com/depcheck/depcheck/issues/525)

**Merged pull requests:**

- fix: now supports multi ignore in ignorePattern [\#578](https://github.com/depcheck/depcheck/pull/578) ([YonatanKra](https://github.com/YonatanKra))
- feat\(sass parser\): support @use and namespace syntax [\#577](https://github.com/depcheck/depcheck/pull/577) ([YonatanKra](https://github.com/YonatanKra))
- Add resolve and nested dependency check for Gatsby [\#573](https://github.com/depcheck/depcheck/pull/573) ([nagygergo](https://github.com/nagygergo))
- fix: support eslint config that needs to be required [\#561](https://github.com/depcheck/depcheck/pull/561) ([znarf](https://github.com/znarf))
- Feat: Special for serverless config [\#559](https://github.com/depcheck/depcheck/pull/559) ([mzl-md](https://github.com/mzl-md))
- Add node 14.x to the matrix [\#557](https://github.com/depcheck/depcheck/pull/557) ([rumpl](https://github.com/rumpl))
- Try to parse JSON5 babelrc files [\#556](https://github.com/depcheck/depcheck/pull/556) ([rumpl](https://github.com/rumpl))
- chore: update all dependencies \(July 2020\) [\#555](https://github.com/depcheck/depcheck/pull/555) ([znarf](https://github.com/znarf))

## [1.0.0](https://github.com/depcheck/depcheck/tree/1.0.0) (2020-05-14)

[Full Changelog](https://github.com/depcheck/depcheck/compare/0.9.2...1.0.0)

**Closed issues:**

- Error when running from script [\#531](https://github.com/depcheck/depcheck/issues/531)
- Missing Changelog for 0.9.2 [\#521](https://github.com/depcheck/depcheck/issues/521)
- Depcheck should only process files that are relevant to depcheck [\#420](https://github.com/depcheck/depcheck/issues/420)
- False positive when using inline Webpack loader  [\#236](https://github.com/depcheck/depcheck/issues/236)
- Dependencies out of date [\#273](https://github.com/depcheck/depcheck/issues/273)
- Add support for @types declaration packages [\#163](https://github.com/depcheck/depcheck/issues/163)
- Improvements for CI use [\#162](https://github.com/depcheck/depcheck/issues/162)

**Merged pull requests:**

- fix: sass parser not working with monorepo setup [\#536](https://github.com/depcheck/depcheck/pull/536) ([yingzhe](https://github.com/yingzhe))
- chore: build on linux and windows on GH actions [\#535](https://github.com/depcheck/depcheck/pull/535) ([rumpl](https://github.com/rumpl))
- Chore update deps [\#534](https://github.com/depcheck/depcheck/pull/534) ([rumpl](https://github.com/rumpl))
- Support resolve.alias in fakeConfig for next.js [\#532](https://github.com/depcheck/depcheck/pull/532) ([znarf](https://github.com/znarf))
- feat: Detect inline webpack loaders [\#520](https://github.com/depcheck/depcheck/pull/520) ([rumpl](https://github.com/rumpl))
- chore: Update all dependencies [\#519](https://github.com/depcheck/depcheck/pull/519) ([rumpl](https://github.com/rumpl))
- Config cli argument [\#517](https://github.com/depcheck/depcheck/pull/517) ([dword-design](https://github.com/dword-design))
- Support for .\*ignore files [\#498](https://github.com/depcheck/depcheck/pull/498) ([znarf](https://github.com/znarf))
- Add export detection \(`export x from y`\) [\#272](https://github.com/depcheck/depcheck/pull/272) ([mnkhouri](https://github.com/mnkhouri))
- Bump nyc to 13.x [\#267](https://github.com/depcheck/depcheck/pull/267) ([LinusU](https://github.com/LinusU))
- Enable the plugins for Typescript parser, too [\#258](https://github.com/depcheck/depcheck/pull/258) ([cdagli](https://github.com/cdagli))

## [0.9.2](https://github.com/depcheck/depcheck/tree/0.9.2) (2020-01-30)

[Full Changelog](https://github.com/depcheck/depcheck/compare/0.9.1...0.9.2)

**Closed issues:**

- Use Cosmiconfig [\#516](https://github.com/depcheck/depcheck/issues/516)
- Feature: add special parser for Istanbul.js [\#508](https://github.com/depcheck/depcheck/issues/508)
- New mocha configuration file not seen [\#507](https://github.com/depcheck/depcheck/issues/507)
- False positive with @types/mocha [\#504](https://github.com/depcheck/depcheck/issues/504)
- Error: ENFILE: file table overflow \(macOS\) [\#501](https://github.com/depcheck/depcheck/issues/501)
- eslint: dependency wrongly mark as unused [\#500](https://github.com/depcheck/depcheck/issues/500)
- special/eslint: bad calculation of preset dependencies [\#476](https://github.com/depcheck/depcheck/issues/476)
- Load ignore rules from a lines separated file [\#409](https://github.com/depcheck/depcheck/issues/409)

**Merged pull requests:**

- Review special documentation [\#515](https://github.com/depcheck/depcheck/pull/515) ([sveyret](https://github.com/sveyret))
- Add Istanbul special parser [\#514](https://github.com/depcheck/depcheck/pull/514) ([sveyret](https://github.com/sveyret))
- Refactor: read content only when needed [\#513](https://github.com/depcheck/depcheck/pull/513) ([znarf](https://github.com/znarf))
- Add `debug` package and messages to the project [\#512](https://github.com/depcheck/depcheck/pull/512) ([znarf](https://github.com/znarf))
- Support for more decorators [\#511](https://github.com/depcheck/depcheck/pull/511) ([micky2be](https://github.com/micky2be))
- Improve recursive work of eslint configuration check [\#506](https://github.com/depcheck/depcheck/pull/506) ([sveyret](https://github.com/sveyret))
- Improvements for mocha [\#505](https://github.com/depcheck/depcheck/pull/505) ([sveyret](https://github.com/sveyret))
- Support webpack styleguidist configuration [\#503](https://github.com/depcheck/depcheck/pull/503) ([znarf](https://github.com/znarf))
- Use a single promise to read a given file [\#502](https://github.com/depcheck/depcheck/pull/502) ([znarf](https://github.com/znarf))
- Support for next.js webpack configuration [\#496](https://github.com/depcheck/depcheck/pull/496) ([znarf](https://github.com/znarf))
- Rename 'linters' and fix babel config file detection [\#495](https://github.com/depcheck/depcheck/pull/495) ([znarf](https://github.com/znarf))
- Suppress unnecessary fileContent [\#494](https://github.com/depcheck/depcheck/pull/494) ([znarf](https://github.com/znarf))
- Update travis commands and reference [\#493](https://github.com/depcheck/depcheck/pull/493) ([znarf](https://github.com/znarf))
- Add eslint-plugin-mocha and lint test directory [\#492](https://github.com/depcheck/depcheck/pull/492) ([znarf](https://github.com/znarf))
- Better prettier configuration [\#490](https://github.com/depcheck/depcheck/pull/490) ([znarf](https://github.com/znarf))
- Remove remaining dev option [\#489](https://github.com/depcheck/depcheck/pull/489) ([znarf](https://github.com/znarf))
- chore: remove editorconfig file [\#488](https://github.com/depcheck/depcheck/pull/488) ([rumpl](https://github.com/rumpl))
- Update babel target to node 10, use prettier plugin [\#487](https://github.com/depcheck/depcheck/pull/487) ([rumpl](https://github.com/rumpl))
- chore\(deps\): Update all dependencies to latest [\#486](https://github.com/depcheck/depcheck/pull/486) ([rumpl](https://github.com/rumpl))
- Do not calculate expensive dep differences when skipMissing is active [\#485](https://github.com/depcheck/depcheck/pull/485) ([dword-design](https://github.com/dword-design))
- Adjust babel special to eslint implementation [\#484](https://github.com/depcheck/depcheck/pull/484) ([dword-design](https://github.com/dword-design))
- Add deps parameter to detectors [\#482](https://github.com/depcheck/depcheck/pull/482) ([dword-design](https://github.com/dword-design))
- Activating Open Collective [\#481](https://github.com/depcheck/depcheck/pull/481) ([monkeywithacupcake](https://github.com/monkeywithacupcake))
- Document and provide types for the API's package option [\#479](https://github.com/depcheck/depcheck/pull/479) ([edsrzf](https://github.com/edsrzf))
- Try to load eslint.js modules without a module.exports wrapper [\#478](https://github.com/depcheck/depcheck/pull/478) ([rjatkins](https://github.com/rjatkins))
- special/eslint: corrections on dependencies resolver [\#477](https://github.com/depcheck/depcheck/pull/477) ([sveyret](https://github.com/sveyret))
- chore: add changelog file [\#475](https://github.com/depcheck/depcheck/pull/475) ([rumpl](https://github.com/rumpl))
- Support loading configuration from a config file. [\#408](https://github.com/depcheck/depcheck/pull/408) ([Urik](https://github.com/Urik))

## [0.9.1](https://github.com/depcheck/depcheck/tree/0.9.1) (2019-11-08)

[Full Changelog](https://github.com/depcheck/depcheck/compare/0.9.0...0.9.1)

**Closed issues:**

- Core packages are labeled as unused [\#462](https://github.com/depcheck/depcheck/issues/462)
- Packages used inside package.json are not detected [\#461](https://github.com/depcheck/depcheck/issues/461)
- False positives when using multiple package.json files [\#441](https://github.com/depcheck/depcheck/issues/441)
- Use prettier [\#431](https://github.com/depcheck/depcheck/issues/431)
- Incorrect unused dependencies in react-ace [\#414](https://github.com/depcheck/depcheck/issues/414)
- option --json changes return status [\#407](https://github.com/depcheck/depcheck/issues/407)
- False positive: eslint-config-eslint:all [\#404](https://github.com/depcheck/depcheck/issues/404)
- False positive: eslint-config-prettier [\#330](https://github.com/depcheck/depcheck/issues/330)
- False Alert with pre-commit module [\#320](https://github.com/depcheck/depcheck/issues/320)
- False positiv husky [\#315](https://github.com/depcheck/depcheck/issues/315)
- False positive tslint-plugin-prettier, tslint-react, tslint-sonarts [\#314](https://github.com/depcheck/depcheck/issues/314)
- False dependency when using ESLint vue plugin [\#239](https://github.com/depcheck/depcheck/issues/239)
- False positive when using vue-sticky in a vue component [\#238](https://github.com/depcheck/depcheck/issues/238)
- devDependencies defined in package scripts not detected. [\#200](https://github.com/depcheck/depcheck/issues/200)
- Support ESLint YAML and JS config. [\#150](https://github.com/depcheck/depcheck/issues/150)

**Merged pull requests:**

- Support prettier shared configuration [\#474](https://github.com/depcheck/depcheck/pull/474) ([sveyret](https://github.com/sveyret))
- Use node resolution for dependencies [\#473](https://github.com/depcheck/depcheck/pull/473) ([sveyret](https://github.com/sveyret))
- Automate building of TypeScript definitions [\#470](https://github.com/depcheck/depcheck/pull/470) ([sveyret](https://github.com/sveyret))
- Add TTypeScript transformer special parser [\#469](https://github.com/depcheck/depcheck/pull/469) ([sveyret](https://github.com/sveyret))
- chore: update node requirement in package.json and readme [\#467](https://github.com/depcheck/depcheck/pull/467) ([rumpl](https://github.com/rumpl))
- chore: Update closing time in stale bot [\#466](https://github.com/depcheck/depcheck/pull/466) ([rumpl](https://github.com/rumpl))
- feat: return error code even if output is json [\#465](https://github.com/depcheck/depcheck/pull/465) ([rumpl](https://github.com/rumpl))
- feat: Activate eslint-config-prettier on plugin:prettier/recommended [\#464](https://github.com/depcheck/depcheck/pull/464) ([rumpl](https://github.com/rumpl))
- Add prettier [\#463](https://github.com/depcheck/depcheck/pull/463) ([VincentLanglet](https://github.com/VincentLanglet))
- Load typescript transpiler if available [\#459](https://github.com/depcheck/depcheck/pull/459) ([sveyret](https://github.com/sveyret))
- Add index.d.ts [\#458](https://github.com/depcheck/depcheck/pull/458) ([VincentLanglet](https://github.com/VincentLanglet))
- feat: Handle tslint-plugin-prettier [\#457](https://github.com/depcheck/depcheck/pull/457) ([rumpl](https://github.com/rumpl))
- Add lint-staged config parser [\#456](https://github.com/depcheck/depcheck/pull/456) ([VincentLanglet](https://github.com/VincentLanglet))
- Run actions only on pull request [\#454](https://github.com/depcheck/depcheck/pull/454) ([rumpl](https://github.com/rumpl))
- Add husky special parser [\#453](https://github.com/depcheck/depcheck/pull/453) ([rumpl](https://github.com/rumpl))

## [0.9.0](https://github.com/depcheck/depcheck/tree/0.9.0) (2019-11-01)

[Full Changelog](https://github.com/depcheck/depcheck/compare/0.8.4...0.9.0)

**Closed issues:**

- special/webpack: babel-loader presets are not detected [\#448](https://github.com/depcheck/depcheck/issues/448)
- special/webpack: entries should also be scanned [\#446](https://github.com/depcheck/depcheck/issues/446)
- TypeScript: false positive for node built-in module types [\#444](https://github.com/depcheck/depcheck/issues/444)
- False alert: TypeScript import type not detected [\#438](https://github.com/depcheck/depcheck/issues/438)
- Node modules may be in parent directories [\#436](https://github.com/depcheck/depcheck/issues/436)
- 12x more useful if Missing dependencies includes the file it was found it [\#428](https://github.com/depcheck/depcheck/issues/428)
- body-parser [\#423](https://github.com/depcheck/depcheck/issues/423)

**Merged pull requests:**

- special/webpack: Use tryRequire to load configuration file [\#451](https://github.com/depcheck/depcheck/pull/451) ([sveyret](https://github.com/sveyret))
- chore: Remove the deprecated flag [\#450](https://github.com/depcheck/depcheck/pull/450) ([rumpl](https://github.com/rumpl))
- special/webpack improvements [\#449](https://github.com/depcheck/depcheck/pull/449) ([sveyret](https://github.com/sveyret))
- Add code of conduct [\#447](https://github.com/depcheck/depcheck/pull/447) ([rumpl](https://github.com/rumpl))
- TypeScript: detect node built-in type usage [\#445](https://github.com/depcheck/depcheck/pull/445) ([sveyret](https://github.com/sveyret))
- Add stale robot [\#443](https://github.com/depcheck/depcheck/pull/443) ([rumpl](https://github.com/rumpl))
- Drop support for node 8 [\#442](https://github.com/depcheck/depcheck/pull/442) ([rumpl](https://github.com/rumpl))
- Add a detector for typescript import type [\#439](https://github.com/depcheck/depcheck/pull/439) ([sveyret](https://github.com/sveyret))
- special/bin: climb up directories to find binary module [\#437](https://github.com/depcheck/depcheck/pull/437) ([sveyret](https://github.com/sveyret))
- Add paths for missing dependencies [\#433](https://github.com/depcheck/depcheck/pull/433) ([rumpl](https://github.com/rumpl))

## [0.8.4](https://github.com/depcheck/depcheck/tree/0.8.4) (2019-10-29)

[Full Changelog](https://github.com/depcheck/depcheck/compare/0.8.3...0.8.4)

**Security fixes:**

- \[Security\] Bump lodash from 4.17.11 to 4.17.13 [\#381](https://github.com/depcheck/depcheck/pull/381) ([dependabot-preview[bot]](https://github.com/apps/dependabot-preview))

**Closed issues:**

- depcheck false alert \(svg-sprite-loader, svgo-loader\) [\#425](https://github.com/depcheck/depcheck/issues/425)
- False alert: dep imported in d.ts file [\#421](https://github.com/depcheck/depcheck/issues/421)
- False Alert for "fs" [\#412](https://github.com/depcheck/depcheck/issues/412)
- Github dependencies not recursing? [\#410](https://github.com/depcheck/depcheck/issues/410)
- show react jsx file by  [\#405](https://github.com/depcheck/depcheck/issues/405)
- Typescript @types false positive [\#402](https://github.com/depcheck/depcheck/issues/402)
- false report on dependency [\#401](https://github.com/depcheck/depcheck/issues/401)

**Merged pull requests:**

- Add support for babel 7's scoped plugins [\#432](https://github.com/depcheck/depcheck/pull/432) ([d-fischer](https://github.com/d-fischer))
- Update dependencies to latest [\#430](https://github.com/depcheck/depcheck/pull/430) ([rumpl](https://github.com/rumpl))
- docs: fix typos [\#424](https://github.com/depcheck/depcheck/pull/424) ([piperchester](https://github.com/piperchester))
- Use babel on typescript and support @types [\#422](https://github.com/depcheck/depcheck/pull/422) ([conartist6](https://github.com/conartist6))
- Add support for integration tests jest configuration [\#415](https://github.com/depcheck/depcheck/pull/415) ([idan-at](https://github.com/idan-at))
- added fixed for eslint:all and updated deps [\#406](https://github.com/depcheck/depcheck/pull/406) ([KaboomFox](https://github.com/KaboomFox))
- Bump @babel/cli from 7.5.0 to 7.5.5 [\#390](https://github.com/depcheck/depcheck/pull/390) ([dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
- Bump yargs from 13.2.4 to 13.3.0 [\#389](https://github.com/depcheck/depcheck/pull/389) ([dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
- Bump eslint-config-airbnb from 17.1.0 to 17.1.1 [\#388](https://github.com/depcheck/depcheck/pull/388) ([dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
- Bump proxyquire from 2.1.0 to 2.1.1 [\#387](https://github.com/depcheck/depcheck/pull/387) ([dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
- Bump fs-extra from 7.0.1 to 8.1.0 [\#386](https://github.com/depcheck/depcheck/pull/386) ([dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
- Bump lodash from 4.17.13 to 4.17.14 [\#385](https://github.com/depcheck/depcheck/pull/385) ([dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
- Bump @babel/cli from 7.4.4 to 7.5.0 [\#384](https://github.com/depcheck/depcheck/pull/384) ([dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
- Bump @babel/parser from 7.4.4 to 7.5.0 [\#383](https://github.com/depcheck/depcheck/pull/383) ([dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
- Bump eslint-plugin-jsx-a11y from 6.2.1 to 6.2.3 [\#382](https://github.com/depcheck/depcheck/pull/382) ([dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
- chore: Imort vue-template-compiler directly [\#379](https://github.com/depcheck/depcheck/pull/379) ([rumpl](https://github.com/rumpl))
- Bump @babel/preset-env from 7.4.4 to 7.5.4 [\#378](https://github.com/depcheck/depcheck/pull/378) ([dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
- Bump babel-eslint from 10.0.1 to 10.0.2 [\#377](https://github.com/depcheck/depcheck/pull/377) ([dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
- Bump @babel/core from 7.4.4 to 7.5.4 [\#375](https://github.com/depcheck/depcheck/pull/375) ([dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
- Bump resolve from 1.10.1 to 1.11.1 [\#372](https://github.com/depcheck/depcheck/pull/372) ([dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
- Bump nyc from 14.1.0 to 14.1.1 [\#371](https://github.com/depcheck/depcheck/pull/371) ([dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
- Bump typescript from 3.4.5 to 3.5.3 [\#370](https://github.com/depcheck/depcheck/pull/370) ([dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
- Bump yargs from 13.2.2 to 13.2.4 [\#368](https://github.com/depcheck/depcheck/pull/368) ([dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
- Bump codecov from 3.3.0 to 3.5.0 [\#366](https://github.com/depcheck/depcheck/pull/366) ([dependabot-preview[bot]](https://github.com/apps/dependabot-preview))

## [0.8.3](https://github.com/depcheck/depcheck/tree/0.8.3) (2019-07-09)

[Full Changelog](https://github.com/depcheck/depcheck/compare/0.8.2...0.8.3)

**Closed issues:**

- False alert on vue-click-outside [\#361](https://github.com/depcheck/depcheck/issues/361)
- Invalid files caused by flow type annotations? [\#353](https://github.com/depcheck/depcheck/issues/353)

**Merged pull requests:**

- support flow syntax in es7 and jsx parsers [\#373](https://github.com/depcheck/depcheck/pull/373) ([jrnail23](https://github.com/jrnail23))
- Bump eslint-plugin-import from 2.17.2 to 2.18.0 [\#364](https://github.com/depcheck/depcheck/pull/364) ([dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
- Bump eslint-plugin-react from 7.13.0 to 7.14.2 [\#363](https://github.com/depcheck/depcheck/pull/363) ([dependabot-preview[bot]](https://github.com/apps/dependabot-preview))

## [0.8.2](https://github.com/depcheck/depcheck/tree/0.8.2) (2019-07-03)

[Full Changelog](https://github.com/depcheck/depcheck/compare/0.8.1...0.8.2)

**Closed issues:**

- False positive when only importing typescript interfaces \(so no runtime code\) from a package [\#359](https://github.com/depcheck/depcheck/issues/359)
- Add support for Jest [\#285](https://github.com/depcheck/depcheck/issues/285)
- Find a solution to declare peer dependencies [\#130](https://github.com/depcheck/depcheck/issues/130)

**Merged pull requests:**

- fix: Fix vue integration [\#362](https://github.com/depcheck/depcheck/pull/362) ([rumpl](https://github.com/rumpl))
- Fixing Issue \#200: packages with bin that haven't been detected [\#358](https://github.com/depcheck/depcheck/pull/358) ([2roy999](https://github.com/2roy999))

## [0.8.1](https://github.com/depcheck/depcheck/tree/0.8.1) (2019-05-25)

[Full Changelog](https://github.com/depcheck/depcheck/compare/0.8.0...0.8.1)

**Closed issues:**

- Monorepo support? [\#349](https://github.com/depcheck/depcheck/issues/349)
- peerDepdencies of a used package not considered [\#341](https://github.com/depcheck/depcheck/issues/341)
- false alert on mocha-jenkins-reporter \(cant seem to add `help wanted` label\) [\#287](https://github.com/depcheck/depcheck/issues/287)
- Symlinked files are ignored [\#256](https://github.com/depcheck/depcheck/issues/256)

**Merged pull requests:**

- Jest support [\#351](https://github.com/depcheck/depcheck/pull/351) ([GarrettGeorge](https://github.com/GarrettGeorge))
- Changes webpack regex to support 'webpack.conf.js' [\#350](https://github.com/depcheck/depcheck/pull/350) ([GarrettGeorge](https://github.com/GarrettGeorge))
- feat: Make walkdir follow symlinks [\#347](https://github.com/depcheck/depcheck/pull/347) ([rumpl](https://github.com/rumpl))
- chore: Create a draft release form travis, update oauth key [\#344](https://github.com/depcheck/depcheck/pull/344) ([rumpl](https://github.com/rumpl))

## [0.8.0](https://github.com/depcheck/depcheck/tree/0.8.0) (2019-05-08)

[Full Changelog](https://github.com/depcheck/depcheck/compare/0.7.2...0.8.0)

**Fixed bugs:**

- The cli option --ignore-dirs seems not to work [\#331](https://github.com/depcheck/depcheck/issues/331)
- False positive eslint-config-prettier eslint-plugin-prettier [\#316](https://github.com/depcheck/depcheck/issues/316)

**Closed issues:**

- scss dependency false report  [\#322](https://github.com/depcheck/depcheck/issues/322)
- requires using template literals report as missing dependencies [\#243](https://github.com/depcheck/depcheck/issues/243)

**Merged pull requests:**

- chore: Update all dependencies, make tests pass [\#343](https://github.com/depcheck/depcheck/pull/343) ([rumpl](https://github.com/rumpl))
- Fix typos in README [\#337](https://github.com/depcheck/depcheck/pull/337) ([newsroomdev](https://github.com/newsroomdev))
- add babel plugins to vue special [\#335](https://github.com/depcheck/depcheck/pull/335) ([dword-design](https://github.com/dword-design))
- fixed the inclusion syntax of babel plugins [\#334](https://github.com/depcheck/depcheck/pull/334) ([dword-design](https://github.com/dword-design))
- updated readme to include gatsby [\#332](https://github.com/depcheck/depcheck/pull/332) ([KaboomFox](https://github.com/KaboomFox))
- detector: allow template literals in require calls [\#329](https://github.com/depcheck/depcheck/pull/329) ([43081j](https://github.com/43081j))
- added gatsby special [\#328](https://github.com/depcheck/depcheck/pull/328) ([KaboomFox](https://github.com/KaboomFox))
- lint: add support for custom config files [\#327](https://github.com/depcheck/depcheck/pull/327) ([43081j](https://github.com/43081j))
- eslint: add support for package.json configuration [\#326](https://github.com/depcheck/depcheck/pull/326) ([43081j](https://github.com/43081j))
- bugfix: include tslint in deps when a tslintrc exists [\#325](https://github.com/depcheck/depcheck/pull/325) ([43081j](https://github.com/43081j))
- use file instead of content. [\#324](https://github.com/depcheck/depcheck/pull/324) ([KaboomFox](https://github.com/KaboomFox))
- cleanup mocha implementation [\#311](https://github.com/depcheck/depcheck/pull/311) ([43081j](https://github.com/43081j))
- correct resolution of lint `extends` packages [\#309](https://github.com/depcheck/depcheck/pull/309) ([43081j](https://github.com/43081j))

## [0.7.2](https://github.com/depcheck/depcheck/tree/0.7.2) (2019-02-28)

[Full Changelog](https://github.com/depcheck/depcheck/compare/0.7.1...0.7.2)

**Closed issues:**

- Support .depcheckrc or depcheck.config.js config file [\#318](https://github.com/depcheck/depcheck/issues/318)

**Merged pull requests:**

- Add sass support for tilde [\#323](https://github.com/depcheck/depcheck/pull/323) ([KaboomFox](https://github.com/KaboomFox))
- fixed pluggable-design.md [\#313](https://github.com/depcheck/depcheck/pull/313) ([0xflotus](https://github.com/0xflotus))

## [0.7.1](https://github.com/depcheck/depcheck/tree/0.7.1) (2019-01-27)

[Full Changelog](https://github.com/depcheck/depcheck/compare/0.7.0...0.7.1)

**Fixed bugs:**

- unused dependency "querystring" : false positive [\#170](https://github.com/depcheck/depcheck/issues/170)

**Closed issues:**

- False alert for ejs package using expressjs [\#289](https://github.com/depcheck/depcheck/issues/289)

## [0.7.0](https://github.com/depcheck/depcheck/tree/0.7.0) (2019-01-26)

[Full Changelog](https://github.com/depcheck/depcheck/compare/0.6.11...0.7.0)

**Fixed bugs:**

- Error: toString failed [\#100](https://github.com/depcheck/depcheck/issues/100)

**Closed issues:**

- 0.7.0-beta.1 is older than 0.7.0-alpha.1 [\#304](https://github.com/depcheck/depcheck/issues/304)
- Check child\_processes [\#302](https://github.com/depcheck/depcheck/issues/302)
- False alert: babel-preset-expo [\#301](https://github.com/depcheck/depcheck/issues/301)
- onlyMatch [\#298](https://github.com/depcheck/depcheck/issues/298)
- Bug report template contains an error [\#296](https://github.com/depcheck/depcheck/issues/296)
- doesn't seem to detect require\('os'\) in source [\#294](https://github.com/depcheck/depcheck/issues/294)
- No dependencies are detected in files using optional chaining [\#291](https://github.com/depcheck/depcheck/issues/291)
- depcheck error for workbox-build [\#290](https://github.com/depcheck/depcheck/issues/290)
- Implement a test using only production dependencies [\#281](https://github.com/depcheck/depcheck/issues/281)
- TypeError: Cannot read property 'ModuleKind' of null [\#280](https://github.com/depcheck/depcheck/issues/280)
- False "unused dependencies" for `export ... from ...` [\#262](https://github.com/depcheck/depcheck/issues/262)
- False positive when using vuegister with mocha  [\#241](https://github.com/depcheck/depcheck/issues/241)
- Doesn't appear to work 0.6.7 [\#220](https://github.com/depcheck/depcheck/issues/220)
- For most of the modules I use in my gruntfile.js are showing as Unused devDependencies, why? [\#214](https://github.com/depcheck/depcheck/issues/214)
- Unused devDependencies with Karma [\#188](https://github.com/depcheck/depcheck/issues/188)
- Unused url dependency [\#187](https://github.com/depcheck/depcheck/issues/187)
- better --ignores documentation [\#164](https://github.com/depcheck/depcheck/issues/164)
- False unused alert for local CLI tools/ binaries. [\#145](https://github.com/depcheck/depcheck/issues/145)
- Add scenario test infrastructure. [\#128](https://github.com/depcheck/depcheck/issues/128)

**Merged pull requests:**

- Replace babylon with @babel/parser, and upgrade all babel dependencies [\#307](https://github.com/depcheck/depcheck/pull/307) ([rjatkins](https://github.com/rjatkins))
- Karma support [\#306](https://github.com/depcheck/depcheck/pull/306) ([rjatkins](https://github.com/rjatkins))
- use eslint name normalization [\#305](https://github.com/depcheck/depcheck/pull/305) ([43081j](https://github.com/43081j))
- Remove dpcheck-web to mitigate security vulnerability. [\#300](https://github.com/depcheck/depcheck/pull/300) ([lijunle](https://github.com/lijunle))
- Fixes vulnerability on lodash version [\#293](https://github.com/depcheck/depcheck/pull/293) ([Streppel](https://github.com/Streppel))
- Upgrade NPM in CI to a version that uses package-lock.json [\#286](https://github.com/depcheck/depcheck/pull/286) ([mnkhouri](https://github.com/mnkhouri))
- Improve regex in `parseLinter\(\)` [\#284](https://github.com/depcheck/depcheck/pull/284) ([hassankhan](https://github.com/hassankhan))
- Add tests for esnext syntax in Typescript [\#283](https://github.com/depcheck/depcheck/pull/283) ([mnkhouri](https://github.com/mnkhouri))
- Update NPM tokens with correct permissions [\#279](https://github.com/depcheck/depcheck/pull/279) ([mnkhouri](https://github.com/mnkhouri))
- Upgrade all dependencies [\#276](https://github.com/depcheck/depcheck/pull/276) ([nkbt](https://github.com/nkbt))
- Friendly error messages for node \< 4 [\#219](https://github.com/depcheck/depcheck/pull/219) ([sudo-suhas](https://github.com/sudo-suhas))

## [0.6.11](https://github.com/depcheck/depcheck/tree/0.6.11) (2018-08-23)

[Full Changelog](https://github.com/depcheck/depcheck/compare/0.6.10...0.6.11)

## [0.6.10](https://github.com/depcheck/depcheck/tree/0.6.10) (2018-08-23)

[Full Changelog](https://github.com/depcheck/depcheck/compare/0.6.10-beta.2...0.6.10)

**Closed issues:**

- Deploy failed \(invalid NPM token?\) [\#275](https://github.com/depcheck/depcheck/issues/275)
- Next Release \(0.6.10\) [\#265](https://github.com/depcheck/depcheck/issues/265)

**Merged pull requests:**

- Add support for TSLint [\#266](https://github.com/depcheck/depcheck/pull/266) ([LinusU](https://github.com/LinusU))
- Fix typo: pasers -\> parsers [\#263](https://github.com/depcheck/depcheck/pull/263) ([mnkhouri](https://github.com/mnkhouri))
- Support Vue.js \(closes \#195\) [\#254](https://github.com/depcheck/depcheck/pull/254) ([oligot](https://github.com/oligot))
- Fix ignore-bin-package default in ReadMe [\#252](https://github.com/depcheck/depcheck/pull/252) ([ronkorving](https://github.com/ronkorving))
- Support for eslint's 'plugin:' prefixed specifiers [\#250](https://github.com/depcheck/depcheck/pull/250) ([buddydvd](https://github.com/buddydvd))
- Recognize object array loaders in module.rules.loaders [\#233](https://github.com/depcheck/depcheck/pull/233) ([alexgerv](https://github.com/alexgerv))
- Fixed support of jsx syntax [\#230](https://github.com/depcheck/depcheck/pull/230) ([yurii-sorokin](https://github.com/yurii-sorokin))
- Add support for import\(\) expressions [\#205](https://github.com/depcheck/depcheck/pull/205) ([haggholm](https://github.com/haggholm))

## [0.6.10-beta.2](https://github.com/depcheck/depcheck/tree/0.6.10-beta.2) (2018-08-23)

[Full Changelog](https://github.com/depcheck/depcheck/compare/0.6.10-beta.1...0.6.10-beta.2)

**Closed issues:**

- error ELIFECYCLE [\#221](https://github.com/depcheck/depcheck/issues/221)
- @types packages causing false positives  [\#210](https://github.com/depcheck/depcheck/issues/210)
- depcheck not triggering fail from bashscript- [\#171](https://github.com/depcheck/depcheck/issues/171)

**Merged pull requests:**

- Fix error when Typescript is not installed [\#282](https://github.com/depcheck/depcheck/pull/282) ([mnkhouri](https://github.com/mnkhouri))

## [0.6.10-beta.1](https://github.com/depcheck/depcheck/tree/0.6.10-beta.1) (2018-08-20)

[Full Changelog](https://github.com/depcheck/depcheck/compare/0.6.10-beta.0...0.6.10-beta.1)

**Closed issues:**

- False 'unused dependency' for asyncawait. [\#259](https://github.com/depcheck/depcheck/issues/259)
- Is it good to run at pre-commit level [\#208](https://github.com/depcheck/depcheck/issues/208)
- False positives produced by deduping [\#126](https://github.com/depcheck/depcheck/issues/126)

**Merged pull requests:**

- Update NPM tokens for deploy from Travis [\#278](https://github.com/depcheck/depcheck/pull/278) ([mnkhouri](https://github.com/mnkhouri))

## [0.6.10-beta.0](https://github.com/depcheck/depcheck/tree/0.6.10-beta.0) (2018-08-13)

[Full Changelog](https://github.com/depcheck/depcheck/compare/0.6.9...0.6.10-beta.0)

**Closed issues:**

- TSLint [\#264](https://github.com/depcheck/depcheck/issues/264)
- Publish to NPM [\#247](https://github.com/depcheck/depcheck/issues/247)
- \*.tsx parser fails [\#201](https://github.com/depcheck/depcheck/issues/201)
- Support Vue.js [\#195](https://github.com/depcheck/depcheck/issues/195)

**Merged pull requests:**

- Bump Mocha to 5.x [\#274](https://github.com/depcheck/depcheck/pull/274) ([LinusU](https://github.com/LinusU))
- Adds a lockfile [\#271](https://github.com/depcheck/depcheck/pull/271) ([mnkhouri](https://github.com/mnkhouri))
- Use linters utility in ESLint special [\#270](https://github.com/depcheck/depcheck/pull/270) ([LinusU](https://github.com/LinusU))
- Update issue templates [\#268](https://github.com/depcheck/depcheck/pull/268) ([mnkhouri](https://github.com/mnkhouri))

## [0.6.9](https://github.com/depcheck/depcheck/tree/0.6.9) (2018-02-12)

[Full Changelog](https://github.com/depcheck/depcheck/compare/0.6.8...0.6.9)

**Closed issues:**

- Consider dependencies used when used in scripts [\#222](https://github.com/depcheck/depcheck/issues/222)
- npm install runs prepublish [\#217](https://github.com/depcheck/depcheck/issues/217)
- Publish new release [\#213](https://github.com/depcheck/depcheck/issues/213)

**Merged pull requests:**

- Add ability to skip calculation of missing dependencies [\#242](https://github.com/depcheck/depcheck/pull/242) ([tSte](https://github.com/tSte))
- CLI: exit with -1 when there are missing dependencies [\#235](https://github.com/depcheck/depcheck/pull/235) ([valeriangalliat](https://github.com/valeriangalliat))
- Added '--require package' to special/bin check [\#227](https://github.com/depcheck/depcheck/pull/227) ([Ionaru](https://github.com/Ionaru))
- feat: add webpack v2 support [\#226](https://github.com/depcheck/depcheck/pull/226) ([jwhitmarsh](https://github.com/jwhitmarsh))
- fix typo in README.md --ignores flag explanation [\#224](https://github.com/depcheck/depcheck/pull/224) ([leopoldjoy](https://github.com/leopoldjoy))
- Switch deprecated script prepublish to prepublishOnly [\#218](https://github.com/depcheck/depcheck/pull/218) ([sudo-suhas](https://github.com/sudo-suhas))

## [0.6.8](https://github.com/depcheck/depcheck/tree/0.6.8) (2017-10-10)

[Full Changelog](https://github.com/depcheck/depcheck/compare/0.6.7...0.6.8)

**Closed issues:**

- Outdated dependencies [\#215](https://github.com/depcheck/depcheck/issues/215)
- Question: Create new npm module for plugin? [\#202](https://github.com/depcheck/depcheck/issues/202)
- False Alert:  Firefox Addons "chrome" and "sdk" [\#169](https://github.com/depcheck/depcheck/issues/169)
- False positive when requiring files from modules directly: [\#147](https://github.com/depcheck/depcheck/issues/147)

**Merged pull requests:**

- chore: fix lint errors in test/cli [\#225](https://github.com/depcheck/depcheck/pull/225) ([jwhitmarsh](https://github.com/jwhitmarsh))
- Bump dependencies, drop support for node \< 4 [\#216](https://github.com/depcheck/depcheck/pull/216) ([sudo-suhas](https://github.com/sudo-suhas))
- Include the names of each special in the README [\#206](https://github.com/depcheck/depcheck/pull/206) ([rouanw](https://github.com/rouanw))
- A new detector to discover express view engine [\#204](https://github.com/depcheck/depcheck/pull/204) ([aleung](https://github.com/aleung))
- Fix doc error: usused.missing is not an array [\#203](https://github.com/depcheck/depcheck/pull/203) ([aleung](https://github.com/aleung))
- allow babel webpack configs [\#199](https://github.com/depcheck/depcheck/pull/199) ([deecewan](https://github.com/deecewan))
- add: support for require.resolve in JS [\#196](https://github.com/depcheck/depcheck/pull/196) ([pwang2](https://github.com/pwang2))

## [0.6.7](https://github.com/depcheck/depcheck/tree/0.6.7) (2016-12-08)

[Full Changelog](https://github.com/depcheck/depcheck/compare/0.6.6...0.6.7)

**Closed issues:**

- ignoreMatches does not work on  missing dependencies [\#190](https://github.com/depcheck/depcheck/issues/190)

**Merged pull requests:**

- ignoreMatches works on missing dependencies. Fixes depcheck/depcheck\#190 [\#191](https://github.com/depcheck/depcheck/pull/191) ([goloroden](https://github.com/goloroden))
- Pull out the E2E test to another project. [\#186](https://github.com/depcheck/depcheck/pull/186) ([lijunle](https://github.com/lijunle))

## [0.6.6](https://github.com/depcheck/depcheck/tree/0.6.6) (2016-11-29)

[Full Changelog](https://github.com/depcheck/depcheck/compare/0.6.5...0.6.6)

**Fixed bugs:**

- Installed peer dependencies are marked as unused [\#181](https://github.com/depcheck/depcheck/issues/181)
- Find peer dependencies from string array dependencies case. [\#185](https://github.com/depcheck/depcheck/pull/185) ([lijunle](https://github.com/lijunle))

**Closed issues:**

- False unused alert for webpack-and babel plugins [\#143](https://github.com/depcheck/depcheck/issues/143)

**Merged pull requests:**

- Replace isparata with nyc to collect coverage [\#184](https://github.com/depcheck/depcheck/pull/184) ([lijunle](https://github.com/lijunle))
- More webpack config [\#182](https://github.com/depcheck/depcheck/pull/182) ([lijunle](https://github.com/lijunle))
- Update the david-dm badge and links. [\#180](https://github.com/depcheck/depcheck/pull/180) ([lijunle](https://github.com/lijunle))

## [0.6.5](https://github.com/depcheck/depcheck/tree/0.6.5) (2016-11-18)

[Full Changelog](https://github.com/depcheck/depcheck/compare/0.6.4...0.6.5)

**Fixed bugs:**

- Fix test coverage is failing. [\#175](https://github.com/depcheck/depcheck/pull/175) ([lijunle](https://github.com/lijunle))

**Closed issues:**

- Allow scoped packages for special ESLint [\#174](https://github.com/depcheck/depcheck/issues/174)
- False Alert [\#172](https://github.com/depcheck/depcheck/issues/172)

**Merged pull requests:**

- Run test on node v7 in CI builds. [\#179](https://github.com/depcheck/depcheck/pull/179) ([lijunle](https://github.com/lijunle))
- Update Airbnb ESLint Rules to v13 [\#178](https://github.com/depcheck/depcheck/pull/178) ([lijunle](https://github.com/lijunle))
- Update package dependencies. [\#177](https://github.com/depcheck/depcheck/pull/177) ([lijunle](https://github.com/lijunle))
- Add support for scoped packages in ESLint special. Close \#174 [\#176](https://github.com/depcheck/depcheck/pull/176) ([goloroden](https://github.com/goloroden))
- Allow additional ESLint config file names. [\#173](https://github.com/depcheck/depcheck/pull/173) ([goloroden](https://github.com/goloroden))

## [0.6.4](https://github.com/depcheck/depcheck/tree/0.6.4) (2016-07-24)

[Full Changelog](https://github.com/depcheck/depcheck/compare/0.6.3...0.6.4)

**Fixed bugs:**

- Exit code from `depcheck` executable [\#140](https://github.com/depcheck/depcheck/issues/140)
- Fix the exit code. [\#151](https://github.com/depcheck/depcheck/pull/151) ([lijunle](https://github.com/lijunle))

**Closed issues:**

- Support \(package.json\).eslintConfig.extends for `special.eslint` [\#154](https://github.com/depcheck/depcheck/issues/154)
- Depcheck should return a promise [\#146](https://github.com/depcheck/depcheck/issues/146)
- new release time? [\#160](https://github.com/depcheck/depcheck/issues/160)

**Merged pull requests:**

- Fix the travis.yml to publish on node 6. [\#161](https://github.com/depcheck/depcheck/pull/161) ([lijunle](https://github.com/lijunle))
- Fixing typo in documenation [\#158](https://github.com/depcheck/depcheck/pull/158) ([jaredmcateer](https://github.com/jaredmcateer))
- Update minimatch to 3.0.2. [\#156](https://github.com/depcheck/depcheck/pull/156) ([lijunle](https://github.com/lijunle))
- Update CI configurations. [\#149](https://github.com/depcheck/depcheck/pull/149) ([lijunle](https://github.com/lijunle))
- Update dependencies and polish code. [\#148](https://github.com/depcheck/depcheck/pull/148) ([lijunle](https://github.com/lijunle))
- Added node v6 to travis testing versions [\#142](https://github.com/depcheck/depcheck/pull/142) ([amilajack](https://github.com/amilajack))
- Update README.md [\#137](https://github.com/depcheck/depcheck/pull/137) ([eldinoyev](https://github.com/eldinoyev))

## [0.6.3](https://github.com/depcheck/depcheck/tree/0.6.3) (2016-04-01)

[Full Changelog](https://github.com/depcheck/depcheck/compare/0.6.2...0.6.3)

**Merged pull requests:**

- Remove the peer dependency. [\#133](https://github.com/depcheck/depcheck/pull/133) ([lijunle](https://github.com/lijunle))

## [0.6.2](https://github.com/depcheck/depcheck/tree/0.6.2) (2016-03-27)

[Full Changelog](https://github.com/depcheck/depcheck/compare/0.6.1...0.6.2)

**Closed issues:**

- Remove the withoutDev parameter [\#117](https://github.com/depcheck/depcheck/issues/117)
- Support for commitizen modules [\#119](https://github.com/depcheck/depcheck/issues/119)
- Deprecate the withoutDev parameter [\#114](https://github.com/depcheck/depcheck/issues/114)
- False Positives with gulp-load-plugins && gulp-jshint [\#18](https://github.com/depcheck/depcheck/issues/18)

**Merged pull requests:**

- Update README to mention new features in next release. [\#129](https://github.com/depcheck/depcheck/pull/129) ([lijunle](https://github.com/lijunle))
- Support gulp plugins loaded by gulp-load-plugins. [\#127](https://github.com/depcheck/depcheck/pull/127) ([lijunle](https://github.com/lijunle))
- Mark the peer dependencies as dev dependencies too. [\#125](https://github.com/depcheck/depcheck/pull/125) ([lijunle](https://github.com/lijunle))
- Resolve arrow function ESLint warning violation [\#124](https://github.com/depcheck/depcheck/pull/124) ([lijunle](https://github.com/lijunle))
- Resolve ESLint pin on 2.2.0. [\#123](https://github.com/depcheck/depcheck/pull/123) ([lijunle](https://github.com/lijunle))
- Add commitizen support [\#122](https://github.com/depcheck/depcheck/pull/122) ([LinusU](https://github.com/LinusU))
- Deprecate the `dev` option [\#120](https://github.com/depcheck/depcheck/pull/120) ([lijunle](https://github.com/lijunle))

## [0.6.1](https://github.com/depcheck/depcheck/tree/0.6.1) (2016-03-19)

[Full Changelog](https://github.com/depcheck/depcheck/compare/0.7.0-beta.1...0.6.1)

**Fixed bugs:**

- Missing dependencies result is not handled peer and optional dependencies [\#115](https://github.com/depcheck/depcheck/issues/115)
- Fix the logic about calculate missing dependencies [\#118](https://github.com/depcheck/depcheck/pull/118) ([lijunle](https://github.com/lijunle))

**Closed issues:**

- Support feross/standard custom parser [\#110](https://github.com/depcheck/depcheck/issues/110)
- doesn't work with CSS dependencies [\#99](https://github.com/depcheck/depcheck/issues/99)
- TypeScript support. [\#46](https://github.com/depcheck/depcheck/issues/46)

**Merged pull requests:**

- Update the README file. [\#116](https://github.com/depcheck/depcheck/pull/116) ([lijunle](https://github.com/lijunle))
- Recognize the packages used in SASS/SCSS files [\#113](https://github.com/depcheck/depcheck/pull/113) ([lijunle](https://github.com/lijunle))
- Support Typescript syntax. [\#112](https://github.com/depcheck/depcheck/pull/112) ([lijunle](https://github.com/lijunle))
- Recognize parser used by feross/standard linter. [\#111](https://github.com/depcheck/depcheck/pull/111) ([lijunle](https://github.com/lijunle))
- No help output [\#106](https://github.com/depcheck/depcheck/pull/106) ([lijunle](https://github.com/lijunle))
- Re-arrange file structure. [\#104](https://github.com/depcheck/depcheck/pull/104) ([lijunle](https://github.com/lijunle))
- Leverage lodash to simplify the logic. [\#103](https://github.com/depcheck/depcheck/pull/103) ([lijunle](https://github.com/lijunle))

## [0.7.0-beta.1](https://github.com/depcheck/depcheck/tree/0.7.0-beta.1) (2016-03-10)

[Full Changelog](https://github.com/depcheck/depcheck/compare/0.6.0...0.7.0-beta.1)

**Fixed bugs:**

- Pin ESLint to 2.2.0. [\#109](https://github.com/depcheck/depcheck/pull/109) ([lijunle](https://github.com/lijunle))

**Closed issues:**

- Allow to define patterns against absolute file path [\#107](https://github.com/depcheck/depcheck/issues/107)

**Merged pull requests:**

- Support parser patterns based on file paths [\#108](https://github.com/depcheck/depcheck/pull/108) ([tamasmagedli](https://github.com/tamasmagedli))

## [0.6.0](https://github.com/depcheck/depcheck/tree/0.6.0) (2016-02-24)

[Full Changelog](https://github.com/depcheck/depcheck/compare/0.5.11...0.6.0)

**Fixed bugs:**

- Bug with subdirectories? [\#81](https://github.com/depcheck/depcheck/issues/81)

**Closed issues:**

- Find dependencies which aren't listed in package.json [\#83](https://github.com/depcheck/depcheck/issues/83)
- Implement mocha.opts special parser. [\#76](https://github.com/depcheck/depcheck/issues/76)
- Recognize babel-plugin-react-transform transformers. [\#45](https://github.com/depcheck/depcheck/issues/45)
- vice versa function  [\#41](https://github.com/depcheck/depcheck/issues/41)

**Merged pull requests:**

- Update the README file. [\#102](https://github.com/depcheck/depcheck/pull/102) ([lijunle](https://github.com/lijunle))
- Update dependencies. [\#101](https://github.com/depcheck/depcheck/pull/101) ([lijunle](https://github.com/lijunle))
- Account for io being async [\#98](https://github.com/depcheck/depcheck/pull/98) ([gtanner](https://github.com/gtanner))
- Refactor getScript logic to a single file. [\#97](https://github.com/depcheck/depcheck/pull/97) ([lijunle](https://github.com/lijunle))
- Implement the dependencies used in mocha opts [\#96](https://github.com/depcheck/depcheck/pull/96) ([lijunle](https://github.com/lijunle))
- Upgrade devDependencies to newest version. [\#95](https://github.com/depcheck/depcheck/pull/95) ([lijunle](https://github.com/lijunle))
- Build using dependencies in JSON view [\#94](https://github.com/depcheck/depcheck/pull/94) ([lijunle](https://github.com/lijunle))
- Build missing dependencies lookup in JSON view. [\#93](https://github.com/depcheck/depcheck/pull/93) ([lijunle](https://github.com/lijunle))
- Convert the spec to JavaScript file. [\#92](https://github.com/depcheck/depcheck/pull/92) ([lijunle](https://github.com/lijunle))
- Implement missing dependencies feature [\#90](https://github.com/depcheck/depcheck/pull/90) ([lijunle](https://github.com/lijunle))
- Refactor the main logic. [\#89](https://github.com/depcheck/depcheck/pull/89) ([lijunle](https://github.com/lijunle))
- Recognize tranforms used in babel-plugin-react-transform [\#88](https://github.com/depcheck/depcheck/pull/88) ([lijunle](https://github.com/lijunle))
- Detect dependencies in default mocha opts file. [\#87](https://github.com/depcheck/depcheck/pull/87) ([lijunle](https://github.com/lijunle))
- Mention node.js version requirement in README. [\#86](https://github.com/depcheck/depcheck/pull/86) ([lijunle](https://github.com/lijunle))
- Specify node engine version in package.json. [\#85](https://github.com/depcheck/depcheck/pull/85) ([lijunle](https://github.com/lijunle))
- Fix peer dependencies from nested files not detected. [\#82](https://github.com/depcheck/depcheck/pull/82) ([lijunle](https://github.com/lijunle))
- Add version CLI argument. [\#80](https://github.com/depcheck/depcheck/pull/80) ([lijunle](https://github.com/lijunle))
- Show call stack for error in JSON view. [\#79](https://github.com/depcheck/depcheck/pull/79) ([lijunle](https://github.com/lijunle))
- Integrate depcheck web service [\#78](https://github.com/depcheck/depcheck/pull/78) ([lijunle](https://github.com/lijunle))

## [0.5.11](https://github.com/depcheck/depcheck/tree/0.5.11) (2015-12-02)

[Full Changelog](https://github.com/depcheck/depcheck/compare/0.5.10...0.5.11)

**Closed issues:**

- Ignore doc folder in NPM deployment. [\#77](https://github.com/depcheck/depcheck/issues/77)
- Output error call stack in JSON output. [\#75](https://github.com/depcheck/depcheck/issues/75)
- Add --version parameter. [\#74](https://github.com/depcheck/depcheck/issues/74)
- request support: -h/--help arguments [\#73](https://github.com/depcheck/depcheck/issues/73)
- wrong repo link in published module [\#57](https://github.com/depcheck/depcheck/issues/57)

## [0.5.10](https://github.com/depcheck/depcheck/tree/0.5.10) (2015-11-22)

[Full Changelog](https://github.com/depcheck/depcheck/compare/0.5.9...0.5.10)

**Closed issues:**

- eslint support issues [\#58](https://github.com/depcheck/depcheck/issues/58)
- Peer dependencies and optional dependencies support. [\#54](https://github.com/depcheck/depcheck/issues/54)
- eslint-config-airbnb does not depend on babel-eslint any more [\#50](https://github.com/depcheck/depcheck/issues/50)
- Babel plugin support [\#44](https://github.com/depcheck/depcheck/issues/44)
- Webpack loader support [\#42](https://github.com/depcheck/depcheck/issues/42)
- npm scoped packages [\#32](https://github.com/depcheck/depcheck/issues/32)
- includeDirs [\#31](https://github.com/depcheck/depcheck/issues/31)
- support for multiple entry points [\#26](https://github.com/depcheck/depcheck/issues/26)
- ES6 support? [\#21](https://github.com/depcheck/depcheck/issues/21)
- add support for files with a node shebang [\#19](https://github.com/depcheck/depcheck/issues/19)
- Support for coffee? [\#16](https://github.com/depcheck/depcheck/issues/16)

**Merged pull requests:**

- Fix travis config [\#72](https://github.com/depcheck/depcheck/pull/72) ([lijunle](https://github.com/lijunle))
- Update documentations. [\#71](https://github.com/depcheck/depcheck/pull/71) ([lijunle](https://github.com/lijunle))
- Use patch-version package instead of local script. [\#70](https://github.com/depcheck/depcheck/pull/70) ([lijunle](https://github.com/lijunle))
- Fix JSON serialize issues. [\#69](https://github.com/depcheck/depcheck/pull/69) ([lijunle](https://github.com/lijunle))
- Revert the web report function from depcheck [\#68](https://github.com/depcheck/depcheck/pull/68) ([lijunle](https://github.com/lijunle))
- Enable ALL specials by default. [\#67](https://github.com/depcheck/depcheck/pull/67) ([lijunle](https://github.com/lijunle))
- Evaluate ESLint preset to get accurate dependencies. [\#66](https://github.com/depcheck/depcheck/pull/66) ([lijunle](https://github.com/lijunle))
- Improve detect Webpack loader function. [\#65](https://github.com/depcheck/depcheck/pull/65) ([lijunle](https://github.com/lijunle))
- Refine the bin special parser to be stable. [\#64](https://github.com/depcheck/depcheck/pull/64) ([lijunle](https://github.com/lijunle))
- Fix handling eslintrc non-standard JSON content. [\#63](https://github.com/depcheck/depcheck/pull/63) ([lijunle](https://github.com/lijunle))
- Fix regression: parse JSX in JS file by default. [\#62](https://github.com/depcheck/depcheck/pull/62) ([lijunle](https://github.com/lijunle))
- Improve ESLint special parser functions. [\#61](https://github.com/depcheck/depcheck/pull/61) ([lijunle](https://github.com/lijunle))
- Implement peer and optional dependencies discover. [\#60](https://github.com/depcheck/depcheck/pull/60) ([lijunle](https://github.com/lijunle))
- Remove babel runtime dep [\#59](https://github.com/depcheck/depcheck/pull/59) ([lijunle](https://github.com/lijunle))
- Implement basic Webpack loader [\#56](https://github.com/depcheck/depcheck/pull/56) ([lijunle](https://github.com/lijunle))
- Update Babylon parser to 6.x version. [\#53](https://github.com/depcheck/depcheck/pull/53) ([lijunle](https://github.com/lijunle))
- Support more ESLint configs. [\#52](https://github.com/depcheck/depcheck/pull/52) ([lijunle](https://github.com/lijunle))
- Update dependencies packages. [\#51](https://github.com/depcheck/depcheck/pull/51) ([lijunle](https://github.com/lijunle))
- Update to Babel 6 [\#49](https://github.com/depcheck/depcheck/pull/49) ([lijunle](https://github.com/lijunle))
- Run tests on node version 4 and 5. [\#48](https://github.com/depcheck/depcheck/pull/48) ([lijunle](https://github.com/lijunle))
- Fix file name handling in Babel special parser. [\#47](https://github.com/depcheck/depcheck/pull/47) ([lijunle](https://github.com/lijunle))
- Fix the type in babel special parser test case. [\#40](https://github.com/depcheck/depcheck/pull/40) ([lijunle](https://github.com/lijunle))
- Implement Babel plugin and presets support. [\#39](https://github.com/depcheck/depcheck/pull/39) ([lijunle](https://github.com/lijunle))
- Add test case to assert shebang is supported. [\#38](https://github.com/depcheck/depcheck/pull/38) ([lijunle](https://github.com/lijunle))
- Trivial changes [\#37](https://github.com/depcheck/depcheck/pull/37) ([lijunle](https://github.com/lijunle))

## [0.5.9](https://github.com/depcheck/depcheck/tree/0.5.9) (2015-11-04)

[Full Changelog](https://github.com/depcheck/depcheck/compare/0.5.8...0.5.9)

**Closed issues:**

- Question: Gulp support? [\#17](https://github.com/depcheck/depcheck/issues/17)

**Merged pull requests:**

- Update the badges and builds. [\#36](https://github.com/depcheck/depcheck/pull/36) ([lijunle](https://github.com/lijunle))

## [0.5.8](https://github.com/depcheck/depcheck/tree/0.5.8) (2015-10-29)

[Full Changelog](https://github.com/depcheck/depcheck/compare/0.5.7...0.5.8)

## [0.5.7](https://github.com/depcheck/depcheck/tree/0.5.7) (2015-10-26)

[Full Changelog](https://github.com/depcheck/depcheck/compare/0.5.6...0.5.7)

## [0.5.6](https://github.com/depcheck/depcheck/tree/0.5.6) (2015-10-20)

[Full Changelog](https://github.com/depcheck/depcheck/compare/0.5.5...0.5.6)

## [0.5.5](https://github.com/depcheck/depcheck/tree/0.5.5) (2015-10-15)

[Full Changelog](https://github.com/depcheck/depcheck/compare/0.5.3...0.5.5)

## [0.5.3](https://github.com/depcheck/depcheck/tree/0.5.3) (2015-10-03)

[Full Changelog](https://github.com/depcheck/depcheck/compare/0.5.2...0.5.3)

## [0.5.2](https://github.com/depcheck/depcheck/tree/0.5.2) (2015-09-24)

[Full Changelog](https://github.com/depcheck/depcheck/compare/0.5.1...0.5.2)

## [0.5.1](https://github.com/depcheck/depcheck/tree/0.5.1) (2015-09-21)

[Full Changelog](https://github.com/depcheck/depcheck/compare/0.5.0...0.5.1)

**Merged pull requests:**

- Allow passing ingores via the command line [\#34](https://github.com/depcheck/depcheck/pull/34) ([gtanner](https://github.com/gtanner))

## [0.5.0](https://github.com/depcheck/depcheck/tree/0.5.0) (2015-09-19)

[Full Changelog](https://github.com/depcheck/depcheck/compare/0.4.0...0.5.0)

**Closed issues:**

- dead project? [\#33](https://github.com/depcheck/depcheck/issues/33)
- depcheck should accept metadata from options [\#14](https://github.com/depcheck/depcheck/issues/14)
- Depcheck is busted [\#11](https://github.com/depcheck/depcheck/issues/11)
- Clean install fails to run, missing dependency "optimist" [\#10](https://github.com/depcheck/depcheck/issues/10)
- dependency-check comparison [\#9](https://github.com/depcheck/depcheck/issues/9)
- don't change string prototype [\#7](https://github.com/depcheck/depcheck/issues/7)

**Merged pull requests:**

- add --json flag to command line [\#22](https://github.com/depcheck/depcheck/pull/22) ([gtanner](https://github.com/gtanner))
- Don't throw error when module names are numbers [\#20](https://github.com/depcheck/depcheck/pull/20) ([dylang](https://github.com/dylang))
- Resolving issue \#14, dynamically passing the package.json metadata [\#15](https://github.com/depcheck/depcheck/pull/15) ([alanhoff](https://github.com/alanhoff))
- recognize require\('foo/bar'\) as a dependency on foo [\#13](https://github.com/depcheck/depcheck/pull/13) ([nigelzor](https://github.com/nigelzor))
- don't throw error when esprima can't parse a file [\#12](https://github.com/depcheck/depcheck/pull/12) ([dylang](https://github.com/dylang))

## [0.4.0](https://github.com/depcheck/depcheck/tree/0.4.0) (2014-06-14)

[Full Changelog](https://github.com/depcheck/depcheck/compare/0.3.1...0.4.0)

**Closed issues:**

- option to ignore directories  [\#6](https://github.com/depcheck/depcheck/issues/6)

**Merged pull requests:**

- Ignore paths [\#8](https://github.com/depcheck/depcheck/pull/8) ([dylang](https://github.com/dylang))

## [0.3.1](https://github.com/depcheck/depcheck/tree/0.3.1) (2014-06-09)

[Full Changelog](https://github.com/depcheck/depcheck/compare/0.3.0...0.3.1)

**Closed issues:**

- main should point to index.js, not the cli js [\#5](https://github.com/depcheck/depcheck/issues/5)

## [0.3.0](https://github.com/depcheck/depcheck/tree/0.3.0) (2014-05-25)

[Full Changelog](https://github.com/depcheck/depcheck/compare/0.2.0...0.3.0)

**Closed issues:**

- List dependencies and devDependencies separetly [\#4](https://github.com/depcheck/depcheck/issues/4)
- devDependencies by default [\#3](https://github.com/depcheck/depcheck/issues/3)
- default to current directory when there is a package.json in that directory [\#2](https://github.com/depcheck/depcheck/issues/2)

**Merged pull requests:**

- Fix wording [\#1](https://github.com/depcheck/depcheck/pull/1) ([mbilbille](https://github.com/mbilbille))

## [0.2.0](https://github.com/depcheck/depcheck/tree/0.2.0) (2013-09-22)

[Full Changelog](https://github.com/depcheck/depcheck/compare/0.1.0...0.2.0)

## [0.1.0](https://github.com/depcheck/depcheck/tree/0.1.0) (2013-09-20)

[Full Changelog](https://github.com/depcheck/depcheck/compare/1b753270fb01c3fb0b90431ca051b23dd5379f8a...0.1.0)



\* *This Changelog was automatically generated by [github_changelog_generator](https://github.com/github-changelog-generator/github-changelog-generator)*
