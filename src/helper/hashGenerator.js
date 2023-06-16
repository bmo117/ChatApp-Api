import bcrypt from "bcrypt";
export const encryptPassword = (password) => {
  const salt = 10;
  const hash = bcrypt.hashSync(password, salt);
  return hash;
};

export const comparePassword = (password, password2) => {
  const passwordState = bcrypt.compare(password, password2);
  return passwordState;
};
