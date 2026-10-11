const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token tidak ditemukan" });
  }

  const token = header.split(" ")[1];

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    const message =
      error.name === "TokenExpiredError"
        ? "Token sudah kedaluwarsa"
        : "Token tidak valid";
    return res.status(401).json({ message });
  }

  next();
};

const authorizeSelf = (req, res, next) => {
  if (String(req.user.id) !== String(req.params.id)) {
    return res
      .status(403)
      .json({ message: "Kamu tidak punya akses ke data ini" });
  }
  next();
};

module.exports = { authenticate, authorizeSelf };
