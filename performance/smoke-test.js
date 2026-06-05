import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 5,
  duration: '10s',
};

export default function () {
  const url = __ENV.BASE_URL || 'http://localhost:3000/api/v1/sessions';
  if (url.includes('production')) {
    console.warn('Do not run stress, spike, or soak tests against production unless explicitly approved.');
  }
  const res = http.post(url, JSON.stringify({}), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
