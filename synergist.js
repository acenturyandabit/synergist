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
                if (me.fireDoc){
                    let updateItm={};
                    updateItm['viewData.'+me.currentView]=me.viewData[me.currentView];
                    me.fireDoc.update(updateItm);
                }
            }
        });
    });

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
        this.currentView=x;
        if (y){
            this.fireDoc=y;
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
            this.makeNewItem(d.items[i], i);
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
                let firstView={
                    name:"Main",
                    left: "Less favourable",
                    right: "More favourable"
                }
                doc.collection("views").doc("main").set(firstView);
                self.makeNewItem("main",firstView);
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
                }
            })
        })
        this.viewCollection = doc.collection("views");
        this.viewCollection.onSnapshot(shot => {
            shot.docChanges().forEach((c) => {
                if (c.doc.metadata.hasPendingWrites) return;
                switch (c.type) {
                    case "added":
                        self.makeNewView(c.doc.id, c.doc.data(),true);
                        break;
                    case "modified":
                        this.views[c.doc.id] = c.doc.data();
                        if (this.currentView == c.doc.id) this.switchView(c.doc.id);
                        break;
                }
            })
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
        e.stopPropagation();
        return false;
    })

    this.dragging = false;

    $(this.basediv).on("mousedown", ".floatingItem", (e) => {
        if (e.which != 1) return;
        this.movingDiv = e.currentTarget;
        this.dragging = true;
        this.dragDX = this.movingDiv.offsetLeft - e.clientX;
        this.dragDY = this.movingDiv.offsetTop - e.clientY;
        this.movingDiv.style["boxShadow"] = "5px 5px 5px black";
        this.movingDiv.style.transition = "none";
        //e.preventDefault();
        //return false;
    })

    $(this.basediv).on("mousemove", (e) => {
        if (this.dragging) {
            this.movingDiv.style.left = e.clientX + this.dragDX;
            this.movingDiv.style.top = e.clientY + this.dragDY;
        }
    });

    $("body").on("mouseup mouseleave", (e) => {
        if (this.dragging) {
            this.dragging = false;
            this.movingDiv.style.transition = "all 0.5s ease";
            this.movingDiv.style["boxShadow"] = "none";
        }
    });

    $(this.basediv).on("dblclick", (e) => {
        if ($(e.target).is(".leftLabel") || $(e.target).is(".rightLabel")) return;
        new_guid = guid();
        this.makeNewItem(new_guid,e);
    })
    this.makeNewItem = function (id, itm) {
        let ni;
        if (itm.viewData) {
            if (this.firebaseEnabled){
                ni = new floatingItem(itm, id,this.currentView,this.itemCollection.doc(id));
            }else{
                ni = new floatingItem(itm, id,this.currentView);
            }
        } else {
            let e=itm;
            ni = new floatingItem(Object.keys(this.views), this.currentView, e.offsetX, e.offsetY, new_guid);
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
        if (this.firebaseEnabled)this.viewCollection.doc(e.currentTarget.dataset.listname).update({name:e.currentTarget.innerText});
    })

    $(".leftLabel").on("keyup", (e) => {
        this.views[this.currentView].left = e.currentTarget.innerText;
        if (this.firebaseEnabled)this.viewCollection.doc(this.currentView).update({left:e.currentTarget.innerText});
    })

    $(".rightLabel").on("keyup", (e) => {
        this.views[this.currentView].right = e.currentTarget.innerText;
        if (this.firebaseEnabled)this.viewCollection.doc(this.currentView).update({right:e.currentTarget.innerText});
    })

    $(".synergist-container").on("keyup",".floatingItem h3", (e)=>{
        let id=e.currentTarget.parentElement.dataset.id;
        if (this.firebaseEnabled)this.itemCollection.doc(id).update({title:e.currentTarget.innerText});
    })

    $(".synergist-container").on("keyup",".floatingItem p", (e)=>{
        let id=e.currentTarget.parentElement.dataset.id;
        if (this.firebaseEnabled)this.itemCollection.doc(id).update({description:e.currentTarget.innerText});
    })

    this.switchView = function (ln) {
        $(".viewName").text(this.views[ln].name);
        $(".leftLabel").text(this.views[ln].left);
        $(".rightLabel").text(this.views[ln].right);
        $(".viewName")[0].dataset.listname = ln;
        for (i in this.items) {
            this.items[i].arrangeElement(ln);
        }
        this.currentView=ln;
    }

    this.makeNewView = function (id, obj,auto) {
        if (obj == undefined) {
            obj = {
                name: 'New View',
                left: "Less favourable",
                right: "More favourable",
            }
            this.viewCollection.doc(id).set(obj);
        };
        if (!auto){
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
        if (!$(e.target).is("li")) {
            $(".synergist-banner h2>span>div").hide();
        }
        if (!$(e.target).is("li")) $(".contextMenu").hide();
    });

    //----------Context menu----------//
    $("body").on("contextmenu", ".floatingItem", (e) => {
        this.contextedElement = e.target;
        $(".contextMenu")[0].style.left = e.screenX - this.basediv.offsetLeft;
        $(".contextMenu")[0].style.top = e.screenY - this.basediv.offsetTop;
        $(".contextMenu").show();
        e.preventDefault();
    })
    $(".contextMenu :contains('Delete')").on("click", (e) => {
        //delete the div and delete its corresponding item
        $(this.contextedElement).remove();
        delete this.items[this.contextedElement.dataset.id];
        $('.contextMenu').hide();
    })


}