//dependency chainloader!!!

function isPhone() {
    var mobiles = [
        "Android",
        "iPhone",
        "Linux armv8l",
        "Linux armv7l",
        "Linux aarch64"
    ];
    if (mobiles.includes(navigator.platform)) {
        return true;
    }
    return false;
}


function guid() {
    let pool = "1234567890qwertyuiopasdfghjklzxcvbnm";
    tguid = "";
    for (i = 0; i < 4; i++) tguid += pool[Math.floor(Math.random() * pool.length)];
    return tguid;
}
//when loading from ext, x is synergist and y is firebase, id is still id.
function floatingItem(_synergist, x, y, id) {
    //----------Parent----------//
    this.parent = _synergist;
    //----------The div----------//
    this.div = document.createElement("div");
    this.div.classList.add("floatingItem");

    $(this.div).html(`
    <h3><span contentEditable>Item name</span><img class="gears" src="resources/gear.png"></h3>
    <p contentEditable>Item description</p>
    `)
    //----------Loading----------//

    this.toObject = function () {
        o = {};
        o.viewData = this.viewData;
        o.title = $(this.div).find("h3>span").text();
        o.description = $(this.div).find("p").text();
        o.forecolor = this.div.style.color;
        o.backcolor = this.div.style.background;
        return o;
    }
    this.fromObject = function (o) {
        this.viewData = o.viewData;
        if (o.backcolor) {
            this.div.style.background = o.backcolor;
            this.div.style.color = o.forecolor;
        } else {
            this.div.style.background = o.color;
        }
        $(this.div).find("h3>span").text(o.title);
        $(this.div).find("p").text(o.description);
    }

    //----------Updating functions----------//
    this.makeNewView = function (name) {
        this.viewData[name] = {
            x: 0.4,
            y: 0.4,
            hidden: false
        };
    }

    this.assertView = function (name) {
        if (this.viewData[name] == undefined || this.viewData[name].x == undefined || this.viewData[name].y == undefined) {
            this.makeNewView(name);
        }
    }

    this.remoteUpdate = function (itm) {
        this.fromObject(itm);
        this.arrangeElement(this.currentView);
    }

    this.arrangeElement = function (view) {
        this.currentView = view;
        if (this.viewData[view].hidden) $(this.parent.basediv).find(".bottomDrawer").append(this.div);
        else $(this.parent.basediv).append(this.div);
        if (!isNaN(this.viewData[view].x) && this.viewData[view].x <= 1) {
            /*if (this.parent.basediv.clientHeight > this.parent.basediv.clientWidth) {
                this.div.style.left = Math.floor(this.viewData[view].y * this.parent.basediv.clientWidth) + "px";
                this.div.style.top = Math.floor(this.viewData[view].x * this.parent.basediv.clientHeight) + "px";
            } else {
                this.div.style.left = Math.floor(this.viewData[view].x * this.parent.basediv.clientWidth) + "px";
                this.div.style.top = Math.floor(this.viewData[view].y * this.parent.basediv.clientHeight) + "px";
            }*/
            this.div.style.left = Math.floor(this.viewData[view].x * this.parent.basediv.clientWidth) + "px";
            this.div.style.top = Math.floor(this.viewData[view].y * this.parent.basediv.clientHeight) + "px";
        } else { //data from older versions
            this.div.style.left = this.viewData[view].x;
            this.div.style.top = this.viewData[view].y;
        }
    }
    //----------Mutation observation----------//
    let me = this;
    this.mo = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.attributeName === 'style') {
                let xx = me.div.style.left.replace(/[a-z]+/, "");
                let yy = me.div.style.top.replace(/[a-z]+/, "");
                /*if (me.parent.basediv.clientHeight > me.parent.basediv.clientWidth) {
                    me.viewData[me.currentView].y= xx / me.parent.basediv.clientWidth;
                    me.viewData[me.currentView].x= yy / me.parent.basediv.clientHeight;
                } else {
                    me.viewData[me.currentView].x= xx / me.parent.basediv.clientWidth;
                    me.viewData[me.currentView].y= yy / me.parent.basediv.clientHeight;
                }*/
                me.viewData[me.currentView].x = xx / me.parent.basediv.clientWidth;
                me.viewData[me.currentView].y = yy / me.parent.basediv.clientHeight;
            }
        })
    });

    this.unhide = function () {
        this.viewData[this.parent.currentView].hidden = false;
    }

    this.webUpdatePosition = function () {
        if (me.fireDoc) {
            let updateItm = {};
            updateItm['viewData.' + me.currentView] = me.viewData[me.currentView];
            me.fireDoc.update(updateItm);
        }
    }

    this.webUpdateColor = function () {
        if (me.fireDoc) {
            let updateItm = {};
            updateItm['backcolor'] = me.div.style.background;
            updateItm['forecolor'] = me.div.style.color;
            me.fireDoc.update(updateItm);
        }
    }
    // Notify me of style changes
    this.mo.observe(this.div, {
        attributes: true,
        attributeFilter: ["style"]
    });
    //----------Final initialisation----------//
    if (_synergist.viewData) {
        this.fromObject(_synergist);
        __synergist = x; //remap the second argument
        this.parent = __synergist;
        if (y) {
            this.fireDoc = y;
        }
        this.id = id;
        this.div.dataset.id = id;
        this.currentView = __synergist.currentView;
    } else {
        this.viewData = {};
        this.currentView = _synergist.currentView;
        Object.keys(_synergist.views).forEach((v, i) => {
            this.viewData[v] = {
                x: 0.4,
                y: 0.4,
                hidden: false
            };
        })
        this.viewData[this.currentView] = {
            x: x / this.parent.basediv.clientWidth,
            y: y / this.parent.basediv.clientHeight,
            hidden: false
        };
        this.id = id;
        this.div.dataset.id = id
    }
    //----------UI shnigs----------//
    this.hide = function (listName) {
        if (!listName) {
            //hide from all but this
            for (l in this.viewData) {
                if (l != this.parent.currentView) {
                    this.viewData[l].hidden = true;
                }
            }
        } else {
            this.viewData[listName].hidden = true;
            if (listName == this.parent.currentView) $(this.parent.basediv).find(".bottomDrawer").append(this.div);
        }
        if (this.fireDoc) {
            //update all view data to reflect hidden
            let updateItm = {};
            updateItm['viewData'] = me.viewData;
            me.fireDoc.update(updateItm);
        }
    }
}

