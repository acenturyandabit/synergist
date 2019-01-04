// V1.1

/*
toInitialise(root div){
    loadFromData(data as object); // for the tutorial
    offlineLoad(name as string); // load an offline version of the content.
    registerFirebaseDoc(doc as firebaseDocument, name as string); //load online from a firebase document.
}
*/
var fireman={
    toInitialise: synergist,
    
    // this needs to be a function otherwise it will return null before the document is loaded!
    rootElement:()=>{return document.body}, 

    //the query keyword for different documents. For example, if your HTML URL querystring identifies documents by mysite.com/?document=, then the documentQueryKeyword is "document".
    documentQueryKeyword:"gist",

    //querystring parameter if you want your application to work offline.
    offlineKeyword:"offline",

    //querystring parameter for tutorial. 
    tutorialQueryKeyword:"tute",
    //If the tutorial is not a separate document, and you still want to load a document, set this to true.
    inlineTutorial:false,
    tutorialFunction:(thing)=>{
        thing.loadFromData(me.tutorialData);
        
    },
    //The data to send to loadData if this is indeed a tutorial.
    tutorialData:{"views":{"1545790901615":{"left":"Less favourable","name":"Views","right":"More favourable","type":"singleAxis"},"1545791235016":{"left":"Less favourable","name":"Collaboration","right":"More favourable","type":"singleAxis"},"1545971755534":{"left":"Less favourable","name":"More","right":"More favourable","type":"singleAxis"},"main":{"left":"Less favourable","name":"Introduction","right":"More favourable","type":"singleAxis"}},"items":[{"viewData":{"1545790901615":{"hidden":true,"x":0.0234375,"y":0.6818757921419518},"1545791235016":{"hidden":true,"x":0.7489583333333333,"y":0.12688442211055276},"1545971755534":{"hidden":true,"x":0.4,"y":0.39923954372623577},"main":{"hidden":false,"x":0.3463541666666667,"y":0.15201005025125627}},"title":"How does it work?","description":"Synergist revolves around Items and Views.\n\nItems are these little white boxes. Double click anywhere in the grey region to add an item! \n\nTo edit the contents of an item, just click the thing you want to edit, and edit it :)","forecolor":"","backcolor":""},{"viewData":{"1545790901615":{"hidden":false,"x":0.39166666666666666,"y":0.17997465145754118},"1545791235016":{"hidden":true,"x":0.4,"y":0.39824120603015073},"1545971755534":{"hidden":true,"x":0.4,"y":0.39923954372623577},"main":{"hidden":true,"x":0.09270833333333334,"y":0.36055276381909546}},"title":"Editing views","description":"You can edit the name of a view by clicking the name on the top left and typing. \n\nThe \"less favourable\" and \"more favourable\" arrows can also be edited, to create a  scale from left to right. Again, just click and type :)","forecolor":"","backcolor":""},{"viewData":{"1545790901615":{"hidden":true,"x":0.3963541666666667,"y":0.7275031685678074},"1545791235016":{"hidden":true,"x":0.45677083333333335,"y":0.23115577889447236},"1545971755534":{"hidden":true,"x":0.4,"y":0.39923954372623577},"main":{"hidden":true,"x":0.6057291666666667,"y":0.6030150753768844}},"title":"Have fun!","description":":)","forecolor":"","backcolor":""},{"viewData":{"1545790901615":{"hidden":true,"x":0.05416666666666667,"y":0.7110266159695817},"1545791235016":{"hidden":true,"x":0,"y":0},"1545971755534":{"hidden":true,"x":0.4,"y":0.39923954372623577},"main":{"hidden":false,"x":0.5005208333333333,"y":0.24623115577889448}},"title":"Manipulating items","description":"To rearrange items, click and drag them around the canvas.\n\nYou can double click an item to lock it in place, to allow for easy editing.\n\nTo delete an item, right click on it and press the delete button in the popup.","forecolor":"","backcolor":""},{"viewData":{"1545790901615":{"hidden":false,"x":0.27291666666666664,"y":0.17110266159695817},"1545791235016":{"hidden":true,"x":0.4,"y":0.39824120603015073},"1545971755534":{"hidden":true,"x":0.4,"y":0.39923954372623577},"main":{"hidden":true,"x":0.3416666666666667,"y":0.44472361809045224}},"title":"Views","description":"You can use different views to represent different organisations of items. \n\nYou've probably met the \"Add another view\" button, which is how you add new views!\n","forecolor":"","backcolor":""},{"viewData":{"1545790901615":{"hidden":true,"x":0.4,"y":0.39923954372623577},"1545791235016":{"hidden":true,"x":0.4,"y":0.39949748743718594},"1545971755534":{"hidden":false,"x":0.4979166666666667,"y":0.5617084917617237},"main":{"hidden":true,"x":0.4,"y":0.39824120603015073}},"title":"Unhiding","description":"You can unhide items by dragging them out of the bottom bar.","forecolor":"rgb(0, 0, 0)","backcolor":"rgb(236, 59, 255)"},{"viewData":{"1545790901615":{"hidden":true,"x":0.4,"y":0.39923954372623577},"1545791235016":{"hidden":true,"x":0.4,"y":0.39949748743718594},"1545971755534":{"hidden":false,"x":0.5151041666666667,"y":0.11153358681875793},"main":{"hidden":true,"x":0.4,"y":0.39824120603015073}},"title":"Context menu","description":"Right click on any item to show its context menu. From there you can show or hide items on different views.","forecolor":"rgb(0, 0, 0)","backcolor":"rgb(255, 160, 77)"},{"viewData":{"1545790901615":{"hidden":true,"x":0.353125,"y":0.5424588086185045},"1545791235016":{"x":0.2838541666666667,"y":0.16834170854271358},"1545971755534":{"hidden":true,"x":0.6057291666666667,"y":0.6780735107731305},"main":{"hidden":true,"x":0.4244791666666667,"y":0.3907035175879397}},"title":"Collaboration","description":"All gists are stored on Firebase, so you can collaborate with your friends in real time online.\n\nTo collaborate with your teammates on a gist, simply drop them the url :)\n\nTo create a new gist, replace the \"Name\" in ?gist=\"Name\" with your own gist name.","forecolor":"","backcolor":""},{"viewData":{"1545790901615":{"hidden":false,"x":0.625,"y":0.15462610899873258},"1545791235016":{"hidden":true,"x":0.4,"y":0.39824120603015073},"1545971755534":{"hidden":true,"x":0.4,"y":0.39923954372623577},"main":{"hidden":true,"x":0.36875,"y":0.5917085427135679}},"title":"Capiche?","description":"Check out the next view to continue!","forecolor":"","backcolor":""},{"viewData":{"1545790901615":{"hidden":true,"x":0.05416666666666667,"y":0.7351077313054499},"1545791235016":{"hidden":true,"x":0,"y":0},"1545971755534":{"hidden":true,"x":0.4,"y":0.39923954372623577},"main":{"hidden":false,"x":0.640625,"y":0.30527638190954776}},"title":"Capice?","description":"There's more! \n\nEach screen is a view. Views allow items to be organised in different ways. \n\nTo switch a view, go to the top left dropdown menu [Tutorial v] and click the (v) to switch to another view.","forecolor":"","backcolor":""},{"viewData":{"1545790901615":{"hidden":true,"x":0.051041666666666666,"y":0.7769328263624842},"1545791235016":{"hidden":true,"x":0,"y":0},"1545971755534":{"hidden":true,"x":0.4,"y":0.39923954372623577},"main":{"hidden":false,"x":0.18177083333333333,"y":0.0992462311557789}},"title":"Hey there!","description":"Welcome to Synergist! \n\nSynergist is a platform for organising notes, ideas or whatever you want!","forecolor":"rgb(0, 0, 0)","backcolor":"rgb(13, 255, 96)"},{"viewData":{"1545790901615":{"hidden":false,"x":0.50625,"y":0.16476552598225602},"1545791235016":{"hidden":true,"x":0.5322916666666667,"y":0.43844221105527637},"1545971755534":{"hidden":true,"x":0.4,"y":0.39923954372623577},"main":{"hidden":true,"x":0.08385416666666666,"y":0.6457286432160804}},"title":"Items and views","description":"Items recall their position in each view; so dragging items on one view won't affect their positions on another view. This is useful if you want to cluster items or sort them by different categories.\n\nAs of right now, items are present on all views, but I'm working on changing this :3","forecolor":"","backcolor":""},{"viewData":{"1545790901615":{"hidden":true,"x":0.4,"y":0.39923954372623577},"1545791235016":{"hidden":true,"x":0.4,"y":0.39949748743718594},"1545971755534":{"hidden":false,"x":0.328125,"y":0.2719822560202788},"main":{"hidden":true,"x":0.796875,"y":0.9786432160804021}},"title":"More features","description":"The little settings cog in the top right corner will show some extra features, like changing the colour of your items :)","forecolor":"rgb(0, 0, 0)","backcolor":"rgb(33, 255, 248)"},{"viewData":{"1545790901615":{"x":0.4,"y":0.4,"hidden":true},"1545791235016":{"x":0.4,"y":0.39949748743718594,"hidden":true},"1545971755534":{"x":0.4,"y":0.4,"hidden":true},"main":{"x":0.17291666666666666,"y":0.5489949748743719,"hidden":false}},"title":"All done?","description":"Click here to finish the tutorial!","forecolor":"","backcolor":""}],"name":"Tutorial"},
   
    //firebase configuration
    config:{
        apiKey: "AIzaSyA-sH4oDS4FNyaKX48PSpb1kboGxZsw9BQ",
        authDomain: "backbits-567dd.firebaseapp.com",
        databaseURL: "https://backbits-567dd.firebaseio.com",
        projectId: "backbits-567dd",
        storageBucket: "backbits-567dd.appspot.com",
        messagingSenderId: "894862693076"
    },
    //doc to generate to be sent to registerFirebaseDoc.
    generateDoc: function(docName){
        return this.db.collection("synergist").doc(docName);
    },

    init: function(){
        firebase.initializeApp(this.config);
        this.db=firebase.firestore();   
        this.db.settings({
            timestampsInSnapshots: true
        });
        let me=this;
        document.addEventListener("DOMContentLoaded", function(){
            me.params = new URLSearchParams(window.location.search);
            me.thing = new me.toInitialise(me.rootElement());
            if (me.params.has(me.tutorialQueryKeyword) && !me.inlineTutorial){
                me.thing.loadFromData(me.tutorialData);
                me.thing.registerTutorial();
            }else{
                if (me.params.has(me.documentQueryKeyword)) {
                    me.documentName = me.params.get(me.documentQueryKeyword);
                    if (!me.params.has(me.offlineKeyword)){
                        me.thing.registerFirebaseDoc(me.generateDoc(me.documentName),me.documentName);
                    }else{
                        me.thing.offlineLoad(me.documentName);
                    }
                }
                if (me.params.has(me.tutorialQueryKeyword) && me.inlineTutorial){
                    me.tutorialFunction(me.thing);
                }
            }
        });
    }

}

fireman.init();