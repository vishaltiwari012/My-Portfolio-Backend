import mongoose from 'mongoose';

const timelineSchema = new mongoose.Schema({
    title : {
        type : String,
        required : [true, 'Title required']
    },
    description : {
        type : String,
        required : [true, 'Description required']
    },
    timeline : {
        from : {
            type : String,
        },
        to : {
            type : String,
        }
    }
});

export const Timeline = mongoose.model("Timeline", timelineSchema);