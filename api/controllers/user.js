const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.user_signup = (req,res,next) => {
    const {email,password} = req.body;
    User.find({ email: email })
    .exec()
    .then(user => {
      if (user.length >= 1) {
        return res.status(409).json({
          message: "Mail exists"
        });
      } else {
        bcrypt.hash(password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err
            });
          } else {
            const user = new User({
              _id: new mongoose.Types.ObjectId(),
              email,
              password: hash
            });
            user
              .save()
              .then(result => {
                console.log(result);
                res.status(201).json({
                  message: "User created"
                });
              })
              .catch(err => {
                console.log(err);
                res.status(500).json({
                  error: err
                });
              });
          }
        });
      }
    });
}

exports.user_login=(req,res,next)=> {
    const {email,password} = req.body
    User.find({email:email})
    .exec()
    .then(user => {
      if(user.length < 1){
        return res.status(401).json({
          message:"Auth Failed"
        });
      }
      bcrypt.compare(password,user[0].password,(err,result)=> {
        if(err){
          return res.status(401).json({
            message:"Auth Failed"
          });
        }
        if(result){
          const token = jwt.sign(
            {
             email: user[0].email,
             userId:user[0]._id
          },
          process.env.JWT_KEY,
          {
            expiresIn:"1h"
          }
          );
          return res.status(200).json({
            message:"Auth succesful",
            token
          });
        }
        res.status(401).json({
          message:"Auth Failed"
        });
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error:err
      });
    });
  }

  exports.user_delete=(req,res,next)=> {
    User.remove({_id:req.params.userId})
    .exec()
    .then(result => {
        res.status(200).json({
            message:"User Deleted"
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error:err
        });
    });
}