import express from "express";
import User from "../db/userModel.js";
import { body, validationResult } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post(
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
              userData: {
                _id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profilePicture,
                backgroundImage: user.backgroundImage,
                token,
              },
            });
          })
          .catch((err) => {
            console.log(err);
            res.status(400).send({ message: "Wrong email or password!", err });
          });
      })
      .catch((err) => {
        console.log(err);
        res.status(404).send({ message: "Wrong email or password!", err });
      });
  }
);

router.post(
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
          profilePicture:
            "https://cdn.discordapp.com/attachments/1070077755120701540/1089230539451531427/default-user-image.png",
          backgroundImage:
            "https://cdn.discordapp.com/attachments/1070077755120701540/1089230812433625118/bg_dots.png",
          games: [],
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
            if (error.code === 11000) {
              if (Object.keys(error.keyPattern)[0] === "email") {
                res.status(409).send({
                  message: "Email already in use.",
                });
              } else if (Object.keys(error.keyPattern)[0] === "username") {
                res.status(409).send({
                  message: "Username already in use.",
                });
              }
            } else {
              res.status(500).send({
                message: "Error creating user.",
                error,
              });
            }
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

export default router;
