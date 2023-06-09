import express from "express";
import User from "../db/userModel.js";
import auth from "../auth.js";
import mongoose from "mongoose";
const router = express.Router();

//get user
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

//get user games
router.get("/games/:id", auth, (req, res) => {
  const id = req.params.id;

  User.findOne({ _id: id })
    .then((result) => {
      res.status(200).send({
        message: "User games have been found!",
        data: result.games,
      });
    })
    .catch((err) => {
      res.status(404).send({ message: "User games not found", err });
    });
});
/**
//Get user games Version 2
router.get("/games/v2/:id", auth, (req, res) => {
  const idParams = req.params.id;
  const id = new mongoose.Types.ObjectId(idParams);
  const queries = req.query;
})
 */

//get user completed games
router.get("/games/completed/:id", auth, (req, res) => {
  const idParams = req.params.id;
  const id = new mongoose.Types.ObjectId(idParams);

  User.aggregate([
    { $match: { _id: id } },
    { $unwind: "$games" },
    { $match: { "games.completed": true } },
    {
      $group: {
        _id: "$_id",
        games: {
          $push: "$games",
        },
      },
    },
  ])
    .then((result) => {
      if (result === null) {
        res
          .status(404)
          .send({ message: "User does not have any completed games." });
      } else {
        res
          .status(200)
          .send({ message: "User completed games found!", data: result });
      }
    })
    .catch((err) => {
      res.status(500).send({ message: "Internal Server Error!", err });
    });
});

//get user backlogged games
router.get("/games/uncompleted/:id", auth, (req, res) => {
  const idParams = req.params.id;
  const id = new mongoose.Types.ObjectId(idParams);

  User.aggregate([
    { $match: { _id: id } },
    { $unwind: "$games" },
    { $match: { "games.completed": false } },
    {
      $group: {
        _id: "$_id",
        games: {
          $push: "$games",
        },
      },
    },
  ])
    .then((result) => {
      if (result === null) {
        res
          .status(404)
          .send({ message: "User does not have any uncompleted games." });
      } else {
        res
          .status(200)
          .send({ message: "User uncompleted games found!", data: result });
      }
    })
    .catch((err) => {
      res.status(500).send({ message: "Internal Server Error!", err });
    });
});

//check if game exists in user library
router.post("/game/:id", auth, (req, res) => {
  const gameSlug = req.body.gameSlug;
  const id = req.params.id;

  User.findOne({ _id: id, "games.slug": gameSlug })
    .then((result) => {
      if (result === null) {
        res.status(404).send({ message: "Game not found in user library!" });
      } else {
        res.status(200).send({ message: "User owns this game!" });
      }
      return;
    })
    .catch((err) => {
      res.status(500).send({ message: "Internal Server Error!", err });
    });
});

//add game to user game list
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

//delete game from user game list
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

//update the completed status of one game form the user list of games
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

//update user profile picture
router.patch("/update/:id", auth, (req, res) => {
  const id = req.params.id;
  const updatedUser = req.body.updatedUser;

  User.findOneAndUpdate(
    { _id: id },
    {
      $set: {
        profilePicture: updatedUser.profilePicture,
        backgroundImage: updatedUser.backgroundImage,
        username: updatedUser.userName,
        bio: updatedUser.bio,
      },
    },
    { new: true }
  )
    .then((result) => {
      res.status(200).send({ message: "User updated successfully!", result });
    })
    .catch((err) => {
      res.status(500).send({ message: "Error updating user", err });
    });
});
export default router;
