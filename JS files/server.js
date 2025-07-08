const mysql = require('mysql2');
const express = require('express');
const app = express();
const dotenv = require('dotenv').config();
const path = require('path');
const bcrypt = require('bcrypt');

app.set('view engine', 'ejs');
app.use('/Styles', express.static(path.join(__dirname, '../Styles')));
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

const AddUser = 'INSERT INTO users (Username, password, email, SpotifyUserID) VALUES (?, ?, ?, ?)';
const FindUser = 'SELECT * FROM users WHERE Username = ?';

// Spotfiy API function setup. Code based on the Spotify API documentation found here : https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow
// const generateRandomString = (length) => {
//   const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//   const values = crypto.getRandomValues(new Uint8Array(length));
//   return values.reduce((acc, x) => acc + possible[x % possible.length], "");
// }

// const state  = generateRandomString(64);

// const SpotfiyAuthorize = (req, res) => {

//   res.redirect('https://accounts.spotify.com/authorize?' +
//     querystring.stringify({
//       response_type: 'code',
//       client_id: process.env.SPOTIFY_CLIENT_ID,
//       scope: 'user-read-private user-read-email',
//       redirect_uri: redirect_uri,
//       state: state
//     }));
  
//   return window.crypto.subtle.digest('SHA-256', data)
// }



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
  //SpotfiyAuthorize(req, res);
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