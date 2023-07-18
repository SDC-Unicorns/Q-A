import http from 'k6/http';
import { sleep } from 'k6';

export let options = {
  stages: [
    { duration: '10s', target: 2000 },  // simulate ramp-up of traffic from 1 to 50 users over 10 seconds
    { duration: '30s', target: 2000 },  // stay at 50 users for 30 seconds
    { duration: '10s', target: 0 },   // ramp-down to 0 users over the last 10 seconds
  ],
};

export default function () {
  let tot = 1000011; //count of products
  let randomNum = Math.floor(0.9 * tot + Math.random(0.1 * tot))
  let res = http.get(`http://localhost:9000/qa/questions?product_id=${randomNum}&page=1&count=10`);
  sleep(1);
}
