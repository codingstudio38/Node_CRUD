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

const { UserHome, RegisterView, LoginView, CreateNew, UpdateUser, DeleteUser, UserDetail, UserLogin, UserLogout, DownloadFile, UploadMultiples, UploadMultiplesGet } = require('./Controllers/UsersController');
const { Auth, Auth_LoggedIn } = require('./middleware/Auth');
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


app.get('/', Auth_LoggedIn, RegisterView);
app.post('/create', Auth_LoggedIn, CreateNew);


app.get('/login', Auth_LoggedIn, LoginView);
app.post('/login', Auth_LoggedIn, UserLogin);


app.get('/user/home', Auth, UserHome);

app.get('/user/edit', Auth, UserDetail);

app.post('/user/update', Auth, UpdateUser);

app.get('/user/delete', DeleteUser);

app.get('/user/upload-multiples', Auth, UploadMultiplesGet);

app.post('/user/upload-multiples', Auth, UploadMultiples);

app.get('/user/logout', Auth, UserLogout);

app.get("/download/user/:filename", DownloadFile);



app.get('*', (req, res) => {
    res.status(404).json({ 'status': 404, 'message': 'route not found..!!' });
});

app.put('*', (req, res) => {
    res.status(404).json({ 'status': 404, 'message': 'route not found..!!' });
});

app.post('*', (req, res) => {
    res.status(404).json({ 'status': 404, 'message': 'route not found..!!' });
});

app.delete('*', (req, res) => {
    res.status(404).json({ 'status': 404, 'message': 'route not found..!!' });
});

app.listen(port, () => {
    // console.log(`server is running at port no ${port}`);
});