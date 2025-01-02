import { Router } from "express";
import { verifyJWT, verifyPermission } from "../middleware/auth.middleware.js";
import {
  createTinyUrlValidator,
  mongoIdPathVariableValidator,
} from "../middleware/validation.middleware.js";
import {
  createTinyUrl,
  delelteTinyUrl,
  delteAllExiperdTinyUrl,
  redirectTinyUrl,
} from "../controllers/tinyUrl.controller.js";
import { UserRolesEnum } from "../constant.js";

const router = Router();

router.route("/").get(redirectTinyUrl);

router.route("/").post(verifyJWT, createTinyUrlValidator, createTinyUrl);

router
  .route("/delete-tinyurl/:id")
  .delete(verifyJWT, mongoIdPathVariableValidator("tinyUrlId"), delelteTinyUrl);

// admin route
router
  .route("/delete-all-expired-tinyurl")
  .post(
    verifyJWT,
    verifyPermission([UserRolesEnum.ADMIN]),
    delteAllExiperdTinyUrl
  );

export default router;
