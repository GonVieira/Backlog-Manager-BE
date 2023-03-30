import mongoose from "mongoose";

const GameSchema = new mongoose.Schema({
  completed: Boolean,
  slug: String,
  name: String,
  backgroundImage: String,
  platforms: [String],
  playtime: Number,
  metacritic: Number,
});

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Please provide an email!"],
    unique: [true, "This email already exists"],
  },
  username: {
    type: String,
    required: [true, "Please provide a user name!"],
    unique: [true, "This user name already exists"],
  },
  password: {
    type: String,
    required: [true, "Please provide a password!"],
    unique: false,
  },
  profilePicture: {
    type: String,
    required: false,
    unique: false,
  },
  backgroundImage: {
    type: String,
    required: false,
    unique: false,
  },
  games: [GameSchema],
});

export default mongoose.model.Users ||
  mongoose.model("Users", UserSchema, "Users");
