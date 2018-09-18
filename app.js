const express = require("express");
const mysql = require("mysql");
const app = express();
const ejs = require("ejs");
//for promises
const { promisify } = require("es6-promisify");

//view engine (ejs) setup to render html along with data
app.set("view engine", "ejs");

var db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  port: 3306,
  database: "nodemysql"
});

//async await error handler
const handleError = fn => (...params) =>
  fn(...params).catch(error => console.log(error));

//start db connection
db.connect(err => {
  err
    ? console.log(`Something wrong with db ${err}`)
    : console.log(`Database working fine`);
});

//===============================================================
//promisifying db object for all purposes important
//ex insert,update,delete

const query = promisify(db.query).bind(db);

//==============================================================

//routes
app.get(
  "/createDB",
  handleError(async (req, res) => {
    //Creating db only if it doesnt exist
    let sql = `CREATE DATABASE IF NOT EXISTS ??`;
    //database name
    let dbName = "nodemysql";
    await query(sql, dbName);
    //redirecting to home page
    res.redirect("/");
  })
);

//create table - Use this once to create table
app.get(
  "/createTable",
  handleError(async (req, res) => {
    let sql = `CREATE TABLE IF NOT EXISTS POSTS(ID int NOT NULL AUTO_INCREMENT PRIMARY KEY,title varchar(255),body varchar(255))`;
    await query(sql);
    //redirecting to home page
    res.redirect("/");
  })
);

//get all data
app.get(
  "/",
  handleError(async (req, res) => {
    //reference
    //var query = connection.query('SELECT ?? FROM ?? WHERE id = ?', [columns, 'users', userId], function (error, results, fields) {
    let sql = `SELECT * FROM POSTS`;
    const data = await query(sql);
    res.render("home", { data });
    //res.send(data);
  })
);

//get single data
app.get(
  "/post/:id",
  handleError(async (req, res) => {
    let sql = `SELECT * FROM POSTS WHERE ID = ${req.params.id} `;
    const data = await query(sql);
    //res.send(data[0]);
    res.render("view", { post: data[0] });
  })
);

//Insert data
//it is 'get' since we dont have an html page but supposed to be 'post'
app.get(
  "/post",
  handleError(async (req, res) => {
    let data = { title: "First post", body: "LOLOLOL" };
    //reference var sql = mysql.format('UPDATE posts SET modified = ? WHERE id = ?', [CURRENT_TIMESTAMP, 42]);

    let sql = `INSERT INTO POSTS SET?`;
    const result = await query(sql, data);
    data ? res.send(data) : res.send(`error ${result}`);
  })
);

//update data
//it is 'get' since we dont have an html page but supposed to be 'put'

app.get(
  "/post/:id/edit",
  handleError(async (req, res) => {
    let newData = { title: "new title", body: "updatde body" };
    let sql = `UPDATE POSTS set title = '${newData.title}', body = '${
      newData.body
    }' where id = ${req.params.id}`;
    await query(sql);
    res.send(newData);
  })
);

//delete data
//it is 'get' since we dont have an html page but supposed to be 'delete'

app.get(
  "/post/:id/delete",
  handleError(async (req, res) => {
    let sql = `DELETE from POSTS where id = ${req.params.id} `;
    await query(sql);
    res.redirect("/");
  })
);

app.listen(3000, () => {
  console.log("Server running up on port 3000");
});
// connection.end();
