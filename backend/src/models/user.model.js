import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema=mongoose.Schema(
{
    name:{
        type:String,
        required:[true,"Name is required"],
        trim:true,
    },
    email:{
        type:String,
        required:[true,"Email is required"],
        unique:true,
        trim:true,
        lowercase:true
    },
    password:{
        type:String,
        required:[true,"Password is required"],
        minlength: [6, "Password must be at least 6 characters"],
        select:false,

    },
    role:{
        type:String,
        enum:["user","admin"],
        default:"user"
    },

    refreshToken:{
        type:String,
        default:null
    },
    isEmailVerified:{
        type:Boolean,
        default:false
    },
    emailVerificationToken:{
        type: String,
        default: null,
    },
     emailVerificationExpire: {
      type: Date,
      default: null,
    },

    forgotPasswordToken: {
      type: String,
      default: null,
    },

    forgotPasswordExpire: {
      type: Date,
      default: null,
    },
        resumeUrl: {
      type: String,
      default: "",
    },

    resumePublicId: {
      type: String,
      default: "",
    },

  },


  {
    timestamps: true,
  }
);
userSchema.pre("save",async function(){
    if(!this.isModified("password")){
        return ;
    }
    this.password = await bcrypt.hash(this.password, 10);
    
})

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
userSchema.methods.generateAccessToken=function(){
    return jwt.sign({
        id:this.id,
        email:this.email,
        role:this.role
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRE,
    }
)
};
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRE,
    }
  );
};


const User=mongoose.model("User",userSchema);
export default User;