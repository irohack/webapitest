const express = require('express');
const mysql = require('mysql');
const { check, validationResult } = require('express-validator/check');
const router = express.Router();

const mysql_setting = {
  host: 'localhost',
  user: 'root',
  password: 'asdf',
  database: 'coop'
}

//localhost:3000/
router.get('/', function (req, res, next) {
  const connection = mysql.createConnection(mysql_setting);
  connection.connect();

  let selectSql = 'select * from coop.goods';
  connection.query(selectSql, function (error, results, fields) {
    if (error) throw error;
    res.render('index', { content: results });
  });

  connection.end();
});


//localhost:3000/add
router.get('/add', function (req, res, next) {
  const data = {
    errorMessage: ''
  }
  res.render('./add', data);
});

//localhost:3000/addへのPOST
router.post('/add', [
  check('name')
    .not().isEmpty().trim().escape().withMessage('商品名を入力してください'),
  check('price')
    .not().isEmpty().trim().escape().withMessage('値段を入力してください'),
], (req, res, next) => {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {

    const errors_array = errors.array();

    res.render('./add', {
      errorMessage: errors_array,
    })
  } else {

    const name = req.body.name;
    const price = req.body.price;
    const post = { 'name': name, 'price': price };

    const connection = mysql.createConnection(mysql_setting);
    connection.connect();

    connection.query('INSERT INTO goods SET ?', post, function (error, results, fields) {
      if (error) throw error;
      res.redirect('./');
      console.log('ID:', results.insertId);
    });

    connection.end();

  }

})

module.exports = router;