import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  try {
    let token;

    // Extract from header or cookies
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized — token missing.",
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (!decoded?.id) {
        return res.status(401).json({
          success: false,
          message: "Invalid token structure.",
        });
      }

      req.user = decoded; // Attach full payload
      req.userId = decoded.id; // Shortcut for convenience
      req.role = decoded.role;
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Session expired. Please log in again.",
        });
      }
      console.warn(`[Auth Middleware] JWT verification failed: ${error.message}`);
      return res.status(401).json({
        success: false,
        message: "Invalid or corrupted token.",
      });
    }
  } catch (error) {
    console.error("[Auth Middleware] Unexpected error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during authentication.",
    });
  }
};

export default userAuth;
