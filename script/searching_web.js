const form = document.querySelector('form'); 
const btn = document.querySelector('#btn');
const input = document.querySelector('#myInput');

// Create an instance of a db object for us to store the open database in
let db;
var isLocal = false;
initiateLocalDB();

var key = 'AIzaSyDO7v2aDGSusJmEHm_J8q7-bMC-bK7ma8o';
var cx = 'ba62ee16088215470';
var q = '';
var start = '1';
var URL = 'https://www.googleapis.com/customsearch/v1';

var arr = window.location.href.split("?");
if(arr.length > 1){
    var queries = arr.pop();
    //console.log("ostatak: " + queries);
    var arr2 = queries.split("&");
    if(arr2.length == 2) {
        var partQ = arr2[0].split("=");
        var partS = arr2[1].split("=");
        if(partQ[0] == "q" && partQ[1] != null) {
            q = partQ[1];
        }
        if(partS[0] == "start" && partS[1] != null) {
            start = partS[1];
        }
        console.log("porteban del za q : " + q + "\npotreban del za start : " + start); 
    } else if(arr2.length == 1) {
        var partQ = arr2[0].split("=");
        if(partQ[0] == "q" && partQ[1] != null) {
            q = partQ[1];
        }
        console.log("porteban del za q : " + q); 
    }
}

window.onload = function() {       
    document.getElementById("content_resultats").innerHTML = "<span style=\"float:right;\" > Search for:  " +
		"<a id=\"transfer\" > WEB </a>"+
		"<a id=\"transfer\" href=\"searching_images.html?q="+q+"&start=1\" >   IMAGES </a>" +
		"<a id=\"transfer\" href=\"searching_map.php?name="+q+"\" >   MAP </a> " +
		"<a id=\"transfer\" href=\"searching_video.html?q="+q+"\" >   VIDEO </a> </span>";
    
    input.value = q;
    form.onsubmit = searchForData;    
    //loadsth();
    
    if(q != ""){
        //loadData();
        checkLocalDB();
    }
};

function initiateLocalDB() {
    let request = window.indexedDB.open('local_db', 3); 

	// onerror handler signifies that the database didn't open successfully
	request.onerror = function() {
	    console.log('Database failed to open');
	};

	// onsuccess handler signifies that the database opened successfully
	request.onsuccess = function() {
        console.log('Database opened successfully');

        // Store the opened database object in the db variable. This is used a lot below
        db = request.result;
	};

	// Setup the database tables if this has not already been done
	request.onupgradeneeded = function(e) {
        // Grab a reference to the opened database
        let db = e.target.result;

        // Create an objectStore to store our notes in (basically like a single table)
        // including a auto-incrementing key
    //    let objectStore = db.createObjectStore('notes_os', { keyPath: 'id', autoIncrement:true });

        console.log('Database setup complete');
	};
}

function loadsth(response){ 
   // open a read/write db transaction, ready for adding the data
   let transaction = db.transaction(['notes_os'], 'readwrite');
 
   // call an object store that's already been added to the database
   let objectStore = transaction.objectStore('notes_os');
   
   // Make a request to add our newItem object to the object store
   let request = objectStore.add(response);
   request.onsuccess = function() {
     // Clear the form, ready for adding the next entry
   };
 
   // Report on the success of the transaction completing, when everything is done
   transaction.oncomplete = function() {
     console.log('Transaction completed: database modification finished.');
   };
 
   transaction.onerror = function() {
     console.log('Transaction not opened due to error');
   };
}

function checkLocalDB() {
	//Get the ObjectStore
	let objectStore = db.transaction('notes_os').objectStore('notes_os');
	objectStore.openCursor().onsuccess = function(e) {
		// Get a reference to the cursor
		let cursor = e.target.result;
		if (cursor) {
			var json = cursor.value;
			if(json.name == q.toLowerCase() && json.start == start) {
			    // alert(json.name + " found!");
                isLocal = true;
                hndlr(json);
            } else {
			    cursor.continue();
            }
		}
		//else get an alert informing you that it is done
		else {
			console.log("All done:");
            isLocal = false;
            loadData();
		}
	};
}

function loadData() {
    var options = {		
        key: key,
        cx: cx,
        q: q,
        start: start
    }

    $.getJSON(URL, options, function (data) {
        console.log(data);

        hndlr(data);            
    });
}
	
function hndlr(response) {     
    //creating json for localDB
    var obj = {};
    var items = [];
    obj.name = q.toLowerCase();
    obj.start = start; 
    
    //prikza teksta i slike 
    document.getElementById("content").innerHTML = "";
    for (var i = 0; i < response.items.length; i++) {
        var it = {};
        var item = response.items[i];
        if (item.pagemap != null && item.pagemap.cse_thumbnail != null) {
            document.getElementById("content").innerHTML += "<br><img id=\"photos\" src="
            +item.pagemap.cse_thumbnail[0].src+" height=\"100\" width=\"150\" style=\"float:left\"/>";

            it.pagemap = {cse_thumbnail: [
                {
                src: item.pagemap.cse_thumbnail[0].src}
            ]};	
        } else {
            document.getElementById("content").innerHTML += 
            "<br><img id=\"photos\" src=\"pictures/default.png\" height=\"100\" width=\"150\" style=\"float:left\"/>";
        }
        document.getElementById("content").innerHTML +=			
        "<br><a href=" + item.link + " title=" + item.link + " target=\"_new\">" + item.htmlTitle + 
        "</a><br> <span>"+item.snippet+"</span><br><br><br><br>";
        
        // items for json        
        it.htmlTitle = item.htmlTitle;
        it.snippet = item.snippet;
        it.link = item.link;
        
        items.push(it);
    } 
    // getting items
    obj.items = items;
    
    var currentPage = Math.floor(start / 10 + 1);
    console.log(currentPage);
    
    document.getElementById("logo").innerHTML = "<img  src=\"pictures/logo2.png\" height=\"30\" width=\"150\" />"
    
    if (currentPage != 1) {
        var s = parseInt(start) - 10;
        document.getElementById("links").innerHTML = "<a href=\"searching_web.html?q="+q+"&start=" + s + "\"> PREVIUS PAGE  </a>  ";
    } else {
        document.getElementById("links").innerHTML = "";
    }
    
    for (var x = 1; x <= 10; x++) {
        
        //console.log(temp);
        var jump = (x - 1) * 10 + 1;
        console.log(jump);
        
        if(x != currentPage){
            document.getElementById("links").innerHTML += "	<a href=\"searching_web.html?q=" + q + "&start="+jump+"\" > "+x+"</a>";
        } else {
            document.getElementById("links").innerHTML += "	  <a>"+currentPage+"</a>	";
        }
    }		
    if(currentPage < 10) {
        var s = parseInt(start) + 10;
        document.getElementById("links").innerHTML += "<a href=\"searching_web.html?q="+q+"&start="+s+"\">  NEXT PAGE </a>";
    }

    // getting items and storing them
    obj.items = items;
    if(!isLocal) {
        loadsth(obj);
    }
}

function searchForData(e) {
    // stops convetional submit
    e.preventDefault();

    value = input.value;
    if (value.localeCompare("") != 0){        
        location.replace("searching_web.html?q=" + value);
    }
}
