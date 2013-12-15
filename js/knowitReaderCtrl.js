var indexModule = angular.module('myIndex', []);
var systemConfig;
var articleTypes;
var articleTypeMaps;
var screenHistory = new Array();
var currentScrren;
var screenList = ["listbydate","listbycategory","favoriters","advancesearch","listbykeyword"];
var disableSwipScrrens = ["searchResult","article","textInput",""];
var systemTime; //Server Date
var todayArticles = new Array();
var yesterdayArticles = new Array();
var pastArticles = new Array();
var todayArticlesNum = 0;
var yesterdayArticlesNum = 0;
var pastArticlesNum = 0;
var pieColors = ['rgb(200,50,0)','rgb(200,100,0)','rgb(200,150,0)','rgb(100,50,0)','rgb(50,0,0)','rgb(50,100,0)',
								 'rgb(50,150,0)','rgb(50,200,0)','rgb(150,200,0)','rgb(200,200,0)','rgb(200,200,50)','rgb(200,150,100)'];
var pieLabelMap = {"TYPE1":"Dev","TYPE2":"A&D","TYPE3":"P&P","TYPE4":"O&I","TYPE5":"EA"};


//test data
var testArticleMap = new Object();
//test data

	function copyHtml(){
		console.log($("#inputTextArea").html());
		copyToClipboard($("#inputTextArea").html());
		//window.clipboardData.setData('text', $("#inputTextArea").html());
	};
	function copyText(){
		console.log($("#inputTextArea").text());
		copyToClipboard($("#inputTextArea").text());
		//window.clipboardData.setData('text', $("#inputTextArea").text());		
	};



indexModule.directive('template1', function factory() {
	var directiveDefinitionObject = {
	templateUrl: 'templates/try.html', 
	restrict: 'E',
	replace: true};
	return directiveDefinitionObject;
	});
	console.log("directive try");

indexModule.directive('template2', function factory() {
	var directiveDefinitionObject = {
	templateUrl: 'templates/try2.html', 
	restrict: 'E',
	replace: true};
	return directiveDefinitionObject;
	});	
	console.log("directive try2");

indexModule.directive('listbydate', function factory() {
	var directiveDefinitionObject = {
	templateUrl: 'templates/list-by-date.html', 
	restrict: 'E',
	replace: true};
	return directiveDefinitionObject;
	});	
	
	console.log("directive listbydate");

//clipBoard
function copyToClipboard(txt) {
     if(window.clipboardData) {
             window.clipboardData.clearData();
             window.clipboardData.setData("Text", txt);
     } else if(navigator.userAgent.indexOf("Opera") != -1) {
          window.location = txt;
     } else if (window.netscape) {
          try {
               netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
          } catch (e) {
               alert("被浏览器拒绝！\n请在浏览器地址栏输入'about:config'并回车\n然后将'signed.applets.codebase_principal_support'设置为'true'");
          }
          var clip = Components.classes['@mozilla.org/widget/clipboard;1'].createInstance(Components.interfaces.nsIClipboard);
          if (!clip)
               return;
          var trans = Components.classes['@mozilla.org/widget/transferable;1'].createInstance(Components.interfaces.nsITransferable);
          if (!trans)
               return;
          trans.addDataFlavor('text/unicode');
          var str = new Object();
          var len = new Object();
          var str = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
          var copytext = txt;
          str.data = copytext;
          trans.setTransferData("text/unicode",str,copytext.length*2);
          var clipid = Components.interfaces.nsIClipboard;
          if (!clip)
               return false;
          clip.setData(trans,null,clipid.kGlobalClipboard);
          alert("复制成功！")
     }
}

