const mongoose=require('mongoose');
const userschema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                // Updated regex: at least 6 characters, containing one letter, one number, and one special character
                return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{6,}$/.test(v);
            },
            message: props => `${props.value} is not a strong password! It must contain at least one letter, one number, and one special character.`
        }
    },
    

    
    profilepic:{
        type:String,
        default:"https://images.search.yahoo.com/images/view;_ylt=AwrFRlbT6c5mF.oJ2D6JzbkF;_ylu=c2VjA3NyBHNsawNpbWcEb2lkAzJkNmQwOTg2Nzg2NTRhNzk1YjZmY2RhMzRmNTI0OWJhBGdwb3MDMTIEaXQDYmluZw--?back=https%3A%2F%2Fimages.search.yahoo.com%2Fsearch%2Fimages%3Fp%3Dprofile%2Bpic%2Bplaceholder%26type%3DE210US714G0%26fr%3Dmcafee%26fr2%3Dpiv-web%26tab%3Dorganic%26ri%3D12&w=1280&h=1280&imgurl=cdn.pixabay.com%2Fphoto%2F2016%2F08%2F08%2F09%2F17%2Favatar-1577909_1280.png&rurl=https%3A%2F%2Fpixabay.com%2Fvectors%2Favatar-icon-placeholder-1577909%2F&size=43.4KB&p=profile+pic+placeholder&oid=2d6d098678654a795b6fcda34f5249ba&fr2=piv-web&fr=mcafee&tt=Avatar+Icon+Placeholder+The+-+Free+vector+graphic+on+Pixabay&b=0&ni=21&no=12&ts=&tab=organic&sigr=PviDXjUwsUOO&sigb=8gNRzr864wMy&sigi=7YKHmwAyIX56&sigt=bBhO5tEwdCBW&.crumb=z5zcVZUhfFE&fr=mcafee&fr2=piv-web&type=E210US714G0"
    },
    hotels:[{
type:mongoose.Schema.Types.ObjectId,
ref:"hotels",
    }],
    Blocked: {
        type: Boolean,
        default: false // New field with default value
    }
   
})
const user=mongoose.model('user',userschema)
module.exports={user}