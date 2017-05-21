var cloudmadeUrl = 'http://{s}.mapmyindia.com/advancedmaps/v1/'+map_key+'/still_map/{z}/{x}/{y}.png',
cloudmadeAttribution = '',
 map = new L.Map('map', { center:[28.61, 77.23],zoomControl: false }).setView([28.61, 77.23], 5);
L.control.zoom({position: 'topright'}).addTo(map);
            var subDomains = ['tile1', 'tile2', 'tile3', 'tile4', 'tile5'];
            var mmisub = ['apis','mt0', 'mt1', 'mt2', 'mt3', 'mt4', 'mt5'];
             var mmi = new L.tileLayer('http://{s}.mapmyindia.com/advancedmaps/v1/'+map_key+'/still_map/{z}/{x}/{y}.png',
                    {attribution: "Map Data © MapmyIndia",maxZoom: 18,  minZoom: 4,subdomains: mmisub}).addTo(map); 
            var img = new L.tileLayer('http://{s}.nrsc.gov.in/tilecache/tilecache.py/1.0.0/bhuvan_imagery2/{z}/{x}/{y}.png', {
                attribution: "Satellite Imagery © Bhuvan (NRSC, ISRO)",maxZoom: 18,  minZoom: 4,
                subdomains: subDomains
            });
             var hybrid = new L.tileLayer('http://{s}.nrsc.gov.in/tilecache/tilecache.py/1.0.0/bhuvan_imagery2/{z}/{x}/{y}.png', {
                 attribution: "Map Data © MapmyIndia, Satellite Imagery © Bhuvan (NRSC, ISRO)",maxZoom: 18,minZoom: 4,
                subdomains: subDomains
            });
            var hyb = new L.tileLayer('http://{s}.mapmyindia.com/advancedmaps/v1/'+map_key+'/base_hybrid/{z}/{x}/{y}.png', {opacity: 0.6, subdomains: mmisub});
            var label = new L.tileLayer('http://{s}.mapmyindia.com/advancedmaps/v1/'+map_key+'/base_label/{z}/{x}/{y}.png',{ subdomains: mmisub});

            var m = {"MapmyIndia": mmi, "Bhuvan": img, "Hybrid": hybrid, };
            L.control.layers(m).addTo(map);
            map.on('baselayerchange', function (eo)
            {
                if (eo.name == "Hybrid") {
                    map.addLayer(hyb);
                    map.addLayer(label);
                    hyb.bringToFront();
                    label.bringToFront();
                } else {

                    map.removeLayer(label);
                    map.removeLayer(hyb);
                }
            });


var command = L.control({position: 'bottomright'});
command.onAdd = function (map) {   var div = L.DomUtil.create('div', 'command');div.innerHTML = "<div id='control_traffic' onclick=\"$('#traffic_show').trigger('click');\"><img src='images/traffic_off.png' id='traffic_img'></div><input type='checkbox' value='1' id='traffic_show' name='traffic_show' style='display:none' onclick=\"traffic_display();\"><div id='cur_loc' onclick=\"get_current(2)\"><img src='images/current_loc.png'></div>";    return div;
};
command.addTo(map);

/* TRAFFIC RELATED METHODS & GLOBAL VARIABLES*/
if($("#traffic_show").is(':checked')==true) queryTraffic();
map.on('dragend', function(e) 
{ 
 set_current(e,map.getCenter());
});
map.on('moveend', function() { 
 if($("#traffic_show").is(':checked')==true) {queryTraffic();isTrafficLayerOn = 0;}
 $("#cur_loc").html('<img src="images/current_loc.png">');
});

map.on('dblclick', function(e) {get_location(e.latlng);});
map.on('contextmenu', function(e) {get_location(e.latlng);});
map.on('click', function(e) {$(".as-results").hide();});
map.on('dragstart', function (e) {
    $('#nearbycatTD').hide();
});
var map_click_url= '';
var def_url="";/*@28.61,77.23,5z*/
var def_locality="delhi";

var trafficGeoJsonLayer = "";
var oldTrafficGeoJsonLayer = "";
var trafficData = "";
var trafficLastQueried = -1;
var isTrafficLayerOn = 0;
var json_req = 0;
var traffic_city = 0;
var traffic_call_again = 0;


function queryTraffic() {
    
    if($("#traffic_show").is(':checked')==false) return false;
    
    var bound=map.getBounds();
    var miny=bound._northEast.lat;var minx=bound._northEast.lng;
    var maxy=bound._southWest.lat;var maxx=bound._southWest.lng;
    
   
        if(json_req!=0) json_req.abort();
        json_req=$.ajax({url: "trafficData.php?minx="+minx+"&miny="+miny+"&maxx="+maxx+"&maxy="+maxy+"&traffic_city="+traffic_city,dataType: 'json', complete: function(result){
         trafficData = result.responseJSON;
       $("#loader").hide();
        if(trafficData==undefined) return false;
       /*if(trafficData.mess=='activate'){show_error("Traffic is available only Ahmedabad, Delhi-NCR, Chennai, Hyderabad, Kolkata, Mumbai, Pune only.");}*/
        if(result=='' || trafficData.mess=='loaded'  || trafficData.mess=='activate' || trafficData.features=='') return false;/***req valid*/
        if(result.mess=='validate'){window.location.reload();return false;}
        if(result.city!='') traffic_city=trafficData.city;
        oldTrafficGeoJsonLayer = trafficGeoJsonLayer;
        trafficGeoJsonLayer = L.geoJson(trafficData, {
            style: function (feature) {
                var rtype = feature.properties.tType;
                if (rtype == 'slow')
                    return {color: "red", weight: "2", opacity: "0.6"};
                else if (rtype == 'medium')
                    return {color: "yellow", weight: "2", opacity: "0.6"};
                else
                    return {color: "green", weight: "2", opacity: "0.6"};
            },
            onEachFeature: function (feature, layer) {
                layer.bindPopup(feature.properties.id + ": " + feature.properties.tType);
            }
        });
       
       trafficLastQueried = $.now();
       showTrafficOnMap();
       if(traffic_call_again!=0) clearTimeout(traffic_call_again);
       traffic_call_again = setTimeout(queryTraffic, 150000);
        }});
       
}

function showTrafficOnMap() {
    if (trafficLastQueried == -1) {
        queryTraffic(); return false;
    }

    /*if (!isTrafficLayerOn)*/
    
    map.addLayer(trafficGeoJsonLayer);
    $("#loader").hide();
    if (oldTrafficGeoJsonLayer)
     map.removeLayer(oldTrafficGeoJsonLayer);

    isTrafficLayerOn = 1;

}

function hideTrafficFromMap() {

    if (isTrafficLayerOn || trafficGeoJsonLayer)  map.removeLayer(trafficGeoJsonLayer);
    if (oldTrafficGeoJsonLayer)     map.removeLayer(oldTrafficGeoJsonLayer);
    isTrafficLayerOn = 0;
}








var ly = "";
var lx = "";
var ac = "";

function displayPosition(position) {

    var url = window.location.toString().split('/');
    var curl = url.slice(-1)[0];
    ly = position.coords.latitude;
    lx = position.coords.longitude;   
    ac = position.coords.accuracy;
    /*ly="37.8136";lx="144.9631";*/
    if (ly > 36.261688 || ly < 6.747100)  return false;

    var search = L.divIcon({className: 'bfont',html: "<div><div class='pin'></div><div class='pulse'></div></div>", iconAnchor: [1, 20],popupAnchor: [-5, -13]});
    
    if(curl_loc_bt==1)
    { 
        map.removeLayer(marker_cur);
        $.get( "get_click_revg?"+ly+"&"+lx+"&"+map.getZoom()+"&l",function(loc){ 
        if(loc) {var json_loc = JSON.parse(loc); if(json_loc.add_place!='') def_locality=json_loc.add_place; var rev_n=json_loc.add_place;} else var rev_n="current location";
        /*put values in dir & nr*/
           if($("#start_dirs").val()=='' || $("#start_dirs").val().indexOf('Current Location')!=-1){
            $("#start_dirs").val(lx + ',' + ly);
            $("#auto_start").val("Current Location-"+rev_n);
            if($("#end_dirs").val()!='' && curl.indexOf('direction-')!=-1)getDirection();/*call direction*/
            }
            if( $("#auto_near").val()=='')
            {   $("#auto_near").val("Current Location-"+rev_n);
                $("#curr_loc").val(lx + ',' + ly);
                $("#nearby_loc").val(lx + ',' + ly);
            }
        
        });
       
        marker_cur = L.marker([ly, lx], {icon: search}).bindPopup("<div id='click_div_pop' ><center><img src='images/load.gif' style='width:20px;margin-left:16px'></center></div>",{className:'popup_class',closeButton:true});
        marker_cur.on('click', function(e)
        { $.getJSON( "get_click_revg?"+e.latlng.lat+"&"+e.latlng.lng,function(loc){$('#click_div_pop').html("<img src='images/current_live.png' style='display:inline-block;vertical-align: middle;'>"+loc.adrs);});
        });
        map.removeLayer(xyzzz);
        var radius = ac / 2;
        xyzzz = L.circle([ly, lx], radius, {weight: 1, fillOpacity: 0.1,color:'#ccc',fillColor:'#58ACFA'});
        map.addLayer(xyzzz);
        map.addLayer(marker_cur); 
   }    
   else
   { 
       if(marker_cur) marker_cur.setLatLng([ly, lx]).update(); /*set only latlong on move*/
   }
       
        window.setTimeout(function () {
        if(curl=="" || curl_loc_bt==2){ map.fitBounds(xyzzz.getBounds());/*map.fitBounds([[ly, lx],[ly,lx]]);*/ def_url="@"+conv(ly.toFixed(6)+","+lx.toFixed(6)+","+map.getZoom(),'encode')+"z";}
        curl_loc_bt=1;
        },5);
         if(curl_loc_bt==2 || curl_loc_bt==1)    { window.setTimeout(function () {$("#cur_loc").html('<img src="images/current_live.png">');}, 500);}
    
 
  
}
function geoloc_error(error)
{
    var e_mess=0;
    switch(error.code) {
        case error.PERMISSION_DENIED:
           e_mess = "MapmyIndia does not have permission to view your location. Please change in browser settings!";
            break;
        case error.POSITION_UNAVAILABLE:
            e_mess = "Location information is unavailable.";
            break;
        case error.TIMEOUT:
           e_mess = "The request to get location timed out.";
            break;
        case error.UNKNOWN_ERROR:
            e_mess = "Location information not available.";
            break;
    }
    if(curl_loc_bt==2) show_error(e_mess);
}
var gt_loc=0;
var get_current=function(button)
{ 
    if(button==2) curl_loc_bt=2; else if(button==3) curl_loc_bt=3; 
    navigator.geolocation.getCurrentPosition(displayPosition,geoloc_error);
    if(gt_loc!=0) clearTimeout(gt_loc);
    window.setTimeout(function () { if($("#cur_loc").html()=='<img src="images/current_live.png">' && marker_cur) get_current(2); }, 5000);
  
};
get_current(1);/*call get current */
function render()
{
    /*   var url = window.location.toString().split('/');
       var curl = url.slice(-1)[0];
       if(curl.indexOf('place-')!=-1 || curl.indexOf('-near-')!=-1 || curl.indexOf('direction-')!=-1)
       {
        if(window.innerWidth>600) $("#map").animate({ left:'300px',right:0,top:0,bottom:0 })
        else $("#map").animate({ top:'54px',bottom:'20%',left:0,right:0 });
       }
       else $("#map").animate({ top:0,bottom:0,left:0,right:0 });*/
}
function feedback()
{
    var text=/*"<table cellpadding='0' cellspacing='5px' class='mobile-ui' style='width:320px;background-color: rgba(251, 251, 251, 1);position:fixed;top:50%;left:0;right:0;margin-top:-150px;border-radius:5px;box-shadow:0 0 5px rgab(0,0,0,.1);padding:5px;' align='center'><tr><td colspan='2' style='cursor:pointer;padding:5px;text-align:right'><div onclick=\"$('#fade_layer').hide()\">X</div></td></tr><tr><td colspan='2' style='border-bottom:1px solid #00adff; font-size: 18px;color:#00adff;'>How do you like our new version?<br><br></td></tr><tr height='50'><td align='right'>Email<span style='color:red;'>*</span></td><td align='left'><input type='text' id='email' class='input'></td></tr></tr><tr height='50'><td align='right' valign='top'>Feedback<span style='color:red;'>*</span></td><td align='left'><textarea id='feed_back' rows='5' class='input'></textarea></td></tr><tr><td colspan='2' ><div class='get-dire ui-submit' onclick=\"send_issue('feedback','feedback','')\">Submit</div></td></tr></table>"*/
    "<table cellpadding='0' cellspacing='5px' class='mobile-ui'  style='width:300px;background-color: rgba(251, 251, 251, 1);position:fixed;top:50%;left:0;right:0;margin-top:-150px;border-radius:5px;box-shadow:0 0 5px rgab(0,0,0,.1);padding:5px;' align='center'><tr><td colspan='3' font-size: 16px; color:#00adff; padding:5px 0px;' align='left'><strong>How do you like our new version?</strong></td><td colspan='1' width='25px' style='cursor:pointer;padding:5px;text-align:right'><div onclick=\"$('#fade_layer').hide()\">X</div></td></tr><tr><td colspan='4' style='border-bottom:1px solid #00adff; font-size:0px;'>&nbsp;</td></tr><tr><td colspan='4' style='font-size:12px; font-style:italics; color:#808080;' align='left'>We would love to hear about your user experience! Tell us about any issues, &amp; feel free to suggest improvements...</td></tr><tr height='50'><td align='right' style='font-size: 12px;'>Email<span style='color:red;'>*</span></td><td align='left' colspan='3' style='font-size: 12px;'><input type='text' id='email' class='input'></td></tr><tr height='50'><td align='right' valign='top' style='font-size: 12px;'>Feedback<span style='color:red;'>*</span></td><td align='left' colspan='3' style='font-size: 12px;'><textarea id='feed_back' rows='5' class='input'></textarea></td></tr><tr><td colspan='4' align='center'><div class='get-feedback' onclick=\"send_issue('feedback','feedback','')\">Submit</div></td></tr></table>";
    $("#fade_layer").html(text).show();
}
var marker2 = "";
var marker_cur = "";
var path_dir = "";
var path_dir_alt = "";
var from_marker = "";
var to_marker = "";
var via1_marker = "";
var near_search=0;
var near_markers=0;
var via2_marker = "";
var via3_marker = "";
var latlngss = "";
var path2 = "";
var mark = "";
var marker_along1 = new Array();
var marker_along = new Array();
var fwd = 0;
var fwds = 0;
var flags = "chk";
var xyzzz = "";
var abcd = "";
var nearby_marker=[];
var along_marker=[];
var nearby_marker_group=0;
var along_marker_group=0;
var mark_n = new Array();
var mark_n1 = new Array();
var marker_new1 = new Array();
var marker_new = new Array();

