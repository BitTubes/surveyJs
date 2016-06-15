/* global JB */

// style.enum-q :  none, disc, circle, square, decimal, lower-roman, upper-roman, lower-latin, upper-latin, lower-greek, decimal-leading-zero
// type.visualize :  none, immediate, onnext
// type.counting : 0, false,
// item[i].type : radio, checkbox, textarea

$(function() {
	"use strict";
	var fontSize,
		questions,
		qconfig,
		p = {
			html : $("html"),
			answer : $("#answer"),
			question : $("#question"),
			next : $('#next'),
			finish : $('#finish'),
			end : $('#end')
		},
		body = document.body,
		defaultW = 720,
		defaultH = 405,
		questionsTotal,
		currentQuestion = 0;
	function execCom(passed) {
		var commands = qconfig["command-"+(passed?"passed":"failed")],
			command;
		for (var i = 0; i < commands.length; i++) {
			command = commands[i];
			switch(command["a"]) {
			case "post": // post results to url
				$.ajax({
					type: 'POST',
					url: command["p"],
					data: questions,
					async:true
				});
				break;
			case "pm": // postMessage
				window.parent.postMessage(command["p"],"*");
				break;
			case "url": // forward to url
				window.self.location.href = command["p"];
				break;
			case "rl": // reload form
				window.self.location.reload();
				break;
			}
		}
	}
	function loadQuestion(index) {
		var question = questions["item"][index],
			oks = "",
			okCounter=0,
			answers,
			answer = question["answer"];
		// console.log("loadQuestion",index, question);
		if(question["type"]=="textarea") {
			answers = '<li><label for="answer0">' + answer[0]["text"] + '</label><textarea name="q'+index+'" id="answer0"></textarea></li>';
		} else {
			answers = [];
			for (var i = 0; i < answer.length; i++) {
				if(answer[i]["ok"]) {
					okCounter++;
				}
				answers.push( '<li><input name="q'+index+'" id="answer'+i+'" type="' + question["type"] + '" value="1"><label for="answer'+i+'" class="'+(answer[i]["ok"]?"true":"false")+'">' + answer[i]["text"] + '</label></li>');
			}
			answers = answers.join("");
		}
		p.answer.html(answers);
		if(qconfig["okCounter"] && question["type"]=="checkbox" && okCounter) {
			oks = ' ('+okCounter+' richtige Antwort'+(okCounter>1?'en':'')+')';
		}
		p.question.html('<li>' + question["text"] + oks + '</li>');
		// console.log("loadQuestion");

		if(questionsTotal-1 == index) {
			p.next.css("display","none");
			p.finish.css("display","block");
		} else {
			p.next.css("display","block");
			p.finish.css("display","none");
		}
	}
	function saveAnswers() {
		var q = questions["item"][currentQuestion];
		for (var i = 0; i < q["answer"].length; i++) {
			q["answer"][i].user = p.answer.find("input").eq(i).is(':checked');
		}
	}
	function checkAnswers() {
		if(!qconfig["requireAnswer"]) {
			return true;
		}
		if(p.answer.find(":checked").length) {
			return true;
		} else {
			return false;
		}
	}
	function loadNextQuestion() {
		// console.log("loadNextQuestion");
		saveAnswers();
		p.html.removeClass("loadNext");
		if(qconfig["requireAnswer"]) {
			p.next.attr("disabled",true);
			p.finish.attr("disabled",true);
		}
		currentQuestion++;
		p.question.attr("start",currentQuestion+1);
		loadQuestion(currentQuestion);
	}
	function results() {
		var q,a,
			i,j,
			thisResult,
			totalResult = 0,
			percent;
		switch(qconfig["counting"]) {
		case "question":
			for (i = 0; i < questions["item"].length; i++) {
				q = questions["item"][i];
				thisResult = qconfig["pointsPerRight"];
				for (j = 0; j < q["answer"].length; j++) {
					a = q["answer"][j];
					if(a.user != a["ok"]) {
						thisResult = qconfig["pointsPerWrong"];
						break;
					}
				}
				totalResult += thisResult;
			}
			percent = Math.round(totalResult / i * 100, 1);
			break;
		case "answer":
			var maxPoints=0;
			for (i = 0; i < questions["item"].length; i++) {
				q = questions["item"][i];
				thisResult = 0;
				for (j = 0; j < q["answer"].length; j++) {
					a = q["answer"][j];
					if(a.user != a["ok"]) {
						thisResult += qconfig["pointsPerWrong"];
					} else if(a["ok"]) {
						thisResult += qconfig["pointsPerRight"];
					}
					if(a["ok"]) {
						maxPoints += qconfig["pointsPerRight"];
					}
				}
				if(qconfig["minPointsPerQ"]!==false) {
					thisResult = Math.max(qconfig["minPointsPerQ"], thisResult);
				}
				// console.log(q["text"],thisResult);
				totalResult += thisResult;
			}
			percent = Math.round(totalResult / maxPoints * 100, 1);
			break;
		}
		// console.warn("RESULT",percent, totalResult, maxPoints,qconfig["passedMin"] , percent,qconfig["passedMin"] <= percent);
		var passed = qconfig["passedMin"] <= percent;

		if(qconfig["showResult"]) {
			p.question.css({
				"list-style-type": "none",
				"padding-left": 0,
				"text-align": "center"
			});
			p.answer.css({
				"list-style-type": "none",
				"padding-left": 0,
				"text-align": "center"
			});
			p.question.html('<li class="result-' +(passed?'passed':'failed')+ '"></li>');
			p.answer.html('<li class="result">' +percent+ '%</li>');
			p.end.css("display","block")
			.on("click",execCom.bind(this,passed));
		} else {
			p.question.css("display","none");
			p.answer.css("display","none");
			execCom(passed);
		}
	}
	function loadFinish() {
		// console.log("loadFinish");
		saveAnswers();
		p.html.removeClass("loadNext");
		// p.question.html("");
		// p.answer.html("");
		p.finish.css("display","none");
		// p.answer.css("display","none");
		// console.info("questions",questions);
		results();
	}


	function init(data){
		questions = data;
		// console.log("init");
		questionsTotal = questions["item"].length;
		qconfig = questions["config"];
		var qstyle = questions["style"];
		p.next.on("click",function () {
			if(qconfig["visualize"]=="onnext") {
				p.html.addClass("loadNext");
				window.setTimeout(loadNextQuestion,1000);					
			} else {
				loadNextQuestion();
			}
			// $('input').removeAttr("disabled")
			// .attr("checked", false)
			// .parent().removeClass("selected");
			// $("h1 > span").text( $("h1 > span").text()*1+1 );
		});
		p.finish.on("click",function () {
			if(qconfig["visualize"]=="onnext") {
				p.html.addClass("loadNext");
				window.setTimeout(loadFinish,1000);					
			} else {
				loadFinish();
			}
			// $('input').removeAttr("disabled")
			// .attr("checked", false)
			// .parent().removeClass("selected");
			// $("h1 > span").text( $("h1 > span").text()*1+1 );
		});

		if(qconfig["visualize"]=="immediate") {
			p.answer.on("change","input",function () {
				switch(questions["item"][currentQuestion]["type"]) {
				case "checkbox":
					$(this).attr("disabled", true);
					break;
				case "radio":
					p.answer.find("input").attr("disabled", true);
					break;
				}
			});
		}
		if(qconfig["requireAnswer"]) {
			p.answer.on("change","input",function () {
				if(checkAnswers()) {
					p.next.removeAttr("disabled");
					p.finish.removeAttr("disabled");
				} else {
					p.next.attr("disabled",true);
					p.finish.attr("disabled",true);
				}
			});

			p.next.attr("disabled",true);
			p.finish.attr("disabled",true);
		}
		if(qconfig["defaultW"]) {
			defaultW = qconfig["defaultW"];
		}
		if(qconfig["defaultH"]) {
			defaultH = qconfig["defaultH"];
		}
		$(window).on("resize",function() {
			fontSize = ( Math.min(p.html.width() / defaultW, p.html.height() / defaultH) * 100) + '%';
			// console.log(fontSize);
			body.style.fontSize = fontSize;
		}).trigger("resize");

		if(qstyle["external"]) {
			var link = document.createElement( "link" );
			link.href = qstyle["external"].split('"').join('');
			link.type = "text/css";
			link.rel = "stylesheet";
			document.getElementsByTagName( "head" )[0].appendChild( link );
		}

		// setup questionaire
		p.html.css("background",qstyle["background-html"]);
		p.question.css({
			"list-style-type": qstyle["enum-q"],
			"padding-left": (qstyle["enum-q"]=="none"?0:""),
			"font": qstyle["font-q"],
			"text-shadow": qstyle["shadow-q"]
		});
		p.answer.css({
			"list-style-type":qstyle["enum-a"],
			"font": qstyle["font-a"],
			"text-shadow": qstyle["shadow-q"]
		})
		.addClass(qconfig["visualize"]);

		p.html.css(qstyle["other-html"]);
		p.question.css(qstyle["other-q"]);
		p.answer.css(qstyle["other-a"]);

		// load first question
		loadQuestion(currentQuestion);
	}
	// var GET = (function() {
	// 	var url_vars = window.location.search.substr(1).split("&"),
	// 		i = url_vars.length,
	// 		url_var,
	// 		GET = [];
	// 	while(i--) {
	// 		url_var = url_vars[i].split("=");
	// 		GET[url_var[0]] = url_var[1]=="true" ? true : (url_var[1]=="false" ? false : url_var[1]);
	// 	}
	// 	return GET;
	// }());
	var GET = JB.GET;

	function clearString(str) {
		return str ? str.split("/").join("").split("\\").join("") : "";
	}
	if(GET) {
		var get = clearString(GET["id"]),
			api = clearString(GET["api"]),
			// url = "../static/"+api+"/survey/"+get+".json";
			url = "//dziv69g0bb69m.cloudfront.net/"+api+"/survey/"+get+".json";

		// if(GET["useCache"]) {
		// 	url = GET["metaDataCache"] + url;
		// }
		$.getJSON(url, init);
	}
});