import mongoose from 'mongoose';

// Định rõ các giá trị cho kiểu enum
const BONUS_TYPES = ['fixed', 'percent'];

const bonusSchema = mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Bonus must have a code'],
        minLength: [1, 'A code of allowance have minimum of 1 character'],
        maxLength: [10, 'A code of allowance must have maximum of 10 characters'],
    },
    name: {
        type: String,
        required: [true, 'A Bonus must have a name'],
        minLength: [1, 'A name of Bonus must have a minimum of 1 character'],
        maxLength: [50, 'A name of Bonus must have a maximum of 4 characters'],
        unique: [true, 'A name of Bonus with the same name has already exists'],
    },
    bonusAmount: {
        type: Number, // Mức thưởng, có thể là phần trăm hoặc số tiền cố định
    },
    bonusType: {
        type: String,
        enum: BONUS_TYPES, // Sử dụng enum để định rõ giá trị cho kiểu enum
        required: true,
    },
    isDeleted: {
        type: Boolean,
        required: true,
        default: false,
    },
});

const Bonus = mongoose.model('Bonus', bonusSchema);

export default Bonus;