var main_mark = new Array();

var tot = new Array();
var arr_add = new Array();

var marker = new Array();
/*var marker_new = new L.FeatureGroup();*/
var flaginfodet = "";
var loadmorearray = new Array();
var curl_loc_bt=1;

var currLocDet = "";

var set_current=function(e, move_latln)   
{ 
  var current_z = e.target._zoom;
  var url = window.location.toString().split('/');
  var curl = url.slice(-1)[0];
  var curl_part = curl.split('@');
  var old_url = curl_part[1]; 
  var set_url = move_latln.lat.toFixed(6)+","+move_latln.lng.toFixed(6)+","+current_z;
  set_url=conv(set_url,'encode')+"z";
  if(typeof(curl_part[1])!='undefined')
  {   
    var new_url = curl.replace(curl_part[1].substring(0,curl_part[1].indexOf('z')+1),set_url);
  
  }
  else
  {
   
        if(curl=='') var new_url = "@"+set_url;
  }
 
 if(move_latln && typeof(new_url)!='undefined')
  {
    call_url(new_url,new_url);
  } 
};

function conv(no,type)
{ if(no=='' || no==undefined) return false;
    var code = ["f","l","j","t","a","s","e","o","q","v"];
    var res="";
    if(type=='encode')
    {
        for (var x = 0; x < no.length; x++)
        {
            var cd=code[no[x]];
            if(cd==undefined) cd=no[x];
            if(cd=='.') cd='i';
            res+=cd;
        }
    }
    else
    {
         for (var x = 0; x < no.length; x++)
        {
            var cd=code.indexOf(no[x]);
            if(cd==undefined || cd==-1) cd=no[x];
            if(cd=='i') cd='.';
            res+=cd;
        }
    }
    return res;
}
/*console.log(conv('12.6564,27.53535','encode'));
console.log(conv('ljiesea,joiststs','decode'));*/
window.onload = function () 
{ 
  var url = window.location.toString().split('/');
  var curl = url.slice(-1)[0];
  if(curl.indexOf('place-')==0) /*reload or link for place*/
  { 
    show_location('',curl.replace("place-","")); 
    get_place_details(curl);
    call_url('',curl);
    return false;
  }
  else if(curl.indexOf('direction') !== -1)
  {
    driving_box('');
    return false;
  }
  else if(curl.indexOf('add-place') !== -1)
  {
    var cordii=curl.split('zdata=');
    var p_cord=atob(cordii[1]).split('+');
    add_place_div(p_cord[0],p_cord[1]);
  }
  else if(curl=='near' ||curl.indexOf('-near-') !== -1)
  {
    near('');
    return false;
  }
  else if(curl.indexOf('@')==0) /*onload map loc dia*/
  {
    show_map(curl);
    return false;
  }
  else 
  {
   home();        
  } 
};
 
window.onpopstate = function(event) 
{ 
  var url = window.location.toString().split('/');
  var curl = url.slice(-1)[0];
  if(curl.indexOf('place-')==0) 
  { 
    show_location('',curl.replace("place-","")); 
    get_place_details(curl);
    return false;
  }
  else if(curl.indexOf('direction') !== -1)
  {
    driving_box('');
  }
  else if(curl=='near' ||curl.indexOf('-near-') !== -1)
  {
     near('');
    return false;
  }
  else if(curl.indexOf('@')==0) 
  {
    home();
    show_map(curl);return false;
  }
  else 
  {
    home();
    call_url('MapmyIndia Maps: Search locations, driving directions and places nearby',def_url);
    show_map(def_url);
  }
};
var show_map=function(location)
{ 
  var loc = location.replace('@','').split(',');
  if(loc[0]=='' || loc[0]==undefined) return false;
  $('#place_details').html('').hide();/*remove place details*/
  $('#auto').val('');/*remove auto value*/
  remove_layers();/**remove buttons & layers*/
   $("#mainH").show();
      window.setTimeout(function () {
               map.setView(new L.LatLng(conv(loc[0],'decode'),conv(loc[1],'decode')),conv(loc[2].replace('z',''),'decode'));
            }, 20
            );

};
function home()
{               $("#map").animate({ top:0,bottom:0,left:0,right:0 });
                pushy('hide');
                $('.search-direction').show();
                $('#search-cancel').hide();
                $('#search-x').hide();
                $('#footerdir').hide();
                $('#direction_mess').hide();
                $('#footerID').hide();
                $("#auto").val("");
                $("#mainH").show();
                $("#mapup").hide();
                $("#nearbyHead").hide();
                $("#footerhead").hide();
                $("#eloc").hide();
                $("#routeH").hide();
                $("#routePage").hide();
                $("#nearPage").hide();
                $("#searchnearByDV").hide();
                $("#distDVView").hide();
                $("#res_info").hide();
                /*
                $("#auto_dir_bt").show();
                $('#auto_near_bt').show();*/
                $("#auto_cross_bt").hide();
                remove_layers();
                call_url('MapmyIndia Maps: Search locations, driving directions and places nearby','.');
                if(click_marker) map.removeLayer(click_marker);/*right click*/
}

var place_d=0;
var get_place_details=function(eloc)
{ 
    $("#loader").show();
    $("#searchnearByDV").hide();
    $("#auto_cross_bt").show();
    if(place_d) place_d.abort();
    if(click_marker) map.removeLayer(click_marker);/*right click*/
  
  /*$('#res_info').html("<img src='images/load.gif' style='width:30px;margin:200px 55% 0 45%'>").show().css({"top":"96px",'height':'auto','max-height':'90vh','z-index':2});;*/
  var poi = eloc;
  place_d = $.get( "poi_details?poi="+poi, function(data) 
  {
    if(window.innerWidth>600) {var ht="auto";var mht="80vh";}
    else {var ht="auto"; var mht="auto";}
    if(data) $('#res_info').html(data).css({"top":"98px",'height':ht,'max-height':mht,'z-index':2}).show().scrollTop();
    $("#loader").hide();
  });
};

