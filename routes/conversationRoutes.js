import { route } from './authRoutes';

const {Router } = require('express');
const conversationController = require('../controllers/conversationController')
const router = Router();
router.post('/', conversationController.createConversation)
router.get('/', conversationController.getConversation)
router.get('/message', conversationController.getConversationMessages)
export default router;