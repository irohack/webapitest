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
    res.render('index', { content: results });//viewsファイルのindex.ejsを実行
  });

  connection.end();
});


//localhost:3000/add
router.get('/add', function (req, res, next) {
  const data = {
    errorMessage: ''
  }
  res.render('./add', data);//viewsファイルのadd.ejsを実行
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

    res.render('./add', {//viewsファイルのadd.ejsを実行
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
      res.redirect('./');//localhost:3000へ移動
      console.log('ID:', results.insertId);
    });

    connection.end();

  }

})

//localhost:3000/delete
router.post('/delete', (req, res, next) => {

  const id = req.body.id;

  const connection = mysql.createConnection(mysql_setting);
  connection.connect();

  connection.query('DELETE FROM goods WHERE id=?', id, function (error, results, fields) {
    if (error) throw error;
    res.redirect('./'); //localhost:3000へ移動
  });

  connection.end();

})

//localhost:3000/edit
router.get('/edit', function (req, res, next) {

  const id = req.query.id;//URLの後ろの'id=?'の部分を取得

  const connection = mysql.createConnection(mysql_setting);
  connection.connect();

  connection.query('SELECT * FROM goods WHERE id=?', id, function (error, results, fields) {
    if (error) throw error;

    if (!results.length) {//idをselectして，空の場合
      res.redirect('../');
    } else {
      const data = {
        id: id,
        name: results[0].name,
        price: results[0].price,
        errorMessage: ''
      };
      res.render('edit', data);//viewsファイルのedit.ejsを実行
    }

  });

  connection.end();
});

//localhost:3000/editへのPOST
router.post('/edit', [
  check('name')
    .not().isEmpty().trim().escape().withMessage('名前を入力して下さい'),
  check('price')
    .not().isEmpty().trim().escape().withMessage('値段を入力してください'),
], (req, res, next) => {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {

    const errors_array = errors.array();

    res.render('edit', {
      id: req.body.id,
      name: '',
      price: '',
      errorMessage: errors_array
    })
  } else {

    const id = req.body.id;
    const name = req.body.name;
    const price = req.body.price;
    const post = { 'name': name, 'price': price };

    const connection = mysql.createConnection(mysql_setting);
    connection.connect();

    connection.query('UPDATE goods SET ? WHERE id = ?', [post, id], function (error, results, fields) {
      if (error) throw error;
      res.redirect('../')
    });

    connection.end();

  }
});

module.exports = router;