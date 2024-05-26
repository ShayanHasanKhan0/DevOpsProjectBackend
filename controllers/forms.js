/* Model Imports */
const userForm = require('../models/userForm.js');
const mongoose = require('mongoose');

/* Functions */
/* ummah */
function getId(name, type){
    let temp = [];
    if(type==="product"){
        temp = (name).split('-');
        name = temp[1]
        type = "option"
    }
    if(type==="option"){
        temp = (name).split('.');
    }
    return temp[0]
}

/* ummah */
async function getNode(userId, nodeId){
    let temp = {}
    await userForm.findOne(
        {
            "userId": userId,
        }
    ).select({ questions: { $elemMatch: { _id: nodeId }}}).then(
        (object) => {
            if(object.questions){
                temp = object.questions[0]
            }
        }
    )
    return temp
}

/* ummah */
async function getList(userId, rootId){
    let list = []
    await userForm.aggregate([
        { $match: { "userId": userId } },
        { $unwind: "$questions" },
        { $match: { "questions.rootId": rootId } },
    ]).then(
        (object) => {
            object.filter(
                (obj) => {
                    if(obj.questions){
                        list.push(obj.questions)
                    }
                }
            )
        }
    )
    return list
}

/* ummah */
function getPrevious(list, nodeId, parentId){
    let count;
    for (let index = 0; index < list.length; index++) {
        if(list[index].parentId === parentId){
            if(list[index]._id.toString() === nodeId){
                break
            }
            else{
                count = index
            }
        }
    }
    if(count || count === 0){
        return list[count]
    }
    return null
}

/* ummah */
async function hasChildren(userId, parentId){
    let temp = false
    await userForm.findOne(
        {
            "userId": userId,
            "questions.parent": parentId
        }
    ).select({ questions: { $elemMatch: { parentId: parentId }}}).then(
        (object) => {
            if(object.questions.length){
                temp = true
            }
        }
    )
    return temp
}

/* ummah */
async function insertNode(userId, node, editHasChild, res, next){
    if(node.parentId && node.rootId){
        await userForm.updateOne(
            { userId: userId },
            { $push: { questions: node } },
            { runValidators: true }
        ).then(
            async () => {
                let responseObject = {};
                if(editHasChild === "true"){
                    await userForm.updateOne(
                        {
                            "userId": userId,
                            "questions._id": node.parentId
                        },
                        {
                            $set: {
                                "questions.$.hasChild": true,
                            }
                        },
                        { runValidators: true }
                    ).then(
                        async () => {                            
                            responseObject = await generateResponse(userId, node.parentId, node._id.toString(), "both")
                            res.status(200).send(responseObject)
                        }
                    ).catch(next)
                }
                else{
                    responseObject = await generateResponse(userId, node._id.toString(), null, "child");
                    res.status(200).send(responseObject)
                }
            }
        ).catch(next)
    }
    else{BR(res)}
}

/* ummah */
let tree = []
function loadChildrenIntoArray(list, nodeId){
    for (let index = 0; index < list.length; index++){
        if(list[index].parentId === nodeId){
            const temp = list[index]._id.toString()
            tree.push(temp)
            list.splice(index, 1)
            loadChildrenIntoArray(list, temp)
            index -= 1
        }
    }
}

/* ummah */
async function deleteFromArray(userId, array){
    await userForm.updateOne(
        { userId: userId },
        { $pull: { questions: { _id: { $in: array } } } }
    ).then(
        () => {
            tree = []
        }
    )
}

/* ummah */
async function generateResponse(userId, id1, id2, type){
    let temp = {};
    if(type === "both"){
        temp.node = await getNode(userId, id1)
        temp.child = await getNode(userId, id2)
    }
    if(type === "node" || type === "child"){
        temp[type] = await getNode(userId, id1)
    }
    if(type === "list"){
        temp.list = await getList(userId, id1)
    }
    if(type === "initialise"){
        temp.list = await getList(userId, id1)
        temp.node = await getNode(userId, id1)
    }
    if(type === "siblings"){
        temp.node = await getNode(userId, id1)
        temp.extra = await getNode(userId, id2)  
    }
    return temp
}

