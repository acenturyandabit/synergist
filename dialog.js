// V0.1. Still dependent heavily on jquery (soz)... Will attempt to download jQuery from CDN if it does not have access to jQuery. At least there's that.
//With JQinit V2.1 (BROKEN! WILL NOT WORK WITH MULTIPLE JQUERY DEPENDENT SCRIPTS. CAREFUL!)



//mutation observer to listen for things which are ".dialog".

dialogManager={
    //set to true to allow the dialog manager to automatically detect new dialogs. May result in diminished performance. 
    autoDialogUpgrade:true,
    
    //Apply this class to all of your dialogs.
    dialogClassName:"overlay",
    //styling to be applied to dialogs
    dialogStyling:`{
        display: none;
        position: absolute;
        top: 0;
        left: 0;
        width:100%;
        height:100%;
        background-color: rgba (0,0,0,0.5);
    }`,
    
    //Apply this class to all of your dialogs.
    midClassName:"mid",
    //styling to be applied to dialogs
    midStyling:`{
        display: table-cell;
        vertical-align: middle;
    }`,

    //class name for the inner dialog. You many want to change this if you are already using it.
    innerDialogClassName: "innerDialog",
    innerDialogStyling: `{
        display: flex;
        flex-direction: column;
        margin: auto;
        height: 60vh;
        width: 40vw;
        background-color: white;
        border-radius: 30px;
        padding: 30px;
    }`,
    observationFunction:()=>{
        let me=this;
        $("."+me.dialogClassName).each((i,e)=>{
            if (!$(e).find("."+me.innerDialogClassName).length){
                //create the new dialog!
                let parent=e.parentElement;
                e.classList.remove(me.dialogClassName);
                e.classList.add(me.innerDialogClassName);
                let midDiv=document.createElement("div");
                midDiv.classList.add(me.midClassName);
                midDiv.appendChild(e);
                let outerdiv=document.createElement("div");
                outerdiv.classList.add(me.dialogClassName);
                outerdiv.appendChild(e);
                parent.appendChild(outerdiv);
            }
        })
    },
    init: function(){
        //chuck the relevant css in.
        $("head").append(`<style>.`+this.dialogClassName+this.dialogStyling+`</style>`);
        $("head").append(`<style>.`+this.midClassName+this.midStyling+`</style>`);
        $("head").append(`<style>.`+this.innerDialogClassName+this.innerDialogStyling+`</style>`);
        let me=this;
        this.mo=new MutationObserver(this.observationFunction);
        document.addEventListener("DOMContentLoaded",()=>{
            let config={childList:true, subtree:true};
            me.mo.observe(document.body,config);
        })
    }
}




function JQInit(_f) {
    if (typeof jQuery == "undefined") {
      // preinject jquery so that noone else after us is going to
      //inject jquery
      scr = document.createElement("script");
      scr.src = src = "https://code.jquery.com/jquery-3.3.1.slim.min.js";
      scr.addEventListener("load",()=>{$(_f)});
      document.getElementsByTagName("head")[0].appendChild(scr);
      jQuery = "";
    }else{
        $(_f);
    }
  }

  JQInit(dialogManager.init());