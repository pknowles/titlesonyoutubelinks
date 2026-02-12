
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	// get the title from youtube using oEmbed API
	var url = 'https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=' + request.id + '&format=json';

	fetch(url)
		.then(function(response) {
			if (!response.ok) {
				throw new Error('HTTP ' + response.status);
			}
			return response.json();
		})
		.then(function(data) {
			sendResponse({id: request.id, data: data, status: 0});
		})
		.catch(function(error) {
			sendResponse({id: request.id, data: null, status: error.message});
		});

	return true; // Will respond asynchronously.
});
