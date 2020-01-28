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
    var arr = displayName.split(" ");
    const name = arr[0];
    var surname = '';
    var i;

    console.log(arr.length);

    if(arr.length >= 2) {
        for(i=1; i < arr.length; i++) {
            surname += arr[i];
            console.log(surname);
        }
        group.getNameGroup()
    }
    // [END authIntegration]
    console.log(uid);

    // [START returnMessageAsync]
    // Saving the new message to the Realtime Database.
    //const sanitizedMessage = sanitizer.sanitizeText(text); // Sanitize the message.
    return admin.database().ref('/users/'+uid).set({
        uid: uid,
        email: email,
        name: name,
        surname: surname,
        picture: picture,
    });
    // [END_EXCLUDE]
});




