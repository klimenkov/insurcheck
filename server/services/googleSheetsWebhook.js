/**
 * Google Sheets Emergency Append-Only Webhook Service
 * Sends incoming events to an external Google Sheet via Google Apps Script Web App.
 * Completely non-blocking and fail-safe: failures are logged as warnings and never
 * interrupt primary database transactions or user responses.
 */

export async function sendToGoogleSheets(eventType, payload, summary = '') {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!webhookUrl || !webhookUrl.trim().startsWith('http')) {
    // Webhook not configured; gracefully skip
    return { success: false, reason: 'unconfigured' };
  }

  const timestamp = new Date().toISOString();
  const postData = {
    timestamp,
    eventType,
    summary: summary || `${eventType} event at ${timestamp}`,
    payload: payload || {}
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(webhookUrl.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postData),
      redirect: 'follow',
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      console.log(`[GoogleSheets Webhook] Successfully sent ${eventType} event to Google Sheets.`);
      return { success: true };
    } else {
      console.warn(`[GoogleSheets Webhook Warning] HTTP ${response.status} response from webhook.`);
      return { success: false, status: response.status };
    }
  } catch (err) {
    console.warn(`[GoogleSheets Webhook Warning] Could not dispatch ${eventType}: ${err.message}`);
    return { success: false, error: err.message };
  }
}
