// const admin = require('firebase-admin');
// const serviceAccount = require('../serviceAccountKey.json');

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//     // Other optional configurations
// });

// const createUserWithEmailAndPassword = async (email, password) => {
//     try {
//         const userRecord = await admin.auth().createUser({
//             email: email,
//             password: password,
//             // Other user properties if needed
//         });
//         console.log('Successfully created new user:', userRecord.uid);
//         return { success: true, uid: userRecord.uid };
//     } catch (error) {
//         console.error('Error creating new user:', error);
//         return { success: false, error: error };
//     }
// };

// module.exports = {
//     createUserWithEmailAndPassword,
// };
