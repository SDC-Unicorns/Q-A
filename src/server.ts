import express, { urlencoded } from 'express';
import { QueryParam } from 'pg-promise';
import db from './database';
let morgan = require('morgan');

const app = express();
const port: Number = 9000;
app.use(express.static('../../fec-uranus/dist'));
app.use(morgan('dev'));
app.use(urlencoded());
app.use(express.json());

type putReq = { params: { id: Number } }

app.get('/qa/questions', async (req: { query: { product_id: Number, page: Number, count: Number } }, res) => {
  try {
  let questions = await db.any(`
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
  FROM questions LEFT JOIN answers ON questions.id = answers.question_id WHERE questions.product_id = $1
  GROUP BY questions.id
  ORDER BY questions.id
  LIMIT $2 OFFSET $3
  `, [req.query.product_id, req.query.count, (Number(req.query.page)  -1)* Number(req.query.count)]);
  res.send(questions);
    } catch (err:any) {
      res.send(err).status(400)
    }
});

app.post('/qa/questions', async (req, res) => {
  let { body: questionBody, name: questionName, email: questionEmail, product_id: productId } = req.body;
  const questionQuery = `
  INSERT INTO questions (product_id, body, date_written, asker_name, asker_email, reported, helpful)
  VALUES ($1, $2, NOW(), $3, $4, false, 0)
  RETURNING id
`;
try {
  await db.one(questionQuery, [productId, questionBody, questionName, questionEmail]);
  res.send('Question created successfully');
} catch (err:any) {
  res.send('Error writing new question').status(400)
}

})

app.post('/qa/questions/:question_id/answers', async (req, res) => {
  let { body: answerBody, name: username, email, photos } = req.body;
  let questionId = req.params.question_id

  const answerQuery: QueryParam = `
    INSERT INTO answers (question_id, body, date_written, answerer_name, answerer_email)
    VALUES ($1, $2, NOW(), $3, $4)
    RETURNING id
  `;
  try {
    let answerId = await db.one(answerQuery, [questionId, answerBody, username, email]);
    res.send('Successfully written new Answer');
  } catch (err: any) {
    res.send('Error writing new answer').status(400);
  }

})

app.put('/questions/:id/helpful', async (req, res) => {
  try {
  const questionId = req.params.id;
  const query = `UPDATE questions SET helpful = helpful + 1 WHERE id = $1`;
  await db.none(query, [questionId]);
  res.send(`Question ${questionId} marked as helpful.`);
  } catch (err:any) {
    res.send(err).status(400);
  }
});

app.put('/qa/answers/:id/helpful', async (req, res) => {
  try {
  const answerId = req.params.id;
  const query = `UPDATE answers SET helpful = helpful + 1 WHERE id = $1`;
  await db.none(query, [answerId]);
  res.send(`Answer ${answerId} marked as helpful.`);
  } catch (err: any) {
    res.send(err).status(400);
  }
});

app.put('/qa/questions/:id/report', async (req, res) => {
  try {
  const questionId = req.params.id;
  const query = `UPDATE questions SET reported = true WHERE id = $1`;
  await db.none(query, [questionId]);
  res.send(`Question ${questionId} has been reported.`);
  } catch (err: any) {
    res.send(err).status(400);
  }
});

app.put('/qa/answers/:id/report', async (req, res) => {
  try {
  const answerId = req.params.id;
  const query = `UPDATE answers SET reported = true WHERE id = $1`;
  await db.none(query, [answerId]);
  res.send(`Answer ${answerId} has been reported.`);
  } catch (err: any) {
    res.send(err).status(400);
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});