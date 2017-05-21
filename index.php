<?php 
    error_reporting(0);
	ini_set('max_execution_time', 0); 
    $servername = "localhost";
    $username = "root";
    $password = "";
    $dbname = "poi";

    // Create connection
    $conn = new mysqli($servername, $username, $password, $dbname);
    // Check connection
    if ($conn->connect_error) 
    {
        die("Connection failed: " . $conn->connect_error);
    }
?>
<!DOCTYPE html>
<html lang="en" >
    <head>
        <meta charset="utf-8" />
        <title>Geocoding Module</title>
        <link href="css/main.css" rel="stylesheet" type="text/css" />
    </head>
    <body>
        <header>
            <h2>Geocoding Module</h2>
        </header>
        <div class="container">
            <div class="contr" style="margin-top: 100px;"><h2>You can select the file (csv) and click Upload button</h2></div>

            <div class="upload_form_cont" style="padding-left: 40px;">
                <?php if (isset($_POST['submit'])) 
                {
                    $handle = fopen($_FILES['filename']['tmp_name'], "r");
                    $row = 1;
                    while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) 
                    {
                        $sqlData = '';
                        $count = 1;
                        if($row == 1){ $row++; continue; }
                        if($row == 100000){break;}
                        $csv_id = $data[0];
                        $response = executeCurl($data[1],$data[2],$data[3],$_POST['key']);
                        if($response->status=="ZERO_RESULTS")
                            {
                               foreach ($response as $key)
                               {
                                    $csv_ID = $csv_id;
                                    //echo "<br>";
                                    $location_lat = "";
                                    //echo(arg1)ho "<br>";
                                    $location_lng = "";
                                    //echo "<br>";
                                    $north_east_lat = "";
                                    //echo "<br>";
                                    $north_east_lng = "";
                                    //echo "<br>";
                                    $south_west_lat = "";
                                    //echo "<br>";
                                    $south_west_lng = "";
                                    //echo "<br>";
                                    $icon = "";
                                    //echo "<br>";
                                    $id = "";
                                    //echo "<br>";
                                    $name1 = "";
                                    //echo "<br>";
                                    $temp = "";
                                    //echo "<br>";
                                    $photos_html_attributions1 = "";
                                    //echo "<br>";
                                    $place_id = "";
                                    //echo "<br>";
                                    $vicinity = "";
                                    //echo "<br>";
                                    $scope1 = "";
                                    //echo "<br>";
                                    $rating = "";
                                    //echo "<br>";
                                    $types_0 = "";
                                    //echo "<br>";
                                    $types_1 = "";
                                    //echo "<br>";
                                    $typ_2 = "";
                                    //echo "<br>";
                                    $typ_3 = "";
                                    //echo "<br>";
                                    $typ_4 = "";
                                    //echo "<br>";
                                    $typ_5 = "";
                                    //echo "<br>";
                                    $open_hours = "";
                                    //echo "<br>";
                                    //die;


                                   $sqlData .="('".$csv_ID."','".$location_lat."','".$location_lng."','".$north_east_lat."','".$north_east_lng."','".$south_west_lat."',
                                                '".$south_west_lng."','".$icon."','".$id."','".$name1."','".$photos_html_attributions1."','".$place_id."','".$vicinity."',
                                                '".$scope1."','".$rating."','".$types_0."','".$types_1."','".$typ_2."','".$typ_3."','".$typ_4."','".$typ_5."',
                                                '".$open_hours."','".$row."','".$temp."')";
                                         //echo "<br>";                               
                              
                                        //Database Insertion

                                    $sql = "INSERT INTO google_poi (`csv_id`, `location_lat`,`location_lng`,`north_east_lat`,`north_east_lng`,`south_west_lat`,
                                                        `south_west_lng`,`icon`,`id_G`,`name`,`photos_html_attributions`,`place_id`,`vicinity`,`scope1`,`rating`,`types_0`,
                                                        `types_1`,`types_2`,`types_3`,`types_4`,`types_5`,`opening_hours`,`seq`,`permanently_closed`)
                                                        VALUES".$sqlData;

                                    if ($conn->query($sql) === TRUE) 
                                    {
                                        echo "New record created successfully";
                                             
                                    }

                                    else 
                                    {
                                        //echo "Error: " . $sql . "<br>" . $conn->error;
                                             
                                    }
                               }
                            }

                            else
                            {
                                foreach ($response->results as $key)
                                {

                                    $csv_ID = $csv_id;
                                    //echo "<br>";
                                    $location_lat = $key->geometry->location->lat;
                                    //echo(arg1)ho "<br>";
                                    $location_lng = $key->geometry->location->lng;
                                    //echo "<br>";
                                    $north_east_lat = $key->geometry->viewport->northeast->lat;
                                    //echo "<br>";
                                    $north_east_lng = $key->geometry->viewport->northeast->lng;
                                    //echo "<br>";
                                    $south_west_lat = $key->geometry->viewport->southwest->lat;
                                    //echo "<br>";
                                    $south_west_lng = $key->geometry->viewport->southwest->lng;
                                    //echo "<br>";
                                    $icon = $key->icon;
                                    //echo "<br>";
                                    $id = $key->id;
                                    //echo "<br>";
                                    $name1 = str_replace("'", "", $key->name);
                                    //echo "<br>";
                                    $permanently_closed = $key->permanently_closed;
                                    //echo "<br>";
                                    $photos_html_attributions = $key->photos->html_attributions;
                                    //echo "<br>";
                                    $place_id =$key->place_id;
                                    //echo "<br>";
                                    $vicinity1 =$key->vicinity;
                                    //echo "<br>";
                                    $scope1 =$key->scope;
                                    //echo "<br>";
                                    $rating =$key->rating;
                                    //echo "<br>";
                                    $types_0 =$key->types[0];
                                    //echo "<br>";
                                    $types_1 =$key->types[1];
                                    //echo "<br>";
                                    $types_2 =$key->types[2];
                                    //echo "<br>";
                                    $types_3 =$key->types[3];
                                    //echo "<br>";
                                    $types_4 =$key->types[4];
                                    //echo "<br>";
                                    $types_5 =$key->types[5];
                                    //echo "<br>";
                                    $opening_hours =$key->opening_hours->open_now;
                                    //echo "<br>";
                                    //die;


                                    if($permanently_closed == "")
                                    {
                                        $temp = "Open";
                                    }
                                    else
                                    {
                                        $temp = "permanently_closed";
                                    }
                                    if($photos_html_attributions == "")
                                    {
                                        $photos_html_attributions1 = "";
                                    }
                                    else
                                    {
                                        $photos_html_attributions1 = $photos_html_attributions;
                                    } 
                                    if($types_2 =="")
                                    {
                                        $typ_2 = "";
                                    }
                                    else
                                    {
                                        $typ_2 = $types_2;
                                    } 
                                    if($types_3 =="")
                                    {
                                        $typ_3 = "";
                                    }
                                    else
                                    {
                                        $typ_3 = $types_3;
                                    }
                                    if($types_4 =="")
                                    {
                                        $typ_4 = "";
                                    }
                                    else
                                    {
                                        $typ_4 = $types_4;
                                    }
                                    if($types_5 =="")
                                    {
                                        $typ_5 = "";
                                    }
                                    else
                                    {
                                        $typ_5 = $types_5;
                                    }
                                    if($opening_hours == "")
                                    {
                                        $open_hours = "";
                                    }
                                    else
                                    {
                                        $open_hours = $opening_hours;
                                    }


                            
                                    $sqlData .="('".$csv_ID."','".$location_lat."','".$location_lng."','".$north_east_lat."','".$north_east_lng."','".$south_west_lat."',
                                                '".$south_west_lng."','".$icon."','".$id."','".$name1."','".$photos_html_attributions1."','".$place_id."','".$vicinity."',
                                                '".$scope1."','".$rating."','".$types_0."','".$types_1."','".$typ_2."','".$typ_3."','".$typ_4."','".$typ_5."',
                                                '".$open_hours."','".$row."','".$temp."')";

                                         //echo "<br>";                               
                              
                                        //Database Insertion

                                    $sql = "INSERT INTO google_poi (`csv_id`, `location_lat`,`location_lng`,`north_east_lat`,`north_east_lng`,`south_west_lat`,
                                                        `south_west_lng`,`icon`,`id_G`,`name`,`photos_html_attributions`,`place_id`,`vicinity`,`scope1`,`rating`,`types_0`,
                                                        `types_1`,`types_2`,`types_3`,`types_4`,`types_5`,`opening_hours`,`seq`,`permanently_closed`)
                                                        VALUES".$sqlData;

                                    if ($conn->query($sql) === TRUE) 
                                    {
                                        echo "New record created successfully";
                                             
                                    }

                                    else 
                                    {
                                        //echo "Error: " . $sql . "<br>" . $conn->error;
                                             
                                    }
                                }

                            }
                            
                            
                        }



                        fclose($file);
                }
                else
                { ?>            
                    <form id="upload_form" enctype="multipart/form-data" method="post" action="">
                        <div>
                            <div><label for="image_file">Please select csv file</label></div>
                            <div><input type='file' name='filename'/></div>
                        </div>
                        <div>
                            <div><label for="key">Please enter license key</label></div>
                            <div><input type='text' name='key' style="width: 355px;"/></div>
                        </div>
                        <div>
                            <input type="submit" name='submit' value="Upload" />
                        </div>
                    </form></div></div></body></html>
                <?php } ?>
<?php
function executeCurl($name,$lat, $lng, $key)
{

    $url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location='.$lat.','.$lng.'&radius=50&name='.$name.'&key='.$key;
    //$url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location='.$lat.','.$lng.'&radius=200&Types=restaurant&key='.$key; 

     //$url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location='.$lat.','.$lng.'&radius=25&Type=point_of_interest&key='.$key;  	
	
	//$url = 'https://maps.googleapis.com/maps/api/geocode/json?sensor=false&language=en&latlng='.$lat.','.$lng.'&key='.$key;
    $url = str_replace(" ", '%20', $url);

    //  Initiate curl
    $ch = curl_init();
    // Disable SSL verification
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    // Will return the response, if false it print the response
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    // Set the url
    curl_setopt($ch, CURLOPT_URL,$url);
    // Execute
    $result = curl_exec($ch);
    // Closing
    curl_close($ch);
    //echo'<pre>'.print_r(json_decode($result),TRUE).'</pre>';
    $data = json_decode($result);

   
    return $data;
}

?>