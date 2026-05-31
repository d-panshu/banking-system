const accountModel = require("../models/accountModel");

async function getBalance(req, res, next) {
  try {
    const { accountId } = req.user;

    const account = await accountModel.getBalance(accountId);
    if (!account) {
      return res.status(404).json({ success: false, error: "Account not found" });
    }

    return res.status(200).json({
      success: true,
      balance: parseFloat(account.balance),
    });
  } catch (err) {
    next(err);
  }
}

async function deposit(req, res, next) {
  try {
    const { accountId } = req.user;
    const { amount } = req.body;

    const newBalance = await accountModel.deposit(accountId, amount);

    return res.status(200).json({
      success: true,
      deposited: amount,
      balance: newBalance,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getBalance, deposit };
