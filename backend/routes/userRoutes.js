// server/routes/userRoutes.js
import express from "express";
import {
  getProfile, updateProfile, changePassword,
  deleteAccount, getAllUsers,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  validateProfileUpdate, validatePasswordChange, handleValidationErrors,
} from "../utils/validators.js";

const router = express.Router();

router.use(protect);

router.route("/profile")
  .get(getProfile)
  .put(validateProfileUpdate, handleValidationErrors, updateProfile)
  .delete(deleteAccount);

router.put("/change-password",
  validatePasswordChange, handleValidationErrors, changePassword
);

router.get("/", getAllUsers);

export default router;