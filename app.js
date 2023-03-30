import express from "express";
import bodyParser from "body-parser";
import dbConnect from "./db/dbConnect.js";
import usersRoutes from "./users/usersRoutes.js";
import authRoutes from "./authentication/authentication.js";

const app = express();
app.use(bodyParser.json());
dbConnect();

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

app.use("/", authRoutes);
app.use("/user", usersRoutes);

export default app;
