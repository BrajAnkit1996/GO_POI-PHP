var lastKeyPressCode = 0;
var first_focus = false;
var cord=0;/*cordinate search*/
var req = 0;var search_address="";
var geo=0;
var a = "auto.php";
var what="near-what";
$.fn.autoSuggest = function(data, options) 
{ 
    window.setTimeout(function () { },10 );
    var defaults = 
    {
        asHtmlID: false,
        startText: "",
        emptyText: "",
        preFill: {},
        limitText: "",
        selectedItemProp: "value", /*name of object property*/
        selectedValuesProp: "value", /*name of object property*/
        searchObjProps: "value", /*comma separated list of object property names*/
        queryParam: "q",
        retrieveLimit: 20, /*number for 'limit' param on ajax request*/
        extraParams: "",
        matchCase: false,
        minChars: 2,
        keyDelay: 100,
        resultsHighlight: true,
        neverSubmit: false,
        selectionLimit: 1,
        showResultList: true,
        start: function() 
        {
        
        },
        selectionClick: function(elem) 
        {
        
		},
        selectionAdded: function(elem) 
        {

        },
        selectionRemoved: function(elem) 
        {
            elem.remove();
        },
        formatList: false, 
        beforeRetrieve: function(string) 
        {
            return string;
        },
        retrieveComplete: function(data) 
        {
            return data;
        },
        resultClick: function(e, flag) 
        {
            var t = e.attributes;
            var n = e.attributes;
            var addr=(e['attributes'])['addr'];
            var auto_input = $(addr).text();
            /*var inputId = ($(':focus')[0]) ? $(':focus')[0].id : opts.asHtmlID;remove bal apr7*/
            var inputId=opts.asHtmlID;
            $("#" + inputId).val(auto_input);   
            if(inputId == "auto")
            {	
                var bal_zoom = 12;
                search_address = e.attributes.address;
                old_url=search_address;
                var addr = e.attributes.addr;
                if(addr.indexOf('refine your s')!=-1) {$("#auto").val('');return false;}
                if(addr.indexOf('add_place_d')>=1) return false;
                addr = $(addr).text();
                /*for below search*/
                if(search_address==5)
                {
                    $("#auto").val('');
                    return false;
                }
                else if(search_address==1)
                {
                    $qq=$("#auto").val();
                    near('');$('#near_what').val(addr.replace(' Near',''));
                    setTimeout(function() 
                    {
                      $('#near_what').click();
                    }, 100);return false;
                    
                }
                else if(search_address==2)
                {
                     near('');$('#auto_near').val(addr.replace('Near ',''));
                    setTimeout(function() 
                    {
                        $('#auto_near').click();
                    }, 100);return false;
                    
                }
                else if(search_address==3)
                {
                    driving_box('');$('#auto_end').val(addr.replace('Direction to ',''));
                    setTimeout(function() 
                    {
                       $('#auto_end').click();
                    }, 100);return false;
                }
                else if(search_address==4)
                {
                    driving_box('');$('#auto_start').val(addr.replace('Direction from ',''));
                    setTimeout(function() 
                    {
                       $('#auto_start').click();
                    }, 100);return false;
                }
                
                call_url(addr,search_address);
                show_location('',search_address);
                get_place_details(search_address);/*get place details*/			
            }
            if(inputId == "geo")
            {	
                var bal_zoom=12;
                search_address = e.attributes.address;
                var addr=e.attributes.addr;
                addr=$(addr).text();
                call_url(addr,search_address);
                show_location('',search_address);
                get_place_details(search_address);/*get place details*/
            }
            if(inputId == "auto_start")
            {
                search_address = e.attributes.address;
                var ltlng=search_address.match("data=(.*)ed");
                var latlong=atob(ltlng[1]).split('+');
                $('#start_dirs').val(latlong[1]+","+latlong[0]);
                getDirection();
            }
            if(inputId == "auto_end")
            {	
                search_address = e.attributes.address;
                var ltlng=search_address.match("data=(.*)ed");
                var latlong=atob(ltlng[1]).split('+');
                $('#end_dirs').val(latlong[1]+","+latlong[0]);
                getDirection();
               
            }
            if(inputId == "auto_via1")
            {
                search_address = e.attributes.address;
                var ltlng=search_address.match("data=(.*)ed");
                var latlong=atob(ltlng[1]).split('+');
                $('#via1_dirs').val(latlong[0]+","+latlong[1]);
                getDirection();
            }
             if(inputId == "auto_via2")
            {
                search_address = e.attributes.address;
                var ltlng=search_address.match("data=(.*)ed");
                var latlong=atob(ltlng[1]).split('+');
                $('#via2_dirs').val(latlong[0]+","+latlong[1]);
                getDirection();
            }
             if(inputId == "auto_via3")
            {
                search_address = e.attributes.address;
                var ltlng=search_address.match("data=(.*)ed");
                var latlong=atob(ltlng[1]).split('+');
                $('#via3_dirs').val(latlong[0]+","+latlong[1]);
                getDirection();
            }
            if(inputId == "auto_near")
            {	
                search_address = e.attributes.address;
                var ltlng=search_address.match("data=(.*)ed");
                var latlong=atob(ltlng[1]).split('+');
                $('#nearby_loc').val(latlong[1]+","+latlong[0]);
                if($('#near_what').val()!='') searchnearByData(1);
          
            }
            if(inputId == "near_what")
            {	
                search_address = e.attributes.address;
                if(search_address=='') {$("#near_what").val('');}
                if(search_address)
                {
                    $("#nearby-select").val(search_address);
                    if($('#nearby_loc').val()!='') searchnearByData(1);
                    var sdrs=search_address.split('#');
                    $("#near_what").val(sdrs[1]);
                }
                   
            }
            if(inputId.indexOf("via-") !== -1)
            {
                var suggestion = e.attributes.address.split(new RegExp(separators.join('|'), 'g'));
                var latlng = suggestion[2].split(',');
                var split = inputId.split('-');
                $('#via_'+split[1]+'_dirs').val(latlng[1]+","+latlng[0]);
              
                showDirection(encodeURIComponent($("#start_dirs").val()), encodeURIComponent($("#end_dirs").val()));
            }

            if(inputId == "auto_where")
            {
                whereSuggestion = e.attributes.address;
                if($('#what_dirs').val())
                {
                    call_url(title = false ,whereSuggestion, inputId)
                }
            }
            
        },
        resultsComplete: function() 
        {
           
        }
    };
    
    var opts = $.extend(defaults, options);
    var d_type = "object";
    var d_count = 0;
    if (typeof data == "string") 
    {
        d_type = "string";
        var req_string = data;
    } 
    else 
    {
        var org_data = data;
        for (k in data)
        {
            if (data.hasOwnProperty(k))
            {
                d_count++;
            }
        }
    }
    if ((d_type == "object" && d_count > 0) || d_type == "string") 
    {
        return this.each(function(x) 
        {
            if (!opts.asHtmlID) 
            {
                x = x + "" + Math.floor(Math.random() * 100); /*this ensures there will be unique IDs on the page if autoSuggest() is called multiple times*/
                var x_id = "as-input-" + x;
            }
            else 
            {
                x = opts.asHtmlID;    
                var x_id = x;
            }
            opts.start.call(this);
            var input = $(this);
            input.attr("autocomplete", "off").addClass("as-input").attr("id", x_id);
            var input_focus = false;
            var selections_holder = input;
            var results_ul = "";
            var results_holder = "";
            if (opts.asHtmlID.search("city_adp") != -1 || opts.asHtmlID.search("loc_adp") != -1) 
            {
                results_holder = $('<div class="as-results" id="as-results-' + x + '" ></div>').hide();
                results_ul = $('<ul class="as-list" style="position:absolute;margin-top:0;height:100vh;overflow-y:auto"></ul>');
            } 
            else 
            {
                results_holder = $('<div class="as-results"  id="as-results-' + x + '" ></div>').hide();
                results_ul = $('<ul class="as-list" style="position:fixed;margin-top:7px;width;400px;max-height:100vh;overflow-y:auto"></ul>');
            }
            var values_input = $('<input type="hidden" class="as-values" name="as_values_' + x + '" id="as-values-' + x + '" />');
            var prefill_value = "";

            if (typeof opts.preFill == "string") 
            {
                var vals = opts.preFill.split(",");
                for (var i = 0; i < vals.length; i++) 
                {
                    var v_data = {};
                    v_data[opts.selectedValuesProp] = vals[i];
                    if (vals[i] != "") 
                    {
                        add_selected_item(v_data, "000" + i);
                    }
                }
                prefill_value = opts.preFill;
            } 
            else 
            {
                prefill_value = "";
                var prefill_count = 0;
                for (var k in opts.preFill)
                {
                    if (opts.preFill.hasOwnProperty(k))
                    {
                        prefill_count++;
                    }
                }
                if (prefill_count > 0) 
                {
                    for (var t = 0; t < prefill_count; t++) 
                    {
                        var new_v = opts.preFill[t][opts.selectedValuesProp];
                        if (new_v == undefined) 
                        {
                            new_v = "";
                        }
                        prefill_value = prefill_value + new_v + ",";
                        if (new_v != "") 
                        {
                            add_selected_item(opts.preFill[t], "000" + t);
                        }
                    }
                }
            }

            if (prefill_value != "") 
            {
                input.val("");
                var lastChar = prefill_value.substring(prefill_value.length - 1);
                if (lastChar != ",") 
                {
                    prefill_value = prefill_value + ",";
                }
                values_input.val("," + prefill_value);
                $("li.as-selection-item", selections_holder).addClass("blur").removeClass("selected");
            }
            input.after(values_input);
            selections_holder.click(function() 
            {
                input_focus = true;
                input.focus();
            }).mousedown(function() 
            {
                input_focus = false;
            });

            if (typeof(opts.ie) != "undefined" && opts.ie == 7) 
            {
                if (opts.status) 
                {
                    $("body").append(results_holder);
                    results_holder.css({left: '70px', top: '92px', 'background-color': '#FFF'});
                }
                else 
                {
                    selections_holder.after(results_holder);
                    results_holder.css({left: '20px', 'margin-top': '25px', 'background-color': '#FFF'});
                }
            } 
            else 
            {
                selections_holder.after(results_holder);
            }
            var timeout = null;
            var prev = "";
            var totalSelections = 0;
            var tab_press = false;

            input.focus(function() 
            { 
                if(opts.asHtmlID=='auto') $('#as-results-geo').hide();
                if ($(this).val() == opts.startText && values_input.val() == "") 
                {
                    $(this).val("");
                } 
                else if (input_focus) 
                {
                    $("li.as-selection-item", selections_holder).removeClass("blur");
                    if ($(this).val().match(/(in | around | nearby | to | via | from )/ig))
                        return;
                    if ($(this).val() != "") 
                    {
                        if(opts.asHtmlID=='auto') results_ul.css("width", "400px");/*remove 100%*/
                        else results_ul.css("width", "400px");/*remove 100%*/
                        results_holder.show();
                    }
                }
               
                input_focus = true;
                if(opts.asHtmlID=='auto' && ($("#auto").val()=='' || $("#auto").val()==null)) keyChange(); 
                else if($('.as-results').css('display')!='block' && opts.asHtmlID!='auto' ) keyChange(); /**added forsearch on focus*/
              
                return true;
            }).blur(function() 
            {
                if ($(this).val() == "" && values_input.val() == "" && prefill_value == "") 
                {
                    $(this).val(opts.startText);
                } 
                else if (input_focus) 
                {
                    $("li.as-selection-item", selections_holder).addClass("blur").removeClass("selected");
                    setTimeout(function() 
                    {
                       if(opts.asHtmlID!='geo') results_holder.hide();
                    }, 100);
                }
            }).keydown(function(e) 
            { 
                geo=0;
                if(opts.asHtmlID=='auto' && $('#auto').val()=='')
                {home();$('input').css({"background":"","background-size":"20px"});}
                $("#ph_" + opts.asHtmlID).hide();
                lastKeyPressCode = e.keyCode;
                first_focus = true;
                switch (e.keyCode) 
                {
                    case 38: /* up*/
                        e.preventDefault();
                        moveSelection("up");
                        break;
                    case 40:
                        e.preventDefault();
                        moveSelection("down");
                        break;
                    case 8:  
                        if (input.val() == "") 
                        {

                        }
                        if (input.val().length == 0) 
                        {
                            results_holder.hide();
                            prev = "";
                        }

                        if ($(":visible", results_holder).length > 0) 
                        {
                            if (timeout) 
                            {
                                clearTimeout(timeout);
                            }
                            timeout = setTimeout(function() 
                            {
                                keyChange();
                            }, opts.keyDelay);
                        }
                        break;
                    case 13: 
                        tab_press = false;var click_near_what=0;
                        if(opts.asHtmlID=='near_what')
                        {
                           if(click_near_what) click_near_what.abort();
                           $("#loader").show();
                           if(req!=0)req.abort();
                           call_url('Nearby','near');$("#nearby-select").val('');
                           var where_ltln=$('#nearby_loc').val().split(',');
                           if(where_ltln=='') {$('#auto_near').focus();$("#loader").hide();return false;}
                           click_near_what=$.ajax({url: "near-new?lng="+where_ltln[0]+"&lat="+where_ltln[1]+"&where="+$('#auto_near').val()+"&search="+$('#near_what').val()}).done(function(data) { $('#res_info').animate({ scrollTop: 0 }).html( data ).css({"top":$("#nearPage").height()+6}).show();$('input').css({"background":"","background-size":"20px"});$('#as-results-near_what').hide(); $('#searchnearByDV').hide();
    $('#what_menu').html("&blacktriangle;");$("#loader").hide();});
                            return false;
                        }
                        if(opts.asHtmlID=='auto')
                        { 
                            if(cord) return false;
                            get_geo(); 
                           return false;
                        }
                        if(opts.asHtmlID=='auto_near' || opts.asHtmlID=='auto_start' || opts.asHtmlID=='auto_end'  || opts.asHtmlID=='auto_via1' || opts.asHtmlID=='auto_via2' ||  opts.asHtmlID=='auto_via3')
                        {
                           /*onclick to get geo*/
                           geo=1;
                           keyChange();
                           return false;
                        }
                        var active = $("li.active:first", results_holder);
                        
                        if (active.length > 0) 
                        {
                            active.click();
                            results_holder.hide();
                        }
                        else 
                        {
                          
                        }
                        if (opts.neverSubmit || active.length > 0) 
                        {
                            e.preventDefault();
                        }
                        break;
                    default:
                        if (opts.showResultList) 
                        {
                            if (opts.selectionLimit && $("li.as-selection-item", selections_holder).length >= opts.selectionLimit) 
                            {
                                results_ul.html('<li class="as-message">' + opts.limitText + '</li>');
                                results_holder.show();
                            } 
                            else 
                            {
                                if (timeout) 
                                {
                                    clearTimeout(timeout);
                                }
                                timeout = setTimeout(function() 
                                {
                                    keyChange();
                                }, opts.keyDelay);
                            }
                        }
                        break;
                }
            }).click(function() 
            { 
                if(opts.asHtmlID!='geo') return false;
                
                keyChange();
            });
           
            function keyChange() 
            { 
                if (lastKeyPressCode == 46 || (lastKeyPressCode > 8 && lastKeyPressCode < 32 && geo!=1)) 
                {
                  if(opts.asHtmlID!='geo' && opts.asHtmlID!='auto') return results_holder.hide();
                }
              
                var id=input[0].id; /*click on search for geocode*/
                if(id=='geo') 
                {
                    var string = $('#auto').val().replace(/[\\]+|[\/]+/g, ""); geo=1;
                }
                else if(geo==1)
                {
                   var string = input.val().replace(/[\\]+|[\/]+/g, ""); 
                }
                else
                {
                    var string = input.val().replace(/[\\]+|[\/]+/g, ""); geo=0;
                }
                
                if (string == prev && string!='')
                { 
                    if(opts.asHtmlID=='geo') 
                    {
                        $('#as-results-geo').show();return false;
                    } 
                    else if(!geo) return;
                }
                   
                prev = string;
               
                if(opts.asHtmlID)
                {
                    selections_holder.addClass("loading");
                    if (d_type == "string") 
                    {
                        var limit = "";
                        if (opts.retrieveLimit) 
                        {
                            limit = "&limit=" + encodeURIComponent(opts.retrieveLimit);
                        }
                        if (opts.beforeRetrieve) 
                        {
                            string = opts.beforeRetrieve.call(this, string);
                        }
                        var lt = "";
                        if (opts.asHtmlID == "loc_adp") 
                        {
                            lt = $("#city_adp").val();
                        }
                        /**show loader in serach icon& latlng check*/
                         cord=0;
                        var string_arr=string.split(',');
                        var patt1 = /^-?([1-8]?[1-9]|[1-9]0)\.{1}\d{1,6}/;
                        var result_lat = string_arr[0].replace('°','').match(patt1);
                        if(string_arr[1]) 
                        {
                            var result_lng = string_arr[1].trim().replace('°','').match(patt1);
                        } 
                        else 
                        {
                            var result_lng = null;
                        }
                        
                        if(result_lat!=null && result_lng!=null && string_arr.length==2)
                        { /*search latlong*/
                            var latlng_url = "place-"+string_arr[0]+","+string_arr[1]+"@"+parseFloat(string_arr[0])+","+parseFloat(string_arr[1].trim())+",16zdata="+btoa(parseFloat(string_arr[0])+"+"+parseFloat(string_arr[1].trim())+"16")+"ed";
                            call_url(latlng_url,latlng_url);
                            show_location('',latlng_url);
                            $('.as-results').hide();
                            cord=1;$("#res_info").hide();$("#map").animate({left: '0'});
                             return false;
                        }
                        if(string=='current location' || string=='Current Location') return false;
                        /*$('#search_icon_'+opts.asHtmlID).html("<img src='images/load.gif' style='width:22px;padding-bottom:10px;content: '';'>");*/
                        if(opts.asHtmlID=='geo') var load_id='auto'; else var load_id=opts.asHtmlID;
                        if(string!='') $('#'+load_id).css({"background":"url(images/load.gif) no-repeat center right","background-size":"20px"});
                        if(req!=0)req.abort();
                        req = $.getJSON((req_string + "?" + opts.queryParam + "=" + encodeURIComponent(string)+"&g="+geo+"&i="+opts.asHtmlID+"&loc="+encodeURI(def_locality)+conv(def_url,'decode')+"&lat="+ly+"&lng="+lx), function(data) 
                        {   
                            d_count = 0;
                           if(data==1){show_error(1); return false;}
                            var new_data = opts.retrieveComplete.call(this, data);
                            
                            for (k in new_data) 
                            {
                                if (new_data.hasOwnProperty(k))
                                {
                                    d_count++;
                                }
                            }
                            if (new_data == "[]")
                            {
                                d_count = 0;
                            }
                            if (d_count == 0) 
                            {
                                results_holder.hide();
                            } 
                            else 
                            {
                                processData(new_data, string);
                            }
                        }).done(function() { /*$('#search_icon_'+opts.asHtmlID).html("<img src='images/search-new.png' onclick=\"$('#geo').click();\">");*/  if(string!='') $('#'+load_id).css({"background":"","background-size":"20px"});}).error(function() {  });   
                    } 
                    else 
                    {
                        if (opts.beforeRetrieve) 
                        {
                            string = opts.beforeRetrieve.call(this, string);
                        }
                        processData(org_data, string);
                    }
                } 
                else 
                {
                    selections_holder.removeClass("loading");
                    results_holder.hide();
                }
            } ;
            var num_count = 0;
            function processData(data, query) 
            { 
                if (!opts.matchCase) 
                {
                    query = query.toLowerCase();
                }
                var matchCount = 0;
                results_holder.html(results_ul.html(""));
                results_holder.hide();
                for (var i = 0; i < d_count; i++) 
                {
                    var num = i;
                    num_count++;
                    var forward = false;
                    if (opts.searchObjProps == "value") 
                    {
                        var str = data[num].value;
                    } 
                    else 
                    {
                        var str = "";
                        var names = opts.searchObjProps.split(",");
                        for (var y = 0; y < names.length; y++) 
                        {
                            var name = $.trim(names[y]);
                            str = str + data[num][name] + " ";
                            /****list values********/
                        }
                    }
                    forward = true;
                    if (forward) 
                    {
                        var formatted = $('<li class="as-result-item search-res" id="as-result-item-' + num + '"></li>').click(function() 
                        {
                            var raw_data = $(this).data("data");
                           
                            var number = raw_data.num;
                            if ($("#as-selection-" + number, selections_holder).length <= 0 && !tab_press) 
                            {
                                var data = raw_data.attributes;
                                prev = "";
                                add_selected_item(data, number);
                                opts.resultClick.call(this, raw_data, true);
                                results_holder.hide();/*bal  input.val("").focus();*/
                            }
                            if (opts.asHtmlID == "ms")
                            {
                                $("#loc").trigger("click");
                            }
                            tab_press = false;
                        });

                        formatted.mousedown(function() 
                        {
                            input_focus = false;
                        });
                        formatted.mouseover(function() 
                        {
                            $("li", results_ul).removeClass("active");
                            $(this).addClass("active");
                        });

                        formatted.data("data", {attributes: data[num], num: num_count});
                        var this_data = $.extend({}, data[num]);
                        if (!opts.matchCase) 
                        {
                            var regx = new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + query + ")(?![^<>]*>)(?![^&;]+;)", "gi");
                        } 
                        else 
                        {
                            var regx = new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + query + ")(?![^<>]*>)(?![^&;]+;)", "g");
                        }

                        if (opts.resultsHighlight) 
                        {
                            this_data[opts.selectedItemProp] = this_data[opts.selectedItemProp].replace(regx, "<em>$1</em>");
                        }
                        if (!opts.formatList) 
                        {
                            if (this_data['elc'] != undefined) 
                            {
                                formatted = formatted.html(this_data[opts.selectedItemProp] + " [" + this_data['elc'] + "] ");
                            } 
                            else 
                            {
                                /*************li value bal**/
                                var livl=this_data[opts.selectedItemProp];
                                formatted = formatted.html(livl);
                            }
                        } 
                        else 
                        {
                            formatted = opts.formatList.call(this, this_data, formatted);
                        }
                        results_ul.append(formatted);
                        delete this_data;
                        matchCount++;
                        if (opts.retrieveLimit && opts.retrieveLimit == matchCount) 
                        {
                            break;
                        }
                    }
                }
                /*bal add exlusive*/
               /* var dir_adrs = data[0].address.replace("place-","direction-from-to-");
                if(input[0].id=='auto' && $('#auto').val().length>=3) 
                {
                    var latln_search=dir_adrs.match("@(.*)zdata");
                    if(latln_search!=null)
                        {   var ltn=latln_search[1].split(',');
                            var stringg=data[0].addr;
                            var dir_u="direction-from-to-"+$(stringg).text()+"zdata="+btoa("from++to+"+ltn[1]+","+ltn[0]+"+via");
                            var near_adrs = dir_adrs.replace("direction-to-","nearby-");
                            var mmi_exp="<li class=\"as-result-item search-res\" id=\"as-result-item-6\"  onclick=\"near('');$('#nearby_loc').val('"+ltn[1]+","+ltn[0]+"');$('#auto_near').val('"+$(stringg).text()+"');\" ><img class=\"search-img\" src=\"images/near.png\"><span class=\"search-font\"><span class=\"bltitle\">"+query+" Near</span></span></li>\n\
                            <li class=\"as-result-item search-res\" id=\"as-result-item-6\"  onclick=\"near('');$('#nearby_loc').val('"+ltn[1]+","+ltn[0]+"');$('#auto_near').val('"+$(stringg).text()+"');\" ><img class=\"search-img\" src=\"images/near.png\"><span class=\"search-font\"><span class=\"bltitle\"> Near "+query+"</span></span></li>\n\
<li class=\"as-result-item search-res\" id=\"as-result-item-7\" onclick=\"call_url('','"+dir_u+"');driving_box('');\"  ><img class=\"search-img\" src=\"images/direction-icon1.png\"><span class=\"search-font\"><span class=\"bltitle\"> Direction to "+query+"</span></span></li>\n\
<li class=\"as-result-item search-res\" id=\"as-result-item-7\" onclick=\"call_url('','"+dir_u+"');driving_box('');\"  ><img class=\"search-img\" src=\"images/direction-icon1.png\"><span class=\"search-font\"><span class=\"bltitle\"> Direction from "+query+"</span></span></li>"
                            if($('#auto').val()!='') results_ul.append(mmi_exp);
                    }
                }*/
                selections_holder.removeClass("loading");
                var serach_res=escape($('.as-results').html());
                if (matchCount <= 0) 
                {
                    results_ul.html('<li class="as-message">' + opts.emptyText + '</li>');
                }
                /*results_ul.css("width", selections_holder.outerWidth() - 2);*/
                var ll=$(".search").position();
                if(opts.asHtmlID=='auto' || opts.asHtmlID=='geo') results_ul.css({"width": "400px","left": "0px",});
                else results_ul.css({"width": "400px","left": "0px"});
               /*else results_ul.css({"width": "400px","left": "-5px","margin-top":"2px"});
                 $('.as-list li').css({"padding-left":ll.left+4,"padding-right":"20px !important"});*/
                if ($('.as-list li').length > 0) 
                {
                    /*console.log(input);*/
                    var id=input[0].id; /*geocde result insert into auto & display that*/
                    /*if(id=='geo') {$('#as-results-auto').html($('#as-results-geo').html()).show();$('.site-search').focus();}
                    else */results_holder.show();
                    opts.resultsComplete.call(this);
                }
            }
            ;

            function add_selected_item(data, num) 
            {
                values_input.val("");
                values_input.val(values_input.val() + data[opts.selectedValuesProp]);
            };
            function moveSelection(direction) 
            {
               /* if ($(":visible", results_holder).length > 0) 
                {
                    var lis = $("li", results_holder);
                    if (direction == "down") 
                    {
                        var start = lis.eq(0);
                    } 
                    else 
                    {
                        var start = lis.filter(":last");
                    }
                    var active = $("li.active:first", results_holder);
                    if (active.length > 0) 
                    {
                        if (direction == "down") 
                        {
                            start = active.next();
                        } 
                        else 
                        {
                            start = active.prev();
                        }
                    }
                    lis.removeClass("active");
                    start.addClass("active");

                    if ($('li.active:first', results_holder).length == 0) 
                    {
                        input.val(prev);
                    } 
                    else 
                    {
                        var raw_data = start.data("data");
                        
                        var number = raw_data.num;
                        if ($("#as-selection-" + number, selections_holder).length <= 0 && !tab_press) 
                        {
                            var data = raw_data.attributes;
                         
                            var addr = $(data.addr).text();
                            if(addr=='add this place to MapmyIndia Map') add_place_div('','');
                            else input.val(addr).focus();
                            if(opts.asHtmlID == 'auto')
                            {
                                call_url(addr,data.address);
                                show_location('',data.address,opts.asHtmlID);
                            }
                           
                            add_selected_item(data, number);
                          
                        }
                    }
                }
                */
            };
        });
    }
};




