$(function () {

	var api = "https://api.github.com/repos/";

	var commits = [];

	// Для создания элемента на нативном JS из HTML кода
	function createElementFromHTML(html) {
		var template = document.createElement('template');
		html = html.trim();
		template.innerHTML = html;
		return template.content.firstChild;
	}

	function success(response) {
		document.querySelector('.error').classList.add('hidden');
		response.json().then(function (json) {
			commits = json;
			console.log(commits);
			// Добавление коммита в таблицу на нативном JS
			commits.forEach((item, i) => {
				let commit = document.createElement('tr');
				commit.appendChild(createElementFromHTML('<td>' + item.commit.author.name + '</td>'));
				commit.appendChild(createElementFromHTML('<td>' + new Date(item.commit.author.date).toLocaleString() + '</td>'));
				commit.appendChild(createElementFromHTML('<td>' + item.commit.committer.name + '</td>'));
				commit.appendChild(createElementFromHTML('<td>' + item.commit.message + '</td>'));
				let body = document.querySelector('#table-id tbody');
				body.appendChild(commit);
			})
			getPagination('#table-id');
		});
	}

	submitBtn.addEventListener("click", async function (e) {
		e.preventDefault();
		let url = api + username.value + '/' + repo.value + '/commits';
		console.log(url);
		fetch(url).then(function (response) {
			if (response.ok) {
				success(response);
			} else {
				document.querySelector('.error').classList.remove('hidden');
			}
		});
	});

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

			var totalRows = $(table + ' tbody tr').length; // число строк
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
