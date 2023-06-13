require('dotenv').config();

const express = require('express');
const app = express();
app.use(express.json());
const port = process.env.APP_PORT ?? 5000;

const auth = require('./auth');
const movieHandlers = require('./movieHandlers');
const users = require('./users');

const welcome = (req, res) => {
  res.send('Welcome to my favourite movie list');
};

// const { validateMovie, validateUser } = require('./validators');
const { hashPassword, verifyPassword, verifyToken } = require('./auth.js');

//------------Public Routes----------------//

app.get('/', welcome);

app.get('/api/movies', movieHandlers.getMovies);
app.get('/api/movies/:id', movieHandlers.getMovieById);

app.get('/api/users', users.getUsers, auth.hidePassword);
app.get('/api/users/:id', users.getUserById, auth.hidePassword);

app.post(
  '/api/login',
  users.getUserByEmailWithPasswordAndPassToNext,
  verifyPassword
);

//------------Protected Routes----------------//

app.use(verifyToken); // authentication wall : verifyToken is activated for each route after this line

app.post('/api/movies', movieHandlers.postMovie);
app.put('/api/movies/:id', movieHandlers.updateMovie);
app.delete('/api/movies/:id', movieHandlers.deleteMovie);

app.post('/api/users', auth.hashPassword, users.postUser);
app.put('/api/users/:id', auth.hashPassword, users.updateUser);
app.delete('/api/users/:id', users.deleteUser);

app.post('/api/movies', verifyToken, movieHandlers.postMovie);

app.listen(port, (err) => {
  if (err) {
    console.error('Something bad happened');
  } else {
    console.log(`Server is listening on ${port}`);
  }
});
