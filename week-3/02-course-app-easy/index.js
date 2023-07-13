const express = require('express');
const app = express();

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
  res.json({ message: 'Logged in successfully' })
});

// logic to create a course
app.post('/admin/courses', adminVerification, (req, res) => {
  const course = req.body
  course.id = Date.now()
  COURSES.push(course)
  res.status(201).json({ message: 'Course created successfully', courseId: course.id })
});

// logic to edit a course
app.put('/admin/courses/:courseId', adminVerification, (req, res) => {
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
app.get('/admin/courses', adminVerification, (req, res) => {
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
  res.json({ message: 'Logged in successfully' })
});

// logic to list all courses
app.get('/users/courses', userVerification, (req, res) => {
  res.json(COURSES)
});

// logic to purchase a course
app.post('/users/courses/:courseId', userVerification, (req, res) => {
  const requiredId = parseInt(req.params.courseId)
  let course = COURSES.find(c => c.id === requiredId)

  let requiredUser = USERS.find(u => u.username === req.headers.username)

  if (course) {
    requiredUser.course.push(course)
    res.json({ message: 'Course purchased successfully' })
  }
  else {
    res.status(404).json({ message: 'Course not found' })
  }
});

// logic to view purchased courses
app.get('/users/purchasedCourses', userVerification, (req, res) => {
  const user = USERS.find(u => u.username === req.headers.username)
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
  res.status(403).json({ message: 'User authentication failed' })
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
