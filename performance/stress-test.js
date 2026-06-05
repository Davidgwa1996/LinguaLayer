import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },
    { duration: '30s', target: 100 },
    { duration: '30s', target: 200 }, // gradually increase to 200 users
    { duration: '1m', target: 200 },
    { duration: '30s', target: 0 },
  ],
};

export default function () {
  const url = __ENV.BASE_URL || 'http://localhost:3000/api/translate';
  if (!__ENV.BASE_URL) {
    console.warn('Do not run stress, spike, or soak tests against production unless explicitly approved.');
  }
  const payload = JSON.stringify({
    sourceText: "Hello there, how are you?",
    targetLanguage: "es"
  });
  const res = http.post(url, payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, {
    'translation status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
