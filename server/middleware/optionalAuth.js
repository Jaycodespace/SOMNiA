import jwt from "jsonwebtoken";

const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // No token → treat as guest
    if (!authHeader?.startsWith("Bearer ")) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (err) {
      // Token exists but invalid → still treat as guest
      req.user = null;
      return next();
    }

  } catch (error) {
    console.error("optionalAuth error:", error);
    req.user = null;
    return next();
  }
};

export default optionalAuth;
