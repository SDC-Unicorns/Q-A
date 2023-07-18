import http from 'k6/http';
import { sleep } from 'k6';

export let options = {
  stages: [
    { duration: '10s', target: 50 },  // simulate ramp-up of traffic from 1 to 50 users over 10 seconds
    { duration: '30s', target: 50 },  // stay at 50 users for 30 seconds
    { duration: '10s', target: 0 },   // ramp-down to 0 users over the last 10 seconds
  ],
};

export default function () {
  let res = http.get('http://localhost:9000/qa/questions?product_id=40343&page=1&count=10');
  sleep(1);
}
