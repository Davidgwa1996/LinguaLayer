import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 20 },
    { duration: '3m', target: 20 }, // maintain steady load for extended period
    { duration: '1m', target: 0 },
  ],
};

export default function () {
  const url = __ENV.BASE_URL || 'http://localhost:3000/api/v1/sessions';
  if (!__ENV.BASE_URL) {
    console.warn('Do not run stress, spike, or soak tests against production unless explicitly approved.');
  }
  const res = http.post(url, JSON.stringify({}), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(2);
}