/*****************************************/
/* calling autocomplete  by text bioxes*/
$(document).ready(function() 
{

	$("#auto").autoSuggest(a, 
    {
		asHtmlID : "auto",
		selectedItemProp : "addr",
		searchObjProps : "addr",
		resultsHighlight : false
	});

	$("#geo").autoSuggest(a, 
        {
		asHtmlID : "geo",
		selectedItemProp : "addr",
		searchObjProps : "addr",
		resultsHighlight : false
	});
        
	$("#auto_start").autoSuggest(a, 
        {
		asHtmlID : "auto_start",
		selectedItemProp : "addr",
		searchObjProps : "addr",
		resultsHighlight : false
	});
        
	$("#auto_end").autoSuggest(a, 
        {
		asHtmlID : "auto_end",
		selectedItemProp : "addr",
		searchObjProps : "addr",
		resultsHighlight : false
	});
       
	$("#auto_near").autoSuggest(a, 
        {
		asHtmlID : "auto_near",
		selectedItemProp : "addr",
		searchObjProps : "addr",
		resultsHighlight : false
	});
        $("#near_what").autoSuggest(what, 
        {
		asHtmlID : "near_what",
		selectedItemProp : "addr",
		searchObjProps : "addr",
		resultsHighlight : false
	});
        
});
                        



