
function getPowerOfTwo(value, pow) {
	var pow = pow || 1;
	while(pow<value) {
		pow *= 2;
	}
	return pow;
}

function measureText(ctx, textToMeasure) {
	return ctx.measureText(textToMeasure).width;
}

function createMultilineText(ctx, textToWrite, maxWidth, text) {
	textToWrite = textToWrite.replace("\n"," ");
	var currentText = textToWrite;
	var futureText;
	var subWidth = 0;
	var maxLineWidth = 0;

	var wordArray = textToWrite.split(" ");
	var wordsInCurrent, wordArrayLength;
	wordsInCurrent = wordArrayLength = wordArray.length;

	while (measureText(ctx, currentText) > maxWidth && wordsInCurrent > 1) {
		wordsInCurrent--;
		var linebreak = false;

		currentText = futureText = "";
		for(var i = 0; i < wordArrayLength; i++) {
			if (i < wordsInCurrent) {
				currentText += wordArray[i];
				if (i+1 < wordsInCurrent) { currentText += " "; }
			}
			else {
				futureText += wordArray[i];
				if( i+1 < wordArrayLength) { futureText += " "; }
			}
		}
	}
	text.push(currentText);
	maxLineWidth = measureText(ctx, currentText);

	if(futureText) {
		subWidth = createMultilineText(ctx, futureText, maxWidth, text);
		if (subWidth > maxLineWidth) {
			maxLineWidth = subWidth;
		}
	}

	return maxLineWidth;
}

function drawText() {
	var canvasX, canvasY;
	var textX, textY;

	var text = [];
	var textToWrite = document.getElementById('text').value;

	var maxWidth = parseInt(document.getElementById('maxWidth').value, 10);

	var squareTexture = document.getElementById('squareTexture').checked;

	var textHeight = document.getElementById('textSize').value;
	var textAlignment = document.getElementById('textAlignment').value;
	var textColour = document.getElementById('textColour').value;
	var fontFamily = document.getElementById('fontFamily').value;

	var backgroundColour = document.getElementById('backgroundColour').value;

	var canvas = document.getElementById('textureCanvas');
	var ctx = canvas.getContext('2d');

	ctx.font = textHeight+"px "+fontFamily;
	if (maxWidth && measureText(ctx, textToWrite) > maxWidth ) {
		maxWidth = createMultilineText(ctx, textToWrite, maxWidth, text);
		canvasX = getPowerOfTwo(maxWidth);
	} else {
		text.push(textToWrite);
		canvasX = getPowerOfTwo(ctx.measureText(textToWrite).width);
	}
	canvasY = getPowerOfTwo(textHeight*(text.length+1));
	if(squareTexture) {
		(canvasX > canvasY) ? canvasY = canvasX : canvasX = canvasY;
	}
	document.getElementById('calculatedWidth').value = canvasX;
	document.getElementById('calculatedHeight').value = canvasY;

	canvas.width = canvasX;
	canvas.height = canvasY;

	switch(textAlignment) {
		case "left":
			textX = 0;
			break;
		case "center":
			textX = canvasX/2;
			break;
		case "right":
			textX = canvasX;
			break;
	}
	textY = canvasY/2;

	ctx.fillStyle = backgroundColour;
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	ctx.fillStyle = textColour;
	ctx.textAlign = textAlignment;

	ctx.textBaseline = 'middle'; // top, middle, bottom
	ctx.font = textHeight+"px "+fontFamily;

	var offset = (canvasY - textHeight*(text.length+1)) * 0.5;

	for(var i = 0; i < text.length; i++) {
		if(text.length > 1) {
			textY = (i+1)*textHeight + offset;
		}
		ctx.fillText(text[i], textX,  textY);
	}
}

drawText();
