var controller = (function() {

	// private
	var _module = 'Controller';
	// ---
	var views = {};
	// ---
	var currentView = '';

	function registerHotkeys() {
		var keyMap = {
			"j": "/loadNextArticle",
			"k": "/loadPrevArticle",
			"b": "/scrollToTop",
			"u": "/setCurrentUnread",
			"o": "/openCurrentLink",
			"s": "/toggleSideBar",
			"c": "/getCounters",
			"Alt+r": "/markCurrentFeedAsRead"
		};
		_.each(keyMap, function(value, key) {
			$(document).bind("keypress", key, function() {
				obs.pub(value);
			});
		});
	};

	function disconnectView(viewName) {

	};

	// public
	return {
		init: function() {
			console.log(_module + ": initializing ...");
			// ---
			views['listView']= listView;
			// ---
			console.log(_module + ": registering hotkeys ...");
			registerHotkeys();
			// ---
			console.log(_module + ": waiting for events ...");
			obs.sub('/feedActivated', this.activateFeed);
			// ---
			obs.sub('/toggleSideBar', this.toggleSideBar);
			// ---
			setInterval(function() {obs.pub('/getCounters')}, 60000);

			// buttons
			$('#next').button({
				text: false,
				icons: {
					primary: "ui-icon-circle-arrow-s"
				}
			}).click(function() {
				obs.pub('/loadNextArticle');
			});
			$('#prev').button({
				text: false,
				icons: {
					primary: "ui-icon-circle-arrow-n"
				}
			}).click(function() {
				obs.pub('/loadPrevArticle');
			});
			$('#open').button({
				text: false,
				icons: {
					primary: "ui-icon-triangle-1-ne"
				}
			}).click(function() {
				obs.pub('/openCurrentLink');
			});
		},
		activateFeed: function(event, feedId) {
			console.log(_module + ": get request to activate feed %s", feedId);
			// ---
			// сбрасываем кэш модели
			dataManager.clearCache();
			// ---
			// необходимо определить представление для текущего фида
			newView = "listView"; // тут будет вызов функции определения
			if(newView != currentView) {
				// отключаем старый
				if (currentView != '') {
					console.log(_module+': disconnecting view %',currentView);
					views[currentView].disconnect();
				};
				// ---
				console.log(_module+': connecting view %s',newView);
				currentView = newView;
				views[currentView].connect(feedId);
			}else{
				console.log(_module+': activating feed %s',feedId);
				views[currentView].activateFeed(feedId);
			};

		},
		toggleSideBar: function() {
			console.log(_module + ": toggle sidebar state.");
			appLayout.toggle('west');
		}
	}

}());