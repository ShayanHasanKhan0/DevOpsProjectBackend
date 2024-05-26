const userForm = require('../models/userForm.js');

/* Functions */
function validateId(id){
    if(id && (/^[a-f\d]{24}$/.test(id)) && (id.length===24)){
        return true
    }
    return false
}

function getId(name, type){
    if(type==="product"){
        tempArr = (name).split('-');
        name = tempArr[tempArr.length-1]
        type = "option"
    }
    if(type==="option"){
        tempArr = (name).split('.');
        return tempArr[0]
    }
}

/* Exports */
module.exports.option = {
    post: async (req, res, next) => {
        if(req.file){
            console.log("hitting image post")
            const uID = req.user._id.toString();
            const q = req.body.question;
            const id = getId(req.file.filename, "option")

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
                            selectImagePath: req.file.path,
                            selectImageName: req.file.originalname,
                            rangeFrom: q.rangeFrom,
                            rangeTo: q.rangeTo,
                            selectText: q.selectText,
                            userInput: q.userInput,
        
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
                            _id: id,
    
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
        }
        else{
            res.status(200).send(
                {
                    msg: "Please upload from only JPEG,JPG,SVG,PNG files"
                }    
            ) 
        }
    },
    patch: async (req, res, next) => {
        const uID = req.user._id.toString();
        const q = req.params.id;

        if(validateId(uID) && validateId(q)){
            await userForm.findOne({ "userId": uID }).then(
                async (object)=>{
                    if(object.questions){
                        let list = [];
                        var found = false;
                        object.questions.filter(
                            (obj)=>{
                                if(obj._id.toString()===q){
                                    obj.selectImagePath = req.file.path,
                                    obj.selectImageName = req.file.originalname,
                                    list.push(obj)
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

        res.status(200).send()
    }
}

module.exports.product = {
    post: async (req, res, next) => {
        if(req.file){
            const userId = req.user._id.toString();
            const questionId = req.params.id.toString()
            const product = req.body.product
            const id = getId(req.file.filename, "product")
    
            const newProductObject = {
                title: product.title,
                description: product.description,
                imageName: req.file.originalname,
                imagePath: req.file.path,
                link: product.link,
                href: product.href,
                _id: id
            }

            if(validateId(userId) && validateId(questionId)){
                await userForm.findOne({ "userId": userId }).then(
                    async (object)=>{
                        if(object.questions){
                            let list = [];
                            var found = false;
                            object.questions.filter(
                                (obj)=>{
                                    if(obj._id.toString() === questionId){
                                        obj.products.push(newProductObject)
                                        list.push(obj)
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
                                        console.log("post succ")
                                        res.status(200).send(
                                            {
                                                _id: questionId
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
            res.status(200).send(
                {
                    msg: "Please upload from only JPEG,JPG,SVG,PNG files"
                }    
            ) 
        }
},


















    patch: async (req, res, next) => {
        if(req.file){
            res.status(200).send(
                {
                    path: req.file.path,
                    name: req.file.originalname
                }    
            )
        }
        else{
            res.status(200).send(
                {
                    msg: "Please upload from only JPEG,JPG,SVG,PNG files"
                }    
            ) 
        }
    }
}