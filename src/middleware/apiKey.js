import { apiKey as validKey } from "../config/config.js";

/** 
 * @param {import('express').Request} req 
 *  @param {import('express').Response} res 
 *  @param {import('express').NextFunction} next 
 */

export default (req, res, next) => {
    const apiKey = req.headers['authorization'];
    if (apiKey !== validKey) {
        return res.status(401).json({ error: 'Invalid Api Key' });
    }
    next();
};