var call_url = function(title, req_url, inputId)
{
  if(!title) 
  {
    title = req_url.replace('place-','');
   
  }
  
  var url = window.location.toString().split('/');
  var curl = url.slice(-1)[0];
  if($.inArray("direction", url) !== -1 || url[4].indexOf("direction-") !== -1) 
  {
    newUrl = req_url.replace(/\%20/g, '+');
    document.title = title.replace(/\-/g, ' ');
  }
  else
  {
    newUrl = req_url.replace(/\%20/g, '+');
    var indat=title.indexOf('@');
    if(indat>=0) title=title.substring(0,indat);
    if(title=='') title="MapmyIndia Maps"; 
    document.title = title.replace(/\-/g,", ").replace(/\+/g," ").replace(/\%20/g, '+').replace(/\+/g, ' ');
   
  }

  if(curl != newUrl)
  {
  
    window.history.pushState("", title, newUrl);
  }

};
var popup_click=0;var click_marker=0;
function get_location(latlng)
{ 
 
   if(map_click_url) map_click_url.abort();var clicked=latlng;
   if(popup_click) map.removeLayer(popup_click);
   if(click_marker) map.removeLayer(click_marker);

  var icon_click_m = L.divIcon({className: 'bbfont',html:"<img src='images/2.png'>", iconAnchor: [15, 45],popupAnchor: [0, -33]});
  click_marker = new L.Marker(new L.LatLng(parseFloat(clicked.lat), parseFloat(clicked.lng)), {icon: icon_click_m}).bindPopup("<div id='click_div_pop' ><center><img src='images/load.gif' style='width:20px;margin-left:16px'></center></div>",{className:'popup_class',closeButton:true});
  map.addLayer(click_marker);
 
  click_marker.openPopup();
  click_marker.on('popupclose', function() {
   window.setTimeout(function () { map.removeLayer(click_marker);     }, 50            );    });
 
  /***/
  map_click_url=$.ajax({url: "get_click_revg?"+clicked.lat+"&"+clicked.lng+"&"+map.getZoom()}).done(function(data) 
  {
    if(data.trim()!=''  && data.trim()!='undefined')
    {  
                var json = JSON.parse(data);
       
                var res_adrs=json.address;
                var click_adrs=json.adrs.replace('/','').replace(/\%20/g, ' ');
                var dir_from=$("#auto_start").val();if(dir_from==undefined) dir_from="";
                var dir_to_cord=$("#start_dirs").val();if(dir_to_cord==undefined) dir_to_cord="";
                var click_dir_to="direction-from-"+dir_from+"-to-"+click_adrs+"zdata="+btoa("from+"+dir_to_cord+"+to+"+clicked.lng+","+clicked.lat+"+via");
                var f_text="<div id='top_lclick'><div class='blfont ' onclick=\"call_url('','"+res_adrs.replace('/','')+"'); show_location('map_click','"+res_adrs.replace('/','')+"');get_place_details('"+res_adrs.replace('/','')+"');$('.leaflet-popup-content-wrapper').hide() \" style='padding-bottom:7px'><b>"+json.name+"</b></div><br>"+json.adrs+"\n\
<br><div class='blfont line' style='padding:10px 10px 0 0' onclick=\"$('#top_lclick').hide(200);$('#report_text').show(100);\">Report error</div><div class='blfont' style='padding:10px' onclick=\"call_url('','"+click_dir_to+"');driving_box('');\">Direction to</div><div class='blfont' style='padding:10px' onclick=\"$('#nearby_loc').val('"+clicked.lng+","+clicked.lat+"');$('#auto_near').val('"+click_adrs+"');near('');\">Nearby</div></div>\n\
<div style='display:none;position:relative;margin:10px 0;' id='report_text'><div class='blfont'>Report error/info about here:</div><br><br><textarea id='issue' placeholder='Enter report here. Add email at end to stay updated.' style='margin-bottom:4px;border:1px solid #ccc;;width:180px;height:50px'></textarea><br><button onclick=\"if($('#issue').val()=='') $('#issue').focus(); else send_issue('"+clicked.lat+"','"+clicked.lng+"','"+res_adrs+"');\" style='border:1px solid #369CF5;color:#369CF5;background:#fff;padding:4px 10px;border-radius:6px'>Report</button></div>";
        $("#click_div_pop").html(f_text);
       
    }
   
  });
}
var get_geo=function()
{
    var str=$("#auto").val().replace(/\%20/g, '+');
    if(str=='') return false;
    var place_url='place-'+str+def_url+"@zdata=geo";
    call_url('',place_url);
    get_place_details(place_url);
     window.setTimeout(function () {
            $("#as-results-auto").hide();
            }, 50
            );
    
};
var  show_location = function (source,hash,inputId) /*search & display loc**/
{
  /*check search current loc*/
        var hash_address = hash.split("@");
        var title_text=hash.match("(.*)@");
        var title_f = title_text[1].toString().replace("place-","").replace(/\-/g,", ").replace(/\_/g," ").replace(/\+/g," ");
    if(hash.indexOf('data=geo')==-1)
    {    
        
        /*var arr_len=hash_address.length;*/
        var display_latln = hash_address[1].substring(0,hash_address[1].indexOf('zd')).split(',');
        var ltln_pos1 = hash_address[1].substring(hash_address[1].indexOf('data=')+5,hash_address[1].indexOf('ed'));/*latlng & zoom*/
        try{var ltln_pos = atob(ltln_pos1).split('+');}catch(err){$("#mainH").show();}
        var icon_d = L.icon({iconUrl: 'images/general.png',iconSize: [36, 51], iconAnchor: [15, 45],popupAnchor: [-1, -36]});
        remove_layers();
        /*if(hash.indexOf('urrent+location')>=1){ map.setView(new L.LatLng(ltln_pos[0],ltln_pos[1]),12); }*/
        if(def_locality==title_f){ map.setView(new L.LatLng(ltln_pos[0],ltln_pos[1]),12); }
        else
        {
            if(hash_address[1].indexOf('data=geo')==-1){ 
            
            yy1 = ltln_pos[0];   
            if(yy1.indexOf('.')==-1)
            {
            return false;
            }
            xx1 = ltln_pos[1]; 
            var zz=ltln_pos[2];
            marker2 = new L.Marker(new L.LatLng(parseFloat(yy1), parseFloat(xx1)), {icon: icon_d,draggable:false}).bindPopup("<div class='popup_dv'>"+hash_address[0].replace('place-','').replace(/\+/g," ").replace(/\-/g,",")+"</div>");
            marker2.on("dragend", function(e) {get_location(e.target._latlng)});  
            map.addLayer(marker2);
            var group = new L.featureGroup([marker2]);

            if(display_latln[0]=='undefined')
            { 
            map.fitBounds(group.getBounds()).setZoom(zz);
            }
            else if(source=='')
            {
             if(display_latln[0]==undefined || display_latln[0]=='')  {var disp_lat=yy1; var disp_lng=xx1;var disp_z=15;}
             else {var disp_lat=conv(display_latln[0],'decode');var disp_lng=conv(display_latln[1],'decode');var disp_z=conv(display_latln[2],'deocde');}
            /*converte all cord*/ 
              map.setView(new L.LatLng(disp_lat,disp_lng),zz);
            }
        }
    }
    }

  if(!$.inArray(inputId, ['auto_start','auto_end']) === -1)
  {
    $('#place_details').hide();/*hide if any place details*/
  }
 
   $("#mainH").show();var eloc="";
   if(hash.indexOf('data=geo')==-1){if(ltln_pos[3]) var eloc=ltln_pos[3].replace('ID','');else var eloc="";}
  $('#auto').val(decodeURIComponent(title_f.replace(", "+eloc,''))); 
  $('#search-near-dir').hide();
  $('#search-clear').show();
  $("#nearPage").hide();
  $('#distDVView').hide();/* route advice*/
  $("#routePage").hide();
  $("#direction_mess").hide();
};
function share()
{       
        var loc=window.location;
        var text="<table cellpadding='0' border=0 cellspacing='0' align='center' style='width:100%;padding-bottom:5px'><tr><td colspan='6' style='padding:8px 14px 0 10px'>Share via:<input type='text' id='share_input' style='outline: none;background:#fff;border:none;color:#fff;;width:2px;height:2px;' class='input' value='"+loc+"'></td></tr><tr><td align='center'><div id='social_l' onclick=\"$('#share_input').select();var cp=document.execCommand('copy');if(cp==true) show_error('Copied to clipboard! Paste to share.'); else show_error('Cannot copy URL. Please copy & paste browser url to share.');$('#share_input').blur(); \"><i class='fa fa-link' aria-hidden='true'></i></div><span class='social_txt'>Url</span></td><td align='center'><div id='social_f'><i class='fa fa-facebook' aria-hidden='true'></i></div><span class='social_txt'>Facebook</span></td><td align='center'><div id='social_t'><i class='fa fa-twitter' aria-hidden='true'></i></div><span class='social_txt'>Twitter</span></td><td align='center'><div id='social_g'><i class='fa fa-google-plus'></i></div>Google+</td><td align='center' ><span id='whatapp'><div id='social_w'><i class='fa fa-whatsapp' ></i></div><span class='social_txt'>Whatsapp</span></span>&nbsp;</td><td align='center'><div id='social_m'><i class='fa fa-envelope-o'></i></div><span class='social_txt'>Mail</span></td></tr></table><script src='"+js_path+"/share.js'></\script>";
    $("#share_txt").html(text).toggle();$('body').animate({ scrollTop: 1000 })
}

function save_search(type)
{
  /*if($("#my-fav").html().indexOf('Saved')>=1) return false;*/
  
  var error = false;
  var separators = (type=='myRoute') ? ['-from-','-to-', '@', 'data='] : ['-', '@', 'zdata='];
  var currentURL = document.URL.split(new RegExp(separators.join('|'), 'g'));
  var decodeString = (type=='myRoute') ? '' : atob(currentURL[(currentURL.length)-1].replace('ed','')).split('+');
  if(type=='myRoute')
  {
    var name = currentURL[1]+' to '+currentURL[2];
  }
  else if(type=='addToList')
  {
    var name = $("input[name='name']").val();
  }
  else
  {
    var name = currentURL[2];
  }
  var placeId = ((type=='myRoute')) ? '' : decodeString[3];
  var url = document.URL;
  var lat = (type=='myRoute') ? '' : decodeString[0];
  var lng = (type=='myRoute') ? '' : decodeString[1];
  if(type=='addToList')
  {
    var listType = $("#list-type").val(); 
  }
  else if(type=='myRoute')
  {
    var listType =3;
  }
  else
  {
    var listType =2;
  }

  var locType = (type=='addToList' && $('input.chb').is(':checked')) ? $('.chb:checked').val() : 0;

  var listName = (type=='addToList' && $("input[name='list-name']").val()) ? $("input[name='list-name']").val() : 0;

  if((type=='favourite' && $('#my-fav').children().prop('class')=='fa fa-heart') || (type=='myRoute' && $('#save_route').children().prop('class')=='fa fa-road saved'))
  {
    var status = 0;
  }
  else
  {
    var status = 1;
  }

  if(type == 'addToList' && name.length < 2)
  {
    show_error("Name cannot be less than 2 characters");

  }

  if(!error)
  {
    $("#loader").show();
    $.post("userAuth", {name:name,'place-id':placeId,url:url,lat:lat,lng:lng,'loc-type':locType,'list-type':listType,'status':status,'list-name':listName,'mamth':'M114'}, function (data) 
    {
      var decode = JSON.parse(data);
      if(decode.response == false)
      {
        if(decode.error)
        {
          show_error(decode.error[0]);
        }
      }
      else if(decode.response.response == '201')
      {
        if(type == 'favourite')
        {
          if($('#my-fav').children().prop('class') == 'fa fa-heart')
          {
            $('#my-fav').html('<i class="fa fa-heart-o" aria-hidden="true"></i> Save');
          }
          else
          {
            $('#my-fav').html('<i class="fa fa-heart" aria-hidden="true"></i> Saved');
          }
          $('body').animate({ scrollTop: 1000 });
        }
        else if(type == 'addToList')
        {
          if(decode.response.data.message == 'already exist')
          {
            show_error('Place already exist in selected list');
          }
          else
          {
          $('#add_list').html('<i class="fa fa-check" aria-hidden="true"></i> Added');
          $("#fade_layer").hide();
          }
        }
        else if (type == 'myRoute') 
        {
          if($('#save_route').children().prop('class')=='fa fa-road saved')
          {
            $('#save_route').html('<i class="fa fa-road save" aria-hidden="true"></i> Save');
          }
          else
          {
            $('#save_route').html('<i class="fa fa-road saved" aria-hidden="true"></i> Saved');
          }
          $('body').animate({ scrollTop: 1000 });
        }
      }
      else if(decode.response.html)
      {
        var string = [];
        (type=='myRoute') ? string.push({'event':'myRoute'}) : string.push({'event':'favourite'});
        localStorage.setItem('event', JSON.stringify(string));
        var text = decode.response.html;
        $("#fade_layer").html(text).show(150);
      }
      else
      {
        show_error(1);
      }
      $("#loader").hide();
    });
  }
  return false;
}
function add_list()
{
  $.post('userAuth', {'mamth':'M102'}, function (data) 
  {
    var decode = JSON.parse(data);
    var text = decode.response;
    pushy('hide');
    $("#fade_layer").html(text).show(500);
    if(decode.form == 'M101')
    {
      var string = [];
      string.push({event:'addToList'});
      localStorage.setItem('event', JSON.stringify(string));
    }
    else if(decode.form == 'M102')
    {
      var separators = ['-', '@', 'zdata='];
      var currentURL = document.URL.split(new RegExp(separators.join('|'), 'g'));
      $("input[name='name']").val(currentURL[2].charAt(0).toUpperCase() + currentURL[2].slice(1).replace(/\%20/g, ' ').replace(/\+/g, ' '));
    }
  });
}
function getCatTurn()
{
    $("#cat_turn").show();
    $("#cat_tms_tab").hide();
    $("#dirleftrightDV").hide();
    $("#map_topsec").hide();
    $("#map").hide();


}
function showDirection()
{

    if (window.location.hash.substr(1).toString() != "direction") {
            return false;
    }
    $('#nearbycatTD').hide();
    $("#footernearby").hide();
    $('#info_dis').html("");
    $('#nearby_top').hide();
 
    $("#routeH").show();
    $("#loader").hide();
    $("#routePage").show();

    $("#mainH").hide();
    /*$("#map").hide();
    $("#start_dirs").val("");$('#start_direction').html("-");*/
    $("#hid_via").val("");
    if ($("#auto").val() == "")
    {
        $("#loc").val("");
    }

}

