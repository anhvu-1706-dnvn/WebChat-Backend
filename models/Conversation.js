import { Schema, model } from 'mongoose';

const conversationSchema = new Schema({
  title: { type: String },
  lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
  participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: { type: Date, default: null }
});
const conversation = model('Conversation', conversationSchema);
export default conversation;