const { Op } = require('sequelize');
const LedgerEntry = require('../models/LedgerEntry');

// @desc    Get all ledger entries + summary for this user
// @route   GET /api/ledger
// @access  Private
const getLedgerEntries = async (req, res, next) => {
  try {
    const { type, status, search } = req.query;
    const where = { userId: req.user.id };
    if (type)   where.type   = type;
    if (status) where.status = status;
    if (search) where.personName = { [Op.like]: `%${search}%` };

    const entries = await LedgerEntry.findAll({
      where,
      order: [['date', 'DESC']],
    });

    // Summary
    const all = await LedgerEntry.findAll({ where: { userId: req.user.id } });

    const summary = all.reduce((acc, e) => {
      const pending = parseFloat(e.amount) - parseFloat(e.settledAmount || 0);
      if (e.type === 'lent') {
        acc.totalLent      += parseFloat(e.amount);
        acc.pendingLent    += e.status !== 'settled' ? pending : 0;
      } else {
        acc.totalBorrowed  += parseFloat(e.amount);
        acc.pendingBorrowed += e.status !== 'settled' ? pending : 0;
      }
      return acc;
    }, { totalLent: 0, totalBorrowed: 0, pendingLent: 0, pendingBorrowed: 0 });

    summary.netBalance = summary.pendingLent - summary.pendingBorrowed;

    res.status(200).json({ success: true, data: { entries, summary } });
  } catch (error) {
    next(error);
  }
};

// @desc    Create ledger entry
// @route   POST /api/ledger
// @access  Private
const createLedgerEntry = async (req, res, next) => {
  try {
    const { personName, type, amount, description, date, dueDate, notes } = req.body;
    if (!personName || !type || !amount) {
      return res.status(400).json({ success: false, message: 'personName, type, and amount are required.' });
    }
    if (!['lent', 'borrowed'].includes(type)) {
      return res.status(400).json({ success: false, message: 'type must be "lent" or "borrowed".' });
    }

    const entry = await LedgerEntry.create({
      userId: req.user.id,
      personName: personName.trim(),
      type,
      amount: parseFloat(amount),
      description,
      date: date || new Date(),
      dueDate: dueDate || null,
      notes,
      status: 'pending',
      settledAmount: 0,
    });

    res.status(201).json({ success: true, data: entry });
  } catch (error) {
    next(error);
  }
};

// @desc    Update ledger entry (edit or mark settled/partial)
// @route   PUT /api/ledger/:id
// @access  Private
const updateLedgerEntry = async (req, res, next) => {
  try {
    const entry = await LedgerEntry.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!entry) return res.status(404).json({ success: false, message: 'Entry not found.' });

    const { personName, amount, description, date, dueDate, notes, status, settledAmount } = req.body;

    const updatedSettledAmount = settledAmount !== undefined
      ? parseFloat(settledAmount)
      : parseFloat(entry.settledAmount);
    const totalAmount = amount !== undefined ? parseFloat(amount) : parseFloat(entry.amount);

    let newStatus = status || entry.status;
    if (updatedSettledAmount >= totalAmount) newStatus = 'settled';
    else if (updatedSettledAmount > 0)       newStatus = 'partial';

    await entry.update({
      personName:    personName    !== undefined ? personName.trim() : entry.personName,
      amount:        amount        !== undefined ? totalAmount        : entry.amount,
      description:   description   !== undefined ? description        : entry.description,
      date:          date          !== undefined ? date               : entry.date,
      dueDate:       dueDate       !== undefined ? dueDate            : entry.dueDate,
      notes:         notes         !== undefined ? notes              : entry.notes,
      settledAmount: updatedSettledAmount,
      status:        newStatus,
    });

    res.status(200).json({ success: true, data: entry });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete ledger entry
// @route   DELETE /api/ledger/:id
// @access  Private
const deleteLedgerEntry = async (req, res, next) => {
  try {
    const entry = await LedgerEntry.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!entry) return res.status(404).json({ success: false, message: 'Entry not found.' });
    await entry.destroy();
    res.status(200).json({ success: true, message: 'Entry deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getLedgerEntries, createLedgerEntry, updateLedgerEntry, deleteLedgerEntry };
