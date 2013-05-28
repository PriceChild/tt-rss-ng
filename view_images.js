//     tt-rss-ng
//     https://github.com/ollowtf/tt-rss-ng
//     (c) 2012-2013 Pavel Grechishkin (pavel.gretchishkin@gmail.com)
//     Distributed under the AGPL-3.0 (http://opensource.org/licenses/AGPL-3.0)

var imagesView = (function() {

	// private
	//  ----------------------------------------------------------------
	var currentFeed = '';
	var contentBlock = '';

	var currentFeed = '';

	var params = {};

	var multiSelect = false;

	var rowTemplate = '<a class="article-link" href="<%=link%>"/>' +
		'<div class="header">	' +
		'<div class="iconscolumn checkbox <%=multi%>"><input id="chk-<%=id%>" type="checkbox"></div>' +
		'<div class="iconscolumn star"><div id="str-<%=id%>" class="<%=star%>"></div></div>' +
		'<div class="iconscolumn share"><div id="shr-<%=id%>" class="<%=publish%>"></div></div>' +
		'<div class="updatecolumn"><%=updated%></div>' +
		'<div class="titlecolumn"><span id="hdr-<%=id%>" class="title"><%=title%></span>' +
		'<span class="excerpt"><%=excerpt%></span></div>' +
		'</div>';

	var _module = 'ImagesView';

	function _clearHeaders() {
		contentBlock.html('');
	}

	function articleDate(cd, ad) {
		updateTime = new Date(ad * 1000);
		if (cd.isBefore(updateTime)) {
			return (updateTime.toString("HH:mm"));
		} else {
			return (updateTime.toString("dd-MM-yyyy"));
		}
	}

	function _displayHeaders(event, seq) {
		console.log(_module + ': displaying headers for seq %d', seq);
		// удаляем кнопку получения новых
		$("#nextButton").remove();
		// ---
		today = Date.today();
		// ---
		headers = dataManager.getHeaders(seq);
		// ---
		// компилируем шаблон
		template = _.template(rowTemplate);
		// выводим заголовки
		_.each(headers, function(element) {
			rowId = 'row-' + element.id;
			// ---
			cd = $("<div/>").html(element.content);
        	content = $("img", cd)[0].outerHTML;
        	newRow = $('<div/>').addClass('imagebox').attr('id', rowId).html(content);
        	contentBlock.append(newRow);
		});

		// $("div.imagebox img").imgCenter({
  		//       	scaleToFit: false
  		//   	});
		$("div.imagebox img").fitImage();
		// ----------------------------------
		// выводим кнопку "показать дальше"
		newRow = $('<div/>').addClass('row').addClass('nav').attr('id', "nextButton");
		header = $('<div/>').addClass('header').appendTo(newRow);
		title = $('<div/>').addClass('titlerow');
		titleContent = $('<span/>').addClass('title').html("load more...");
		title.append(titleContent);
		header.append(title);
		// ---
		header.click(getMoreHeaders);
		// ---
		contentBlock.append(newRow);
	};

	function clickStarButton() {
		obs.pub('/toggleStarState', [
			[utils.articleId($(this))]
		]);
	};

	function clickShareButton() {
		obs.pub('/toggleShareState', [
			[utils.articleId($(this))]
		]);
	};

	function getMoreHeaders() {
		params.skip = $(".row", contentBlock).length - 1;
		console.log(_module + ': headers request to dataManager');
		obs.pub('/getHeaders', params);
	};

	function onHeaderClick(event) {
		row = $(event.currentTarget.parentElement.parentElement.parentElement);
		artId = utils.articleId(row);
		if (row.hasClass('current')) {
			console.log(_module + ': click on current article %d. Hiding.', artId);
			_hideArticle(row);
		} else {
			// ищем другие current и схлопываем
			$('.content', $('.current').removeClass('current')).remove();
			// ---
			row.addClass("current");
			console.log(_module + ': click on article %d. Loading.', artId);
			_displayArticle(artId);
		}
	};

	function _displayArticle(artId) {
		if (!multiSelect) {
				obs.pub('/newSelection', artId);
			};
		// ---
		article = dataManager.getArticle(artId);
		if (article == false) {
			// включаем индикатор
			// ...
		} else {
			if (artId == _currentId()) {
				_showArticle(article);
			} else {
				// выключаем индикатор
				// ...
			};

		};
	};

	function onCheckBoxChange() {
		var checked = this.checked;
		var chk_id = utils.articleId($(this));
		obs.pub(checked ? '/addSelection' : '/removeSelection', chk_id);
	};

	function _showArticle(article) {
		rowSelector = "#row-" + article.id;
		row = $(rowSelector);
		content = $('<div/>').addClass('content').html(article.content).appendTo(row);
		// scroll 2 top
		_scrollToTop(row);
		// mark as read
		if (article.unread) {
			obs.pub('/toggleReadState', [
				[utils.articleId(row)]
			]);
		};

	};

	function _hideArticle(row) {
		// удаляем контент
		$('.content', row).remove();
		row.removeClass('current');
	};

	function _scrollToTop(row) {
		contentBlock.scrollTo(row);
	}

	function _openCurrentLink() {
		row = _currentRow();
		href = $('a.article-link', row).first().attr('href');
		window.open(href, '_blank');
	}

	function _currentId() {
		currentRow = _currentRow();
		if (currentRow == 0) {
			return (0);
		} else {
			return (utils.articleId(currentRow));
		};
	};

	function _currentRow() {

		currentRow = $(".current", contentBlock);
		if (currentRow.length == 0) {
			return (0);
		} else {
			return (currentRow);
		}

	}




	// public
	// ------------------------------------------------------------
	return {
		connect: function(feedId) {
			obs.sub('/displayHeaders', this.displayHeaders);
			//obs.sub('/displayArticle', this.displayArticle);
			// ---
			// ...
			// ---
			console.log(_module + ': connected.');
			// ---
			contentBlock = $('#view');
			// ---
			this.activateFeed(feedId);
		},
		disconnect: function() {

		},
		activateFeed: function(feedId) {
			console.log(_module + ': activating feed %s', feedId);
			currentFeed = feedId;
			// очищаем всё что есть
			_clearHeaders();
			// индикатор загрузки
			// ...
			// запрашиваем заголовки
			params = {
				skip: 0,
				id: utils.id(currentFeed),
				isCategory: utils.isCategory(currentFeed),
				view_mode: 'adaptive',
				show_content: 1,
			};
			console.log(_module + ': headers request to dataManager');
			obs.pub('/getHeaders', params);
		},
		displayHeaders: function(event, seq) {
			_displayHeaders(event, seq);
		},
		displayArticle: function(event, artId) {
			_displayArticle(artId);
		}
	}

}());