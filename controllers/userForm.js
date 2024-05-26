/* Model Imports */
const userForm = require('../models/userForm.js');
const mongoose = require('mongoose');

/* Functions */
function validateId(id){
    if(id && (/^[a-f\d]{24}$/.test(id)) && (id.length===24)){
        return true
    }
    return false
}

/* Exports */
module.exports = {
    get: async (req, res, next) => {
        console.log("hitting get")
        const uID = req.user._id.toString();
        const qID = req.params.id;        
        if(qID && validateId(uID) && validateId(qID)){
            await userForm.findOne({ "userId": uID}).then(
                (object)=>{
                    if(object.questions){
                        let list = [];
                        object.questions.filter(
                            (obj)=>{
                                if(obj.root===qID){
                                    list.push(obj)
                                }
                            }
                        )
                        console.log("get succ")
                        res.status(200).send(list) /* returns list of all childrens having para root node */
                    }
                    else{
                        console.log("get 2")
                        res.status(400).send("Bad Request")
                    }
                }
            ).catch(next)
        }
        else{
            console.log("get 1")
            res.status(400).send("Bad Request")
        }
    },

    post: async (req, res, next) => {
        console.log("hitting post")
        const uID = req.user._id.toString();
        const q = req.body.questions;
        if(validateId(uID) && q){

            if(q.parent && q.root && (q.level>=0) &&
                (q.question ==="" || q.question !=="") &&
                (q.componentType==="" || q.componentType!=="") &&
                (q.questionType==="" || q.questionType!=="") &&
                (q.selectImagePath==="" || q.selectImagePath!=="") &&
                (q.selectImageName==="" || q.selectImageName!=="") &&
                (q.selectText==="" || q.selectText!=="") &&
                (q.userInput==="" || q.userInput!=="") &&

                
                (q.selectAnswerType==="" || q.selectAnswerType!=="") &&
                (q.selectAnswerTypeText==="" || q.selectAnswerTypeText!=="") &&
                (q.productTitle==="" || q.productTitle!=="") &&
                (q.productDescription==="" || q.productDescription!=="") &&
                (q.productUrl==="" || q.productUrl!=="") &&                
                (q.productImagePath==="" || q.productImagePath!=="") &&
                (q.productImageName==="" || q.productImageName!=="") &&
                


                (q.selectQuestionType==="" || q.selectQuestionType!=="")
                
                ){
                if(validateId(q.parent) && validateId(q.root)){
                    const newQuestion = {
                        name: q.name,
                        parent: q.parent,
                        root: q.root,
                        level: q.level,
                        question: q.question,
                        componentType: q.componentType,
                        questionType: q.questionType,
                        selectImagePath: q.selectImagePath,
                        selectImageName: q.selectImageName,
                        rangeFrom: q.rangeFrom,
                        rangeTo: q.rangeTo,
                        selectText: q.selectText,
                        userInput: q.userInput,
                        products: q.products,


                        sliderFrom: q.sliderFrom,
                        sliderTo: q.sliderTo,
                        productImagePath: q.productImagePath,
                        productImageName: q.productImageName,
                        selectAnswerType: q.selectAnswerType,
                        selectAnswerTypeText: q.selectAnswerTypeText,
                        productTitle: q.productTitle,
                        productDescription: q.productDescription,
                        productUrl: q.productUrl,
                        hasChild: q.hasChild,
                        _id: mongoose.Types.ObjectId(),


                        count: q.count,
                        selectQuestionType: q.selectQuestionType,
                    }
                    const newID = newQuestion._id.toString()
                    await userForm.findOne({ userId: uID}).then(
                        async (object)=>{
                            if(object.questions){
                                object.questions.push(newQuestion)
                                await object.save().then(
                                    ()=>{
                                        console.log("post succ")
                                        res.status(200).send(
                                            {
                                                id: newID
                                            }
                                        ) /* returns id of added node */
                                    }
                                    
                                ).catch(next)
                            }
                            else{
                                console.log("add 4")
                                res.status(400).send("Bad Request")
                            }
                        }
                    ).catch(next)
                }
                else{
                    console.log("add 3")
                    res.status(400).send("Bad Request")
                }
            }
            else{
                console.log("add 2")
                res.status(400).send("Bad Request")
            }
        }
        else{
            console.log("add 1")
            res.status(400).send("Bad Request")
        }
    },
    delete: async (req, res, next) => {
        console.log("hitting del")
        const uID = req.user._id.toString();
        const delRoot = req.params.id;
        if(validateId(uID) && validateId(delRoot) && (uID !== delRoot)){
            await userForm.findOne({ "userId": uID }).then(
                async (object)=>{
                    if(object.questions){
                        let list = [];                        
                        var found = false;
                        var delID;
                        object.questions.filter(                        
                            (obj)=>{
                                if(obj._id.toString()===delRoot || obj.root===delRoot){
                                    if(obj._id.toString()==delRoot){
                                        delID = obj._id.toString()
                                    }
                                    found = true;
                                }
                                else{
                                    list.push(obj)
                                }
                            }
                        )                        
                        if(found === true){
                            object.questions = list
                            await object.save().then(
                                ()=>{
                                    console.log("deleted: " + delID)
                                    res.status(200).send(
                                        {
                                            id: delID
                                        }
                                    ) /* returns id of deleted node */
                                }
                            ).catch(next)
                        }
                        else{
                            console.log("delete 3")
                            res.status(404).send("Not found")
                        } 
                    }
                    else{
                        console.log("delete 2")
                        res.status(400).send("Bad Request")
                    }                   
                }
            ).catch(next)
        }
        else{console.log("delete 1")
            res.status(400).send("Bad Request")
        }
    },
    patch: async(req, res, next)=>{
        console.log("hitting patch")
        const uID = req.user._id.toString();
        const q = req.body.questions;
        if(q && uID){
            if(q._id && q.parent && q.root && (q.level>=0) &&
                (q.question ==="" || q.question !=="") &&
                (q.componentType==="" || q.componentType!=="") &&
                (q.questionType==="" || q.questionType!=="") &&
                (q.selectImagePath==="" || q.selectImagePath!=="") &&
                (q.selectImageName==="" || q.selectImageName!=="") &&
                (q.selectText==="" || q.selectText!=="") &&
                (q.userInput==="" || q.userInput!=="") &&
                



                (q.selectAnswerType==="" || q.selectAnswerType!=="") &&
                (q.selectAnswerTypeText==="" || q.selectAnswerTypeText!=="") &&
                (q.productTitle==="" || q.productTitle!=="") &&
                (q.productDescription==="" || q.productDescription!=="") &&
                (q.productUrl==="" || q.productUrl!=="") &&
                (q.productImagePath==="" || q.productImagePath!=="") &&
                (q.productImageName==="" || q.productImageName!=="") &&


                (q.selectQuestionType==="" || q.selectQuestionType!=="")
                ){
                if(validateId(uID) && validateId(q._id) && validateId(q.parent) && validateId(q.root)){
                    await userForm.findOne({ "userId": uID }).then(
                        async (object)=>{
                            if(object.questions){
                                const updatedQuestion = {
                                    name: q.name,
                                    parent: q.parent,
                                    root: q.root,
                                    level: q.level,
                                    question: q.question,
                                    componentType: q.componentType,
                                    questionType: q.questionType,
                                    selectImagePath: q.selectImagePath,
                                    selectImageName: q.selectImageName,
                                    rangeFrom: q.rangeFrom,
                                    rangeTo: q.rangeTo,
                                    selectText: q.selectText,
                                    userInput: q.userInput,
                                    products: q.products,

                                    sliderFrom: q.sliderFrom,
                                    sliderTo: q.sliderTo,
                                    productImagePath: q.productImagePath,
                                    productImageName: q.productImageName,
                                    selectAnswerType: q.selectAnswerType,
                                    selectAnswerTypeText: q.selectAnswerTypeText,
                                    productTitle: q.productTitle,
                                    productDescription: q.productDescription,
                                    productUrl: q.productUrl,
                                    hasChild: q.hasChild,
                                    _id: q._id,


                                    count: q.count,
                                    selectQuestionType: q.selectQuestionType
                                }
                                let list = [];
                                var found = false;
                                object.questions.filter(
                                    (obj)=>{
                                        if(obj._id.toString()===q._id){
                                            list.push(updatedQuestion)
                                            found = true;
                                        }
                                        else{
                                            list.push(obj)
                                        }
                                    }
                                )
                                if(found){
                                    object.questions = list;
                                    await object.save().then(
                                        ()=>{
                                            console.log("patch succ")
                                            res.status(200).send(
                                                {
                                                    _id: q._id
                                                }    
                                            ) /* returns id of edited node */
                                        }
                                    )
                                }
                                else{
                                    console.log("5")
                                    res.status(404).send("Not Found")
                                }                                    

                            }
                            else{
                                console.log("4")
                                res.status(400).send("Bad Request")
                            }
                        }
                    ).catch(next)
                }
                else{
                    console.log("3")
                    res.status(400).send("Bad Request")
                } 
            }
            else{
                console.log("2")
                res.status(400).send("Bad Request")
            }           
        }
        else{
            console.log("1")
            res.status(400).send("Bad Request")
        }
    }
}