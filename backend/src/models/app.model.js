import mongoose from "mongoose";

const app = new mongoose.Schema({
    appName:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true,
    },
    platform:{
        type:String,
        required:true,
    },
    link:{
        type:String,
        required:true,
    },
    appIcon:{
        type:String,
        required:true,
    },

    
},{timestamps:true})

const App = new model ('App',app )
export{App}