export const METRIC_SCORE_MAP = {
  // General scores
  performance: 'categories.performance.score',
  accessibility: 'categories.accessibility.score',
  seo: 'categories.seo.score',
  best_practices: 'categories.["best-practices"].score',
  pwa: 'categories.pwa.score',
  // Performance breakdown
  first_contentful_paint: 'audits["first-contentful-paint"].numericValue',
  speed_index: 'audits["speed-index"].numericValue',
  largest_contentful_paint: 'audits["largest-contentful-paint"].numericValue',
  time_to_interactive: 'audits["interactive"].numericValue',
  total_blocking_time: 'audits["total-blocking-time"].numericValue',
  cumulative_layout_shift: 'audits["cumulative-layout-shift"].numericValue',
  server_response_time: 'audits["server-response-time"].numericValue'
};
