import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

   userId: {
    type: Number,
    unique: true,
    sparse: true,
   },
   email: {
    type: String,
    unique: true,
    required: true,
   },
   fullName:{
    type: String,
    required: true,  
   },
   password: {
    type: String,
    required: true,
    minlength: 6
    
   },
   profilePic:{
    type: String,
    default: "",
   },
   friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
   }],

}, {timestamps: true})

userSchema.pre("save", async function (next) {
  if (this.userId) return next();
  try {
    const lastUser = await mongoose.model("User").findOne().sort({ userId: -1 }).select("userId");
    this.userId = lastUser?.userId ? lastUser.userId + 1 : 1000001;
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model("User" , userSchema)
export default User;