function selectButton(screenID)
{
	console.log("screenID ["+screenID+"]");
	for(btnScreenID in screenList){
		console.log("btnScreenID ["+btnScreenID+"]");
		if(screenList[btnScreenID] == screenID){
			$(".ui-icon-bycategory").css("background","url('img/btn_by_category"+(screenID=="listbycategory"?"_selected":"")+".png') no-repeat 0 0");
			$(".ui-icon-bydate").css("background","url('img/btn_by_date"+(screenID=="listbydate"?"_selected":"")+".png') no-repeat 0 0");
			$(".ui-icon-bykey").css("background","url('img/btn_by_key"+(screenID=="listbykeyword"?"_selected":"")+".png') no-repeat 0 0");
			$(".ui-icon-bysearch").css("background","url('img/btn_search"+(screenID=="advancesearch"?"_selected":"")+".png') no-repeat 0 0");
			$(".ui-icon-favorite").css("background","url('img/btn_favorite"+(screenID=="favoriters"?"_selected":"")+".png') no-repeat 0 0");
		}
	}
}

	
function knowitReaderCtrl( $scope, $http ) {
	$scope.inputTextChange=function (){
		console.log("inputTextChange");
		$scope.inputText = $("#inputTextArea").text();
		$scope.inputHtml = $("#inputTextArea").html();
	};
	
	
	//get system configuration
	function requestSystemConfig(callLater){
		$http.get('data/system.json').success(function(data) {
			onSystemConfigLoaded(data);		
			drawpie();
			articleTypeMaps = new Object();
			for(typeitemid in articleTypes){
				articleTypeMaps[articleTypes[typeitemid].typeID] = articleTypes[typeitemid].typeLabel;			
			}
			$scope.articleTypes = articleTypes;
			console.log("articleTypeMaps :" + articleTypeMaps);
			
			var todayDate = new Date(systemTime.getTime());
			var yesterdayDate = new Date(systemTime.getTime()-24*3600*1000);
			var pastDate = new Date(systemTime.getTime()-2*24*3600*1000);
			$scope.todayStr = "Today - " + todayDate.format("MMM dd, yyyy hh:mm:ss");
			$scope.yesterdayStr = "Yesterday - " + yesterdayDate.format("MMM dd, yyyy");
			$scope.pastStr = "Past - before " + pastDate.format("MMM dd, yyyy");
			if(callLater!=undefined)callLater();
		});			
	}	
	////////////////////////////
	// request for list by date
	////////////////////////////
	function requestArticlesInfo(){	
		$http.get('data/articles.json').success(function(data) {
			$scope.articles = processArticleList(data.articleList);	
			$scope.todayArticles = todayArticles;
			$scope.yesterdayArticles = yesterdayArticles;
			$scope.pastArticles = pastArticles;
			$scope.todayArticlesNum = todayArticlesNum;
			$scope.yesterdayArticlesNum = yesterdayArticlesNum;
			$scope.pastArticlesNum = pastArticlesNum;
	
		});	
	}
	////////////////////////////
	// request for advance search
	////////////////////////////
	function requestSearchInfo(){	
		$http.get('data/articles.json').success(function(data) {
			$scope.articles = processArticleList(data.articleList);
			$scope.searchResultNum = $scope.articles.length;		
		});	
	}
	////////////////////////////
	// request for like list
	////////////////////////////
	function requestLikeInfo(articleID){
		var likeURL = 'data/like/'+articleID+'.json';
		console.log("requestLikeInfo("+articleID+") "+likeURL);	
		$http.get(likeURL).success(function(data) {
			$scope.whosLike = data.whos;	
			for(idnum in $scope.whosLike){
				$scope.whosLike[idnum].bg = idnum%2==0?"#f0b080":"#f0f0f0";
				$scope.whosLike[idnum].timeString = new Date($scope.whosLike[idnum].time).format("hh:mm MMM dd, yyyy");
			}
		});	
	}
	////////////////////////////
	// request for comments
	////////////////////////////
	function requestComments(articleID){
		var commentsURL = 'data/comments/'+articleID+'.json';
		console.log("requestComments("+articleID+") "+commentsURL);	
		$http.get(commentsURL).success(function(data) {
			$scope.comments = data.comments;	
			for(idnum in $scope.comments){
				console.log("content "+$scope.comments[idnum].content);
				$scope.comments[idnum].bg = idnum%2==0?"#f0b080":"#f0f0f0";
				$scope.comments[idnum].timeString = new Date($scope.comments[idnum].time).format("hh:mm MMM dd, yyyy");
			}
		});	
	}

	////////////////////////////
	// request for category
	////////////////////////////
	function requestInfoByCategory(typeID){	
		$http.get('data/articles.json').success(function(data) {			
			$scope.articles = new Array();
			var tempList = processArticleList(data.articleList);
			var i=0;
			for(articleid in tempList){
				if(tempList[articleid]["type"] == typeID){
					if((i++ % 2)==0){
						tempList[articleid]["bg"] = "#f0f0f0";
					}else{
						tempList[articleid]["bg"] = "#f0b080";
					}	
					$scope.articles.push(tempList[articleid]);
				}			
			}
			console.log("requestInfoByCategory ["+$scope.articles.length+"]");			
			$scope.searchResultNum = $scope.articles.length;		
		});	
	}
	
	////////////////////////////
	// request for favorite
	////////////////////////////
	function requestInfoForFavorite(){	
		$http.get('data/articles.json').success(function(data) {			
			$scope.articles = new Array();
			var tempList = processArticleList(data.articleList);
			var i=0;
			for(articleid in tempList){
				//for test
				if(testArticleMap[tempList[articleid].articleId]!=undefined)
					tempList[articleid]["isFavorite"] = testArticleMap[tempList[articleid].articleId].isFavorite;
				//for test
				if(tempList[articleid]["isFavorite"] == "true"){
					if((i++ % 2)==0){
						tempList[articleid]["bg"] = "#f0f0f0";
					}else{
						tempList[articleid]["bg"] = "#f0b080";
					}						
					$scope.articles.push(tempList[articleid]);
				}				
			}
			console.log("requestInfoForFavorite ["+$scope.articles.length+"]");			
			$scope.favoriteNum = $scope.articles.length;		
		});	
	}	
	
	////////////////////////////
	// request for advance search
	////////////////////////////
	function requestSearchInfo(){	
		$http.get('data/articles.json').success(function(data) {
			$scope.articles = processArticleList(data.articleList);
			$scope.searchResultNum = $scope.articles.length;		
		});	
	}	
	
	////////////////////////////
	// request for keywords
	////////////////////////////
	function requestKeywordsInfo(){	
		$http.get('data/keywords.json').success(function(data) {
			console.log("got keywords info "+data);
			$scope.keywords = processKeywords(data.keywords);	
		});	
	}
	
	requestSystemConfig(requestArticlesInfo);
		
	//$scope.articles=[{"articleId":"00002","title":"Dropbox Now Can Hold Structured Data with Datastore API","author":"Abel Avram","source":"http://www.infoq.com","created":"20130710","type":"Database", "content":"<p>Almost four years aff gjtj . <p>" },{"articleId":"00002","title":"Dropbox Now Can Hold Structured Data with Datastore API","author":"Abel Avram","source":"http://www.infoq.com","created":"20130710","type":"Database", "content":"<p>Almost four years aff gjtj . <p>" }]

	//default
	currentScrren = "listbydate";
	$scope.showon=currentScrren;
	selectButton(currentScrren);
	
	$scope.gotoSearchResult = function(typeStr, gobackKey) {
		//$scope.showon="searchResult";		
		$scope.clicktype = "from ["+gobackKey+"] typeStr: "+ typeStr;
		console.log("from ["+gobackKey+"] typeStr", typeStr);
  };
  

	/////////////////////////////////////////////////
	//go back
	/////////////////////////////////////////////////
	$scope.goback = function() {
				
		console.log("screenHistory.length", screenHistory.length);
		if(screenHistory.length > 0){
			currentScrren = screenHistory.pop();
			$scope.showon=currentScrren;
			selectButton(currentScrren);
		}
		console.log("$scope.showon", $scope.showon);
  };

	/////////////////////////////////////////////////
	//list by date
	/////////////////////////////////////////////////
	$scope.gotoListByDate = function() {	
		requestSystemConfig(requestArticlesInfo);	
		screenHistory.push($scope.showon);
		currentScrren = "listbydate";
		$scope.showon=currentScrren;
		selectButton(currentScrren);
		console.log("$scope.showon", $scope.showon);
  };  

	/////////////////////////////////////////////////
	//list by category
	/////////////////////////////////////////////////
	$scope.gotoListByCategory = function() {	
		requestSystemConfig();	
		screenHistory.push($scope.showon);
		currentScrren = "listbycategory";
		$scope.showon=currentScrren;
		selectButton(currentScrren);
		console.log("$scope.showon", $scope.showon);
  };   

	/////////////////////////////////////////////////
	//list by favorit
	/////////////////////////////////////////////////
	$scope.gotoFavoriters = function() {	
		requestSystemConfig(requestInfoForFavorite);
		screenHistory.push($scope.showon);
		currentScrren = "favoriters";
		$scope.showon=currentScrren;
		selectButton(currentScrren);
		console.log("$scope.showon", $scope.showon);
  };  

	/////////////////////////////////////////////////
	//advance search
	/////////////////////////////////////////////////
	$scope.gotoAdvanceSearch = function() {		
		screenHistory.push($scope.showon);
		currentScrren = "advancesearch";
		$scope.showon=currentScrren;
		selectButton(currentScrren);
		console.log("$scope.showon", $scope.showon);
  };  

	/////////////////////////////////////////////////
	//list by keyword
	/////////////////////////////////////////////////
	$scope.gotoListBykeyword = function() {
		requestKeywordsInfo();		
		screenHistory.push($scope.showon);
		currentScrren = "listbykeyword";
		$scope.showon=currentScrren;
		selectButton(currentScrren);
		console.log("$scope.showon", $scope.showon);
  }; 

	/////////////////////////////////////////////////
	//goto search result
	/////////////////////////////////////////////////
	$scope.gotoSearchResult = function() {		
		screenHistory.push($scope.showon);
		currentScrren = "searchResult";
		$scope.showon=currentScrren;
		console.log("$scope.showon", $scope.showon);
  };     
  
 	/////////////////////////////////////////////////
	//goto Article Screen
	/////////////////////////////////////////////////
	$scope.gotoArticleScreen = function(articleID, author, fromSource, created, category, isFavorite, likeNum, commentNum) {	
		var loadurl = 'data/ar/'+articleID+'.json';
		console.log('load '+loadurl);
		$http.get(loadurl).success(function(data) {
			console.log('loaded '+data);
			$scope.article = processArticle(data, articleID, author, fromSource, created, category, isFavorite, likeNum, commentNum);			
			$("#pagecontenthtml").html($scope.article.content);
			console.log('title '+$scope.article.title);
			screenHistory.push($scope.showon);
			currentScrren = "article";
			$scope.showon = currentScrren;
			console.log("$scope.showon", $scope.showon);	
		});						
  };  
  
 	/////////////////////////////////////////////////
	//goto text input Screen
	/////////////////////////////////////////////////
	$scope.gotoTextInputScreen = function() {	
		/*html2canvas(document.body, {
    	onrendered: function(canvas) {
    			//console.log("canvas ", canvas);
    		//document.getElementById("inputTextArea").innerHTML = "";
    var w = window.innerWidth;
    var h = window.innerHeight-55;
    console.log("w["+w+"] h["+h+"]");
    var context = document.getElementById("pageImage").getContext('2d');
    document.getElementById("pageImage").width = w;
    document.getElementById("pageImage").height = h;
    context.putImageData(canvas.getContext('2d').getImageData(0,0,w,h), 0, 0);
    document.getElementById("pageImage").className = "moveLeft";
    document.getElementById("pageImage").style.visibility="hidden";*/
		screenHistory.push($scope.showon);
		currentScrren = "textInput";
		$scope.showon = currentScrren;
		console.log("$scope.showon", $scope.showon);
    /*	}
    });	*/
  };  
  
	/////////////////////////////////////////////////
	//start advance search
	/////////////////////////////////////////////////
	$scope.startSearch = function() {			
		requestSystemConfig(requestSearchInfo);
		$scope.gotoSearchResult();		
  };
  
	/////////////////////////////////////////////////
	//drill down category
	/////////////////////////////////////////////////
	$scope.drillDownCategory = function(typeID) {			
		console.log("drillDownCategory("+typeID+")");
		requestInfoByCategory(typeID);
		$scope.gotoSearchResult();		
  };  
  
	//refresh
	$scope.refreshPage = function() {		
  };  
  
 	/////////////////////////////////////////////////
	//change favorite
	/////////////////////////////////////////////////
  $scope.clickOnFavorite = function() {
		if($scope.article.isFavorite=="true")$scope.article.isFavorite = "false";
		else $scope.article.isFavorite = "true";
				
		//to do: submit to server		
		testArticleMap[$scope.article.articleId] = $scope.article;

  };
  
 	/////////////////////////////////////////////////
	//goto Who Like It
	/////////////////////////////////////////////////
  $scope.clickOnWhoLikeIt = function() {
  	console.log("clickOnWhoLikeIt()");		
  	requestLikeInfo($scope.article.articleId);
		screenHistory.push($scope.showon);
		currentScrren = "wholikeit";
		$scope.showon = currentScrren;
  };  
  
 	/////////////////////////////////////////////////
	//goto Who Like It
	/////////////////////////////////////////////////
  $scope.clickOnComments = function() {
  	console.log("clickOnComments()");		
  	requestComments($scope.article.articleId);
		screenHistory.push($scope.showon);
		currentScrren = "comments";
		$scope.showon = currentScrren;
  };  

	
	
  document.getElementById("pie").onclick = function (e)
    {
        var src = (document.all ? event.srcElement : e.target);
    
        // The RGraph object constructors add __object__ to the canvas.
        var myPie = src.__object__;
       
        console.log("myPie.angles ["+myPie.angles+"] myPie.data ["+myPie.data+"]");
        console.log("getSegment ["+myPie.getSegment(e)+"]");
        $scope.clicktype = articleTypes[myPie.getSegment(e)[5]]["typeLabel"];
        $scope.drillDownCategory(articleTypes[myPie.getSegment(e)[5]]["typeID"]);           
    }

    
//Action
////////////////////////**
$(document).bind("mobileinit", function(){
    $.event.special.swipeleft.horizontalDistanceThreshold ("200px");
    $.event.special.swiperight.horizontalDistanceThreshold ("200px");
});
				function isDisableToSwip()
				{
					for(screenId in disableSwipScrrens){
						if(currentScrren==disableSwipScrrens[screenId])return true;
					}
					return true;
				}
				function swipePage(upOrDown){
					if(isDisableToSwip()) return;
					var evt = document.createEvent("MouseEvent");
					evt.initEvent("click",true,true); 
          var target = document.getElementById("goto_"+nextSceen($scope.showon, upOrDown)).dispatchEvent(evt);	
				}
           $(document).ready(function(){
                  $("#mainPage").bind("swipeleft", function(){               
										swipePage("up");
                  })
                  $("#mainPage").bind("swiperight", function(){                      
										swipePage("down");
                  })
                $(document).ready(function(){
                    $(".tap-hold-test").bind("taphold", function(event) {
                        $(this).html("Tapped and held");
                    });
                    $(".tap-hold-test").bind("swipe", function(event) {
                        $(this).html("swipe");
                        $.mobile.changePage("#holdPopUp", "slideup");
                    });
                });
            });
} 

