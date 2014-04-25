var processSite = require('./lib/carHandler');
var S = require('string');
S.extendPrototype();
var bmw = 'http://www.zimbrickbmw.com/VehicleSearchResults?pageContext=VehicleSearch&search' + 
'=new&search=preowned&search=certified&bodyType=All&make=BMW&series=All&model=All&bodyStyle=Sedan+4+' +
'Dr.&trim=All&stockOrVIN=&minPrice=-2147483648&maxPrice=50000&minYear=2004&maxYear=2014&minMileage=-' +
'2147483648&maxMileage=2147483647&minMPG=-2147483648&maxMPG=2147483647';

var fs = require('fs');
var util = require('util');
//var ProgressBar = require('progress');
//var bar = new ProgressBar('  downloading [:bar] :percent :etas', arr.length * 10);


processSite(bmw, bmwSite, bmwPage, bmwLink, bmwFinal);


function bmwSite (err, $, cb) {
	var numVehicles = $('#inv_search_count_container').text();
	var numPages = Math.ceil(numVehicles / 10);
	var pages = [];
	pages[0] = bmw;
	for (var i = 2; i <= numPages; i++) {
		pages[i - 1] = bmw + '&pageNumber=' + i;
	}
	cb(pages);
}

function bmwPage (err, $, cb) {
	var links = [];
	var temp;
	//fs.appendFileSync('test.txt', util.inspect(arguments, { showHidden: true, depth: 5, color: true}) + '\n\n');
	$('.result_item_moreDetailsLink').each(function (i, elem) {
		temp = $(elem).html();
		links.push('http://www.zimbrickbmw.com/' + temp.between('href="', '" title').toString());
		temp = null;
	});
	cb(links);
}

function bmwLink (err, $, cb) {
	var pic = $('#media_placeholder').html();
	pic = pic.between('src="', '" alt').toString();

	var description = $('.description').text();
	description = description.stripTags().collapseWhitespace().chompLeft('Description').toString();
	var price = $('#priceValue').text();
	var specs = [];
	$('.specifications').children().each(function (i, elem) {
		var temp = $(this).html();
		var mykey = temp.between('<label>', ':</label').toString();
		var val = temp.between('<span>', '</span').toString();
		var ret = {};
		ret.name = mykey;
		ret.value = val;
		specs.push(ret);
		return;
	});
	var category = { name: 'category', value: $('.category', '#standardEquipment_content').text() };

	makeAndModel = [];
	$('span:not([class])', '#standardEquipment_content').each(function (i, elem) {
		var ret = {};
		switch (i) {
			case 0:
			ret.name = 'year';
			ret.value = $(this).text();
			break;
			case 1:
			ret.name = 'make';
			ret.value = $(this).text();
			break;
			case 2:
			ret.name = 'model';
			ret.value = $(this).text();
			break;
			case 3:
			ret.name = 'ignore';
			ret.value = $(this).text();
			break;
			default:
			return false;
		}
		makeAndModel.push(ret);
		return;
	});
	cb($('title').text());
}

function bmwFinal () {
	console.log('HOLY SHIT');
	console.log(bmw);
}






/*
processSite('http://www.google.com',one,two,three);
processSite('http://www.reddit.com', oneb, two, three);

function one (err, $, cb) {
	console.log($('title').text());
	var arr = ['http://www.yahoo.com', 'http://www.twitter.com', 'http://www.newegg.com'];
	return cb(arr);
}

function oneb (err, $, cb) {
	console.log('One B: ', $('title').text());
	var arr = ['http://www.epic.com', 'http://nodejs.org'];
	return cb(arr);
}

function two (err, $, cb) {
	console.log($('title').text());
	return cb();
}

function three () {
	console.log('HOLY SHIT!!');
}*/

