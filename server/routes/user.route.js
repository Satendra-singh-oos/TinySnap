import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  resendEmailVerification,
  verifyEmail,
} from "../controllers/user.controller.js";
import {
  validateRegister,
  validateSingin,
} from "../middleware/validation.middleware.js";

const router = Router();

router.route("/register").post(validateRegister, registerUser);
router.route("/verify-email/:verificationToken").get(verifyEmail);
router.route("/login").post(validateSingin, loginUser);
router.route("/logout").post(logoutUser);

//protected route

export default router;
