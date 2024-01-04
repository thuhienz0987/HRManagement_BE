import { ObjectId } from "mongodb";

const commentValid = {
    rate: 9,
    comment: "Great performance",
    reviewerId: new ObjectId("651fc8ea7c42156f148974ab"),
    revieweeId: new ObjectId("65541e5b92fb6c12b844f5a4"),
    commentMonth: "01/12/2023",
};

const commentInValid = {
    rate: 9,
    comment: "Great performance",
    reviewerId: new ObjectId("651fc8ea7c42156f148974ab"),
    revieweeId: new ObjectId("65541e5b92fb6c12b844f5a4"),
    commentMonth: "01/11/2023",
};

const commentUpdate = {
    _id: "657974832fc86a9e92adb6c8",
    rate: 9,
    comment: "Great!!",
    reviewerId: new ObjectId("651fc8ea7c42156f148974ab"),
    revieweeId: new ObjectId("65541e5b92fb6c12b844f5a4"),
    commentMonth: "01/11/2023",
};
const commentMissProperties = {
    rate: 3,
    comment: "Bad performance",
    revieweeId: new ObjectId("65684e0130d1e81f36e6be42"),
    reviewerId: new ObjectId("656f40567d961f88773c4416"),
    commentMonth: "01/11/2023",
};

export { commentValid, commentInValid, commentUpdate, commentMissProperties };
