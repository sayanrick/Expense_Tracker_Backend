const express = require('express');
const purchaseController = require('../controllers/purchase');
const authenticateMiddleware = require('../middleware/auth');

const router = express.Router();

router.get("/premiummembership", authenticateMiddleware.authenticate, purchaseController.purchasePremium);

router.post("/updatetransactionstatus", authenticateMiddleware.authenticate, purchaseController.updateTransactionStatus);

module.exports = router;