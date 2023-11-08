import  mongoose from 'mongoose'

const eventSchema = mongoose.Schema({
    name:{
        type: String,
        required: [true, 'A Event must have a name'],
        minLength: [1, 'A name of Event must have a minimum of 1 character'],
        maxLength: [50, 'A name of Event must have a maximum of 40 characters'],

    },
    description:{
        type: String,
        required: [true, 'A Event must have a description'],
        minLength: [1, 'A description of Event must have a minimum of 10 character'],
        maxLength: [50, 'A description of Event must have a maximum of 500 characters'],

    },
    dateTime:{
        type: Date,
        required: [true, 'A Event must have a date time'],
    },
    users: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
            mandatory: {
                type: Boolean,
                default: false,
            },
        },
    ],
    isDeleted:{
        type: Boolean,
        required: true,
        default: false,
    },
})

const Event = mongoose.model('Event', eventSchema);

export default Event;
