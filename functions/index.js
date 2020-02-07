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

//WORK - Online
exports.makeUserInDb = functions.region('europe-west1').auth.user().onCreate((user) => {
    // [START authIntegration]
    // Authentication / user information is automatically added to the request.
    const uid = user.uid;
    const displayName = user.displayName || null;
    const picture = user.photoURL || null;
    const email = user.email || null;

    var name = "";
    var surname = "";

    if (displayName !== null) {

        var arr = displayName.split(" ");
        name = arr[0];
        surname = '';
        var i;

        console.log(arr.length);


        if (arr.length >= 2) {
            for (i = 1; i < arr.length; i++) {
                surname += arr[i];
                console.log(surname);
            }
            //group.getNameGroup()
        }
        // [END authIntegration]
        console.log(uid);


        return admin.database().ref('/users/' + uid).set({
            uid: uid,
            email: email,
            name: name,
            surname: surname,
            picture: picture,
        });


    } else {


        // [START returnMessageAsync]
        // Saving the new message to the Realtime Database.
        //const sanitizedMessage = sanitizer.sanitizeText(text); // Sanitize the message.
        return admin.database().ref('/users/' + uid).set({
            uid: uid,
            email: email,
            picture: picture,
        });
        // [END_EXCLUDE]

    }




});

//WORK - non caricata
exports.sendFirstNotification = functions.region('europe-west1').database.ref('/groups/{groupsID}').onWrite(async (change, context) => {

    const groupsID = context.params.groupsID;

    console.log('è successo qualcosa su ', groupsID);

    // Get the list of device notification tokens.
    const getDeviceTokens = admin.database()
        .ref(`/Token`).once('value');


    //.ref(`/Token/{userID}`);


    console.log('getDeviceTokens = ', getDeviceTokens, ' ');


    // Get the follower profile.
    //const getFollowerProfilePromise = admin.auth().getUser(followerUid);
    const getFollowerProfilePromise = "";

    // The snapshot to the user's tokens.
    let tokensSnapshot;


    const results = await Promise.all([getDeviceTokens, getFollowerProfilePromise]);
    tokensSnapshot = results[0];

    console.log('tokensSnapshot = ', tokensSnapshot);



    // Check if there are any device tokens.
    if (!tokensSnapshot.hasChildren()) {
        return console.log('There are no notification tokens to send to.');
    }
    console.log('There are', tokensSnapshot.numChildren(), 'tokens to send notifications to.');
    //console.log('Fetched follower profile', follower);

    // Notification details.
    const payload = {
        notification: {
            title: 'You have a new follower! forse',
            body: ` is now following you.`
        }
    };

    // The array containing all the user's tokens.
    let tokens;

    // Listing all tokens as an array.
    tokens = Object.keys(tokensSnapshot.val());
    // Send notifications to all tokens.
    const response = await admin.messaging().sendToDevice(tokens, payload);
    // For each message check if there was an error.
    const tokensToRemove = [];
    response.results.forEach((result, index) => {
        const error = result.error;
        if (error) {
            console.error('Failure sending notification to', tokens[index], error);
            // Cleanup the tokens who are not registered anymore.
            if (error.code === 'messaging/invalid-registration-token' ||
                error.code === 'messaging/registration-token-not-registered') {
                tokensToRemove.push(tokensSnapshot.ref.child(tokens[index]).remove());
            }
        }
    });
    return Promise.all(tokensToRemove);
});

