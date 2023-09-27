import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const resetTokenSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        require: true
    },
    token: {
        type: String,
        require: true
    },
    createAt: {
        type: Date,
        expires: 3600,
        default: Date.now()
    }
});

resetTokenSchema.pre('save', async function (next) {
    if(this.isModified("token")) {
        const hash = await bcrypt.hash(this.token, 8);
        this.token = hash;
    }

    next();
});

resetTokenSchema.methods.compareToken = async function (token) {
    const result = await bcrypt.compareSync(token, this.token);
    return result;
};

export default mongoose.model("ResetToken", resetTokenSchema);