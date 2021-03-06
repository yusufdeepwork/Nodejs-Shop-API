const mongoose = require('mongoose');
const Order = require('../models/order');
const Product = require('../models/product');


exports.orders_get_all= (req,res,next) => {
    Order.find()
    .select("product quantity _id")
    .populate('product','name')
    .exec()
    .then(docs =>{
        res.status(200).json({
            count : docs.length,
            orders : docs.map(doc => { 
                const {product,quantity,_id} = doc;
                return {
                    _id,
                    product,
                    quantity,
                    request : {
                        type :"GET",
                        url : "http://localhost:3030/orders/" + _id
                    }
                }
            })
        });
    })
    .catch(err => {
        res.status(500).json({
            error:err
        });
    })
}

exports.orders_create_order=(req,res,next) => {
    const {productId,quantity} = req.body;
    Product.findById(productId)
    .then(product => {
        if(!product){
            return res.status(404).json({
                message :"Order not found"
            });
        }
        const order = new Order({
            _id : mongoose.Types.ObjectId(),
            quantity,
            product:productId
        });
        return order.save();
        })
        .then(result => {
            const {_id,product,quantity} = result;
            console.log(result);
            res.status(201).json({
                message : "Order Stored",
                createdOrder : {
                    _id,
                    product,
                    quantity
                },
                request : {
                    type :"GET",
                    url : "http://localhost:3030/orders/" + _id
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error : err
            });
        })
    }

exports.orders_get_order=(req,res,next)=>{
    Order.findById(req.params.orderId)
    .populate('product')
    .exec()
    .then(order => {
        if(!order){
            return res.status(404).json({
                message: "Order Not Found",
            });
        }
        res.status(200).json({
            order,
            request:{
                type:"GET",
                url:"http://localhost:3030/orders"
            }
        });
    })
    .catch(err=> {
        res.status(500).json({
            error:err
        });
    })
}

exports.orders_delete_order=(req,res,next)=>{
    Order.remove({_id:req.params._id})
        .exec()
        .then(result => {
            res.status(200).json({
                message :"Order deleted",
                request:{
                    type:"POST",
                    url: "http://localhost:3030/orders",
                    body:{productId:"ID",quantity:"Number"}
                }
            });
        })
        .catch(err => {
            res.status(500).json({
                error:err
            });
        })
}