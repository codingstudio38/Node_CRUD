const express = require('express');
const routeapp = new express.Router;
const Middleware = require('./../middleware/Auth');
const UsersController = require('./../Controllers/UsersController');

routeapp.get('/', Middleware.Auth_LoggedIn, UsersController.RegisterView);
routeapp.post('/create', Middleware.Auth_LoggedIn, UsersController.CreateNew);


routeapp.get('/login', Middleware.Auth_LoggedIn, UsersController.LoginView);
routeapp.post('/login', Middleware.Auth_LoggedIn, UsersController.UserLogin);


routeapp.get('/user/home', Middleware.Auth, UsersController.UserHome);

routeapp.get('/user/edit', Middleware.Auth, UsersController.UserDetail);

routeapp.post('/user/update', Middleware.Auth, UsersController.UpdateUser);

routeapp.get('/user/delete', UsersController.DeleteUser);

routeapp.get('/user/upload-multiples', Middleware.Auth, UsersController.UploadMultiplesGet);

routeapp.post('/user/upload-multiples', Middleware.Auth, UsersController.UploadMultiples);

routeapp.get('/user/logout', Middleware.Auth, UsersController.UserLogout);

routeapp.get("/download/user/:filename", UsersController.DownloadFile);



routeapp.get('*', (req, res) => {
    res.status(404).json({ 'status': 404, 'message': 'route not found..!!' });
});

routeapp.put('*', (req, res) => {
    res.status(404).json({ 'status': 404, 'message': 'route not found..!!' });
});

routeapp.post('*', (req, res) => {
    res.status(404).json({ 'status': 404, 'message': 'route not found..!!' });
});

routeapp.delete('*', (req, res) => {
    res.status(404).json({ 'status': 404, 'message': 'route not found..!!' });
});

module.exports = routeapp;