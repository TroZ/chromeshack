// some parts taken from Greg Laabs "OverloadUT"'s New Comments Marker greasemonkey script
settingsLoadedEvent.addHandler(function()
{
    if (getSetting("enabled_scripts").contains("new_comment_highlighter"))
    {
		//uses saved value first, if not set gets it from page
		function getMyID() {
			var id = getSetting("my_id", null);		
			if(id == null || id.trim().length<1) 
			{ 
				var elem = document.evaluate('//span[contains(@class,"this_user")]/..', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
				elem = elem.singleNodeValue;
				if(elem!=null) 
				{
					id = elem.className.substr(elem.className.indexOf("olauthor_")+9);
					setSetting("my_id",id);
				} 
			}
			
			return id;
		}

		//gets the user id from the page first, only uses saved version if can't find a post from the user on the page - may work better for shackers who share a computer
		function getMyID_alt() {
			var id = null;
			var elem = document.evaluate('//span[contains(@class,"this_user")]/..', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
			elem = elem.singleNodeValue;
			if(elem!=null) 
			{
				id = elem.className.substr(elem.className.indexOf("olauthor_")+9);
				setSetting("my_id",id);
			} 
			else 
			{
				id = getSetting("my_id", null);
			}
			
			return id;
		}
		
        NewCommentHighlighter =
        {   
            highlight: function()
            {
                var last_id = getSetting("new_comment_highlighter_last_id");
                var new_last_id = NewCommentHighlighter.findLastID();

                // only highlight if we wouldn't highlight everything on the page
                if (last_id != null && (new_last_id - last_id) < 1000)
                {
                    NewCommentHighlighter.highlightPostsAfter(last_id);
                }

                if (last_id == null || new_last_id > last_id)
                {
                    setSetting('new_comment_highlighter_last_id', new_last_id);
                }
            },

            highlightPostsAfter: function(last_id)
            {
                var new_posts = NewCommentHighlighter.getPostsAfter(last_id);
				var myReplies = new Array();
				var myid = getMyID();

                var post;
                for (i = 0; i < new_posts.snapshotLength; i++)
                {
                    var post = new_posts.snapshotItem(i);
					
					if(NewCommentHighlighter.replyToMe(post,myid))
					{
						myReplies.push(post);
						if (post.className == 'last')
							post.className += ' newcommenthighlighter_last_tome';
						else if (post.className == '')
							post.className += 'newcommenthighlighter_tome';
					}
					else
					{
						if (post.className == 'sel last')
							post.className += ' newcommenthighlighter_newrootpost';
						else if (post.className == 'last')
							post.className += ' newcommenthighlighter_last';
						else if (post.className == '')
							post.className += 'newcommenthighlighter';
					}

                    if (post == post.parentNode.childNodes[1])
                        post.parentNode.className = 'newcommenthighlighter';
                }

                NewCommentHighlighter.displayNewCommentCount(new_posts.snapshotLength,myReplies);
				myReplies = null;
            },

            displayNewCommentCount: function(count, myReplies)
            {
				//find XXX Comments, but not 'Show All Comments'
				var query = '//div[@id="chatty_settings"]/a';
				var cs = null;
				var csall = document.evaluate(query, document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
				for (i = 0; i < csall.snapshotLength; i++)
                {
                    var tmp = csall.snapshotItem(i);
					if(tmp.innerHTML.indexOf('Comments')>0 && tmp.innerHTML.indexOf('All')<0){
						cs = tmp;
					}
				}
				
				if(cs == null){
					return;
				}
				
				//remove link around 'XXX Comments'
				var next = cs.nextSibling;
				var parent = cs.parentNode
				var text = cs.innerHTML;
				parent.removeChild(cs);
				cs = document.createElement('span');
				parent.insertBefore(cs,next);
				
				//update text
				var str = ' Comments (' + count + ' New';
				if(myReplies.length>0)
				{
					str += ', <a href="#" id="newrepliestoyou"><span class="jt_red">'+myReplies.length+' to you</span></a>';
				}
				str += ')';
				cs.innerHTML = text.replace(' Comments', str); 
				
				if(myReplies.length>0)
				{
					NewCommentHighlighter.addMyReplies(cs,myReplies);
				}
            },

            getPostsAfter: function(last_id)
            {
                // grab all the posts with post ids after the last post id we've seen
                var query = '//li[number(substring-after(@id, "item_")) > ' + last_id + ']';
                return document.evaluate(query, document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
            },

            findLastID: function()
            {
                // 'oneline0' is applied to highlight the most recent post in each thread
                // we only want the first one, since the top post will contain the most recent
                // reply.
                var query = '//div[contains(@class, "oneline0")]';
                var post = document.evaluate(query, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

                // no posts? no id
                if (post == null)
                    return null;

                var id = post.parentNode.id;
                return parseInt(id.substr(5));
            },
			
			replyToMe: function(post, myid)
			{
				//determines if a particular reply is to the currently logged in user or not.
				var tome = false;
				if(myid != null) {
					var parentdiv = post.parentNode.parentNode;
					var parentclass = '';
					
					if(parentdiv.className != "root") 
					{
						if(parentdiv.className == "capcontainer") 
						{
							// parent is a root post
							parentclass = parentdiv.parentNode.childNodes[1].className;
						} 
						else 
						{
							// parent is a reply
							parentclass = parentdiv.childNodes[1].className;
						}
											
						if(parentclass!=null && parentclass.trim().length > 9){
							//slight improvement by TroZ here to prevent user 12345's posts from being highlighted for user 2345 - was happening between me and tboomer2 under OverloadUT's original version of script
							parentclasses=parentclass.split(' ');
							for(var j=parentclasses.length-1;j>=0;j--)
							{//reverse order as the author is typically the last class
								if(parentclasses[j].indexOf('fpauthor_')>-1 || parentclasses[j].indexOf('olauthor_')>-1)
								{
									parentclass = parentclasses[j];
									if(parentclass.split('_')[1] == myid) 
									{
										tome = true;
									}
									break;
								}
							}
						}
					}
				}
				return tome;
			},
					
			addMyReplies: function(cs, myReplies){
				//adds a list of links to new replies to your posts in a popup 'window'
				
//console.log("creating popup dialog "+myReplies);
//console.log("length "+myReplies.length);

				var div = document.createElement('div');
				div.setAttribute('class','interiorform hidden');
				div.setAttribute('id','newrepliestoyouform');
				var str = '<div class="closeform"><a href="#" id="newrepliestoyouformclose" title="Close Filters">x</a></div>\n';
				str += '<h2>Replies to your posts</h2><hr>\n';
				while(myReplies.length>0)
				{
					var post = myReplies.pop();
					var url = '#'+post.getAttribute('id');
					var link = getDescendentByTagAndClassName(post,'a','shackmsg');
					var name = getDescendentByTagAndClassName(post,'span','oneline_user');
					var text = link.textContent.length>3?link.textContent.substring(0,link.textContent.length-3):'';  //remove the ' : ' between post and name
					str+='<a href="'+url+'"';
					if(link!=null)
					{
						str+=' onclick="'+link.getAttribute('onclick').replace('return','')+'"';
					}
					str+='>'+name.innerHTML+': '+text+'</a>\n';
				}
				div.innerHTML = str;
				cs.parentNode.appendChild(div);
//console.log("added");
				
				var node = document.getElementById('newrepliestoyou');
				if(node != null){ node.addEventListener('click', NewCommentHighlighter.showReplies, true);
				}else{ console.log(" failed to add newrepliestoyou onclick "); }
				
				node = document.getElementById('newrepliestoyouformclose');
				if(node != null){ node.addEventListener('click', NewCommentHighlighter.hideReplies, true);
				}else{ console.log(" failed to add newrepliestoyouformclose onclick "); }
				
//console.log("done");

			},
			
			showReplies: function()
			{
console.log("show");
				var elm = document.getElementById('newrepliestoyouform');
				if(elm!=null)
				{
					elm.className = 'interiorform';
				}
			},
			
			hideReplies: function()
			{
console.log("hide");
				var elm = document.getElementById('newrepliestoyouform');
				if(elm!=null)
				{
					elm.className += ' hidden';
				}
			}
        }

        NewCommentHighlighter.highlight();

    }
});

