

function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

function wpgmappity_build_sample_map(target_div, data) {
  var latlng = new google.maps.LatLng(data.center_lat, data.center_long);

  var myOptions = {
    zoom: data.map_zoom,
    center: latlng,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    disableDoubleClickZoom : true,
    scrollwheel : false,
    disableDefaultUI : true
  };
  var map = new google.maps.Map(document.getElementById(target_div), myOptions);
  google.maps.event.trigger(map, 'resize');
  return map;
}

function wpgmappity_build_data_container() {
  var empty_controls_object = {
    zoom : {
      active : false,
      style : '',
      position : ''
    },
    type : {
      active : false,
      style : '',
      position : ''
    }
  };

  var data = {
    'map_length': 450,
    'map_height': 300,
    'map_zoom' : 3,
    'center_lat' : '39.185575',
    'center_long' : '-96.575206',
    'markers' : [],
    'map_type' : 'normal',
    'alignment' : 'none',
    'controls' : empty_controls_object,
    'map_address' : '',
    'slider_object' : ''
    };
  return data;
}

function wpgmappity_post_resize(map, data) {
  google.maps.event.trigger(map, 'resize');
  map.setCenter(new google.maps.LatLng(data.center_lat, data.center_long));
}


function wpgmappity_update_map_size(map, data) {
  jQuery("#wpgmappity_sample_map").animate(
    {
      "width" : data.map_length,
      "height" : data.map_height
    },
    function() {
      wpgmappity_post_resize(map, data);
	       }
  );
}

function wpgmappity_set_size_event(map, data) {
  jQuery("input[name='wpgmappity_selector_size']").click(function(){
    var selection = jQuery(this).attr("value");
      switch(selection)
	{
	case 'small':
	data.map_length = 300;
	data.map_height = 170;
	wpgmappity_update_map_size(map, data);
	break;
	case 'medium':
	data.map_length = 450;
	data.map_height = 300;
	wpgmappity_update_map_size(map, data);
	break;
	case 'large':
	data.map_length = 700;
	data.map_height = 400;
	wpgmappity_update_map_size(map, data);
	break;
	case 'custom':
	break;
	}
  });
  jQuery("#wpgmapity_custom_size_submit").live("click", function(){
    var height = parseInt(jQuery("#wpgmappity_custom_size_height").val());
    var length = parseInt(jQuery("#wpgmappity_custom_size_length").val());
    var error_type = false;
    var error_direction = false;

    if ( (height < 300) || (isNaN(height)) )
    {
      error_type = 'Height';
      error_direction = 'small.';
    }
    else if (height > 1000)
    {
      error_type = 'Height';
      error_direction = 'large.';
    }
    else if ( (length < 150) || (isNaN(length)) )
    {
      error_type = 'Length';
      error_direction = 'small.';
    }
    else if (length > 1000)
    {
      error_type = 'Length';
      error_direction = 'large.';
    }

    if ( error_type !== false )
    {
      jQuery("#wpgmappity_custom_size_warning").remove();
      var error_message = error_type + " is too " + error_direction;
      jQuery(this).parent().after("<p id='wpgmappity_custom_size_warning'>" + error_message + "</p>");
      return false;
    }
    data.map_length = length;
    data.map_height = height;
    wpgmappity_update_map_size(map, data);
    jQuery("#wpgmappity_custom_size_indicator").html("("+length+"x"+height+")");
    jQuery("input[name='wpgmappity_selector_size']").attr("checked", false);
    jQuery("#wpgmappity_selector_size_custom").attr("checked", true);
    tb_remove();
    return true;

					       });
}

function wpgmappity_set_zoom_event(map, data) {
  jQuery('#wpgmappity_zoom_slider').slider({
    min: 0,
    max: 400,
    value: 60,
    slide: function(e,ui){
      var position = jQuery('#wpgmappity_zoom_slider').slider("value");
      position = parseInt( (position / 20) ) + 1;
      jQuery("#wpgmappity_zoom_slider_status").html(position);
      if (map.getZoom() != position) {
	map.setZoom(position);
        wpgmappity_post_resize(map, data)
	data.map_zoom = position;
	}
      }
  });
}

