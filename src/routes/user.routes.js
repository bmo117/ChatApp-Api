import { Router } from "express";
import {
  registerUser,
  getProfile,
  login,
  getMessages,
  getPeople,
  logout,
} from "../controllers/user.controllers.js";

import { validateCreate } from "../validations/loginValidations.js";

const router = Router();

router.get("/profile", getProfile);
router.get("/messages/:id", getMessages);
router.get("/people", getPeople);
router.post("/register", validateCreate, registerUser);
router.post("/login", validateCreate, login);
router.post("/logout", logout);

export default router;
