require("dotenv").config();
const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const { check } = require("express-validator");

const app = express();

app.use(cors());
app.use(bodyParser.json());

const port = 4000;
app.listen(port, () => {
  console.log(`express server running on port 4000`);
});

const connection = mysql.createConnection({
  host: "localhost",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const QUERY_TABLE_POSITION_INDICES =
  "CREATE TABLE position_indices (id INT(7) NOT NULL AUTO_INCREMENT PRIMARY KEY, indices VARCHAR(16000) )";
const QUERY_TABLE_NOTES =
  "CREATE TABLE notes (note_id INT(10) NOT NULL AUTO_INCREMENT PRIMARY KEY, content TEXT, tags VARCHAR(250))";
const QUERY_TABLE_TAGS =
  "CREATE TABLE tags (id INT(10) NOT NULL AUTO_INCREMENT PRIMARY KEY, tag VARCHAR(40))";
const QUERY_TEST = "CREATE TABLE test (test VARCHAR(10))";

const QUERY_POSITION_INDICES_DATA = `INSERT INTO position_indices (indices) values('7,2,3,4,5,6,1')`;
const QUERY_NOTES_DATA = `INSERT INTO notes (note_id, content, tags) values ("1","1abc","bud,bank,junk"), ("2","along came a spider", "ascroll,balla,dumb" ),
("3", "down came the rain and washed the spider out", "junk"), ("4","silly","bud,bank,dumb"), ("5", "my chess timer", "ascroll"), ("6", "2015 MBP", "bank"),("7","this is for you", "bud,dumb,junk")`;
const QUERY_TAGS_DATA = `INSERT INTO tags (id, tag) values ("1", "bud"),("2","bank"),("3", "junk"),("4", "ascroll"), ("5","balla"), ("6","dumb")`;

connection.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
  connection.query("DROP DATABASE IF EXISTS mystuff_sql", function (
    err,
    result
  ) {
    if (err) throw err;
    console.log("Database dropped if exists");
  });
  connection.query("CREATE DATABASE mystuff_sql", function (err, result) {
    if (err) throw err;
    console.log("Database created");
  });
  connection.query("use mystuff_sql", function (err, result) {
    if (err) throw err;
    console.log("Database being used");
  });
  connection.query(QUERY_TABLE_POSITION_INDICES, function (err, result) {
    if (err) throw err;
    console.log("tables created QUERY_TABLE_POSITION_INDICES");
  });
  connection.query(QUERY_TABLE_NOTES, function (err, result) {
    if (err) throw err;
    console.log("tables created QUERY_TABLE_NOTES");
  });
  connection.query(QUERY_TABLE_TAGS, function (err, result) {
    if (err) throw err;
    console.log("tables created QUERY_TABLE_TAGS");
  });
  connection.query(QUERY_POSITION_INDICES_DATA, function (err, result) {
    if (err) throw err;
    console.log("tables created QUERY_POSITION_INDICES_DATA");
  });
  connection.query(QUERY_NOTES_DATA, function (err, result) {
    if (err) throw err;
    console.log("tables created QUERY_NOTES_DATA");
  });
  connection.query(QUERY_TAGS_DATA, function (err, result) {
    if (err) throw err;
    console.log("tables created QUERY_TAGS_DATA");
  });
});

///////    Notes routes
const SELECT_ALL_FROM_NOTES_QUERY = `SELECT * FROM notes`;
const SELECT_ALL_FROM_TAGS_QUERY = `SELECT * FROM tags`;
// get notes
app.get("/notes", (req, res) => {
  connection.query(SELECT_ALL_FROM_NOTES_QUERY, (err, results) => {
    if (err) {
      res.send(err);
    }
    res.send(results);
  });
});
// get notes by specific tag/s  tags come in as a single string with commas
// we split the string to array, map the array and create a DB query to run.
app.get("/notes/bytag", (req, res) => {
  const tag = req.query.tag.split(",");

  console.log("tag from get notes by tag", tag);

  function makeQuery(t) {
    let SELECT_NOTES_BY_TAG = `SELECT * FROM notes WHERE tags `;

    t.map((tagx, index) => {
      let firstTag = `LIKE "%${tagx}%"`;
      let notFirstTag = ` AND tags LIKE "%${tagx}%"`;

      if (index === 0) {
        SELECT_NOTES_BY_TAG = SELECT_NOTES_BY_TAG + firstTag;
        console.log(index, "----- 1");
      } else SELECT_NOTES_BY_TAG = SELECT_NOTES_BY_TAG + notFirstTag;
      console.log(index, "----2");
    });
    console.log(SELECT_NOTES_BY_TAG);

    connection.query(SELECT_NOTES_BY_TAG, (err, results) => {
      if (err) {
        res.send(err);
      }
      console.log(results, "results");
      res.send(results);
    });
  }
  makeQuery(tag);
});

