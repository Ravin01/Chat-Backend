import Express  from "express";
import { chatModel, registrationModel } from "../../db/dbModels.js";


export const getContactsRoute = Express.Router()

getContactsRoute.get('/:userEmail', async(req,res)=>{
    const {userEmail} = req.params
    try{
        const allContacts = await chatModel.findOne({user  : userEmail})
        if(allContacts){
            const profiles = await Promise.all(allContacts.contacts.map(async (item) => {
                try {
                    const userProfile = await chatModel.findOne({ user: item.mail }, { _id: 0, profile: 1 });
                    // console.log(userProfile)
                    return {
                        mail : item.mail,
                        name : item.name,
                        profile : userProfile.profile
                    }
                } catch (error) {
                    console.error(err);
                }
            }));
            res.status(200).send(profiles)
        }else{
            res.status(409).send({msg : 'No contacts are present, Start Conversation'})
        }
    }catch(err){
        console.log(err)
        res.status(500).send({msg : 'Server error'})
    }
})


getContactsRoute.post('/:userEmail', async(req,res)=>{
    const {userEmail} = req.params
    const payload = req.body
    // payload = {
        // mail : 'email',
    // }
    try{
        const checkUser = await registrationModel.findOne({userEmail  : userEmail})
        const checkNewUser = await registrationModel.findOne({userEmail  : payload.mail})
        if(checkUser && checkNewUser){
            const checkContacts = await chatModel.findOne({user : userEmail})
            let contact = checkContacts.contacts.find((us) => us.mail === payload.mail)
            if(contact){
                res.status(403).send({msg : `${contact.name} is already connected, please do refresh`})
            }else{
                let receiverData = {
                    mail : payload.mail,
                    name : checkNewUser.userName
                }
                const addContact = await chatModel.findOneAndUpdate({user : userEmail}, {$push : {contacts : receiverData}})
                let senderData = {
                    mail : userEmail,
                    name : checkUser.userName
                }
                const addSender = await chatModel.findOneAndUpdate({user : payload.mail}, {$push : {contacts : senderData}})
                if(addContact && addSender ){
                  
                    res.status(200).send({msg : 'Added successfully'})
                }else{
                    res.status(401).send({msg : 'problem with add a new one'})
                }
            }
        }else{
            res.status(409).send({msg : 'New User is not yet registered'})
        }
    }catch(err){
        console.log(err)
        res.status(500).send({msg : 'Server error'})
    }
})