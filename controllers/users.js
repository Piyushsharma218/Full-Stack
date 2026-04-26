const User = require("../models/user");

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
};

module.exports.signup = async(req, res,next) => {
    console.log("SIGNUP START");
    console.log("BODY:", req.body);
    try{
    let {username, email, password} = req.body;
    console.log("DATA:", username, email, password);
    const newUser = new User({email, username});
    console.log("NEW USER OBJECT:", newUser);
    const registeredUser = await User.register(newUser, password);
    console.log("REGISTERED USER:", registeredUser);
    console.log(registeredUser);
    console.log("REQ.USER:", req.user);
    console.log(" BEFORE LOGIN");
    console.log("REQ.USER BEFORE LOGIN:", req.user);
    req.login(registeredUser, (err) => {
        console.log(" INSIDE LOGIN");
        if(err){
            return next(err);
        }
        console.log("LOGIN SUCCESS");
        console.log("REQ.USER AFTER LOGIN:", req.user);
        req.flash("success", "Welcome to Wanderlust!");
        res.redirect("/listings");
    })
    } catch(e){
        console.log(" ERROR IN SIGNUP:", e);    
        req.flash("error", e.message);
        res.redirect("/users/signup");
    }
};

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {
        req.flash("success","Welcome to Wonderlust! You are logged in!");
        let redirectUrl = res.locals.redirectUrl || "/listings";
        res.redirect(redirectUrl);
    };

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if(err) {
            return next(err);
        }
        req.flash("success", "you are logged out!");
        res.redirect("/listings");
    });
};