import express from "express";
import bodyParser from "body-parser";
import dbConnect from "./db/dbConnect.js";
import bcrypt from "bcrypt";
import User from "./db/userModel.js";
import jwt from "jsonwebtoken";

const app = express();
app.use(bodyParser.json());
dbConnect();

app.get("/", (request, response, next) => {
  response.json({ message: "Hey! This is your server response!" });
  next();
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  console.log(email);
  console.log(password);

  User.findOne({ email: email })
    .then((user) => {
      bcrypt
        .compare(password, user.password)
        .then((passwordCheck) => {
          //IF PASSWOR DOES NOT MATCH
          if (!passwordCheck) {
            return res.status(400).send({
              message: "Passwords does not match!",
              error,
            });
          }

          //CREATE JWT TOKEN
          const token = jwt.sign(
            {
              userId: user._id,
              userEmail: user.email,
            },
            "AHOOOGA_TOKEN",
            { expiresIn: "24h" }
          );

          //RETURN SUCCESS
          res.status(200).send({
            message: "Login successfull!",
            email: user.email,
            token,
          });
        })
        .catch((err) => {
          res.status(400).send({ message: "Password does not match!", err });
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(404).send({ message: "Email not found", err });
    });
});

app.post("/register", (req, res) => {
  const { email, username, password } = req.body;
  const saltRounds = 10;

  bcrypt
    .hash(password, saltRounds)
    .then((hash) => {
      const user = new User({
        email: email,
        username: username,
        password: hash,
      });

      user
        .save()
        // return success if the new user is added to the database successfully
        .then((result) => {
          res
            .status(201)
            .send({ message: "User Created Successfully", result });
        })
        // catch error if the new user wasn't added successfully to the database
        .catch((error) => {
          console.log(error);
          res.status(500).send({
            message: "Error creating user.",
            error,
          });
        });
    })
    // catch error if the password hash isn't successful
    .catch((e) => {
      res.status(500).send({
        message: "Password was not hashed successfully",
        e,
      });
    });
});

export default app;
