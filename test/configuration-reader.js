import 'should';
import proxyquire from 'proxyquire';
import ConfigurationParsingException from '../src/utils/exceptions/configuration-parsing-exception';

describe('configuration-reader', () => {
  let configurationReaderModule;
  let cosmiconfigResult;

  before(() => {
    configurationReaderModule = proxyquire(
      '../src/utils/configuration-reader',
      {
        cosmiconfig: {
          cosmiconfig: () => {
            return {
              search: () => cosmiconfigResult,
            };
          },
        },
      },
    );
  });

  beforeEach(() => {
    cosmiconfigResult = Promise.resolve({
      isEmpty: true,
      config: {},
    });
  });

  describe('getConfiguration', () => {
    it('should load files correctly from a configuration file when no command args are provided', async () => {
      cosmiconfigResult = Promise.resolve({
        isEmpty: false,
        config: {
          testConfig: 'aSampleValue',
        },
      });
      const configResult = await configurationReaderModule.getConfiguration(
        [],
        'test',
        '1.0',
      );
      configResult.should.have.property('testConfig', 'aSampleValue');
    });

    it('should transform configuration values as camelCase', async () => {
      cosmiconfigResult = Promise.resolve({
        isEmpty: false,
        config: {
          'test-config': 'anotherSampleValue',
        },
      });

      const configResult = await configurationReaderModule.getConfiguration(
        [],
        'test',
        '1.0',
      );
      configResult.should.have.property('testConfig', 'anotherSampleValue');
    });

    it('should give CLI arguments precedence over config file arguments', async () => {
      cosmiconfigResult = Promise.resolve({
        isEmpty: false,
        config: {
          ignores: '1,2',
          anotherField: 'anotherValue',
        },
      });

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

    it('should throw a ConfigurationParsing exception if the config file cannot be parsed', async () => {
      // eslint-disable-next-line prefer-promise-reject-errors
      cosmiconfigResult = Promise.reject({
        mark: {
          name: 'test',
        },
      });

      let thrownException = null;
      try {
        await configurationReaderModule.getConfiguration([], 'test', '1.0');
      } catch (err) {
        thrownException = err;
      }
      // eslint-disable-next-line no-unused-expressions
      thrownException.should.not.be.null;
      thrownException.should.be.instanceof(ConfigurationParsingException);
    });
  });
});
