(function() {

var totalPickerArray = []; // 총 추첨자 배열
var pickedList = []; // 추첨후 배열
var alreadySaved = false; // 추첨 State

// 엔트리 포인트
$(function()
{
	// 리스트 로드
	loadPickerList();

	// 툴팁 활성화
	$("[data-toggle='tooltip']").tooltip();

	// 추첨자 추가 Handler
	$("#start-pickup-button").click(startPicking);
	$("#selector-input").keypress(addPickerHandler).focus();
	$("#add-target-button").click(addPickerHandler);

	// 추첨자 삭제 Handler
	$("#remove-all-picker-button").click(function()
	{
		removeAllPicker();
	});

	// 기록저장 Handler
	$("#get-saved-result-button").click(showSavedResultHandler);
	$("#save-result-button").click(function()
	{
		var pickerObject = getPickerObject();
		var tempArray = [];

		if (totalPickerArray.length <= 0 && pickedList.length <= 0)
			return false;

		for (var i = 0; i < pickedList.length; i++)
		{
			tempArray.push(totalPickerArray[pickedList[i]]);
		}

		if (alreadySaved)
		{
			addWarnToModal($("#result-modal-show"), "이미 저장했습니다");
			return false;
		}
		else
		{
			pickerObject.resultList.push(tempArray);
			localStorage.setItem("preco_randomPicker", JSON.stringify(pickerObject));
			alreadySaved = true;
			addWarnToModal($("#result-modal-show"), "성공적으로 저장되었습니다");
		}
	});
});

// 추첨자 추가 Handler
function addPickerHandler(event)
{
	if (event.type == "keypress")
		if (event.which != 13)
			return;

	var target = $("#selector-input");

	addPicker(target.val());
	target.val("");
}

// 결과를 저장하는 Handler
function showSavedResultHandler()
{
	var pickerObject = getPickerObject();
	var pickerResultList = pickerObject.resultList;

	var dom = "";

	if (pickerResultList.length != 0)
	{
		dom += '<ul class="list-group">';

		for (var i = 0; i < pickerResultList.length; i++)
		{
			dom += '<li class="list-group-item">';
			dom += '<button type="button" class="close pull-right" onclick="' + "removeResultListItem(" + i + ");" + '" aria-hidden="true">&times;</button>';
			dom += '<h4 class="list-group-item-heading">';
			dom += "SAVEDATA - " + (i + 1);
			dom += "</h4>";
			dom += '<p class="list-group-item-text">';

			for (var j = 0, len2 = pickerResultList[i].length; j < len2; j++)
			{
				dom += pickerResultList[i][j] + ((j == pickerResultList[i].length - 1) ? "" : ", ");
			}

			dom += "</p>";
			dom += "</li>";
		}

		dom += "</ul>";
		dom += '<button type="button" class="btn btn-warning btn-lg col-xs-12" onclick="removeAllResult();">모든 기록삭제</button>';
	}
	else
		dom += '<h1 class="text-center text-muted">저장된 기록이 없습니다</h1>';

	$("#load-result-modal-show").hide().html(dom).fadeIn();
	$("#addon-modal").modal("hide");
	$("#load-result-modal").modal("show");
}

// 추첨시작 Handler
function startPicking()
{
	var totalPickingInputValue = $("#total-picker-input").val();
	var excludeInputValue = $("#exclude-input").val();

	totalPickerArray = getPickerObject().list;

	// 리스트 검사
	if (totalPickerArray.length <= 0)
	{
		addWarnToModal($("#picking-modal-show"), "리스트가 비었습니다");
		return;
	}

	// 숫자유효성 검사
	if (!$.isNumeric(totalPickingInputValue))
	{
		addWarnToModal($("#picking-modal-show"), "총 추첨수에는 숫자만 와야합니다 (비어있어도 안됩니다)");
		return;
	}
	else if (totalPickingInputValue < 1)
	{
		addWarnToModal($("#picking-modal-show"), "총 추첨수는 0이상이여야 합니다");
		return;
	}

	var excludeList = [];

	// 제외 리스트 유효성 검사
	if (excludeInputValue)
	{
		excludeInputValue = excludeInputValue.trim();
		excludeList = excludeInputValue.split(",");

		if (excludeList.length >= totalPickerArray.length)
		{
			addWarnToModal($("#picking-modal-show"), "적어도 뽑힐 수 있는 Index 한개정도는 남겨둬야합니다");
			return;
		}

		for (var i = 0; i < excludeList.length; i++)
		{
			if (!$.isNumeric(excludeList[i]))
			{
				addWarnToModal($("#picking-modal-show"), "Index 목록을 형식에 맞게 써주세요 : " + excludeList[i]);
				return;
			}

			if (excludeList[i] < 1 || excludeList[i] > totalPickerArray.length)
			{
				addWarnToModal($("#picking-modal-show"), "Index 범위가 틀렸습니다 : " + excludeList[i]);
				return;
			}

			excludeList[i]--;
		}
	}

	// 최대 추첨수 검사
	if (totalPickingInputValue > totalPickerArray.length - excludeList.length)
	{
		addWarnToModal($("#picking-modal-show"), "최대 추첨수를 초과하였습니다 [리스트 - 제외리스트]의 크기를 넘으면 안됩니다");
		return false;
	}

	pickedList.length = 0;

	for (var i = 0; i < totalPickingInputValue; i++)
	{
		var randomInt = 0;

		var m = new MersenneTwister();

		do
			randomInt = Math.floor(m.random() * totalPickerArray.length);
		while (excludeList.indexOf(randomInt) != -1 || pickedList.indexOf(randomInt) != -1);

		pickedList.push(randomInt);
	}

	var dom = '<ul class="list-group">';

	for (var i = 0; i < pickedList.length; i++)
	{
		dom += '<li class="list-group-item">';
		dom += '<h4 class="list-group-item-heading">';
		dom += (pickedList[i] + 1) + " 번";
		dom += "</h4>";
		dom += '<p class="list-group-item-text">';
		dom += totalPickerArray[pickedList[i]];
		dom += "</p>";
		dom += "</li>";
	}

	dom += "</ul>";

	alreadySaved = false;

	$("#result-modal-show").html(dom);
	$("#picking-modal").modal("hide");
	$("#result-modal").modal("show");
}

// 추첨자 리스트 로드
function loadPickerList()
{
	var targetLoc = $("#picker-list");
	var pickerObject = getPickerObject();
	var totalPickerArray = pickerObject.list;

	var dom = "";

	if (totalPickerArray.length != 0)
	{
		dom = '<div class="row">';

		for (var i = 0; i < totalPickerArray.length; i++)
		{
			dom += '<div class="well well-sm col-xs-12 col-sm-3">';

			dom += '<h4 class="text-center">';
			dom += '<span class="badge pull-left">' + (i + 1) + "</span>";
			dom += '<button type="button" class="close pull-right" onclick="' + "removePicker(" + i + ");" + '" aria-hidden="true">&times;</button>';
			dom += totalPickerArray[i];
			dom += "</h4>";
			dom += "</div>";
		}

		dom += "</div>";
	}
	else
	{
		dom = "<h1 class=\"text-center text-muted\">리스트가 비었습니다</h1>";
	}

	targetLoc.hide();
	targetLoc.html(dom);
	targetLoc.fadeIn();
}

// 추첨자 추가
function addPicker(pickerName)
{
	pickerName = pickerName.trim();
	if (!pickerName)
		return;

	addPickerToList(pickerName);
	loadPickerList();
}

// localStorage에 추첨자 입력
function addPickerToList(pickerName)
{
	var pickerObject = getPickerObject();

	pickerObject.list.push(pickerName);
	localStorage.setItem("preco_randomPicker", JSON.stringify(pickerObject));
}

// 추첨자 삭제
function removePicker(index)
{
	deletePickerFromList(index);
	loadPickerList();
}

// 추첨자 모두 삭제
function removeAllPicker()
{
	var pickerObject = getPickerObject();

	pickerObject.list.length = 0;

	localStorage.setItem("preco_randomPicker", JSON.stringify(pickerObject));

	loadPickerList();
}

// 결과 모두 삭제
function removeAllResult()
{
	var pickerObject = getPickerObject();

	pickerObject.resultList.length = 0;

	localStorage.setItem("preco_randomPicker", JSON.stringify(pickerObject));
	showSavedResultHandler();
}

// 결과리스트에서 목록삭제
function removeResultListItem(index)
{
	var pickerObject = getPickerObject();

	pickerObject.resultList.splice(index, 1);
	localStorage.setItem("preco_randomPicker", JSON.stringify(pickerObject));
	showSavedResultHandler();
}

// 추첨자를 리스트에서 삭제
function deletePickerFromList(index)
{
	var pickerObject = getPickerObject();

	pickerObject.list.splice(index, 1);
	localStorage.setItem("preco_randomPicker", JSON.stringify(pickerObject));
}

// DOM에 경고 추가
function addWarnToModal(modal, warnText)
{
	modal.prepend("<div class=\"alert alert-warning alert-dismissable\">" +
				  "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-hidden=\"true\">&times;</button>" +
				  warnText + "</div>");
}

// localStorage에서 추첨자 리스트 가져오기
function getPickerObject()
{
	var pickerObject = localStorage.getItem("preco_randomPicker");

	if (!pickerObject)
	{
		pickerObject = {
			resultList: [],
			list: []
		};

		localStorage.setItem("preco_randomPicker", JSON.stringify(pickerObject));
	}
	else
	{
		pickerObject = JSON.parse(pickerObject);
	}

	return pickerObject;
}

window.removePicker = removePicker;
window.removeResultListItem = removeResultListItem;
window.removeAllResult = removeAllResult;

})();
