import {connect} from "mongoose";

export default async function  connectDB(){
    try{
        const mongoURL = process.env.MONGO_URI?.toString();
        if(!mongoURL){
            throw new Error("MONGO_URL is not defined");
        }
        await connect(mongoURL);
        console.log("Connected to MongoDB");
    }catch(error){
        console.log("Error connecting to MongoDB", error);
    }
}