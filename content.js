
var maxRequests = 3;
var popup = null;
var popupLinkID = null;
var popupLink = null;
var requests = {};
var titleCache = {};
var youtubeLinkRegex = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
var popupStyle = `
	position: absolute;
	pointer-events: none;
	z-index: 19999999999;
	color: #1a1a1a;
	text-decoration: none !important;
	font-size: 15px;
	font-weight: 500;
	padding: 6px 10px;
	margin: 3px;
	background-color: #ffffff;
	border: 1px solid #e0e0e0;
	border-radius: 8px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
	backdrop-filter: blur(10px);
`;

/**
 * JavaScript function to match (and return) the video Id
 * of any valid Youtube Url, given as input string.
 * @author: Stephan Schmitz <eyecatchup@gmail.com>
 * @url: http://stackoverflow.com/a/10315969/624466
 */
function youtubeVideoID(url) {
	var p = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
	return (url.match(p)) ? RegExp.$1 : false;
}

function createPopup()
{
	var p = $('<div>');
	p.attr('style', popupStyle);
	return p;
}

function updateTitle()
{
	if (!popup)
		return;

	var title = titleCache[popupLinkID];
	if (title)
	{
		popup.text(title);
		if (title.match(/rick astley/i) && title.match(/never/i))
			popup.css('background-color', '#fee2e2');
	}
	else if (requests[popupLinkID])
		popup.text('[Fetching...]');
	else
		popup.text('[Waiting...]');
}

function gotResponse(id, data, status) {
	// update the cache
	if (data)
	{
		if (data.title)
			titleCache[id] = data.title;
		else
			titleCache[id] = '[Not Found]';
	}
	else
	{
		titleCache[id] = '[' + status + ']';
	}

	// update the popup title if this response just got its title
	if (id == popupLinkID)
		updateTitle();
}

$(document).on("mouseenter", "a", function() {
	// check it's a youtube link
	var id = youtubeVideoID(this.href);
	if (!id)
		return;

	// create and add popup to document
	if (!popup)
		popup = createPopup();
	$(document.body).parent().append(popup);
	var pos = $(this).offset();
	popup.css({top:pos.top-24, left:pos.left});

	popupLinkID = id;
	popupLink = this;

	// fetch if haven't already but don't make too many requests to youtube
	if (!titleCache[id] && !requests[id] && Object.keys(requests).length < maxRequests)
	{
		requests[id] = true;
		chrome.runtime.sendMessage({id: id}, function(response){
			gotResponse(response.id, response.data, response.status);
			delete requests[response.id];

			// if popup changed but couldn't fetch the title, try again now
			if (popup && !titleCache[popupLinkID] && !requests[popupLinkID])
				$(popupLink).trigger("mouseenter");
		});
	}

	// update the title, whatever happened
	updateTitle();
});

$(document).on("mouseleave", "a", function() {
	if (popup)
	{
		popup.remove();
		popup = null;
		popupLinkID = null;
		popupLink = null;
	}
});
