// Load the express module and store it in the variable express (Where do you think this comes from?)
var express = require("express");
console.log("Let's find out what express is", express);
// invoke express and store the result in the variable app
var app = express();
console.log("Let's find out what app is", app);
// use app's get method and pass it the base route '/' and a callback

//linking static folder
app.use(express.static(__dirname + "/static"));

//linking views folder and importing ejs (the view engine)
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

//importing and installing body-parser
var bodyParser = require('body-parser');
// use it!
app.use(bodyParser.urlencoded({ extended: true }));

//importing and installing express-session
var session = require('express-session');

app.use(session({
    secret: 'keyboardkitteh',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}))

//importing and installing flash
const flash = require('express-flash');
app.use(flash());


//importing and installing mongoose
var mongoose = require('mongoose');
// This is how we connect to the mongodb database using mongoose -- "basic_mongoose" is the name of
//   our db in mongodb -- this should match the name of the db you are going to use for your project.
mongoose.connect('mongodb://localhost/messageBoard');

//creating a user database
var CommentSchema = new mongoose.Schema({
    name:  { type: String, required: true, minlength: 2},
    comment: { type: String, required: true, minlength: 10 },
}, {timestamps: true });
var MessageSchema = new mongoose.Schema({
    name:  { type: String, required: true, minlength: 2},
    message: { type: String, required: true, minlength: 10 },
    comments: [CommentSchema]
}, {timestamps: true });
mongoose.model('Comment', CommentSchema); // We are setting this Schema in our Models as 'User'
mongoose.model('Message', MessageSchema); 
var Comment = mongoose.model('Comment'); // We are retrieving this Schema from our Models, named 'User'
var Message = mongoose.model('Message');

// Use native promises (only necessary with mongoose versions <= 4)
mongoose.Promise = global.Promise;



app.get('/', function (request, response) {
    Message.find({}, function(err, messages){
        if(err){
            console.log("error");
        }
        else {
            response.render('index', {messages: messages});
        }
    })
});
app.post('/addMessage', function (req, res){
    var message = new Message(req.body);
    message.save(function(err){
        if(err){
            // if there is an error upon saving, use console.log to see what is in the err object 
            console.log("We have an error!", err);
            // adjust the code below as needed to create a flash message with the tag and content you would like
            for(var key in err.errors){
                req.flash('registration', err.errors[key].message);
            }
            // redirect the user to an appropriate route
            res.redirect('/');
        }
        else {
            res.redirect('/');
        }
    });
});
app.post('/addComment', function(req, res) {
    Comment.create({name: req.body.name, comment: req.body.comment }, function(err, comment) {
        if(err){
            for(var key in err.errors){
                req.flash("commentform", err.errors[key].message);
            }
            res.redirect('/');
        }
        else {
            Message.findOneAndUpdate({_id: req.body.messId}, {$push: {comments: comment}}, function(err, data) {
                if(err){
                    console.log('errors', err);
                    res.redirect('/');
                }
                else{
                    res.redirect('/');
                }
            });
        }
    });
});

// tell the express app to listen on port 8000, always put this at the end of your server.js file
app.listen(8000, function () {
    console.log("listening on port 8000");
})