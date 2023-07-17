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
  `, prod_id);
  console.log(questions)
  res.send(questions);
});

app.post('qa/questions/', async (req, res) => {
  //check auth?? (should this be middleware?)
  //write to DB
  let { body: questionBody, name: questionName, email: questionEmail, product_id: productId } = req.body;

  const questionQuery = `
  INSERT INTO questions (product_id, body, date_written, asker_name, asker_email, reported, helpful)
  VALUES ($1, $2, NOW(), $3, $4, false, 0)
  RETURNING id
`;
try {
  await db.one(questionQuery, [productId, questionBody, questionName, questionEmail]);
  res.send('Question created successfully');
} catch (err) {
  res.send('Error writing new question')
}

})

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


app.put('qa/questions', (req: putReq, res) => {

})
app.put('qa/answers', (req: putReq, res) => {

})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});