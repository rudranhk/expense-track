const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const expenseRoutes = require('./routes/expenses');
const Expense = require('./models/Expense');
const path = require('path');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', expenseRoutes);
app.use(express.static(path.join(__dirname, 'graphic')));

app.engine('hbs', exphbs.engine({ extname: '.hbs',
     defaultLayout: 'main', 
    layoutsDir : __dirname + '/views/layouts/' }));
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

mongoose.connect('mongodb://localhost:27017/expensetracker');


app.listen(3000, () => console.log('Server running on http://localhost:3000'));
