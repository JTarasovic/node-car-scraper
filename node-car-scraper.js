var cheerio = require('cheerio');
var request = require('request');
var ProgressBar = require('progress');

function processSite (site, siteCB, pageCB, linkCB, finalCB) {
	request(site, _site);

	function _site (err, resp, body) {
		if (err) {
			siteCB(err);
			return;
		}
		siteCB(null, cheerio.load(body), _additional);

		function _additional (pages) {
			var completed = 0;
			var links = [];
			
			pages.forEach(function (page, index, array){
				request(page, _page.bind(this, index));
			});

			function _page (index, err, resp, body) {
				if (err) {
					pageCB(err);
					return;
				}
				pageCB(null, cheerio.load(body), function (arr){
					completed += 1;
					links = links.concat(arr);
					if (completed >= pages.length) {
						_links(links);
					}
					return;
				});
				return;
			}
			return;
		}

		function _links (arr) {
			var completed = 0;

			var bar = new ProgressBar(' fetching cars: [:bar] :percent :etas', arr.length);
			arr.forEach(function (link, index, array) {
				request(link, _process);
			});

			function _process (err, resp, body) {
				//console.log(body);
				if (err) {
					linkCB(err);
					return;
				}

				linkCB(null, cheerio.load(body), function () {
					completed += 1;
					bar.tick();
					if (completed >= arr.length) {
						finalCB();
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
