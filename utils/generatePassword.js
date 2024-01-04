// const generateCustomPassword = (student) => {
//     try {
//         const { firstName, phone } = student;
//         const password = `${firstName}_${phone.slice(phone.length - 4, phone.length)}`;
//         return password;
//     } catch (error) {
//         console.error('Error creating new user:', error);
//         return { success: false, error: error };
//     }
// };
const generateCustomPassword = (student) => {
    const { firstName, phone } = student;
    const formattedFirstName = firstName.replace(/\s/g, '');
    const phoneString = phone + "";
    const lastFourDigits = phoneString.slice(-4);
    const password = `${formattedFirstName}_${lastFourDigits}`;
    return password;
};


module.exports = {
    generateCustomPassword,
};