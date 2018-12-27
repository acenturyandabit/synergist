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
    <h3 contentEditable>Item name</h3>
    <p contentEditable>Item description</p>
    `)
    //----------Loading----------//

    this.toObject = function () {
        o = {};
        o.viewData = this.viewData;
        o.title = $(this.div).find("h3").text();
        o.description = $(this.div).find("p").text();
        return o;
    }
    this.fromObject = function (o) {
        this.viewData = o.viewData;
        $(this.div).find("h3").text(o.title);
        $(this.div).find("p").text(o.description);
    }

    //----------Updating functions----------//
    this.makeNewView = function (name) {
        this.viewData[name] = {
            x: 0.5,
            y: 0.5,
            hidden: false
        };
    }
    this.remoteUpdate = function (itm) {
        this.fromObject(itm);
        this.arrangeElement(this.currentView);
    }

    this.arrangeElement = function (view) {
        this.currentView = view;
        if (this.viewData[view].hidden)this.div.style.display="none";
        else this.div.style.display="block"; 
        if (!isNaN(this.viewData[view].x) && this.viewData[view].x <= 1) {
            if (this.parent.basediv.clientHeight > this.parent.basediv.clientWidth) {
                this.div.style.left = Math.floor(this.viewData[view].y * this.parent.basediv.clientWidth) + "px";
                this.div.style.top = Math.floor(this.viewData[view].x * this.parent.basediv.clientHeight) + "px";
            } else {
                this.div.style.left = Math.floor(this.viewData[view].x * this.parent.basediv.clientWidth) + "px";
                this.div.style.top = Math.floor(this.viewData[view].y * this.parent.basediv.clientHeight) + "px";
            }
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
                if (me.parent.basediv.clientHeight > me.parent.basediv.clientWidth) {
                    me.viewData[me.currentView] = {
                        y: xx / me.parent.basediv.clientWidth,
                        x: yy / me.parent.basediv.clientHeight,
                        hidden:false
                    }
                } else {
                    me.viewData[me.currentView] = {
                        x: xx / me.parent.basediv.clientWidth,
                        y: yy / me.parent.basediv.clientHeight,
                        hidden:false
                    }
                }

            }
        })
    });
    this.webUpdatePosition = function () {
        let updateItm = {};
        updateItm['viewData.' + me.currentView] = me.viewData[me.currentView];
        me.fireDoc.update(updateItm);
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
                x: 0,
                y: 0,
                hidden:false
            };
        })
        this.viewData[this.currentView] = {
            x: x / this.parent.basediv.clientWidth,
            y: y / this.parent.basediv.clientHeight,
            hidden:false
        };
        this.id = id;
        this.div.dataset.id = id
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
    $(div).html(`
    <div class="synergist-container">
        <div class="synergist-banner">
            <h1 contentEditable>Pad name</h1>
            <h2>View: <span><span contenteditable class="viewName" data-listname='main'>Main</span><span>v</span>
            <div class="dropdown" style="display:none">
                <li data-listname="Main" ><span>Main</span></li>
                <li data-listname="new" ><em>Add another view</em></li>
            </div>
            </span></h2>
        </div>
        <div class="synergist">
        <div class="backwall">
        <span class="leftLabelContainer"><span class="phoneNoShow"><<</span><span class="leftLabel" contentEditable>` + this.views.main.left + `</span></span>
        <span class="rightLabelContainer"><span class="rightLabel" contentEditable>` + this.views.main.right + `</span><span class="phoneNoShow">>>></span></span>
        </div>
        </div>
    </div>
    <div class="contextMenu" style="display:none; position:absolute;">
        <li class="deleteButton">Delete</li>
        <li class="hideButton">Hide from this view</li>
        <li class="showOnlyButton">Show only in this view</li>
    </div>
    `);

    this.basediv = $(div).find(".synergist")[0];
    this.currentView = "main";
    //----------Phone specific ui elements----------//
    if (isPhone()){
        $(".synergist").append(`
