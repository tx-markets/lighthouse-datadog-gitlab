const mockTimeStamp = '1619531077';
const mockRawDataPoint = 'mockRawDataPoint';
const mockMetricDataPoint = 'mockMetricDataPoint';
const mockLighthouseRunSettings = {
  url: 'mockUrl',
  metricNamespace: 'mockMetricNamespace',
  customLighthouseConfig: {
    name: 'mockCustomLighthouseConfig'
  }
};

jest.mock('../config/projects', () => ({
  testProject: [{ url: 'mockUrl' }]
}));

jest.mock('../datadog/datadog-utils', () => ({
  sendMetric: jest.fn(),
  toMetricDataPoint: jest.fn().mockReturnValue(mockMetricDataPoint)
}));

const mockChromeInstance = ({
  kill: jest.fn(),
  port: 'mockChromePort'
} as unknown) as LaunchedChrome;

jest.mock('../lighthouse/lighthouse-utils', () => ({
  launchChrome: jest.fn().mockReturnValue(mockChromeInstance),
  runLighthouse: jest.fn().mockReturnValue({
    jsReport: 'mockJsReport',
    htmlReport: 'mockHtmlReport'
  }),
  scoresToDataPoints: jest.fn().mockReturnValue([mockRawDataPoint])
}));

jest.mock('fs', () => ({
  writeFileSync: jest.fn(),
  existsSync: jest.fn().mockReturnValue(true)
}));

import * as Audit from './audit';
import { LaunchedChrome } from 'chrome-launcher';
import { runLighthouse, launchChrome } from '../lighthouse/lighthouse-utils';
import { sendMetric, toMetricDataPoint } from '../datadog/datadog-utils';
import fs from 'fs';

describe('lighthouse-datadog', () => {
  beforeEach(() => {
    jest.spyOn(Audit, 'getTimeStamp').mockReturnValue(mockTimeStamp);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe('#auditUrl', () => {
    beforeEach(async () => {
      await Audit.auditUrl(
        mockTimeStamp,
        mockChromeInstance,
        mockLighthouseRunSettings
      );
    });

    it('runs Lighthouse for the given URL and config', () => {
      expect(runLighthouse).toHaveBeenCalledWith(
        mockChromeInstance,
        mockLighthouseRunSettings
      );
    });

    it('sends metric values to DataDog', () => {
      expect(toMetricDataPoint).toHaveBeenCalledWith(
        'mockMetricNamespace',
        mockTimeStamp,
        mockRawDataPoint
      );
      expect(sendMetric).toHaveBeenCalledWith(mockMetricDataPoint);
    });

    it('saves HTML report', () => {
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        'lighthouse-reports/mockMetricNamespace.html',
        'mockHtmlReport'
      );
    });
  });

  describe('#auditProject', () => {
    beforeEach(() => {
      jest.spyOn(Audit, 'auditUrl').mockImplementation(() => Promise.resolve());
    });

    describe('with a valid project ID', () => {
      beforeEach(async () => {
        process.env.AUDITED_PROJECT = 'testProject';
        await Audit.auditProject();
      });

      afterEach(() => {
        delete process.env.AUDITED_PROJECT;
      });

      it('launches Chrome', () => {
        expect(launchChrome).toHaveBeenCalledTimes(1);
      });

      it('kills Chrome', () => {
        expect(mockChromeInstance.kill).toHaveBeenCalledTimes(1);
      });

      it('audits all project URLs', () => {
        expect(Audit.auditUrl).toHaveBeenCalledWith(
          mockTimeStamp,
          expect.objectContaining(mockChromeInstance),
          { url: mockLighthouseRunSettings.url }
        );
      });
    });

    describe('with no valid project ID', () => {
      it('throws an error', async () => {
        await expect(Audit.auditProject()).rejects.toThrow(
          'Failed to find a configuration for the "undefined" project.'
        );
      });
    });
  });
});
