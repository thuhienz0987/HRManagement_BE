import crypto from 'crypto';

const createRandomBytes = () =>
    new Promise((resolve, reject) => {
        crypto.randomBytes(30, (err, buff) => {
            if (err) reject(err);

            const token = buff.toString('hex');
            resolve(token);
        });
    });

const generateRandomPassword = (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const password = [];

    for (let i = 0; i < length; i++) {
        const randomIndex = crypto.randomInt(0, characters.length);
        password.push(characters.charAt(randomIndex));
    }

    return password.join('');
}

export {createRandomBytes, generateRandomPassword};