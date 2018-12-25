function floatingItem(views, currentView, x, y) {
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
        this.arrangeElement(currentView);
    } else {
        this.fromObject(views);
        Object.assign(this, views);
    }
    this.makeNewView = function (name) {
        this.viewData[name] = {
            x: 0,
            y: 0
        };
    }

}

function synergist(div) {
    //----------Initialisation----------//
    this.items = [];
    this.views = {"main":{name:"Main",left:"Less favourable",right:"More favourable"}};
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
        <span class="leftLabelContainer"><<<span class="leftLabel" contentEditable>`+this.views.main.right+`</span></span>
        <span class="rightLabelContainer"><span class="rightLabel" contentEditable>`+this.views.main.right+`</span>>>></span>
        </div>
        </div>
        
    </div>
    `);

    this.basediv = $(div).find(".synergist")[0];
    this.currentView = "main";
    //----------Loading----------//

    this.toSaveData = function () {
        obj = {};
        obj.views = this.views;
        obj.items = this.items.map((i) => {
            return i.toObject()
        });
        obj.name=$("h1")[0].innerText;
        return obj;
    }

    this.loadFromData = function (d) {
        //clear everything
        this.views = {};
        this.items = [];
        $(this.basediv).find(".floatingItem").remove();
        //load everything
        $("h1").text(d.name);
        for (i in d.views){
            this.makeNewView(i,d.views[i]);
        }
        this.items = d.items.map((i) => {
            nfi=new floatingItem(i);
            this.basediv.appendChild(nfi.div);
            return nfi;
        });
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

    //----------Items----------//
    $(this.basediv).on("dblclick", ".floatingItem", (e) => {
        e.stopPropagation();
        return false;
    })

    this.dragging = false;

    $(this.basediv).on("mousedown", ".floatingItem", (e) => {
        this.movingDiv = e.currentTarget;
        this.dragging = true;
        this.dragDX = this.movingDiv.offsetLeft - e.clientX;
        this.dragDY = this.movingDiv.offsetTop - e.clientY;
        this.movingDiv.style["boxShadow"]="5px 5px 5px black";
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
            this.movingDiv.style["boxShadow"]="none";
        }
    });

    $(this.basediv).on("dblclick", (e) => {
        if ($(e.target.parentElement).is(".leftLabel") || $(e.target.parentElement).is(".rightLabel")) return;
        ni = new floatingItem(Object.keys(this.views), this.currentView, e.offsetX, e.offsetY);
        this.basediv.appendChild(ni.div);
        this.items.push(ni);
    })

    //----------Views----------//
    $(".viewName").on("keyup",(e)=>{
        this.views[e.currentTarget.dataset.listname].name=e.currentTarget.innerText;
    })
    
    $(".leftLabel").on("keyup",(e)=>{
        this.views[e.currentTarget.dataset.listname].left=e.currentTarget.innerText;
    })
    
    $(".rightLabel").on("keyup",(e)=>{
        this.views[e.currentTarget.dataset.listname].right=e.currentTarget.innerText;
    })

    this.switchView = function (ln) {
        $(".viewName").text(this.views[ln].name);
        $(".leftLabel").text(this.views[ln].left);
        $(".rightLabel").text(this.views[ln].right);
        $(".viewName")[0].dataset.listname=ln;
        this.items.forEach((v, i) => {
            v.arrangeElement(ln);
        })
    }

    this.makeNewView = function (id,obj) {
        if (obj==undefined)obj={
            name:name,
            left:"Less favourable",
            right:"More favourable",
        };
        this.items.forEach((v, i) => {
            v.makeNewView(id);
        })
        this.views[id]=obj;
    }

    //////////////////Banner//////////////////

    $("body").on("click", ".synergist-banner .dropdown li", (e) => {
        if (e.currentTarget.dataset.listname == "new") {
            //make a new view
            nv=Date.now()
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
        for (i in this.views){
            v=this.views[i].name;
            $(".synergist-banner h2>span>div.dropdown").append(`<li data-listname="` + i + `"><span>` + v + `</span></li>`);
        }
        $(".synergist-banner h2>span>div.dropdown").append(`<li data-listname="new" ><em>Add another view</em></li>`);
        $(".synergist-banner h2>span>div").show();
    })

    $("body").on("mousedown", (e) => {
        if ($(e.target.parentElement).is("li")) return;
        $(".synergist-banner h2>span>div").hide();
    });
    
    //----------Misc UI shenanigans----------//

    $("body").on("keydown","h1,h2,h3",(e)=>{
        if (e.target.contentEditable && e.key=="Enter")e.preventDefault();
    })
    
}