import mongoose from "mongoose";

export default async () => {
    try{
        const mongoUrl = process.env.MONGO_URL

        if(!mongoUrl) {
            throw new Error("mongodb connection string is requird")
        }

        await mongoose.connect(mongoUrl.trim());
        console.log("connected succesfully");
        
    
    }catch(error){
        console.log("something went wrong in db");
        console.log(error);
    }
}