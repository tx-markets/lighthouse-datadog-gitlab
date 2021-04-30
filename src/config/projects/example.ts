import { LighthouseRunSettings } from '../../lighthouse/lighthouse-utils';
import blockThirdPartyScripts from '../custom-lighthouse-configs/block-third-party-scripts.config';

const config: LighthouseRunSettings[] = [
  {
    url: 'http://example.com/',
    metricNamespace: 'example'
  },
  {
    url: 'http://example.com/',
    metricNamespace: 'example_block_third_party_scripts',
    customLighthouseConfig: blockThirdPartyScripts
  }
];

export default config;
