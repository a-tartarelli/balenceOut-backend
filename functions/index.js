// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.makeUserInDb = functions.region('europe-west1').auth.user().onCreate((user) => {
    // [START authIntegration]
    // Authentication / user information is automatically added to the request.
    const uid = user.uid;
    const displayName = user.displayName || null;
    const picture = user.photoURL || null;
    const email = user.email || null;
    const surname = null;
    var arr = displayName.split(" ");
    if(arr.length > 2) {
        const name = arr[0];
        for(var i=1; arr.length; i++) {
            surname.concat(arr[i]);
            surname.concat(" ");
        }
        
    }
    surname.trim();
    // [END authIntegration]
    console.log(uid);

    // [START returnMessageAsync]
    // Saving the new message to the Realtime Database.
    //const sanitizedMessage = sanitizer.sanitizeText(text); // Sanitize the message.
    return admin.database().ref('/users/'+uid).set({
        email: email,
        name: name,
        surname: surname,
        picture: picture,
    });
    // [END_EXCLUDE]
});
