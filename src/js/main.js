$(function() {
	var d = new Date();
	var arrDays= ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
	var dIdx = d.getDay();
	var shortDay = arrDays[dIdx].substr(0, 3).toLowerCase();
	
	function getPhone(phone) {
		var arr = phone.match(/\(?(\d{3})?[\s\)-]*(\d{3})[\s-]*(\d{4})/);
		return '(' + arr[1] + ') ' + arr[2] + '-' + arr[3];
	}
	
	function fromMilitaryTime(hour) {
		var meridian = 'am';
		while (hour.length < 4) hour = hour + '0';
		hour = parseInt(hour);
		if (hour >= 1300) {
			hour -= 1200;
			meridian = 'pm';
		}
		hour = hour + '';
		while (hour.length < 4) hour = '0' + hour;
		return parseInt(hour.substr(0,2)) + ':' + hour.substr(2,2) + ' ' + meridian;
	}
	
	function getTime(hours) {
		var d = new Date();
		var hr = d.getHours() + '' + d.getMinutes();
		hr = parseInt(hr);
		if ($.type(hours) === 'array') {
			var arr = [];
			var isClosed = true;
			$.each(hours, function(key, val) {
				var a = val.split('-');
				if (hr < a[1] && hr > a[0]) isClosed = false;
				arr.push(fromMilitaryTime(a[0]) + ' - ' + fromMilitaryTime(a[1]));
			});
			return arr.join(', ') + (isClosed ? ' CLOSED' : '');
		} else {
			var arr = hours.split('-');
			return fromMilitaryTime(arr[0]) + ' - ' + fromMilitaryTime(arr[1]) + (hr > arr[1] || hr < arr[0] ? ' CLOSED' : '');
		}
	}
	
	function getHours(hours, shortDay, idx) {
		// String
		if ($.type(hours) === 'string' && hours.toLowerCase() == '24hr') {
			return 'Today Open 24 hours';
		}
		// Object
		else {
			var ret = null, dayName = (idx == dIdx) ? 'Today' : arrDays[idx];
			for (var key in hours) {
				if (key.toLowerCase() == shortDay) {
					if (hours[key] == '') {
						ret = ''; // unknown
					} else if (hours[key] == 'closed') {
						ret = dayName + ' CLOSED';
						
						// Find when open
						/*idx++;
						idx %= 7;
						if (idx != dIdx) {
							var shortDay2 = arrDays[idx].substr(0, 3).toLowerCase();
							ret = getHours(hours, shortDay2, idx);
						}*/
					} else {
						ret = dayName + ' ' + getTime(hours[key]);
					}
				}
			}
			
			if (!ret) ret = '?';
			return ret;
		}
	}

	$.getJSON('food.json', function(data) {
		var places = data.places;
		var items = [];
		$.each(places, function(key, val) {
			//items.push('<li id="' + key + '">' + val + '</li>');
			var hours = getHours(val.hours, shortDay, dIdx);
			var isClosed = hours.indexOf('CLOSED') != -1;
			var str = '<li class="' + (isClosed ? 'closed' : '') + '" >' + 
							'<article>' +
							'<header>' + 
								'<h3>' + (val.website ? '<a href="' + val.website + '" target="_blank">' + val.name  + '</a>' : val.name) + '</h3>' +
							'</header>';
			if (typeof val.address == 'string') {
				str +=		'<div class="row">' +
								'<div class="hC a-f-e"><span class="map-icon  a-f-e"></span></div>' + 
								'<div class="hx a-f-e">' +
									'<span><a href="http://maps.google.com/?q=' + encodeURI(val.address) + '" target="_blank">' + val.address + '</a></span>' +
									'<div>' + 
										'<span>' + getPhone(val.phone) + '</span>' +
									'</div>' +
								'</div>' +	
							'</div>';
			} else {
				for (var i = 0, l = val.address.length; i < l; i++) {
					str +=	'<div class="row">' +
								'<div class="hC a-f-e"><span class="map-icon  a-f-e"></span></div>' + 
								'<div class="hx a-f-e">' +
									'<span><a href="http://maps.google.com/?q=' + encodeURI(val.address[i]) + '" target="_blank">' + val.address[i] + '</a></span>' +
									'<div>' + 
										'<span>' + getPhone(val.phone[i]) + '</span>' +
									'</div>' +
								'</div>' +	
							'</div>';
				}
			}
			str +=			'<div class="row">' +
								'<div class="hC a-f-e"><span class="info-icon  a-f-e"></span></div>' + 
								'<div class="hx a-f-e">' + 
									'<span class="Lu">' + val.type + '</span>' + (hours ? '<span class="Lu">' + hours + '</span>' : '') +
								'</div>' +
							'</div>' +	
							'</article>' +
						'</li>';
			items.push(str);
		});
		$('#carousel1').html(items.join(''));
		
		var car = new Carousel($('#carousel1'));
		$('#btnNext').click(function() { car.next(); });
		$('#btnPrev').click(function() { car.previous(); });
		$('#btnRandom').click(function() { car.selectIndex(parseInt(Math.random() * car.items.length), (car.items.length*2)); });
	}).error(function(xhr, ajaxOptions, thrownError) { alert(xhr.status); alert(thrownError); });
});