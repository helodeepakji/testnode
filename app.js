const express = require('express');
const hbs = require('hbs');
const path = require('path');
const connection = require('./db/mysqlconn');

const app = express();
const port = 3000;
const staticPath = path.join(__dirname, "/public");
const viewPath = path.join(__dirname, "/view");
const layoutPath = path.join(__dirname, "/view/layout");


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('views', viewPath);
app.set('view engine', 'hbs');
app.use(express.static(staticPath));
hbs.registerPartials(layoutPath);


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
  connection.query('INSERT into `login` (`name`,`email`,`password`) VALUES ("'+req.body.name+'","'+req.body.email+'","'+req.body.password+'")',(error, results, fields) => {
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

app.post('/login',(req,res)=>{
  res.render('login');
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})