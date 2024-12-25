import { Router } from "express";
import {
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

const router = Router();

router.route("/register").post(validateRegister, registerUser);
router.route("/verify-email/:verificationToken").get(verifyEmail);
router.route("/login").post(validateSingin, loginUser);

//protected route

router.route("/verfiy-email").post(verifyJWT, resendEmailVerification);
router.route("/logout").post(verifyJWT, logoutUser);

router.route("/current-user").get(verifyJWT, getCurrentUser);
router
  .route("/change-password")
  .post(
    verifyJWT,
    userChangeCurrentPasswordValidator(),
    validate,
    changeCurrentPassword
  );

router
  .route("/assign-role/:userId")
  .post(
    verifyJWT,
    verifyPermission([UserRolesEnum.ADMIN]),
    mongoIdPathVariableValidator("userId"),
    userAssignRoleValidator(),
    validate,
    assignRole
  );

export default router;
