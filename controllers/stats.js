/* Model Imports */
const userForm = require('../models/userForm.js');
// const mongoose = require('mongoose');

/* Functions */
function validateId(id){
    if(id && (/^[a-f\d]{24}$/.test(id)) && (id.length===24)){
        return true
    }
    return false
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
    console.log("getlist succ")
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

/* Exports */
module.exports = {
    get: async (req, res) => {
        console.log("Get Initialise")
        const userId = req.user._id.toString();
        const rootId = req.params.rootId.toString();
        if(userId && rootId){
            // let list1 = [];
            const responseObject = await generateResponse(userId, rootId, null, "initialise")
            console.log("Get Initialise Succ")

            arrayofobj = responseObject;

            let objsend = {
                list: [],
                node: {}
            };

            // for root node
            let rootnode = arrayofobj.node;

            let sumofchildrencount = 0;
            let sumofProductcount = 0;
            arrayofobj.list.forEach(function (objectloop) {
                if(objectloop.parentId===rootnode._id){
                    sumofchildrencount = sumofchildrencount + objectloop.count;
                }
                // if(rootnode._id===rootId) {
                    if(objectloop.componentType=='Product' && (objectloop.rootId===rootId || objectloop._id===rootId)){
                        sumofProductcount = sumofProductcount + objectloop.count;
                    }
                // }
            })
            let dropoff,dropoffpercent = null;
            let childrenpercent = [];
            // dropoff
            if(rootnode.componentType=='Question'){
                dropoff = rootnode.count - sumofchildrencount;
            // dropoff %
                if(rootnode.count!=0)
                dropoffpercent = (100*dropoff)/rootnode.count;
            // % of children
                let percent = null;
                arrayofobj.list.forEach(function (childrenloop) {
                        if((childrenloop.rootId===rootId || childrenloop._id===rootId) && childrenloop.parentId==rootnode._id){
                            if(rootnode.count!=0){
                                percent = (100*childrenloop.count)/rootnode.count;
                                childrenpercent.push(percent)
                            } else {
                                childrenpercent.push(0)
                            }
                        }
                    }
                )
            }
            // completion
            let completion = sumofProductcount;
            // completion %
            let completionpercent = 0;
            if(rootnode.count!=0){
                completionpercent = (100*sumofProductcount)/rootnode.count;
            }
            
            // Overall dropoff
            overalldropoff = rootnode.count - sumofProductcount;
            // Overall dropoff %
            let overalldropoffpercentage = 0;
            if(rootnode.count!=0){
                overalldropoffpercentage = (100*overalldropoff)/rootnode.count;
            }
            objpushroot = {
                rootId: rootnode.rootId,
                parentId: rootnode.parentId,
                level: rootnode.level,
                count: rootnode.count,
                hasChild: rootnode.hasChild,
                componentType: rootnode.componentType,
                dropoff: dropoff,
                dropoffpercent: dropoffpercent,
                overalldropoff: overalldropoff,
                overalldropoffpercentage: overalldropoffpercentage,
                completion: completion,
                completionpercent: completionpercent,
                childrenpercentage: childrenpercent,
                _id: rootnode._id
            }
            objsend.node = objpushroot

            // !!!!isme root node nhi he
            arrayofobj.list.forEach(function (obj) {
                // isme saare nodes(including root node ki calculate horhi)
                if(obj.rootId===rootId || obj._id===rootId){
                    // dropoff
                    let sumofchildrencount = 0;
                    let sumofProductcount = 0;
                    arrayofobj.list.forEach(function (objectloop) {
                        if(objectloop.parentId===obj._id){
                            sumofchildrencount = sumofchildrencount + objectloop.count;
                        }
                        if(obj._id===rootId) {
                            if(objectloop.componentType=='Product' && (objectloop.rootId===rootId || objectloop._id===rootId)){
                                sumofProductcount = sumofProductcount + objectloop.count;
                            }
                        }
                    })
                    let dropoff,dropoffpercent = null;
                    let childrenpercent = [];
                    if(obj.componentType=='Question'){
                        dropoff = obj.count - sumofchildrencount;
                    // dropoff %
                        if(obj.count!=0)
                        dropoffpercent = (100*dropoff)/obj.count;
                    // % of children
                        let percent = null;
                        arrayofobj.list.forEach(function (childrenloop) {
                                if((childrenloop.rootId===rootId || childrenloop._id===rootId) && childrenloop.parentId==obj._id){
                                    if(rootnode.count!=0){
                                        percent = (100*childrenloop.count)/obj.count;
                                        childrenpercent.push(percent)
                                    } else {
                                        childrenpercent.push(0)
                                    }
                                }
                            }
                        )
                    }
                    // // isme (agar root node he tou ye additional properties use hongi)
                    // if(obj._id===rootId){
                    //     // completion
                    //     let completion = sumofProductcount;
                    //     // completion %
                    //     let completionpercent = (100*sumofProductcount)/obj.count;
                    //     // Overall dropoff
                    //     overalldropoff = obj.count - sumofProductcount;
                    //     // Overall dropoff %
                    //     let overalldropoffpercentage = (100*overalldropoff)/obj.count;
                    //     objpush = {
                    //         rootId: obj.rootId,
                    //         parentId: obj.parentId,
                    //         level: obj.level,
                    //         count: obj.count,
                    //         hasChild: obj.hasChild,
                    //         componentType: obj.componentType,
                    //         dropoff: dropoff,
                    //         dropoffpercent: dropoffpercent,
                    //         overalldropoff: overalldropoff,
                    //         overalldropoffpercentage: overalldropoffpercentage,
                    //         completion: completion,
                    //         completionpercent: completionpercent,
                    //         childrenpercentage: childrenpercent,
                    //         _id: obj._id
                    //     }
                    // } else {
                    objpush = {
                        rootId: obj.rootId,
                        parentId: obj.parentId,
                        level: obj.level,
                        count: obj.count,
                        hasChild: obj.hasChild,
                        componentType: obj.componentType,
                        dropoff: dropoff,
                        dropoffpercent: dropoffpercent,
                        childrenpercentage: childrenpercent,
                        _id: obj._id
                    }
                    // }
                    objsend.list.push(objpush)
                }
            });
            // console.log(objsend)
            // let objsend = {
            //     list: [list1],
            //     node: arrayofobj.node
            // }
            // console.log(objsend)
            res.status(200).send(objsend)
        }
        else{
            BR(res)
        }       
    }
    //////////////////////////////////////ks
    // get: async (req, res, next) => {
    //     // returns all data
    //     // Getlist ki jga getstats krega jisme getlist+stats honge
    //     console.log("hitting get of stats")
    //     const uID = req.user._id.toString();
    //     const rootID = req.params.id;        
    //     if(rootID && validateId(uID) && validateId(rootID)){
    //         await userForm.findOne({ "userId": uID}).then(
    //             (object)=>{
    //                 if(object.questions){
    //                     let list = [];
    //                     // looping
    //                     object.questions.filter(
    //                         (obj)=>{
    //                             // myyyy (isme obj.root===rootID ki zrurat nhi 'ab')

    //                             // isme saare nodes(including root node ki calculate horhi)
    //                             if(obj.root===rootID || obj._id===rootID){
    //                                 // dropoff
    //                                 let sumofchildrencount = 0;
    //                                 let sumofProductcount = 0;
    //                                 object.questions.filter((objectloop)=>{
    //                                     if(objectloop.parent===obj._id){
    //                                         sumofchildrencount = sumofchildrencount + objectloop.count;
    //                                     }
    //                                     if(obj._id===rootID) {
    //                                         if(objectloop.selectComponentType=='Product' && (objectloop.root===rootID || objectloop._id===rootID)){
    //                                             sumofProductcount = sumofProductcount + objectloop.count;
    //                                         }
    //                                     }
    //                                 })
    //                                 let dropoff,dropoffpercent = null;
    //                                 let childrenpercent = [];
    //                                 if(obj.selectComponentType=='Question'){
    //                                     dropoff = obj.count - sumofchildrencount;
    //                                 // dropoff %
    //                                     dropoffpercent = (100*dropoff)/obj.count;
    //                                 // % of children
    //                                     let percent = null;
    //                                     object.questions.filter(
    //                                         (childrenloop)=>{
    //                                             if((childrenloop.root===rootID || childrenloop._id===rootID) && childrenloop.parent==obj._id){
    //                                                 percent = (100*childrenloop.count)/obj.count;
    //                                                 childrenpercent.push(percent)
    //                                             }
    //                                         }
    //                                     )
    //                                 }
    //                                 // isme (agar root node he tou ye additional properties use hongi)
    //                                 if(obj._id ===rootID){
    //                                     // completion
    //                                     let completion = sumofProductcount;
    //                                     // completion %
    //                                     let completionpercent = (100*sumofProductcount)/obj.count;
    //                                     // Overall dropoff
    //                                     overalldropoff = obj.count - sumofProductcount;
    //                                     // Overall dropoff %
    //                                     let overalldropoffpercentage = (100*overalldropoff)/obj.count;
    //                                     objpush = {
    //                                         root: obj.root,
    //                                         parent: obj.parent,
    //                                         level: obj.level,
    //                                         count: obj.count,
    //                                         hasChild: obj.hasChild,
    //                                         selectComponentType: obj.selectComponentType,
    //                                         dropoff: dropoff,
    //                                         dropoffpercent: dropoffpercent,
    //                                         overalldropoff: overalldropoff,
    //                                         overalldropoffpercentage: overalldropoffpercentage,
    //                                         completion: completion,
    //                                         completionpercent: completionpercent,
    //                                         childrenpercentage: childrenpercent,
    //                                         _id: obj._id
    //                                     }
    //                                 } else {
    //                                     objpush = {
    //                                         root: obj.root,
    //                                         parent: obj.parent,
    //                                         level: obj.level,
    //                                         count: obj.count,
    //                                         hasChild: obj.hasChild,
    //                                         selectComponentType: obj.selectComponentType,
    //                                         dropoff: dropoff,
    //                                         dropoffpercent: dropoffpercent,
    //                                         childrenpercentage: childrenpercent,
    //                                         _id: obj._id
    //                                     }
    //                                 }
    //                                 list.push(objpush)
    //                             }
    //                         }
    //                     )
    //                     console.log("get succ")
    //                     res.status(200).send(list) /* returns list of all childrens having para root node */
    //                 }
    //                 else{
    //                     console.log("get 2")
    //                     res.status(400).send("Bad Request")
    //                 }
    //             }
    //         ).catch(next)
    //     }
    //     else{
    //         console.log("get 1")
    //         res.status(400).send("Bad Request")
    //     }
    // },
}