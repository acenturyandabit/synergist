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
    this.makeNewView = function (name,show=false) {
        this.viewData[name] = {
            x: 0.4,
            y: 0.4,
            hidden: show
        };
    }

    this.assertView = function (name) {
        if (this.viewData[name] == undefined || this.viewData[name].x == undefined || this.viewData[name].y == undefined) {
            this.makeNewView(name,true);
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
                hidden: true
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

function _synergist(div) {
    //----------Initialisation----------//
    this.items = {};
    let self=this;
    this.localSavePrefix = "";
    this.views = {
        "main": {
            name: "Main",
            left: "Less favourable",
            right: "More favourable"
        }
    };
    // all the html stuff; brackets so you can hide it in an ide
    this.makeHTML = function () {
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
        <span>Background:<input class="jscolor backcolor" onchange="fireman.thing.backColorUpdateReceived(this.jscolor)" value="ffffff"></span>
        <span>Text:<input class="jscolor forecolor" onchange="fireman.thing.foreColorUpdateReceived(this.jscolor)" value="ffffff"></span>
    </div>
    <div class="splashScreen dialog noClose">
        <h1>Welcome to synergist!</h1>
        <h2>Make a new document</h2>
        <input  placeholder="Enter Name..."class="newGistName"><br>
        <button class="newOnlineButton">Make an online (shared) gist</button><br>
        <button class="newOfflineButton">Make an offline (local) gist</button>
        <h2>Open a recent document:</h2>
        <div class="recentDocuments">
            <p>Nothing to show here :3</p>
        </div>
        <h2>First time here? Check out our tutorial :)</h2>
        <a href="?tute">Click here!</a>
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
        $("title").text(d.name + " - Synergist");
        for (i in d.views) {
            this.makeNewView(i, d.views[i]);
        }
        for (i in d.items) {
            this.makeNewItem(i, d.items[i]);
        }
        this.switchView("main"); //all docs are guarunteed to have a main riiight???
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
        else {
            $("h1").text(name);
            $("title").text(name + " - Synergist");
        }
    }
    //----------Web based loading----------//
    this.firebaseEnabled = false;

    this.firebaseLoadContinue = function (doc) {
        let _syn = this;
        doc.onSnapshot(shot => {
            //if (shot.metadata.hasPendingWrites) return;
            d = shot.data();
            //d contains name only.
            if (!d) {
                $("h1").text(_syn.localSavePrefix);
                $("title").text(+syn.localSavePrefix + " - Synergist");
                return;
            }
            $("h1").text(d.name);
            $("title").text(d.name + " - Synergist");
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
                        self.removeItem(c.doc.id, true);
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
                        self.removeItem(c.doc.id, true);
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
        //clear everything
        this.views = {};
        this.items = {};
        //start firebase
        this.firebaseEnabled = true;
        this.firebaseDoc = doc;
        doc.get().then(d => {
            if (!d.exists || !(d.data().name)) {
                doc.update({
                    name: self.localSavePrefix
                });
                let firstView = {
                    name: "Main",
                    left: "Less favourable",
                    right: "More favourable"
                }
                doc.collection("views").doc("main").set(firstView);
                self.makeNewView("main", firstView);
            }
            self.firebaseLoadContinue(doc);
        })
    }

    //----------Title changes----------//
    $("h1").on("keyup", () => {
        if (this.firebaseEnabled) {
            this.firebaseDoc.update({
                name: $("h1").text()
            });
        }
        $("title").text($("h1").text() + " - Synergist");
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

    this.cloneView = function (viewName) {
        let newViewId = guid();
        copyobj = Object.assign({}, this.views[viewName]);
        copyobj.name = "Copy of " + copyobj.name;
        this.makeNewView(newViewId, copyobj);
        if (this.firebaseEnabled) this.viewCollection.doc(newViewId).set(copyobj);
        for (i in this.items) {
            this.items[i].viewData[newViewId] = Object.assign({}, this.items[i].viewData[viewName]);
        }
        this.switchView(newViewId);
        for (i in this.items) {
            this.items[i].webUpdatePosition();
        }
    }

    this.destroyView = function (viewName, auto) {
        if (Object.keys(this.views).length == 1) {
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
        $("body")[0], ".floatingItem", (e) => {
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
    $("floatingSetupMenu input.backcolor").on("change", this.backColorUpdateReceived);
    $("floatingSetupMenu input.forecolor").on("change", this.foreColorUpdateReceived);
    this.backColorUpdateReceived = function (jscolor) {
        //jscolor=jscolor.jscolor;
        this.floatingSetupParent.style.background = "#" + jscolor;
        this.items[this.floatingSetupParent.dataset.id].webUpdateColor();
    }
    this.foreColorUpdateReceived = function (jscolor) {
        //jscolor=jscolor.jscolor;
        this.floatingSetupParent.style.color = "#" + jscolor;
        this.items[this.floatingSetupParent.dataset.id].webUpdateColor();
    }
    //----------Final initialisation stuff----------//
    this.makeNewView("main");
    this.views["main"].name = "Main";
    this.switchView("main");
    //----------tutorial----------//
    this.registerTutorial = function () {
        $(".floatingItem[data-id='13'] p").on("click", () => {
            window.location.href = window.location.href.replace("&tute", "");
        })
    }
    //----------Show splash screen----------//
    this.showSplash=function(){
        //populate recent documents
        let recents=JSON.parse(localStorage.getItem("___synergist_recent_docs"));
        if (recents){
            $(".recentDocuments").empty();
            for (i=0;i<recents.length;i++){
                let url=window.location.href+"?gist="+recents[i].gistName;
                if (recents[i].type=="offline"){
                    url+="&offline";
                }
                $(".recentDocuments").append(`<p><a href=`+url+`>`+recents[i].gistName+`</a></p>`);
            }
        }
        $(".splashScreen").show();
    }
    $(".newOnlineButton").on("click",()=>{
        if ($(".newGistName")[0].value.length){
            window.location.href=window.location.href+"?gist="+$(".newGistName")[0].value;
        }
    });
    $(".newOfflineButton").on("click",()=>{
        if ($(".newGistName")[0].value.length){
            window.location.href=window.location.href+"?gist="+$(".newGistName")[0].value+"&offline";
        }
    });
}

$(()=>{
    synergist=new _synergist(document.body); 
    fireman=new _fireman({
        documentQueryKeyword:"gist",
        load: (doc,id)=>{
            //update the recents
            let recents=JSON.parse(localStorage.getItem("___synergist_recent_docs"));
            if (!recents)recents=[];
            let seenbefore=false;
            recents.forEach((v)=>{if (v.gistName==id && !v.offline){seenbefore=true}});
            if(!seenbefore){
                recents.push({gistName:id});
                localStorage.setItem("___synergist_recent_docs",JSON.stringify(recents));
            }
            synergist.registerFirebaseDoc(doc,id);
        },
        autocreate:true,
        makeNewDocument:function(doc, id){
            let recents=JSON.parse(localStorage.getItem("___synergist_recent_docs"));
            if (!recents)recents=[];
            let seenbefore=false;
            recents.forEach((v)=>{if (v.gistName==id && !v.offline){seenbefore=true}});
            if(!seenbefore){
                recents.push({gistName:id});
                localStorage.setItem("___synergist_recent_docs",JSON.stringify(recents));
            }
            synergist.registerFirebaseDoc(doc,id);
        },
        passwall:true,
        autopass: true,
        passwordKeyname: "password",

        offlineKeyword:"offline",
        offlineLoad:(id)=>{
            let recents=JSON.parse(localStorage.getItem("___synergist_recent_docs"));
            let seenbefore=false;
            recents.forEach((v)=>{if (v.gistName==id && v.offline){seenbefore=true}});
            if(!seenbefore){
                recents.push({gistName:id});
                localStorage.setItem("___synergist_recent_docs",JSON.stringify(recents));
            }
            synergist.offlineLoad(me.documentName);
        },
        tutorialQueryKeyword:"tute",
        tutorialFunction: (doc, id)=>{
            synergist.loadFromData({"views":{"1545790901615":{"left":"Less favourable","name":"Views","right":"More favourable","type":"singleAxis"},"1545791235016":{"left":"Less favourable","name":"Collaboration","right":"More favourable","type":"singleAxis"},"1545971755534":{"left":"Less favourable","name":"More","right":"More favourable","type":"singleAxis"},"main":{"left":"Less favourable","name":"Introduction","right":"More favourable","type":"singleAxis"}},"items":[{"viewData":{"1545790901615":{"hidden":true,"x":0.0234375,"y":0.6818757921419518},"1545791235016":{"hidden":true,"x":0.7489583333333333,"y":0.12688442211055276},"1545971755534":{"hidden":true,"x":0.4,"y":0.39923954372623577},"main":{"hidden":false,"x":0.3463541666666667,"y":0.15201005025125627}},"title":"How does it work?","description":"Synergist revolves around Items and Views.\n\nItems are these little white boxes. Double click anywhere in the grey region to add an item! \n\nTo edit the contents of an item, just click the thing you want to edit, and edit it :)","forecolor":"","backcolor":""},{"viewData":{"1545790901615":{"hidden":false,"x":0.39166666666666666,"y":0.17997465145754118},"1545791235016":{"hidden":true,"x":0.4,"y":0.39824120603015073},"1545971755534":{"hidden":true,"x":0.4,"y":0.39923954372623577},"main":{"hidden":true,"x":0.09270833333333334,"y":0.36055276381909546}},"title":"Editing views","description":"You can edit the name of a view by clicking the name on the top left and typing. \n\nThe \"less favourable\" and \"more favourable\" arrows can also be edited, to create a  scale from left to right. Again, just click and type :)","forecolor":"","backcolor":""},{"viewData":{"1545790901615":{"hidden":true,"x":0.3963541666666667,"y":0.7275031685678074},"1545791235016":{"hidden":true,"x":0.45677083333333335,"y":0.23115577889447236},"1545971755534":{"hidden":true,"x":0.4,"y":0.39923954372623577},"main":{"hidden":true,"x":0.6057291666666667,"y":0.6030150753768844}},"title":"Have fun!","description":":)","forecolor":"","backcolor":""},{"viewData":{"1545790901615":{"hidden":true,"x":0.05416666666666667,"y":0.7110266159695817},"1545791235016":{"hidden":true,"x":0,"y":0},"1545971755534":{"hidden":true,"x":0.4,"y":0.39923954372623577},"main":{"hidden":false,"x":0.5005208333333333,"y":0.24623115577889448}},"title":"Manipulating items","description":"To rearrange items, click and drag them around the canvas.\n\nYou can double click an item to lock it in place, to allow for easy editing.\n\nTo delete an item, right click on it and press the delete button in the popup.","forecolor":"","backcolor":""},{"viewData":{"1545790901615":{"hidden":false,"x":0.27291666666666664,"y":0.17110266159695817},"1545791235016":{"hidden":true,"x":0.4,"y":0.39824120603015073},"1545971755534":{"hidden":true,"x":0.4,"y":0.39923954372623577},"main":{"hidden":true,"x":0.3416666666666667,"y":0.44472361809045224}},"title":"Views","description":"You can use different views to represent different organisations of items. \n\nYou've probably met the \"Add another view\" button, which is how you add new views!\n","forecolor":"","backcolor":""},{"viewData":{"1545790901615":{"hidden":true,"x":0.4,"y":0.39923954372623577},"1545791235016":{"hidden":true,"x":0.4,"y":0.39949748743718594},"1545971755534":{"hidden":false,"x":0.4979166666666667,"y":0.5617084917617237},"main":{"hidden":true,"x":0.4,"y":0.39824120603015073}},"title":"Unhiding","description":"You can unhide items by dragging them out of the bottom bar.","forecolor":"rgb(0, 0, 0)","backcolor":"rgb(236, 59, 255)"},{"viewData":{"1545790901615":{"hidden":true,"x":0.4,"y":0.39923954372623577},"1545791235016":{"hidden":true,"x":0.4,"y":0.39949748743718594},"1545971755534":{"hidden":false,"x":0.5151041666666667,"y":0.11153358681875793},"main":{"hidden":true,"x":0.4,"y":0.39824120603015073}},"title":"Context menu","description":"Right click on any item to show its context menu. From there you can show or hide items on different views.","forecolor":"rgb(0, 0, 0)","backcolor":"rgb(255, 160, 77)"},{"viewData":{"1545790901615":{"hidden":true,"x":0.353125,"y":0.5424588086185045},"1545791235016":{"x":0.2838541666666667,"y":0.16834170854271358},"1545971755534":{"hidden":true,"x":0.6057291666666667,"y":0.6780735107731305},"main":{"hidden":true,"x":0.4244791666666667,"y":0.3907035175879397}},"title":"Collaboration","description":"All gists are stored on Firebase, so you can collaborate with your friends in real time online.\n\nTo collaborate with your teammates on a gist, simply drop them the url :)\n\nTo create a new gist, replace the \"Name\" in ?gist=\"Name\" with your own gist name.","forecolor":"","backcolor":""},{"viewData":{"1545790901615":{"hidden":false,"x":0.625,"y":0.15462610899873258},"1545791235016":{"hidden":true,"x":0.4,"y":0.39824120603015073},"1545971755534":{"hidden":true,"x":0.4,"y":0.39923954372623577},"main":{"hidden":true,"x":0.36875,"y":0.5917085427135679}},"title":"Capiche?","description":"Check out the next view to continue!","forecolor":"","backcolor":""},{"viewData":{"1545790901615":{"hidden":true,"x":0.05416666666666667,"y":0.7351077313054499},"1545791235016":{"hidden":true,"x":0,"y":0},"1545971755534":{"hidden":true,"x":0.4,"y":0.39923954372623577},"main":{"hidden":false,"x":0.640625,"y":0.30527638190954776}},"title":"Capice?","description":"There's more! \n\nEach screen is a view. Views allow items to be organised in different ways. \n\nTo switch a view, go to the top left dropdown menu [Tutorial v] and click the (v) to switch to another view.","forecolor":"","backcolor":""},{"viewData":{"1545790901615":{"hidden":true,"x":0.051041666666666666,"y":0.7769328263624842},"1545791235016":{"hidden":true,"x":0,"y":0},"1545971755534":{"hidden":true,"x":0.4,"y":0.39923954372623577},"main":{"hidden":false,"x":0.18177083333333333,"y":0.0992462311557789}},"title":"Hey there!","description":"Welcome to Synergist! \n\nSynergist is a platform for organising notes, ideas or whatever you want!","forecolor":"rgb(0, 0, 0)","backcolor":"rgb(13, 255, 96)"},{"viewData":{"1545790901615":{"hidden":false,"x":0.50625,"y":0.16476552598225602},"1545791235016":{"hidden":true,"x":0.5322916666666667,"y":0.43844221105527637},"1545971755534":{"hidden":true,"x":0.4,"y":0.39923954372623577},"main":{"hidden":true,"x":0.08385416666666666,"y":0.6457286432160804}},"title":"Items and views","description":"Items recall their position in each view; so dragging items on one view won't affect their positions on another view. This is useful if you want to cluster items or sort them by different categories.\n\nAs of right now, items are present on all views, but I'm working on changing this :3","forecolor":"","backcolor":""},{"viewData":{"1545790901615":{"hidden":true,"x":0.4,"y":0.39923954372623577},"1545791235016":{"hidden":true,"x":0.4,"y":0.39949748743718594},"1545971755534":{"hidden":false,"x":0.328125,"y":0.2719822560202788},"main":{"hidden":true,"x":0.796875,"y":0.9786432160804021}},"title":"More features","description":"The little settings cog in the top right corner will show some extra features, like changing the colour of your items :)","forecolor":"rgb(0, 0, 0)","backcolor":"rgb(33, 255, 248)"},{"viewData":{"1545790901615":{"x":0.4,"y":0.4,"hidden":true},"1545791235016":{"x":0.4,"y":0.39949748743718594,"hidden":true},"1545971755534":{"x":0.4,"y":0.4,"hidden":true},"main":{"x":0.17291666666666666,"y":0.5489949748743719,"hidden":false}},"title":"All done?","description":"Click here to finish the tutorial!","forecolor":"","backcolor":""}],"name":"Tutorial"});
            synergist.registerTutorial();
        },
        generateDoc: function(db,docName){
            return db.collection("synergist").doc(docName);
        },
        blank:()=>{
            synergist.showSplash();
        },
        config:{
            apiKey: "AIzaSyA-sH4oDS4FNyaKX48PSpb1kboGxZsw9BQ",
            authDomain: "backbits-567dd.firebaseapp.com",
            databaseURL: "https://backbits-567dd.firebaseio.com",
            projectId: "backbits-567dd",
            storageBucket: "backbits-567dd.appspot.com",
            messagingSenderId: "894862693076"
        }
    })
})
