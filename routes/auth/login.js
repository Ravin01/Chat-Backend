import Express from "express";
import bcrypt from 'bcryptjs'
import jwt from "jsonwebtoken";
import { registrationModel } from "../../db/dbModels.js";



export const loginRoute = Express.Router();

loginRoute.post("/", async (req, res) => {
  const payload = req.body;
  try {
    const checkUser = await registrationModel.findOne(
      { userEmail: payload.userEmail },
      { _id: 0, password: 1, userName: 1, userEmail: 1 }
    );
    if (checkUser) {
      bcrypt.compare(payload.password, checkUser.password, (err, result) => {
        if (!result) {
          const response = checkUser.toObject();
          res.status(401).send(response);
        } else {
          const response = checkUser.toObject();
          const accessToken = jwt.sign(response, process.env.JWT_SECRET, {
            expiresIn: "1d",
          });
          res.send({ ...response, accessToken });
        }
      });
    } else {
      res.status(403).send(payload);
    }
  } catch (err) {
    res.status(500).send(err);
  }
});
