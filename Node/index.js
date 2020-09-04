const express = require('express')
const app = express()

const http = require('http')
const socketIO = require('socket.io')
const io = socketIO(server)

var fs = require("fs");

io.on('connection', socket => {
console.log('New client connected')
  socket.on('new-message', (message) => { //event
    io.emit('message', {text: message}); // broadcast
    console.log(message);
});
socket.on('disconnect', () => {
  console.log('user disconnected') })
});

var server = app.listen(9000, function () {
  var host = server.address().address
  var port = server.address().port
  console.log("Pictura listening at http://%s:%s", host, port)
 })
 

const mysql = require('mysql');
let con = mysql.createConnection({
  host: "10.25.10.21",
  user: "g15",
  password: "QXkfcoxAFFZBmosS",
  database: "g15"
});

con.connect(function(err) {
    if (err) throw err;
    console.log('Connected!');
});

const bodyParser = require('body-parser')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.use(function(req, res, next) {
    res.header("content-type", "application/json");
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-RequestedWith, Content-Type, Accept");
    next();
    });

//authentification

const  passport  =  require('passport');
const  LocalStrategy  =  require('passport-local').Strategy;

app.post('/authenticate', (req, res) => {
  res.status(200).json({"statusCode" : 200 ,"message" : "hello"});
});
    
const auth = () => {
  return (req, res, next) => {
      passport.authenticate('local', (error, user, info) => {
          if(error) res.status(400).json({"statusCode" : 200 ,"message" : error});
          req.login(user, function(error) {
              if (error) return next(error);
              next();
          });
      })(req, res, next);
  }
}

passport.use(new LocalStrategy(
  function(username, password, done) {
      if(username === "admin" && password === "admin"){
          return done(null, username);
      } else {
          return done("unauthorized access", false);
      }
  }
));

passport.serializeUser(function(user, done) {
  if(user) done(null, user);
});

passport.deserializeUser(function(id, done) {
  done(null, id);
});

app.use(passport.initialize());
app.use(passport.session());

const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()){
      return next()
  }
  return res.status(400).json({"statusCode" : 400, "message" : "not authenticated"})
}

app.get('/getData', isLoggedIn, (req, res) => {
  res.json("data")
})

//CRUD operations

app.get('/', function (req, res) {
    res.send('Hello World! ')
    }) 
//test
app.get('/allUsers', function (req, res) {
    con.query('SELECT * FROM Users',
    (err,results) => {
      if(err) throw err;
      res.send(results);
    });
})
//dashboard
app.get('/allPosts', function (req, res) {
    con.query('SELECT * FROM Posts, Follow WHERE Follow.user_followed = Posts.poster_username AND user_following=? ORDER BY posted_on DESC', ['anais'],
    (err,results) => {
      if(err) throw err;
      res.send(results);
    });
})
//get user
app.get('/user/:username', function (req, res) {
    con.query('SELECT * FROM Users WHERE username=?', [req.params.username],
    function (err, results) {
       if (err) throw err;
       res.send(results);
    });
});
//get post
app.get('/post/:post_url', function (req, res) {
  con.query('SELECT * FROM Posts WHERE post_url=?', [req.params.post_url],
  function (err, results) {
     if (err) throw err;
     res.send(results);
  });
});
//search tag
app.get('/search/:tag', function (req, res) {
  con.query('SELECT * FROM Posts, Association_Posts_Tags WHERE Posts.post_url = Association_Posts_Tags.post_url AND tag=?', 
  [req.params.tag],
  function (err, results) {
     if (err) throw err;
     res.send(results);
  });
});
//search user per tag
app.get('/searchUser/:tag', function (req, res) {
  con.query('SELECT DISTINCT Users.username, Users.profile_picture FROM Posts, Association_Posts_Tags, Users WHERE Posts.post_url = Association_Posts_Tags.post_url AND Posts.poster_username = Users.username AND tag=? LIMIT 3', [req.params.tag],
  function (err, results) {
     if (err) throw err;
     res.send(results);
  });
});
//all posts of a  user
app.get('/:poster_username/allUserPosts', function (req, res) {
  con.query('SELECT * FROM Posts WHERE poster_username=?', [req.params.poster_username],
  function (err, results) {
     if (err) throw err;
     res.send(results);
  });
});
//sign in
app.post('/addUser', function (req, res) {   
  var datetime = new Date();
  var birthdate = new Date().toLocaleDateString();
  con.query("INSERT INTO Users SET username=?, name=?, email=?, password=?, date_account_creation=?, website=?, bio=?, profile_picture=?, phone=?, gender=?, birthdate=?", 
  [req.params.username, req.params.name, req.params.email, req.params.password, datetime, '', '', '', '', '', birthdate],
  function (err, result) {
      if (err) throw err;
      res.end(JSON.stringify(result));
  });
})
//log in
app.get('/login', function (req, res) {
  con.query('SELECT password FROM Users WHERE username=?', [req.params.username],
  function (err, results) {
     if (err) throw err;
     res.send(results);
  });
});
//update user info
app.post('/updateUser', function (req, res) {
    con.query('UPDATE Users SET name=?, website=?, bio=?, profile_picture=?, phone=?, gender=?, birthdate=?" WHERE username =?', 
    [req.params.name, req.params.website, req.params.bio, req.params.profile_picture, req.params.phone, req.params.gender, req.params.birthdate],
    function (error, results) {
       if (error) throw error;
       res.send(results);
    });
});