function synergist(div) {
    //----------Initialisation----------//
    this.items = {};
    this.localSavePrefix = "";
    this.views = {
        "main": {
            name: "Main",
            left: "Less favourable",
            right: "More favourable"
        }
    };
    // all the html stuff; brackets so you can hide it in an ide
    this.makeHTML=function(){
    $(div).html(`
    <div class="synergist-container" >
        <div class="synergist-banner" >
            <h1 contentEditable>Pad name</h1>
            <h2>View: <span><span contenteditable class="viewName" data-listname='main'>Main</span><span>v</span>
            <div class="dropdown" style="display:none">
            </div>
            </span><img class="gears" src="resources/gear.png"></h2>
            <span class="plusbutton">More</span>
        </div>
        <div class="synergist">
        <div class="backwall">
        <span class="leftLabelContainer"><span class="phoneNoShow"><<</span><span class="leftLabel" contentEditable>` + this.views.main.left + `</span></span>
        <span class="rightLabelContainer"><span class="rightLabel" contentEditable>` + this.views.main.right + `</span><span class="phoneNoShow">>>></span></span>
        </div>
        <div class="dialog backOptionsMenu">
            <h2>Options</h2>
            <p>View type:<select class="viewType">
            <option value="blank">Blank</option>
            <option value="singleAxis">Single Axis</option>
            <!--<option value="doubleAxis">Double Axis</option>-->
            
            </select> </p>
        </div>
        <div class="dialog moreMenu">
            <h2>More options</h2>
            <section class="wsm">
                <h3>Weighted scoring matrix</h3>
                <button>Generate weighted scoring matrix</button>
            </section>
    
        </div>
        <div class="bottomDrawer specialScroll"></div>
        </div>
    </div>
    <div class="floatingSetupMenu" style="display:none; position:absolute;">
        <span>Background:<input class="jscolor" onchange="s.backColorUpdateReceived(this.jscolor)" value="ffffff"></span>
        <span>Text:<input class="jscolor" onchange="s.foreColorUpdateReceived(this.jscolor)" value="ffffff"></span>
    </div>
    <div class="loginShield dialog noClose">
        <section class="loading">
            <h2>Loading Gist...</h2>
        </section>
        <section class="oldGist">
            <h2>Enter password to continue</h2>
            <input placeholder="Password...">
            <button>Continue</button>
        </section>
        <section class="newGist">
            <h2>Set a password for your gist!</h2>
            <input placeholder="Password...">
            <button>Continue</button>
        </section>
    </div>
    `);
        dialogManager.checkDialogs();
    }
    this.makeHTML();
    // Title w/ mutation observer!
    $("head").append(`<title>Loading Synergist...</title>`);
    
    //Install JScolor
    window.jscolor.installByClassName("jscolor");
    this.basediv = $(div).find(".synergist")[0];
    this.currentView = "main";
    //----------Phone specific ui elements----------//
    /*if (isPhone()) {
        $(".synergist").append(`
<button class="fab">+</button>
        `)
        $(".leftLabelContainer,.rightLabelContainer").addClass("phone");
    }

    try {
        window.screen.lockOrientation("portrait-primary");
    } catch (e) {
        console.log("screen lock failed");
    }*/

    //----------Loading----------//

    this.toSaveData = function () {
        obj = {};
        obj.views = this.views;
        obj.items = Object.keys(this.items).map((i) => {
            return this.items[i].toObject()
        });
        obj.name = $("h1")[0].innerText;
        return obj;
    }

    this.loadFromData = function (d) {
        //clear everything
        this.views = {};
        this.items = {};
        $(this.basediv).find(".floatingItem").remove();
        //load everything
        $("h1").text(d.name);
        $("title").text(d.name+" - Synergist");
        for (i in d.views) {
            this.makeNewView(i, d.views[i]);
        }
        for (i in d.items) {
            this.makeNewItem(i, d.items[i]);
        }
        this.switchView("main");//all docs are guarunteed to have a main riiight???
    }

    $("body").on("keydown", (e) => {
        if (e.ctrlKey && e.key == "s") {
            window.localStorage.setItem("synergist_data_" + this.localSavePrefix, JSON.stringify(this.toSaveData()));
            e.preventDefault();
        }
        if (e.ctrlKey && e.key == "o") {
            this.tryLocalLoad();
            e.preventDefault();
        }
    })

    this.offlineLoad = function (name) {
        this.localSavePrefix = name;
        let itm = JSON.parse(window.localStorage.getItem("synergist_data_" + this.localSavePrefix));
        if (itm) this.loadFromData(itm);
        else{
            $("h1").text(name);
            $("title").text(name+" - Synergist");
        }
    }
    //----------Web based loading----------//
    this.firebaseEnabled = false;

    this.firebaseLoadContinue = function (doc) {
        let _syn=this;
        doc.onSnapshot(shot => {
            if (shot.metadata.hasPendingWrites) return;
            d = shot.data();
            //d contains name only.
            if (!d) {
                $("h1").text(_syn.localSavePrefix);
                $("title").text(+syn.localSavePrefix+" - Synergist");
                return;
            }
            $("h1").text(d.name);
            $("title").text(d.name+" - Synergist");
        })
        //collection for items
        this.itemCollection = doc.collection("items");
        this.itemCollection.onSnapshot(shot => {
            shot.docChanges().forEach((c) => {
                if (c.doc.metadata.hasPendingWrites) return;
                switch (c.type) {
                    case "added":
                        self.makeNewItem(c.doc.id, c.doc.data());
                        break;
                    case "modified":
                        self.items[c.doc.id].remoteUpdate(c.doc.data())
                        break;
                    case "removed":
                        self.removeItem(c.doc.id,true);
                }
            })
        })
        this.viewCollection = doc.collection("views");
        this.firstRun = true;
        this.viewCollection.onSnapshot(shot => {
            shot.docChanges().forEach((c) => {
                if (c.doc.metadata.hasPendingWrites) return;
                switch (c.type) {
                    case "added":
                        self.makeNewView(c.doc.id, c.doc.data(), true);
                        break;
                    case "modified":
                        self.views[c.doc.id] = c.doc.data();
                        if (self.currentView == c.doc.id) self.switchView(c.doc.id);
                        break;
                    case "removed":
                        self.removeItem(c.doc.id,true);
                }
            })
            if (self.firstRun) {
                self.firstRun = false;
                self.switchView("main");
            }
        })
    }

    this.registerFirebaseDoc = function (doc, name) {
        this.localSavePrefix = name;
        //show the cover
        $(".loginShield")[0].style.display="block";
        $(".loginShield .loading")[0].style.display="block";
        //clear everything
        this.views = {};
        this.items = {};
        //start firebase
        self = this;
        this.firebaseEnabled = true;
        this.firebaseDoc = doc;
        doc.get().then(d => {
            $(".loginShield .loading").hide();
            if (!d.exists) {
                doc.set({
                    name: 'Pad Name'
                });
                let firstView = {
                    name: "Main",
                    left: "Less favourable",
                    right: "More favourable"
                }
                doc.collection("views").doc("main").set(firstView);
                self.makeNewView("main", firstView);
                //show set password button

            }
            if (!d.data() || !d.data().password) {
                $(".loginShield .newGist").show();
                $(".loginShield .newGist input").keyup(function (e) {
                    if (e.keyCode == 13)
                        $(".loginShield .newGist button").click();
                });

                $(".loginShield .newGist button").on("click", () => {
                    doc.update({
                        "password": $(".loginShield .newGist input")[0].value
                    });
                    $(".loginShield").hide();
                    self.firebaseLoadContinue(doc);
                });
            } else {
                //show login button and validate
                __pass = d.data().password;
                $(".loginShield .oldGist").show();
                $(".loginShield .oldGist input").keyup(function (e) {
                    if (e.keyCode == 13)
                        $(".loginShield .oldGist button").click();
                });
                $(".loginShield .oldGist button").on("click", () => {
                    if (__pass == $(".loginShield .oldGist input")[0].value) {
                        $(".loginShield").hide();
                        self.firebaseLoadContinue(doc);
                    } else {
                        $(".loginShield .oldGist h2").text("Incorrect password :/ Please try again!");
                        $(".loginShield .oldGist input")[0].value = "";
                    }
                })
            }
            //register events for clicking buttons and whatnot
        })
    }

    //----------Title changes----------//
    $("h1").on("keyup", () => {
        if (this.firebaseEnabled) {
            this.firebaseDoc.update({
                name: $("h1").text()
            });
        }
        $("title").text($("h1").text()+" - Synergist");
    })

    //----------Items----------//
    $(this.basediv).on("dblclick", ".floatingItem", (e) => {
        $(".floatingItem").removeClass("selected");
        e.currentTarget.classList.add("selected");
        e.stopPropagation();
        return false;
    })

    this.dragging = false;

    $(this.basediv).on("click", ".floatingItem", (e) => {
        e.stopPropagation();
        //e.preventDefault();
        //return false;
    })

    $(this.basediv).on("mousedown", ".floatingItem", (e) => {
        if (e.which != 1) return;
        this.handleMoveStart(e);
    });
    $(this.basediv).on("touchstart", ".floatingItem", (e) => {
        this.handleMoveStart(e, true);
    });
    this.handleMoveStart = function (e, touch) {
        if (e.currentTarget.classList.contains("selected")) return;
        this.movingDiv = e.currentTarget;
        this.dragging = true;
        if (touch) {
            this.dragDX = e.originalEvent.touches[0].pageX - $(e.currentTarget).offset().left;
            this.dragDY = e.originalEvent.touches[0].pageY - $(e.currentTarget).offset().top;
        } else {
            this.dragDX = e.pageX - $(e.currentTarget).offset().left;
            this.dragDY = e.pageY - $(e.currentTarget).offset().top;
        }

        //e.preventDefault();
        //return false;
    }
    $(this.basediv).on("mousemove", (e) => {
        this.handleMove(e);
    });

    $(this.basediv).on("touchmove", (e) => {
        this.handleMove(e, true);
    });

    this.handleMove = function (e, touch) {
        if (this.dragging) {
            if ($(this.movingDiv.parentElement).is(".bottomDrawer")) {
                $(this.basediv).append(this.movingDiv);
                //this.dragDX = this.movingDiv.offsetLeft - e.clientX;
                //this.dragDY = this.movingDiv.offsetTop - e.clientY;
                this.items[this.movingDiv.dataset.id].unhide();
            }
            this.movingDiv.classList.add("moving");
            if (touch) e = e.originalEvent.touches[0];
            this.movingDiv.style.left = e.clientX - this.basediv.offsetLeft - this.dragDX;
            this.movingDiv.style.top = e.clientY - this.basediv.offsetTop - this.dragDY;
            //handle moving into the bottomdrawer
            let elements = document.elementsFromPoint(e.clientX, e.clientY);
            if ($(elements).filter(".bottomDrawer").length) $(".bottomDrawer")[0].style.background = "pink";
            else $(".bottomDrawer")[0].style.background = "lightgray";
        }
    }

    $("body").on("touchend", (e) => {
        this.handleMoveEnd(e, true);
    });
    $("body").on("mouseup mouseleave", (e) => {
        this.handleMoveEnd(e);
    });
    this.handleMoveEnd = function (e, touch) {
        if (this.dragging) {
            this.dragging = false;
            this.movingDiv.classList.remove("moving");
            if (touch) e = e.originalEvent.changedTouches[0];
            let elements = document.elementsFromPoint(e.clientX, e.clientY);
            if ($(elements).filter(".bottomDrawer").length) this.items[this.movingDiv.dataset.id].hide(this.currentView);
            else if (this.firebaseEnabled) this.items[this.movingDiv.dataset.id].webUpdatePosition();
            $(".bottomDrawer")[0].style.background = "lightgray";
        }
    }
    $(this.basediv).on("dblclick", (e) => {
        if ($(e.target).is(".leftLabel") || $(e.target).is(".rightLabel")) return;
        new_guid = guid();
        this.makeNewItem(new_guid, e);
    })
    $(this.basediv).on("click", (e) => {
        $(".floatingItem").removeClass("selected");
    })
    this.makeNewItem = function (id, itm) {
        let ni;
        if (itm.viewData) {
            if (this.firebaseEnabled) {
                ni = new floatingItem(itm, this, this.itemCollection.doc(id), id);
            } else {
                ni = new floatingItem(itm, this, undefined, id);
            }
        } else {
            let e = itm;
            ni = new floatingItem(this, e.offsetX, e.offsetY, id);
            if (this.firebaseEnabled) {
                ni.fireDoc = this.itemCollection.doc(id);
            }
            if (this.firebaseEnabled) {
                this.itemCollection.doc(id).set(ni.toObject());
            }
        }
        this.items[id] = ni;
        ni.arrangeElement(this.currentView);
    }

    this.removeItem = function (id, auto) {
        $(".floatingItem[data-id='" + id + "']").remove();
        delete this.items[id];
        if (this.firebaseEnabled && !auto) {
            this.itemCollection.doc(id).delete();
        }
    }

    //----------touch api----------//
    $(".fab").on("click", (e) => {
        new_guid = guid();
        this.makeNewItem(new_guid, e);
    })
    //----------Views----------//
    $(".viewName").on("keyup", (e) => {
        this.views[e.currentTarget.dataset.listname].name = e.currentTarget.innerText;
        if (this.firebaseEnabled) this.viewCollection.doc(e.currentTarget.dataset.listname).update({
            name: e.currentTarget.innerText
        });
    })

    $(".leftLabel").on("keyup", (e) => {
        this.views[this.currentView].left = e.currentTarget.innerText;
        if (this.firebaseEnabled) this.viewCollection.doc(this.currentView).update({
            left: e.currentTarget.innerText
        });
    })

    $(".rightLabel").on("keyup", (e) => {
        this.views[this.currentView].right = e.currentTarget.innerText;
        if (this.firebaseEnabled) this.viewCollection.doc(this.currentView).update({
            right: e.currentTarget.innerText
        });
    })

    $(".synergist-container").on("keyup", ".floatingItem h3>span", (e) => {
        let id = e.currentTarget.parentElement.parentElement.dataset.id;
        if (this.firebaseEnabled) this.itemCollection.doc(id).update({
            title: e.currentTarget.innerText
        });
    })

    $(".synergist-container").on("keyup", ".floatingItem p", (e) => {
        let id = e.currentTarget.parentElement.dataset.id;
        if (this.firebaseEnabled) this.itemCollection.doc(id).update({
            description: e.currentTarget.innerText
        });
    })
    this.switchView = function (ln) {
        if (this.views[ln].type == "singleAxis") {
            $(".leftLabel").text(this.views[ln].left);
            $(".rightLabel").text(this.views[ln].right);
            $(".leftLabelContainer").show();
            $(".rightLabelContainer").show();
        } else {
            $(".leftLabelContainer").hide();
            $(".rightLabelContainer").hide();
        }
        $(".viewName").text(this.views[ln].name);
        $(".viewName")[0].dataset.listname = ln;
        for (i in this.items) {
            this.items[i].arrangeElement(ln);
        }
        this.currentView = ln;
    }

    this.makeNewView = function (id, obj, auto) {
        //creating new view vs validating view from firebase
        if (obj == undefined) {
            obj = {
                name: 'New View',
                left: "Less favourable",
                right: "More favourable",
                type: "blank"
            }
            if (this.firebaseEnabled) this.viewCollection.doc(id).set(obj);
        } else {
            if (!obj.type) {
                obj.type = "singleAxis"
            }
        };
        if (!auto) {
            for (i in this.items) {
                this.items[i].makeNewView(id);
            }
        } else {
            for (i in this.items) {
                this.items[i].assertView(id);
            }
        }
        this.views[id] = obj;
    }

    this.cloneView=function(viewName){
        let newViewId=guid();
        copyobj=Object.assign({},this.views[viewName]);
        copyobj.name="Copy of "+ copyobj.name;
        this.makeNewView(newViewId,copyobj);
        if (this.firebaseEnabled) this.viewCollection.doc(newViewId).set(copyobj);
        for (i in this.items){
            this.items[i].viewData[newViewId]=Object.assign({},this.items[i].viewData[viewName]);
        }
        this.switchView(newViewId);
        for (i in this.items){
            this.items[i].webUpdatePosition();
        }
    }

    this.destroyView=function(viewName, auto){
        if (Object.keys(this.views).length==1){
            alert("Ack! You can't remove the last view...");
            return;
        }
        delete this.views[viewName];
        if (this.firebaseEnabled && !auto) {
            this.viewCollection.doc(viewName).delete();
        }
        this.switchView(Object.keys(this.views)[0]);
    }
    //----------View options menu----------//
    $(".synergist-banner h2 .gears").on("click", () => {
        //also load the info
        $(".viewType")[0].value = this.views[this.currentView].type;
        $(".backOptionsMenu").show();
    })
    $(".backOptionsMenu .cb").on("click", () => {
        this.switchView(this.currentView);
    })
    $(".viewType").on("change", () => {
        this.views[this.currentView].type = $(".viewType")[0].value;
        if (this.firebaseEnabled) this.viewCollection.doc(this.currentView).update({
            'type': $(".viewType")[0].value
        });
    })

    //////////////////More button//////////////////
    $(".plusbutton").on("click", () => {
        $(".moreMenu").show();
    });

    $(".wsm button").on("click", () => {
        //generate the wsm
        let wsm = {};
        let axes = [];
        for (v in this.views) {
            if (this.views[v].type == "singleAxis") {
                axes.push(v);
                for (i in this.items) {
                    if (!this.items[i].viewData[v].hidden) {
                        //add its x value to the WSM
                        if (!wsm[i]) wsm[i] = {};
                        wsm[i][v] = this.items[i].viewData[v].x.toFixed(2);
                    } else {
                        wsm[i][v] = "";
                    }
                }
            }
        }
        //Open a new page with a WSM
        w = window.open('', '_blank');
        w.document.write(`
        <style>
        table, tr, th, td{
            border-collapse:collapse;
            border: 1px solid;
        }
        </style>
        <table>
        <tbody>
        </tbody>
        </table>
        `);
        // add the header
        headerRow = "<tr><th></th>";
        for (axis = 0; axis < axes.length; axis++) {
            headerRow += "<th>" + axes[axis] + "</th>";
        }
        headerRow += "</tr>";
        $(w.document.body).find("tbody").append(headerRow);
        for (i in wsm) {
            itemRow = "<tr><td>" + this.items[i].toObject().title + "</td>";
            for (axis in wsm[i]) {
                itemRow += "<td>" + wsm[i][axis] + "</td>";
            }
            itemRow += "</tr>";
            $(w.document.body).find("tbody").append(itemRow);
        }

    })
    //////////////////Banner//////////////////

    $("body").on("click", ".synergist-banner .dropdown li", (e) => {
        if (e.currentTarget.dataset.listname == "new") {
            //make a new view
            nv = Date.now().toString();
            this.makeNewView(nv);
            this.switchView(nv);
        } else {
            ln = e.currentTarget.dataset.listname;
            this.switchView(ln);
        }
        $(".synergist-banner h2>span>div").hide();
    });

    $(".synergist-banner h2>span>span:not(.viewName)").on("click", (e) => {
        //list all the links, then show it.
        $(".synergist-banner h2>span>div.dropdown").empty();
        for (i in this.views) {
            v = this.views[i].name;
            $(".synergist-banner h2>span>div.dropdown").append(`<li data-listname="` + i + `"><span>` + v + `</span></li>`);
        }
        $(".synergist-banner h2>span>div.dropdown").append(`<li data-listname="new" ><em>Add another view</em></li>`);
        $(".synergist-banner h2>span>div").show();
    })

    //----------Misc UI shenanigans----------//

    $("body").on("keydown", "h1,h1 *,h2,h2 *,h3,h3 *", (e) => {
        if (e.target.contentEditable && e.key == "Enter") e.preventDefault();
    })

    $(this.basediv).on("mousedown", (e) => {
        if (!($(e.target).is("li") || $(e.target.parentElement).is("li"))) {
            $(".synergist-banner h2>span>div").hide();
        }
        if (!$(e.target).is(".floatingSetupMenu *")) $(".floatingSetupMenu").hide();
    });
    $('.specialScroll').bind('mousewheel', function (e) {
        if (e.target != e.currentTarget) return;
        var delta = e.originalEvent.deltaY;
        if (delta == 0 || delta == -0) delta = e.originalEvent.deltaX;
        e.currentTarget.scrollLeft += delta / 5;
    });

    //----------Context menu for floatingItems----------//
    contextMenuManager.registerContextMenu(
        `<li class="deleteButton">Delete</li>
        <li class="hideButton">Hide from this view</li>
        <li class="showOnlyButton">Show only in this view</li>`,
        $("body")[0],".floatingItem",(e) => {
            let cte = e.target;
            while (!$(cte).is(".floatingItem")) cte = cte.parentElement;
            this.contextedElement = cte;
        }
    )

    $(".contextMenu .deleteButton").on("click", (e) => {
        //delete the div and delete its corresponding item
        this.removeItem(this.contextedElement.dataset.id);
        $('.contextMenu').hide();
    })

    $(".contextMenu .hideButton").on("click", (e) => {
        //delete the div and delete its corresponding item
        this.items[this.contextedElement.dataset.id].hide(this.currentView);
        $('.contextMenu').hide();
    })

    $(".contextMenu .showOnlyButton").on("click", (e) => {
        //delete the div and delete its corresponding item
        this.items[this.contextedElement.dataset.id].hide();
        $('.contextMenu').hide();
    })
    //----------Context menu for views----------//
    contextMenuManager.registerContextMenu(
        `<li class="viewDeleteButton">Delete</li>
        <li class="viewCloneButton">Clone this view</li>`,
        $(".viewName")[0]);

    $(".contextMenu .viewDeleteButton").on("click", (e) => {
        //delete the view
        this.destroyView(this.currentView);
        $('.contextMenu').hide();
    })

    $(".contextMenu .viewCloneButton").on("click", (e) => {
        //delete the view
        this.cloneView(this.currentView);
        $('.contextMenu').hide();
    })

    //----------floating helper menu----------//
    $(this.basediv).on("click", ".floatingItem h3 img", (e) => {
        this.floatingSetupParent = e.currentTarget.parentElement.parentElement;
        $(".floatingSetupMenu").show();
        $(".floatingSetupMenu")[0].style.left = this.floatingSetupParent.offsetLeft - this.floatingSetupParent.parentElement.offsetLeft;
        $(".floatingSetupMenu")[0].style.top = this.floatingSetupParent.offsetTop + this.floatingSetupParent.parentElement.offsetTop + this.floatingSetupParent.offsetHeight + 10;
        e.stopPropagation();
    })

    this.backColorUpdateReceived = function (jscolor) {
        this.floatingSetupParent.style.background = "#" + jscolor;
        this.items[this.floatingSetupParent.dataset.id].webUpdateColor();
    }
    this.foreColorUpdateReceived = function (jscolor) {
        this.floatingSetupParent.style.color = "#" + jscolor;
        this.items[this.floatingSetupParent.dataset.id].webUpdateColor();
    }
    //----------Final initialisation stuff----------//
    this.makeNewView("main");
    this.views["main"].name = "Main";
    this.switchView("main");
}