import db from './database'

db.none(`CREATE TABLE IF NOT EXISTS questions
(questions_id SERIAL,
asker_name TEXT,
load_answers TEXT,
question_body TEXT,
question_date TIMESTAMP,
question_helpfulness INT,
reported BOOLEAN,
PRIMARY KEY (questions_id)
);
`)
  .then(() => {
    console.log("Table 'questions' has been created successfully.");
  })
  .catch((error) => {
    console.error('Error creating table:', error);
  });

db.none(`CREATE TABLE IF NOT EXISTS answers
(answers_id SERIAL,
body TEXT,
date TIMESTAMP,
answerer_name TEXT,
helpfulness INT,
questions_id INT,
PRIMARY KEY(answers_id),
FOREIGN KEY (questions_id) REFERENCES questions (questions_id)
);
    `)
  .then(() => {
    console.log("Table 'answers' has been created successfully.");
  })
  .catch((error) => {
    console.error('Error creating table:', error);
  });

db.none(`CREATE TABLE IF NOT EXISTS photos
(photo_id SERIAL,
url TEXT,
answers_id INT,
PRIMARY KEY (photo_id),
FOREIGN KEY (answers_id) REFERENCES answers (answers_id)
);
    `)
  .then(() => {
    console.log("Table 'photos' has been created successfully.");
  })
  .catch((error) => {
    console.error('Error creating table:', error);
  });