function addVia(typ)
{
    if (typ == "add")
    {

        $("#hid_via").val("via location");
        $("#via").val("");
        $("#tdAdd").hide();
        $("#tdSub").show();
        $("#viaCurr").show();
    }
    else if (typ == "sub")
    {

        $("#hid_via").val("");
        $("#via").val("");
        $("#tdAdd").show();
        $("#tdSub").hide();
        $("#viaCurr").hide();
    }
}

function forward_btn()
{
    var latnlon = $("#getlatlon").val();
    var hash = window.location.hash.substr(1).toString();
    if (hash == "infodet")
    {
        $("#eloc").hide();
        $("#searchnearByDV").show();
        $("#footerhead").hide();
        $("#nearbyHead").show();
        $("#fndlatlon").val(latnlon);
    }

    if (hash == "nearby")
    {
        $('#direction_div').hide();
    }

}
function bck_button()
{
    var hash = window.location.hash.substr(1).toString();
    if (hash == "infodet")
    {
        $("#footerhead").hide();
        $("#footerID").show();
        $("#map").show();
    }

    else if (hash == "route")
    {
        $("#footerhead").hide();
        $("#eloc").hide();
        $("#routePage").show();
    }
}
var glb_datas;
var glb_vals;
var glb_p;

var datas = "";
var vals = "";
var p = "";
var poi = "";
var poi_address = "";
var poi_locality = "";
var poi_city = "";
var poi_district = "";
var poi_state = "";
var poi_pin = "";
var poi_x = "";
var poi_y = "";

var addp=0; var add_place_marker=0;var rev_url=0;
function add_place_div(lat,lng)
{   return false;
    $("#auto").val('');
    show_error("We're working on this, try later!");
     return false;
    remove_layers();
    if(lat=='' || lat=='undefined'){mct=map.getCenter();lat=mct.lat;lng=mct.lng;}
    call_url('Add Place','add-place@'+lat+','+lng+','+map.getZoom()+'zdata='+btoa(lat+'+'+lng+'+'+map.getZoom()));
    if(addp) addp.abort();
    var icon_d = L.icon({iconUrl: 'images/marker_default.png',iconSize: [36, 51], iconAnchor: [15, 45],popupAnchor: [-3, -76]});
    add_place_marker = new L.Marker(new L.LatLng(lat,lng), {icon: icon_d,draggable:true});
    map.addLayer(add_place_marker);
    add_place_marker.on("dragend", function(e) {add_place_div(e.target._latlng.lat,e.target._latlng.lng)});  
    if(popup_context)map.removeLayer(popup_context);/*remove pop*/
    /*get add place html*/
    addp=$.post("add-place", function(data)
    {  
        $('#place_details').html(data).fadeIn(100).css("z-index","10");
        $('#map-sidebar').hide();
        if(rev_url) rev_url.abort();
        rev_url=$.ajax({url: "get_click_revg?"+lat+"&"+lng}).done(function(data) {var json_r = JSON.parse(data);$("#street_adrs").val(json_r.add_place);});
    });
    /*get rev*/
  
}
function near(find)
{ 
    remove_layers();
    var url_n = window.location.toString().split('/');
    var curl = url_n.slice(-1)[0];
    var dta=curl.split("data=");
    /**check in url*/
     var auto_near_call=0;
    if(dta[1]!=null && curl.indexOf('-near')!=-1)
    { 
        var data_val=atob(dta[1].replace('ed','')).split('+');
        if(data_val[0]) $('#nearby_loc').val(data_val[0]);
        if(data_val[1]) 
        {
            $('#nearby-select').val(data_val[1]);
            var what_name=dta[0].substring(0,dta[0].indexOf('-near'));
            $('#near_what').val(what_name.replace(/\%252/g, ' ').replace(/\+/g, ' ').replace(/\%20/g, ' '));
            var where_name=dta[0].match("near-(.*)@");
            var where_adrs=where_name[1].replace(/\-/g, ' ').replace(/\+/g, ' ').replace(/\%20/g, ' ');
            
            $('#auto_near').val(where_adrs);
            $('#nearPage').show();
            $('#routePage').hide();
            $('.top-heading').hide();
            $('#get-dire').hide();
           
            searchnearByData(0); /*call api for nearby*/
            auto_near_call=1;
        }
       
    }
    if (find == "" && auto_near_call==0)
    {
        var url_n = window.location.toString().split('/');
        var curl = url_n.slice(-1)[0];
        if(curl!='near' && curl.indexOf('-near-') == -1)
        {
            call_url('MapmyIndia Maps-Nearby','near');
            $("#near_what").val('');
        }
     
        pushy('hide');
        $('#cat-nearby').hide();
        $('#direction_div').hide();
        $('#nearbycatTD').hide();
        $('#footernearby').hide();
        $('#nearyby-search').hide();
        $('#info_dis').hide();
        $('#near-search').val("");
        $('#nearPage').show();
         $('#routePage').hide();
        $("#MAINsearchnearbyDV").show();
        $("#searchnearByDV").show();
        $("#routeH").show();
        $("#end_dir").hide();
        $("#start_dir").hide();
        $('#mainH').hide();
        $("#res_info").hide();
         $("#direction_mess").hide();
        $('#what_menu').html("<i class='fa fa-chevron-circle-down' aria-hidden='true'></i>");
    }
    
    what_get_div('');/*get all category div*/
    if(auto_near_call==0) $("#loader").hide();
}
var what_div_u=0;
function what_get_div(type)
{
    if(what_div_u) what_div_u.abort();
    $("#loader").show();
    what_div_u=$.get( "what-div?type="+type, function(data) {  $('#searchnearByDV').css({"top":"145px"}).animate({ scrollTop: 0 }).html( data );$("#loader").hide();}).fail(function() { });
}

var what=0;
function get_what(q)
{
    if(what) what.abort();
    what= $.get( "near-new?lat="+near_lat+"&lng="+near_lng+"&cat_code="+cat_code+"&page="+pg, function(data) {  $('#res_info').animate({ scrollTop: 0 }).html( data ).show(); $("#loader").hide();}).fail(function() { });
}
function show_cat_menu()
{ 
    if($('#searchnearByDV').css('display') == 'none') {$('#searchnearByDV').fadeIn(200);$('#what_menu').html("<i class='fa fa-chevron-circle-down' aria-hidden='true'></i>");}
    else {$('#searchnearByDV').fadeOut(200);$('#what_menu').html("<i class='fa fa-chevron-circle-up' aria-hidden='true'></i>");} 
}
function searchnearByData(pp)						
{ 
    $("#loader").show();
    var url_n = window.location.toString().split('/');
    var curl = url_n.slice(-1)[0];
    var data = "";
    var latlngs = "";
    var auto_near= encodeURIComponent($("#auto_near").val());
    var near_latln = $("#nearby_loc").val();
    var what = encodeURIComponent($("#near_what").val());
    var sval = $('#nearby-select').val();
    var sval_arr = sval.split('#');
    $('input').css({"background":"","background-size":"20px"});
   
    var ltlon = $("#nearby_loc").val();
    $('#nearbycatTD').hide();
     if(click_marker) map.removeLayer(click_marker);/*right click*/
    $("#info_dis").hide();
    if (ltlon == "" || ltlon == undefined) { show_error('Search where location to get result'); $("#loader").hide(); return false;  }
    var hiddNearby = $("#nearbycurrloc").val();
   
    var near_url=what.toLowerCase()+"-near-"+$("#auto_near").val().replace(/\ /g, '-').replace('Current-Location-','').toLowerCase()+"@zdata="+btoa(near_latln+"+"+sval_arr[0]);
    if(curl!=near_url) call_url('',near_url);
    var ltln=near_latln.split(',');
    
    get_nearby_pages(1,ltln[1],ltln[0],sval_arr[0],1);/**call pages*/
    $('#searchnearByDV').hide();
    $('#what_menu').html("<i class='fa fa-chevron-circle-up' aria-hidden='true'></i>");
  
}
var nearby_call=0;
var get_nearby_pages=function(button_click,near_lat,near_lng,cat_code,pg)
{ 
    if(nearby_call) nearby_call.abort();
    nearby_call= $.get("near-new?lat="+near_lat+"&lng="+near_lng+"&cat_code="+cat_code+"&what="+$('#near_what').val()+"&where="+$('#auto_near').val()+"&page="+pg, function(data)
    {
        /*if(window.innerWidth>600) $("#map").animate({ left:'300px',right:0 });
        else $("#map").animate({ top:0,bottom:'20%',left:0,right:0 });*/
        /*marker for searched */
        
        $('#res_info').animate({ scrollTop: 0 }).html( data ).css({"top":$("#nearPage").height()+6,height:"80vh"}).show();
        
        if($('#auto_near').val().toLowerCase().indexOf('current')==-1 ) {
           /* var nIcon = L.icon({iconUrl: 'images/8.png',iconSize: [36, 51],iconAnchor: [15, 45],popupAnchor: [-3, -76]});
            if(near_search) map.removeLayer(near_search);
            near_search = new L.Marker(new L.LatLng(near_lat, near_lng), {icon: nIcon});map.addLayer(near_search);*/
    }
     /*map.setView(new L.LatLng(near_lat, near_lng),map.getZoom());*/
        $("#loader").hide();
    }).fail(function() { });
};
function showCurrMarker(e)	
{
    var currlat = e.latlng;
    var arr_poi_str = poi.split(',');
    var arr_add_str = poi_address.split(',');
    var arr_loc_str = poi_locality.split(',');
    var arr_cty_str = poi_city.split(',');
    var arr_dst_str = poi_district.split(',');
    var arr_stt_str = poi_state.split(',');
    var arr_marr;

    $.each(marker, function (index, value) {						
        map.removeLayer(value);
    });

    $.each(marker_new, function (index, value) {					
        map.removeLayer(value);
    });

    $("#nearbycatTD").show();

    var j;
    var blueMarket = L.icon({
        iconUrl: 'images/poi_nearby.png',
        iconSize: [36, 51],
        iconAnchor: [15, 45],
        popupAnchor: [-3, -76]
    });

    var greenIcon = L.icon({
        iconUrl: 'images/poi_selected.png',
        iconSize: [36, 51],
        iconAnchor: [15, 45],
        popupAnchor: [-3, -76]
    });

    $("#lblsearchnearby").show();


    if (marker_new1)
    {
        $.each(marker_new1, function (index, value) {
            map.removeLayer(value);

        });

    }
    marker_new1 = [];
    marker_new = [];
    for (j = 0; j < tot.length; j++)
    {
        arr_marr = "LatLng(" + tot[j][0] + ", " + tot[j][1] + ")";

        arr_poi = arr_poi_str[j];
        arr_ad = arr_add_str[j];
        arr_loc = arr_loc_str[j];
        arr_city = arr_cty_str [j];
        arr_district = arr_dst_str[j];
        arr_state = arr_stt_str[j];

        var arr_fulladress = "<div style='overflow:hidden;text-overflow: ellipsis;white-space: nowrap;height:15px;line-height:15px;' class='bltitle'>" + arr_poi + "</div><div style='overflow:hidden;text-overflow: ellipsis;white-space: nowrap;padding-bottom:5px;'>" + arr_loc + " " + arr_district + " " + arr_city + "  " + arr_state + "</div>";
        if (arr_marr == currlat)
        {

            marker_new[j] = new L.Marker([tot[j][0], tot[j][1]], {icon: greenIcon});
            $("#nearbyTxt").html(arr_fulladress);
            var llt = tot[j][1] + "," + tot[j][0];
            $('#end_dirs').val(llt);
            $('#end_direction').html(arr_poi + "," + arr_loc + " " + arr_state);
        }
        else
        {
            marker_new[j] = new L.Marker([tot[j][0], tot[j][1]], {icon: blueMarket});
        }
        $.each(marker, function (index, value) {
            map.removeLayer(value);
        });

        marker_new1.push(marker_new[j]);
        map.addLayer(marker_new[j]);
        marker_new[j].on('click', showCurrMarker);
    }
    ;
}



