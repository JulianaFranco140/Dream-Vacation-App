-- Initialize the dreamvacations database
USE dreamvacations;

-- Create the destinations table
CREATE TABLE IF NOT EXISTS destinations
(
    id         INT AUTO_INCREMENT PRIMARY KEY,
    country    VARCHAR(255) NOT NULL,
    capital    VARCHAR(255),
    population BIGINT,
    region     VARCHAR(255),
    languages  VARCHAR(255)
);
