var cheerio = require('cheerio');
var request = require('request');
var ProgressBar = require('progress');
var debug = false;


// exported function
function processSite (site, siteCB, pageCB, linkCB, finalCB) {
	if (process.env.NODE_ENV === 'debug') {
		debug = true;
	}
	if (debug) {console.log('Main site:', site);}
	request(site, _site);

	// for the main site 
	function _site (err, resp, body) {
		if (err) {
			siteCB(err);
			return;
		}

		// call the site cb. send back a cheerio object so that 
		// it can use jquery-like functions to get the relevent info
		siteCB(null, cheerio.load(body), _additional);

		// process array of pages to get
		function _additional (pages) {
			if (!pages || !Array.isArray(pages)) {
				pageCB('Yo, send me an array of pages.');
				return;
			}

			var completed = 0;
			var links = [];
			
			// actually get each page
			pages.forEach(function (page, index, array){
				if (debug) {console.log('Page', index, ':', page);}
				request(page, _page);
				return;
			});

			// call the page cb so that the caller can get the links from the page
			function _page (err, resp, body) {
				if (err) {
					pageCB(err);
					return;
				}
				pageCB(null, cheerio.load(body), function (arr){
					if (!arr || !Array.isArray(arr)) {
						linkCB('Yo, send me an array of links from a page.');
						return;
					}
					completed += 1;
					if (debug) console.log('Page', completed, 'of', pages.length);
					links = links.concat(arr);

					// once we have all the links from the pages, start processing them
					if (completed >= pages.length) {
						if (debug) {console.log('Number of results:', links.length);}
						_links(links);
					}
					return;
				});
				return;
			}
			return;
		}

		// process array of links
		function _links (arr) {
			var completed = 0;

			if (!debug) {
				var bar = new ProgressBar(' fetching cars: [:bar] :percent :etas', arr.length);
			}
			arr.forEach(function (link, index, array) {
				if (debug) {console.log('Link', index, ':', link);}
				request(link, _process);
				return;
			});

			function _process (err, resp, body) {
				if (err) {
					linkCB(err);
					return;
				}

				// allow the caller to process each individual page
				linkCB(null, cheerio.load(body), function () {
					completed += 1;
					if (debug) console.log('Link', completed, 'of', arr.length);
					if (!debug) bar.tick();
					if (completed >= arr.length) {
						finalCB();
						return;
					}
					return;
				});
				return;
			}
			return;
		}
		return;
	}
	return;
}

exports = module.exports = processSite;
