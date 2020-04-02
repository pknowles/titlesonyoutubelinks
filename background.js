
var youtubeInfoURL = 'https://www.googleapis.com/youtube/v3/videos?part=snippet&fields=items(snippet(title))&key=AIzaSyCvCg-nJGBNZKag_jyxYZLs4xEE4Pqn0HU&id=';

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	// get the title from youtube
	var url = youtubeInfoURL + request.id;
	var httpRequest = $.get(url, function(data){
		sendResponse({id:request.id, data:data, status:0});
	}).fail(function(jqXHR) {
		sendResponse({id:request.id, data:null, status:jqXHR});
	});
	return true; // Will respond asynchronously.
});
