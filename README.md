![Dog sniffing the Lighthouse](image.jpg)   
*Image from [https://dogtrekker.com](https://dogtrekker.com/Story/Kissing-the-Santa-Cruz-Coast)*

# Lighthouse/DataDog/GitLab

An example of a scheduled GitLab job running Lighthouse audits and posting results as custom DataDog metrics.

A [GitLab job](.gitlab-ci.yml) audits a set of URLs at a time - a "project". Each URL is mapped to DataDog custom metric namespace and can be assigned a custom Lighthouse configuration.

1. [Lighthouse metrics reported to DataDog](#lighthouse-metrics-reported-to-datadog)
1. [Configuring a project to audit](#configuring-a-project-to-audit)
1. [Running Lighthouse with custom config](#running-lighthouse-with-custom-config)
1. [DataDog metrics naming](#datadog-metrics-naming)

## Lighthouse metrics reported to DataDog

Scores:
- Performance
- Accessibility
- SEO
- Best practices
- PWA

Other metric values:
- First contentful paint
- Speed index
- Largest contentful paint
- Time to interactive
- Total blocking time
- Cumulative layout shift
- Server response time

Custom values:
- Total bundle size - a total size of all javascript downloaded by the browser (sent as a `total_bundle_size` DataDog metric)

An object in [src/config/metric-map.ts](src/config/metric-map.ts) maps Lighthouse report scores to the DataDog-compatible metric names.

## Configuring a project to audit

1. Create a project file in the [src/config/projects](src/config/projects) directory specifying the array of URLs to test 
and corresponding metric namespaces you would like to use in DataDog. See [example here](src/config/projects/example.ts). Add your project to [src/config/projects/index.ts](src/config/projects/index.ts)
1. In GitLab create a new Scheduled Job, providing your project handle via `AUDITED_PROJECT` environment variable

## Running Lighthouse with custom config

It is possible to [run Lighthouse with a custom configuration](https://github.com/GoogleChrome/lighthouse/blob/master/docs/configuration.md), that lets you fine-tune the run (e.g. block certain scripts).
To do so:

1. Add your custom Lighthouse config as a `*.config.ts` file in the [src/config/custom-lighthouse-configs](src/config/custom-lighthouse-configs) folder.

    ```
    export default {
      name: 'My custom config',
      extends: 'lighthouse:default',
      settings: {
         // custom settings
      }
   };
    ```

1. In your project configuration provide the custom config via a `customLighthouseConfig` property.

    ```
    import myCustomConfig from '../custom-lighthouse-configs/my-custom-config';
   
    export default [
      {
        url: 'https://url1',
        metricNamespace: 'abc'
        customLighthouseConfig: myCustomConfig
      }
    ];
    ```  

## DataDog metrics naming

Metrics sent will be following this naming convention: 

```
lighthouse.[metric-name].[metric-namespace]
```

Where

- [metric-name] is one of the metric names, see [Lighthouse metrics reported to DataDog](#lighthouse-metrics-reported-to-datadog) section below
- [metric-namespace] is a `metricNamespace` from your project config in [src/config/projects](src/config/projects)

NOTE: DataDog metric names and namespaces must follow [DataDog naming convention](https://docs.datadoghq.com/developers/metrics/#naming-custom-metrics).

