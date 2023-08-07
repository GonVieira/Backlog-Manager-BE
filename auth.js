import jwt from "jsonwebtoken";

const auth = async (req, res, next) => {
  try {
    //get token
    const token = await req.headers.authorization.split(" ")[1];
    //check if the token matches the supposed origin
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    const user = decodedToken;

    req.user = user;

    next();
  } catch (err) {
    res.status(401).json({
      error: new Error("Invalid request!"),
    });
  }
};

export default auth;
