// middleware/authMiddleware.js

const supabase = require('../config/supabase.js');

const authMiddleware = async (req, res, next) => {
    // 1. Ambil header Authorization dari request
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            status: 'fail',
            message: 'Akses ditolak. Token tidak disediakan.'
        });
    }

    // 2. Ambil token-nya saja (tanpa "Bearer ")
    const token = authHeader.split(' ')[1];

    // 3. Verifikasi token menggunakan fungsi bawaan Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    // 4. Jika Supabase mengembalikan error, berarti token tidak valid
    if (error) {
        return res.status(401).json({
            status: 'fail',
            message: 'Token tidak valid atau sudah kedaluwarsa.',
            // Opsi: sertakan detail error dari supabase untuk debugging
            // error: error.message 
        });
    }

    // 5. Jika user ditemukan, simpan informasinya ke object request
    req.user = user;

    // 6. Lanjutkan ke proses selanjutnya (controller)
    next();
};

module.exports = authMiddleware;