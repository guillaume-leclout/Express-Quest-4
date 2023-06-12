require('dotenv').config();

const express = require('express');
const auth = require('./auth');

const app = express();

app.use(express.json());

const port = process.env.APP_PORT ?? 5000;

const welcome = (req, res) => {
  res.send('Welcome to my favourite movie list');
};

app.get('/', welcome);

const movieHandlers = require('./movieHandlers');
const users = require('./users');

app.get('/api/movies', movieHandlers.getMovies);
app.get('/api/movies/:id', movieHandlers.getMovieById);
app.get('/api/users', users.getUsers, auth.hidePassword);
app.get('/api/users/:id', users.getUserById, auth.hidePassword);

const { validateMovie, validateUser } = require('./validators');
const { hashPassword } = require('./auth.js');

app.post('/api/movies', validateMovie, movieHandlers.postMovie);
app.put('/api/movies/:id', validateMovie, movieHandlers.updateMovie);
app.delete('/api/movies/:id', movieHandlers.deleteMovie);

app.post('/api/users', auth.hashPassword, users.postUser);
app.put('/api/users/:id', auth.hashPassword, users.updateUser);
app.delete('/api/users/:id', users.deleteUser);

app.listen(port, (err) => {
  if (err) {
    console.error('Something bad happened');
  } else {
    console.log(`Server is listening on ${port}`);
  }
});
