

var currentURL = document.URL;
currentURL=currentURL.replace(/\+/g, '_').replace(/\%20/g, '_');
var currentTitle = document.title;var ct=currentTitle;
currentTitle=currentTitle.substring(0,currentTitle.indexOf('@')).replace(/\+/g, '_').replace(/\%20/g, '_');
if(!currentTitle) currentTitle=ct.replace(/\+/g, '_').replace(/\%20/g, '_');;
	var fbShare = document.getElementById("social_f");
	var gplusShare = document.getElementById("social_g");
	var twitterShare = document.getElementById("social_t");
	var whatsappShare = document.getElementById('social_w');
	var mailto = document.getElementById('social_m');
	fbShare.onclick = function() 
	{
		var win=window.open("https://www.facebook.com/sharer.php?u="+currentURL,"","height=368,width=600,left=100,top=100,menubar=0");
                console.log(win);
		return false;
	}
	gplusShare.onclick = function() 
	{
		window.open("https://plus.google.com/share?url="+currentURL,"","menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600");
		return false;
	}	
	twitterShare.onclick = function() 
	{
		window.open("https://twitter.com/share?url="+currentURL+"&via=MapmyIndia&text="+currentTitle,"","height=260,width=500,left=100,top=100,menubar=0");
		return false;
	}
	whatsappShare.onclick = function()
	{
		window.open("whatsapp://send?text="+currentURL,"","data-action=share/whatsapp/share")
	}
	mailto.onclick = function()
	{
		window.open("mailto:to=&subject=MapmyIndia Maps&body="+currentURL,"","data-action=share/whatsapp/share")
	}


