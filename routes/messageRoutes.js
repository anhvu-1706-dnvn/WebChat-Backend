const {Router } = require('express');
const messageController = require('../controllers/messageController')
const router = Router();
router.post('/', messageController.sendMessage)
router.get('/', messageController.findAll)
export default router;