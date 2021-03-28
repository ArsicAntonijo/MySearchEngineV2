const form = document.querySelector('form'); 
const btn = document.querySelector('#btn');
const input = document.querySelector('#myInput');

let db;
var isLocal = false;
initiateLocalDB();

var key = 'AIzaSyAduXlHZyZmOOu_ao3BaganaEVxnuslNyc';
var q = '';
var URL = 'https://www.googleapis.com/youtube/v3/search';

var arr = window.location.href.split("?");
if(arr.length > 1){
    var queries = arr.pop();
    //console.log("ostatak: " + queries);
    var arr2 = queries.split("&");
     if(arr2.length == 1) {
        var partQ = arr2[0].split("=");
        if(partQ[0] == "q" && partQ[1] != null) {
            q = partQ[1];
        }
        console.log("porteban del za q : " + q); 
    }
}


window.onload = function() {
    printNav();

    form.onsubmit = searchForData;
    input.value = q;

    if(q != ""){
        checkLocalDB();
        //loadVids();
    }
}

function printNav(){
    document.getElementById("nav").innerHTML = "<a id=\"transfer1\"> Search for: </a>"+
    "<a id=\"transfer\" href=\"searching_web.html?q="+q+"&start=1\" >WEB</a>"+
    "<a id=\"transfer\" href=\"searching_images.html?q="+q+"&start=1\" >IMAGES </a>"+
    "<a id=\"transfer\" href=\"searching_map.php?name="+q+"\"> MAP </a>"+
    "<a id=\"transfer\" > VIDEO </a>";
}

function loadVids() {
    var options = {
        part: 'snippet',
        key: key,
        maxResults: 20,
        q: q
    }	

    $.getJSON(URL, options, function (data) {
        console.log(data);
        
        var i = 0;
        while(true) {
            var kind = data.items[i].id.kind;
            if (kind == "youtube#channel") {
                i++;
            } else {
                var id = data.items[i].id.videoId;
                // mainVid(id);
                resultsLoop(data);
                break;
            }
        }        
    });
}

function resultsLoop(data) {
    var obj = {};
    var items = [];  
    obj.name = q.toLowerCase();

    for( var i = 0; i < 20; i++) {
        var item = {};

        if (data.items[i] == null || data.items[i].id.kind == "youtube#channel") continue;
        
        var thumb = data.items[i].snippet.thumbnails.medium.url;
        var title = data.items[i].snippet.title;
        var desc = data.items[i].snippet.description.substring(0, 100);
        var vid = data.items[i].id.videoId;
        
        document.getElementById("main").innerHTML += "<article class=\"item\" data-key=\"" + vid + 
                "\"> <img src=\"" + thumb + "\" alt=\"\" class=\"thumb\"> <div class=\"details\"> <h4>" + title + 
                "</h4> <p>" + desc + "</p> </div> </article> ";
        
        // setting json for localDB
        item.snippet = {
            thumbnails: {medium: {url: thumb}},
            title: title,
            description: desc
        };
        item.id = {
            videoId: vid,
            kind: data.items[i].id.kind
        };
        items.push(item);                
    }
    obj.items = items;
    if(!isLocal) {
        loadsth(obj);
    }
}

// CLICK EVENT
$('#main').on('click', 'article', function () {
    var id = $(this).attr('data-key');
    showVid();
    mainVid(id);
});

function showVid() {
    document.querySelector('#main').style.paddingTop = "340px";
}

function mainVid(id) {	
    $('#video').html("<iframe width=\"560\" height=\"265\" src=\"https://www.youtube.com/embed/" + id + "\" frameborder=\"0\" allow=\"autoplay; encrypted-media\" allowfullscreen></iframe>");
}

function searchForData(e) {
    // stops convetional submit
    e.preventDefault();

    value = input.value;
    if (value.localeCompare("") != 0){        
        location.replace("searching_video.html?q=" + value);
    }
}

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
        let objectStore = db.createObjectStore('notes_videos', { keyPath: 'id', autoIncrement:true });

        console.log('Database setup complete');
	};
}

function checkLocalDB() {
	//Get the ObjectStore
	let objectStore = db.transaction('notes_videos').objectStore('notes_videos');
	objectStore.openCursor().onsuccess = function(e) {
		// Get a reference to the cursor
		let cursor = e.target.result;
		if (cursor) {
			var json = cursor.value;
			if(json.name == q.toLowerCase()) {
			    // alert(json.name + " found!");
                isLocal = true;
                resultsLoop(json);
            } else {
			    cursor.continue();
            }
		}
		//else get an alert informing you that it is done
		else {
			console.log("All done:");
            isLocal = false;
            loadVids();
		}
	};
}

function loadsth(response){ 
    // open a read/write db transaction, ready for adding the data
    let transaction = db.transaction(['notes_videos'], 'readwrite');
  
    // call an object store that's already been added to the database
    let objectStore = transaction.objectStore('notes_videos');
    
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