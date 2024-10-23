const handleimageupload=async(path)=>{
    try{
        const uploadResult= await  cloudinaryInstane.uploader.upload(req.file.path)
      return uploadResult.url

    }catch(error){


    }
}
module.exports={handleimageupload}