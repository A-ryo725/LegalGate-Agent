const { auth } = require("../firebaseAdmin");

function getBearerToken(headerValue) {
  if (!headerValue || typeof headerValue !== "string") return null;

  const [scheme, token] = headerValue.split(" ");
  if (scheme !== "Bearer" || !token) return null;

  return token;
}

async function requireAuth(req, res, next) {
  const token = getBearerToken(req.headers.authorization);

  if (!token) {
    return res.status(401).json({
      error: "authentication required"
    });
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid
    };
    return next();
  } catch (err) {
    console.error("Firebase ID token verification failed", {
      message: err.message,
      code: err.code,
      stack: err.stack
    });

    return res.status(401).json({
      error: "invalid authentication token"
    });
  }
}

module.exports = {
  requireAuth
};
