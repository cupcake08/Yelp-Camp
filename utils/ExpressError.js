class ExpressError extends Error {
    constructor(msg,statuscode){
        super();
        this.message = msg;
        this.statuscode = statuscode;
    }
}

module.exports = ExpressError;