//WORK - non caricata
exports.sendNotification = functions.region('europe-west1').database.ref('/groups/{groupsID}').onCreate(async (change, context) => {


    //Lettura del gruppo in questione in cui la funzione si è triggerata
    const groupsID = context.params.groupsID;
    console.log("groupsID = ", groupsID);


    //Messaggio da inviare
    const payload = {
        notification: {
            title: 'Cloud Messaging from Cloud',
            body: groupsID,
        }
    };

    console.log("payload = " + payload);


    const allToken = await admin.database().ref('token/userToken').once('value');
    if (allToken.val()) {

        console.log('Token disponibile - Token avaible ');
        const token = Object.keys(allToken.val());

        return admin.messaging().sendToDevice(token, payload);
    }
    else {
        return console.log('Nessun token disponibile - No token avaible ');
    }


    //Lettura valori tratti da DB
    // var ref = admin.database().ref('/groups/'+ groupsID);
    //var nameGroupOne = "";

    /*
    
    ref.on("child_added", function(snapshot) {
        var data = snapshot.val();   //Data is in JSON format.
        console.log("data read = " , data);
        nameGroupOne = data.nameGroup;
        console.log ("Name Group letto = " , nameGroupOne);
    });

    const name = nameGroupOne.toString() || null 
    console.log("nameGroupOne.toString() || null = " , name)

    //Messaggio da inviare
    const payload = {
        notification: {
          title: 'Cloud Messaging from Cloud',
          body:  name ,
        }
    };
    console.log("payload = " + payload);

    //è possibile aggiungere un campo "option" insieme a 'payload'

    //Raccoglie la lista di token da usare per mandare il messaggio
    const allToken = await admin.database().ref('token/userToken').once('value');
    if (allToken.val()) { 

        console.log('Token disponibile - Token avaible ');
        const token = Object.keys(allToken.val());

        return admin.messaging().sendToDevice(token, payload);
    }
    else {
        return console.log('Nessun token disponibile - No token avaible ');
    }

*/

});

//WORK - non caricata
exports.pushNotificationGroup = functions.region('europe-west1').database.ref('/groups/{groupsID}').onCreate((snapshot) => {

    const Reciever = snapshot.val().nameGroup;
    const idGroup = snapshot.val().idGroup;
    const uidMembers = snapshot.val().uidMembers;
    const payload = {

        notification: {
            title: "Nuovo gruppo creato",
            body: snapshot.val().nameGroup,
        }

    }

    console.log("Reciever = " + Reciever);

    let Tokens = []

    //return admin.database().ref('fcmTokens').orderByValue().equalTo(Reciever).once('value',(Token)=>{

    admin.database().ref('token/userToken').once('value', (Token) => {
        if (Token.val()) {

            Tokens = Object.keys(Token.val())
            console.log("Token disponibili = " + Tokens);
            admin.messaging().sendToDevice(Tokens, payload)

        }

    })


    return admin.database().ref('token/groupToken/' + idGroup).set({
        Tokens: uidMembers,
    });


});

//WORK - non caricata
exports.pushNotificationExpenses_Ex = functions.region('europe-west1').database.ref('/expenses/{groupsID}/{expensesID}').onCreate((snapshot) => {

    const nameExpense = snapshot.val().description;
    const idGroup = snapshot.val().idGroup;
    console.log("nameExpense = " + nameExpense);
    console.log("idGroup = " + idGroup);


    let Tokens = []

    var nome = "";

    admin.database().ref('groups/' + idGroup).on("value", function (snapshot) {
        const data = snapshot.val();
        console.log("Snapshot val: " + snapshot.val());

        nome = snapshot.val().nameGroup;
        console.log("nome val : " + snapshot.val().nameGroup);

        const membri = snapshot.val().uidMembers;
        console.log("membri: " + membri);

        const payload = {

            notification: {
                title: "Gruppo: " + nome,
                body: "Nuova spesa aggiunta: " + nameExpense,
            }

        }

        //Ritorna ai membri del gruppo (solo uno però)

        return admin.database().ref('token/userToken').orderByValue().equalTo(membri.toString()).once('value', (Token) => {
            //return admin.database().ref('token/userToken').orderByValue().equalTo(membri).once('value',(Token)=>{
            //return admin.database().ref('token/userToken').once('value', (Token) => {
            if (Token.val()) {

                Tokens = Object.keys(Token.val())
                console.log("Token disponibili = " + Tokens);
                return admin.messaging().sendToDevice(Tokens, payload)

            }

        })


    }, function (errorObject) {

        console.log("The read failed: " + errorObject.code);
        return "Errore: " + errorObject.code;
    });


});

