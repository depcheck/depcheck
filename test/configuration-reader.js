/* global describe, it, before, beforeEach */
import 'should';
import proxyquire from 'proxyquire';

describe('configuration-reader', () => {
  let configurationReaderModule;
  let cosmiconfigResult;

  before(() => {
    configurationReaderModule = proxyquire(
      '../src/utils/configuration-reader',
      {
        cosmiconfig: () => {
          return {
            search: () => cosmiconfigResult,
          };
        },
      },
    );
  });

  beforeEach(() => {
    cosmiconfigResult = {
      isEmpty: true,
      config: {},
    };
  });

  describe('getConfiguration', () => {
    it('should load files correctly from a configuration file when no command args are provided', async () => {
      cosmiconfigResult = {
        isEmpty: false,
        config: {
          testConfig: 'aSampleValue',
        },
      };
      const configResult = await configurationReaderModule.getConfiguration(
        [],
        'test',
        '1.0',
      );
      configResult.should.have.property('testConfig', 'aSampleValue');
    });

    it('should transform configuration values as camelCase', async () => {
      cosmiconfigResult = {
        isEmpty: false,
        config: {
          'test-config': 'anotherSampleValue',
        },
      };

      const configResult = await configurationReaderModule.getConfiguration(
        [],
        'test',
        '1.0',
      );
      configResult.should.have.property('testConfig', 'anotherSampleValue');
    });

    it('should give CLI arguments precedence over config file arguments', async () => {
      cosmiconfigResult = {
        isEmpty: false,
        config: {
          ignores: '1,2',
          anotherField: 'anotherValue',
        },
      };

      const configResult = await configurationReaderModule.getConfiguration(
        ['scriptPath', '--ignores', '3,4'],
        'test',
        '1.0',
      );
      configResult.should.have.property('anotherField', 'anotherValue');
      configResult.should.have.property('ignores', ['3', '4']);
    });

    it('should use CLI arguments when no file is found', async () => {
      cosmiconfigResult = null;
      const configResult = await configurationReaderModule.getConfiguration(
        ['scriptPath', '--ignores', 'testValue'],
        'test',
        '1.0',
      );

      configResult.should.have.property('ignores', ['testValue']);
    });
  });
});
