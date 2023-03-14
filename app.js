import express from "express";
import bodyParser from "body-parser";
import dbConnect from "./db/dbConnect.js";
import bcrypt from "bcrypt";
import User from "./db/userModel.js";

const app = express();
app.use(bodyParser.json());
dbConnect();

app.get("/", (request, response, next) => {
  response.json({ message: "Hey! This is your server response!" });
  next();
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
          console.log(error)
          res.status(500).send({
            message: "Error creating user",
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
