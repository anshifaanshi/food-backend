const multer  = require('multer')
const storage = multer.diskStorage({
    
    filename: function (req, file, cb) {
      console.log(file,"========file")
     
      cb(null, file.originalname);
    },
  })
  
  const upload = multer({ storage: storage })
  module.exports={upload}