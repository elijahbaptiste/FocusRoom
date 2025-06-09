const mysql = require('mysql');
const express = require('express');
const app = express();
const dotenv = require('dotenv').config();
const path = require('path');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..'));


// // Using environment variables for database connection
// var connection = mysql.createConnection({
//     host:  process.env.DATABASE_HOST,
//     user:  process.env.DATABASE_USER,
//     password:  process.env.DATABASE_PASSWORD,
//     database: 'FocusRoom'
// });

// connection.connect((err) => {
//   if (err) throw err;
//   console.log('Connected to the MySQL database!');
// }); 


app.get('/', (req, res) => {
  res.render('WelcomPage.ejs')
});



//example prepared statement for querying the database
// const sqlQuery = 'SELECT * FROM users WHERE id = ?';
// connection.query(sqlQuery, [1], (error, results) => {
//   if (error) throw error;
//   console.log('The solution is: ', results[0].solution);
// });
 
// connection.end();

app.listen(3000);