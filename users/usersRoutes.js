import express from "express";
import User from "../db/userModel.js";
import auth from "../auth.js";

const router = express.Router();

router.get("/:id", auth, (req, res) => {
  const id = req.params.id;

  User.findOne({ _id: id })
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

router.patch("/add/:id", auth, (req, res) => {
  const newGame = req.body.game;
  const id = req.params.id;

  User.findOneAndUpdate(
    { _id: id, "games.slug": { $ne: newGame.slug } },
    { $push: { games: newGame } },
    { new: true }
  )
    .then((result) => {
      if (result == null) {
        res.status(409).send({ message: "Game already in this account!" });
        return;
      }
      res.status(200).send({ message: "Sucess.", result });
    })
    .catch((err) => {
      res.status(500).send({ message: "Error updating user.", err });
    });
});

router.patch("/delete/:id", auth, (req, res) => {
  const gameToDelete = req.body.slug;
  const id = req.params.id;

  User.findOneAndUpdate(
    { _id: id },
    { $pull: { games: { slug: gameToDelete } } },
    { new: true }
  )
    .then((result) => {
      res.status(200).send({ message: "Game deleted successfully!", result });
    })
    .catch((err) => {
      res.status(500).send({ message: "Error deleting Game.", err });
    });
});

router.patch("/completed/:id", auth, (req, res) => {
  const gameToChange = req.body.slug;
  const valueToChange = req.body.completed;
  const id = req.params.id;

  User.findOneAndUpdate(
    { _id: id, "games.slug": gameToChange },
    { $set: { "games.$.completed": valueToChange } },
    { new: true }
  )
    .then((result) => {
      res.status(200).send({ message: "Game updated successfully!", result });
    })
    .catch((err) => {
      res.status(500).send({ message: "Error updating Game.", err });
    });
});

router.patch("/profilePicture/:id", auth, (req, res) => {
  const id = req.params.id;
  const newPicture = req.body.picture;

  User.findOneAndUpdate(
    { _id: id },
    { $set: { profilePicture: newPicture } },
    { new: true }
  )
    .then((result) => {
      res
        .status(200)
        .send({ message: "Profile picture updated successfully!", result });
    })
    .catch((err) => {
      res.status(500).send({ message: "Error updating profile picture.", err });
    });
});

router.patch("/backgroundImage/:id", auth, (req, res) => {
  const id = req.params.id;
  const newBackgroundImage = req.body.backgroundImage;

  User.findOneAndUpdate(
    { _id: id },
    { $set: { backgroundImage: newBackgroundImage } },
    { new: true }
  )
    .then((result) => {
      res
        .status(200)
        .send({ message: "Background image updated successfully!", result });
    })
    .catch((err) => {
      res
        .status(500)
        .send({ message: "Error updating Background image.", err });
    });
});

router.patch("/username/:id", auth, (req, res) => {
  const id = req.params.id;
  const newUsername = req.body.username;

  User.findOneAndUpdate(
    { _id: id },
    { $set: { username: newUsername } },
    { new: true }
  )
    .then((result) => {
      res
        .status(200)
        .send({ message: "Username updated successfully!", result });
    })
    .catch((err) => {
      res.status(500).send({ message: "Error updating Username.", err });
    });
});

export default router;