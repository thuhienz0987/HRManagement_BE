import BadRequestError from '../errors/badRequestError.js';
import NotFoundError from '../errors/notFoundError.js';
import Team from '../models/Team.js';
import Department from '../models/Department.js';
import CommentTeam from '../models/CommentTeam.js';

const getCommentTeams = async (req,res) => {
    try{
        const commentTeam = await CommentTeam.find({isDeleted: false})
        if(!commentTeam) {
            throw new NotFoundError('Not found any comment')
        }
        res.status(200).json(commentTeam);
    }catch(err){
        throw err
    }
};

const getCommentTeam = async (req,res) =>{
    const {_id} = req.params;
    try{
        const commentTeam = await CommentTeam.findById(_id)
        if (commentTeam && commentTeam.isDeleted === false) {
            res.status(200).json(commentTeam);
          } else if (commentTeam && commentTeam.isDeleted === true) {
            res.status(410).send("Comment is deleted");
          } else {
            throw new NotFoundError("Comment not found");
          }
    }catch(err){
        throw err
    }
};
const getCommentTeamsByDepartmentId = async (req,res) =>{
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
            const teams = await Team.find({ departmentId: _id , isDeleted: false});
            const commentTeams = [];
            teams.map(async (team) => {
                commentTeams = [...await CommentTeam.find({ teamId: team._id , isDeleted: false})];
            });
            
            if (commentTeams.length === 0)
                throw new NotFoundError(`Not found comments in department id ${_id}`);

            res.status(200).json(commentTeams);
        }
    } catch (err) {
        throw err;
    }
};

const postCommentTeam = async (req,res) =>{
    const {rate, comment, teamId} = req.body;
    try{
        const commentExist = await CommentTeam.findOne({teamId}); 
        const currentDate = new Date();  
        if(commentExist && (currentDate.getFullYear() > commentExist.createdAt.getFullYear()
        || (currentDate.getFullYear() === commentExist.createdAt.getFullYear() 
            && currentDate.getMonth() >= (commentExist.createdAt.getMonth()+1))))
        {
            throw new BadRequestError
            (`The Team with the given ${commentExist.teamId} was commented in ${commentExist.createdAt.getMonth()+1}/${commentExist.createdAt.getFullYear()}.`)
        }
        else if (!commentExist){
            const newComment = new CommentTeam({rate, comment, teamId});
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

const updateCommentTeam = async (req,res) => {
    const {_id}= req.params;
    const {rate, comment, teamId} = req.body;
    const commentExist = await CommentTeam.findById(_id);
    if(!commentExist) {
        throw new NotFoundError('Not found Comment');
    }
    else{
        commentExist.rate = rate||commentExist.rate;
        commentExist.comment = comment||commentExist.comment;
        commentExist.teamId = teamId||commentExist.teamId;
    }
    try{
        const updateComment = await commentExist.save();
        res.status(200).json(updateComment)
    }
    catch(err){
        throw err
    }
};

const deleteCommentTeam = async (req,res) => {
    const {_id} = req.params;
    try{
        const commentExist = await CommentTeam.findByIdAndUpdate(_id,{ isDeleted: true},{new: true});
        res.status(200).json({
            message: 'Deleted Comment successfully',
            comment: commentExist,
        })
    }
    catch(err){
        throw err
    }
}

export {getCommentTeams,getCommentTeam,getCommentTeamsByDepartmentId,postCommentTeam,updateCommentTeam,deleteCommentTeam}