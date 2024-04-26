import { datadogRum } from '@datadog/browser-rum';
import { datadogLogs } from '@datadog/browser-logs';

class HtmlWebpackDatadogPlugin {
  constructor(options) {
    this.options = {
      accountID: undefined,
      agentID: undefined,
      applicationID: undefined,
      licenseKey: undefined,
      trustKey: undefined,
      ...options,
    };
    this.initialize();
  }

  initialize() {
    datadogRum.init({
      applicationId: 'a3f99dcb-4955-4baa-8341-39a88603ab08',
      clientToken: 'pubf2e79d946cec4c4413965620ba0e0b72',
      site: 'datadoghq.com',
      service: 'edx-frontend-sandbox',
      env: 'staging',
      // Specify a version number to identify the deployed version of your application in Datadog
      version: '1.0.0',
      sessionSampleRate: 100,
      sessionReplaySampleRate: 20,
      trackUserInteractions: true,
      trackResources: true,
      trackLongTasks: true,
      defaultPrivacyLevel: 'mask-user-input',
    });
    datadogLogs.init({
      clientToken: 'pubf2e79d946cec4c4413965620ba0e0b72',
      site: 'datadoghq.com',
      forwardErrorsToLogs: true,
      sessionSampleRate: 100,
      service: 'edx_sandbox_testing',
    });
    if (window && typeof window !== 'undefined') {
      window.datadog = datadogLogs.logger;
    }
  }
}

export default HtmlWebpackDatadogPlugin;
