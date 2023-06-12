const argon2 = require('argon2');

const hashingOptions = {
  type: argon2.argon2id,
  memoryCost: 2 ** 16,
  timeCost: 5,
  parallelism: 1,
};

const hashPassword = (req, res, next) => {
  // hash the password using argon2 then call next()
  argon2
    .hash(req.body.password, hashingOptions)
    .then((hashedPassword) => {
      req.body.hashedPassword = hashedPassword;
      delete req.body.password;

      next();
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(500);
    });
};

const hidePassword = (req, res) => {
  const users = res.users;
  users.map((user) => delete user.hashedPassword);
  res.json(users);
};

module.exports = {
  hashPassword,
  hidePassword,
};
