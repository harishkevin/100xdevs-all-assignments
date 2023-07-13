require('dotenv').config();

const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');


app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];

// ---------------Admin routes---------------

// logic to sign up admin
app.post('/admin/signup', checkValidAdminName, (req, res) => {
  const admin = {
    username : req.body.username,
    password : req.body.password
  };
  ADMINS.push(admin);
  res.status(201).json({ message: 'Admin created successfully' })
});

// logic to log in admin
app.post('/admin/login', adminVerification, (req, res) => {
  let admin = ADMINS.find(a => a.username == req.headers.username) 
  const accessToken = jwt.sign(admin, process.env.ACCESS_TOKEN_SECRET, {expiresIn : '1h'})
  res.json({ message: 'Logged in successfully', accesstoken : accessToken })
});

// logic to create a course
app.post('/admin/courses', authenticateToken, (req, res) => {
  const course = req.body
  course.id = Date.now()
  COURSES.push(course)
  res.status(201).json({ message: 'Course created successfully', courseId: course.id })
});

// logic to edit a course
app.put('/admin/courses/:courseId', authenticateToken, (req, res) => {
  const requiredId = parseInt(req.params.courseId)
  let course = COURSES.find(c => c.id === requiredId)

  if (course) {
    Object.assign(course, req.body)
    res.json({ message: 'Course updated successfully' })
  }
  else {
    res.status(404).json({ message: 'Course not found' })
  }
});

// logic to get all courses
app.get('/admin/courses', authenticateToken, (req, res) => {
  res.json(COURSES)
});




// ---------------User routes---------------

// logic to sign up user
app.post('/users/signup', checkValidUserName, (req, res) => {
  const user = {
    username : req.body.username,
    password : req.body.password,
    course : []
  };
  USERS.push(user);
  res.status(201).json({ message: 'User created successfully' })
});

// logic to log in user
app.post('/users/login', userVerification, (req, res) => {
  let user = USERS.find(a => a.username == req.headers.username) 
  const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn : '1h'})
  res.json({ message: 'Logged in successfully', accesstoken : accessToken })
});

// logic to list all courses
app.get('/users/courses', authenticateToken, (req, res) => {
  res.json(COURSES)
});

// logic to purchase a course
app.post('/users/courses/:courseId', authenticateToken, (req, res) => {
  const requiredId = parseInt(req.params.courseId)
  let course = COURSES.find(c => c.id === requiredId)
  // console.log(req.user)

  let requiredUser = USERS.find(u => u.username === req.user.username)

  if (course) {
    requiredUser.course.push(course)
    res.json({ message: 'Course purchased successfully' })
  }
  else {
    res.status(404).json({ message: 'Course not found' })
  }
});

// logic to view purchased courses
app.get('/users/purchasedCourses', authenticateToken, (req, res) => {
  const user = USERS.find(u => u.username === req.user.username)
  res.json(user.course)
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});


// ---------------functions---------------

function checkValidAdminName(req, res, next) {
  let username = req.body.username;
  for (let i=0; i<ADMINS.length; i++){
    if (ADMINS[i].username === username) {
      res.status(400).json({ message : 'Admin already exist'})
      return
    }
  }
  next()
}

function adminVerification(req, res, next) {
  let username = req.headers.username
  let pwd = req.headers.password
  
  for (let i=0; i<ADMINS.length; i++) {
    if (ADMINS[i].username === username && ADMINS[i].password === pwd) {
      next()
      return
    }
  }
  res.status(403).json({ message: 'Admin authentication failed' })
}

function checkValidUserName(req, res, next) {
  let username = req.body.username;
  for (let i=0; i<USERS.length; i++){
    if (USERS[i].username === username) {
      res.status(400).json({ message : 'Admin already exist'})
      return
    }
  }
  next()
}

function userVerification(req, res, next) {
  let username = req.headers.username
  let pwd = req.headers.password
  
  for (let i=0; i<USERS.length; i++) {
    if (USERS[i].username === username && USERS[i].password === pwd) {
      next()
      return
    }
  }
  res.status(403).json({ message: 'User authentication failed' })
}

function authenticateToken(req, res, next) {
  let authHeader = req.headers.authorization
  let token = authHeader.split(' ')[1]
  if (token == null) {
    res.sendStatus(401)
    return
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      res.sendStatus(403)
      return
    }
    else {
      req.user = user
      next()
    }
  })
}