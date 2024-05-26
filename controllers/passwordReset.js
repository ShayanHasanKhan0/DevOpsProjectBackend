const User = require('../models/user.js')
const Token = require("../models/token");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const Joi = require("joi");
const bcrypt = require('bcrypt')


module.exports.reset = {
    post: async(req, res) => {
        try {
            const schema = Joi.object({ email: Joi.string().email().required() });
            const { error } = schema.validate(req.body);
            if (error) return res.send({message:error.details[0].message});

            const user = await User.findOne({ email: req.body.email });
            if (!user)
                return res.send({message:"user with given email doesn't exist"});

            let token = await Token.findOne({ userId: user._id });
            if (!token) {
                token = await new Token({
                    userId: user._id,
                    token: crypto.randomBytes(32).toString("hex"),
                }).save();
            }
            
            const link = `Paste this link in your browser to reset your password: \n${process.env.BASE_URL_FRONTEND}/reset-password/${user._id}/${token.token}`;
            await sendEmail(user.email, "Password reset for Product Path Account", link);

            res.send({message:"password reset link sent to your email account"});
        } catch (error) {
            res.send({message:"An error occured"});
            console.log(error);
        }
    }
};

module.exports.resetlink = {
    post: async(req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.send({message:"Invalid link or expired"});

        const token = await Token.findOne({
            userId: user._id,
            token: req.params.token,
        });
        if (!token) return res.send({message:"Invalid link or expired"});

        return res.status(200).send({message:"link is valid"});
        
    } catch (error) {
        console.log(error);
        res.send({message:"An error occured"});
    }
}};

module.exports.resetpassword = {
    post: async(req, res) => {
        try {
            const schema = Joi.object({ password: Joi.string().required(), token: Joi.string() });
            const { error } = schema.validate(req.body);
            if (error) return res.status(400).send({message:error.details[0].message});
            
            const user = await User.findById(req.params.userId);
            const token = await Token.findOne({
                userId: user._id,
                token: req.params.token,
            });

            if(req.body.password) {
                req.body.password = await bcrypt.hash(req.body.password, 10)
            }

            user.password = req.body.password;
            
            await user.save();
            await token.delete();

            res.send({message:"password reset successfully."}); 

        } catch (error) {
            res.send({message:"An error occured"});
            console.log(error);
        }     
    }
};

module.exports.resetpasswordprofile = {
    post: async(req, res) => {
        try {
            // const schema = Joi.object({ password: Joi.string().required(), token: Joi.string() });
            // const { error } = schema.validate(req.body);
            // if (error) return res.status(400).send({message:error.details[0].message});
            
            const user = await User.findById(req.params.userId);
            // const token = await Token.findOne({
            //     userId: user._id,
            //     token: req.params.token,
            // });

            if(req.body.password) {
                req.body.password = await bcrypt.hash(req.body.password, 10)
            }

            user.password = req.body.password;
            
            await user.save();

            res.send({message:"password reset successfully."}); 

        } catch (error) {
            res.send({message:"An error occured"});
            console.log(error);
        }     
    }
};