function nextSceen(currentScreenStr, upOrDown)
{
	var currId = 0;
	for(itemid=0; itemid<screenList.length; itemid++){		
		if(screenList[itemid] == currentScreenStr)
		{
			if(upOrDown=="up")
			{
				currId = itemid+1;
			}
			if(upOrDown=="down")
			{
				currId = itemid-1;
			}
			if(currId>=screenList.length){currId=0;}
			if(currId<0){currId=screenList.length-1;}
			break;
		}
	}
	return screenList[currId];
}

function processArticle( articleObject, articleId, author, fromSource, created, categoryId, isFavorite, likeNum, commentNum )
{	
	console.log("created ["+created+"]");
	console.log("articleId ["+articleId+"]");
	var article = new Object();
	article["articleId"] = articleId;
	article["author"] = author;
	article["fromSource"] = fromSource;
	article["created"] = created;
	article["createdTimeString"] = (new Date(Number(created))).format("MMM dd, yyyy");
	article["categoryId"] = categoryId;
	article["isFavorite"] = isFavorite;
	article["likeNum"] = likeNum;
	article["commentNum"] = commentNum;
	article["categoryString"] = articleTypeMaps[categoryId];
	article["categoryImg"] = "img/type_"+categoryId+".PNG";
	article["title"] = articleObject["title"];
	article["content"] = articleObject["content"];
	article["comments"] = articleObject["comments"];
	
	return article;
}

