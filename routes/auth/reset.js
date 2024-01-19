import Express from "express";
import bcrypt from 'bcryptjs'
import { email } from "./forgotpass.js";
import { registrationModel } from "../../db/dbModels.js";

export const resetPasswordRoute = Express.Router();

resetPasswordRoute.post("/", async (req, res) => {
  const payload = req.body.password
  try {
    const data = await registrationModel.find({ userEmail: email[0] });
    if (data) {
        bcrypt.genSalt(10, (err,salt)=>{
            bcrypt.hash(payload, salt, async (err, hash) => {
                if (err) {
                  res.status(500).send("Error while hash password");
                }else{
                    await registrationModel.findOneAndUpdate(
                        { userEmail: email[0] },
                        { ...data, password: hash }
                      )
                      res.send("password updated successfully");
                }
              });
        })
      
    }
  } catch (err) {
    console.error(err);
    res.status(401).send(err);
  }
});