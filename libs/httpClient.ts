import axios from "axios";
import axiosRetry from "axios-retry";

/**
 * Server-side HTTP client for external service calls (OpenAI, webhooks, etc.).
 * Configured with strict timeouts and exponential backoff retries
 * so a failing external service never hangs a Next.js API route.
 */

const EXTERNAL_TIMEOUT_MS = 8000;
const MAX_RETRIES = 3;

const httpClient = axios.create({
  timeout: EXTERNAL_TIMEOUT_MS,
  headers: { "Content-Type": "application/json" },
});

axiosRetry(httpClient, {
  retries: MAX_RETRIES,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) =>
    axiosRetry.isNetworkOrIdempotentRequestError(error) ||
    (error.response?.status !== undefined && error.response.status >= 500),
  onRetry: (retryCount, error, requestConfig) => {
    console.warn(
      `[httpClient] Retry ${retryCount}/${MAX_RETRIES} for ${requestConfig.method?.toUpperCase()} ${requestConfig.url} — ${error.message}`
    );
  },
});

export default httpClient;
