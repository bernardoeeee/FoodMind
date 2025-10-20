let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        return cb(null, path.join(__dirname, '..', 'uploads'));
    },
    // destination: function (req, file, cb) {
    //     return cb(null, "uploads"); // Sem ../src, direto na raiz!
    // },
    filename: function (req, file, cb) {
        let nome_sem_espaco = file.originalname.trim()
        let nome_array = nome_sem_espaco.split(' ')
        let nome_com_underline = nome_array.join('_')
        return cb(null, `${Date.now()}_${nome_com_underline}`);
    }
    
})
