const jwt = require('jsonwebtoken');
const UsersModel = require('./../Models/UsersModel');
const mongodb = require('mongodb');
async function Auth(req, resp, next) {
    try {
        var cookie_data;
        if (req.cookies.login_user_details === undefined) {
            return resp.redirect(`/login?status=401&message=${encodeURIComponent('Please login')}.`);
        }
        cookie_data = JSON.parse(JSON.parse(req.cookies.login_user_details));
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
        let custom = JSON.stringify({ "error": error });
        return resp.redirect(`/login?status=401&message=${encodeURIComponent('Failed..!! ' + custom)}.`);
    }
}

function Auth_LoggedIn(req, resp, next) {
    if (CheckLoginUser(req, resp)) {
        return resp.redirect(`/user/home?status=200&message=${encodeURIComponent('Already Logged In.')}.`);
    }
    next();
}



function CheckLoginUser(req, resp) {
    if (req.cookies.login_user_details === undefined) {
        return false;
    } else {
        return true;
    }
}
function LoginUserData(req, resp) {
    let userdata = JSON.parse(JSON.parse(req.cookies.login_user_details));
    return userdata;
    //return await UsersModel.findById({ _id: new mongodb.ObjectId(userdata._id) })
}

module.exports = { Auth, Auth_LoggedIn, CheckLoginUser, LoginUserData };