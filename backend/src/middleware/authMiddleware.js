const jwt = require('jsonwebtoken');

// VERIFY TOKEN
exports.auth = (req, res, next) => {

    const authHeader = req.header('Authorization');

    if (!authHeader) {

        return res.status(401).json({
            msg: "Access denied. No token."
        });

    }

    try {

        const token = authHeader.startsWith('Bearer ')
            ? authHeader.split(' ')[1]
            : authHeader;


        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );


        req.user = decoded;

        next();

    }
    catch (error) {

        return res.status(401).json({
            msg: "Invalid token"
        });

    }

};

// ADMIN CHECK
exports.adminOnly = (req, res, next) => {

    if (!req.user) {

        return res.status(401).json({
            msg: "User not authenticated"
        });

    }

    if (req.user.role !== "admin") {

        return res.status(403).json({
            msg: "Admin access required"
        });

    }

    next();

};