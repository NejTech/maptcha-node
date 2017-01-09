const uuid = require('uuid/v1');
const exec = require('child_process').exec;

var twig = require('twig');
var express = require('express');
var sqlite = require('sqlite3');

var app = express();
var db = new sqlite.Database('maptcha-node.db');

app.use(express.static('assets'));

// --- start database setup ---
db.serialize( function () {
  db.run("CREATE TABLE if not exists pending_codes (uuid TEXT PRIMARY KEY NOT NULL, code TEXT NOT NULL)");
  db.run("DELETE FROM pending_codes");

  db.run("CREATE TABLE if not exists hits (page TEXT PRIMARY KEY NOT NULL, hits INTEGER NOT NULL)");
  db.run("INSERT OR IGNORE INTO hits VALUES ('index', 0)");
  db.run("INSERT OR IGNORE INTO hits VALUES ('captcha', 0)");
});
// --- end database setup ---

app.get('/', function (req, res) {
  res.render('index.twig', {
    
  });
});

app.get('/captcha/generate', function (req, res) {
  var id = uuid();
  
  exec('maptcha/maptcha.sh /usr/local/MATLAB/MATLAB_Runtime/v91', (err, stdout, stderr) => {
    if (err !== null) {
      console.error(err);
    }
    var out = stdout.split('\n');
    var sqlRequest = "INSERT INTO pending_codes (uuid, code) VALUES('" + id + "', '" + out[0] + "')";
    db.run(sqlRequest, function (err) {
      if (err !== null) {
        console.log(err);
      }
    });
    res.json({ "uid": id, "image": out[1] });
  });
});

app.get('/captcha/validate', function (req, res) {
  var user_id = req.query.id;
  var user_code = req.query.code;

  var correct_code = "";
  db.get("SELECT code FROM pending_codes WHERE uuid='" + user_id + "'", function (err, row) {
    if(err !== null) {
      console.log(err);
    }

    if (row === undefined) {
      correct_code = "";
    } else {
      correct_code = row.code;
    }

    if (correct_code == user_code) {
      res.status(202);
      res.send('Captcha correct!');
    } else {
      res.status(409);
      res.send('Wrong captcha!');
    }

    var sqlRequest = "DELETE FROM pending_codes WHERE uuid='" + user_id + "'";
    db.run(sqlRequest, function (err) {
      if (err !== null) {
        console.log(err);
      }
    });
  });
});

app.listen(80, function () {
  
});