//WORK - Online
exports.pushNotificationExpenses = functions.region('europe-west1').database.ref('/expenses/{groupsID}/{expensesID}').onCreate((snapshot) => {

    const nameExpense = snapshot.val().description;
    console.log("nameExpense = " + nameExpense);

    const idGroup = snapshot.val().idGroup;
    console.log("idGroup = " + idGroup);

    var nomeGruppo = "";

    let Tokens = []


    admin.database().ref('groups/' + idGroup).once("value", function (snapshot) {

        const membri = snapshot.val().uidMembers;
        console.log("membri: " + membri);

        nomeGruppo = snapshot.val().nameGroup;
        console.log("nome gruppo: " + snapshot.val().nameGroup);


        const payload = {

            notification: {
                title: nomeGruppo,
                body: "Nuova spesa aggiunta: " + nameExpense,
            },

        }


        for (var i = 0; i < membri.length; i++) {

            //Controllo per evitare di passare campi vuoti di utenti non più presenti
            if (typeof membri[i] !== "undefined") {


                admin.database().ref('token/userToken').orderByValue().equalTo(membri[i]).once('value', (Token) => {

                    if (Token.val()) {

                        Tokens = Object.keys(Token.val())
                        console.log("Token disponibili = " + Tokens);
                        return admin.messaging().sendToDevice(Tokens, payload)

                    }

                }, function (errorObject) {
                    console.log("errore lettura token");
                });

            }


        }


    }, function (errorObject) {

        console.log("The read failed: " + errorObject.code);
        return "Errore: " + errorObject.code;
    });


});

//WORK - Online
exports.pushNotificationNewMember = functions.region('europe-west1').database.ref('/groups/{groupsID}/uidMembers/{uidMembers}').onCreate((snapshot, context) => {


    const idNewMember = snapshot.val();
    console.log("idNewMember = " + idNewMember);

    const idGroup = context.params.groupsID;
    console.log("idGroup = " + idGroup);

    var nameGroup = "";

    let Tokens = []


    admin.database().ref('users/' + idNewMember).once("value", function (snapshot) {

        const nomeMembro = snapshot.val().name;
        console.log("nome membro: " + nomeMembro);

        const cognomeMembro = snapshot.val().surname;
        console.log("nome membro: " + cognomeMembro);




        admin.database().ref('groups/' + idGroup).once("value", function (snapshot) {

            const membri = snapshot.val().uidMembers;
            console.log("membri: " + membri);

            nameGroup = snapshot.val().nameGroup;
            console.log("nome gruppo: " + snapshot.val().nameGroup);


            const payload = {

                notification: {
                    title: nameGroup,
                    body: "Nuovo membro: " + nomeMembro + " " + cognomeMembro,
                },

            }


            for (var i = 0; i < membri.length; i++) {

                //Controllo per evitare di passare campi vuoti di utenti non più presenti
                if (typeof membri[i] !== "undefined") {

                    //evitare la notifica a se stessi
                    if (membri[i] !== idNewMember) {

                        admin.database().ref('token/userToken').orderByValue().equalTo(membri[i]).once('value', (Token) => {

                            if (Token.val()) {

                                Tokens = Object.keys(Token.val())
                                console.log("Token disponibili = " + Tokens);
                                return admin.messaging().sendToDevice(Tokens, payload)

                            }

                        });

                    }
                }

            }

        }, function (errorObject) {

            console.log("The read failed (group): " + errorObject.code);
            return "Errore: " + errorObject.code;
        });



    }, function (errorObject) {

        console.log("The read failed (user): " + errorObject.code);
        return "Errore: " + errorObject.code;
    });


});

