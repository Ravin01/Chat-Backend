import Express from "express";
import jwt from "jsonwebtoken";
import { registrationModel } from "../../db/dbModels.js";
import { transporter, mailOptions } from "./mail.js";



export const forgotPassRoute = Express.Router();

export let email = [];

forgotPassRoute.post("/", async (req, res) => {
  const payload = req.body.userEmail;
  email = [];
  email.push(payload);
  try {
    const validUser = await registrationModel.findOne({ userEmail: payload });
    if (validUser) {
     
      const verifyToken = jwt.sign(
        { userEmail: payload },
        process.env.JWT_SECRET,
        { expiresIn: "1day" }
      );
      const link = `${process.env.FE_URL}/resetPassword?verify=${verifyToken}`;
      const mail = await transporter.sendMail({
        ...mailOptions,
        to: payload,
        text: `Hi please conform your email and click this link to verify you : ${link}`,
      });
      if (mail) {
        res.send("Mail Sended");
      }else{
        res.send('Error while sending email')
      }
    } else {
      res.status(401).send("Invalid User");
    }
  } catch (err) {
    res.status(500).send(err);
  }
});
