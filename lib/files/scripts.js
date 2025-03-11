var grid = [
	[ 	
		{group: "a", value: 1, visible: false, borders: "1101"},
		{group: "b", value: 2, visible: true, borders: "1001"}, 
		{group: "b", value: 3, visible: false, borders: "1100"}, 
		{group: "c", value: 2, visible: false, borders: "1011"}, 
		{group: "c", value: 1, visible: false, borders: "1110"}
	], [ 
		{group: "a", value: 3, visible: true, borders: "0101"}, 
		{group: "b", value: 5, visible: true, borders: "0011"}, 
		{group: "b", value: 1, visible: false, borders: "0010"}, 
		{group: "b", value: 4, visible: false, borders: "1110"}, 
		{group: "d", value: 5, visible: true, borders: "1101"}
	], [ 
		{group: "a", value: 2, visible: false, borders: "0111"}, 
		{group: "d", value: 4, visible: true, borders: "1011"}, 
		{group: "d", value: 2, visible: false, borders: "1010"}, 
		{group: "d", value: 3, visible: false, borders: "1010"}, 
		{group: "d", value: 1, visible: false, borders: "0110"}
	], [ 
		{group: "e", value: 1, visible: true, borders: "1001"}, 
		{group: "e", value: 3, visible: true, borders: "1100"}, 
		{group: "f", value: 1, visible: false, borders: "1011"}, 
		{group: "f", value: 4, visible: false, borders: "1000"}, 
		{group: "f", value: 5, visible: true, borders: "1100"}
	], [
	 	{group: "e", value: 4, visible: true, borders: "0011"}, 
		{group: "e", value: 2, visible: false, borders: "0010"}, 
		{group: "e", value: 5, visible: true, borders: "1110"}, 
		{group: "f", value: 3, visible: true, borders: "0011"}, 
		{group: "f", value: 2, visible: false, borders: "0110"}
	]
];

var colors = {
	"a": "#fff",
	"b": "#e0e0e0",
	"c": "#fff",
	"d": "#c0c0c0",
	"e": "#e0e0e0",
	"f": "#fff",

}

var actionsList = [];

$(document).ready(()=>{

	const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
	const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

	$(".square").each(function(){
		$(this).css("width", $(this)[0].getBoundingClientRect().height + "px");
	});

	loop(5, (j)=>{
		$("#g").append(`<div class='gr' row='${j}'></div>`);
		loop(5, (i)=>{
			if (grid[j][i].visible) {
				$("#g .gr:last-child").append(`<div group='${grid[j][i].group}' class='gc' row='${j}' col='${i}'>${grid[j][i].value}</div>`);
			} else {
				$("#g .gr:last-child").append(`<div group='${grid[j][i].group}' class='gc writeable' row='${j}' col='${i}'></div>`);
			}
			loop(4, (s)=>{
				if ( grid[j][i].borders[s] == "1" ) {
					$(`.gc[row='${j}'][col='${i}']`).addClass(`b-${s}`);
				}
			});
		});
	})

	$(".gc").on("mouseover", function(){
		$(this).addClass("hover");
	});

	$(".gc").on("mouseout", function(){
		$(this).removeClass("hover");
	});

	$(document).on('click', function(e){
		//console.log($(e.target).prop("tagName"))
		let target = e.target;
		if ( ! $(target).hasClass("gc") && $(target).prop("tagName") != "BUTTON" ) {
			$(".active-cell").removeClass("active-cell");
			$(".active-group").removeClass("active-group");
		}
		checkWin()
		viewLog()
	});

	$(".gc").on("click", function(){
		$(".active-cell").removeClass("active-cell");
		$(".active-group").removeClass("active-group");
		$(this).addClass("active-cell");
		$(`.gc[group="${$(this).attr("group")}"]`).addClass("active-group");
	});

	$(document).on("keydown", function(e){
		let key = e.key;
		writeToCell(key, "");
		checkWin()
		viewLog()
	});

	$('button').on("click", function(){
		let key = $(this).html();
		if (key == "Hint"){
			hint(0,0);
		} else if (key == "Assisted"){
			//hint(0,0);
		} else if (key == "Instructions"){
			//hint(0,0);
		} else if (key == "Restart"){
			//hint(0,0);
		} else if (key == "Undo"){
			undo()
		} else {
			writeToCell(-1, key);
		}
	});

});

function undo() {
	if (actionsList.length > 1) {
		let lastitem = actionsList.length - 1;
		$(`.gc[row='${actionsList[lastitem].row}'][col='${actionsList[lastitem].col}']`).html("");
		actionsList[lastitem].status = "undone";
	}
}

function viewLog() {
	$("#log").empty();
	for (let i = 0; i < actionsList.length; i++) {
		$("#log").append(`<li>${actionsList[i].keyValue} | ${actionsList[i].row} | ${actionsList[i].col} | ${actionsList[i].status}</li>`);
	}
}

function writeToCell(eKey = -1, eHtml = "") {
	let key = "";
	let logIt = false;
	if ( eKey != -1 ) {
		key = eKey;
	} else if ( eHtml != "" ) {
		key = eHtml
	}
	if (parseInt(key) > 0 && parseInt(key) < 6) {
		$(".writeable.active-cell").html(key);
		$(".writeable.active-cell").addClass("written");
		logIt = true;
	} else if (key == "Erase" || key == "Backspace" || key == "Delete") {
		if ( $(".writeable.active-cell").html().length > 0 ) {
			$(".writeable.active-cell").html("");
			$(".writeable.active-cell").removeClass("written");
			logIt = true;
		}
	}
	if ( logIt ) {
		actionsList.push({
			keyValue: key,
			row: $(".writeable.active-cell").attr("row"),
			col: $(".writeable.active-cell").attr("col"),
			status: "active"
		});
	}
	checkWin();
}

function checkWin(){
	let correct = 0;
	loop(5, (j)=>{
		loop(5, (i)=>{
			if ( grid[j][i].value == $(`.gc[row='${j}'][col='${i}']`).html() ) {
				correct += 1;
			}
		});
	});
	if ( correct == 25 ){
		alert("done!")
	}
}

function loop(num, callback){
	for (let i = 0; i < num; i++){
		callback(i);
	}
}

function hint(r, c){
	$(`.gc[row='${r}'][col='${c}']`).addClass("hint");
	$("#hint").append('<div class="alert alert-secondary" role="alert">This square can be resolved.</div>');
}