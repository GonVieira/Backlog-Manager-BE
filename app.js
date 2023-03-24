import express from "express";
import bodyParser from "body-parser";
import dbConnect from "./db/dbConnect.js";
import bcrypt from "bcrypt";
import User from "./db/userModel.js";
import jwt from "jsonwebtoken";
import auth from "./auth.js";
import { body, validationResult } from "express-validator";

const app = express();
app.use(bodyParser.json());
dbConnect();

app.get("/", (request, response, next) => {
  response.json({ message: "Hey! This is your server response!" });
  next();
});

// Curb Cores Error by adding a header here
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

app.get("/auth", auth, (req, res) => {
  res.json({ message: "You are authorized to access me." });
});

app.get("/user/:email", auth, (req, res) => {
  const email = req.params.email;

  User.findOne({ email: email })
    .then((result) => {
      res.status(200).send({
        message: "User has been found!",
        data: result,
      });
    })
    .catch((err) => {
      res.status(404).send({ message: "User not found!", err });
    });
});

app.post(
  "/login",
  body("email").isEmail(),
  body("password").isLength({ min: 5 }),
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty() && errors.errors[0].param === "email") {
      return res.status(400).send("Invalid email address. Please try again!");
    }
    if (!errors.isEmpty() && errors.errors[0].param === "password") {
      return res.status(400).send("Password must be longer than 5 characters!");
    }

    const { email, password } = req.body;

    User.findOne({ email: email })
      .then((user) => {
        bcrypt
          .compare(password, user.password)
          .then((passwordCheck) => {
            //IF PASSWORD DOES NOT MATCH
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
            res.status(400).send({ message: "Wrong email or password!", err });
          });
      })
      .catch((err) => {
        console.log(err);
        res.status(404).send({ message: "Wrong email or password!", err });
      });
  }
);

app.post(
  "/register",
  body("email").isEmail(),
  body("username").isLength({ min: 1 }),
  body("password").isLength({ min: 5 }),
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty() && errors.errors[0].param === "email") {
      return res.status(400).send("Invalid email address! Please try again.");
    }
    if (!errors.isEmpty() && errors.errors[0].param === "username") {
      return res.status(400).send("Username cannot be empty!");
    }
    if (!errors.isEmpty() && errors.errors[0].param === "password") {
      return res.status(400).send("Password must be longer than 5 characters!");
    }
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
  }
);

export default app;
