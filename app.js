const express = require('express');
const hbs = require('hbs');
const path = require('path');
const bcrypt = require('bcrypt');
const connection = require('./db/mysqlconn');
const session = require('express-session');


const app = express();
const port = 3000;
const staticPath = path.join(__dirname, "/public");
const viewPath = path.join(__dirname, "/view");
const layoutPath = path.join(__dirname, "/view/layout");


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use(cookieParser());
app.use(session({
  secret: 'helodeepakji',
  resave: false,
  saveUninitialized: false,
}));

app.set('views', viewPath);
app.set('view engine', 'hbs');
app.use(express.static(staticPath));
hbs.registerPartials(layoutPath);



function requireAuth(req, res, next) {
  if (!req.session.email) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
}


// Route to render the HBS template
app.get('/', function (req, res) {

  connection.query('SELECT * FROM places WHERE `state` = "himachal"', (error, results, fields) => {
    if (error) {
      console.log(error);
      return;
    } else {
      console.log(results);
      const destinations = results;
      res.render('index', { destinations: destinations });
    }
  });

});


app.get('/about', (req, res) => {
  res.render('about')
})

app.get('/contact', (req, res) => {
  res.render('contact');
})

app.post('/contact', (req, res) => {

  connection.query('INSERT INTO `contacts` (`name`, `phone`, `email`, `message`) VALUES ("'+req.body.name+'", "'+req.body.phone+'", "'+req.body.email+'", "'+req.body.message+'")', (error, results, fields) => {
    if (error) {
      console.log(error);
      res.render('contact',{status:"failed"});
    } else {
      console.log(results);
      res.render('contact',{status:"success"});
    }
  });

})


app.get('/signup',(req,res)=>{
    res.render('signup');
});

app.post('/signup',(req,res)=>{
  const hashedpassword = bcrypt.hashSync(req.body.password,10);
  connection.query('INSERT into `login` (`name`,`email`,`password`) VALUES ("'+req.body.name+'","'+req.body.email+'","'+hashedpassword+'")',(error, results, fields) => {
    if (error) {
      console.log(error);
      res.render('signup',{status:"failed"});
    } else {
      console.log(results);
      res.redirect('/login');
    }
  });
});

app.get('/login',(req,res)=>{
  res.render('login');
});

// Route to handle login
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // Your database query to fetch user by email
  connection.query('SELECT * from `login` WHERE `email` = ?', [email], (error, results, fields) => {
    if (error) {
      console.error(error);
      res.render('signup', { status: 'failed' });
    } else {
      if (results.length > 0) {
        const user = results[0];
        const isPassword = bcrypt.compareSync(password, user.password);
        if (isPassword) {
          console.log(user);
          console.log(isPassword);
          req.session.email = user.email;
          res.json({ message: 'login successs' });
        } else {
          res.render('login', { status: 'Enter correct password' });
        }
      } else {
        res.render('signup', { status: 'please signup' });
      }
    }
  });
});


app.get('/order', requireAuth, (req, res) => {
  res.json({ message: 'Access granted to protected route' });
});


app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      throw err;
    }
    res.json({ message: 'Logout successful' });
  });
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})