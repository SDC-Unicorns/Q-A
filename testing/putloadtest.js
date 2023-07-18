import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 200,
  duration: '30s',
};

export default function () {
  let tot = 6879306 //count of answers
  let randomNum = Math.floor(0.9 * tot + Math.random(0.1 * tot))

  let res = http.put(`http://localhost:9000/qa/answers/${randomNum}/helpful`, {}, { headers: { 'Content-Type': 'application/json' } });

  // check the response
  check(res, {
    'is status 204': (r) => r.status === 204,
    'is response correct': (r) => r.body.indexOf('Helpfulness increased successfully') >= 0,
  });
}
