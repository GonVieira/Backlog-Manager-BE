import mongoose from "mongoose";

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
});

export default mongoose.model.Users || mongoose.model("Users", UserSchema);
