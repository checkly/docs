---
title: 'Send Alerts via Spike'
description: 'Configure Spike integration to receive real-time alerts from Checkly monitors'
sidebarTitle: 'Spike'
---

Checkly integrates with [Spike](https://spike.sh/) and can deliver failure, degradation, and recovery messages to any Spike channel. More specifically, Checkly will:

- Open new alerts when a check fails.
- Close alerts automatically when a failing check recovers.
- Alert when SSL certificates are about to expire.

1. First, create a **Webhook integration**. Log in to your Spike account, go to "Integrations" and search for the *Webhook* integration.

   ![setup checkly spike integration step 1](/docs/images/integrations/spike/spike_step1.png)

2. Add the **Webhook** integration and click "Enable Integration" on the next screen. Now **copy the URL**.

   ![setup checkly spike integration step 2](/docs/images/integrations/spike/spike_step2.png)

3. Log in to Checkly and navigate to [Alert Settings](https://app.checklyhq.com/alert-settings/).
   Click the "Add more channels" button, find Spike on the list, and click "Add channel".

   ![setup checkly spike integration step 3](/docs/images/integrations/spike/spike_step3.png)

4. Give the alert channel a name and **paste the URL** in the dedicated URL input field. You can now also tweak
   which alerts you want to be notified of and which checks or check groups should be subscribed to this channel.

   ![setup checkly spike integration step 4](/docs/images/integrations/spike/spike_step4.png)

   <Callout type="note">
   Note that we provide a preconfigured message payload but you are free to edit the payload and add more or different
   variables. Just click the "Edit payload" button and reference the "Help & variables tab".
   </Callout>

Congratulations! You have successfully integrated Checkly with Spike!
