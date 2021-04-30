import fs from 'fs';

import {
  LighthouseRunSettings,
  runLighthouse,
  launchChrome,
  scoresToDataPoints
} from '../lighthouse/lighthouse-utils';
import { sendMetric, toMetricDataPoint } from '../datadog/datadog-utils';
import { LaunchedChrome } from 'chrome-launcher';
import projects from '../config/projects';

const REPORTS_DIRNAME = 'lighthouse-reports';

export const getTimeStamp = (): string => {
  return `${Math.floor(new Date().getTime() / 1000)}`;
};

export const auditUrl = async (
  timestamp: string,
  chrome: LaunchedChrome,
  runSettings: LighthouseRunSettings
): Promise<void> => {
  console.info(
    `Auditing ${runSettings.url} with ${
      runSettings.customLighthouseConfig
        ? `"${runSettings.customLighthouseConfig.name}"`
        : 'the default'
    } Lighthouse config...`
  );

  const { jsReport, htmlReport } = await runLighthouse(chrome, runSettings);

  fs.writeFileSync(
    `${REPORTS_DIRNAME}/${runSettings.metricNamespace}.html`,
    htmlReport
  );

  const dataPoints = scoresToDataPoints(jsReport);

  await Promise.all(
    dataPoints.map((dataPoint) =>
      sendMetric(
        toMetricDataPoint(runSettings.metricNamespace, timestamp, dataPoint)
      )
    )
  );
  console.info(`Metrics sent with "${runSettings.metricNamespace}" namespace.`);
};

export const auditProject = async (): Promise<void> => {
  const timestamp = getTimeStamp();
  const projectId: string = process.env.AUDITED_PROJECT as string;
  let chrome: LaunchedChrome;

  try {
    if (!projectId || !projects[projectId]) {
      throw new Error(
        `Failed to find a configuration for the "${projectId}" project.`
      );
    }

    chrome = await launchChrome();

    if (!fs.existsSync(REPORTS_DIRNAME)) {
      fs.mkdirSync(REPORTS_DIRNAME);
    }

    for (const lighthouseRunSettings of projects[projectId]) {
      await auditUrl(timestamp, chrome, lighthouseRunSettings);
    }
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    if (chrome) {
      await chrome.kill();
    }
  }
};
