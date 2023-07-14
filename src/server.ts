import express from 'express';
import db from './database';
let morgan = require ('morgan');

const app = express();
const port: Number = 3000;
app.use(express.static('../../fec-uranus/dist'))
app.use(morgan('dev'))

app.get('/qa/questions/', async (req: {query:{product_id:Number, page:Number, count:Number}}, res) => {
  //query questions
  console.log('req.params is:',req.query)
  let prod_id = req.query.product_id;

  console.log('this is the query',`SELECT * FROM questions WHERE product_id = ${prod_id}`)
  let page = req.query.page;
  let count = req.query.count;
  let qprom = db.query(`SELECT * FROM questions WHERE product_id = ${prod_id} LIMIT ${count}`);
  let questions = await qprom
  console.log('this is the questions: ',questions)

  let aprom = db.query(`SELECT * FROM answers WHERE question_id in (${questions.map((q:{id:Number})=>q.id)})`)
  let answers = await aprom;
  console.log('this is the answers:', answers)
  res.send(questions);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
