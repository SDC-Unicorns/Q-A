import db from './database'
//Bug in here that makes you have to run the file multiple times to make all of the tables
//Making questions table too slow, (async) and answers isn't created yet

db.none(`CREATE TABLE IF NOT EXISTS questions
(id SERIAL,
product_id INT,
body TEXT,
date_written TEXT,
asker_name TEXT,
asker_email TEXT,
reported BOOLEAN,
helpful INT,
PRIMARY KEY (id)
);
`)
  .then(() => {
    console.log("Table 'questions' has been created successfully.");
    db.none(`CREATE TABLE IF NOT EXISTS answers
            (id SERIAL,
              question_id INT,
              body TEXT,
              date_written TEXT,
              answerer_name TEXT,
              answerer_email TEXT,
              reported BOOLEAN,
              helpful INT,
              PRIMARY KEY(id),
              FOREIGN KEY (question_id) REFERENCES questions (id)
              );
    `)
      .then(() => {
        console.log("Table 'answers' has been created successfully.");
        db.none(`
                CREATE TABLE IF NOT EXISTS photos
                (id SERIAL,
                answer_id INT,
                url TEXT,
                PRIMARY KEY (id),
                FOREIGN KEY (answer_id) REFERENCES answers (id)
                );
              `)
          .then(() => {
            console.log("Table 'photos' has been created successfully.");
          })
          .catch((error) => {
            console.error('Error creating table:', error);
          });
      })
      .catch((error) => {
        console.error('Error creating table:', error);
      });
  })
  .catch((error) => {
    console.error('Error creating table:', error);
  });



