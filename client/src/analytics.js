import posthog from 'posthog-js';

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY || 'phc_tjffTamoTjAtLHtTYA8doXMF8HzHthYpcu8zgXZGZy3V';
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';

export function initAnalytics() {
  if (typeof window === 'undefined') return;

  try {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      autocapture: true,
      capture_pageview: true,
      capture_pageleave: true,
      session_recording: {
        maskAllInputs: false,
        maskInputOptions: {
          password: true
        }
      },
      loaded: (ph) => {
        if (import.meta.env.DEV) {
          console.log('[Analytics] PostHog loaded successfully');
        }
      }
    });
  } catch (err) {
    console.warn('[Analytics] Failed to initialize PostHog:', err);
  }
}

export function trackEvent(name, properties = {}) {
  try {
    posthog.capture(name, properties);
  } catch (e) {
    // Non-blocking
  }
}

export { posthog };
