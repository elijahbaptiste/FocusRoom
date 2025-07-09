import mysql from 'mysql2';
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { EventEmitter } from 'events';
EventEmitter.defaultMaxListeners = 20;  // Or higher if needed

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();

app.set('view engine', 'ejs');
app.use('/Styles', express.static(path.join(__dirname, '../Styles')));
app.use('/Assets', express.static(path.join(__dirname, '../Assets')));
app.set('views', path.join(__dirname, '../Views'));
app.use(express.urlencoded({ extended: false }));


// // Using environment variables for database connection
var connection = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
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

//Prepared SQL queries
const AddUser = 'INSERT INTO users (Username, password, email, SpotifyUserID) VALUES (?, ?, ?, ?)';
const FindUser = 'SELECT * FROM users WHERE Username = ?';

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
app.get('/callback', (req, res) => {
  res.render('UserDashboard.ejs');
});

app.post('/login', (req, res) => {
  // Handle login logic here
  const username = req.body.username;
  const password = req.body.password;
  console.log(`Username: ${username}, Password: ${password}`);


  connection.query(FindUser, [username], (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      return res.status(500).send('Internal Server Error');
    }

    if (results.length > 0) {
      console.log('User found:', results[0]);
      // User exists, proceed to dashboard
      bcrypt.compare(password, results[0].password, (err, isMatch) => {
        if (err) {
          console.error('Error comparing passwords:', err);
          return res.status(500).send('Internal Server Error');
        }
        if (!isMatch) {
          console.log('Password does not match.');
          return res.redirect('/login');
        }
        console.log('Password matches, redirecting to dashboard.');
        return res.redirect('/dashboard');
      });
    } else {
      console.log('No user found with the provided credentials.');
      // User not found, redirect to login with an error message
      return res.redirect('/login');
    }
  });
});

app.post('/signup', async (req, res) => {
  // Handle registration logic here
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;
  const spotifyUsername = req.body.SpotifyUsername;
  console.log(`Username: ${username}, Password: ${password}`);
  console.log(`Email: ${email}, Spotify Username: ${spotifyUsername}`);

  connection.query(FindUser, [username], (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      return res.status(500).send('Internal Server Error');
    }
    if (results.length > 0) {
      console.log('User found:', results[0]);
      // User exists
      console.log('User already exists, redirecting to login.');
      return res.redirect('/login');
    }
  });

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error('Error hashing password:', err);
      return res.status(500).send('Internal Server Error');
    }

    connection.query(AddUser, [username, hashedPassword, email, spotifyUsername], (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        return res.status(500).send('Internal Server Error');
      }
      console.log('User registered successfully:', results);
      // User registered successfully, redirect to login
      return res.redirect('/login');
    });
  });
});

// connection.end();

app.listen(3000);