//WORK - Online
exports.pushNotificationReminder = functions.region('europe-west1').database.ref('/reminders/{groupsID}/{idReminders}').onCreate((snapshot) => {


    const newReminder = snapshot.val();
    console.log("newReminder = " + newReminder);

    const uidReciver = newReminder.uidReciver;
    console.log("uidReciver = " + uidReciver);

    const uidCreditor = newReminder.uidCreditor;
    console.log("uidCreditor = " + uidCreditor);

    const uidDebitor = newReminder.uidDebitor;
    console.log("uidDebitor = " + uidDebitor);

    const amount = newReminder.amount;
    console.log("amount = " + amount);

    let Tokens = []

    var reciverId = "";
    var nameSender = ""
    var situation = ""


    //Il creditore riceve la notifica
    if (uidReciver === uidCreditor) {
        reciverId = uidCreditor;
        nameSender = newReminder.nameDebitor;
        situation = " ti ricorda di avere un debito verso di te di "
    } else {
        reciverId = uidDebitor;
        nameSender = newReminder.nameCreditor;
        situation = " ti ricorda di avere un debito verso di lui di "
    }

    const payload = {

        notification: {
            title: "Nuovo promemoria",
            body: nameSender + situation + amount + "€",
        },

    }


    return admin.database().ref('token/userToken').orderByValue().equalTo(reciverId).once('value', (Token) => {

        if (Token.val()) {

            Tokens = Object.keys(Token.val())
            console.log("Token disponibili = " + Tokens);
            return admin.messaging().sendToDevice(Tokens, payload)

        }

    });


});

//WORK - Online
exports.pushNotificationEquality = functions.region('europe-west1').database.ref('/movements/{groupsID}/{movementID}').onCreate((snapshot) => {


    const movement = snapshot.val();
    console.log("movement = " + movement);

    const amount = movement.amount;
    console.log("uidReciver = " + amount);

    const uidCreditor = movement.uidCreditor;
    console.log("uidCreditor = " + uidCreditor);

    const uidDebitor = movement.uidDebitor;
    console.log("uidDebitor = " + uidDebitor);

    const idExpense = movement.idExpense;
    console.log("idExpense = " + idExpense);



    if (idExpense === null || typeof idExpense === "undefined") {


        admin.database().ref('users/' + uidDebitor).once("value", function (snapshot) {

            const nameDebitor = snapshot.val().name;
            console.log("nome debitore: " + nameDebitor);

            const surnameDebitor = snapshot.val().surname;
            console.log("cognome debitore: " + surnameDebitor);

            const debitor = nameDebitor + " " + surnameDebitor;



            admin.database().ref('users/' + uidCreditor).once("value", function (snapshot) {

                const nameCreditor = snapshot.val().name;
                console.log("nome creditore: " + nameCreditor);

                const surnameCreditor = snapshot.val().surname;
                console.log("cognnome creditore: " + surnameCreditor);

                const creditor = nameCreditor + " " + surnameCreditor;



                let Tokens = []
                var situation = "Il debito di " + debitor + " verso " + creditor + " di " + amount + "€ è stato saldato."


                const payload = {

                    notification: {
                        title: "Pareggio debiti",
                        body: situation,
                    },

                }


                admin.database().ref('token/userToken').orderByValue().equalTo(uidCreditor).once('value', (Token) => {

                    if (Token.val()) {

                        Tokens = Object.keys(Token.val())
                        console.log("Token creditore = " + Tokens);
                        admin.messaging().sendToDevice(Tokens, payload)

                    }

                });

                return admin.database().ref('token/userToken').orderByValue().equalTo(uidDebitor).once('value', (Token) => {

                    if (Token.val()) {

                        Tokens = Object.keys(Token.val())
                        console.log("Token debitore = " + Tokens);
                        return admin.messaging().sendToDevice(Tokens, payload)

                    }

                });


            }, function (errorObject) {

                console.log("The read failed: " + errorObject.code);
                return "Errore: " + errorObject.code;
            });


        }, function (errorObject) {

            console.log("The read failed: " + errorObject.code);
            return "Errore: " + errorObject.code;
        });

    }




});