function showCatMap(lat, lon)
{

    var res_x = Math.round(lat * 100000) / 100000;
    var res_y = Math.round(lon * 100000) / 100000;

    var arr_poi_str = poi.split(',');
    var arr_add_str = poi_address.split(',');
    var arr_loc_str = poi_locality.split(',');
    var arr_cty_str = poi_city.split(',');
    var arr_dst_str = poi_district.split(',');
    var arr_stt_str = poi_state.split(',');

    var currlat = res_y + "," + res_x;



    var greenIcon = L.icon({
        iconUrl: 'images/poi_selected.png',
        iconSize: [36, 51], 
        iconAnchor: [15, 45], 
        popupAnchor: [-3, -76] 
    });

    var blueMarket = L.icon({
        iconUrl: 'images/poi_nearby.png',
        iconSize: [36, 51], 
        iconAnchor: [15, 45], 
        popupAnchor: [-3, -76]
    });

    var arr_marr1 = '';
    var val = "";
    for (var p = 0; p < tot.length; p++)
    {

        arr_marr1 = tot[p][0] + "," + tot[p][1];
        arr_poi = arr_poi_str[p];
        arr_ad = arr_add_str[p];
        arr_loc = arr_loc_str[p];
        arr_city = arr_cty_str [p];
        arr_district = arr_dst_str[p];
        arr_state = arr_stt_str[p];

        if (arr_marr1 == currlat)
        {

            var arr_fulladress = "<div style='overflow:hidden;text-overflow: ellipsis;white-space: nowrap;height:15px;line-height:15px;' class='bltitle'>" + arr_poi + "</div><div style='overflow:hidden;text-overflow: ellipsis;white-space: nowrap;padding-bottom:5px;'>" + arr_loc + " " + arr_district + " " + arr_city + "  " + arr_state + "</div>";
            mark_n = new L.marker([tot[p][0], tot[p][1]], {icon: greenIcon});
            val = mark_n;
            $("#nearbyTxt").html(arr_fulladress);
            $("#nearbycatTD").show();
            var llt = tot[p][1] + "," + tot[p][0];
            $('#end_dirs').val(llt);
            $('#end_direction').html(arr_poi + "," + arr_loc + " " + arr_state);
        }
        else
        {
            mark_n = new L.marker([tot[p][0], tot[p][1]], {icon: blueMarket});
        }

        mark_n1.push(mark_n);
        map.addLayer(mark_n);
        mark_n.on('click', showCurrMarker);
    }

    $("#nearbycatTD").show();
    $('#cat-nearby').hide();
    $("#lblsearchnearby").show();
    $("#catefooter").show();
    var group = new L.featureGroup([val]);
    map.fitBounds(group.getBounds());
}

function viewDirLoc()
{
    var latnlon = $("#hidlatlon").val();
    $('#info_dis').html("");
}

function viewlocdet()
{
    var ploc = $("#hidfooterTxt").val();

    var latnlon = $("#hidlatlon").val();

    if (ploc == "" || ploc == 'undefined')
    {
       
        return false;
    }
    else
    {
       
        $.get("eloc.php", {ploc: ploc}, function (data) {

            var names = data.poiname;
            var state = data.state;
            var district = data.distname;
            var city = data.city;
            var address = data.address;
            var locname = data.locname;
            var eloc1 = data.eloc;
            var poid = data.poi_id;
            var phone = data.tel;

            var web = "http://" + data.web;
            var pincode = data.pin;
            var fax = data.fax;
            var email = data.email;
            var eloc_x = data.x;
            var eloc_y = data.y;
            var fulladress = " " + address + " " + locname + " " + district + " " + city + " " + state;
            if (pincode != "")
                fulladress = fulladress + "-" + pincode;
         

            flaginfodet = "pass";

            $("#fotteradd").html("<b>" + names + "</b>");
            $("#nearbySrch").val(names);
            $("#currAddr").html("<center><div style='padding:12px 0 6px 0;width:94%;text-align:left'>" + fulladress + "</div></center>");
            if (phone != "")
                $("#currAddr").append('<center><div class="con-p"><div  class="bfont"  id="poi_t">Phone</div><div style="padding:7px 0px 7px 7px " class="bbfont"><a href="tel:+' + phone + '" class="blfont" style="text-decoration:none">' + phone + "</a></div></div></center>");
            if (email != "")
                $("#currAddr").append('<center><div class="con-p"><div  class="bfont"  id="poi_t">Email</div><div style="padding:7px 0px 7px 7px "><a href="mailto:' + email + '" class="blfont" style="text-decoration:none">' + email + "</a></div></div></center>");
            if (web != "" && web != 'http://')
                $("#currAddr").append('<center><div class="con-p"><div  class="bfont"  id="poi_t">Website</div><div style="padding:7px 0px 7px 7px "><a href="' + web + '"  class="blfont" target="_blank" style="text-decoration:none">' + web + '</a></div></div></center>');
            $("#getlatlon").val(latnlon);
          
            $("#webdet1").attr("href", email);
            $("#eloc").show();

            $("#emailIDINFO").text(email);

            $("#phoneID").click(function () {
                window.location = "href=tel:" + phone;
            }, 'json');


            $("#emailIDINFO").click(function () {
                window.location = "mailto:" + email;
            });
            $("#webdet1").attr("href", web);
        }, 'json');
        return false;
    }
}
var via_r1="";var via_r2="";var via_r3="";
function driving_box(url)
{             
                  
                    var url = window.location.toString().split('/');
                    var curl = url.slice(-1)[0];
                    $("#dir_dv_via_along").hide();
                    $("#save_route_txt").html("Save");
                    if(curl.indexOf('direction')==-1) call_url('MapmyIndia Maps-Direction','direction');
                    else
                    { 
                        var dta=curl.split("data="); 
                        if(dta[1]!=null) dta=atob(dta[1].replace('ed','')).split('+');
                        if(dta[5]!='||' && dta[5]!=undefined){ /*featch via*/
                            var v_route=dta[5].split("|");
                            via_r1=v_route[0];
                            via_r2=v_route[1];
                            via_r3=v_route[2];
                        }
                        
                        if(curl.indexOf('data=')!=-1)
                        { 
                            var frm=curl.match("from-(.*)-to");
                            if(frm!=null)
                            {   $('#auto_start').val(decodeURIComponent(frm[1].replace(/\-/g, ' ')));
                                $('#start_dirs').val(decodeURIComponent(dta[1]));
                            }
                            else {$('#auto_start').val('');$('#start_dirs').val('');}
                            var tloc=curl.match("to-(.*)data");
                            if(tloc!==null)
                            { 
                                $('#auto_end').val(decodeURIComponent(tloc[1].replace('+',' ').replace(/\!/g, '').replace(/\-/g, ' ')));
                                $('#end_dirs').val(decodeURIComponent(dta[3]));
                            }
                            else {$('#auto_end').val('');$('#end_dirs').val('');}
                                    
                        if($('#start_dirs').val() && $('#end_dirs').val()) getDirection();
                      
                        }
                    }
                    remove_layers();
                    $("#routePage").animate({top: "0px"}, 400);
                    $("#mainH").hide();
                    $("#routeH").show();
                    $("#routePage").show();
                     $("#footerdir").hide();
                    $("#eloc").hide();
                    $("#footerhead").hide();
                    $("#dirleftrightDV").hide();
                    $("#cat_turn").hide();
                    $("#distDVView").hide();
                    $("#footerID").hide();
                    $("#MAINsearchnearbyDV").hide();
                    $("#start_dir").hide();
                    $('#end_dir').hide();
                    $('#direction_info').html('');
                    $('#res_info').hide();
                     $('#nearby_top').hide();
                    $("#nearyby-search").hide();
                    $("#searchnearByDV").hide();
                    $("#nearPage").hide();
                      $("#map").animate({ top:0,bottom:0,left:0,right:0 });
          
}
function exchange_dir(click_place)
{
    var from_v=$("#start_dirs").val();
    var from_txt=$("#auto_start").val();
    var to_v=$("#end_dirs").val();
    var to_txt=$("#auto_end").val();
    $("#end_dirs").val(from_v);$("#auto_end").val(from_txt);
    $("#start_dirs").val(to_v);$("#auto_start").val(to_txt);
    getDirection();
}
function add_via(nameValue)
{ 
    var a_via1=$("#auto_via1").length;
    var a_via2=$("#auto_via2").length;
    var a_via3=$("#auto_via3").length;
    if($("#start_dirs").val()=='') {$("#auto_dirs").focus();return false;}
    if($("#end_dirs").val()=='') {$("#auto_end").focus();return false;}
    if(nameValue=='')
    {
        if(a_via1==1 && $("#auto_via1").val()==''){$("#auto_via1").focus();return false;}
        if(a_via2==1 && $("#auto_via2").val()==''){$("#auto_via2").focus();return false;}
        if(a_via3==1 && $("#auto_via3").val()==''){$("#auto_via3").focus();return false;}
    } 
    if(a_via1==1 && a_via2==1 && a_via3==1) {show_error("Uh oh. Thats is maximum limit of via");return false;}
    if(a_via1==0) {var dv_name="auto_via1"; var hid_name="via1_dirs";} else if(a_via2==0) {var dv_name="auto_via2"; var hid_name="via2_dirs";} else {var dv_name="auto_via3"; var hid_name="via3_dirs";}
    
    if(nameValue)   {        var nv=nameValue.split('#'); var via_txt=nv[0];var via_val=nv[1];  }
    else { var via_txt="";var via_val="";}
    var via_dv='<div class="current"  id="route_'+dv_name+'"><div class="bbfont line" style="text-align:right;padding-right:10px;width:50px;height:auto;display: inline;float:left;">Via:</div><div id="end_direction" class="blfont line"><span class="bgfont"><input id="'+dv_name+'" value="'+via_txt+'" class="search as-input" style="background:#fff" onfocus="this.select()" placeholder="Search location" name="'+dv_name+'" autocomplete="off"></span></div><div class="line exchange" onclick="close_via(\'route_'+dv_name+'\',\''+hid_name+'\')"><span>&#10005;</span></div><input type="hidden"  id="'+hid_name+'" value="'+via_val+'"><script language="javascript">$("#'+dv_name+'").autoSuggest(a,{ asHtmlID : "'+dv_name+'",selectedItemProp : "addr",searchObjProps : "addr",resultsHighlight : false});'+"</script\></div>";
   $(via_dv).insertBefore( "#dir_dv_via_along" );
   $("#res_info").css({"top":$("#routePage").height()+20});
    if(nameValue)
    { /**call afet click on add via along thge route popup*/
        $('#distDVView').hide();
        getDirection();
    }
}
function close_via(via_dv,via_input)
{
   $("#"+via_dv).remove();
   if($('#'+via_input).val()!='') getDirection();
}
var adv_res_meter = "";/*route advice array*/
var adv_res_alt_r = "";/*alternative advice array*/
var adv_res_lat = "";
var adv_res_lng = "";

var dir_poi = "";
var dir_poi_add = "";
var dir_poi_loc = "";
var dir_poi_city = "";
var dir_poi_dist = "";
var dir_poi_state = "";
var dir_poi_phone = "";
var dir_poi_eloc = "";
var along_param=0;
var along_param_alt=0;

