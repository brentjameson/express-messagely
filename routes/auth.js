const express = require("express");
const router = new express.Router()
const ExpressError = require("../expressError");
const User = require("../models/user");
const { ensureLoggedIn } = require("../middleware/auth");

router.get('/', ensureLoggedIn, (req, res, next) => {
    res.send(`${req.user.username} is a valid user... go play`)
})

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
  

router.post('/login', async (req,res, next) => {
    try{
      const {username, password} = req.body;

      if (!username || !password) {
      throw new ExpressError("Username and password required", 400);
    }
      const token = await User.authenticate(username, password )
      if (!token) {
        throw new ExpressError('Invalid login', 401 )
      }
      return res.json({ _token: token })
      
    } catch(e) {
      return next(e)
    }
})


/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post('/register', async (req,res, next) => {
  try{
      const {username, password, first_name, last_name, phone} = req.body;

      if (!username || !password) {
      throw new ExpressError("Username and password required", 400);
    }

      const newUser = await User.register(username, password, first_name, last_name, phone )

      return res.send(newUser)
      
    } catch(e) {
      return next(e)
    }
})

module.exports = router;
