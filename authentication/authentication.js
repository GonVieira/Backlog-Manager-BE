import express from "express";
import User from "../db/userModel.js";
import { body, validationResult } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

// Get user data if token available, used to keep user logged in case the page is reloaded.
router.post("/tokenLogin", (req, res) => {
  const token = req.body.token;
  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.sendStatus(401);
  }

  User.findOne({ email: decoded.userEmail })
    .then((user) => {
      //RETURN SUCCESS
      res.status(200).send({
        message: "Login successfull!",
        data: {
          user: {
            _id: user._id,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
            backgroundImage: user.backgroundImage,
            bio: user.bio,
          },
        },
      });
    })
    .catch((error) => {
      res.status(404).send({ message: "User not found!", error });
    });
});

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
              return res.status(401).send({
                message: "Passwords does not match!",
              });
            }

            //CREATE JWT TOKEN
            const token = jwt.sign(
              {
                userId: user._id,
                userEmail: user.email,
              },
              process.env.JWT_SECRET,
              { expiresIn: "24h" }
            );

            //RETURN SUCCESS
            res.status(200).send({
              message: "Login successfull!",
              data: {
                user: {
                  _id: user._id,
                  username: user.username,
                  email: user.email,
                  profilePicture: user.profilePicture,
                  backgroundImage: user.backgroundImage,
                  bio: user.bio,
                },
                token,
              },
            });
          })
          .catch((err) => {
            console.log(err);
            res.status(401).send({ message: "Wrong email or password!", err });
          });
      })
      .catch((err) => {
        console.log(err);
        res.status(401).send({ message: "Wrong email or password!", err });
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
      return res.status(401).send("Invalid email address! Please try again.");
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
          bio: "Hello world!",
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
