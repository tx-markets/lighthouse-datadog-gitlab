const mockLighthouseRunResult = {
  lhr: 'mockJSReport',
  report: 'mockHTMLReport'
};

jest.mock('lighthouse/lighthouse-core', () =>
  jest.fn().mockImplementation(() => Promise.resolve(mockLighthouseRunResult))
);

import lighthouse from 'lighthouse/lighthouse-core';
import { runLighthouse } from './lighthouse-utils';
import { LaunchedChrome } from 'chrome-launcher';

describe('lighthouse-utils', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('#runLighthouse', () => {
    const testUrl = 'mockURL';
    const mockCustomLighthouseConfig = {
      key: 'mockValue'
    };

    const mockLaunchedChrome = ({
      port: 'mockPort'
    } as unknown) as LaunchedChrome;

    let runResult;

    beforeEach(async () => {
      runResult = await runLighthouse(mockLaunchedChrome, {
        url: testUrl,
        metricNamespace: 'mockMetricNamespace',
        customLighthouseConfig: mockCustomLighthouseConfig
      });
    });

    it('invokes Lighthouse with the provided config', () => {
      expect(lighthouse).toHaveBeenCalledWith(
        testUrl,
        {
          logLevel: 'error',
          output: 'html',
          port: mockLaunchedChrome.port
        },
        mockCustomLighthouseConfig
      );
    });

    it('returns JS and HTML reports', async () => {
      expect(runResult).toEqual({
        jsReport: mockLighthouseRunResult.lhr,
        htmlReport: mockLighthouseRunResult.report
      });
    });
  });
});
