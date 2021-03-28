<!DOCTYPE HTML>  
<html>
<head>

	<title>My search engine</title>
	<script type='text/javascript' src='JavaScriptSpellCheck/include.js' ></script>
	<script type='text/javascript' src='web_script.js' ></script>
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
	<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
	<link rel="stylesheet" href="style/map_style.css">

</head>
<body>  

<?php 
// define valiables to empty set
		$name = "";
		
		if ($_SERVER["REQUEST_METHOD"] == "POST") {
			$name = $_POST["name"];
		}
		if ($_SERVER["REQUEST_METHOD"] == "GET") {
			if(isset($_GET["name"])) {
				$name = $_GET["name"];
			}
		}
?>

<div id="main">

	<div id="logo">
			<img id="pictures/logo.png" src="logo.png" height="45" width="140" />

			<form  method="post" name="myForm" autocomplete="off" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]);?>">
				<div class="autocomplete" style="width:300px;">
					<input id="myInput" type="text" name="name" value="<?php echo $name;?>" placeholder="Searching..."> 
				</div>
				<button id="btn" type="submit" style="height:38px;width:40px" ><i class="fa fa-search" aria-hidden="true"></i> </button>
			</form><br>
			
			<a id="transfer" href="searching_web.html?q=<?php echo $name;?>&start=1" >WEB</a>
			<a id="transfer" href="searching_images.html?q=<?php echo $name;?>&start=1" >IMAGES </a>
			<a id="transfer" href="searching_video.html?q=<?php echo $name;?>" >   VIDEO </a> 
			<a id="transfer" > MAP </a><br>
	</div>

	<div class="mapouter">
		<div class="gmap_canvas">
			<iframe width="560" height="500" id="gmap_canvas" src="https://maps.google.com/maps?q=<?php echo $name; ?>&z=13&ie=UTF8&iwloc=&output=embed" frameborder="0" scrolling="no" marginheight="0" marginwidth="0"></iframe>
			<!--<a href="https://123movies-to.org">123movies websites</a> -->
		</div>
	</div>

</div>	
<script>

/*initiate the autocomplete function on the "myInput" element, and pass along the countries array as possible autocomplete values:*/
autocomplete(document.getElementById("myInput"));

</script>
</body>
</html>