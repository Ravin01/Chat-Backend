import Express  from "express";
import { chatModel } from "../../db/dbModels.js";

export const profileRouter = Express.Router()

profileRouter.get('/:userEmail', async(req,res)=>{
    const {userEmail} = req.params
    try{
        const getProfile = await chatModel.findOne({user : userEmail},{_id : 0, profile : 1})
        if(getProfile){
            res.send(getProfile)
        }else{
            res.status(401).send({msg : 'profile not yet selected'})
        }
    }catch(err){
        console.log(err)
        res.status(500).send({msg : 'server error'})
    }
})


profileRouter.post('/:userEmail', async(req,res)=>{
    const {userEmail} = req.params
    const payload = req.body
    // payload = {
    //     profileLink : 'link'
    // }
    try{
        const profileData = {
            user : userEmail,
            profile : payload.profileLink,
            contacts : [],
            message : []
        }
        const checkProfile = await chatModel.findOne({user : userEmail})
        if(checkProfile){
            res.send({msg : 'user is already exist'})
        }else{
            const setProfile = await chatModel.create(profileData)
            if(setProfile){
                res.send({msg : 'profile is created'})
            }else{
                res.status(401).send({msg : 'problem with creating profile'})
            }
        }
    }catch(err){
        console.log(err)
        res.status(500).send({msg : 'server error'})
    }
})