var config = {
    apiKey: "AIzaSyA-sH4oDS4FNyaKX48PSpb1kboGxZsw9BQ",
    authDomain: "backbits-567dd.firebaseapp.com",
    databaseURL: "https://backbits-567dd.firebaseio.com",
    projectId: "backbits-567dd",
    storageBucket: "backbits-567dd.appspot.com",
    messagingSenderId: "894862693076"
};
firebase.initializeApp(config);
// Initialize Cloud Firestore through Firebase
var db = firebase.firestore();
// Disable deprecated features
db.settings({
    timestampsInSnapshots: true
});
var s;
$(() => {
    var params = new URLSearchParams(window.location.search);
    s = new synergist($("body")[0]);
    
    if (params.has("gist")) {
        gistName = params.get("gist");
        s.registerFirebaseDoc(db.collection("synergist").doc(gistName));
    } else {
        
    }

})