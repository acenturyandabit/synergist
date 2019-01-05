//V1.0. Context menu manager.

contextMenuManager={
    registerContextMenu:(menu,element,delegate, contextmenuEventPassThrough)=>{
        let thisCTXM=document.createElement("div");
        $(thisCTXM).append(menu);
        thisCTXM.classList.add("contextMenu");
        $("body").append(thisCTXM);
        let f=function(e){
            //show the context menu
            thisCTXM.style.left = e.clientX;// - element.offsetLeft;
            thisCTXM.style.top = e.clientY;// - element.offsetTop;
            thisCTXM.style.display="block";
            e.preventDefault();
            if (contextmenuEventPassThrough)contextmenuEventPassThrough(e);
        };
        if (delegate){ //it's a class
            $(element).on("contextmenu",delegate, f);
        }else{
            $(element).on("contextmenu",f);
        }
        $("body").on("click",(e)=>{
            if (!$(e.target).is("li")) $(thisCTXM).hide();
        })
    },
    init: function(){
        //add styling
        $("head").append(`<style>
        .contextMenu {
            list-style: none;
            background: white;
            box-shadow: 0px 0px 5px black;
            user-select: none;
            position: absolute;
        }
        
        .contextMenu li {
            padding: 10px;
            display: block;
        }
        
        </style>`);
    }
}
contextMenuManager.init();