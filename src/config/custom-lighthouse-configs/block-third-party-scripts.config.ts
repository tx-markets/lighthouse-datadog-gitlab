export default {
  name: 'Block third-party scripts',
  extends: 'lighthouse:default',
  settings: {
    blockedUrlPatterns: ['*google*', '*hotjar*', '*datadog*', '*bing*']
  }
};
