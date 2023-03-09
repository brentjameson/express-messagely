DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    username text PRIMARY KEY,
    password text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    phone text NOT NULL,
    join_at timestamp without time zone DEFAULT CURRENT_DATE NOT NULL,
    last_login_at timestamp with time zone
);

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    from_username text NOT NULL REFERENCES users,
    to_username text NOT NULL REFERENCES users,
    body text NOT NULL,
    sent_at timestamp with time zone NOT NULL,
    read_at timestamp with time zone
);

INSERT INTO users
  VALUES ('apple', 'apple123!', 'Steve', 'Jobs', '555-555-5555'),
         ('test_user_5', 'testit10', 'tes', 'stuh', '555-234-2423');

INSERT INTO messages
  VALUES 
        (1,'test_user_5', 'apple', 'this is a silly mess-age','2023-03-06 15:52:22.9'),
        (2,'test_user_5', 'apple', 'this is a sillier mess-age','2023-03-06 15:52:22.9');
