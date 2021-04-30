import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

export interface DataPoint {
  metricName: string;
  value: string;
}

export interface MetricDataPoint {
  host: string;
  type: string;
  metric: string;
  points: [string, string][];
}

export interface MetricData {
  series: MetricDataPoint[];
}

const config: AxiosRequestConfig = {
  headers: {
    'Content-Type': 'application/json',
    'DD-API-KEY': process.env.DATADOG_API_KEY
  }
};

export const sendMetric = async (data: MetricData): Promise<AxiosResponse> => {
  return axios.post(
    `${process.env.DATADOG_HOST}/api/v1/series`,
    JSON.stringify(data),
    config
  );
};

export const toMetricDataPoint = (
  metricNameSpace: string,
  timeStamp: string,
  dataPoint: DataPoint
): MetricData => ({
  series: [
    {
      host: 'lighthouse',
      type: 'gauge',
      metric: `lighthouse.${dataPoint.metricName}.${metricNameSpace}`,
      points: [[timeStamp, dataPoint.value]]
    }
  ]
});
