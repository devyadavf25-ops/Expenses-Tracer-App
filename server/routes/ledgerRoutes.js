const express = require('express');
const router = express.Router();
const {
  getLedgerEntries,
  createLedgerEntry,
  updateLedgerEntry,
  deleteLedgerEntry,
} = require('../controllers/ledgerController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getLedgerEntries).post(createLedgerEntry);
router.route('/:id').put(updateLedgerEntry).delete(deleteLedgerEntry);

module.exports = router;
