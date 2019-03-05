// =============================================================
// MISC FUNCTIONS
// =============================================================

function convertToCSV(objArray) {
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    var str = '';

    for (var i = 0; i < array.length; i++) {
        var line = '';
        for (var index in array[i]) {
            if (line != '') line += ','

            line += array[i][index];
        }

        str += line + '\r\n';
    }

    return str;
}

function exportCSVFile(headers, items, fileTitle) {
    if (headers) {
        items.unshift(headers);
    }

    // Convert Object to JSON
    var jsonObject = JSON.stringify(items);

    var csv = this.convertToCSV(jsonObject);

    var exportedFilenmae = fileTitle + '.csv' || 'export.csv';

    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, exportedFilenmae);
    } else {
        var link = document.createElement("a");
        if (link.download !== undefined) { // feature detection
            // Browsers that support HTML5 download attribute
            var url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", exportedFilenmae);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}


function copyTextToClipboard(text) {
	var textArea = document.createElement("textarea");
	textArea.style.position = 'fixed';
	textArea.style.top = 0;
	textArea.style.left = 0;
	textArea.style.width = '2em';
	textArea.style.height = '2em';
	textArea.style.padding = 0;
	textArea.style.border = 'none';
	textArea.style.outline = 'none';
	textArea.style.boxShadow = 'none';
	textArea.style.background = 'transparent';
	textArea.value = text;
	document.body.appendChild(textArea);

	textArea.select();

	try {
		var successful = document.execCommand('copy');
		var msg = successful ? 'successful' : 'unsuccessful';
		console.log('Copying text command was ' + msg);
	} catch (err) {
		console.log('Oops, unable to copy');
	}

	document.body.removeChild(textArea);
}

function showLoading($mdDialog, process) {
	var loading = {
		templateUrl : "partials/loadingdialog.html",
		onComplete : process
	};

	$mdDialog.show(loading);
}

function blurs(event, element) {
	if (event.keyCode == 13) {
		element.blur();
	}
}

function showToast($mdToast, text) {
	$mdToast.show($mdToast.simple().textContent(text).hideDelay(3000).position(
			"top right").parent(document.getElementById("toastBounds")));
}

function showAlert($mdDialog, title, content, html) {
	var alert = $mdDialog.alert().clickOutsideToClose(true).title(title)
			.textContent(content).ariaLabel('Alert Dialog').ok('OK');

	if (html) {
		alert = $mdDialog.alert().clickOutsideToClose(true).title(title)
				.htmlContent(content).ariaLabel('Alert Dialog').ok('OK');
	}

	$mdDialog.show(alert);
}

function hideLoading($mdDialog) {
	$mdDialog.hide();
}

function execute($scope, $mdDialog, loading, Service, input, callback,
		errorcallback) {
	if ($scope.running == null) {
		$scope.running = 0;
	}

	var process = function() {
		Service.execute(input, function(result) {
			callback(result);

			if (loading) {
				$scope.running--;
				if ($scope.running == 0) {
					hideLoading($mdDialog);
				}
			}
		}, function(error) {
			if (showLoading) {
				$scope.running--;
				if ($scope.running == 0) {
					hideLoading($mdDialog);
				}
			}

			if (error.data == null) {
				showAlert($mdDialog, "", "Cannot connect to server");
			} else if (error.data.message == null) {
				showAlert($mdDialog, "", "Error occured on server");
			} else if (!error.data.message.includes("token")) {
				showAlert($mdDialog, error.status + " - " + error.statusText,
						error.data.message);
			}

			if (errorcallback) {
				errorcallback(error);
			}
		});
	};

	if (loading) {
		$scope.running++;
		if ($scope.running == 1) {
			showLoading($mdDialog, process);
		} else {
			process();
		}
	} else {
		process();
	}
}

function showErrors() {
	var inputs = $("input");

	for (var i = 0; i < inputs.length; i++) {
		var input = inputs.get(i);

		if (input.getAttribute("skip") != "true") {
			input.focus();
		}
	}

	inputs.get(inputs.length - 1).blur();
}

function ModelController($scope, $mdDialog, model) {
	$scope.model = model;
	$scope.locals = model;

	setTimeout(function() {
		model.form = $scope.form;
	}, 1000);

	$scope.hide = function() {
		$mdDialog.hide();
	};
	$scope.cancel = function() {
		$mdDialog.cancel();
	};
	$scope.answer = function(answer) {
		$mdDialog.hide(answer);
	};
}

function DialogController($scope, $mdDialog, model) {
	$scope.locals = model;

	$scope.hide = function() {
		$mdDialog.hide();
	};
	$scope.cancel = function() {
		$mdDialog.cancel();
	};
	$scope.answer = function(answer) {
		$mdDialog.hide(answer);
	};
}
// =============================================================
// RANDOMIZER
// =============================================================

function addStaticColumn(data, param, values) {
	if (!data) {
		data = [];
	}

	for (i = 0; i < values.length; i++) {
		if (!data[i]) {
			data[i] = {};
		}

		data[i][param] = values[i];
	}

	return data;
}

function createContainer(size) {
	var data = [];

	for (i = 0; i < size; i++) {
		data[i] = {};
	}

	return data;
}

function addIncrementColumn(data, param, min, increment) {
	for (i = 0; i < data.length; i++) {
		data[i][param] = min + (increment * i);
	}

	return data;
}

function addFluctuationColumn(data, param, min, max, fluctuation) {
	center = fluctuation;
	fluctuation *= 2;
	oldvalue = 0;

	for (i = 0; i < data.length; i++) {
		y = 0;
		if (i == 0) {
			y = Math.round(Math.random() * (max - min)) + min;
		} else {
			add = Math.round(Math.random() * fluctuation) - center;
			y = oldvalue + add;
		}

		if (y > max) {
			y = max;
		}

		if (y < min) {
			y = min;
		}

		data[i][param] = y;
		oldvalue = y;
	}

	return data;
}

function addRandomColumn(data, param, min, max) {
	max = max - min;

	for (i = 0; i < data.length; i++) {
		data[i][param] = Math.round(Math.random() * max) + min;
	}

	return data;
}

function addProblemColumn(data, param, source, threshold) {
	for (i = 0; i < data.length; i++) {
		if (data[i][source] < threshold) {
			data[i][param] = true;
		} else {
			data[i][param] = false;
		}
	}

	return data;
}

function generateSortParams(mdTableSort) {
	sortParams = [];
	if (mdTableSort != null || mdTableSort != "") {
		prefix = mdTableSort.substring(0, 1);
		if (prefix == '-') {
			sortParams[0] = mdTableSort.substring(1);
			sortParams[1] = "DESC";
		} else {
			sortParams[0] = mdTableSort
			sortParams[1] = "ASC";
		}
	} else {
		console.log("mdTableSort is null or empty")
	}
	return sortParams;
}

// =============================================================
// DATEPICKERS
// =============================================================

function generateDatePicker($scope, callback) {
	$scope.date = moment();
	$scope.dateperiod = $scope.date.format('YYYY-MM-DD');
	$scope.todayperiod = $scope.dateperiod;
	$scope.picker = $scope.date.toDate();
	$scope.todaypicker = new Date();

	$scope.prevday = function() {
		$scope.date = $scope.date.subtract(1, 'days');
		$scope.dateperiod = $scope.date.format('YYYY-MM-DD');
		$scope.picker = new Date($scope.date.toDate().getTime());
		if (callback) {
			callback();
		}
	};

	$scope.nextday = function() {
		$scope.date = $scope.date.add(1, 'days');
		$scope.dateperiod = $scope.date.format('YYYY-MM-DD');
		$scope.picker = new Date($scope.date.toDate().getTime());
		if (callback) {
			callback();
		}
	};

	$scope.setdate = function(date) {
		$scope.date = moment($scope.picker);
		$scope.dateperiod = $scope.date.format('YYYY-MM-DD');
		if (callback) {
			callback();
		}
	};

	$scope.setday = function(date) {
		$scope.date = moment(date);
		$scope.dateperiod = $scope.date.format('YYYY-MM-DD');
		$scope.picker = date;
	};

	$scope.setmoment = function(date) {
		$scope.date = date;
		$scope.dateperiod = $scope.date.format('YYYY-MM-DD');
		$scope.picker = date.toDate();
	}
}

function generateDataTable(limit) {
	return {
		data : [],
		selected : [],
		limit : limit,
		page : 1
	}
}

function showPopup($mdDialog, templateUrl, event, clickOutsideToClose, model) {
	$mdDialog.show({
		controller : ModelController,
		templateUrl : templateUrl,
		parent : angular.element(document.body),
		targetEvent : event,
		clickOutsideToClose : clickOutsideToClose,
		locals : {
			model : model
		}
	});
}

function addPickerFunctions($scope, callback) {
	$scope.monthdisplay = 'This Month';
	$scope.datedisplay = 'This Day';
	$scope.weekdisplay = 'This Week';
	$scope.yeardisplay = 'This Year';

	date = moment();
	monthsx = [];
	for (i = 1; i < 12; i++) {
		date.subtract(1, 'month');
		monthx = {
			display : date.format('MMMM YYYY'),
			value : new Date(date.toDate())
		};
		monthsx.push(monthx);
	}
	$scope.last12Months = monthsx;
	
	date = moment();
	years = [];
	while(date.year() >= 2010) {
		var yearx = {
			display : date.format('YYYY'),
			value : new Date(date.toDate())
		};
		years.push(yearx);
		date.subtract(1, 'year');
	}
	$scope.yearuntil2018 = years;
	
	pickYear = function(now) {
		var date;
		if (now && $scope.period != 'year') {
			date = moment();
		} else {
			date = moment($scope.datepicker);
		}
		pickYearBase(date);
	}
	
	pickYear2 = function(yearpicker) {
		date = moment(yearpicker);
		pickYearBase(date);
	}

	pickYearBase = function(date) {
		$scope.datepicker = date.toDate();
		$scope.datedisplay = 'This Day';
		$scope.weekdisplay = 'This Week';
		$scope.monthdisplay = 'This Month';

		$scope.startdate.setmoment(moment(date).startOf('year'));
		$scope.enddate.setmoment(moment(date).endOf('year'));
		$scope.period = 'year';

		var display = date.format("YYYY");
		var nowdisplay = moment().format("YYYY");
		if (display == nowdisplay) {
			$scope.yeardisplay = 'This Year';
		} else {
			$scope.yeardisplay = display;
		}

		if (callback) {
			callback();
		}
	}
	
	pickLast30Days = function() {
		date = moment();
		$scope.datepicker = date.toDate();
		$scope.datedisplay = 'This Day';
		$scope.weekdisplay = 'This Week';
		$scope.monthdisplay = 'Last 30 Days';
		$scope.yeardisplay = 'This Year';

		$scope.startdate.setmoment(moment().subtract(29, 'days'));
		$scope.enddate.setmoment(date);
		$scope.period = 'month';

		if (callback) {
			callback();
		}
	}

	pickThisMonth = function() {
		date = moment();
		pickMonthBase(date);
	}

	pickMonth2 = function(monthpicker) {
		date = moment(monthpicker);
		pickMonthBase(date);
	}

	pickMonth = function(now) {
		var date;
		if (now && $scope.period != 'month') {
			date = moment();
		} else {
			date = moment($scope.monthpicker);
		}
		pickMonthBase(date);
	}

	pickMonthBase = function(date) {
		$scope.monthpicker = date.toDate();
		$scope.datepicker = date.toDate();
		$scope.datedisplay = 'This Day';
		$scope.weekdisplay = 'This Week';
		$scope.yeardisplay = 'This Year';

		$scope.startdate.setmoment(moment(date).startOf('month'));
		$scope.enddate.setmoment(moment(date).endOf('month'));
		$scope.period = 'month';

		var display = date.format("MMMM YYYY");
		var nowdisplay = moment().format("MMMM YYYY");
		if (display == nowdisplay) {
			$scope.monthdisplay = 'This Month';
		} else {
			$scope.monthdisplay = display;
		}

		if (callback) {
			callback();
		}
	}

	pickWeek = function(now) {
		var date;
		if (now && $scope.period != 'week') {
			date = moment();
		} else {
			date = moment($scope.weekpicker);
		}
		pickWeekBase(date);
	}

	pickWeekBase = function(date) {
		$scope.weekpicker = date.toDate();
		$scope.datepicker = date.toDate();
		$scope.datedisplay = 'This Day';
		$scope.monthdisplay = 'This Month';
		$scope.yeardisplay = 'This Year';

		$scope.startdate.setmoment(moment(date).startOf('week'));
		$scope.enddate.setmoment(moment(date).endOf('week'));
		$scope.period = 'week';

		var start = date.startOf('week').format("DD MMM YYYY");
		var end = date.endOf('week').format("DD MMM YYYY");
		var nowdisplay = moment().startOf('week').format("DD MMM YYYY");
		if (start == nowdisplay) {
			$scope.weekdisplay = 'This Week';
		} else {
			$scope.weekdisplay = start + ' ~ ' + end;
		}

		if (callback) {
			callback();
		}
	}

	pickDate = function(now) {
		var date;
		if (now && $scope.period != 'date') {
			date = moment();
		} else {
			date = moment($scope.datepicker);
		}
		pickDateBase(date);
	}

	pickToday = function() {
		date = moment();
		pickDateBase(date);
	}

	pickYesterday = function() {
		date = moment().subtract(1, "days");
		pickDateBase(date);
	}

	pickYesterday2 = function() {
		var date;
		date = moment().subtract(1, "days");
		$scope.datepicker = date.toDate();
		$scope.datedisplay = 'This Day';
		$scope.weekdisplay = 'This Week';
		$scope.monthdisplay = 'This Month';
		$scope.yeardisplay = 'This Year';

		$scope.startdate.setmoment(date);
		$scope.enddate.setmoment(date);
		$scope.period = 'datep';

		if (callback) {
			callback();
		}
	}

	pickDateBase = function(date) {
		$scope.datepicker = date.toDate();
		$scope.weekdisplay = 'This Week';
		$scope.monthdisplay = 'This Month';
		$scope.yeardisplay = 'This Year';

		$scope.startdate.setmoment(date);
		$scope.enddate.setmoment(date);
		$scope.period = 'date';

		var start = date.format("DD MMMM YYYY");
		var nowdisplay = moment().format("DD MMMM YYYY");
		if (start == nowdisplay) {
			$scope.datedisplay = 'This Day';
		} else {
			$scope.datedisplay = start;
		}

		if (callback) {
			callback();
		}
	}

	$scope.pickMonth = pickMonth;
	$scope.pickMonth2 = pickMonth2;
	$scope.pickWeek = pickWeek;
	$scope.pickDate = pickDate;
	$scope.pickToday = pickToday;
	$scope.pickYesterday = pickYesterday;
	$scope.pickYesterday2 = pickYesterday2;
	$scope.pickLast30Days = pickLast30Days;
	$scope.pickThisMonth = pickThisMonth;
	$scope.pickYear = pickYear;
	$scope.pickYear2 = pickYear2;
}

// =============================================================
// COLORS
// =============================================================

var colorPalette = {};
colorPalette['red-50'] = '#FFEBEE';
colorPalette['red-100'] = '#FFCDD2';
colorPalette['red-200'] = '#EF9A9A';
colorPalette['red-300'] = '#E57373';
colorPalette['red-400'] = '#EF5350';
colorPalette['red-500'] = '#F44336';
colorPalette['red-600'] = '#E53935';
colorPalette['red-700'] = '#D32F2F';
colorPalette['red-800'] = '#C62828';
colorPalette['red-900'] = '#B71C1C';
colorPalette['red-A100'] = '#FF8A80';
colorPalette['red-A200'] = '#FF5252';
colorPalette['red-A400'] = '#FF1744';
colorPalette['red-A700'] = '#D50000';

colorPalette['pink-50'] = '#FCE4EC';
colorPalette['pink-100'] = '#F8BBD0';
colorPalette['pink-200'] = '#F48FB1';
colorPalette['pink-300'] = '#F06292';
colorPalette['pink-400'] = '#EC407A';
colorPalette['pink-500'] = '#E91E63';
colorPalette['pink-600'] = '#D81B60';
colorPalette['pink-700'] = '#C2185B';
colorPalette['pink-800'] = '#AD1457';
colorPalette['pink-900'] = '#880E4F';
colorPalette['pink-A100'] = '#FF80AB';
colorPalette['pink-A200'] = '#FF4081';
colorPalette['pink-A400'] = '#F50057';
colorPalette['pink-A700'] = '#C51162';

colorPalette['purple-50'] = '#F3E5F5';
colorPalette['purple-100'] = '#E1BEE7';
colorPalette['purple-200'] = '#CE93D8';
colorPalette['purple-300'] = '#BA68C8';
colorPalette['purple-400'] = '#AB47BC';
colorPalette['purple-500'] = '#9C27B0';
colorPalette['purple-600'] = '#8E24AA';
colorPalette['purple-700'] = '#7B1FA2';
colorPalette['purple-800'] = '#6A1B9A';
colorPalette['purple-900'] = '#4A148C';
colorPalette['purple-A100'] = '#EA80FC';
colorPalette['purple-A200'] = '#E040FB';
colorPalette['purple-A400'] = '#D500F9';
colorPalette['purple-A700'] = '#AA00FF';

colorPalette['deep-purple-50'] = '#EDE7F6';
colorPalette['deep-purple-100'] = '#D1C4E9';
colorPalette['deep-purple-200'] = '#B39DDB';
colorPalette['deep-purple-300'] = '#9575CD';
colorPalette['deep-purple-400'] = '#7E57C2';
colorPalette['deep-purple-500'] = '#673AB7';
colorPalette['deep-purple-600'] = '#5E35B1';
colorPalette['deep-purple-700'] = '#512DA8';
colorPalette['deep-purple-800'] = '#4527A0';
colorPalette['deep-purple-900'] = '#311B92';
colorPalette['deep-purple-A100'] = '#B388FF';
colorPalette['deep-purple-A200'] = '#7C4DFF';
colorPalette['deep-purple-A400'] = '#651FFF';
colorPalette['deep-purple-A700'] = '#6200EA';

colorPalette['indigo-50'] = '#E8EAF6';
colorPalette['indigo-100'] = '#C5CAE9';
colorPalette['indigo-200'] = '#9FA8DA';
colorPalette['indigo-300'] = '#7986CB';
colorPalette['indigo-400'] = '#5C6BC0';
colorPalette['indigo-500'] = '#3F51B5';
colorPalette['indigo-600'] = '#3949AB';
colorPalette['indigo-700'] = '#303F9F';
colorPalette['indigo-800'] = '#283593';
colorPalette['indigo-900'] = '#1A237E';
colorPalette['indigo-A100'] = '#8C9EFF';
colorPalette['indigo-A200'] = '#536DFE';
colorPalette['indigo-A400'] = '#3D5AFE';
colorPalette['indigo-A700'] = '#304FFE';

colorPalette['blue-50'] = '#E3F2FD';
colorPalette['blue-100'] = '#BBDEFB';
colorPalette['blue-200'] = '#90CAF9';
colorPalette['blue-300'] = '#64B5F6';
colorPalette['blue-400'] = '#42A5F5';
colorPalette['blue-500'] = '#2196F3';
colorPalette['blue-600'] = '#1E88E5';
colorPalette['blue-700'] = '#1976D2';
colorPalette['blue-800'] = '#1565C0';
colorPalette['blue-900'] = '#0D47A1';
colorPalette['blue-A100'] = '#82B1FF';
colorPalette['blue-A200'] = '#448AFF';
colorPalette['blue-A400'] = '#2979FF';
colorPalette['blue-A700'] = '#2962FF';

colorPalette['light-blue-50'] = '#E1F5FE';
colorPalette['light-blue-100'] = '#B3E5FC';
colorPalette['light-blue-200'] = '#81D4FA';
colorPalette['light-blue-300'] = '#4FC3F7';
colorPalette['light-blue-400'] = '#29B6F6';
colorPalette['light-blue-500'] = '#03A9F4';
colorPalette['light-blue-600'] = '#039BE5';
colorPalette['light-blue-700'] = '#0288D1';
colorPalette['light-blue-800'] = '#0277BD';
colorPalette['light-blue-900'] = '#01579B';
colorPalette['light-blue-A100'] = '#80D8FF';
colorPalette['light-blue-A200'] = '#40C4FF';
colorPalette['light-blue-A400'] = '#00B0FF';
colorPalette['light-blue-A700'] = '#0091EA';

colorPalette['cyan-50'] = '#E0F7FA';
colorPalette['cyan-100'] = '#B2EBF2';
colorPalette['cyan-200'] = '#80DEEA';
colorPalette['cyan-300'] = '#4DD0E1';
colorPalette['cyan-400'] = '#26C6DA';
colorPalette['cyan-500'] = '#00BCD4';
colorPalette['cyan-600'] = '#00ACC1';
colorPalette['cyan-700'] = '#0097A7';
colorPalette['cyan-800'] = '#00838F';
colorPalette['cyan-900'] = '#006064';
colorPalette['cyan-A100'] = '#84FFFF';
colorPalette['cyan-A200'] = '#18FFFF';
colorPalette['cyan-A400'] = '#00E5FF';
colorPalette['cyan-A700'] = '#00B8D4';

colorPalette['teal-50'] = '#E0F2F1';
colorPalette['teal-100'] = '#B2DFDB';
colorPalette['teal-200'] = '#80CBC4';
colorPalette['teal-300'] = '#4DB6AC';
colorPalette['teal-400'] = '#26A69A';
colorPalette['teal-500'] = '#009688';
colorPalette['teal-600'] = '#00897B';
colorPalette['teal-700'] = '#00796B';
colorPalette['teal-800'] = '#00695C';
colorPalette['teal-900'] = '#004D40';
colorPalette['teal-A100'] = '#A7FFEB';
colorPalette['teal-A200'] = '#64FFDA';
colorPalette['teal-A400'] = '#1DE9B6';
colorPalette['teal-A700'] = '#00BFA5';

colorPalette['green-50'] = '#E8F5E9';
colorPalette['green-100'] = '#C8E6C9';
colorPalette['green-200'] = '#A5D6A7';
colorPalette['green-300'] = '#81C784';
colorPalette['green-400'] = '#66BB6A';
colorPalette['green-500'] = '#4CAF50';
colorPalette['green-600'] = '#43A047';
colorPalette['green-700'] = '#388E3C';
colorPalette['green-800'] = '#2E7D32';
colorPalette['green-900'] = '#1B5E20';
colorPalette['green-A100'] = '#B9F6CA';
colorPalette['green-A200'] = '#69F0AE';
colorPalette['green-A400'] = '#00E676';
colorPalette['green-A700'] = '#00C853';

colorPalette['light-green-50'] = '#F1F8E9';
colorPalette['light-green-100'] = '#DCEDC8';
colorPalette['light-green-200'] = '#C5E1A5';
colorPalette['light-green-300'] = '#AED581';
colorPalette['light-green-400'] = '#9CCC65';
colorPalette['light-green-500'] = '#8BC34A';
colorPalette['light-green-600'] = '#7CB342';
colorPalette['light-green-700'] = '#689F38';
colorPalette['light-green-800'] = '#558B2F';
colorPalette['light-green-900'] = '#33691E';
colorPalette['light-green-A100'] = '#CCFF90';
colorPalette['light-green-A200'] = '#B2FF59';
colorPalette['light-green-A400'] = '#76FF03';
colorPalette['light-green-A700'] = '#64DD17';

colorPalette['lime-50'] = '#F9FBE7';
colorPalette['lime-100'] = '#F0F4C3';
colorPalette['lime-200'] = '#E6EE9C';
colorPalette['lime-300'] = '#DCE775';
colorPalette['lime-400'] = '#D4E157';
colorPalette['lime-500'] = '#CDDC39';
colorPalette['lime-600'] = '#C0CA33';
colorPalette['lime-700'] = '#AFB42B';
colorPalette['lime-800'] = '#9E9D24';
colorPalette['lime-900'] = '#827717';
colorPalette['lime-A100'] = '#F4FF81';
colorPalette['lime-A200'] = '#EEFF41';
colorPalette['lime-A400'] = '#C6FF00';
colorPalette['lime-A700'] = '#AEEA00';

colorPalette['yellow-50'] = '#FFFDE7';
colorPalette['yellow-100'] = '#FFF9C4';
colorPalette['yellow-200'] = '#FFF59D';
colorPalette['yellow-300'] = '#FFF176';
colorPalette['yellow-400'] = '#FFEE58';
colorPalette['yellow-500'] = '#FFEB3B';
colorPalette['yellow-600'] = '#FDD835';
colorPalette['yellow-700'] = '#FBC02D';
colorPalette['yellow-800'] = '#F9A825';
colorPalette['yellow-900'] = '#F57F17';
colorPalette['yellow-A100'] = '#FFFF8D';
colorPalette['yellow-A200'] = '#FFFF00';
colorPalette['yellow-A400'] = '#FFEA00';
colorPalette['yellow-A700'] = '#FFD600';

colorPalette['amber-50'] = '#FFF8E1';
colorPalette['amber-100'] = '#FFECB3';
colorPalette['amber-200'] = '#FFE082';
colorPalette['amber-300'] = '#FFD54F';
colorPalette['amber-400'] = '#FFCA28';
colorPalette['amber-500'] = '#FFC107';
colorPalette['amber-600'] = '#FFB300';
colorPalette['amber-700'] = '#FFA000';
colorPalette['amber-800'] = '#FF8F00';
colorPalette['amber-900'] = '#FF6F00';
colorPalette['amber-A100'] = '#FFE57F';
colorPalette['amber-A200'] = '#FFD740';
colorPalette['amber-A400'] = '#FFC400';
colorPalette['amber-A700'] = '#FFAB00';

colorPalette['orange-50'] = '#FFF3E0';
colorPalette['orange-100'] = '#FFE0B2';
colorPalette['orange-200'] = '#FFCC80';
colorPalette['orange-300'] = '#FFB74D';
colorPalette['orange-400'] = '#FFA726';
colorPalette['orange-500'] = '#FF9800';
colorPalette['orange-600'] = '#FB8C00';
colorPalette['orange-700'] = '#F57C00';
colorPalette['orange-800'] = '#EF6C00';
colorPalette['orange-900'] = '#E65100';
colorPalette['orange-A100'] = '#FFD180';
colorPalette['orange-A200'] = '#FFAB40';
colorPalette['orange-A400'] = '#FF9100';
colorPalette['orange-A700'] = '#FF6D00';

colorPalette['deep-orange-50'] = '#FBE9E7';
colorPalette['deep-orange-100'] = '#FFCCBC';
colorPalette['deep-orange-200'] = '#FFAB91';
colorPalette['deep-orange-300'] = '#FF8A65';
colorPalette['deep-orange-400'] = '#FF7043';
colorPalette['deep-orange-500'] = '#FF5722';
colorPalette['deep-orange-600'] = '#F4511E';
colorPalette['deep-orange-700'] = '#E64A19';
colorPalette['deep-orange-800'] = '#D84315';
colorPalette['deep-orange-900'] = '#BF360C';
colorPalette['deep-orange-A100'] = '#FF9E80';
colorPalette['deep-orange-A200'] = '#FF6E40';
colorPalette['deep-orange-A400'] = '#FF3D00';
colorPalette['deep-orange-A700'] = '#DD2C00';

colorPalette['brown-50'] = '#EFEBE9';
colorPalette['brown-100'] = '#D7CCC8';
colorPalette['brown-200'] = '#BCAAA4';
colorPalette['brown-300'] = '#A1887F';
colorPalette['brown-400'] = '#8D6E63';
colorPalette['brown-500'] = '#795548';
colorPalette['brown-600'] = '#6D4C41';
colorPalette['brown-700'] = '#5D4037';
colorPalette['brown-800'] = '#4E342E';
colorPalette['brown-900'] = '#3E2723';

colorPalette['gray-50'] = '#FAFAFA';
colorPalette['gray-100'] = '#F5F5F5';
colorPalette['gray-200'] = '#EEEEEE';
colorPalette['gray-300'] = '#E0E0E0';
colorPalette['gray-400'] = '#BDBDBD';
colorPalette['gray-500'] = '#9E9E9E';
colorPalette['gray-600'] = '#757575';
colorPalette['gray-700'] = '#616161';
colorPalette['gray-800'] = '#424242';
colorPalette['gray-900'] = '#212121';

colorPalette['blue-gray-50'] = '#ECEFF1';
colorPalette['blue-gray-100'] = '#CFD8DC';
colorPalette['blue-gray-200'] = '#B0BEC5';
colorPalette['blue-gray-300'] = '#90A4AE';
colorPalette['blue-gray-400'] = '#78909C';
colorPalette['blue-gray-500'] = '#607D8B';
colorPalette['blue-gray-600'] = '#546E7A';
colorPalette['blue-gray-700'] = '#455A64';
colorPalette['blue-gray-800'] = '#37474F';
colorPalette['blue-gray-900'] = '#263238';

colorPalette['black'] = '#000000';
colorPalette['white'] = '#FFFFFF';