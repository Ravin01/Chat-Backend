import Express from "express";
import { v4 } from "uuid";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { registrationModel } from "../../db/dbModels.js";


export const registerRoute = Express.Router();

registerRoute.post("/", async (req, res) => {
  const payload = req.body;
  try {
    const checkUser = await registrationModel.findOne({
      userEmail: payload.userEmail,
    });
    if (checkUser) {
      const response = checkUser.toObject();
      res.status(401).send(response);
    } else {
      bcrypt.genSalt(10, (err,salt) =>{
        bcrypt.hash(payload.password, salt, async(err,hash)=>{
            if(err){
                console.log(err)
                res.status(409).send(err)
            }else{
                const newUser = await registrationModel.create({...payload, password : hash, userId : v4()})
                if(newUser){
                    const newRegis = newUser.toObject()
                    const accessToken = jwt.sign(newRegis, process.env.JWT_SECRET,{
                        expiresIn : '1d'
                    })
                    res.send({...newRegis, accessToken})
                }
            }
        })
      })
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