/* ummah */
async function SWW(res){
    res.status(200).send(
        {
            msg: "Something went wrong!"
        }
    )
}

/* ummah */
async function BR(res){
    res.status(400).send(
        {
            msg: "Bad Request"
        }
    )
}

/* Exports */
module.exports.get = {

    /* ummah */
    initialise: async (req, res) => {
        console.log("Get Initialise")
        const userId = req.user._id.toString();
        const rootId = req.params.rootId.toString();
        if(userId && rootId){
            const responseObject = await generateResponse(userId, rootId, null, "initialise")
            console.log("Get Initialise Succ")
            res.status(200).send(responseObject)
        }
        else{
            BR(res)
        }       
    },

    /* ummah */
    roots: async (req, res) => {
        console.log("Get List")
        const userId = req.user._id.toString();

        if(userId){
            const responseObject = await generateResponse(userId, userId, null, "list")
            console.log("Get List Succ")
            res.status(200).send(responseObject)
        }
        else{
            BR(res)
        }        
    },

    /* ummah */ 
    /* Isnt being used rn */
    // node: async (req, res) => {
    //     console.log("Get Node")
    //     const userId = req.user._id.toString();
    //     const nodeId = req.params.nodeId.toString();
    //     if(userId && nodeId){
    //         const responseObject = await generateResponse(userId, nodeId, null, "node")
    //         console.log("Get Node Succ")
    //         res.status(200).send(responseObject)
    //     }
    //     else{
    //         BR(res)
    //     }    
    // }

}

