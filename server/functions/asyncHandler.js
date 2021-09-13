
/**
 * errorhandler for express, catches async erros and forwards them to next()
 * stolen from https://stackoverflow.com/questions/51391080/handling-errors-in-express-async-middleware
 * @param {} fn 
 * @returns 
 */
const asyncHandler = fn => (req, res, next) => {
    return Promise
        .resolve(fn(req, res, next))
        .catch(next);
};

module.exports = asyncHandler;