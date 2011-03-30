settingsLoadedEvent.addHandler(function()
{
    if (getSetting("enabled_scripts").contains("expiration_watcher"))
    {
        ExpirationWatcher =
        {
            // 1000ms * 60s * 60m * 24hr
            post_ttl: 1000 * 60 * 60 * 24,

            bar_colors: new Array('#00C300' ,'#00C800' ,'#00D100' ,'#00D800' ,'#00DF00' ,'#00E600' ,'#00ED00' ,'#00F500' ,'#00FB00' ,'#00FE00' ,'#2AFF00' ,'#7EFF00' ,'#D4FF00' ,'#FEFF00' ,'#FFFF00' ,'#FFEE00' ,'#FFCF00' ,'#FFAA00' ,'#FF9900' ,'#FF9900' ,'#FF8000' ,'#FF4B00' ,'#FF1A00' ,'#FF0000'),
			
			bg_x_pos: 0,
			rotatestyle: null,

            showExpiration: function(item, id, is_root_post)
            {
                if (is_root_post)
                {
                    var postdate = getDescendentByTagAndClassName(item, "div", "postdate");
                    var expiration_time = ExpirationWatcher.calculateExpirationTime(postdate);

                    var now = Date.now();

                    var time_left = expiration_time - now;
                    var percent = 100;
                    var color = "#000000";
                    if (time_left > 0)
                    {
                        var total_seconds = Math.round(time_left / 1000);
                        var total_minutes = Math.floor(total_seconds / 60);
                        var total_hours = Math.floor(total_minutes / 60);

                        var minutes = total_minutes % 60;
                        var seconds = total_seconds % 60;

                        var desc = "Expires in " + total_hours + " hours, " + minutes + " minutes, and " + seconds + " seconds.";
                        var percent = 100 - Math.floor(100 * time_left / ExpirationWatcher.post_ttl);
                        color = ExpirationWatcher.bar_colors[23 - total_hours];
                    }
                    else
                    {
                        var desc = "Expired.";
                    }

                    var wrap = document.createElement("div");
                    wrap.className = "countdown-wrap";
                    wrap.title = desc;

                    var value = wrap.appendChild(document.createElement("div"));
                    value.className = "countdown-value";
                    value.style.backgroundColor = color;
                    value.style.width = percent + "%";

                    postdate.parentNode.insertBefore(wrap, postdate);
					
					if(ExpirationWatcher.rotatestyle == null){
						//*  toggle comment, switch line start between /* and //* (one character change) to toggle two versions of the code
						ExpirationWatcher.rotatestyle = 1;
						/*/
						ExpirationWatcher.rotatestyle = document.createElement('style');
						ExpirationWatcher.rotatestyle.setAttribute('type','text/CSS');
						ExpirationWatcher.rotatestyle.textContent = ".countdown-value { background-position: 0px 0px };";
						document.getElementsByTagName('head')[0].appendChild(ExpirationWatcher.rotatestyle);
						//*/
						setInterval(ExpirationWatcher.rotateBackground, 250);
					}

                }

            },

            calculateExpirationTime: function(postdate_element)
            {
                // put space between time and AM/PM so it will parse correctly
                var raw_time_string = postdate_element.innerHTML.toUpperCase();
                var pos = raw_time_string.indexOf("AM") + raw_time_string.indexOf("PM")+1;
                raw_time_string = raw_time_string.substring(0,pos) + " " + raw_time_string.substr(pos);

                var post_time = Date.parse(raw_time_string);
                return post_time + ExpirationWatcher.post_ttl;
            },
			
			rotateBackground: function(){
				ExpirationWatcher.bg_x_pos = (ExpirationWatcher.bg_x_pos+1)%25;
				//*
				var query = "//div[@class='countdown-value']";
                var posts =  document.evaluate(query, document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
				var post;
                for (i = 0; i < posts.snapshotLength; i++)
                {
					post = posts.snapshotItem(i);
					if(post.style.width.indexOf('100')<0)
						post.style.backgroundPosition = ""+ExpirationWatcher.bg_x_pos+"px 0px !important;";
				}
				/*/
				ExpirationWatcher.rotatestyle.textContent = ".countdown-value { background-position: "+ExpirationWatcher.bg_x_pos+"px 0px };";
				//*/
				
			}
        }

        processPostEvent.addHandler(ExpirationWatcher.showExpiration);
		
    }
});
