import UnauthorizedError from '../errors/unauthorizedError.js'

const verifyRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req?.roles) throw new UnauthorizedError("Your account do not have any roles");
        const rolesArray = [...allowedRoles];
        const result = req.roles.map(role => {
            return rolesArray.includes(role)}).find(val => val === true);
        if (!result) throw new UnauthorizedError("Your role do not have permission to perform this action");
        next();
    }
}

export default verifyRoles;