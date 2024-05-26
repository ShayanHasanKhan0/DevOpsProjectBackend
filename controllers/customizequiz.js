const userForm = require('../models/userForm.js');

function validateId(id){
    if(id && (/^[a-f\d]{24}$/.test(id)) && (id.length===24)){
        return true
    }
    return false
}

function resHandler(res){
    res.status(200).send()
}

/* Exports */
module.exports = {
    get: async (req, res, next) => {
        const formId = req.params.formid;
        const userId = req.user._id.toString();
        await userForm.findOne({ "userId": userId}).then(
            (object)=>{
                if(object!=null){
                    if(object.questions){
                        object.questions.filter(
                            (obj)=>{
                                if(obj.parentId===userId){
                                    console.log(obj.customform)
                                    console.log("noooo")
                                    // console.log("one")
                                    res.status(200).send(
                                        {
                                            customobject: obj.customform
                                        }
                                    )
                                }
                            }
                        )
                        // res.status(200).send(
                        //     {
                        //         customobject: obj
                        //     }
                        // )
                    }
                    else{
                        errHandler(res)
                    }
                }
                else{
                    errHandler(res)
                }
            }
        ).catch(
            (err)=>{
                console.log(err)
                errHandler(res)
            }
        )
    },
    post: async (req, res, next) => {
        q = req.body
        // console.log(q)
        const formId = req.params.formid;
        const userId = req.user._id.toString();

        await userForm.findOne({ "userId": userId }).then(
            async (object)=>{                
                if(object.questions){
                    let list = [];
                    var found = false;
                    object.questions.filter(
                        (obj)=>{
                            if((obj.root===formId || obj._id.toString()===formId) && obj.name!=null){                                    
                                list.push(
                                    {
                                        name: obj.name,
                                        parent: obj.parent,
                                        root: obj.root,
                                        level: obj.level,
                                        count: obj.count,
                                        content: obj.content,
                                        selectComponentType: obj.selectComponentType,
                                        selectQuestionType: obj.selectQuestionType,
                                        optionImagePath: obj.optionImagePath,
                                        productImagePath: obj.productImagePath,
                                        selectAnswerType: obj.selectAnswerType,
                                        selectAnswerTypeText: obj.selectAnswerTypeText,
                                        productTitle: obj.productTitle,
                                        productDescription: obj.productDescription,
                                        productUrl: obj.productUrl,
                                        sliderFrom: obj.sliderFrom,
                                        sliderTo: obj.sliderTo,
                                        hasChild: obj.hasChild,
                                        customform: q,
                                        stats: obj.stats,
                                        _id: obj._id
                                    }
                                )
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
                                resHandler(res) /* returns id of edited node */
                            }
                        ).catch(
                            resHandler(res)
                        )
                    }
                    else{
                        resHandler(res)
                    }                                    

                }
                else{
                    resHandler(res)
                }
            }
        ).catch(resHandler(res))
        
        // await userForm.findOne({ "userId": userId }).then(
        //     (object)=>{
        //         if(object!=null){
        //             if(object.questions){
        //                 // let customobject = [];
        //                 object.questions.filter(
        //                     async (obj)=>{
        //                         if((obj.root===formId || obj._id.toString()===formId) && obj.name!=null){
        //                             // obj.append
                                                                    
        //                             obj.customform.style.color = "blue"
        //                             console.log(obj) 
        //                             // obj.customizeButtons.backgroundColor = q.customizeButtons.backgroundColor
        //                             // obj.customizeButtons.color = q.customizeButtons.color
        //                             await obj.save()
        //                         }
        //                     }
        //                 )
        //                 // res.status(200).send(
        //                 //     {
        //                 //         customobject: obj
        //                 //     }
        //                 // )
        //             }
        //             else{
        //                 errHandler(res)
        //             }
        //         }
        //         else{
        //             errHandler(res)
        //         }
        //     }
        // ).catch(
        //     (err)=>{
        //         console.log(err)
        //         errHandler(res)
        //     }
        // )
    }
}