// using express-validator to trim empty spaces off tags and note
// using prepared statement query to empower mysql to escape single quotes in user created tags/notes

app.post(
  "/note/add",
  [check("tags").trim(), check("content").rtrim()],
  (req, res) => {
    const { tags, content } = req.body;

    const INSERT_INTO_NOTES_QUERY =
      "INSERT INTO NOTES (tags, content) values(?,?)";
    connection.query(
      {
        sql: INSERT_INTO_NOTES_QUERY,
        values: [`${tags}`, `${content}`],
      },
      (err, results) => {
        if (err) {
          res.send(err);
        }

        const id = results.insertId;
        console.log(id, "id------------------------------------");
        fetch(`http://localhost:4000/add/position_index?id=${id}`);
        res.send(results);
      }
    );
  }
);
// update note
app.put("/note/update", (req, res) => {
  const { note_id, content, tags } = req.body;
  //different syntax for prepared sql statement, simpler than the above example. both work, one more tool in the belt.
  const UPDATE_NOTE_QUERY =
    "UPDATE notes SET content = ?, tags = ? WHERE note_id = ?";

  connection.query(
    UPDATE_NOTE_QUERY,
    [`${content}`, `${tags}`, note_id],

    (err, results) => {
      if (err) {
        res.send(err);
      }
      console.log("note updated");
      res.send(results);
    }
  );
});

//delete note/note
app.put("/note/delete", (req, res) => {
  const { indices, id } = req.body;

  const DELETE_NOTE_QUERY = `DELETE FROM notes WHERE note_id = ${id}`;
  connection.query(DELETE_NOTE_QUERY, (err, results) => {
    if (err) {
      res.send(err);
    }
    //calls API route to remove deleted note from position_index array that keeps track of the order of notes.
    // got a problem right here, at the header, if I don't
    fetch(`http://localhost:4000/update/position_indices`, {
      method: "PUT",
      headers: { "Content-Type": "text/javascript" },
      body: indices,
    });
    console.log("results of note deleted HELP-------", results);
    res.send(
      `this is the express server responding, no errors, note id ${id} has been deleted from db`
    );
  });
});

////// TagCloud routes
app.get("/tags/tagcloud", (req, res) => {
  connection.query(SELECT_ALL_FROM_TAGS_QUERY, (err, results) => {
    if (err) {
      res.send(err);
    }
    res.send(results);
  });
});

app.post("/tag/add/totagcloud", [check("tag").trim()], (req, res) => {
  const { tag } = req.body;

  const INSERT_INTO_TAGS_QUERY = "INSERT INTO TAGS (tag) values(?) ";
  connection.query(INSERT_INTO_TAGS_QUERY, [`${tag}`], (err, results) => {
    if (err) {
      res.send(err);
    }
    console.log(`tag ${tag} added in db? `);
    res.send(results);
  });
});
// delete tag from tagcloud
app.delete("/tag/delete/fromtagcloud", (req, res) => {
  console.log("we in the building ------------------------------");
  const id = req.query.id;
  const DELETE_NOTE_QUERY = `DELETE FROM tags WHERE id = ${id}`;
  connection.query(DELETE_NOTE_QUERY, (err, results) => {
    if (err) {
      res.send(err);
    }
    res.send(results);
  });
});

////// Position Index Routes   Position_indices is a db table, it contains the note indexes (string) in the order
// they are arranged on the screen by the user (we have drag and drop functionality "react-sortable-hoc").
//When user drags and drops aka changes visual order of notes, that new order of position indexes is saved in DB

app.get("/get/position_indices", (req, res) => {
  const GET_POSITION_INDICES = `SELECT * from position_indices where id = 1`;
  connection.query(GET_POSITION_INDICES, (err, results) => {
    if (err) {
      res.send(err);
    }
    res.send(results);
  });
});

// this route is run every time a new note/note is made, deleted, or user drags and drops a note.
app.put("/update/position_indices", (req, res) => {
  const indices = req.body;
  console.log("indices in app/put update/positon_indices", indices);
  const UPDATE_INDICES = `UPDATE position_indices SET indices = '${indices}' WHERE id = 1`;
  const DELETE = `DELETE FROM position_indices WHERE id = 1`;
  connection.query(indices ? UPDATE_INDICES : DELETE, (err, results) => {
    if (err) {
      res.send(err);
    }
    console.log("note order indices changed in DB");
    res.send(results);
  });
});
//
app.get("/add/position_index", (req, res) => {
  const id = req.query.id;
  console.log("add/position/index called, -----------------------id", id);
  const FIRST_INDEX = `INSERT INTO position_indices (indices) values ('${id}')`;
  const ADD_INDEX = `UPDATE position_indices SET indices = concat('${id},', indices)`;

  connection.query(id == 1 ? FIRST_INDEX : ADD_INDEX, (err, results) => {
    if (err) {
      res.send(err);
    }
    res.send(results);
  });
});
