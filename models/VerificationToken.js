const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const verificationTokenSchema = new mongoose.Schema({
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
        //expire: 3600,
        default: Date.now()
    }
});

verificationTokenSchema.pre('save', async function (next) {
    if(this.isModified("token")) {
        const hash = await bcrypt.hash(this.token, 8);
        this.token = hash;
    }

    next();
});

verificationTokenSchema.methods.compareToken = async function (token) {
    const result = await bcrypt.compareSync(token, this.token);
    return result;
};

module.exports = mongoose.model("VerificationToken", verificationTokenSchema);