import express from "express";
import path from "path";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

import cookieParser from "cookie-parser";
import JWT from "jsonwebtoken";

mongoose
  .connect("mongodb://127.0.0.1:27017", {
    dbName: "backend",
  })
  .then((e) => console.log("Database Is Connected"))
  .catch((e) => console.log(e));

const useSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String },
  password: { type: String },
});

const Users = mongoose.model("users", useSchema);

const app = express();
const PORT = 5000;

// Using Middleware
app.use(cookieParser());
app.use(express.static(path.join(path.resolve(), "public")));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// Authentication
const isAuthenticated = async (req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    const decoded = JWT.verify(token, "sdjasdbajsdbjasd");
    req.user = await Users.findById(decoded._id);
    next();
  } else {
    res.redirect("/login");
  }
};

app.get("/", isAuthenticated, (req, res) => {
  res.render("logout", { name: req.user.name });
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  let user = await Users.findOne({ email });
  if (!user) return res.redirect("/register");
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    return res.render("login", { email, message: "Incorrect Password" });
  const token = JWT.sign({ _id: user._id }, "sdjasdbajsdbjasd");
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 1000),
  });
  res.redirect("/");
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  let user = await Users.findOne({ email });
  if (user) {
    return res.redirect("/login");
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  user = await Users.create({
    name,
    email,
    password: hashedPassword,
  });
  const token = JWT.sign({ _id: user._id }, "sdjasdbajsdbjasd");
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 1000),
  });
  res.redirect("/");
});

app.get("/logout", (req, res) => {
  res.cookie("token", null, {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.redirect("/");
});

app.listen(PORT, () => {
  console.log(`Server Is Working on : ${PORT}`);
});

/**--------------Previous Code------------- */

// res.render("index", { name: "Md Jamil Akhtar" });
/*const pathLocation = path.resolve();
  res.sendFile(path.join(pathLocation, "./index.html"));*/

// app.get("/", (req, res) => {
//   res.render("index", { name: "Md Jamil Akhtar" });
// });

// app.get("/add", async (req, res) => {
//   await Message.create({
//     name: "Md Jamil Akhtar",
//     email: "jk9448404@gmail.com",
//   });
//   res.send("Nice");
// });
/*app.get("/success", (req, res) => {
  res.render("success");
});

// Create New Data in Database
app.post("/contact", async (req, res) => {
  const { name, email } = req.body;
  await Message.create(name, email);
  res.redirect("/success");

  // users.push({ username: req.body, email: req.body.email });
  //   res.redirect("/success"); It will Redirect Next Pages That we Have Give
});

app.get("/users", (req, res) => {
  res.json({
    users,
  });
});*/