<button class="fab">+</button>
        `)
        $(".leftLabelContainer,.rightLabelContainer").addClass("phone");
    }

    try{
        window.screen.lockOrientation("portrait-primary");
    }catch(e){
        console.log("screen lock failed");
    }

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
        for (i in d.views) {
            this.makeNewView(i, d.views[i]);
        }
        for (i in d.items) {
            this.makeNewItem(i, d.items[i]);
        }
        this.switchView(Object.keys(this.views)[0]);
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

    this.tryLocalLoad = function () {
        let itm = JSON.parse(window.localStorage.getItem("synergist_data_" + this.localSavePrefix));
        if (itm) this.loadFromData(itm);
    }
    //----------Web based loading----------//
    this.firebaseEnabled = false;
    this.registerFirebaseDoc = function (doc) {
        //clear everything
        this.views = {};
        this.items = {};
        //start firebase
        self = this;
        this.firebaseEnabled = true;
        this.firebaseDoc = doc;
        doc.get().then(d => {
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
            }
        })
        doc.onSnapshot(shot => {
            if (shot.metadata.hasPendingWrites) return;
            d = shot.data();
            //d contains name only.
            if (!d) return;
            $("h1").text(d.name);
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
                        self.removeItem(c.doc.id);
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
                        this.views[c.doc.id] = c.doc.data();
                        if (this.currentView == c.doc.id) this.switchView(c.doc.id);
                        break;
                }
            })
            if (self.firstRun) {
                self.firstRun = false;
                self.switchView("main");
            }
        })
        //collection for views
    }

    //----------Title changes----------//
    $("h1").on("keyup", () => {
        if (this.firebaseEnabled) {
            this.firebaseDoc.update({
                name: $("h1").text()
            });
        }
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
        if (e.currentTarget.classList.contains("selected")) return;
        this.movingDiv = e.currentTarget;
        this.dragging = true;
        this.dragDX = this.movingDiv.offsetLeft - e.clientX;
        this.dragDY = this.movingDiv.offsetTop - e.clientY;
        //e.preventDefault();
        //return false;
    })

    $(this.basediv).on("mousemove", (e) => {
        if (this.dragging) {
            this.movingDiv.classList.add("moving");
            this.movingDiv.style.left = e.clientX + this.dragDX;
            this.movingDiv.style.top = e.clientY + this.dragDY;
        }
    });

    $("body").on("mouseup mouseleave", (e) => {
        if (this.dragging) {
            this.dragging = false;
            this.movingDiv.classList.remove("moving");
            if (this.firebaseEnabled) this.items[this.movingDiv.dataset.id].webUpdatePosition();
        }
    });

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
        this.basediv.appendChild(ni.div);
        this.items[id] = ni;
        ni.arrangeElement(this.currentView);
    }

    //----------touch api----------//
    $(this.basediv).on("touchstart", ".floatingItem", (e) => {
        if (e.currentTarget.classList.contains("selected")) return;
        this.movingDiv = e.currentTarget;
        this.dragging = true;
        _e=e.originalEvent.touches[0];
        this.dragDX = this.movingDiv.offsetLeft - _e.clientX;
        this.dragDY = this.movingDiv.offsetTop - _e.clientY;
        //e.preventDefault();
        //return false;
    })

    $(this.basediv).on("touchmove", (e) => {
        if (this.dragging) {
            _e=e.originalEvent.touches[0];
            this.movingDiv.classList.add("moving");
            this.movingDiv.style.left = _e.clientX + this.dragDX;
            this.movingDiv.style.top = _e.clientY + this.dragDY;
        }
    });

    $("body").on("touchend", (e) => {
        if (this.dragging) {
            this.dragging = false;
            this.movingDiv.classList.remove("moving");
            if (this.firebaseEnabled) this.items[this.movingDiv.dataset.id].webUpdatePosition();
        }
    });

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

    $(".synergist-container").on("keyup", ".floatingItem h3", (e) => {
        let id = e.currentTarget.parentElement.dataset.id;
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
        $(".viewName").text(this.views[ln].name);
        $(".leftLabel").text(this.views[ln].left);
        $(".rightLabel").text(this.views[ln].right);
        $(".viewName")[0].dataset.listname = ln;
        for (i in this.items) {
            this.items[i].arrangeElement(ln);
        }
        this.currentView = ln;
    }

    this.makeNewView = function (id, obj, auto) {
        if (obj == undefined) {
            obj = {
                name: 'New View',
                left: "Less favourable",
                right: "More favourable",
            }
            if (this.firebaseEnabled) this.viewCollection.doc(id).set(obj);
        };
        if (!auto) {
            for (i in this.items) {
                this.items[i].makeNewView(id);
            }
        }
        this.views[id] = obj;
    }

    //////////////////Banner//////////////////

    $("body").on("click", ".synergist-banner .dropdown li", (e) => {
        if (e.currentTarget.dataset.listname == "new") {
            //make a new view
            nv = Date.now().toString();
            this.makeNewView(nv);
            this.switchView(nv);
        } else {
            ln = e.currentTarget.dataset.listname;
            this.switchView(ln)

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

    $("body").on("keydown", "h1,h2,h3", (e) => {
        if (e.target.contentEditable && e.key == "Enter") e.preventDefault();
    })

    $("body").on("mousedown", (e) => {
        if (!($(e.target).is("li") || $(e.target.parentElement).is("li"))) {
            $(".synergist-banner h2>span>div").hide();
        }
        if (!$(e.target).is("li")) $(".contextMenu").hide();
    });

    //----------Context menu----------//
    $("body").on("contextmenu", ".floatingItem", (e) => {
        let cte = e.target;
        while (!$(cte).is(".floatingItem")) cte = cte.parentElement;
        this.contextedElement = cte;
        $(".contextMenu")[0].style.left = e.screenX - this.basediv.offsetLeft;
        $(".contextMenu")[0].style.top = e.screenY - this.basediv.offsetTop;
        $(".contextMenu").show();
        e.preventDefault();
    })
    $(".contextMenu :contains('Delete')").on("click", (e) => {
        //delete the div and delete its corresponding item
        this.removeItem(this.contextedElement.dataset.id);
        $('.contextMenu').hide();
    })

    this.removeItem = function (id, auto) {
        $(".floatingItem[data-id='" + id + "']").remove();
        delete this.items[id];
        if (this.firebaseEnabled && !auto) {
            this.itemCollection.doc(id).delete();
        }
    }
}
