import { body, validationResult } from "express-validator";

/* ─────────────────────────────────────────────
   Shared: handle express-validator errors
───────────────────────────────────────────── */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }
  next();
};

/* ─────────────────────────────────────────────
   Auth Validators
───────────────────────────────────────────── */
export const validateRegister = [
  body("username")
    .trim()
    .notEmpty().withMessage("Username is required")
    .isLength({ min: 3, max: 20 }).withMessage("Username must be 3–20 characters")
    .matches(/^[a-zA-Z0-9_]+$/).withMessage("Username can only contain letters, numbers, and underscores"),

  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
    .matches(/\d/).withMessage("Password must contain at least one number"),
];

export const validateLogin = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required"),
];

/* ─────────────────────────────────────────────
   User Profile Validators
───────────────────────────────────────────── */
export const validateProfileUpdate = [
  body("username")
    .optional()
    .trim()
    .isLength({ min: 3, max: 20 }).withMessage("Username must be 3–20 characters")
    .matches(/^[a-zA-Z0-9_]+$/).withMessage("Username can only contain letters, numbers, and underscores"),

  body("bio")
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage("Bio must be 200 characters or less"),

  // 👇 avatar must be a valid URL; this fits your Cloudinary URLs
  body("avatar")
    .optional()
    .trim()
    .isURL().withMessage("Avatar must be a valid URL")
    .isLength({ max: 500 }).withMessage("Avatar URL is too long"),
];

export const validatePasswordChange = [
  body("currentPassword")
    .notEmpty().withMessage("Current password is required"),

  body("newPassword")
    .notEmpty().withMessage("New password is required")
    .isLength({ min: 6 }).withMessage("New password must be at least 6 characters")
    .matches(/\d/).withMessage("New password must contain at least one number")
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error("New password must be different from current password");
      }
      return true;
    }),
];

/* ─────────────────────────────────────────────
   Favorites Validators
───────────────────────────────────────────── */
export const validateAddFavorite = [
  body("animeId")
    .notEmpty().withMessage("Anime ID is required")
    .isNumeric().withMessage("Anime ID must be a number"),

  body("title")
    .trim()
    .notEmpty().withMessage("Anime title is required")
    .isLength({ max: 300 }).withMessage("Title is too long"),

  body("imageUrl")
    .optional()
    .trim()
    .isURL().withMessage("Image URL must be valid"),

  body("score")
    .optional()
    .isFloat({ min: 0, max: 10 }).withMessage("Score must be between 0 and 10"),

  body("episodes")
    .optional()
    .isInt({ min: 0 }).withMessage("Episodes must be a non-negative integer"),
];