function wpgmappity_set_center(map,data) {
  map.setCenter(new google.maps.LatLng(data.center_lat, data.center_long));
  var message = "<p><span class='wpgamapptiy_success'>Center point set.</span></p>";
  jQuery("#wpgmappity_center_point_flash").html(message);
}

function wpgmappity_delete_marker_callback(data, map, marker) {
  return function()
  {
    var marker_num = jQuery(this).attr("id");
    marker_num = marker_num.split("wgmappity_delete_marker_");
    marker_num = parseInt(marker_num[1]) - 1;
    map.removeOverlay(data.markers[marker_num].marker_object);
    jQuery(this).parent().parent().remove();
    data.markers.splice(marker_num, 1);
  };
}

function wpgmappity_clean_configure_marker_frame() {
  jQuery("#wgmappity_marker_configure_text").val('');
  jQuery("#wgmappity_marker_configure_url").val('');
  jQuery("#wgmappity_marker_configure_link").attr('checked', false);

  return true;

}

function wpgmappity_marker_event_callback(data, map, marker, marker_id) {
  return function(latlng) {

    var html = "";
    if (data.markers[marker_id].marker_url !== undefined)
    {
      html += "<a href='" + data.markers[marker_id].marker_url + "'>";
    }
    html += data.markers[marker_id].marker_text.replace(/\n/g,'<br />');
    if (data.markers[marker_id].marker_url !== undefined)
    {
      html += "</a>";
    }
    //var html = data.markers[marker_id].marker_text;
    map.openInfoWindow(latlng, html);
  };
}

function wpgamppity_rebuild_marker(data, map, marker, marker_id) {
  map.removeOverlay(marker);
  marker = new GMarker(data.markers[marker_id].point);
  GEvent.addListener(marker, "click", wpgmappity_marker_event_callback(data, map, marker, marker_id) );
  data.markers[marker_id].marker_object = marker;
  map.addOverlay(marker);
}

function wpgmappity_configure_marker_submit_callback(data, map) {
  return function() {
    var marker_id = ( jQuery("#wgmappity_marker_configure_id").val());
    var marker = data.markers[marker_id];
    data.markers[marker_id].marker_text = jQuery("#wgmappity_marker_configure_text").val();
    wpgamppity_rebuild_marker(data, map, marker, marker_id);
    wpgmappity_clean_configure_marker_frame();
    jQuery("#wgmappity_marker_configure_text").val('');
    tb_remove();
  };
}

function wpgmappity_configure_marker_callback(data, map, marker, marker_number) {
  return function() {
    jQuery("#wgmappity_marker_configure_id").val(marker_number);
    jQuery("#wgmappity_marker_configure_text").val('');
    if (data.markers[marker_number] != undefined) {
    jQuery("#wgmappity_marker_configure_text").val(data.markers[marker_number].marker_text);

    }
    tb_show('Marker Configuration',"#TB_inline?height=220&width=475&inlineId=wgmappity_marker_configure_dialog", null);
 };
}

function wpgmappity_add_marker_to_list(marker_data, marker, data, map) {
  var text = "<div class='wpgmappity_marker_on_map'>";
  var delete_marker_id =  "wgmappity_delete_marker_" + data.markers.length;
  var configure_marker_id =  "wgmappity_configure_marker_" + data.markers.length;
  text += "<p class='wpgmappity_delete_marker'><a id='" + configure_marker_id + "' href='#configure_marker'>Configure</a> | ";
  text += "<a id='" + delete_marker_id + "' href='#delete_marker'>Remove</a></p>";
  text += "<p>" + marker_data.address + "</p>";
  text += "</div>";
  jQuery("#wpgamppity_add_marker_container").before(text);
  jQuery("#" + delete_marker_id).click(wpgmappity_delete_marker_callback(data, map, marker));
  jQuery("#" + configure_marker_id).click(wpgmappity_configure_marker_callback(data, map, marker, (data.markers.length-1)));
}

