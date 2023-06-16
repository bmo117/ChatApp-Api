import { check } from "express-validator";
import { validateResult } from "../helper/validationHelper.js";

export const validateCreate = [
  check("userName").exists().not().isEmpty(),
  check("password").exists().not().isEmpty(),

  (req, res, next) => {
    validateResult(req, res, next);
  },
];
