const database = require('./database');

const getUsers = (req, res, next) => {
  let sql = 'select * from users';
  const sqlValues = [];

  if (req.query.city != null) {
    sql += ' where city = ?';
    sqlValues.push(req.query.city);

    if (req.query.language != null) {
      sql += ' and language <= ?';
      sqlValues.push(req.query.language);
    }
  } else if (req.query.language != null) {
    sql += ' where language <= ?';
    sqlValues.push(req.query.language);
  }

  database
    .query(sql, sqlValues)
    .then(([users]) => {
      res.users = users;
      next();
    })

    .catch((err) => {
      console.error(err);
      res.status(500).send('Error retrieving data from database');
    });
};

const getUserById = (req, res, next) => {
  const id = parseInt(req.params.id);

  database
    .query(
      'SELECT id, firstname, lastname, email, city, language FROM users WHERE id = ?',
      [id]
    )
    .then(([users]) => {
      if (users[0] != null) {
        res.users = users;
        next();
      } else {
        res.status(404).send('Not Found');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error retrieving data from the database');
    });
};

const getUserByEmailWithPasswordAndPassToNext = (req, res, next) => {
  const { email } = req.body;
  database
    .query('SELECT * FROM users WHERE email = ?', [email])
    .then(([users]) => {
      if (users[0] != null) {
        req.user = users[0];
        console.log(users[0]);
        next();
      } else {
        res.sendStatus(401);
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send('Error retrieving data from the database');
    });
};

const postUser = (req, res) => {
  const { firstname, lastname, email, city, language, hashedPassword } =
    req.body;

  database
    .query(
      'INSERT INTO users (firstname, lastname, email, city, language, hashedPassword) VALUES (?, ?, ?, ?, ?, ?)',
      [firstname, lastname, email, city, language, hashedPassword]
    )
    .then(([result]) => {
      res.location(`/api/users/${result.insertId}`).sendStatus(201);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error saving the user');
    });
};

const updateUser = (req, res) => {
  const id = parseInt(req.params.id);
  const { firstname, lastname, email, city, language, hashedPassword } =
    req.body;

  if (id !== req.payload.sub) {
    res.status(403).send('Forbidden');
    return;
  }

  database
    .query(
      'UPDATE users SET firstname = ?, lastname = ?, email = ?, city = ?, language = ?, hashedPassword = ? WHERE id = ?',
      [firstname, lastname, email, city, language, hashedPassword, id]
    )
    .then(([result]) => {
      if (result.affectedRows === 0) {
        res.status(404).send('Not Found');
      } else {
        res.sendStatus(204);
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error editing the user');
    });
};

const deleteUser = (req, res) => {
  const id = parseInt(req.params.id);

  if (id !== req.payload.sub) {
    res.status(403).send('Forbidden');
    return;
  }

  database
    .query('DELETE FROM users WHERE id = ?', [id])
    .then(([result]) => {
      if (result.affectedRows === 0) {
        res.status(404).send('Not Found');
      } else {
        res.sendStatus(204);
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error deleting the user');
    });
};

module.exports = {
  getUsers,
  getUserById,
  getUserByEmailWithPasswordAndPassToNext,
  postUser,
  updateUser,
  deleteUser,
};
