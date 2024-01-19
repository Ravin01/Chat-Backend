import Express from "express";
import { chatModel } from "../../db/dbModels.js";

export const messageRouter = Express.Router();

messageRouter.post("/", async (req, res) => {
  const payload = req.body;
  // payload = {
  //     sender : 'sender-email',
  //     receiver : 'receiver-email',
  //     message : 'data'
  // }
  try {
    const checkSender = await chatModel.findOne({ user: payload.sender });
    const checkSenderMail = checkSender.contacts.find(
      (us) => us.mail === payload.receiver
    );
    const checkReceiver = await chatModel.findOne({ user: payload.receiver });
    const checkReceiverMail = checkReceiver.contacts.find(
      (us) => us.mail === payload.sender
    );
    if (checkSenderMail && checkReceiverMail) {
        const checkPersonExist = checkSender.message.find((item) => item.otherPerson === payload.receiver)
        const checkPersonExistReceiver = checkReceiver.message.find((item) => item.otherPerson === payload.sender)
        if(checkPersonExist && checkPersonExistReceiver){
            let messageData = {
                sender : payload.sender,
                receiver : payload.receiver,
                message : payload.message,
                time : Date.now()
            }
            checkPersonExist.chats.push(messageData)
            checkPersonExistReceiver.chats.push(messageData)
            const filterOldDataSender = checkSender.message.filter((item) => item.otherPerson !== payload.receiver)
            const filterOldDataReceiver = checkReceiver.message.filter((item) => item.otherPerson !== payload.sender)
            filterOldDataSender.push(checkPersonExist)
            filterOldDataReceiver.push(checkPersonExistReceiver)
            const setAddedSender = await chatModel.findOneAndUpdate({user : payload.sender},{$set : {message : filterOldDataSender}})
            const setAddedReceiver = await chatModel.findOneAndUpdate({user : payload.receiver},{$set : {message : filterOldDataReceiver}})
            if(setAddedSender && setAddedReceiver){
                res.send({msg : 'data added'})
            }else{
                res.status(401).send({msg : 'data not added'})
            }
        }else{
            let messageDataSender = {
                otherPerson: payload.receiver,
                chats: [
                  {
                    sender: payload.sender,
                    receiver: payload.receiver,
                    message: payload.message,
                    time: Date.now(),
                  },
                ],
              };
            let messageDataReceiver = {
                otherPerson: payload.sender,
                chats: [
                  {
                    sender: payload.sender,
                    receiver: payload.receiver,
                    message: payload.message,
                    time: Date.now(),
                  },
                ],
              };
              const addMessageSender = await chatModel.findOneAndUpdate(
                { user: payload.sender },
                { $push: { message: messageDataSender } }
              );
              const addMessageReceiver = await chatModel.findOneAndUpdate(
                { user: payload.receiver },
                { $push: { message: messageDataReceiver } }
              );
              if (addMessageReceiver && addMessageSender) {
                res.status(200).send({ msg: "message sended successfully" });
              } else {
                res.status(409).send({ msg: "problem with sending message" });
              }
        }
      
      
      
    } else {
      res.send(401).send({ msg: "users are not present in contact list" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({ msg: "Server Error" });
  }
});




messageRouter.get("/:userEmail/:receiver", async (req, res) => {
  const { userEmail, receiver } = req.params;
  try {
    const getMessage = await chatModel.findOne(
      { user: userEmail },
      { _id: 0, profile: 1, message: 1, contacts: 1, user: 1 }
    );
    if (getMessage) {
      let filterData = getMessage.message.filter((msg) =>  msg.otherPerson === receiver);
    //   console.log(filterData[0].chats)
      res.status(200).send(filterData[0]?.chats);
    } else {
      res.status(409).send({ msg: "could not find any messages" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({ msg: "Server Error" });
  }
});