function getDirection()
{
    var url = window.location.toString().split('/');
    var curl = url.slice(-1)[0];
    var data = "";
    var latlngs = "";
    var latlngs_alt = "";
    var latlngs_v1 = "";
    var latlngs_v2 = "";
    var latlngs_v3 = "";
    var hidCurr = encodeURIComponent($("#start_dirs").val());
    var hidLoc= encodeURIComponent($("#end_dirs").val());
    if(hidCurr==hidLoc){show_error("Oops! Try changing either your to or from location."); $('#loader').hide();return false;};
    var via1 = encodeURIComponent($("#via1_dirs").val());if(via1=='undefined' && via_r1!='') via1=via_r1; else if(via1=='undefined') via1="";
    var via2 = encodeURIComponent($("#via2_dirs").val());if(via2=='undefined' && via_r2!='') via2=via_r2; else if(via2=='undefined') via2="";
    var via3 = encodeURIComponent($("#via3_dirs").val());if(via3=='undefined' && via_r3!='') via3=via_r3; else if(via3=='undefined') via3="";
    var along = encodeURIComponent($("#along_route").val());
    var dir_cord=btoa("from+"+hidCurr+"+to+"+hidLoc+"+v+"+via1+"|"+via2+"|"+via3);
     var dir_url="direction-from-"+$("#auto_start").val().replace(/\ /g, '-').toLowerCase().replace('current-location-','')+"-to-"+$("#auto_end").val().replace(/\ /g, '-').toLowerCase().replace('current-location-','')+"data="+dir_cord;
    call_url('',dir_url);
    var hid_curr_loc = $("#hid-curr-loc").val();
    var hid_loc2 = ""; 
    var chkbox = $("input[name='radiog_dark']:checked").val();
    $('#nearbycatTD').hide();
    $("#footernearby").hide();
    $("#nearyby-search").hide();
    
     if(click_marker) map.removeLayer(click_marker);
    if (hidCurr == "" || hidCurr == '%20'){$("#auto_start").focus(); return false;}
    if (hidLoc == "%20" || hidLoc == ""){$("#auto_end").focus(); return false;}
    $('#routeH').show();
    $('#loader').show();
    $('#mapup').hide();
    $("#save_route_txt").html("Save");
    flags = "chk";


    var ajaxaction = "getLatLon";
    $.post("direction-route", {ajaxaction: ajaxaction, hidCurr: hidCurr, hid_curr_loc: hid_curr_loc,along:along,hidLoc: hidLoc, via1: via1, via2: via2,via3:via3}, function (result) {

        var res = result.dir;
        along_param=result.along_param;
        along_param_alt=result.along_param_alt;
        if(res==null || res==''){show_error("Oops! We couldn't find a direct route via land. Please try another search!");$("#res_info").hide();remove_layers(); $('#loader').hide();return false;};
        var ptt = "";
        var seconds = result.dis;
        var meters = result.len / 1000;
        meters = Math.round(meters * 10) / 10;
        var strTim = ConvertTime(seconds);
        var strTimKM = strTim + " " + meters + " km";
        /*alternative route*/
        var alt_len = result.alternative_len/1000;
        var alt_meters = Math.round(alt_len * 10) / 10;
        var alt_seconds = result.alternative_dis;
        var alt_strTim = ConvertTime(alt_seconds);
        var alt_via="";var route_alt="";
        if(alt_strTim!='NaN h NaN min ' && alt_seconds!='')
        {
           if(result.alt_text!='' && result.alt_text!=undefined && result.r_text!=result.alt_text) alt_via="Via "+result.alt_text;
           route_alt="<div id='route_txt' onclick=\"show_advice_dv('route2','')\" ><table border='0' cellpadding='0' cellspacing='0' style='margin:0px 0  5px 0;width:100%;' id='route_no'><tr style='height:44px'  class='bwfade'  id='route2'><td></td><td onclick=\"show_advice_dv('','route2')\" ><span class='bltitle'>"+alt_via+"</span><br><div class='bltitle' style='padding-top:5px;'><span aria-hidden='true' class='icon-list'></span> Route details</div></td><td align='right'><table class='route_txt_measure'><tr><td align='left' valign='top'><span aria-hidden='true' class='icon-directions' style='padding-right:10px;'></span></td><td align='left' valign='top'>"+alt_meters+" km</td></tr><tr><td align='left' valign='top'><span aria-hidden='true' class='icon-clock' style='padding-right:10px;'></span></td><td align='left' valign='top'>" +alt_strTim+ "</td></tr></table></td></tr>\n\
</table></div>";
        }
        if(route_alt=='')route_alt="<br><br>";
        /**/
        var r_via='';
        if(result.r_text!='' && result.r_text!=undefined) r_via="Via "+result.r_text;
        if (strTim == "NaN hrs NaN mins") ttp = "Not Displayed";
        else { 
        var route_d="<div id='route_txt' onclick=\"show_advice_dv('route1','')\" ><table border='0' cellpadding='0' cellspacing='0' style='margin:0px 0  5px 0;width:100%;' id='route_no'><tr style='height:44px' class='broute'  id='route1'><td></td><td valign='top' onclick=\"show_advice_dv('','route1')\" ><span class='bltitle'>"+r_via+"</span><br><div class='bltitle' style='padding-top:5px;'><span aria-hidden='true' class='icon-list'></span> Route details</div></td><td align='right' valign='top'><table class='route_txt_measure'><tr><td align='left' valign='top'><span aria-hidden='true' class='icon-directions' style='padding-right:10px;'></span></td><td align='left' valign='top'>"+meters+" km</td></tr><tr><td align='left' valign='top'><span aria-hidden='true' class='icon-clock' style='padding-right:10px;'></span></td><td align='left' valign='top'>" +strTim+ "</td></tr></table></td></tr></table></div>";
        }
        
       /* if(result.along_text) var alogn_tb="<div id='route_txt' onclick=\"show_advice_dv('along','')\" class='bltitle' style='text-align:right'>Along the rote: "+$("#along_route").val()+"</div>"; else var alogn_tb="";*/
        /*$("#route_info").html(ttp).show();*/
        if($("#dir_dv_via_along").css("display")=="table") var ht=0; else var ht=40;
        $('#res_info').html(route_d+route_alt).css({"height":"auto","top":$("#routePage").height()+ht}).show().animate({ scrollTop: 0 });
        /***bottom direct text*/
      

        map.removeLayer(path_dir);
        map.removeLayer(path_dir_alt);
        map.removeLayer(from_marker);
        map.removeLayer(to_marker);
        map.removeLayer(via1_marker);
        map.removeLayer(via2_marker);
        map.removeLayer(via3_marker);
        map.removeLayer(path2);
        map.removeLayer(marker_along);
        map.removeLayer(mark);
       
        var route = decode(result.dir);
        for (var i = 0, latlngs = [], len = route.length; i < len; i++)
        {
            latlngs.push(new L.LatLng(route[i][0], route[i][1]));
        }
       /*via1*/
        var viaIcon = L.icon({iconUrl: 'images/via.png',iconSize: [36, 51],iconAnchor: [15, 45],popupAnchor: [-3, -76]});
        if(result.via1_dir!=null && result.via1_dir!='' && result.via1_dir!='undefined')
        {
            var route_via1 = decode(result.via1_dir);
            for (var v1 = 0, latlngs_v1 = [], v1_len = route_via1.length; v1 < v1_len; v1++)
            {
             latlngs_v1.push(new L.LatLng(route_via1[v1][0], route_via1[v1][1]));
            if(v1==0){via1_marker = new L.Marker(new L.LatLng(route_via1[v1][0], route_via1[v1][1]), {icon: viaIcon});map.addLayer(via1_marker);}
            }
             latlngs=latlngs.concat(latlngs_v1);/**added in dsame ltlngs*/
        }
        /*via2*/
        if(result.via2_dir!=null && result.via2_dir!='' && result.via2_dir!='undefined')
        {
            var route_via2 = decode(result.via2_dir);
            for (var v2 = 0, latlngs_v2 = [], v2_len = route_via2.length; v2 < v2_len; v2++)
            {
             latlngs_v2.push(new L.LatLng(route_via2[v2][0], route_via2[v2][1]));
            if(v2==0){via2_marker = new L.Marker(new L.LatLng(route_via2[v2][0], route_via2[v2][1]), {icon: viaIcon});map.addLayer(via2_marker);}
            }
             latlngs=latlngs.concat(latlngs_v2);/**added in dsame ltlngs*/
        }
          /*via2*/
        if(result.via3_dir!=null && result.via3_dir!='' && result.via3_dir!='undefined')
        {
            var route_via3 = decode(result.via3_dir);
            for (var v3 = 0, latlngs_v3 = [], v3_len = route_via3.length; v3 < v3_len; v3++)
            {
             latlngs_v3.push(new L.LatLng(route_via3[v3][0], route_via3[v3][1]));
            if(v3==0){via3_marker = new L.Marker(new L.LatLng(route_via3[v3][0], route_via3[v3][1]), {icon: viaIcon});map.addLayer(via3_marker);}
            }
             latlngs=latlngs.concat(latlngs_v3);/**added in dsame ltlngs*/
        }
        
         path_dir = new L.Polyline(latlngs, {weight: 7, opacity: .6, color: 'blue', smoothFactor: 1}).bindPopup("Time: "+strTim+", Distance: "+meters+" km");
         path_dir.on('click', function() {show_advice_dv('route1','') });
        /**ALTERNATIVE POLYLINE*/
        if(result.alternative_dir==null) var route_alt=0; else var route_alt = decode(result.alternative_dir);
        for (var ii = 0, latlngs_alt = [], alt_len = route_alt.length; ii < alt_len; ii++)
        {
           latlngs_alt.push(new L.LatLng(route_alt[ii][0], route_alt[ii][1]));
        }
        
        path_dir_alt = new L.Polyline(latlngs_alt, {weight: 7, opacity: .6, color: '#333', smoothFactor: 1}).bindPopup("Time: "+alt_strTim+", Distance: "+alt_meters+" km");
        map.addLayer(path_dir_alt);
        path_dir_alt.on('click', function() {show_advice_dv('route2','') });
        var fromIcon = L.icon({iconUrl: 'images/from.png',iconSize: [36, 51],iconAnchor: [15, 45],popupAnchor: [-3, -76]});
        var toIcon = L.icon({iconUrl: 'images/to.png',iconSize: [36, 51],iconAnchor: [15, 45],popupAnchor: [-3, -76]});

        $("#routeH").show();
        $("#loader").hide();
        $('#direction_div').hide();
        $('#direction_mess').hide();
        $("#dir_dv_via_along").show();
        if(result.exist==true)  $("#save_route_txt").html("Saved");/*check route save/not*/
       /* $("#routePage").hide();*/
       /* $("#footerdir").show();*/
        from_marker = new L.Marker(latlngs[0], {icon: fromIcon,draggable:true});
        from_marker.on("dragend", function(e) {dir_marker('from',e.target._latlng)});  
        var to_marker_cord=$("#end_dirs").val().split(',');
        to_marker = new L.Marker(new L.LatLng(to_marker_cord[1],to_marker_cord[0]), {icon: toIcon,draggable:true});
        to_marker.on("dragend", function(e) {dir_marker('to',e.target._latlng)});  
        if (curl.indexOf('direction')!=-1) {
          
            if($('#auto_start').val().toLowerCase().indexOf('current location')==-1) map.addLayer(from_marker);
            if($('#auto_end').val().toLowerCase().indexOf('current location')==-1)map.addLayer(to_marker);
            map.addLayer(path_dir, true);
            window.setTimeout(function () {
           /* if(window.innerWidth>600) $("#map").animate({ right:0,bottom:0,top:0 });
            else $("#map").animate({ top:$("#routePage").height(),bottom:'10%',left:0,right:0 });*/
            map.fitBounds(new L.LatLngBounds(latlngs), {paddingTopLeft: [100, 100],paddingBottomRight:[50,10]});
            }, 20
            );
            hideTrafficFromMap();showTrafficOnMap();
        }
       

        /*
         if (hidVia!='' && hidVia!='undefined')
        {
            //map.fitBounds(new L.LatLngBounds(latlngss));
            map.fitBounds(new L.LatLngBounds([latlngs], latlngss[len1 - 1]));
            via_marker = new L.Marker(latlngss[len1 - 1], {icon: redIcon});
            map.addLayer(via_marker);
            map.addLayer(path2);
        }*/
        


        var decoderoute = "";
        if (chkbox)
        {
            if (hidVia!='' && hidVia!='undefined')
            {
                
            }
            else
            {
                decoderoute = "emp";
            }
           

        }

        adv_res_meter = result.r;
        adv_res_alt_r = result.alt_r;
        adv_res_lat = result.r.lat;
        adv_res_lng = result.r.lng;
        var adv_len = result.r.length;

        $.post("getAdvices", {adv_res_meter: adv_res_meter,adv_res_alt_r:adv_res_alt_r}, function (data) {
            $("#distDVView").html(data);
          /*  $("#along_route_text").html(result.along_text);*/
        });
        /*console.log(result.along_text);*/
       /*get along the route*/
          if($('#along_route').val()) along_route();

    }, 'json');
   /* setTimeout(getDirection, 300000); */
}
var route_dvs=0;
function show_advice_dv(click_type,dv_id)
{
    route_dvs=0;
    if($("#distDVView").css("display")=="block") return false;
    var url = window.location.toString().split('/');
    var d_curl = url.slice(-1)[0].replace('data=','!data=');
    if(dv_id=='route2') var d_curl = url.slice(-1)[0].replace('data=','!!data=');
    call_url('',d_curl);/*call for advice div open*/
    if(dv_id=='route1')
    { $('#advices_route2').hide();$('#advices_route1').show();$("#res_along_route").hide();$('#distDVView').show().animate({ scrollTop: 0 });$('.tab_left').addClass('tab_active'); $('.tab_right').removeClass('tab_active');}
    if(dv_id=='route2')
    {$('#advices_route1').hide();$('#advices_route2').show();$("#res_along_route").hide();$('#distDVView').show().animate({ scrollTop: 0 });$('.tab_left').addClass('tab_active'); $('.tab_right').removeClass('tab_active');}
    if(dv_id=='route1' || click_type=='route1')
    {
            route_dvs="route1";
            path_dir_alt.setStyle({color: '#333'});path_dir.setStyle({color: 'blue'});
            $('#advices_route1').show();$("#route1").removeClass('bwfade').addClass('broute');$("#route2").removeClass('broute').addClass('bwfade');
    }
    else 
    {
       route_dvs="route2";
       path_dir_alt.setStyle({color: 'blue'});path_dir.setStyle({color: '#333'});
       $('#advices_route2').show();$("#route2").removeClass('bwfade').addClass('broute');$("#route1").removeClass('broute').addClass('bwfade');
    }
    if(last_along!=route_dvs)
    {
        if(along_marker_group) map.removeLayer(along_marker_group);
        along_route(); /*call for advice dv*/
    }
    return false;
}
function close_advice_dv()
{
    var url = window.location.toString().split('/');
    if(url.slice(-1)[0].indexOf('!!data')==-1)    var d_curl = url.slice(-1)[0].replace('!data=','data=');
    else var d_curl = url.slice(-1)[0].replace('!!data=','data=');
    call_url('',d_curl);/*call for advice div open*/
    $('#distDVView').hide();
}
function show_route_detail_dv(div)
{ 
   if(route_dvs=='route1' || route_dvs==0)
   {
      if(div=='direction') 
      { $('#res_along_route').hide(); $('#advices_route1').show();$('#advices_route1').show();$('.tab_left').addClass('tab_active'); $('.tab_right').removeClass('tab_active');}
      else  
      {$('#res_along_route').show(); $('#advices_route1').hide();$('#advices_route1').hide();$('.tab_right').addClass('tab_active'); $('.tab_left').removeClass('tab_active');}
   }
   else
   {
      if(div=='direction') 
      { $('#res_along_route').hide(); $('#advices_route2').show(); $('#advices_route2').show();$('.tab_left').addClass('tab_active'); $('.tab_right').removeClass('tab_active');}
      else  
      {$('#res_along_route').show(); $('#advices_route2').hide(); $('#advices_route2').hide();$('.tab_right').addClass('tab_active'); $('.tab_left').removeClass('tab_active');}
   }
}
var along=0;var last_along=0;
function along_route()
{
    
  var param=0;var along_tab="res_along_route1";
  var r_class=$('#route1').attr('class');
  if(r_class=='bwfade') {param=along_param_alt;along_tab="res_along_route2";last_along="route2";}
  else {param=along_param;last_along="route1";}
  if(along) along.abort();
  if(!param || param=='undefined') {$("#along_route").prop('selectedIndex',0);return false;}
  var along=$("#along_route").val(); 
  if(along==''){$('#dir_along_dv').hide();if(along_marker_group) map.removeLayer(along_marker_group);}
  if(along )
  {
    $("#loader").show();
    /*get data*/
    along=$.post("along-route", {along:along,param: param}, function (result)
    {$("#res_along_route").html(result);$('#dir_along_dv').show();$("#loader").hide();});
  }
  
}
function dir_marker(marker,lt_ln)
{
   var drag_cord=lt_ln.lng+","+lt_ln.lat;
   var drag_name=drag_cord;
   if(marker=='from')
   {
       $('#start_dirs').val(drag_cord);
       $('#auto_start').val(drag_name);
   }
   else
   {
       $('#end_dirs').val(drag_cord);
       $('#auto_end').val(drag_name); 
   }
   $.ajax({url: "get_click_revg?"+lt_ln.lat+"&"+lt_ln.lng}).done(function(data) {var json_r = JSON.parse(data);
   drag_name=json_r.adrs;
    if(marker=='from') $('#auto_start').val(drag_name);
    else $('#auto_end').val(drag_name); 
   });
  getDirection();/*call getd*/
}
function showMarkerDirection(e)
{

    var lnlat = e.latlng;
    var dir_poi_nam = dir_poi.split(',');

}
/*
var main = {
    action: "search",
    get_action: function (hash) {
        var uri = encodeURIComponent(hash);

        $.ajax({
            type: 'POST',
            url: 'startup.php',
            data: 'url=' + uri,
            dataType: 'html',
            ajaxaction: 'mainPage',
            success: function (result) {
                $("#mainH").hide();
                $("#routeH").show();
                $("#map").hide();
                $("#routePage").show();
               
            }
        });
    }
};
*/


