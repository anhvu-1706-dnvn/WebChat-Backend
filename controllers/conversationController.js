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
  if (room) return room;
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
  const {recipientId, text} = req.body
  const participants = [];
  if (senderToken) {
      const decodedToken = await decodeToken(senderToken);
       const senderId = decodedToken.id
       console.log(decodedToken);
       const recipient = await user.findById({_id: recipientId});
       const sender = await user.findById({_id: senderId});
         participants.push(recipient, sender)
         console.log('PARTI: ',participants);
         try {
           //console.log(userToken, text);
           const newConversation = await conversation.create({
             title: recipient.name,
             participants,
            })
            //const newMessage = await message.create({conversationId,user,text});
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
            res.status(400).json({
              message: "Have Error",
              error,
            })
          }
        }
   else {
    console.error("Not found token");
  }
  
  
}
export const getConversation = async (req, res) => {
    const senderToken = req.get('token');
    console.log(senderToken);
    if (senderToken) {
      const decodedToken = await decodeToken(senderToken);
      const senderId = decodedToken.id
      //console.log(decodedToken);
           try {
            // const checkConversation = await checkConversationExisted(await user.findById({_id: senderId}));
             const checkConversation = await findAll( senderId);
           // console.log(checkConversation);
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
 // console.log(id);
  const conversations = await conversation.findById({_id: id});
 // console.log(conversations)
  try {
    const messages = await message  
      .find({ conversationId: conversations._id })
      .populate('user', 'name')
      .sort('createdAt')
   // console.log(messages)
    if (messages.length > 0) {
      res.status(200).json({
        messages
      })
    }
  }catch (error) {
    res.status(400).json({
      error
    })
  }
    
}

