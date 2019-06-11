const express = require('express');
const app = express();
const path = require('path');
const pg = require('pg');
const bodyParser = require('body-parser');
const pgURL =
  'postgres://bxbozhpf:n-ATadBj4n3bFbkGRVEX4Xa521JzJ2yS@raja.db.elephantsql.com:5432/bxbozhpf';
const db = new pg.Client(pgURL);

if (process.env.NODE_ENV === 'production') {
  // statically serve everything in the build folder on the route '/build'
  app.use('/build', express.static(path.join(__dirname, '../build')));
  // serve index.html on the route '/'
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
  });
}

app.use(bodyParser.urlencoded({ extended: true }));
app.listen(3000); //listens on port 3000 -> http://localhost:3000/

// routes here

app.get('/api', (req, res) => {
  connectAndQuery('SELECT storywords FROM story')
    .then(value => {
      console.log('scs!!!', value.rows);
      return res.status(200).json(value.rows);
    })
    .catch(err => {
      console.log('error! ', err);
    });
});

function connectAndQuery(query) {
  return new Promise((resolve, reject) => {
    db.connect(function(err) {
      if (err) return reject(err);
      db.query(query, function(err, result) {
        if (err) return reject(err);
        db.end();
        return resolve(result);
      });
    });
  });
}
