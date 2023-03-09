const ExpressError = require("../expressError");
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { BCRYPT_WORK_FACTOR, SECRET_KEY } = require("../config")
/** User class for message.ly */



/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register(username, password, first_name, last_name, phone) {
    try {
      // hash password
      const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

      // save to db
      const result = await db.query(
      `INSERT INTO users (
          username, 
          password, 
          first_name, 
          last_name, 
          phone, join_at)
          VALUES ($1, $2, $3, $4, $5, current_timestamp)
          RETURNING username, password, first_name, last_name, phone`,
          [username, hashedPassword, first_name, last_name, phone]);
      const user = result.rows[0];
      if (user) {
        if (await bcrypt.compare(password, user.password)) {
          const token = jwt.sign( {username}, SECRET_KEY);
          return { message: "Logged in", token}
        }
      }
      throw new ExpressError("Invalid username/password", 400)
    } catch(e)
    {
      if (e.code === '23505') {
        return new ExpressError("Username taken. Please pick another!", 400)
      }
      return e  
    }
  }

  /** Authenticate: is this username/password valid? Returns token. */

  static async authenticate(username, password) { 
    try{
      const result = await db.query(
        `SELECT username,password
        FROM users WHERE username = $1`,
        [username]);
      
      const user = result.rows[0]

      if (user) {
        if (await bcrypt.compare(password, user.password)) {
          const token = jwt.sign( {username}, SECRET_KEY);
          console.log(token, 'i am token')
          User.updateLoginTimestamp(username)
          User.all()
          return token
        }
      }
      throw new ExpressError("Invalid username/password", 400)

    } catch(e) {
      return e
    }
  }

  /** Update last_login_at for user */
  static async updateLoginTimestamp(username) { 
    const result = await db.query(
      `UPDATE users
         SET last_login_at = current_timestamp
         WHERE username = $1
         RETURNING username, last_login_at`,
      [username]);

  if (!result.rows[0]) {
    throw new ExpressError(`No such message: ${id}`, 404);
  }

  return result.rows[0];
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() { 
    const results = await db.query(
      `SELECT username, first_name, last_name, phone
      FROM users`)
    console.log(results.rows)
    return results.rows

  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async getByUsername(username) {
    console.log('made it to User.get(username)', username)
    const results = await db.query(
      `SELECT first_name,
         last_name, 
         phone, 
         join_at,
         last_login_at
        FROM users WHERE username = $1`,
      [username]
    );

    const user = results.rows[0];
    console.log(user)

    if (user === undefined) {
      const err = new Error(`No such user: ${username}`);
      err.status = 404;
      throw err;
    }

    return user;
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const result = await db.query(
        `SELECT m.id,
                m.to_username,
                u.first_name,
                u.last_name,
                u.phone,
                m.body,
                m.sent_at,
                m.read_at
          FROM messages AS m
            JOIN users AS u ON m.to_username = u.username
          WHERE from_username = $1`,
        [username]);

    return result.rows.map(m => ({
      id: m.id,
      to_user: {
        username: m.to_username,
        first_name: m.first_name,
        last_name: m.last_name,
        phone: m.phone
      },
      body: m.body,
      sent_at: m.sent_at,
      read_at: m.read_at
    }));
  }


  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    const result = await db.query(
        `SELECT m.id,
                m.from_username,
                u.first_name,
                u.last_name,
                u.phone,
                m.body,
                m.sent_at,
                m.read_at
          FROM messages AS m
           JOIN users AS u ON m.from_username = u.username
          WHERE to_username = $1`,
        [username]);

    return result.rows.map(m => ({
      id: m.id,
      from_user: {
        username: m.from_username,
        first_name: m.first_name,
        last_name: m.last_name,
        phone: m.phone,
      },
      body: m.body,
      sent_at: m.sent_at,
      read_at: m.read_at
    }));
  }
}


module.exports = User;