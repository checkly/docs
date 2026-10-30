import { WebhookAlertChannel } from 'checkly/constructs'

// One channel, one Raw HTTP Source in Cribl Stream. Routes decide where it goes from there.
export const criblAlerts = new WebhookAlertChannel('cribl-alerts', {
  name: 'Cribl Stream',
  method: 'POST',
  url: '{{CRIBL_ALERTS_URL}}',
  headers: [
    { key: 'Authorization', value: '{{{CRIBL_TOKEN}}}' },
    { key: 'Content-Type', value: 'application/json' },
  ],
  // One line on purpose: Cribl's default Event Breaker splits events on newlines.
  template: '{"sender":"checkly","alertType":"{{ALERT_TYPE}}","title":"{{ALERT_TITLE}}","check":{"name":"{{CHECK_NAME}}","id":"{{CHECK_ID}}","type":"{{CHECK_TYPE}}","group":"{{GROUP_NAME}}"},"resultId":"{{CHECK_RESULT_ID}}","location":"{{RUN_LOCATION}}","startedAt":"{{STARTED_AT}}","responseTimeMs":"{{RESPONSE_TIME}}","resultLink":"{{RESULT_LINK}}","traceId":"{{OTEL_TRACE_ID}}",{{#if AI_ANALYSIS_LINK}}"classification":"{{AI_ANALYSIS_CLASSIFICATION}}","aiAnalysisLink":"{{AI_ANALYSIS_LINK}}",{{/if}}"tags":[{{#each TAGS}}"{{this}}"{{#unless @last}},{{/unless}}{{/each}}]}',
  sendFailure: true,
  sendDegraded: true,
  sendRecovery: true,
})