function pointer(point)
{
    $('body').animate({ scrollTop: 0 });
    $("#map_topsec").show();
    $('#distDVView').hide();
    if($('#route1').attr('class')=='bwfade') var route_advice=adv_res_alt_r;
    else var route_advice=adv_res_meter;
    if (point == 'next')
    {
        if (fwd < route_advice.length - 1)
            fwd++;
        else
            return false;
    }
    if (point == 'back')
    {
        if (fwd >= 1)
            fwd--;
        else
            return false;
    }
    if (isNaN(point) == false)
        fwd = point;
  
    var res = route_advice[fwd]['text'];
    var lts = route_advice[fwd]['lat'];
    var lng = route_advice[fwd]['lng'];
    var lnglot = lts + "," + lng;
    var meter = route_advice[fwd]['meter'];
    if (route_advice.length > fwd + 1)
        var meter1 = route_advice[fwd + 1]['meter'];
    else
        var meter1 = route_advice[fwd]['meter'];
    var goTo = meter1 - meter; var gt1=goTo;
    var goTo1 = (goTo / 1000).toFixed(1);
    if (goTo < 1000)
        goTo = "<br>Go " + goTo + " mt";
    else
        goTo = "<br>Go " + goTo1 + " km";

    if (goTo == "<br>Go 0 mt" || gt1<1 ) goTo = "";
    $('#direction_mess').show();
    $('#direction_message').html(res + goTo);


    if (mark != null)
    {
        map.removeLayer(mark)
    }
    var dmark = L.icon({
        iconUrl: 'images/6.png',
        iconSize: [36, 51],
        iconAnchor: [15, 45],
        popupAnchor: [-3, -76]
    });
    mark = new L.Marker(new L.LatLng(lts, lng), {icon: dmark});
    if(point=='next' || point=='pre') map.panTo({lon: lng, lat: lts}); else map.setView(new L.LatLng(lts, lng), 17);

    map.addLayer(mark);

    $('#cat_tms_tab').show();
    $('#dir-cat-td-tms').html(res);
   if(fwd==0) $(".fa-arrow-circle-left").hide(); else $(".fa-arrow-circle-left").show();
   if(fwd==route_advice.length-1) $(".fa-arrow-circle-right").hide(); else $(".fa-arrow-circle-right").show();
}

function getCateDet()
{

    $("#map").hide();
    $("#cat-nearby").show();
    $("#catefooter").hide();

}

function viewDistDataShow()
{
    $("#map").hide();
    $("#map_topsec").hide();
    $("#dirleftrightDV").hide();
    $("#distDVView").show();

}
function decode(encoded) {
    var points = [];
    var index = 0, len = encoded.length;
    var lat = 0, lng = 0;
    while (index < len) {
        var b, shift = 0, result = 0;
        do {

            b = encoded.charAt(index++).charCodeAt(0) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);


        var dlat = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
        lat += dlat;
        shift = 0;
        result = 0;
        do {
            b = encoded.charAt(index++).charCodeAt(0) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        var dlng = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
        lng += dlng;

        points.push([lat / 1E6, lng / 1E6])


    }
    return points
}



function ConvertTime(SecondsInStringFormat)
{
    var sec_num = parseInt(SecondsInStringFormat, 10); 
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);
    if (hours < 10) {
        hours = "0" + hours;
    }
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    var time = hours + ' h ' + minutes + ' min ';
    if (hours == 0)
    {
        var time = minutes + ' min ';
    }
    else
    {
        if (hours == 1)
            var time = hours + ' h ' + minutes + ' min ';
        else
            var time = hours + ' h ' + minutes + ' min '; /*******bal remove,**/
    }
    return time;
}

function auto_focus(name)
{
     /* $('.top-heading').css('background', '#F3F5F7');
   var inid = name.id;
    if (name.id == 'auto') {
        $('.top-heading').css('background', '#F3F5F7');
        $('.menu-btn').hide();
        $('#search-cancel').show();
        $('#search-x').hide();
    }
    $('#mapup').show();
    $('#eloc').hide();
    $('.search-direction').hide();
    $('#footerID').hide();
    $("#" + inid).val("");
    $("#" + inid).css({"color": "#666"});
    $('#routePage').hide();*/
}
function auto_blur()
{
    $('.top-heading').css('background', '#fff');
    $('.menu-btn').show();
    $('#direction_div').show();
    $("input[name='auto']").val("");
    $('#mapup').hide();
    $('.as-results').hide(100);
    $('.search-direction').show();
    $('#search-cancel').hide();
    $('#start_dir').hide();
    $('#end_dir').hide();
    var fth = $('#footerTxt').html();
    if (fth != '')
        $('#footerID').show();
}
function show_error(msg)
{
    if(msg==1) msg="<p>Oops ! Something went wrong. This may be temporary or due to network issues. We are working on it!</p><p><div class=\"buy\" onclick=\"$('#error').hide(100)\" >Continue using</div></p>";
    $("#error").html(msg).show().delay(4500).fadeOut();

}
function remove_layers()
{
    map.removeLayer(marker2);
   /* map.removeLayer(xyzzz);*/
    map.removeLayer(path_dir);
    map.removeLayer(path_dir_alt);
    map.removeLayer(from_marker);
    map.removeLayer(to_marker);
    map.removeLayer(via1_marker);
    map.removeLayer(via3_marker);
    map.removeLayer(via2_marker);
    map.removeLayer(path2);


    if (marker.length > 0)
    {
        for (var m = 0; m < marker.length; m++)
        {
            map.removeLayer(marker[m]);
        }
    }


    if (marker_along1.length > 0)
    {
        for (var c = 0; c < marker_along1.length; c++) {
            map.removeLayer(marker_along1[c]);
        }
    }
    
    if (mark_n1.length > 0)
    {
        for (var d = 0; d < mark_n1.length; d++) {
            map.removeLayer(mark_n1[d]);
        }
    }



    if (marker_new1.length > 0)
    {
        for (var b = 0; b < marker_new1.length; b++) {
            map.removeLayer(marker_new[b]);
        }
    }

    if (main_mark.length > 0)
    {
        for (var e = 0; e < main_mark.length; e++) {
            map.removeLayer(main_mark[e]);
        }
    }
    map.removeLayer(mark);
    if(popup_click) map.removeLayer(popup_click);/*right click*/
   
    if(nearby_marker_group) map.removeLayer(nearby_marker_group);/* search nearby pages*/
    if(along_marker_group) map.removeLayer(along_marker_group);/*along*/
    if(near_search) map.removeLayer(near_search);
    if(near_markers) map.removeLayer(near_markers);/*nearc searched loc*/
}

