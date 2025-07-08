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

// //Spotfiy API function setup. Code based on the Spotify API documentation found here : https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow
// const params = new URLSearchParams(window.location.search);
// const code = params.get("code")

// if (!code) {
//   redirectToAuthCodeFlow(process.env.SPOTIFY_CLIENT_ID);
// } else {
//   const accessToken = await getAccessToken(process.env.SPOTIFY_CLIENT_ID, code);
//   const profile = await fetchProfile(accessToken);
//   console.log(profile);
//   populateUI(profile);
// }

// export async function redirectToAuthCodeFlow(clientId) {
//   // TODO: Redirect to Spotify authorization page
//   const verifier = generateCodeVerifier(128);
//   const challenge = await generateCodeChallenge(verifier);

//   localStorage.setItem("verifier", verifier);

//   const params = new URLSearchParams();
//   params.append("client_id", process.env.SPOTIFY_CLIENT_ID);
//   params.append("response_type", "code");
//   params.append("redirect_uri", "http://127.0.0.1:3000/callback");
//   params.append("scope", "user-read-private user-read-email");
//   params.append("code_challenge_method", "S256");
//   params.append("code_challenge", challenge);

//   document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
// }


// function generateCodeVerifier(length) {
//   let text = '';
//   let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

//   for (let i = 0; i < length; i++) {
//     text += possible.charAt(Math.floor(Math.random() * possible.length));
//   }
//   return text;
// }

// async function generateCodeChallenge(codeVerifier) {
//   const data = new TextEncoder().encode(codeVerifier);
//   const digest = await window.crypto.subtle.digest('SHA-256', data);
//   return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
//     .replace(/\+/g, '-')
//     .replace(/\//g, '_')
//     .replace(/=+$/, '');
// }

// async function getAccessToken(clientId, code) {
//   // TODO: Get access token for code
//   const verifier = localStorage.getItem("verifier");

//   const params = new URLSearchParams();
//   params.append("client_id", process.env.SPOTIFY_CLIENT_ID);
//   params.append("grant_type", "authorization_code");
//   params.append("code", code);
//   params.append("redirect_uri", "http://127.0.0.1:3000/callback");
//   params.append("code_verifier", verifier);

//   const result = await fetch("https://accounts.spotify.com/api/token", {
//     method: "POST",
//     headers: { "Content-Type": "application/x-www-form-urlencoded" },
//     body: params
//   });

//   const { access_token } = await result.json();
//   return access_token;
// }

// async function fetchProfile(token) {
//   // TODO: Call Web API
//   const result = await fetch("https://api.spotify.com/v1/me", {
//     method: "GET", headers: { Authorization: `Bearer ${token}` }
//   });

//   return await result.json();
// }

// function populateUI(profile) {
//   // TODO: Update UI with profile data
//   document.getElementById("Spotify Username").innerText = profile.display_name;
//   if (profile.images[0]) {
//     const profileImage = new Image(200, 200);
//     profileImage.src = profile.images[0].url;
//     document.getElementById("avatar").appendChild(profileImage);
//   }
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
  res.render('UserDashboard.ejs')
});

app.get('/main', (req, res) => {
  res.render('MainListeningPage.ejs')
});
app.get('/callback', (req, res) => {
  res.send('Callback reached');
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