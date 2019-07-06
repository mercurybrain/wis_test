$(function() {

	var api = "https://api.github.com/repos/";

	var commits = [];

	submitBtn.addEventListener("click", async function(e) {
		e.preventDefault();
		let url = api + username.value + '/' + repo.value + '/commits';
		console.log(url);
		fetch(url).then(function(response) {
			response.json().then(function(json) {
			  commits = json;
			  console.log(commits);
			});
		});
	});

});
