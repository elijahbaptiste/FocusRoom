DROP DATABASE IF EXISTS FocusRoom;
CREATE DATABASE FocusRoom;
USE FocusRoom;

CREATE TABLE Users(
Username varchar(255) NOT NULL,
email varchar(255) NOT NULL,
password varchar(255) NOT NULL,

PRIMARY KEY (Username)
);


