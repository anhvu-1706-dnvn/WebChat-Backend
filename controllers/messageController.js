import message from '../models/Message'
import conversation from '../models/Conversation';
import { decodeToken } from '../utils/decodeToken';

const createMessage = async (conversationId, user,text) => {
  const newMessage = await message.create({conversationId,user,text});
  return newMessage;
}
export const sendMessage = async (data) => {
  const {conversationId, text, token} = data;
  const user = await decodeToken(token); 
  const newMessage = await createMessage(conversationId, user.id,text);
  if (newMessage) {
    await conversation.updateOne(
      {_id: newMessage.conversationId},
      {lastMessage: newMessage}
      )
    return newMessage;
  }
  else {
    return Error ('Invalid message')
  }

}

export const findAll =  async(res,req) => {
  const mess = await message
    .find()
    .populate('User', 'name')
    .populate('conversationId', 'title')
    .exec();
}