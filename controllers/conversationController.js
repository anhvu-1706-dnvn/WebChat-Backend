import { json, response } from 'express';
import conversation from '../models/Conversation';
import message from '../models/Message';
import user from '../models/User';
import jwt from 'jsonwebtoken'
import { decodeToken } from '../utils/decodeToken';
const checkConversationExisted = async (participants) => {
  const room = await conversation.find({
    participants: {$all: participants}
  });
  if (room.length > 0) return room;
  return false;
} 
const findAll = async (id) => {
  const models = await conversation
  .find ({participants: id})
  .populate('participants', 'name')
  .populate('lastMessage')
  return models
}
export const createConversation = async (req, res) => {
  const senderToken = req.get('token')
  const {recipientName, text} = req.body
  const participants = [];
  if (senderToken) {
      const decodedToken = await decodeToken(senderToken);
       const senderId = decodedToken.id
       try {
         const recipient = await user.findOne({name: recipientName});
         if (recipient === null) throw 'User isnt here'
         participants.push(recipient)
        } catch (error) {
          res.status(404).json({
            message: 'Cant find user with that name'
          })
          return;
        }
          const sender = await user.findById({_id: senderId});
            participants.push( sender)
        if(await checkConversationExisted(participants)) {
          res.status(404).json({
            message: 'Duplicate Conversation',
          })
          return;
        }
         try {
           const newConversation = await conversation.create({
             participants,
            })
            const newMessage = await message.create({
              conversationId: newConversation._id, 
              user: senderId, 
              text: text
            });
            if (newMessage) {
              await conversation.updateOne(
                {_id: newMessage.conversationId},
                {lastMessage: newMessage}
                )
              }else {
                console.error("cannot create message");
              }
           res.status(200).json({
             message: "Created successfully",
             conversation: newConversation,
           })
          }catch(error) {
            console.log(error.message)
            res.status(400).json({
              message: error.message,
            })
          }
        }
   else {
    console.error("Not found token");
  }
  
  
}
export const getConversation = async (req, res) => {
    const senderToken = req.get('token');
    if (senderToken) {
      const decodedToken = await decodeToken(senderToken);
      const senderId = decodedToken.id
           try {
             const checkConversation = await findAll( senderId);
            if (checkConversation) {
              res.status(200).json({
                message: 'Found Conversation',
                conversation: checkConversation
              })
            }else {
              try {
                res.status(200).json({
                  message: 'Not found Conversation',
                })
              } catch (error) {
                res.status(400).json({
                  message: 'Some error happened',
                  error: error
                })
              }
            }
          }catch (error) {
            console.log(error)
             res.status(400).json({
               message: 'Some error happened',
               error: error
             })
           }
          }
     else {
      res.status(400).json({
        error: "ERROR"
      })
    }
}
export const getConversationMessages = async (req,res) => {
  const id = req.get('conversationId');
  const conversations = await conversation.findById({_id: id});
  try {
    const messages = await message  
      .find({ conversationId: conversations._id })
      .populate('user', 'name')
      .sort('createdAt')
   let arrayMes = [];

    if (messages.length > 0) {
      for (let i = 0; i < messages.length; i++) {
        let data = {
          conversationId: messages[i].conversationId, 
          text: messages[i].text,
          name: messages[i].user.name
        }
        arrayMes.push(data);
      }
      res.status(200).json({
        arrayMes,
      })
    }
  }catch (error) {
    res.status(400).json({
      error
    })
  }
    
}

