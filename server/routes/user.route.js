import { Router } from "express";
import {
  assignRole,
  changeCurrentPassword,
  getCurrentUser,
  handleSocialLogin,
  loginUser,
  logoutUser,
  registerUser,
  resendEmailVerification,
  verifyEmail,
} from "../controllers/user.controller.js";
import {
  mongoIdPathVariableValidator,
  userAssignRoleValidator,
  userChangeCurrentPasswordValidator,
  validateRegister,
  validateSingin,
} from "../middleware/validation.middleware.js";
import { verifyJWT, verifyPermission } from "../middleware/auth.middleware.js";
import { UserRolesEnum } from "../constant.js";
import passport from "passport";

const router = Router();

router.route("/register").post(validateRegister, registerUser);
router.route("/verify-email/:verificationToken").get(verifyEmail);
router.route("/login").post(validateSingin, loginUser);

//protected route

router
  .route("/resend-email-verification")
  .post(verifyJWT, resendEmailVerification);
router.route("/logout").post(verifyJWT, logoutUser);

router.route("/current-user").get(verifyJWT, getCurrentUser);
router
  .route("/change-password")
  .post(verifyJWT, userChangeCurrentPasswordValidator, changeCurrentPassword);

router.route("/assign-role/:userId").post(
  verifyJWT,
  verifyPermission([UserRolesEnum.ADMIN]),
  mongoIdPathVariableValidator("userId"),

  userAssignRoleValidator,
  assignRole
);

// SSO routes
router.route("/google").get(
  passport.authenticate("google", {
    scope: ["profile", "email"],
  }),
  (req, res) => {
    res.send("redirecting to google...");
  }
);

router
  .route("/google/callback")
  .get(passport.authenticate("google"), handleSocialLogin);

export default router;
