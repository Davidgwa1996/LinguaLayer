import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 20 },
    { duration: '10s', target: 200 }, // fast spike
    { duration: '30s', target: 200 },
    { duration: '10s', target: 20 },
    { duration: '10s', target: 0 },
  ],
};

export default function () {
  const url = __ENV.BASE_URL || 'http://localhost:3000/api/v1/health';
  if (!__ENV.BASE_URL) {
    console.warn('Do not run stress, spike, or soak tests against production unless explicitly approved.');
  }
  const res = http.get(url);

  check(res, {
    'health check status is 200': (r) => r.status === 200,
  });

  sleep(0.5);
}
