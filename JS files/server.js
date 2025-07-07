const mysql = require('mysql2');
const express = require('express');
const app = express();
const dotenv = require('dotenv').config();
const path = require('path');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../Views'));
app.use(express.urlencoded({ extended: false }));


// // Using environment variables for database connection
var connection = mysql.createConnection({
    host:  process.env.DATABASE_HOST,
    user:  process.env.DATABASE_USERNAME,
    password:  process.env.DATABASE_PASSWORD,
    database: 'FocusRoom'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the MySQL database:', err.stack);
    console.log('process.env.DATABASE_HOST:', process.env.DATABASE_HOST);
    console.log('process.env.DATABASE_USER:', process.env.DATABASE_USERNAME);
    throw err;
  }
  console.log('Connected to the MySQL database!');

}); 


app.get('/', (req, res) => {
  res.render('WelcomePage.ejs')
});

app.get('/login', (req, res) => {
  res.render('Login.ejs')
});

app.get('/register', (req, res) => {
  res.render('Signup.ejs')
});

app.get('/dashboard', (req, res) => {
  res.render('UserDashboard.ejs')
});

app.get('/main', (req, res) => {
  res.render('MainListeningPage.ejs')
});

app.post('/login', (req, res) => {
  // Handle login logic here
  const username = req.body.username;
  const password = req.body.password;
  console.log(`Username: ${username}, Password: ${password}`);



  
  res.redirect('/dashboard');
});

app.post('/signup', (req, res) => {
  // Handle registration logic here
 const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;
  const spotifyUsername = req.body.spotifyUsername;
  console.log(`Username: ${username}, Password: ${password}`);




  res.redirect('/login');
});

//example prepared statement for querying the database
// const sqlQuery = 'SELECT * FROM users WHERE id = ?';
// connection.query(sqlQuery, [1], (error, results) => {
//   if (error) throw error;
//   console.log('The solution is: ', results[0].solution);
// });
 
// connection.end();

app.listen(3000);