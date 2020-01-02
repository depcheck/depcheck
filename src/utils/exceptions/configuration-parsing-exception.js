export default class ConfigurationParsingException extends Error {
  constructor(_filePath) {
    super(`Error reading configuration file ${_filePath}`);
    this.filePath = _filePath;
    Error.captureStackTrace(this, ConfigurationParsingException);
  }
}
