process.env.DATADOG_HOST = 'DATADOG_HOST';
process.env.DATADOG_API_KEY = 'DATADOG_API_KEY';

global.console = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn()
};
