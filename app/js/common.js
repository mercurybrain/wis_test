$(function () {

	var api = "https://api.github.com/repos/";
	var body;

	var commits = [];

	// Для создания элемента на нативном JS из HTML кода
	function createElementFromHTML(html) {
		var template = document.createElement('template');
		html = html.trim();
		template.innerHTML = html;
		return template.content.firstChild;
	}
	function loadData() {
		return new Promise((resolve, reject) => {
		  setTimeout(resolve, 2000);
		})
	  }

	function success(response) {
		document.querySelector('#commits').classList.remove('hidden');
		document.querySelector('.error').classList.add('hidden');
		response.json().then(function (json) {
			clearTable();
			commits = json;
			console.log(commits);
			// Добавление коммита в таблицу на нативном JS
			commits.forEach((item, i) => {
				let commit = document.createElement('tr');
				commit.appendChild(createElementFromHTML('<td>' + item.commit.author.name + '</td>'));
				commit.appendChild(createElementFromHTML('<td>' + new Date(item.commit.author.date).toLocaleString() + '</td>'));
				commit.appendChild(createElementFromHTML('<td>' + item.commit.message + '</td>'));
				commit.addEventListener("click", function(e) {
					let modalBody = document.querySelector('.modal-body');
					modalBody.innerHTML = '';
					if (item.author) {
						modalBody.appendChild(createElementFromHTML('<p>' + 'Имя автора: ' + '<a href=' + item.author.html_url + '>' + item.commit.author.name + '<img src='+item.author.avatar_url+'>'+'</a>'+'</p>'));
					} else {
						modalBody.appendChild(createElementFromHTML('<p>' + 'Имя автора: ' + item.commit.author.name + '</p>'));
					}
					modalBody.appendChild(createElementFromHTML('<p>' + 'Дата: ' + new Date(item.commit.author.date).toLocaleString() + '</p>'));
					if (item.committer) {
						modalBody.appendChild(createElementFromHTML('<p>' + 'Имя коммиттера: ' + '<a href=' + item.committer.html_url + '>' + item.commit.committer.name + '<img src='+item.committer.avatar_url+'>'+'</a>'+'</p>'));
					} else {
						modalBody.appendChild(createElementFromHTML('<p>' + 'Имя коммитера: ' + item.commit.committer.name + '</p>'));
					}
					modalBody.appendChild(createElementFromHTML('<p>' + 'Коммит на GitHub: ' + '<a href=' + item.html_url + '>' + item.html_url + '</a>'+'</p>'));
					modalBody.appendChild(createElementFromHTML('<p>' + 'Сообщение: ' + item.commit.message + '</p>'));
					$('#commitModal').modal('show');
				});
				body.appendChild(commit);
			})
			getPagination('#table-id');
		});
	}
	submitBtn.addEventListener("click", async function (e) {
		e.preventDefault();
		let url = api + username.value + '/' + repo.value + '/commits';
		console.log(url);
		let preloaderEl = document.getElementById('preloader');
		preloaderEl.classList.remove('hidden');
		fetch(url).then(function (response) {
			if (response.ok) {
				success(response);
				loadData()
				.then(() => {
					preloaderEl.classList.add('hidden');
				});
			} else {
				document.querySelector('.error').classList.remove('hidden');
				document.querySelector('#commits').classList.add('hidden');
				loadData()
				.then(() => {
					preloaderEl.classList.add('hidden');
				});
			}
		});
	});

	function clearTable() {
		body = document.querySelector('#table-id tbody');
		let headers = document.querySelector('.headers');
		body.innerHTML = '';
		body.appendChild(headers);
	}

	function getPagination(table) {

		var lastPage = 1;

		$('#maxRows').on('change', function (evt) {
			//$('.paginationprev').html('');						// reset 
			lastPage = 1;
			$('.pagination').find("li").slice(1, -1).remove();
			var trnum = 0; // reset tr
			var maxRows = parseInt($(this).val()); // узнать максимальное кол-во строк для отображения

			if (maxRows == 5000) {
				$('.pagination').hide();
			} else {
				$('.pagination').show();
			}

			var totalRows = $(table + ' tbody tr:not(:first-child)').length; // число строк
			$(table + ' tr:gt(0)').each(function () { // каждая строка в таблице без заголовков
				trnum++;
				if (trnum > maxRows) {
					$(this).hide();
				}
				if (trnum <= maxRows) {
					$(this).show();
				}
			});
			if (totalRows >= maxRows) {
				var pagenum = Math.ceil(totalRows / maxRows);  
				//	кол-во страниц
				for (var i = 1; i <= pagenum;) { // добавить номер на каждую страницу
					$('.pagination #prev').before('<li data-page="' + i + '">\
								      <span>' + i++ + '<span class="sr-only">(current)</span></span>\
								    </li>').show();
				}
			}
			$('.pagination [data-page="1"]').addClass('active'); 
			$('.pagination li').on('click', function (evt) {
				evt.stopImmediatePropagation();
				evt.preventDefault();
				var pageNum = $(this).attr('data-page'); // номер страницы

				var maxRows = parseInt($('#maxRows').val());

				if (pageNum == "prev") {
					if (lastPage == 1) {
						return;
					}
					pageNum = --lastPage;
				}
				if (pageNum == "next") {
					if (lastPage == ($('.pagination li').length - 2)) {
						return;
					}
					pageNum = ++lastPage;
				}

				lastPage = pageNum;
				var trIndex = 0;
				$('.pagination li').removeClass('active');
				$('.pagination [data-page="' + lastPage + '"]').addClass('active');
				// $(this).addClass('active');					
				$(table + ' tr:gt(0)').each(function () {
					trIndex++;
					
					if (trIndex > (maxRows * pageNum) || trIndex <= ((maxRows * pageNum) - maxRows)) {
						$(this).hide();
					} else {
						$(this).show();
					}
				});
			});

		}).val(5).change();

		// КОНЕЦ ПАГИНАЦИИ
	}
});
