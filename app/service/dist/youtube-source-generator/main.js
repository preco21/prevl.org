(function() {

var autoSaveFlag = false; // AutoSave Interval
var firstQueryFlag = true; // FirstQuery Flag

// 엔트리 포인트
$(function()
{
	// 툴팁 활성화
	$("[data-toggle='tooltip']").tooltip();

	// 체크박스 활성화
	$("input[type='checkbox']").bootstrapSwitch({
		size: "large",
		onColor: "info"
	});

	// 컬러피커 활성화
	$(".colorpickControl").colorpicker({
		color: "#000000"
	});

	// 컬러피커 Input Setup
	$("#background-color-input").val("#000000");

	// - Setting Proceed EventHandling - //

	var languageObjectList = [
		{
			lang: "자동",
			code: ""
		},
		{
			lang: "한국어",
			code: "ko"
		},
		{
			lang: "영어",
			code: "en"
		},
		{
			lang: "일본어",
			code: "ja"
		},
		{
			lang: "힌디어",
			code: "hi"
		},
		{
			lang: "독일어",
			code: "de"
		},
		{
			lang: "프랑스어",
			code: "fr"
		},
		{
			lang: "폴란드어",
			code: "pl"
		},
		{
			lang: "러시아어",
			code: "ru"
		},
		{
			lang: "중국어",
			code: "zh"
		},
		{
			lang: "라틴어",
			code: "la"
		},
		{
			lang: "덴마크어",
			code: "da"
		},
		{
			lang: "터키어",
			code: "tr"
		},
		{
			lang: "그리스어",
			code: "el"
		},
		{
			lang: "체코어",
			code: "cs"
		},
		{
			lang: "포르투갈어",
			code: "pt"
		},
		{
			lang: "헝가리어",
			code: "hu"
		},
		{
			lang: "스웨덴어",
			code: "sv"
		},
		{
			lang: "스페인어",
			code: "es"
		},
		{
			lang: "아랍어",
			code: "ar"
		},
		{
			lang: "히브리어",
			code: "he"
		}
	]; // 언어 코드 Lookup Table

	var videoResolutionList = [
		{
			videoQuality: "자동",
			qualityCode: "auto"
		},
		{
			videoQuality: "240p",
			qualityCode: "light"
		},
		{
			videoQuality: "360p",
			qualityCode: "medium"
		},
		{
			videoQuality: "480p",
			qualityCode: "large"
		},
		{
			videoQuality: "720p (HD)",
			qualityCode: "hd720"
		},
		{
			videoQuality: "1080p (HD)",
			qualityCode: "hd1080"
		}
	]; // video Quality Lookup Table

	var autohidingSet = [
		{
			set: "컨트롤 자동숨김",
			value: "1"
		},
		{
			set: "컨트롤 숨기지않음",
			value: "0"
		},
		{
			set: "진행바만 보임",
			value: "2"
		}
	]; // auto Hiding Set Table

	var videoSizePresets = [
		{
			sizeString: "자동",
			value: "auto"
		},
		{
			sizeString: "420 x 315",
			value: "[420, 315]"
		},
		{
			sizeString: "480 x 360",
			value: "[480, 360]"
		},
		{
			sizeString: "640 x 360",
			value: "[640, 360]"
		},
		{
			sizeString: "640 x 480",
			value: "[640, 480]"
		},
		{
			sizeString: "854 x 480",
			value: "[854, 480]"
		},
		{
			sizeString: "960 x 540",
			value: "[960, 540]"
		},
		{
			sizeString: "960 x 720",
			value: "[960, 720]"
		},
		{
			sizeString: "위젯용 비디오 사이즈",
			value: "[170, 25]"
		},
		{
			sizeString: "직접입력",
			value: "input"
		}
	]; // video Size Lookup Table

	// 언어코드 정렬
	languageObjectList.sort(function(a, b)
	{
		var aCode = a.code.toLowerCase();
		var bCode = b.code.toLowerCase();

		return ((aCode < bCode) ? -1 : ((aCode > bCode) ? 1 : 0));
	});

	// 언어코드 Select 초기화
	for (var i = 0; i < languageObjectList.length; i++)
	{
		$("#caption-language-select").append($("<option></option>").attr("value", languageObjectList[i].code).text(languageObjectList[i].lang));
	}

	// videoQuality Select 초기화
	for (var i = 0; i < videoResolutionList.length; i++)
	{
		$("#video-resolution-select").append($("<option></option>").attr("value", videoResolutionList[i].qualityCode).text(videoResolutionList[i].videoQuality));
	}

	// 자동숨김 초기화
	for (var i = 0; i < autohidingSet.length; i++)
	{
		$("#control-bar-mode-select").append($("<option></option>").attr("value", autohidingSet[i].value).text(autohidingSet[i].set));
	}

	// video Size Select 초기화
	for (var i = 0; i < videoSizePresets.length; i++)
	{
		$("#size-select").append($("<option></option>").attr("value", videoSizePresets[i].value).text(videoSizePresets[i].sizeString));
	}

	// size-select 초기값
	$("#size-select").prop("selectedIndex", 0);

	// 자동저장 Handler
	$("#auto-save-settings-check").on("switchChange.bootstrapSwitch", function(event, state)
	{
		autoSaveFlag = state;
		saveSetting();
	});

	// 설정저장 버튼 Handler
	$("#save-setting-button").click(function()
	{
		saveSetting();
	});

	$("#reset-setting-button").click(function()
	{
		resetSetting();
	});

	// 셋팅 초기화
	initSetting();

	// - Initialize EventHandling - //

	// set Numberinput Restrict Only Number
	$("input[type='number']").on("keydown paste", function(event)
	{
        if ($.inArray(event.keyCode, [46, 8, 9, 27, 13, 110, 190]) != -1 ||
		   (event.ctrlKey && event.keyCode == 65) ||
		   (event.keyCode >= 35 && event.keyCode <= 39))
			return;

        if ((event.shiftKey || (event.keyCode < 48 || event.keyCode > 57)) && (event.keyCode < 96 || event.keyCode > 105))
            event.preventDefault();
	});

	// iframe / object Sourcecode Area Presets
	$("#iframe-source-code-textarea, #object-source-code-textarea").click(function()
	{
		$(this).select();
	})
	.on("keydown paste", function(event)
	{
		if (event.ctrlKey && event.keyCode == 67)
			return;

		event.preventDefault();
	});

	// 폼 필드 체크 및 초기화
	checkFormField();

	// 폼 업데이트 Checking 시작
	startCheckFormUpdate();
});

// video 소스제작 함수
function makeVideoEmbedSource()
{
	var inputGroup = getInputDomElements(); // 즉각적인 InputElements
	var settingGroup = getSettingDomElements(); // 저장될 수 있는 InputElements
	var iframeSource = $("<iframe type=\"text/html\" allowtransparency=\"true\" frameborder=\"0\"></iframe>"); // iframe Output 데이터
	var objectSource = $("<object></object>"); // object Output 데이터
	var previewSource = $("<iframe type=\"text/html\" allowtransparency=\"true\" frameborder=\"0\"></iframe>"); // preview Output 데이터

	// processed Input Data
	var baseId = "", baseQuery = "?", baseProtocol = "http://", basePage = "youtube.com"; // input Data
	var baseWidth = 0, baseHeight = 0; // video Frame Size
	var baseUrl = inputGroup.linkInput.val().trim();

	// URL - 빈 문자열과 공백 처리
	if (!baseUrl)
	{
		setSameSourceCode("동영상 URL을 입력해주세요");
		clearPreviewArea();
		return;
	}

	var baseUrlFilter = new RegExp("^(https?:\/\/)?(www\.)?(m\.)?((youtube\.com\/watch[?]v=)|(youtu\.be\/))?[a-zA-Z0-9_-]{11}$");
	var filterExp = new RegExp("(https?:\/\/)?(www\.)?(m\.)?((youtube\.com\/watch[?]v=)|(youtu\.be\/))?");

	if (baseUrlFilter.test(baseUrl))
		baseId = baseUrl.replace(filterExp, "");
	else
	{
		setSameSourceCode("동영상 URL이 유효하지 않습니다 확인해주세요");
		clearPreviewArea();
		return;
	}

	// Width / Height - Select 처리
	switch (inputGroup.sizeSelect.val())
	{
		case "auto":
			baseWidth = "100%";
			baseHeight = "100%";

			iframeSource.wrap("<div style=\"position:relative;padding-bottom:56.25%;height:0px\"></div>");
			iframeSource.css({
				position: "absolute",
				top: "0px",
				left: "0px"
			});
			break;

		case "input":
			baseWidth = inputGroup.widthSizeInput.val() ;
			baseHeight = inputGroup.heightSizeInput.val();

			baseWidth = baseWidth || 0;
			baseHeight = baseHeight || 0;
			break;

		default:
			var sizeData = JSON.parse(inputGroup.sizeSelect.val());

			baseWidth = sizeData[0];
			baseHeight = sizeData[1];
	}

	var settingFullStringTable = {
		bottomControlBarCheck: "controls",
		recommendVideoShowCheck: "rel"
	};

	var settingStringTable = {
		useCaptionCheck: "cc_load_policy",
		turnOffKeyboardControlCheck: "disablekb",
		useHtml5PlayerCheck: "html5",
		hideYoutubeButtonCheck: "modestbranding"
	};

	var reverseSettingStringTable = {
		hideFullscreenButtonCheck: "fs",
		topInfoBarHideCheck: "showinfo"
	};

	firstQueryFlag = true;

	baseQuery += makeQueryByBoolean("autoplay", settingGroup.autoPlayCheck.bootstrapSwitch("state"));
	baseQuery += makeQueryByString("color", !settingGroup.progressBarCheck.bootstrapSwitch("state") ? "white" : "");
	baseQuery += makeQueryByString("theme", settingGroup.useLightThemeCheck.bootstrapSwitch("state") ? "light" : "");
	baseQuery += makeQueryByString("iv_load_policy", !settingGroup.useIVCheck.bootstrapSwitch("state") ? "3" : "");

	for (var i in settingFullStringTable)
		baseQuery += makeQueryByBoolean(settingFullStringTable[i], settingGroup[i].bootstrapSwitch("state"), false, true);

	for (var i in settingStringTable)
		baseQuery += makeQueryByBoolean(settingStringTable[i], settingGroup[i].bootstrapSwitch("state"));

	for (var i in reverseSettingStringTable)
		baseQuery += makeQueryByBoolean(reverseSettingStringTable[i], settingGroup[i].bootstrapSwitch("state"), true);

	if (settingGroup.videoResolutionSelect.val() != "auto")
		baseQuery += makeQueryByString("vq", settingGroup.videoResolutionSelect.val());

	if (settingGroup.bottomControlBarCheck.bootstrapSwitch("state"))
		baseQuery += makeQueryByString("autohide", settingGroup.controlBarModeSelect.val());

	if (settingGroup.backgroundColorInput.val().trim())
	{
		var temp = settingGroup.backgroundColorInput.val().trim();

		if (temp != "#000000")
		{
			iframeSource.add(previewSource).css("background-color", temp);
			baseQuery += makeQueryByString("bgcolor", temp.replace("#", ""));
		}
	}

	if (settingGroup.useCaptionCheck.bootstrapSwitch("state"))
		baseQuery += makeQueryByString("cc_lang_pref", settingGroup.captionLanguageSelect.val());

	if (inputGroup.videoPlayListTextArea.val().trim())
	{
		var listQueryString = "";
		var workList = inputGroup.videoPlayListTextArea.val().trim().split("\n");

		for (var i = 0; i < workList.length; i++)
			listQueryString += workList[i].replace(filterExp, "") + ",";

		listQueryString = listQueryString.slice(0, -1);

		baseQuery += makeQueryByString("playlist", listQueryString);
	}

	var videoStartMin = +inputGroup.videoStartMinInput.val(), videoStartSec = +inputGroup.videoStartSecInput.val();

	if (videoStartMin != 0 || videoStartSec != 0)
		baseQuery += makeQueryByString("start", videoStartMin * 60 + videoStartSec);

	if (settingGroup.useHTTPSCheck.bootstrapSwitch("state"))
		baseProtocol = "https://";

	if (settingGroup.useSecurityReinforcementCheck.bootstrapSwitch("state"))
		basePage = "youtube-nocookie.com";

	// - Make Output String - //

	iframeSource.add(objectSource).attr({
		width: baseWidth,
		height: baseHeight
	});

	var objectSourceUrl = baseProtocol + "www." + basePage + "/v/" + baseId + baseQuery + "&version=3";

	objectSource.append("<param name=\"movie\" value=\"" + objectSourceUrl + "\"></param>");
	objectSource.append("<param name=\"allowFullScreen\" value=\"true\"></param>");
	objectSource.append("<param name=\"allowscriptaccess\" value=\"always\"></param>");

	var embedObject = $("<embed></embed>");

	embedObject.attr({
		src: objectSourceUrl,
		type: "application/x-shockwave-flash",
		allowscriptaccess : "always",
		allowfullscreen: "true",
		width: baseWidth,
		height: baseHeight
	});

	if (inputGroup.sizeSelect.val() == "auto")
		objectSource.add(embedObject).attr({
			width: 560,
			height: 315
		});

	objectSource.append(embedObject);

	iframeSource.add(previewSource).attr("src", baseProtocol + "www." + basePage + "/embed/" + baseId + baseQuery);

	var iframeSourceStr = $("<div></div>").append(inputGroup.sizeSelect.val() != "auto" ? iframeSource.clone() : iframeSource.parent().clone()).html();
	var objectSourceStr = settingGroup.useHtml5PlayerCheck.bootstrapSwitch("state") ? "HTML5 플레이어를 사용할 경우 Object 소스코드는 사용할 수 없습니다" : $("<div></div>").append(objectSource.clone()).html();

	$("#preview-video-output").addClass("preview-output").html(previewSource);
	$("#iframe-source-code-textarea").val(iframeSourceStr);
	$("#object-source-code-textarea").val(objectSourceStr);
}

// boolean값으로 쿼리문자열 만들기
function makeQueryByBoolean(src, data, reverse, ignore)
{
	if (!data && !ignore)
		return "";

	reverse = reverse || false;
	ignore = ignore || false;
	var isFirst = false;

	if (firstQueryFlag)
	{
		isFirst = true;
		firstQueryFlag = false;
	}

	return (isFirst ? "" : "&") + src + "=" + stateToString(data, reverse);
}

// 쿼리문자열 만들기
function makeQueryByString(src, data)
{
	if (!data)
		return "";

	var isFirst = false;

	if (firstQueryFlag)
	{
		isFirst = true;
		firstQueryFlag = false;
	}

	return (isFirst ? "" : "&") + src + "=" + data;
}

// state를 숫자문자열로 변환
function stateToString(state, reverse)
{
	reverse = reverse || false;
	var stateSet = reverse ? !state : state;

	return stateSet ? "1" : "0";
}

// 동영상 미리보기 클리어
function clearPreviewArea()
{
	$("#preview-video-output").removeClass("preview-output").html("<h1>미리보기 없음</h1>");
}

// 경고창 생성
function setSameSourceCode(string)
{
	$("#iframe-source-code-textarea, #object-source-code-textarea").val(string);
}

// 폼 필드 체크
function checkFormField()
{
	// 크기 지정 필드 초기화
	$(".size-input").prop("disabled", $("#size-select").val() != "input");

	// 하단 컨트롤바 state 초기화
	$("#control-bar-mode-select").prop("disabled", !$("#bottom-control-bar-checkbox").bootstrapSwitch("state"));

	// 자막설정 필드그룹 state 초기화
	$("#caption-language-select").prop("disabled", !$("#useCaptionCheck").bootstrapSwitch("state"));
}

// 폼 업데이트 핸들러
function formUpdateHandler()
{
	if (autoSaveFlag)
		saveSetting();

	checkFormField();
	makeVideoEmbedSource();
}

// Setting 초기화
function initSetting()
{
	var settingObject = getSettingObject();

	if (settingObject.autoSaveSettingsCheck)
		autoSaveFlag = true;

	workSettingDomElement(true);
}

// 폼 업데이트 체크
function startCheckFormUpdate()
{
	$(".form-control").not(".colorpickerElem").not("#iframe-source-code-textarea, #object-source-code-textarea").on("input propertychange paste click", function()
	{
		formUpdateHandler();
	});

	$(".colorpickControl").colorpicker().on("changeColor", function()
	{
		formUpdateHandler();
	});

	$("input[type='checkbox']").not("#auto-save-settings-check").on("switchChange.bootstrapSwitch", function()
	{
		setTimeout(function()
		{
		   formUpdateHandler();
		}, 400);
	});
}

// localStorage에 셋팅 데이터를 저장한다
function saveSetting()
{
	var settingValueObject = workSettingDomElement(false);
	setSettingObject(settingValueObject);
}

// setting 데이터를 초기화 한다
function resetSetting()
{
	var resetData = {
		autoPlayCheck: false,
		recommendVideoShowCheck: true,
		topInfoBarHideCheck: false,
		bottomControlBarCheck: true,
		useLightThemeCheck: false,
		useIVCheck: true,
		useCaptionCheck: false,
		turnOffKeyboardControlCheck: false,
		hideFullscreenButtonCheck: false,
		videoResolutionSelect: 0,
		useHtml5PlayerCheck: false,
		useSecurityReinforcementCheck: false,
		controlBarModeSelect: 1,
		backgroundColorInput: "#000000",
		progressBarCheck: true,
		captionLanguageSelect: 0,
		useHTTPSCheck: false,
		hideYoutubeButtonCheck: false
	};

	workSettingDomElement(true, resetData);
	setSettingObject(resetData);
	makeVideoEmbedSource();
}

// mode의 설정에 따라 domElement를 지정 또는 값을 가져오고 return함
function workSettingDomElement(mode, settingData)
{
	var settingDomElements = getSettingDomElements();
	var settingValue = mode ? null : {};

	settingData = (mode ? settingData || getSettingObject() : {});

	for (var i in settingDomElements)
	{
		if (settingDomElements[i].attr("type") == "checkbox")
		{
			if (mode)
				settingDomElements[i].bootstrapSwitch("state", settingData[i], true);
			else
				settingValue[i] = settingDomElements[i].bootstrapSwitch("state");
		}
		else if (settingDomElements[i].prop("tagName") == "SELECT")
		{
			if (mode)
			{
				if (settingData[i])
					settingDomElements[i].val(settingData[i]);
				else
					settingDomElements[i].prop("selectedIndex", 0);
			}
			else
				settingValue[i] = settingDomElements[i].val();
		}
		else if (settingDomElements[i].attr("type") == "text" && settingDomElements[i].hasClass("colorpickerElem"))
		{
			if (mode)
			{
				settingDomElements[i].val(settingData[i]);
				$("#colorpick-elem").colorpicker("setValue", settingData[i]);
			}
			else
				settingValue[i] = settingDomElements[i].val();
		}
	}

	if (!mode)
		return settingValue;
}

// input에 관련된 Dom을 로드한다
function getInputDomElements()
{
	var inputData = {
		linkInput: $("#link-input"),
		sizeSelect: $("#size-select"),
		widthSizeInput: $("#width-size-input"),
		heightSizeInput: $("#height-size-input"),
		videoStartMinInput: $("#video-start-min-input"),
		videoStartSecInput: $("#video-start-sec-input"),
		videoPlayListTextArea: $("#video-play-list-textarea")
	};

	return inputData;
}

// setting에 관련된 Dom을 로드한다
function getSettingDomElements()
{
	var settingData = {
		autoPlayCheck: $("#auto-play-checkbox"),
		recommendVideoShowCheck: $("#recommend-video-show-checkbox"),
		topInfoBarHideCheck: $("#top-info-bar-hide-checkbox"),
		bottomControlBarCheck: $("#bottom-control-bar-checkbox"),
		useLightThemeCheck: $("#use-light-theme-checkbox"),
		useIVCheck: $("#use-iv-checkbox"),
		useCaptionCheck: $("#use-caption-checkbox"),
		turnOffKeyboardControlCheck: $("#turn-off-keyboard-control-checkbox"),
		hideFullscreenButtonCheck: $("#hide-fullscreen-button-checkbox"),
		videoResolutionSelect: $("#video-resolution-select"),
		useHtml5PlayerCheck: $("#use-html5-player-checkbox"),
		useSecurityReinforcementCheck: $("#use-security-reinforcement-checkbox"),
		controlBarModeSelect: $("#control-bar-mode-select"),
		backgroundColorInput: $("#background-color-input"),
		progressBarCheck: $("#progress-bar-checkbox"),
		captionLanguageSelect: $("#caption-language-select"),
		useHTTPSCheck: $("#use-https-checkbox"),
		hideYoutubeButtonCheck: $("#hide-youtube-button-checkbox"),
		autoSaveSettingsCheck: $("#auto-save-settings-check")
	};

	return settingData;
}

// localStorage에서 Object를 로드한다
function getSettingObject()
{
	var settingObject = localStorage.getItem("preco_youtubeSourceGenerator");

	if (!settingObject)
	{
		settingObject = {};
		localStorage.setItem("preco_youtubeSourceGenerator", JSON.stringify(settingObject));
	}
	else
		settingObject = JSON.parse(settingObject);

	return settingObject;
}

// localStorage에 Object를 저장한다
function setSettingObject(data)
{
	localStorage.setItem("preco_youtubeSourceGenerator", JSON.stringify(data));
}

})();
