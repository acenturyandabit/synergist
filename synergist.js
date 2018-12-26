function guid() {
    let pool = "1234567890qwertyuiopasdfghjklzxcvbnm";
    tguid = "";
    for (i = 0; i < 4; i++) tguid += pool[Math.floor(Math.random() * pool.length)];
    return tguid;
}

function floatingItem(views, currentView, x, y, id) {
    this.div = document.createElement("div");

    this.div.classList.add("floatingItem");
    this.arrangeElement = function (view) {
        this.currentView = view;
        this.div.style.left = this.viewData[view].x;
        this.div.style.top = this.viewData[view].y;
    }
    $(this.div).html(`
    <h3 contentEditable>Item name</h3>
    <p contentEditable>Item description</p>
    `)

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

    let me = this;
    this.mo = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.attributeName === 'style') {
                me.viewData[me.currentView] = {
                    x: me.div.style.left,
                    y: me.div.style.top
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
    if (views instanceof Array) {
        this.viewData = {};
        this.currentView = currentView;
        views.forEach((v, i) => {
            this.viewData[v] = {
                x: 0,
                y: 0
            };
        })
        this.viewData[currentView] = {
            x: x,
            y: y
        };
        this.id = id;
        this.div.dataset.id = id
    } else {
        this.fromObject(views);
        Object.assign(this, views);
        this.id = currentView; //just the second argument
        this.div.dataset.id = currentView;
        //the third argument lol
        this.currentView = x;
        if (y) {
            this.fireDoc = y;
        }
    }
    this.arrangeElement(this.currentView);
    this.makeNewView = function (name) {
        this.viewData[name] = {
            x: 0,
            y: 0
        };
    }
    this.remoteUpdate = function (itm) {
        this.fromObject(itm);
        this.arrangeElement(this.currentView);
    }

}

function synergist(div) {
    //----------Initialisation----------//
    this.items = {};
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
        <span class="leftLabelContainer"><<<span class="leftLabel" contentEditable>` + this.views.main.left + `</span></span>
        <span class="rightLabelContainer"><span class="rightLabel" contentEditable>` + this.views.main.right + `</span>>>></span>
        </div>
        </div>
    </div>
    <div class="contextMenu" style="display:none; position:absolute;">
        <li>Delete</li>
    </div>
    `);

    this.basediv = $(div).find(".synergist")[0];
    this.currentView = "main";
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
            window.localStorage.setItem("synergist_data", JSON.stringify(this.toSaveData()));
            e.preventDefault();
        }
        if (e.ctrlKey && e.key == "o") {
            this.loadFromData(JSON.parse(window.localStorage.getItem("synergist_data")));
            e.preventDefault();
        }
    })
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
        this.firstRun=true;
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
            if (self.firstRun){
                self.firstRun=false;
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
            this.items[this.movingDiv.dataset.id].webUpdatePosition();
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
                ni = new floatingItem(itm, id, this.currentView, this.itemCollection.doc(id));
            } else {
                ni = new floatingItem(itm, id, this.currentView);
            }
        } else {
            let e = itm;
            ni = new floatingItem(Object.keys(this.views), this.currentView, e.offsetX, e.offsetY, id);
            if (this.firebaseEnabled) {
                ni.fireDoc = this.itemCollection.doc(id);
            }
            if (this.firebaseEnabled) {
                this.itemCollection.doc(id).set(ni.toObject());
            }
        }
        this.basediv.appendChild(ni.div);
        this.items[id] = ni;
    }
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
            this.viewCollection.doc(id).set(obj);
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

/*
{"views":{"main":{"left":"Less favourable","name":"Main","right":"More favourable"},"1545790901615":{"name":"Views","left":"Less favourable","right":"More favourable"},"1545791235016":{"name":"Collaboration","left":"Less favourable","right":"More favourable"}},"items":[{"viewData":{"main":{"x":"651px","y":"127px"},"1545790901615":{"x":"45px","y":"540px"},"1545791235016":{"x":"0px","y":"0px"}},"title":"How does it work?","description":"Synergist revolves around Items and Views.\n\nItems are these little white boxes. Double click anywhere in the grey region to add an item! \n\nTo edit the contents of an item, just click the thing you want to edit, and edit it :)"},{"viewData":{"main":{"x":"978px","y":"147px"},"1545790901615":{"x":"104px","y":"563px"},"1545791235016":{"x":"0px","y":"0px"}},"title":"Manipulating items","description":"To rearrange items, click and drag them around the canvas.\n\nYou can double click an item to lock it in place, to allow for easy editing.\n\nTo delete an item, right click on it and press the delete button in the popup."},{"viewData":{"main":{"x":"1218px","y":"122px"},"1545790901615":{"x":"104px","y":"582px"},"1545791235016":{"x":"0px","y":"0px"}},"title":"Capice?","description":"There's more! \n\nEach screen is a view. Views allow items to be organised in different ways. \n\nTo switch a view, go to the top left dropdown menu [Main v] and click the (v) to switch to another view."},{"viewData":{"main":{"x":"388px","y":"106px"},"1545790901615":{"x":"98px","y":"615px"},"1545791235016":{"x":"0px","y":"0px"}},"title":"Hey there!","description":"Welcome to Synergist! \n\nSynergist is a platform for organising notes, ideas or whatever you want!"},{"viewData":{"main":{"x":"0px","y":"0px"},"1545790901615":{"x":"413px","y":"102px"},"1545791235016":{"x":"0px","y":"0px"}},"title":"Views","description":"You can use different views to represent different organisations of items. You've probably met the \"Add another view\" button, which is how you add new views!"},{"viewData":{"main":{"x":"0px","y":"0px"},"1545790901615":{"x":"643px","y":"115px"},"1545791235016":{"x":"0px","y":"0px"}},"title":"Items and views","description":"Items recall their position in each view; so dragging items on one view won't affect their positions on another view. This is useful if you want to cluster items or sort them by different categories.As of right now, items are present on all views, but I'm working on changing this :3"},{"viewData":{"main":{"x":"0px","y":"0px"},"1545790901615":{"x":"862px","y":"114px"},"1545791235016":{"x":"0px","y":"0px"}},"title":"Editing views","description":"You can edit the name of a view by clicking the name on the top left and typing. The \"less favourable\" and \"more favourable\" arrows can also be edited, to create a  scale from left to right. Again, just click and type :)"},{"viewData":{"main":{"x":"0px","y":"0px"},"1545790901615":{"x":"1434px","y":"126px"},"1545791235016":{"x":"0px","y":"0px"}},"title":"Capiche?","description":"Check out the next view to continue!"},{"viewData":{"main":{"x":0,"y":0},"1545790901615":{"x":0,"y":0},"1545791235016":{"x":"393px","y":"231px"}},"title":"Collaboration","description":"All gists are stored on Firebase, so you can collaborate with your friends in real time online.To collaborate with your teammates on a gist, simply drop them the url :)To create a new gist, replace the 'Tutorial' in the URL with another "},{"viewData":{"main":{"x":0,"y":0},"1545790901615":{"x":0,"y":0},"1545791235016":{"x":"651px","y":"222px"}},"title":"Have fun!","description":":)"}],"name":"Pad Name"}
*/