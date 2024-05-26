const UsersModel = require('./../Models/UsersModel');
const { CheckLoginUser, LoginUserData } = require('./../middleware/Auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const user_files = path.join(__dirname, './../public/users');
const multifiles_path = path.join(__dirname, './../public/multifiles');
const mongodb = require('mongodb');
const bcrypt = require("bcrypt");
function currentDateTime(t) {
    const now = new Date();
    let file_ = t.split(".");
    let ex = file_[file_.length - 1];
    return [`${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}_${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}-${now.getMilliseconds()}`, ex];
}





async function deleteIs(id) {
    let deleteis = await UsersModel.deleteOne({ _id: new mongodb.ObjectId(id) });
    return deleteis;
}
async function updateIs(id, data) {
    let updateis = await UsersModel.updateOne({ _id: new mongodb.ObjectId(id) }, { $set: data });
    return updateis;
}
async function findUser(id) {
    let data = await UsersModel.findById({ _id: new mongodb.ObjectId(id) });
    return data;
}




async function RegisterView(req, resp) {
    try {
        var { status, message, show, message_, status_ } = req.query;
        if (!status) {
            show = false;
            status_ = "";
        } else {
            show = true;
            status_ = status;
        }
        if (!message) {
            message_ = "";
        } else {
            message_ = message;
        }
        const data = { "show": show, "status": status_, "message": message_ };
        resp.render("index", data);
    } catch (error) {
        return resp.status(400).json({ "status": 400, "message": "Failed..!!", "error": error });
    }
}

async function LoginView(req, resp) {
    try {
        var { status, message, show, message_, status_ } = req.query;
        if (!status) {
            show = false;
            status_ = "";
        } else {
            show = true;
            status_ = status;
        }
        if (!message) {
            message_ = "";
        } else {
            message_ = message;
        }
        const data = { "show": show, "status": status_, "message": message_ };
        resp.render("login", data);
    } catch (error) {
        return resp.status(400).json({ "status": 400, "message": "Failed..!!", "error": error.message });
    }
}


async function CreateNew(req, resp) {
    try {
        var { name, phone, email, password, confirm_password, custom } = req.body;
        if (!name) {
            return resp.redirect(`/?status=400&message=${encodeURIComponent('name required.')}`);
        }
        if (!phone) {
            return resp.redirect(`/?status=400&message=${encodeURIComponent('phone no required.')}`);
        }
        if (!email) {
            return resp.redirect(`/?status=400&message=${encodeURIComponent('email id required.')}`);
        }
        if (!password) {
            return resp.redirect(`/?status=400&message=${encodeURIComponent('password required.')}`);
        }
        if (!confirm_password) {
            return resp.redirect(`/?status=400&message=${encodeURIComponent('confirm password required.')}`);
        }

        if (password === confirm_password) {

        } else {
            return resp.redirect(`/?status=400&message=${encodeURIComponent('confirm password are not matching.')}`);
        }

        let salt = await bcrypt.genSalt(10);
        let password_ = await bcrypt.hash(confirm_password, salt);
        let NewUser = new UsersModel({
            name: name,
            phone: phone,
            email: email,
            password: password_,
        });
        NewUser.save(function (err, result) {
            if (err) {
                custom = JSON.stringify({ "error": err });
                return resp.redirect(`/?status=400&message=${encodeURIComponent('Failed to create..!! ' + custom)}. `);
            }
            else {
                let id = result._id;
                if (req.files) {
                    let fileIs = req.files.photo;
                    let file_name = `${currentDateTime(fileIs.name)[0]}.${currentDateTime(fileIs.name)[1]}`;
                    fileIs.mv(`${user_files}/${file_name}`, function (err) {
                        if (err) {
                            let deleteIS = deleteIs(id);
                            deleteIS.then((data) => {
                                custom = JSON.stringify({ "error": err });
                                return resp.redirect(`/?status=400&message=${encodeURIComponent('Failed to move file..!! ' + custom)}. `);
                            });
                        } else {
                            let updateIS = updateIs(id, { "photo": file_name, updated_at: Date.now() });
                            updateIS.then((data) => {
                                let useris = findUser(id);
                                useris.then((user) => {
                                    return resp.redirect(`/?status=200&message=${encodeURIComponent('Successfully created.')}`);
                                });
                            });
                        }
                    })
                } else {
                    return resp.redirect(`/?status=200&message=${encodeURIComponent('Successfully created.')}`);
                }
            }
        });

    } catch (error) {
        custom = JSON.stringify({ "error": error.message });
        return resp.redirect(`/?status=400&message=${encodeURIComponent('Failed..!! ' + custom)}. `);
    }
}

async function UserLogin(req, resp) {
    var { email_id, password, custom, cookie_data } = req.body;
    try {
        if (!email_id) {
            return resp.redirect(`/login?status=400&message=${encodeURIComponent('Email id required..!!')}.`);
        }
        const user = await UsersModel.findOne({ email: email_id });
        if (user == null) {
            return resp.redirect(`/login?status=400&message=${encodeURIComponent('User does not exist')}.`);
        } else {
            const validPassword = await bcrypt.compare(password, user.password);
            if (validPassword) {
                const token = await user.generateAuthToken();
                const U = { 'email': user.email, 'name': user.name, 'phone': user.phone, 'photo': user.photo, '_id': user._id, 'token': token };
                // console.log(req.sessionID);
                // resp.cookie("login_user_details", JSON.stringify(JSON.stringify(U)));
                req.session.loggedin_user = U;
                // console.log(req.session.loggedin_user);
                if (req.session.loggedin_user === undefined) {//req.cookies.login_user_details 
                    cookie_data = false;
                } else {
                    cookie_data = true;
                }
                if (cookie_data) {
                    // console.log(req.session.loggedin_user);
                    // console.log(JSON.parse(JSON.parse(req.cookies.login_user_details)));//req.cookies.login_user_details
                }
                return resp.redirect(`/user/home?status=200&message=${encodeURIComponent('Successfully logged in')}.`);
            } else {
                return resp.redirect(`/login?status=400&message=${encodeURIComponent('Login failed..!!')}.`);
            }
        }
    } catch (error) {
        custom = error.message;
        return resp.redirect(`/login?status=400&message=${encodeURIComponent('Failed..!! ' + custom)}.`);
    }

}


async function UserLogout(req, resp) {
    try {
        let userdata = LoginUserData(req, resp);
        // req.user.tokens = req.user.tokens.filter((items, index) => {
        //     return items.token !== req.token;
        // })
        req.user.tokens = [];
        let respons = await req.user.save();
        // resp.clearCookie("login_user_details");
        delete req.session.loggedin_user;
        // req.session = null;
        // const sessionID = req.session.id;
        // req.sessionStore.destroy(sessionID, (err) => {
        //     // callback function. If an error occurs, it will be accessible here.
        //     if (err) {
        //         return console.error(err)
        //     }
        //     console.log("The session has been destroyed!")
        // })
        // req.session.distroy();
        return resp.redirect(`/login?status=200&message=${encodeURIComponent('Successfully logged out.')}`);
    } catch (error) {
        let custom = JSON.stringify({ "error": error.message });
        return resp.redirect(`/user/home?status=400&message=${encodeURIComponent('Failed..!! ' + custom)}.`);
    }
}

async function UserHome(req, resp) {
    try {
        var { status, message, show, message_, status_ } = req.query;
        if (!status) {
            show = false;
            status_ = "";
        } else {
            show = true;
            status_ = status;
        }
        if (!message) {
            message_ = "";
        } else {
            message_ = message;
        }
        let users = await UsersModel.find();
        const data = { "show": show, "status": status_, "message": message_, loggedin: CheckLoginUser(req, resp), userdata: req.user, "users": users };
        resp.render("user/home", data);
    } catch (error) {
        return resp.status(400).json({ "status": 400, "message": "Failed..!!", "error": error });
    }
}

async function UserDetail(req, resp) {
    try {
        var { id, status, message, show, message_, status_, custom } = req.query;
        if (!id) {
            return resp.redirect(`/user/home?status=400&message=${encodeURIComponent('id required.')}`);
        }
        if (!status) {
            show = false;
            status_ = "";
        } else {
            show = true;
            status_ = status;
        }
        if (!message) {
            message_ = "";
        } else {
            message_ = message;
        }
        let edit = await UsersModel.findById({ _id: new mongodb.ObjectId(id) });
        if (edit == null) {
            return resp.redirect(`/user/home?status=400&message=${encodeURIComponent('User record not found..!!')}`);
        } else {
            const data = { "show": show, "status": status_, "message": message_, loggedin: CheckLoginUser(req, resp), userdata: req.user, "edit": edit };
            resp.render("user/edit", data);
        }
    } catch (error) {
        custom = JSON.stringify({ "error": error });
        return resp.redirect(`/user/home?status=400&message=${encodeURIComponent('Failed..!! ' + custom)}.`);
    }
}

function removeoldFiles(path) {
    if (fs.existsSync(`${path}`)) {
        fs.unlinkSync(`${path}`, (err) => {
            if (err) {
                return "New file successfully uploaded. Failed to remove old file..!!";
            }
        });
        return "New file successfully uploaded. Old file successfully removed.";
    } else {
        return 'New file successfully uploaded. Old file directory not found.';
    }
}



async function UpdateUser(req, resp) {
    try {
        var oldfile_sms, updated_data;
        var { name, phone, email, password, oldphoto, id, custom } = req.body;
        if (!id) {
            return resp.redirect(`/user/home?status=400&message=${encodeURIComponent('id required.')}`);
        }
        if (!name) {
            return resp.redirect(`/user/edit?id=${id}&status=400&message=${encodeURIComponent('name required.')}`);
        }
        if (!phone) {
            return resp.redirect(`/user/edit?id=${id}&status=400&message=${encodeURIComponent('phone no required.')}`);
        }
        if (!email) {
            return resp.redirect(`/user/edit?id=${id}&status=400&message=${encodeURIComponent('email id required.')}`);
        }
        if (!oldphoto) {
            return resp.redirect(`/user/edit?id=${id}&status=400&message=${encodeURIComponent('old photo name required.')}`);
        }
        let loginuser = LoginUserData(req, resp);
        let salt = await bcrypt.genSalt(10);
        let pass = await bcrypt.hash(password, salt);
        if (req.files) {
            let fileIs = req.files.photo;
            let file_name = `${currentDateTime(fileIs.name)[0]}.${currentDateTime(fileIs.name)[1]}`;
            fileIs.mv(`${user_files}/${file_name}`, function (err) {
                if (err) {
                    custom = JSON.stringify({ "error": err });
                    return resp.redirect(`/user/home?status=400&message=${encodeURIComponent('Failed to move file..!! ' + custom)}.`);
                } else {
                    oldfile_sms = removeoldFiles(`${user_files}/${oldphoto}`);
                    if (!password) {
                        updated_data = { "name": name, "phone": phone, "email": email, "photo": file_name, "updated_at": Date.now() };
                    } else {
                        updated_data = { "name": name, "phone": phone, "email": email, "password": pass, "photo": file_name, "updated_at": Date.now() };
                    }
                    let updateIS = updateIs(id, updated_data);
                    updateIS.then((data) => {
                        let useris = findUser(id);
                        useris.then((user) => {
                            if (loginuser._id == id) {
                                return resp.redirect(`/user/logout`);
                            } else {
                                return resp.redirect(`/user/home?status=200&message=${encodeURIComponent('Successfully updated.')}.`);
                            }
                        });
                    });
                }
            })
        } else {
            if (!password) {
                updated_data = { "name": name, "phone": phone, "email": email, "updated_at": Date.now() };
            } else {
                updated_data = { "name": name, "phone": phone, "email": email, "password": pass, updated_at: Date.now() };
            }
            let updateIS = updateIs(id, updated_data);
            updateIS.then((data) => {
                let useris = findUser(id);
                useris.then((user) => {
                    if (loginuser._id == id) {
                        return resp.redirect(`/user/logout`);
                    } else {
                        return resp.redirect(`/user/home?status=200&message=${encodeURIComponent('Successfully updated.')}.`);
                    }
                });
            });
        }
    } catch (error) {
        custom = JSON.stringify({ "error": error });
        return resp.redirect(`/user/home?status=400&message=${encodeURIComponent('Failed..!! ' + custom)}.`);
    }
}




async function DeleteUser(req, resp) {
    try {
        let loginuser = LoginUserData(req, resp);
        var custom;
        if (req.query.id) {
            let data = await UsersModel.deleteOne({ _id: new mongodb.ObjectId(req.query.id) });
            if (loginuser._id == req.query.id) {
                return resp.redirect(`/user/logout`);
            } else {
                return resp.redirect(`/user/home?status=200&message=${encodeURIComponent('Record has been successfully deleted.')}`);
            }
        } else {
            return resp.redirect(`/user/home?status=400&message=${encodeURIComponent('Failed. User Id required.')}`);
        }
    } catch (error) {
        custom = JSON.stringify({ "error": error });
        return resp.redirect(`/user/home?status=400&message=${encodeURIComponent('Failed..!! ' + custom)}.`);
    }

}


async function DownloadFile(req, resp) {
    const filePath = user_files + "/" + req.params.filename;
    if (fs.existsSync(`${filePath}`)) {
        resp.download(filePath, req.params.filename,
            (err) => {
                if (err) {
                    resp.status(200).json({
                        error: err,
                        msg: "Problem downloading the file"
                    })
                }
            });
    } else {
        resp.status(404).json({ status: 404, msg: "Downloads directory not found" })
    }

}



// const storage = multer.diskStorage({
//     destination: function (req, file, callback) {
//         callback(null, "multifiles");//multifiles_path
//     },
//     filename: function (req, file, callback) {
//         callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
//     }
// });

// const upload = multer({ storage: storage });
// var multipleUpload = upload.fields([{ name: "multifile" }])
async function UploadMultiples(req, resp) {
    var total_file, total_files;
    if (!req.files) return resp.redirect(`/user/upload-multiples?status=400&message=${encodeURIComponent('Please select a file.')}`);

    total_file = req.files.multifile;
    total_files = [];
    if (total_file.length <= 0) return resp.redirect(`/user/upload-multiples?status=400&message=${encodeURIComponent('Please select a file.')}`);

    let waitdata = new Promise((resolve, reject) => {
        total_file.forEach((value, key) => {
            let fileIs = req.files.multifile[key];
            let file_name = `${currentDateTime(fileIs.name)[0]}.${currentDateTime(fileIs.name)[1]}`;
            //console.log("file_name", file_name, fileIs.name);
            fileIs.mv(`${multifiles_path}/${file_name}`, function (err) {
                if (err) {

                } else {
                    total_files.push(file_name);
                }
            })
        });
        setTimeout(() => {
            resolve(total_files);
            console.log("setTimeout", total_files);
        }, 500)
    });
    let t = await waitdata;
    console.log("await", t);
    return resp.send(t);
    // waitdata.then((data) => {
    //     console.log("yy ", data);
    //     return resp.send(t);
    // });
}

async function UploadMultiplesGet(req, resp) {
    try {
        var { status, message, show, message_, status_ } = req.query;
        if (!status) {
            show = false;
            status_ = "";
        } else {
            show = true;
            status_ = status;
        }
        if (!message) {
            message_ = "";
        } else {
            message_ = message;
        }
        const data = { "show": show, "status": status_, "message": message_, loggedin: CheckLoginUser(req, resp), userdata: req.user };
        resp.render("user/multi-upload", data);
    } catch (error) {
        let custom = JSON.stringify({ "error": error });
        return resp.redirect(`/user/home?status=400&message=${encodeURIComponent('Failed..!! ' + custom)}.`);
    }
}


module.exports = {
    UserHome,
    RegisterView,
    LoginView,
    CreateNew,
    UpdateUser,
    DeleteUser,
    UserDetail,
    UserLogin,
    UserLogout,
    DownloadFile,
    UploadMultiples,
    UploadMultiplesGet
};