module.exports.add = {
    /* ummah */
    node: async(req, res, next) => {
        console.log("Add Node")
        const userId = req.user._id.toString();
        const node = req.body.node;
        const editHasChild = req.params.editHasChild;

        if(userId && editHasChild){
            const newNodeObject = {
                question: "",
                componentType: "Question",
                questionType: "User Input",                
                userInput: "Name",
                hasChild: false,
                count: 0,
                _id: mongoose.Types.ObjectId(),
            }
            if(node){
                newNodeObject.parentId = node.parentId
                newNodeObject.rootId = node.rootId
                newNodeObject.level = node.level
                newNodeObject.rangeFrom = node.rangeFrom
                newNodeObject.rangeTo = node.rangeTo
                newNodeObject.selectText = node.selectText
            }
            else{
                newNodeObject.name = "New chart"
                newNodeObject.parentId = userId
                newNodeObject.rootId = userId
                newNodeObject.level = 0
            }
            console.log("Add Node Succ")
            await insertNode(userId, newNodeObject, editHasChild, res, next)
        }
        else{
            BR(res)
        }
    },
    /* ummah */
    imageNode: async (req, res, next) => {
        if(req.file){
            console.log("Add Image Node")
            const userId = req.user._id.toString();
            const node = req.body.question;
            const editHasChild = req.params.editHasChild;
            const nodeId = getId(req.file.filename, "option")

            if(userId && node && nodeId && editHasChild){
                const newNodeObject = {
                    parentId: node.parentId,
                    rootId: node.rootId,
                    level: node.level,
                    question: "",
                    componentType: "Question",
                    questionType: "User Input", 
                    selectImagePath: req.file.path,
                    selectImageName: req.file.originalname,
                    rangeFrom: node.rangeFrom,
                    rangeTo: node.rangeTo,
                    selectText: node.selectText,
                    userInput: "Name",
                    hasChild: false,
                    count: 0,
                    _id: nodeId,
                }
                console.log("Add Image Node Succ")
                await insertNode(userId, newNodeObject, editHasChild, res, next)
            }
            else{BR(res)}
        }
        else{
            res.status(200).send(
                {
                    msg: "Please upload from only JPEG,JPG,SVG,PNG files"
                }    
            ) 
        }
    },
    /* ummah */
    product: async(req, res, next) => {
        console.log("Add Product")
        if(req.file){
            const userId = req.user._id.toString();
            const rootId = req.params.rootId.toString()
            const nodeId = req.params.nodeId.toString()
            const product = req.body.product
            const productId = getId(req.file.filename, "product")

            if(userId && rootId && nodeId && product && productId){
                const newProductObject = {
                    title: product.title,
                    description: product.description,
                    imageName: req.file.originalname,
                    imagePath: req.file.path,
                    link: product.link,
                    href: product.href,
                    _id: productId
                }
                await userForm.updateOne(
                    {
                        "userId": userId,
                        "questions._id": nodeId
                    },
                    {
                        $push: {
                            "questions.$.products": newProductObject
                        }
                    },
                    { runValidators: true }
                ).then(
                    async () => {
                        const responseObject = await generateResponse(userId, nodeId, null, "node")
                        console.log("Add Product Succ")
                        res.status(200).send(responseObject)
                    }
                ).catch(next)
            }
            else{
                BR(res)
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
}

module.exports.update = {
    /* ummah */
    node: async(req, res, next) => {
        console.log("Update Node")
        const userId = req.user._id.toString();
        const node = req.body.node;
        const type = req.params.type;
        if(userId && node && type){
            if((node[type] || node[type] === 0) && node._id && node.rootId){
                let changes = { $set: {}, $unset: {} }
                changes.$set["questions.$." + type] = node[type]                
                if(type === "componentType" || type === "questionType"){
                    changes.$set["questions.$.hasChild"] = false
                    if(type === "componentType"){
                        if(node[type] === "Question"){
                            changes.$set["questions.$.question"] = ""
                            changes.$set["questions.$.questionType"] = "User Input"
                            changes.$set["questions.$.userInput"] = "Name";
                        }
                        else{
                            changes.$unset["questions.$.question"] = "";
                            changes.$unset["questions.$.questionType"] = "";
                            changes.$unset["questions.$.userInput"] = "";
                        }
                        if(node[type] === "Product"){
                            changes.$set["questions.$.products"] = []
                        }
                        else{
                            changes.$unset["questions.$.products"] = "";
                        }
                    }
                    else if(type === "questionType"){
                        if(node[type] === "User Input"){
                            changes.$set["questions.$.userInput"] = "Name"
                        }
                        else{
                            changes.$unset["questions.$.userInput"] = "";
                        }
                    }
                    await userForm.updateOne(
                        {
                            "userId": userId,
                            "questions._id": node._id.toString()
                        },
                        changes,
                        { runValidators: true }
                    ).then(
                        async () => {
                            if(node.rootId === userId){
                                loadChildrenIntoArray(await getList(userId, node._id.toString()), node._id.toString())
                            }
                            else{
                                loadChildrenIntoArray(await getList(userId, node.rootId), node._id.toString())
                            }
                            await deleteFromArray(userId, tree).then(
                                async () => {                                    
                                    const responseObject = await generateResponse(userId, node._id.toString(), null, "node") /* children are being deleted */
                                    console.log("Update Node Succ")
                                    res.status(200).send(responseObject)
                                }
                            )
                        }
                    ).catch(next)
                }
                else{
                    delete changes["$unset"]
                    if(type === "rangeFrom" || type === "rangeTo"){
                        await userForm.updateOne(
                            {
                                "userId": userId,
                                "questions._id": node._id.toString()
                            },
                            changes,
                            { runValidators: true }
                        ).then(
                            async () => {
                                let temp = "";
                                if(node.rangeTo && node.prev){
                                    changes = { $set: { "questions.$.rangeTo": node.rangeTo }}
                                    temp = node.prev
                                }
                                else if(node.rangeFrom && node.next){
                                    changes = { $set: { "questions.$.rangeFrom": node.rangeFrom }}
                                    temp = node.next
                                }
                                else{
                                    const responseObject = await generateResponse(userId, node._id.toString(), null, "node")
                                    console.log("Update Node Succ")
                                    res.status(200).send(responseObject)
                                    return
                                }
                                await userForm.updateOne(
                                    {
                                        "userId": userId,
                                        "questions._id": temp.toString()
                                    },
                                    changes,
                                    { runValidators: true }
                                ).then(
                                    async () => {
                                        const responseObject = await generateResponse(userId, node._id.toString(), temp.toString(), "siblings")
                                        console.log("Update Node Succ")
                                        res.status(200).send(responseObject)
                                    }
                                ).catch(next)
                            }
                        )
                    }
                    else{
                        await userForm.updateOne(
                            {
                                "userId": userId,
                                "questions._id": node._id
                            },
                            changes,
                            { runValidators: true }
                        ).then(
                            async () => {
                                const responseObject = await generateResponse(userId, node._id.toString(), null,  "node")
                                console.log("Update Node Succ")
                                res.status(200).send(responseObject)
                            }
                        ).catch(next)
                    }
                }
            }
            else{
                BR(res)
            }
        }
        else{
            BR(res)
        }
    },

    /* ummah */
    imageNode: async(req, res, next) => {
        console.log("Updaating Image Node")
        if(req.file){
            const userId = req.user._id.toString();
            const rootId = req.params.rootId;
            const nodeId = req.params.nodeId;

            if(userId && rootId && nodeId){
                await userForm.updateOne(
                    {
                        "userId": userId,
                        "questions._id": nodeId
                    },
                    {
                        $set: {
                            "questions.$.selectImageName": req.file.originalname,
                            "questions.$.selectImagePath": req.file.path
                        }
                    },
                    { runValidators: true }
                ).then(
                    async () => {
                        const responseObject = await generateResponse(userId, nodeId, null, "node")
                        console.log("Updating Image Node Succ")
                        res.status(200).send(responseObject)
                    }
                ).catch(next)
            }
            else{BR(res)}
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

module.exports.delete = {
    /* ummah */
    node: async(req, res, next) => {
        console.log("Deleting Node")
        const userId = req.user._id.toString();
        const rootId = req.params.rootId.toString();
        const parentId = req.params.parentId.toString();
        const nodeId = req.params.nodeId.toString();
        const isRange = req.params.isRange.toString();

        if(userId && nodeId && rootId){
            let temp = await getList(userId, rootId)
            let temp2;
            let temp3 = true;
            if(isRange === "true"){
                let previous = getPrevious(temp, nodeId, parentId)
                if(previous){
                    temp2 = previous._id.toString()
                    let current = await getNode(userId, nodeId)
                    if(current.rangeTo || current.rangeTo === 0){
                        await userForm.updateOne(
                            {
                                "userId": userId,
                                "questions._id": temp2
                            },
                            {
                                $set: {
                                    "questions.$.rangeTo": current.rangeTo,
                                }
                            },
                            { runValidators: true }
                        )
                    }
                }
            }
            tree.push(nodeId)
            loadChildrenIntoArray(temp, nodeId)
            await deleteFromArray(userId, tree).then(
                async () => {
                    let responseObject;
                    if(userId !== parentId){
                        if(!(await hasChildren(userId, parentId))){
                            await userForm.updateOne(
                                {
                                    "userId": userId,
                                    "questions._id": parentId
                                },
                                {
                                    $set: {
                                        "questions.$.hasChild": false,
                                    }
                                },
                                { runValidators: true }
                            ).catch(next)
                        }
                        else{
                            temp3 = false
                        }
                        if(temp2){
                            responseObject = await generateResponse(userId, temp2, null, "node")
                        }
                        else if(temp3){
                            responseObject = await generateResponse(userId, parentId, null, "node")
                        }
                        else{
                            responseObject = await generateResponse(null, null, null, null)
                        }
                    }
                    else{
                        responseObject = await generateResponse(null, null, null, null)
                    }
                    console.log("Deleting Node Succ")
                    res.status(200).send(responseObject)
                }
            )
        }
    },

    /* ummah */
    product: async(req, res, next) => {
        console.log("Deleting Product")
        const userId = req.user._id.toString();
        const nodeId = req.params.nodeId.toString()
        const productId = req.params.productId.toString()

        await userForm.findOneAndUpdate(
            {
                "userId": userId,
                "questions._id": nodeId
            },
            {
                $pull: {
                    "questions.$.products": { _id: productId }
                }
            },
            { runValidators: true }
        ).then(
            async () => {
                const responseObject = await generateResponse(userId, nodeId, null, "node")
                console.log("Deleting Product Succ")
                res.status(200).send(responseObject)
            }
        ).catch(next)
    }
}