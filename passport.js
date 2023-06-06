const passport = require('passport');
const passportJWT = require('passport-jwt');
const passportLocal = require('passport-local');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// Create a local strategy to log the user in
// Call it in app.js as app.use(passport('local', localStrat))
// For the login route call passport.authenticate('local') then create JWT return the user and JWT
// (sign the JWT with the user in a JSON object and the secret key so it knows)

const localStrat = new passportLocal.Strategy(async function verify(
  username,
  password,
  done
) {
  try {
    const user = await User.find({ username: username }).exec();

    if (!user) {
      return done(null, false, { message: 'Username does not exist' });
    }

    bcrypt.compare(password, user.password, (err, res) => {
      if (err) {
        return done(null, false, { message: 'Incorrect password' });
      } else {
        return done(null, user, { message: 'Successful sign in' });
      }
    });
  } catch (err) {
    return done(err);
  }
});

// Then create a JWT strategy to extract the token from the header and return the user
// If you sign it with the id you'll grab the user from the DB or store the user as a json object
// Call it in app.js as app.use(passport.('jwt', jwtStrat))
// Before any restricted route have the token authenticate the user
// Then check if the user has permission
