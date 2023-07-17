import express, { urlencoded } from 'express';
import { QueryParam } from 'pg-promise';
import db from './database';
let morgan = require('morgan');

const app = express();
const port: Number = 3000;
app.use(express.static('../../fec-uranus/dist'));
app.use(morgan('dev'));
app.use(urlencoded());
app.use(express.json());


type putReq = { params: { id: Number } }
type postReq = { params: {} }

app.get('/qa/questions/', async (req: { query: { product_id: Number, page: Number, count: Number } }, res) => {
  let prod_id = req.query.product_id;

  let page = req.query.page;
  let count = req.query.count;
  // let qprom = db.query(`SELECT * FROM questions WHERE product_id = ${prod_id} LIMIT ${count}`);
  // let questions = await qprom
  // console.log('this is the questions: ',questions)

  // let aprom = db.query(`SELECT * FROM answers WHERE question_id IN (${questions.map((q:{id:Number})=>q.id)})`)
  // let answers = await aprom;
  // console.log('this is the answers:', answers)

  //do this with a join table???
  let questions = await db.query(`
  EXPLAIN ANALYZE
  SELECT JSON_BUILD_OBJECT
  ('question_id', questions.id,
  'asker_name', questions.asker_name,
  'question_body', questions.body,
  'question_date', questions.date_written,
  'question_helpfulness', questions.helpful,
  'reported', questions.reported,
  'answers', jsonb_agg (
    json_build_object(
      'answer_id', answers.id,
      'question_id', answers.question_id,
      'body', answers.body,
      'date', answers.date_written,
      'answerer_name', answers.answerer_name,
      'photos', (SELECT JSONB_AGG(photos.url) FROM photos WHERE photos.answer_id = answers.id)
      )
    )
  )
  FROM questions LEFT JOIN answers ON questions.id = answers.question_id WHERE questions.product_id = ?
  GROUP BY questions.id;
  `, prod_id)
  console.log(questions)
  res.send(questions);
});

app.post('qa/questions/', (req, res) => {
  //check auth?? (should this be middleware?)
  //write to DB


  app.post('qa/answers/', async (req, res) => {
    let { body: answerBody, name: username, email, photos } = req.body;
    let questionId = req.query.question_id

    const answerQuery: QueryParam = `
    INSERT INTO answers (question_id, body, date_written, answerer_name, answerer_email)
    VALUES ($1, $2, NOW(), $3, $4)
    RETURNING id
  `;
    try {
      let answerId = await db.one(answerQuery, [questionId, answerBody, username, email]);
      res.send('Successfully written new Answer');
    } catch (err: any) {
      res.send('Error writing new answer');
    }

  })
})

app.put('qa/questions', (req: putReq, res) => {

})
app.put('qa/answers', (req: putReq, res) => {

})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});