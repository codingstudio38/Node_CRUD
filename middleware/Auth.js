const jwt = require('jsonwebtoken');
const UsersModel = require('./../Models/UsersModel');
const mongodb = require('mongodb');
async function Auth(req, resp, next) {
    try {
        noCache(req, resp, next);
        var cookie_data;
        if (req.session.loggedin_user === undefined) {//req.cookies.login_user_details
            return resp.redirect(`/login?status=401&message=${encodeURIComponent('Please login')}.`);
        }
        cookie_data = req.session.loggedin_user;//JSON.parse(JSON.parse(req.cookies.login_user_details))
        const _token = cookie_data.token;
        if (!_token) {
            return resp.redirect(`/login?status=401&message=${encodeURIComponent('Unauthorized')}.`);
        }
        const varifyUsers = jwt.verify(_token, process.env.SECRET_KEY);
        const user = await UsersModel.findOne({ _id: new mongodb.ObjectId(varifyUsers._id) });
        const _check = user.tokens.filter((items, index) => {
            return items.token == _token;
        });
        if (_check.length === 0) {
            return resp.redirect(`/login?status=401&message=${encodeURIComponent('Token has been expired. Please logged in again')}.`);
        }
        req.token = _token;
        req.user = user;
        next();
    } catch (error) {
        let custom = error.message;
        return resp.redirect(`/login?status=401&message=${encodeURIComponent('Failed..!! ' + custom)}.`);
    }
}

function Auth_LoggedIn(req, resp, next) {
    noCache(req, resp, next);
    if (CheckLoginUser(req, resp)) {
        return resp.redirect(`/user/home?status=200&message=${encodeURIComponent('Already Logged In.')}.`);
    }
    next();
}



function CheckLoginUser(req, resp) {
    if (req.session.loggedin_user === undefined) {//req.cookies.login_user_details
        return false;
    } else {
        return true;
    }
}
function LoginUserData(req, resp) {
    let userdata = req.cookies.login_user_details;//JSON.parse(JSON.parse(req.cookies.login_user_details));
    return userdata;
    //return await UsersModel.findById({ _id: new mongodb.ObjectId(userdata._id) })
}

function noCache(req, resp, next) {
    try {
        const protocol = req.protocol;
        const host = req.get('host');
        const origin = `${protocol}://${host}`;
        console.log(`Current path URL: ${origin} -- ${req.originalUrl}`);
        resp.setHeader('Surrogate-Control', 'no-store');
        resp.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        resp.setHeader('Pragma', 'no-cache');
        resp.setHeader('Expires', '0');
        return true;
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = { Auth, Auth_LoggedIn, CheckLoginUser, LoginUserData };