function wpgmapity_add_marker_to_map(data, map, response) {
  jQuery("#wpgmappity_marker_point").val('');
  var point = new GLatLng(response.Placemark[0].Point.coordinates[1],
				response.Placemark[0].Point.coordinates[0])
  var marker = new GMarker(point);
  map.addOverlay(marker);
  var marker_data = {
    'marker_object' : marker,
    'address' : response.Placemark[0].address,
    'point' : point,
    'lat' : response.Placemark[0].Point.coordinates[1],
    'long' : response.Placemark[0].Point.coordinates[0]
    };
  data.markers.push(marker_data);
  wpgmappity_add_marker_to_list(marker_data, marker, data, map);
}

function wpgmappity_geocode_from_latlng(map, data) {
  return function(response) {
    if (response.Status.code == '200') {
      tb_remove();
      wpgmapity_add_marker_to_map(data, map, response);
    }
  }
}

function wpgmappity_geocode_response(map, data, type) {
  return function(response, status) {
    //console.log(response)
    if (status == 'OK') {
      // multiple options
      if (response.length > 1) {
	var text = '';
	for (x in response) {
	  text += '<p><a class="wpgmappity_more_';
	  if (type == 'point') {
	    text += 'center_link" href="#new_point">';
	    }
	  else if (type == 'marker') {
	    text += 'marker_link" href="#new_marker">';
	    }
	  text += response[x].formatted_address + "</a></p>";
	  }
	if (type == 'point') {
	  jQuery("#wpgmappity_more_center_results_contents").html(text);
	  tb_show('Did you mean?',"#TB_inline?height=300&width=400&inlineId=wpgmappity_more_center_results", null);
	  }
	else if (type == 'marker') {
	  jQuery("#wpgmappity_more_marker_results_contents").html(text);
	  jQuery("#wpgmappity_more_marker_results").show();
	  }
	}
      // direct hit
      else {
	if (type == 'point') {
            //console.log(response)
	  data.center_lat = response[0].geometry.location.lat();
	  data.center_long = response[0].geometry.location.lng();
	  wpgmappity_set_center(map,data);
	  data.map_address = response[0].formatted_address;
	  }
	else if (type == 'marker') {
	  tb_remove();
	  wpgmapity_add_marker_to_map(data, map, response);
	  }
	}
      }
    else {
      var div;
      var message = "<p><span class='wpgamapptiy_warning'>Geocoding failed. Please try again.</span></p>";
      if (type == 'center') {
	div = 'center_point';
	}
      else {
	div = 'marker';
	}
      jQuery("#wpgmappity_" + div + "_flash").html(message);
      }
  };
}


function wpgmappity_set_center_point_event(map, data) {
  jQuery("#wpgmapity_center_point_submit").click(function() {
    var message = '<div id="wgmappity_small_ajax"></div>';
    jQuery("#wpgmappity_center_point_flash").html(message);
    var geoCodeRequest = {
        address : jQuery("#wpgmappity_center_point").val()
    };

    var geocoder = new google.maps.Geocoder;
    geocoder.geocode(geoCodeRequest, wpgmappity_geocode_response(map, data, 'point'));

    //var geocoder = new GClientGeocoder(geoCodeRequest, wpgmappity_geocode_response(map, data, 'point'));
    //geocoder.getLocations(jQuery("#wpgmappity_center_point").val(), wpgmappity_geocode_response(map, data, 'point') );
    return false;
  });
  jQuery("#wpgmappity_more_center_results_not_here").live('click', function() {
    var message = "<p><span class='wpgamapptiy_warning'>Location not found.  Please try again.</span></p>";
    jQuery("#wpgmappity_center_point_flash").html(message);
    tb_remove();
    return false;
  });
  jQuery(".wpgmappity_more_center_link").live('click', function() {
    jQuery("#wpgmappity_center_point").val(jQuery(this).parent().text());
    jQuery("#wpgmapity_center_point_submit").trigger("click");
    tb_remove();
    return false;
  });
}

