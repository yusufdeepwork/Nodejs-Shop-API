const express = require('express');
const router = express.Router();


// Handle incoming GET requests to /orders
router.get('/',(req,res,next) => {
    res.status(200).json({
        message : 'Orders were fetched'
    });
});

router.post('/',(req,res,next) => {
    const {productId,quantity} = req.body;
    const order = {
        productId,
        quantity 
    };
    res.status(200).json({
        message : 'Orders were created',
        order : order   
    });
});

router.get('/:orderId',(req,res,next)=>{
    res.status(200).json({
        message :'Order Details',
        orderId : req.params.orderId
    });
});


router.delete('/:orderId',(req,res,next)=>{
    res.status(200).json({
        message :'Order Deleted',
        orderId : req.params.orderId
    });
});

module.exports = router;