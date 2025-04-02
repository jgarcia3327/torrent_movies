require("dotenv").config();
const express = require("express");
const session = require("express-session");
const app = express();

app.use(session({
    secret:'Lidf8!0',
    resave: true,
    saveUninitialized: true
}));

app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

const yifyRouter = require("./routes/movies");
app.use("/", yifyRouter);

app.listen(process.env.APP_PORT);