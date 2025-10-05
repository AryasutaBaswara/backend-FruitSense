const { decode } = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Authorization Failed: Token not found or format error.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = decode(token);

    if (!decoded || !decoded.sub) {
      return res.status(401).json({ error: "token invalid." });
    }

    req.userId = decoded.sub;

    next();
  } catch (error) {
    console.log("JWT Decode Error: ", error);
    return res.status(401).json({ error: "Token expired or invalid." });
  }
};
