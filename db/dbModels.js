import mongoose from "mongoose";

export const registrationSchema = mongoose.Schema({
  userId: {
    type: "string",
    required: true,
  },
  userName: {
    type: "string",
    required: true,
  },
  userEmail: {
    type: "string",
    required: true,
  },
  password: {
    type: "string",
    required: true,
  },
});


export const registrationModel = mongoose.model("users", registrationSchema);

export const chatSchema = mongoose.Schema({
  user : {
    type : "string",
    required : true
  },
  profile : 'string',
  contacts : [
    {
      mail : 'string',
      name : 'string',
      // profile : 'string'
    }
  ],
  message : [
    {
      otherPerson : 'string',
      chats : [
        {
          sender : "string",
          receiver : "string",
          message : 'string',
          time : Date
        }
      ]
    }
  ]
})

export const chatModel = mongoose.model("chats", chatSchema)