function wpgmappity_set_add_marker_event(map, data) {
  jQuery("#wpgamppity_add_marker_go").click(function() {
    tb_show('Add a Marker',
	    "#TB_inline?height=250&width=475&inlineId=wpgmappity_add_marker_dialog",
	    null);
    return false;
  });
  jQuery("#wpgmappity_marker_point_submit").live('click', function() {
    var geocoder;
    // lat/long or address?
    if ( jQuery("#wpgmappity_marker_point").val() != '' ) {
      var message = '<div id="wgmappity_small_ajax"></div>';
      jQuery("#wpgmappity_marker_flash").html(message);
      geocoder = new GClientGeocoder();
      geocoder.getLocations(jQuery("#wpgmappity_marker_point").val(), wpgmappity_geocode_response(map, data, 'marker') );
    }
    else {
      var latlng = jQuery("#wpgmappity_marker_point_latlng").val().split(',');
      var point_from_latlng = new GLatLng(latlng[0], latlng[1]);
      geocoder = new GClientGeocoder();
      geocoder.getLocations(point_from_latlng, wpgmappity_geocode_from_latlng(map, data));
    }
    return false;
  });
  jQuery("#wpgmappity_more_marker_results_not_here").live('click', function() {
    jQuery("#wpgmappity_more_marker_results").hide();
    tb_remove();
    return false;
  });
  jQuery(".wpgmappity_more_marker_link").live('click', function() {
    jQuery("#wpgmappity_marker_point").val(jQuery(this).parent().text());
    jQuery("#wpgmappity_more_marker_results").hide();
    jQuery("#wpgmappity_marker_point_submit").trigger("click");
    return false;
  });
}

function wpgmappity_change_map_type(map, data, selection) {
  switch(selection) {
  case 'normal':
  data.map_type = 'normal';
  map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
  break;
  case 'satellite':
  data.map_type = 'satellite';
  map.setMapTypeId(google.maps.MapTypeId.SATELLITE);
  break;
  case 'hybrid':
  data.map_type = 'hybrid';
  map.setMapTypeId(google.maps.MapTypeId.HYBRID);
  break;
  case 'terrain':
  data.map_type = 'terrain';
  map.setMapTypeId(google.maps.MapTypeId.TERRAIN);
  break;
  }
}

function wpgmappity_set_type_event(map, data) {
  jQuery("input[name='wpgmappity_selector_map_type']").click(function(){
    var selection = jQuery(this).attr("value");
    wpgmappity_change_map_type(map, data, selection);
  });
}

function wpgmappity_set_alignment_event(map, data) {
  jQuery("input[name='wpgmappity_float']").change(function(){
    data.alignment = jQuery(this).attr("value");
  });
}



function wpgmappity_set_modal_events(map, data) {
  // marker submit
  jQuery("#wgmappity_marker_configure_submit").click(wpgmappity_configure_marker_submit_callback(data, map));
}

function wgmappity_set_sample_map_events(map, wpgmappity_gmap_data) {
  wpgmappity_set_size_event(map, wpgmappity_gmap_data);
  wpgmappity_set_zoom_event(map, wpgmappity_gmap_data);
  wpgmappity_set_center_point_event(map, wpgmappity_gmap_data);
  wpgmappity_set_add_marker_event(map, wpgmappity_gmap_data);
  wpgmappity_set_type_event(map, wpgmappity_gmap_data);
  wpgmappity_set_alignment_event(map, wpgmappity_gmap_data);
  wpgmappity_set_controls_event(map, wpgmappity_gmap_data);
  wpgmappity_set_modal_events(map, wpgmappity_gmap_data);
}

function wgmappity_set_map_submission_event(map, data) {

  jQuery("#wpgmappity-create").submit(function() {
    // get rid of marker and point data specific to this map
    if (data.markers.length > 0) {
      for (x in data.markers) {
	data.markers[x].point = '';
	data.markers[x].marker_object = '';
      }
    }
    data.controls_object = '';
    jQuery("#wpgmappity-submit-info").val(JSON.stringify(data));

    //return false;
  });
}

function wpgmappity_iframe_js() {
  var wpgmappity_gmap_data = wpgmappity_build_data_container();
  var map = wpgmappity_build_sample_map("wpgmappity_sample_map", wpgmappity_gmap_data);
  wgmappity_set_sample_map_events(map, wpgmappity_gmap_data);
  wgmappity_set_map_submission_event(map, wpgmappity_gmap_data);
  var gets = getUrlVars();
  if (gets["modify"] == 'edit') {
     wpgmappity_set_up_map(gets["map_id"], map, wpgmappity_gmap_data);
  }
}

// google.setOnLoadCallback(wpgmappity_iframe_js);
window.onload = function() { wpgmappity_iframe_js() };