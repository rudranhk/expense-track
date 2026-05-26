const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');

router.get('/' ,async (req,res) => {
    const expenses = await Expense.find({isDeleted : false}).lean();
     const summary = await Expense.aggregate([
    { $group: { _id: "$category", total: { $sum: "$amount" } } }
  ]);
    res.render('expenses',{expenses,summary});
});

router.post('/add', async (req,res)=> {
    const { description,amount , category , date} = req.body;
   await Expense.create({description, amount , category ,date});
res.redirect('/');
});

router.post('/delete/:id',async (req,res) => {
    await Expense.findByIdAndUpdate(req.params.id, { isDeleted: true });
    res.redirect('/');
});


module.exports = router;