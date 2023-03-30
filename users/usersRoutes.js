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
    { $push: { games: newGame } }
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

export default router;
