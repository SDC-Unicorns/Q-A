import http from 'k6/http';
import { check } from 'k6';

export let options = {
    vus: 100,
    duration: '30s',
};

export default function () {
  let tot = 1000011; //count of products
  let randomNum = Math.floor(0.9 * tot + Math.random(0.1 * tot))

    let res = http.post('http://localhost:9000/qa/questions', JSON.stringify({
        body: 'test question body',
        name: 'testUser',
        email: 'testEmail@example.com',
        product_id: randomNum,
    }), { headers: { 'Content-Type': 'application/json' } });

    check(res, {
        'is status 200': (r) => r.status === 200,
        'is response correct': (r) => r.body.indexOf('Question posted successfully') >= 0,
    });
}