//////////////////////////////////////
// convert article data to display data, besides, generate todayArticles, yesterdayArticles, pastArticles and the numbers.
//////////////////////////////////////
function processArticleList( articles )
{	
	var displayList = new Array();

		articles.sort(function(a,b){
		if(a.created == b.created)return 0;
		if(a.created > b.created)return -1;
		if(a.created < b.created)return 1;
		});
	
	var todayDate = systemTime.getTime();
	var yesterdayDate = systemTime.getTime()-24*3600*1000;	
	
	todayArticles = new Array();
	yesterdayArticles = new Array();
	pastArticles = new Array();
	todayArticlesNum = 0;
	yesterdayArticlesNum = 0;
	pastArticlesNum = 0;

	function isTheSameDay(day1, day2){
		return (new Date(day1).toDateString() == new Date(day2).toDateString());
	}
	function formatDateString(valueDate){
		return (new Date(day1).toDateString() == new Date(day2).toDateString());
	}		
			
	for(articleid in articles)
	{
		//console.log("articles["+articleid+"]", articles[articleid]);
		displayList[articleid] = new Object();
		displayList[articleid]["articleId"] = articles[articleid]["articleId"];
		displayList[articleid]["title"] = articles[articleid]["title"];
		displayList[articleid]["leading"] = articles[articleid]["leading"];		
		displayList[articleid]["author"] = articles[articleid]["author"];
		displayList[articleid]["source"] = articles[articleid]["source"];
		displayList[articleid]["created"] = articles[articleid]["created"];
		displayList[articleid]["isFavorite"] = articles[articleid]["isFavorite"];
		displayList[articleid]["likeNum"] = articles[articleid]["likeNum"];
		displayList[articleid]["commentNum"] = articles[articleid]["commentNum"];		
		displayList[articleid]["createdDateString"] = new Date(articles[articleid]["created"]).format("MMM dd, yyyy");
		displayList[articleid]["createdTimeString"] = new Date(articles[articleid]["created"]).format("hh:mm");
		displayList[articleid]["type"] = articles[articleid]["type"];
		displayList[articleid]["typeString"] = articleTypeMaps[articles[articleid]["type"]];
		displayList[articleid]["typeImg"] = "img/type_"+articles[articleid]["type"]+".PNG";
				
		if(isTheSameDay(todayDate, displayList[articleid]["created"])){
			todayArticles.push(displayList[articleid]);
			todayArticlesNum++;
		}else if(isTheSameDay(yesterdayDate, displayList[articleid]["created"])){
			yesterdayArticles.push(displayList[articleid]);
			yesterdayArticlesNum++;
		}else{ //past
			pastArticles.push(displayList[articleid]);
			pastArticlesNum++;
		}
		
		if((articleid % 2)==0){
			displayList[articleid]["bg"] = "#f0f0f0";
		}else{
			displayList[articleid]["bg"] = "#f0b080";
		}

		//console.log("displayList["+articleid+"]", displayList[articleid]);
	}
	return displayList;
}
//////////////////////////////////////
// convert Keywords data to display data.
//////////////////////////////////////
function processKeywords( keywords )
{
	console.log("keywords "+keywords.length);
	var displayList = new Array();
	var maxCount=0;
	for(keywordid in keywords)
	{		
		displayList[keywordid] = new Object();
		displayList[keywordid]["word"] = keywords[keywordid]["word"];
		displayList[keywordid]["count"] = keywords[keywordid]["count"];
		maxCount = maxCount<keywords[keywordid]["count"] ? keywords[keywordid]["count"]:maxCount;
		var h = ((Number)(Math.random()*359)).toFixed(0);
		var s = ((Number)(Math.random()*100)).toFixed(0)+"%";
		displayList[keywordid]["color"] = "hsl("+h+","+s+",25%)";
		displayList[keywordid]["backgroundColor"] = "hsl("+h+","+s+",75%)";
		displayList[keywordid]["boxShadowColor"] = "hsl("+h+",5%,75%)";
	}
	for(keywordid in displayList)
	{
		console.log("maxCount "+maxCount);
		displayList[keywordid]["fontSize"] = ((Number)(((20.0-10.0)/maxCount) * displayList[keywordid]["count"])+10).toFixed(0);
		displayList[keywordid]["radiusSize"] = ((Number)(((8.0-4.0)/maxCount) * displayList[keywordid]["count"])+4).toFixed(0);		
		console.log("word "+displayList[keywordid]["word"]);	
		console.log("count "+displayList[keywordid]["count"]);
		console.log("color "+displayList[keywordid]["color"]);
		console.log("backgroundColor "+displayList[keywordid]["backgroundColor"]);
		console.log("fontSize "+displayList[keywordid]["fontSize"]);
	}	
	return displayList;
}

