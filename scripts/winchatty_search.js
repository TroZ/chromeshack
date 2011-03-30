WinChattySearch =
{
    install: function()
    {
        // redirect searchbox to winchatty
        // disabled at least until electorly gets things working again
        /*
        var searchbox = document.getElementById("search_box");
        searchbox.action = "http://winchatty.com/search.php";
        var text = document.getElementById("searchbox");
        text.name = "terms";
        */

        var liUser = getDescendentByTagAndClassName(document.getElementById('user'), 'li', 'user');
        if (liUser != null)
        {
			var name = liUser.innerHTML;
			var encodeName = encodeURIComponent(stripHtml(liUser.innerHTML));
            
			// liUser.innerHTML = '<a href="http://www.shacknews.com/search?q=' + encodeURIComponent(stripHtml(liUser.innerHTML)) + '&type=4">' + liUser.innerHTML + '</a>';
            //liUser.innerHTML = '<a href="http://winchatty.com/search.php?author=&parentAuthor=&category=&terms=' + encodeURIComponent(stripHtml(liUser.innerHTML)) + '" title="WinChatty-powered Vanity Search">' + liUser.innerHTML + '</a>';
			
			liUser.innerHTML += ' | <a target="_blank" href="http://www.shacknews.com/user/'+encodeName+'/posts">Posts</a> ';
			liUser.innerHTML += ' | <a target="_blank" href="http://www.shacknews.com/search?chatty=1&type=4&chatty_term=&chatty_user=&chatty_author='+encodeName+'&chatty_filter=all">Replies</a> ';
			liUser.innerHTML += ' | <a target="_blank" href="http://www.shacknews.com/search?chatty=1&type=4&chatty_term='+encodeName+'&chatty_user=&chatty_author=&chatty_filter=all">Mentions</a> ';
        }	
    },
}

WinChattySearch.install();
