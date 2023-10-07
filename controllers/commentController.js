import BadRequestError from '../errors/badRequestError.js';
import NotFoundError from '../errors/notFoundError.js';
import Comment from '../models/Comment.js';
import User from '../models/User.js';

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
    const {_id} = req.params;
    try{
        const comment = await Comment.findById(_id)
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
    try {
        const _id = req.params._id;
        const user = User.findById(_id);
        if (!user)
            throw new NotFoundError(
            `The comments with user _id ${_id} does not exists`
            );
        else if (user.isDeleted === true) {
            res.status(410).send("User is deleted");
        } else {
            const comments = await Comment.find({ userId: _id , isDeleted: false});
            if (comments.length === 0)
            throw new NotFoundError(`Not found comments in user id ${_id}`);

            res.status(200).json(comments);
        }
    } catch (err) {
        throw err;
    }
};

const postComment = async (req,res) =>{
    const {rate, comment, userId} = req.body;
    try{
        const commentExist = await Comment.findOne({userId}); 
        const currentDate = new Date();  
        if(commentExist && (currentDate.getFullYear() > commentExist.createdAt.getFullYear()
        || (currentDate.getFullYear() === commentExist.createdAt.getFullYear() 
            && currentDate.getMonth() >= (commentExist.createdAt.getMonth()+1))))
        {
            throw new BadRequestError
            (`The employee with the given ${commentExist.userId} was commented in ${commentExist.createdAt.getMonth()+1}/${commentExist.createdAt.getFullYear()}.`)
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
    const {_id}= req.params;
    const {rate, comment, userId} = req.body;
    const commentExist = await Comment.findById(_id);
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
    const {_id} = req.params;
    try{
        const commentExist = await Comment.findByIdAndUpdate(_id,{ isDeleted: true},{new: true});
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