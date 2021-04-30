import { MetricData, sendMetric, toMetricDataPoint } from './datadog-utils';
import axios from 'axios';

const mockTimeStamp = '1619531077';
const mockMetricNamespace = 'mockMetricNamespace';
const mockMetricData = ({
  series: 'mockMetricDataSeries'
} as unknown) as MetricData;

describe('datadog-utils', () => {
  beforeEach(() => {
    jest.spyOn(axios, 'post').mockReturnValue(Promise.resolve());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('#sendMetric', () => {
    it('sends metric data to DataDog', async () => {
      await sendMetric(mockMetricData);
      expect(axios.post).toHaveBeenCalledTimes(1);
      expect(axios.post).toHaveBeenCalledWith(
        'DATADOG_HOST/api/v1/series',
        JSON.stringify(mockMetricData),
        {
          headers: {
            'Content-Type': 'application/json',
            'DD-API-KEY': 'DATADOG_API_KEY'
          }
        }
      );
    });
  });

  describe('#toMetricDataPoint', () => {
    it('converts data to DataDog metric data point format', () => {
      const result = toMetricDataPoint(mockMetricNamespace, mockTimeStamp, {
        metricName: 'largest_contentful_paint',
        value: '42'
      });

      expect(result).toEqual({
        series: [
          {
            host: 'lighthouse',
            type: 'gauge',
            metric: 'lighthouse.largest_contentful_paint.mockMetricNamespace',
            points: [[mockTimeStamp, '42']]
          }
        ]
      });
    });
  });
});