/**
*funciont:    绘制饼状图
*/

function drawpie() {
		var labels = new Array();
    var canid = "pie";    
    var numdata = new Array();;
    var pie;
    
		document.getElementById("pie").getContext("2d").clearRect(0,0,1000,1000);
    for(var i=0; i<articleTypes.length; i++)
    {	
    	articleTypes[i].color = pieColors[i];
    	labels[i] = pieLabelMap[articleTypes[i]["typeID"]];
    	numdata[i] = articleTypes[i]["count"];    	
    	}
    	console.log(labels);
    	console.log(numdata);
    pie = new RGraph.Pie(canid,numdata);
    
    pie.Set('chart.labels',labels);
    //pie.Set('chart.key',key);
    pie.Set('chart.linewidth', 1);
    pie.Set('chart.stroke', 'white');
    pie.Set('chart.colors', pieColors);
    pie.Set('chart.exploded', 5);
    pie.Set('chart.gutter.left', 20); //设定坐标轴的位置
    pie.Set('chart.gutter.top', 50); //设定坐标轴的位置
    pie.Set('chart.shadow', true);
    pie.Set('chart.key.position.gutter.boxed', true); //图例样式，可以和其他几个图形对比差别
    pie.Set('chart.key.shadow.offsetx', 7);
    pie.Set('chart.key.shadow.offsety', 7);
   // pie.Set('chart.centerx',100); //设置饼状图中心 X 坐标
    pie.Draw();
};

function onSystemConfigLoaded(system) {
	systemConfig = system;
  articleTypes = system.articleType;
  systemTime = new Date(system.systemTimeMS);
  console.log("systemTime: ", systemTime.toLocaleDateString(), systemTime.toLocaleTimeString());
	};