function pushy(action)
{
    if (action == "show") {
        $('#fad').show();
        $('.pushy').animate({left: '-1px'}, 50);
    }
    if (action == "hide") {
        $('#fad').hide();
        $('.pushy').css({left: '-200px'});
    }
 
   
}


var issue_req=0;
function send_issue(lat,lng,adrs)
{
    var issue="";var name="";var email="";var phone="";
    if(lat=='feedback'){
         issue=$('#feed_back').val();
          email=$('#email').val();
      
    }
    else
    {
        issue=$('#issue').val();
        if(issue.trim()==''){$('#issue').focus();return false;}
    }
     $('#loader').show();


    if(issue_req) issue_req.abort();
    issue_req=$.post("submit-issue-feedback",{issue: issue,lat:lat,lng:lng,adrs:adrs,name:name,email:email}, function(data)
    { 
         if(lat=='feedback')
         {
             show_error(data);
         }
         else{
             if(data.trim()=='blank'){$('#issue').focus();return false;}
             else if(data.trim()=='Unable to submit query!!' || data.trim()=='' || data.trim()==1){show_error(data);return false;}
             else $('#report_text').html(data);
         }
      
         $('#loader').hide();
    });
}

/**********************************auth.js starts here***********************************************************/
function user_data(type)
{
  if(type == 'saves')
  {
    var listId = btoa('IN(2)');
  }
  else if(type == 'routes')
  {
    var listId = btoa('IN(3)');
  }
  else
  {
    var listId = btoa('NOT IN(2,3)');
  }
  $.post('userAuth', {'list-id':listId, 'mamth':'M113'}, function (data) 
  { 
    var decode = JSON.parse(data);
    if(decode.response.response == '201')
    {
         home();
      if(window.innerWidth>600) var tp="100px"; else var tp="50%";
    
      $('#searchnearByDV').html(decode.html).css({"top":tp}).show();
      pushy('hide');
    }
  });
}
$(document).ready(function()
{
  $(document).on("click","#signin",function(event)
  {
    localStorage.clear();
    $.post('userAuth', {'mamth':'M101'}, function (data) 
    { 
      var decode = JSON.parse(data);
      var text = decode.response;
      pushy('hide');
      $("#fade_layer").html(text).show();
    });
    event.preventDefault();
  });

  $(document).on("click","#uname",function(event)
  {
    localStorage.clear();
    $.post('userAuth', {'mamth':'M108'}, function (data) 
    { 
      var decode = JSON.parse(data);
      var text = decode.response;
      pushy('hide');
      $("#fade_layer").html(text).show();
    });
    event.preventDefault();
  });
  $(document).on("click","#signout",function(event)
  {
    $.post('userAuth', {'mamth':'M105'}, function (data) 
    {
      var decode = JSON.parse(data);
      if(decode.response == true)
      {
       /* $('#signout').html('Sign In');
        $("#signout").prop('id',"signin");*/
            $("#user_account").html("<span id='signin' class='link' ><i class='fa fa-user-plus' aria-hidden='true' style='color:#fff; padding-left:6px; padding-right:10px;'></i> Sign In</span>");
        home();
      }
      event.preventDefault();
    });
  });
  $(document).on("click",".tab a",function(event)
  {
      $(this).parent().addClass('active');
      $(this).parent().siblings().removeClass('active');
      target = $(this).attr('href');
      $('.tab-content > div').not(target).hide();
      $(target).fadeIn(600);
      event.preventDefault();
  });
 $(document).on("change",".chb",function(event)
  {
    var checked = $(this).is(':checked');
    $(".chb").prop('checked',false);
    if(checked) 
    {
      $(this).prop('checked',true);
    }
  });
  $(document).on("click","#addList",function(event)
  {
    $("input[name='list-name']").fadeIn(600).focus();
    /*$("#addList").prop('id',"createList").html('Save list');*/
    event.preventDefault();
  });


  $(document).on("click","#add-data",function(event)
  {
    if(!$("input[name='list-name']").val())
    {
      $("input[name='list-name']").val('');
      $("input[name='list-name']").fadeOut(600);
      /*$("#createList").prop('id',"addList");*/
    }
    save_search('addToList');
    event.preventDefault();
  });

   $(document).on("submit","#register-form",function(event)
  {
    var error = false;
    var emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    var postData = $(this).serializeArray();
    var formURL     = $(this).attr("action");
    postData.push({name: 'mamth', value: 'M103'});

    if((postData[0].value).length < 1)
    {
      show_error("Please enter name");
      error = true;
    }

    if((postData[1].value).length < 1)
    {
      show_error("Please enter your username");
      error = true;
    }

    if(!emailRegex.test(postData[2].value))
    {
      show_error("Please enter valid email");
      error = true;
    }

    if((postData[3].value).length < 6)
    {
      show_error("Password must be atleast 6 chars.");
      error = true;
    }
    
    if(!error)
    {
      $('#loader').show();
      $.post(formURL, postData, function (data) 
      {
        var decode = JSON.parse(data);
        if(decode.response == false)
        {
          if(decode.error)
          {
            show_error(decode.error[0]);
          }
        }
        else if(decode.response.response == '402')
        {
          show_error('This username already exists! Please choose a different username.');
        }
        else if(decode.response.response == '403')
        {
          show_error('This email already exists! Please choose a different email.');
        }
        else if(decode.response.response == '201')
        {
          var storedEvent = JSON.parse(localStorage.getItem("event"));
          if(storedEvent)
          {
            var data = storedEvent[0].event;
            switch(data) 
            {
              case 'favourite':
                save_search('favourite');
                break;
              case 'addToList':
                add_list();
                break;
              case 'myRoute':
                save_search('myRoute');
                break;
            }
            localStorage.clear();
          }
          /*$('#signin').html('Hi, '+decode.name +  '<br><u>Logout</u>');
          $("#signin").prop('id',"signout");*/
                             $("#user_account").html("<img src='http://maps.mapmyindia.com/explore/images/user_photos/avatar-small.jpg' width='30' height='30' align='absmiddle' style='border-radius:15px; margin-right:6px' onerror=\"this.src='http://maps.mapmyindia.com/explore/images/user_photos/avatar-small.jpg'\"><span id='uname'> Hi, "+decode.name +" </span><span id='signout' class='link'>Logout</span><div id='ac_img' onclick=\"user_data('saves')\"><i class='fa fa-heart-o' aria-hidden='true'></i>&nbsp; My Saves</div><div id='ac_img' onclick=\"user_data('list')\">&nbsp;<img src='images/add_list1.png' >&nbsp;My Lists</div><div id='ac_img' onclick=\"user_data('routes')\"><i class='fa fa-road'  aria-hidden='true'></i>&nbsp; My Routes</div>");
          $("#fade_layer").hide();
          show_error("Welcome "+decode.name+" You are now logged in.");
        }
        $('#loader').hide();
      });
    }
    event.preventDefault();
  });

  $(document).on("submit","#login-form",function(event)
  { 
    var error = false;
    var postData    = $(this).serializeArray();
    var formURL     = $(this).attr("action");
    postData.push({name: 'mamth', value: 'M104'});
    
    if((postData[0].value).length < 1)
    {
      show_error("Please enter username");
      error = true;
    }

    if((postData[1].value).length < 6)
    {
      show_error("Password must be atleast 6 chars.");
      error = true;
    }
    
    if(!error)
    {
      $.post(formURL, postData, function (data) 
      {
        var decode = JSON.parse(data);
        if(decode.response == false)
        {
          if(decode.error)
          {
            show_error(decode.error[0]);
          }
        }
        else if(decode.response.response == '201')
        {
          var storedEvent = JSON.parse(localStorage.getItem("event"));
          if(storedEvent)
          {
            var data = storedEvent[0].event;
            switch(data) 
            {
              case 'favourite':
                save_search('favourite');
                break;
              case 'addToList':
                add_list();
                break;
              case 'myRoute':
                save_search('myRoute');
                break;
            }
            localStorage.clear();
          }
          /*$('#signin').html('Hi, '+decode.name +  '<br><u>Logout</u>');
          $("#signin").prop('id',"signout");*/
          $("#user_account").html("<img src='http://maps.mapmyindia.com/explore/images/user_photos/final/thumb/thumb_"+decode.photo+"' width='30' height='30' align='absmiddle' style='border-radius:15px; margin-right:6px' onerror=\"this.src='http://maps.mapmyindia.com/explore/images/user_photos/avatar-small.jpg'\"><span id='uname'> Hi, "+decode.name +" </span<span id='signout' class='link'>Logout</span><div id='ac_img' onclick=\"user_data('saves')\"><i class='fa fa-heart-o' aria-hidden='true'></i>&nbsp; My Saves</div><div id='ac_img' onclick=\"user_data('list')\">&nbsp;<img src='images/add_list1.png' >&nbsp;My Lists</div><div id='ac_img' onclick=\"user_data('routes')\"><i class='fa fa-road'  aria-hidden='true'></i>&nbsp; My Routes</div>");
          $("#fade_layer").hide();
          show_error("Welcome "+decode.name+" You are now logged in.");
        }
        else
        {
          show_error('Invalid Username or Password');
        }
      });
    }
    event.preventDefault();
  });
  
  
  $(window).keydown(function(event)
  {
    if(event.keyCode == 13) 
    {
      event.preventDefault();
      return false;
    }
  });
});
/****finishes****/
$( document ).on( 'keydown', function ( e ) { if ( e.keyCode === 27 ) {  $('#fade_layer' ).hide(200);pushy('hide'); }});
   $(document).ajaxError(function (e, jqXHR, ajaxSettings, thrownError) { console.log(thrownError);
            if (jqXHR.status === 0 || jqXHR.readyState === 0 ) {return; }
            $('#error').html("<p>Oops ! Something went wrong. This may be temporary or due to network issues. We are working on it!</p><p><div class=\"buy\" onclick=\"$('#error').hide(100)\" >Continue using</div></p>").show();
             $('input').css({"background":"","background-size":"20px"});$("#loader").hide();
        });
        window.onerror = function(message, url, lineNumber) {  
     $('#error').html("<p>Oops ! Something went wrong. This may be temporary or due to network issues. We are working on it!</p><p><div class=\"buy\" onclick=\"$('#error').hide(100)\" >Continue using</div></p>").show();
     $("#loader").hide();
           $('input').css({"background":"","background-size":"20px"});$("#loader").hide();
    }; 

  $('input').blur(function () {if(req!=0)req.abort();$('input').css({"background":"","background-size":"20px"});});
/*$('div[id^="cat_head"]').click(function(){alert('ss');});*/
