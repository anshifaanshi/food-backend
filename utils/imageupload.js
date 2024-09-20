const handleimageupload=async(path)=>{
    try{
        const imageresult=await  cloudinaryInstane.uploader.upload(req.file.path)
      return imageresult.url

    }catch(error){


    }
}
module.exports={handleimageupload}