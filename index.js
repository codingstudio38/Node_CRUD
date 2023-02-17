require('dotenv').config();
const port = process.env.PORT || 5000;
const path = require('path');
const public = path.join(__dirname, "public");
const views_path = path.join(__dirname, "./templates/views/");
//const partials_path = path.join(__dirname, "./templates/partials/");
const Fileupload = require('express-fileupload');
var cors = require('cors')
const express = require('express');
//const hbs = require('hbs');
const ejs = require('ejs');

const cookieParser = require('cookie-parser');
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(Fileupload());
app.use(cors());
app.use("/users-file", express.static('./public/users/'));
app.use(express.static(public));

app.set("view engine", "ejs");
app.set("views", views_path);
//hbs.registerPartials(partials_path);

app.use(require('./routes/Route'));


app.listen(port, () => {
    // console.log(`server is running at port no ${port}`);
});