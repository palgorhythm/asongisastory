const express = require('express');
const app = express();
const path = require('path');
const pgp = require('pg-promise')();
const bodyParser = require('body-parser');
const pgURL =
  'postgres://bxbozhpf:n-ATadBj4n3bFbkGRVEX4Xa521JzJ2yS@raja.db.elephantsql.com:5432/bxbozhpf';
const db = pgp(pgURL);

// ONLY IF I WANT TO WIPE THE TABLE
db.none('DELETE FROM story');

if (process.env.NODE_ENV === 'production') {
  // statically serve everything in the build folder on the route '/build'
  app.use('/build', express.static(path.join(__dirname, '../build')));
  // serve index.html on the route '/'
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
  });
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.listen(3000); //listens on port 3000 -> http://localhost:3000/

// routes here

app.get('/api', (req, res) => {
  db.any('SELECT storywords FROM story')
    .then(value => {
      // console.log('server sending whole story!!!', value);
      return res.status(200).json(value);
    })
    .catch(err => {
      console.log('error! ', err);
    });
});

app.post('/api', (req, res) => {
  // console.log('request', req.body.word);
  db.none('INSERT INTO story(storywords) VALUES($1)', [req.body.word])
    .then(() => {
      return res.status(200).send('post success !');
    })
    .catch(err => {
      console.log('error! ', err);
    });
});
