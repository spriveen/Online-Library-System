import mongoose from "mongoose";

export const connectDB = async () => {
    mongoose.connect("mongodb+srv://rpeanuka_db_user:riveen123@cluster0.c1o3lca.mongodb.net/LibraryManagements")
    .then(()=>{
        console.log("DB CONNECTED")
    })
}