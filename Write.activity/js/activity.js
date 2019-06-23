define([
	"sugar-web/activity/activity",
    "sugar-web/env",
    "sugar-web/graphics/icon",
    "webL10n",
    "sugar-web/graphics/presencepalette",
    "activity/palettes/edit-text-palette",
    "activity/palettes/paragraph-palette",
    "activity/palettes/list-palette",
    "sugar-web/graphics/colorpalette",
    "activity/palettes/format-text-palette",
    "activity/palettes/font-palette",
    "sugar-web/datastore",
    "sugar-web/graphics/journalchooser",
    "activity/palettes/export-palette",
], function (activity, env, icon, webL10n, presencepalette, editpalette , parapalette , listpalette , colorpalette, formatpalette , fontPalette , datastore , journalchooser , exportpalette ) {

	// Manipulate the DOM only when it is ready.
	requirejs(['domReady!', 'humane'], function (doc,humane) {

		// Initialize the activity.
        activity.setup();

        // Load From datastore
        env.getEnvironment(function(err, environment) {
            
            currentenv = environment;

            if (!environment.objectId) {
                // New instance
                // Set focus on textarea
                richTextField.focus();
                // Set Arial as default font 
                richTextField.document.execCommand("fontName",false,"Arial");
                // Set 4 as default font size
                richTextField.document.execCommand("fontSize",false,"4");
            } else {
                // Existing instance
                activity.getDatastoreObject().loadAsText(function(error, metadata, data) {
                    if (error==null && data!=null) {
                        html = JSON.parse(data);
                        richTextField.document.getElementsByTagName('body')[0].innerHTML = html;
                    }
                });
            }

            // Shared instances
            if (environment.sharedId) {
                console.log("Shared instance");
                presence = activity.getPresenceObject(function(error, network) {
                    network.onDataReceived(onNetworkDataReceived);
                    network.onSharedActivityUserChanged(onNetworkUserChanged);
                });
            }
            // Create Listeners for images on start of activity
            imageHandler();

        });

        function imageHandler() {
            // Create Listeners for images on start of activity
            var imgs = richTextField.document.getElementsByTagName("img");
            console.log(imgs);
            console.log(imgs.length);
            for (var i = 0; i < imgs.length; i++) {
                imgSrcs.push(imgs[i].id);
            }
            imgSrcs.forEach(function (id, index) {
                richTextField.document.getElementById(id).addEventListener("click",function(){
                    if(id==currentImage){
                        var i = richTextField.document.getElementById(id);
                        i.style.border = "none";
                        i.style.borderImage = "none";
                        currentImage=null;
                    } else {
                        currentImage=id;
                        imgSrcs.forEach(function(id2,index2){
                            if(id2==currentImage){
                                var i = richTextField.document.getElementById(id2);
                                i.style.border = "30px solid transparent";
                                i.style.borderImage = "url("+borderurl+") 45 round";
                            } else {
                                var i = richTextField.document.getElementById(id2);
                                i.style.border = "none";
                                i.style.borderImage = "none";
                            }
                        })
                    }
                    
                })
              });
        }
        
        // Set focus on textarea
        richTextField.focus();
        // Set Arial as default font 
        richTextField.document.execCommand("fontName",false,"Arial");
        // Set 4 as default font size
        richTextField.document.execCommand("fontSize",false,"4");
		
		// Initiating edit-text-palette ( for cut/copy/undo/redo )

		var editButton = document.getElementById("edit-text");
        var options = [
            {"id": 1, "title": "copy" , "cmd":"copy"},
            {"id": 2, "title": "paste", "cmd":"paste"},
            {"id": 3, "title": "undo", "cmd":"undo"},
            {"id": 4, "title": "redo", "cmd":"redo"},
        ];
        editpalette = new editpalette.Editpalette(editButton, undefined);
        editpalette.setCategories(options);
        editpalette.addEventListener('edit', function () {
            editpalette.popDown();
        });
        document.getElementById("1").addEventListener("click",function(){
            richTextField.document.execCommand("copy",false,null);
            updateContent();
        })
        document.getElementById("2").addEventListener("click",function(){
            richTextField.document.execCommand("paste",false,null);
            updateContent();
        });
        document.getElementById("3").addEventListener("click",function(){
            richTextField.document.execCommand("undo",false,null);
        });
        document.getElementById("4").addEventListener("click",function(){
            richTextField.document.execCommand("redo",false,null);
        });

        // Initiating paragraph palette ( Alignment settings )
        
        var paraButton = document.getElementById("paragraph");
        var paraoptions = [
            {"id": 5, "title":"justify Left" , "cmd":"justifyLeft"},
            {"id": 6, "title":"justify Right" , "cmd":"justifyRight"},
            {"id": 7, "title":"justify Center" , "cmd":"justifyCenter"},
            {"id": 8, "title":"justify Full" , "cmd":"justifyFull"},
        ];
        parapalette = new parapalette.Parapalette(paraButton, undefined);
        parapalette.setCategories(paraoptions);
        parapalette.addEventListener('para', function () {
            parapalette.popDown();
        });

        document.getElementById("5").addEventListener("click",function(){
   
            if(!currentImage){
                richTextField.document.execCommand("justifyLeft",false,null);
            } else {
                // Float left for images
                var image = richTextField.document.getElementById(currentImage);
                image.style.cssFloat = "left";
            }
            updateContent();
        })
        document.getElementById("6").addEventListener("click",function(){
            
            if(!currentImage){
                richTextField.document.execCommand("justifyRight",false,null);
            } else {
                // Float right for images
                var image = richTextField.document.getElementById(currentImage);
                image.style.cssFloat = "right";
            }
            updateContent();
        });
        document.getElementById("7").addEventListener("click",function(){
            richTextField.document.execCommand("justifyCenter",false,null);
            updateContent();
        });
        document.getElementById("8").addEventListener("click",function(){
            richTextField.document.execCommand("justifyFull",false,null);
            updateContent();
        });

        // Initiating lists palette
        var listButton = document.getElementById("list");
        var listoptions = [
            {"id": 9, "title": "ordered list", "cmd":"insertorderedList"},
            {"id": 10, "title": "unordered list", "cmd":"insertUnorderedList"},
        ];
        listpalette = new listpalette.Listpalette(listButton, undefined);
        listpalette.setCategories(listoptions);
        listpalette.addEventListener('list', function () {
            listpalette.popDown();
        });

        document.getElementById("9").addEventListener("click",function(){
            richTextField.document.execCommand("insertorderedList",false,"A");
            updateContent();
        });
        document.getElementById("10").addEventListener("click",function(){
            richTextField.document.execCommand("insertUnorderedList",false,null);
            updateContent();
        });

        // Initiating colour palette for foreground and background
        var forecolorButton = document.getElementById("color-button-1");
        var changeForeColorPalette = new colorpalette.ColorPalette(forecolorButton);
        changeForeColorPalette.setColor('rgb(0, 0, 0)');
		changeForeColorPalette.addEventListener('colorChange', function(e) {
            var forergb = e.detail.color;
            var forehex = rgb2hex(forergb);
            richTextField.document.execCommand("foreColor",false,forehex);
            updateContent();
        });
        
        var backcolorButton = document.getElementById("color-button-2");
        var changeBackColorPalette = new colorpalette.ColorPalette(backcolorButton);
        changeBackColorPalette.setColor('rgb(255,255,255)');
		changeBackColorPalette.addEventListener('colorChange', function(e) {
            var backrgb = e.detail.color;
            var backhex = rgb2hex(backrgb);
            richTextField.document.execCommand("hiliteColor",false,backhex);
            updateContent();
        });
        // hack to convert rgb to hex
        function rgb2hex(rgb){
            rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
            return (rgb && rgb.length === 4) ? "#" +
             ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
             ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
             ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
           }

        // initiating the format text palette (for bold/italic/strikethrough/underline)
        var formatButton = document.getElementById("format-text");
        var formatoptions = [
            {"id": 11, "title": "bold", "cmd":"bold"},
            {"id": 12, "title": "italic", "cmd":"italic"},
            {"id": 13, "title": "underline", "cmd":"underline"},
            {"id": 14, "title": "strikethrough", "cmd":"strikeThrough"}
        ];
        formatpalette = new formatpalette.Formatpalette(formatButton, undefined);
        formatpalette.setCategories(formatoptions);
        formatpalette.addEventListener('format', function () {
            formatpalette.popDown();
        });

        document.getElementById("11").addEventListener("click",function(){
            richTextField.document.execCommand("bold",false,null);
            updateContent();
        })
        document.getElementById("12").addEventListener("click",function(){
            richTextField.document.execCommand("italic",false,null);
            updateContent();
        });
        document.getElementById("13").addEventListener("click",function(){
            richTextField.document.execCommand("underline",false,null);
            updateContent();
        });
        document.getElementById("14").addEventListener("click",function(){
            richTextField.document.execCommand("strikeThrough",false,null);
            updateContent();
        });

        // Initialise font palette
        var fontButton = document.getElementById("font-button");
        fontPalette = new fontPalette.Fontpalette(fontButton);
        fontPalette.addEventListener('fontChange', function(e) {
			var newfont = e.detail.family;
            richTextField.document.execCommand("fontName",false,newfont);
        });

        // Set the functioning of increase and decrease of font size and selected image
        // Increase
        document.getElementById("resize-inc").addEventListener('click',function(e){
            var cursize = richTextField.document.queryCommandValue ('fontSize');
            if(!cursize) cursize=4;
            cursize++;
            richTextField.document.execCommand("fontSize",false,cursize);
            // Resize for images
            if(currentImage){
                var image = richTextField.document.getElementById(currentImage);
                var curwidth = image.offsetWidth;
                curwidth=curwidth+20;
                image.style.width=curwidth+"px";
            }
            updateContent();
        });
        // Decrease
        document.getElementById("resize-dec").addEventListener('click',function(e){
            var cursize = richTextField.document.queryCommandValue ('fontSize');
            cursize--;
            richTextField.document.execCommand("fontSize",false,cursize);
            // Resize for images
            if(currentImage){
                var image = richTextField.document.getElementById(currentImage);
                var curwidth = image.offsetWidth;
                curwidth=curwidth-80;
                image.style.width=curwidth+"px";
            }
            updateContent();
        });

        // Images Handling
	
        // variable to maintain id of current image
        var currentImage;
        var imgSrcs = [];
        var borderurl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAM4SURBVHhe7du9bRtBFIVRNeHcLaoXV6HMgZpw7EwVOFDgTJk8GxgwiMc7GHl34fU7B7gZgeHPfgRIgg8AAAAAAAAAAAAAAAAAH/Q09n7CDlEdtPe2J4i+BDKZQHoTyGQC6U0gkwmkN4FMJpDeBDKZQHoTyGQC6U0gkwmkN4FM9jL2xdpue/2r62LvHaI6yOyKO0R1kNkVd4jqILMr7hDVQWZX3CGqg8yuuENUB+29r2OfrO2217+6LvbeIaqD9p7fQXrzO8hkAulNIJMJpDeBTCaQ3gQymUB6E8hkAulNIJMJpDeBTCaQ3gQymUB6E8hkAuntcWy7Bu7t3v9Fnseq29/bIaqD7u1t7PZBvI5Vt/1z2xME92x/qrq9rrZ9HruUH2O3D+LbGPwNgUAgEAgEAoFAIBAIBAKBQCAQCAQCgUAgEAgEAoFAIBAIBAKBQCAQCAQCgUAgEAgEAoFAIBAIBAKBQCAQCAQCgUAgEAgEAoFAIBAIBAKBQCAQCAQCgUAgEAgEAoFAIBAIBAKBQCAQCAQCgUAgEAgEAoFAIBAIBAKBQCAQCAQCgUAgEAgEAoFAIBAIBAKBQCAQCAQCgUAgEAgEAoFAIBAIBAKBQCAQCAQCgUAgEAgEAoFAIBAIBAKBQCAQCAQCgUAgEAgEAoFAIBAIBAKBQCAQCAQCgUAgEAgEAoFAIBAIBAKBQCAQCAQCgUAgEAgEAoFAIBAIBAKBQCAQCAQCgUAgEAgEAoFAIBAIBAKBQCAQCAQCgUAgEAgEAoFAIBAIBAKBQCAQCAQCgUBwuUCe7uxt7PZBvI5Vt53tcQw2lwukurN7b4uEPrY3xNs3yd97Gauukeex6vZpp6ju7N477cHwT9he7+o62HunqA7eewLpRSCLE0gvAlmcQHoRyOIE0otAFieQXgSyOIH0IpDFCaQXgSxOIL0IZHEC6UUgixNILwJZnEB6Ecjifo59tzbbXu/qOth7p6gONrvCTlEdbHaFnaI62OwKO0V1sNkVdorq4L3nQ3qv+ZC+OF/z9uJr3sUJpBeBLE4gvQhkcQLpRSCLE0gvAlmcQHr5rwKBvQkEAAAAAAAAAAAAAACAD3p4+AULle55ucyNGwAAAABJRU5ErkJggg=="
        //  Insert image Handling
        document.getElementById("insert-picture").addEventListener('click', function (e) {
            journalchooser.show(function (entry) {
                //  No selection
                if (!entry) {
                    return;
                }
                //  Get object content
                var dataentry = new datastore.DatastoreObject(entry.objectId);
                dataentry.loadAsText(function (err, metadata, data) {
                    img=data.toString();
                    var id = "rand" + Math.random();
                    img = "<img src='" + img + "' id=" + id + " style='float:none'>";
                    richTextField.document.execCommand("insertHTML", false, img);
                    imgSrcs.push(id);
                    richTextField.document.getElementById(id).addEventListener("click",function(){
                        if(id==currentImage){
                            var i = richTextField.document.getElementById(id);
                        i.style.border = "none";
                        i.style.borderImage = "none";
                        currentImage=null;
                    } else {
                        currentImage=id;
                        imgSrcs.forEach(function(id2,index2){
                            if(id2==currentImage){
                                var i = richTextField.document.getElementById(id2);
                                i.style.border = "30px solid transparent";
                                i.style.borderImage = "url("+borderurl+") 45 round";
                            } else {
                                var i = richTextField.document.getElementById(id2);
                                i.style.border = "none";
                                i.style.borderImage = "none";
                            }
                        })
                    }
                        
                    });
                    updateContent();
                    imageHandler();
                });
            }, { mimetype: 'image/png' }, { mimetype: 'image/jpeg' });
        });
        
        
        // Journal handling ( save )

        // Save in Journal on Stop
        document.getElementById("stop-button").addEventListener('click', function (event) {
            
            // Remove image border's if image left selected
            removeSelection();
            // Journal handling
            var data = richTextField.document.getElementsByTagName('body')[0].innerHTML ;
            var jsondata = JSON.stringify(data);
            activity.getDatastoreObject().setDataAsText(jsondata);
            activity.getDatastoreObject().save(function (error) {
                if (error === null) {
                    console.log("write done.");
                } else {
                    console.log("write failed.");
                }
            });
            
        });

        // Initiating export-palette ( for cut/copy/undo/redo )

		var exportButton = document.getElementById("export");
        var options = [
            {"id": 15, "title": "export to txt" , "cmd":"save-as-txt"},
            {"id": 16, "title": "export to html", "cmd":"save-as-html"},
            {"id": 17, "title": "export to pdf", "cmd":"save-as-pdf"},
        ];
        exportpalette = new exportpalette.Exportpalette(exportButton, undefined);
        exportpalette.setCategories(options);
        exportpalette.addEventListener('export', function () {
            exportpalette.popDown();
        });

        // Remove image selection
        function removeSelection(){
            for(var i=0 ; i < imgSrcs.length ; i++){
                var im = richTextField.document.getElementById(imgSrcs[i]);
                im.style.border = "none";
                im.style.borderImage = "none";
            }
        }

        // save as txt
        document.getElementById("15").addEventListener('click',function(){
            // Remove image border's if image left selected
            removeSelection();
            var content = richTextField.document.getElementsByTagName('body')[0].textContent ;
            var link = document.createElement('a');
            var mimeType='text/plain';
            link.setAttribute('download','download.txt');
            link.setAttribute('href', 'data:' + mimeType + ';charset=utf-8,' + encodeURIComponent(content));
            document.body.append(link);
            link.click();
            document.body.removeChild(link);
        });
        
        // save as html
        document.getElementById("16").addEventListener('click',function(){
            // Remove image border's if image left selected
            removeSelection();
            var content = richTextField.document.getElementsByTagName('body')[0].innerHTML ;
            var link = document.createElement('a');
            var mimeType='text/html';
            link.setAttribute('download','download.html');
            link.setAttribute('href', 'data:' + mimeType + ';charset=utf-8,' + encodeURIComponent(content));
            document.body.append(link);
            link.click();
            document.body.removeChild(link);
        });

        // save as PDF
        document.getElementById("17").addEventListener('click',function(){
            // Remove image border's if image left selected
            removeSelection();
            downloadPDF();
        });

        // Multi User collab.

        // Link presence palette
        var presence = null;
        var isHost = false;
        var palette = new presencepalette.PresencePalette(document.getElementById("network-button"), undefined);
        palette.addEventListener('shared', function() {
            palette.popDown();
            console.log("Want to share");
            presence = activity.getPresenceObject(function(error, network) {
                if (error) {
                    console.log("Sharing error");
                    return;
                }
                network.createSharedActivity('org.sugarlabs.Write', function(groupId) {
                    console.log("Activity shared");
                    isHost = true;
                });
                network.onDataReceived(onNetworkDataReceived);
                network.onSharedActivityUserChanged(onNetworkUserChanged);
            });
        });

        var onNetworkDataReceived = function(msg) {
            if (presence.getUserInfo().networkId === msg.user.networkId) {
                return;
            }
            // Changes made by user in presence will be handled here
            richTextField.document.getElementsByTagName('body')[0].innerHTML = msg.data ;
        };

        var xoLogo = '<?xml version="1.0" ?><!DOCTYPE svg  PUBLIC \'-//W3C//DTD SVG 1.1//EN\'  \'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\' [<!ENTITY stroke_color "#010101"><!ENTITY fill_color "#FFFFFF">]><svg enable-background="new 0 0 55 55" height="55px" version="1.1" viewBox="0 0 55 55" width="55px" x="0px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" y="0px"><g display="block" id="stock-xo_1_"><path d="M33.233,35.1l10.102,10.1c0.752,0.75,1.217,1.783,1.217,2.932   c0,2.287-1.855,4.143-4.146,4.143c-1.145,0-2.178-0.463-2.932-1.211L27.372,40.961l-10.1,10.1c-0.75,0.75-1.787,1.211-2.934,1.211   c-2.284,0-4.143-1.854-4.143-4.141c0-1.146,0.465-2.184,1.212-2.934l10.104-10.102L11.409,24.995   c-0.747-0.748-1.212-1.785-1.212-2.93c0-2.289,1.854-4.146,4.146-4.146c1.143,0,2.18,0.465,2.93,1.214l10.099,10.102l10.102-10.103   c0.754-0.749,1.787-1.214,2.934-1.214c2.289,0,4.146,1.856,4.146,4.145c0,1.146-0.467,2.18-1.217,2.932L33.233,35.1z" fill="&fill_color;" stroke="&stroke_color;" stroke-width="3.5"/><circle cx="27.371" cy="10.849" fill="&fill_color;" r="8.122" stroke="&stroke_color;" stroke-width="3.5"/></g></svg>';
        function generateXOLogoWithColor(color) {
            var coloredLogo = xoLogo;
            coloredLogo = coloredLogo.replace("#010101", color.stroke)
            coloredLogo = coloredLogo.replace("#FFFFFF", color.fill)
        
            return "data:image/svg+xml;base64," + btoa(coloredLogo);
          }

        // For loading the initial content for other users ( init )
        var onNetworkUserChanged = function(msg) {
            if (isHost) {
                var data = richTextField.document.getElementsByTagName('body')[0].innerHTML ;
                presence.sendMessage(presence.getSharedInfo().id, {
                    user: presence.getUserInfo(),
                    action: 'init',
                    data: data
                });
            }
            // handle user enter/exit Notifications
            var userName = msg.user.name.replace('<', '&lt;').replace('>', '&gt;');
            var html = "<img style='height:30px;' src='" + generateXOLogoWithColor(msg.user.colorvalue) + "'>"
            if (msg.move === 1) {
            humane.log(html+userName+" Joined");
            }

            if (msg.move === -1) {
            humane.log(html+userName+" Left");
            }
        };
        
        // For loading content of other users (update)
        richTextField.document.addEventListener("keyup",function(){
            updateContent();
        });

        function updateContent(){
            if(presence){
                var data = richTextField.document.getElementsByTagName('body')[0].innerHTML ;
                presence.sendMessage(presence.getSharedInfo().id, {
                    user: presence.getUserInfo(),
                    action: 'update',
                    data: data
                });
            }
        }
        


	});

});
