import mongoose from "mongoose";

export const connectDB = async () => {
    mongoose.connect("mongodb+srv://rpeanuka:riveen1234@cluster0.whhowkl.mongodb.net/LibraryManagement")
    .then(()=>{
        console.log("DB CONNECTED")
    })
}