var cheerio = require('cheerio');
var request = require('request');


var delegate = function(resultData){
	console.log(resultData);
}
var res = getPriceData('5652', {}, delegate);



function getPriceData(cardid, resultData, onSuccess){
	var url = 'http://www.svenskamagic.com/showcard.php?popup_id=' + cardid;
	request(url, function(err, resp, body){
		if(err)
			throw err;
		$ = cheerio.load(body);
		var salesPart = $('.rod');
		$ = cheerio.load(salesPart);
		$('*').each(function(index, value){
				var children = value['children'];
				for(var i=0; i<children.length; i++){
					// Attempts to find a price.
					var priceRegex = /([0-9]+)\:\- \(([0-9]+)st\.\)/
					var price = children[i]['data'];
					if(priceRegex.test(price)){
						// If the price regex is successful, adds it and the corresponding user to the result array.
						var regexResult = priceRegex.exec(price);
						var cardObj = {};
						cardObj['id'] = cardid;
						cardObj['price'] = regexResult[1];
						cardObj['amount'] = regexResult[2];
						var prev = children[i]['prev'];
						if(prev['name'] == 'b'){
							prev = prev['children'][0];
						}
						// prev is the a-tag.
						var userRegex = /ID\=([0-9]+).*/;
						var userId = userRegex.exec(prev['attribs']['href'])[1];
						if(resultData[userId] == undefined){
							resultData[userId] = [cardObj];
						}else{
							resultData[userId].push(cardObj);
						}
						//users.push(userRegex.exec(prev['attribs']['href'])[1]);
						//userObj['userId'] = userRegex.exec(prev['attribs']['href'])[1];
						//resultData.push(userObj);
					}
				}
			//}
		});
		onSuccess(resultData);
	});
}