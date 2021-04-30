import lighthouse from 'lighthouse/lighthouse-core';
import { launch, LaunchedChrome } from 'chrome-launcher';
import { JSReport, NetworkAsset } from './types';
import { DataPoint } from '../datadog/datadog-utils';
import { METRIC_SCORE_MAP } from '../config/metric-map';
import _get from 'lodash.get';

export interface LighthouseRunSettings {
  url: string;
  metricNamespace: string;
  customLighthouseConfig?: Record<string, unknown>;
}

export interface LighthouseRunResults {
  jsReport: JSReport;
  htmlReport: string;
}

export const runLighthouse = async (
  chrome: LaunchedChrome,
  settings: LighthouseRunSettings
): Promise<LighthouseRunResults> => {
  const { url, customLighthouseConfig } = settings;
  const flags = { logLevel: 'error', output: 'html', port: chrome.port };

  const runnerResult = await lighthouse(url, flags, customLighthouseConfig);

  return {
    jsReport: runnerResult.lhr,
    htmlReport: runnerResult.report
  };
};

export const launchChrome = async (): Promise<LaunchedChrome> => {
  return launch({
    chromeFlags: ['--headless', '--no-sandbox']
  });
};

export const scoresToDataPoints = (jsReport: JSReport): DataPoint[] => {
  return [
    ...pickReportScores(jsReport),
    {
      metricName: 'total_bundle_size',
      value: `${getScriptsSize(jsReport)}`
    }
  ];
};

const pickReportScores = (jsReport: JSReport) =>
  Object.entries(METRIC_SCORE_MAP).map(([metricName, scorePath]) => ({
    metricName,
    value: _get(jsReport, scorePath)
  }));

const getScriptsSize = (jsReport: JSReport): number =>
  (jsReport.audits['network-requests'] as Record<
    string,
    { items: NetworkAsset[] }
  >).details.items
    .filter((asset: NetworkAsset) => asset.resourceType === 'Script')
    .reduce(
      (totalSize: number, asset: NetworkAsset) =>
        totalSize + asset.transferSize,
      0
    );
