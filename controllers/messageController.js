import message from '../models/Message'
import conversation from '../models/Conversation';
import { decodeToken } from '../utils/decodeToken';

const createMessage = async (conversationId, user,text) => {
  const newMessage = await message.create({conversationId,user,text});
  return newMessage;
}
export const sendMessage = async (req,res) => {
  const {conversationId, text} = req.body;
  const token = req.get('token');
  const user = await decodeToken(token); 
  const newMessage = await createMessage(conversationId, user.id,text);
  console.log(newMessage)
  if (newMessage) {
    await conversation.updateOne(
      {_id: newMessage.conversationId},
      {lastMessage: newMessage}
      )
    res.status(200).json({
      message: 'Create message Successfully',
      newMessage: newMessage.text,
    })
  }
  else {
    res.status(404).json({error: 'Message isnt created  '})
  }

}
export const findAll =  async(res,req) => {
  const mess = await message
    .find()
    .populate('User', 'name')
    .populate('conversationId', 'title')
    .exec();
   console.log(mess);
}