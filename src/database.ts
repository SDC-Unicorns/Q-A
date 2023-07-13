import pgPromise from 'pg-promise';
import dotenv from 'dotenv';

dotenv.config();

const pgp = pgPromise({});
const db = pgp(process.env.DATABASE_URL as string);

// db.none('CREATE DATABASE qa')
//   .then(()=>{
//     console.log("Database 'qa' has been created successfully");
//   })
//   .catch((error)=>{
//     console.error('Error Creating Database:', error);
//   })


export default db;
