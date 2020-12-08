import { Schema, model } from 'mongoose';

const conversationSchema = new Schema({
  title: { type: String },
  lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
  //lastMessage: { type: String },
  participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  //participants: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: { type: Date, default: null }
});
const conversation = model('Conversation', conversationSchema);
export default conversation;