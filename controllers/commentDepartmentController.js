import BadRequestError from '../errors/badRequestError.js';
import NotFoundError from '../errors/notFoundError.js';
import Department from '../models/Department.js';
import CommentDepartment from '../models/CommentDepartment.js';

const getCommentDepartments = async (req,res) => {
    try{
        const commentDepartment = await CommentDepartment.find({isDeleted: false})
        if(!commentDepartment) {
            throw new NotFoundError('Not found any comment')
        }
        res.status(200).json(commentDepartment);
    }catch(err){
        throw err
    }
};

const getCommentDepartment = async (req,res) =>{
   try {
        const _id = req.params._id;
        const department = Department.findById(_id);
        if (!department)
            throw new NotFoundError(
            `The comments with department _id ${_id} does not exists`
            );
        else if (department.isDeleted === true) {
            res.status(410).send("Department is deleted");
        } else {
            const commentDepartments = await CommentDepartment.find({ departmentId: _id , isDeleted: false});
            if (commentDepartments.length === 0)
            throw new NotFoundError(`Not found comments in department id ${_id}`);

            res.status(200).json(commentDepartments);
        }
    } catch (err) {
        throw err;
    }
};

const postCommentDepartment = async (req,res) =>{
    const {rate, comment, departmentId} = req.body;
    try{
        const commentExist = await CommentDepartment.findOne({departmentId}); 
        const currentDate = new Date();  
        if(commentExist && (currentDate.getFullYear() > commentExist.createdAt.getFullYear()
        || (currentDate.getFullYear() === commentExist.createdAt.getFullYear() 
            && currentDate.getMonth() >= (commentExist.createdAt.getMonth()+1))))
        {
            throw new BadRequestError
            (`The Department with the given ${commentExist.departmentId} was commented in ${commentExist.createdAt.getMonth()+1}/${commentExist.createdAt.getFullYear()}.`)
        }
        else if (!commentExist){
            const newComment = new CommentDepartment({rate, comment, departmentId});
            await newComment.save()
                res.status(200).json({
                    message: 'Create Comment successfully',
                    comment: newComment,
                })
        }
        
    }catch(err){
        throw err;
    }
};

const updateCommentDepartment = async (req,res) => {
    const {_id}= req.params;
    const {rate, comment, departmentId} = req.body;
    const commentExist = await CommentDepartment.findById(_id);
    if(!commentExist) {
        throw new NotFoundError('Not found Comment');
    }
    else{
        commentExist.rate = rate||commentExist.rate;
        commentExist.comment = comment||commentExist.comment;
        commentExist.departmentId = departmentId||commentExist.departmentId;
    }
    try{
        const updateComment = await commentExist.save();
        res.status(200).json(updateComment)
    }
    catch(err){
        throw err
    }
};

const deleteCommentDepartment = async (req,res) => {
    const {_id} = req.params;
    try{
        const commentExist = await CommentDepartment.findByIdAndUpdate(_id,{ isDeleted: true},{new: true});
        res.status(200).json({
            message: 'Deleted Comment successfully',
            comment: commentExist,
        })
    }
    catch(err){
        throw err
    }
}

export {getCommentDepartments,getCommentDepartment,postCommentDepartment,updateCommentDepartment,deleteCommentDepartment}