const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const checkAuth= require('../middleware/check-auth');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});


const Product = require('../models/product');

router.get('/',(req,res,next) => {
    Product.find()
    .select("name price _id productImage")
    .exec()
    .then(docs =>{
        
        const response ={
            count : docs.length,
            products: docs.map(doc => {
                const {name,price,_id}=doc;
                return {
                    name,
                    price,
                    _id,
                    productImage:doc.productImage,
                    request : {
                        type: "GET",
                        url : "http://localhost:3030/products/" + _id 
                    }
                };
            })
        };
        res.status(200).json(response);
    })
    .catch(err => { 
        console.log(err);
        res.status(500).json({
            error : err
        });
    })
});     

router.post('/',checkAuth,upload.single('productImage'),(req,res,next) => {
    const {name,price} = req.body;
    const product = new Product({
        _id : new mongoose.Types.ObjectId(),
        name,
        price,
        productImage: req.file.path 
    });
    product
    .save()
    .then(result => {
        console.log(result);
        const {price,_id,name} = result;
        res.status(201).json({
            message : "Created Product Succesfully",
            createdProduct : {
                name,
                price,
                _id,
                request : {
                    type : "GET",
                    url : "http://localhost:3030/products/" + _id 
                }
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error : err
        });
    });

});

router.get('/:productId',(req,res,next)=>{
    const {productId} = req.params;
    const id = productId ;

    Product.findById(id)
    .select('name price _id productImage')
    .exec()
    .then(doc => {
        console.log("From Database",doc);
        if(doc){
            res.status(200).json({
                product : doc,
                request :{
                    type : 'GET',
                    url : 'http://localhost:3030/products/' 
                }
            })
        }else {
            res.
            status(404)
            .json({message :"No valid entry found for provided ID"});
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error : err});
    });
});

router.patch('/:productId',checkAuth,(req,res,next) => {
    const {productId} = req.params;
    const id = productId ;
    const updateOps ={};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    Product.update({_id:id},{$set:updateOps})
    .exec()
    .then(result => {
        console.log(result);
        res.status(200).json({
            message : 'Product Updated',
            request :{
                type : 'GET',
                url : 'http://localhost:3030/products/' + id 
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error : err
        });
    });
});


router.delete('/:productId',checkAuth,(req,res,next) => {
    const {productId} = req.params;
    const id = productId ;
    Product.remove({_id:id})
    .then(result => {
    console.log(result);
    res.status(200).json({
        message: 'Product Deleted',
        request :{
            type : 'POST',
            url : 'http://localhost:3030/products/',
            body: {name : 'String',price : 'Number'} 
        }
    });
    })
    .catch(err => {
    console.log(err);
    res.status(500).json({
        error : err
    });
});


});

module.exports = router;