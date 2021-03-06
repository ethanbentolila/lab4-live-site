/*
  Name: Ethan Bentolila
  ID: 100783477

  Name: Marshall Presutto
  ID: 100775601

  Date: 2022-04-15
*/


// Import 3rd party modules to support the express server
import createError  from 'http-errors';
import express, { NextFunction } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';

// module for connecting to MongoDB
import mongoose from 'mongoose';

// modules for authentication
import session from 'express-session'; // cookie-based authentication
import passport from 'passport'; // authentication middleware
import passportLocal from 'passport-local'; // authentication strategy (user/pass)
import flash from 'connect-flash'; // auth messaging and error management


// authentication objects
let localStrategy = passportLocal.Strategy; // alias

// Import a user model
import User from '../Models/User';

//App configuration

//Import routers
import  indexRouter  from '../Routes/index';
import  authRouter  from '../Routes/auth';
import  contactListRouter  from '../Routes/contact-list';
import  inquiriesListRouter  from '../Routes/inquiries-list';

//import  usersRouter from '../Routes/users';


const app = express();

//database configuration
import * as DBConfig from './db';
mongoose.connect(DBConfig.RemoteURI);


const db = mongoose.connection; //Alias for mongoose.connection
db.on("error", function()
{
console.error("Connection Error");
});

db.once("open", function()
{
  console.log(`Connected to MongoDB at ${DBConfig.HostName}`);
});

// view engine setup
app.set('views', path.join(__dirname, '../Views'));
app.set('view engine', 'ejs');

// add middleware functions
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../../Public')));
app.use(express.static(path.join(__dirname, '../../node_modules')));

// setup express session
app.use(session({
  secret: DBConfig.SessionSecret,
  saveUninitialized: false,
  resave: false
}));

//Initialize flash middleware
app.use(flash());

//Initialize passport
app.use(passport.initialize());
app.use(passport.session());

//implement an AUth Strategy 
passport.use(User.createStrategy());

//Serialize and Deserialize User Data
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use('/', indexRouter);
app.use('/', authRouter);
app.use('/', contactListRouter);
app.use('/', inquiriesListRouter);

//app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) 
{
  next(createError(404));
});

// error handler
app.use(function(err:createError.HttpError, req: express.Request, res:express.Response, next: NextFunction) 
{
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

export default app;
