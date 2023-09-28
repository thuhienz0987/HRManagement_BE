import BadRequestError from '../errors/badRequestError.js';
import NotFoundError from '../errors/notFoundError.js';
import Comment from '../models/Comment.js';

const getComments = async (req,res) => {
    try{
        const comment = await Comment.find({isDeleted: false})
        if(!comment) {
            throw new NotFoundError('Not found any comment')
        }
        res.status(200).json(comment);
    }catch(err){
        throw err
    }
};

const getComment = async (req,res) =>{
    const {id} = req.params;
    try{
        const comment = await Comment.findById(id)
        if (comment && comment.isDeleted === false) {
            res.status(200).json(comment);
          } else if (comment && comment.isDeleted === true) {
            res.status(410).send("Comment is deleted");
          } else {
            throw new NotFoundError("Comment not found");
          }
    }catch(err){
        throw err
    }
};
const getCommentsByUserId = async (req,res) =>{
    const {userId} = req.params;
    try{
        const comment = await Comment.findOne({userId: userId})
        if (comment && comment.isDeleted === false) {
            res.status(200).json(comment);
        } else if (comment && comment.isDeleted === true) {
        res.status(410).send("Comment is deleted");
        } else {
        throw new NotFoundError("Comment not found");
        }
    }catch(err){
        throw err
    }
};

const postComment = async (req,res) =>{
    const {rate, comment, userId} = req.body;
    try{
        const commentExist = await Comment.findOne({userId}); 
        const currentDate = new Date();  
        if(commentExist && (currentDate.getFullYear() > commentExist.createdAt.getFullYear()
        || (currentDate.getFullYear() === commentExist.createdAt.getFullYear() 
            && currentDate.getMonth() >= commentExist.createdAt.getMonth())))
        {
            throw new BadRequestError
            (`The employee with the given ${commentExist.userId} was commented in ${commentExist.createdAt.getMonth()} ${commentExist.createdAt.getFullYear()}.`)
        }
        else if (!commentExist){
            const newComment = new Comment({rate, comment, userId});
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

const updateComment = async (req,res) => {
    const {id}= req.params;
    const {rate, comment, userId} = req.body;
    const commentExist = await Comment.findById(id);
    if(!commentExist) {
        throw new NotFoundError('Not found Comment');
    }
    else{
        commentExist.rate = rate||commentExist.rate;
        commentExist.comment = comment||commentExist.comment;
        commentExist.userId = userId||commentExist.userId;
    }
    try{
        const updateComment = await commentExist.save();
        res.status(200).json(updateComment)
    }
    catch(err){
        throw err
    }
};

const deleteComment = async (req,res) => {
    const {id} = req.params;
    try{
        const commentExist = await Comment.findByIdAndUpdate(id,{ isDeleted: true},{new: true});
        res.status(200).json({
            message: 'Deleted Comment successfully',
            comment: commentExist,
        })
    }
    catch(err){
        throw err
    }
}

export {getComments,getComment,getCommentsByUserId,postComment,updateComment,deleteComment}