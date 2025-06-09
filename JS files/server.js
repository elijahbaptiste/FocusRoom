const mysql = require('mysql');
const express = require('express');

// Using environment variables for database connection
var connection = mysql.createConnection({
    host: DATABASE_HOST,
    user: DATABASE_USER,
    password: DATABASE_PASSWORD,
    database: 'FocusRoom'
});

connection.connect(); 