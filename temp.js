<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8"/>
		<title>WebGL text using a Canvas Texture</title>
		<meta name="description" content="A guide to producing text in WebGL using a canvas element as a texture." />
		<meta name="keywords" content="webgl,html5,text,canvas,texture,javascript" />
		<meta name="author" content="Harry Jones" />
		<meta name="twitter:card" content="summary" />
		<meta name="twitter:site" content="@_delph" />
		<meta name="twitter:title" content="WebGL text using a Canvas Texture" />
		<meta name="twitter:description" content="A guide to producing text in WebGL using a canvas element as a texture." />

		<meta name="twitter:image" content="images/favicon_upscaled.png" />



    <link rel="icon" type="image/png" href="../images/favicon.png" />
		<link rel="stylesheet" href="../styles/delph.css" type="text/css" />

		<link rel="stylesheet" href="../styles/github.css" type="text/css" />
		<script src="../scripts/highlight.pack.js"></script>
		<script>hljs.initHighlightingOnLoad()</script>

	</head>
	<body>
		<header class="topper">
			<h1>
				<a href="/">delphic.me.uk</a>
				<a id="hamburger" onclick="Toggle.nav()">Navigate</a>
			</h1>
			<nav id="mainNav" class="toggledOff">
				<ul>

					<li><a href="../blog">Blog</a></li>
					<li><a href="../fury">Fury</a></li>

          <li><a href="../pixels">Pixels</a></li>
					<li class="active"><a href="../tutorials">Tutorials</a></li>
				</ul>
			</nav>
      <nav class="external">
        <ul>
          <li><a href="https://github.com/delphic">GitHub</a></li>
          <li><a href="https://bitbucket.org/delph">BitBucket</a></li>
          <li><a href="http://www.twitter.com/_delph/">Twitter</a></li>
        </ul>
      </nav>
			<script>
// Hey Harry, move this to an actual script file you nouce.
var Toggle = (function() {
	var displayed = false;
	var element = document.getElementById("mainNav");
	var toggleNav = function() {
		if (displayed) {
			element.className = "toggledOff";
		} else {
			element.className = "toggledOn;"
		}
		displayed = !displayed;
	};
	return { nav: toggleNav };
})();
			</script>
		</header>
		<div class="content">
			<h1>WebGL text using a Canvas Texture</h1>
<style>
canvas { margin: 1em 0; }
.canvasContainer canvas { border: 1px solid #333; }
.canvasContainer { max-width: 100%; overflow: auto; }
.canvasText .question { margin: 10px 0; font-family: monospace; overflow: hidden; }
.canvasText .question label { float: left; width: 200px; font-family: monospace; }
</style>
<p>Text and numbers are something that is very useful to render, it's very often both the easiest and best way of conveying information. WebGL does not have any in-build text rendering functions, based as it is on the OpenGL ES 2.0 specification. There are two straight-forward options available to us when we wish to render text, using HTML and overlaying it on top of the canvas or rendering the text as a texture within WebGL (it's also possible to render text usings shaders too).</p>
<p>If you're making a UI / menu system, it would be fairly crazy not use the HTML method as coupled with CSS that's one of it's main strengths. However if you want to have the text in the game world, a HUD or an interface that isn't going to take the user's full attention you will probably want to render the text in WebGL.</p>
<p><strong>Note:</strong> If you try overlaying a HUD written in HTML you will probably encounter issues when trying to click and drag on the canvas element, you will get the text cursor even if you've overridden it as described in my <a href="controlling-the-cursor">controlling the cursor article</a>.</p>
<!-- ^^ Is this still true? Maybe we should test it? It's been quite a while since ZeroG, 7 years -->
<p>For the purposes of this article I will assume you are familiar with the basics of WebGL, up to and including creating textures from images. If you are not familiar with the basics required to render textured 3D shapes you should review the first few lessons at <a href="http://learningwebgl.com/">LearningWebGL</a>.</p>
<p>There are three main, but fairly small, hurdles to rendering your text as a texture.</p>
<ul>
	<li>Drawing text with the canvas element</li>
	<li>Sizing the canvas/texture appropriately</li>
	<li>Binding the canvas to a WebGL texture</li>
</ul>
<p>I'll go through each of these and then at the bottom will have a <a href="#textureGenerator">texture generator</a> and a WebGL display of this texture.</p>
<h2>Drawing text using the canvas element</h2>
<p>There are plenty of tutorials on how to render text using the canvas element, and you can figure out most of it from the MDN's <a href="https://developer.mozilla.org/en/Drawing_text_using_a_canvas">drawing text using a canvas reference page</a>. I'm going to repeat the basics of what we need here for completeness, first we need a canvas element and to get it's 2D context.</p>
<pre><code>&lt;canvas id="textureCanvas"&gt;&lt;/canvas&gt;
&lt;script&gt;
	var canvas  document.getElementById('textureCanvas');
	var ctx = canvas.getContext('2d');

	// More code to go here!
&lt;/script&gt;
</code></pre>
<p>When it comes time to combine this with WebGL this should be a separate canvas to the one we are using for WebGL as it will be using a different context, but don't worry you can "display: none;" the canvas you are using for the texture with CSS and the method will still work.</p>
<p>Next we need to set up the properties of the text we wish to render, these include colour, size, font, alignment and vertical alignment, see the <a href="https://developer.mozilla.org/en/Drawing_text_using_a_canvas">MDN reference</a> for a full list of options and their descriptions, we'll stick the simple ones for now.</p>
<pre><code>var canvas  document.getElementById('textureCanvas');
var ctx = canvas.getContext('2d');

ctx.fillStyle = "#333333"; 	// This determines the text colour, it can take a hex value or rgba value (e.g. rgba(255,0,0,0.5))
ctx.textAlign = "center";	// This determines the alignment of text, e.g. left, center, right
ctx.textBaseline = "middle";	// This determines the baseline of the text, e.g. top, middle, bottom
ctx.font = "12px monospace";	// This determines the size of the text and the font family used</code></pre>
<p>Finally we render our text to the canvas, we provide an x and y coordinate (this is in pixels relative to the top-left of the canvas) at which to render the text. Where the text then appears relative to these coordinates is determined by the <code>textAlign</code> and <code>textBaseline</code> we specified. Baseline works as you expect and the baseline as specified is rendered at the y-coordinate. However <code>textAlign</code> is slightly more complex:</p>
<ul>
	<li>"left" or equivalent will cause the text to appear to the right of the specified x-coordinate</li>
	<li>"center" will cause the text to appear centered on the specified x-coordinate</li>
	<li>"right" or equivalent will cause the text to appear to the left of the specified x-coordinate</li>
</ul>
<p>So for left aligned text we would probably specify 0 as the x-coordinate, and the full canvas width as the x-coordinate for right aligned text. As we have chosen center aligned we will specify the middle of the canvas.</p>
<pre><code>ctx.fillText("HTML5 Rocks!", canvas.width/2, canvas.height/2);</code></pre>
<p>You can also give the text an outline using <code>ctx.strokeStyle</code>, <code>ctx.strokeText</code>, but we are not going to cover that for our texture generator.</p>
<h2>Sizing the canvas and multi-line text</h2>
<p>We need to ensure that the canvas is larger than the text we are rendering and for some implementations of WebGL textures are required to be a power of two. We'll start by automatically working out the size we need the for text rendered as a single line, then we will look at specifying a maximum width and spliting the text into multiple lines to be rendered. To do this we'll use the <code>measureText</code> function, this returns an object who's width property is the width in pixels of the text specified if drawn with the current settings. We also need a function to get the first power of 2 greater than or equal to this value.</p>
<pre><code>function getPowerOfTwo(value, pow) {
	var pow = pow || 1;
	while(pow&lt;value) {
		pow *= 2;
	}
	return pow;
}

var canvas = document.getElementById('textureCanvas');
var ctx = canvas.getContext('2d');
var textToWrite = "HTML5 Rocks!";
var textSize = 12;
ctx.font = textSize+"px monospace"; 	// Set the font of the text before measuring the width!
var canvas.width = getPowerOfTwo(ctx.measureText(textToWrite).width);
var canvas.height = getPowerOfTwo(2*textSize);

// Omitted: Set all properties of the text again (including font)

// Omitted: Draw the text</code></pre>
<p>I've omitted the code for setting the properties and drawing the text as it won't have <em>really</em> changed. As well as setting the width of the canvas to the first power of two greater than the width of the text, we've also set the height to the first power of two greater than twice the height of the text we'll be drawing (to allow space for larger characters and to ensure a bit of padding).</p>
<p><strong>Note</strong> that you must set the font property of the context a second time after measuring the text or you'll get the default font and size rendering our calculation inaccurate!</p>
<p>Now for the possiblity of splitting up long text into multiple lines. We'll do this by specifying a maximum width, and breaking the text into an array of words and compare the specified width to text constructed from a decreasing number of words from that array of words, then from that we can build up an array of text lines which are smaller than the maximum width. The function below does this, the array to write the lines of text to is passed as an argument so that the maximum width of the calculated lines can be returned, it also replaces any newline characters with a space, this is because the <code>drawText</code> function ignores them and we are using the position of spaces to create our array of words.</p>
<pre><code>function createMultilineText(ctx, textToWrite, maxWidth, text) {
	textToWrite = textToWrite.replace("\n"," ");
	var currentText = textToWrite;
	var futureText;
	var subWidth = 0;
	var maxLineWidth = 0;

	var wordArray = textToWrite.split(" ");
	var wordsInCurrent, wordArrayLength;
	wordsInCurrent = wordArrayLength = wordArray.length;

	// Reduce currentText until it is less than maxWidth or is a single word
	// futureText var keeps track of text not yet written to a text line
	while (measureText(ctx, currentText) &gt; maxWidth &amp;&amp; wordsInCurrent &gt; 1) {
		wordsInCurrent--;
		var linebreak = false;

		currentText = futureText = "";
		for(var i = 0; i &lt; wordArrayLength; i++) {
			if (i &lt; wordsInCurrent) {
				currentText += wordArray[i];
				if (i+1 &lt; wordsInCurrent) { currentText += " "; }
			}
			else {
				futureText += wordArray[i];
				if(i+1 &lt; wordArrayLength) { futureText += " "; }
			}
		}
	}
	text.push(currentText); // Write this line of text to the array
	maxLineWidth = measureText(ctx, currentText);

	// If there is any text left to be written call the function again
	if(futureText) {
		subWidth = createMultilineText(ctx, futureText, maxWidth, text);
		if (subWidth &gt; maxLineWidth) {
			maxLineWidth = subWidth;
		}
	}

	// Return the maximum line width
	return maxLineWidth;
}</code></pre>
<p>The eagle eyed amoung you will have noticed that the maximum width can be greater than the maximum width specified, this will happen if a single word is greater than the maximum width (e.g. supercalifragilistic...), if you want to make sure that the maximum width specified truly is you'll have to further split words into characters. For now we'll just feed the maximum line width returned by the function into the calculation of the required canvas width.</p>
<p>Now we'll loop over the array to draw our text, splitting the text does complicate choosing the y-coordinate to draw each line at slightly, but it's just some relatively straight forward maths.</p>
<pre><code>// Omitted: helper functions

var text = [];
var textX, textY;
var textToWrite = "HTML5 Rocks! HTML5 Rocks! HTML5 Rocks!";
var textHeight = 32;
var maxWidth = 128;

// Omitted: Set up the canvas and get the context

ctx.font = textHeight + "px monospace";
maxWidth = createMultilineText(ctx, textToWrite, maxWidth, text);
canvasX = nextPowerOfTwo(maxWidth);
canvasY = nextPowerOfTwo(textHeight * (text.length + 1));

// Omitted: Set canvas width / height
// Omitted: Set text properties

textX = canvasX / 2;
var offset = (canvasY - textHeight*(text.length+1)) * 0.5;

for(var i = 0; i &lt; text.length; i++) {
	textY = (i + 1) * textHeight + offset;
	ctx.fillText(text[i], textX,  textY);
}</code></pre>
<h2>Creating the WebGL texture</h2>
<p>After all that creating the WebGL texture is relatively straight forward! When loading the texture one must simply pass the DOM object of the canvas where before one would pass the DOM object for the image. Then bind the created texture before rendering our object as normal using <code>gl.bindTexture(gl.TEXTURE_2D, canvasTexture);</code> where gl is the WebGL context.</p>
<pre><code>gl = canvas.getContext("webgl");
var canvasTexture;

function initTexture() {
    canvasTexture = gl.createTexture();
    handleLoadedTexture(canvasTexture, document.getElementById('textureCanvas'));
}

function handleLoadedTexture(texture, textureCanvas) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureCanvas); // This is the important line!
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);

    gl.bindTexture(gl.TEXTURE_2D, null);
}</code></pre>
<p>I have combined the above techniques with a quick web form to generate canvas textures and then display them on a cube in WebGL. There is also an option to enforce a square texture (as we're placing it on a cube). You can play around with it below, all the JavaScript is inline so if you view source you can see how it works, it still needs a bit of work to be able to be used in full project but it's a reasonable proof of concept.</p>
<div class="canvasText">
	<h3><a name="textureGenerator">Texture Generator</a></h3>
	<div class="question">
		<label>Show texture canvas</label>
		<input id="showTextureCanvas" type="checkbox" onchange="(this.checked) ? document.getElementById('textureCanvas').style.display = 'block' : document.getElementById('textureCanvas').style.display = 'none';" />
	</div>
	<div class="question">
		<label>Enforce square texture</label>
		<input id="squareTexture" type="checkbox" checked="checked"/>
	</div>
	<div class="question">
		<label>Calculated Dimensions</label>
		<input id="calculatedWidth" disabled="disabled" />
		<input id="calculatedHeight" disabled="disabled" />
	</div>
	<div class="question">
		<label>Text</label>
		<textarea id="text">HTML5 ROCKS!</textarea>
	</div>
	<div class="question">
		<label>Text size (px)</label>
		<input id="textSize" value="56" />
	</div>
	<div class="question">
		<label>Font Family</label>
		<input id="fontFamily" value="monospace" />
	</div>
	<div class="question">
		<label>Text colour</label>
		<input id="textColour" value="#333" />
	</div>
	<div class="question">
		<label>Text Alignment</label>
		<select id="textAlignment">
			<option value="left">Left</option>
			<option value="center" selected="selected">Centre</option>
			<option value="right">Right</option>
		</select>
	</div>
	<div class="question">
		<label>Maximum Text Width (px)</label>
		<input id="maxWidth" value="256"/>
	</div>
	<div class="question">
		<label>Background Colour</label>
		<input id="backgroundColour" value="#FFF" />
	</div>
	<input type="button" value="Draw Text" onclick="drawText(); initTexture();" />
	<div class="canvasContainer">
		<canvas id="textureCanvas" style="display: none;" width="256" height="256">I'm sorry your browser does not support the HTML5 canvas element.</canvas>
	</div>
	<!-- Texture Generation Script -->
	<script type="text/javascript">
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
	</script>
</div>
<div class="webglText">
	<canvas id="webglCanvas" style="border: 1px solid #000;" width="500" height="500"></canvas>
	<!-- WebGL Scripts -->
	<script type="text/javascript" src="../scripts/glMatrix-0.9.5.min.js"></script>
	<script type="text/javascript" src="../scripts/webgl-utils.js"></script>
	<script id="shader-fs" type="x-shader/x-fragment">
    precision mediump float;

    varying vec2 vTextureCoord;
    varying vec3 vLightWeighting;

    uniform sampler2D uSampler;

    void main(void) {
        vec4 textureColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
        gl_FragColor = vec4(textureColor.rgb * vLightWeighting, textureColor.a);
    }
	</script>
	<script id="shader-vs" type="x-shader/x-vertex">
    attribute vec3 aVertexPosition;
    attribute vec3 aVertexNormal;
    attribute vec2 aTextureCoord;

    uniform mat4 uMVMatrix;
    uniform mat4 uPMatrix;
    uniform mat3 uNMatrix;

    uniform vec3 uAmbientColor;

    uniform vec3 uLightingDirection;
    uniform vec3 uDirectionalColor;

    uniform bool uUseLighting;

    varying vec2 vTextureCoord;
    varying vec3 vLightWeighting;

    void main(void) {
        gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
        vTextureCoord = aTextureCoord;

        if (!uUseLighting) {
            vLightWeighting = vec3(1.0, 1.0, 1.0);
        } else {
            vec3 transformedNormal = uNMatrix * aVertexNormal;
            float directionalLightWeighting = max(dot(transformedNormal, uLightingDirection), 0.0);
            vLightWeighting = uAmbientColor + uDirectionalColor * directionalLightWeighting;
        }
    }
	</script>
	<script type="text/javascript">
    var gl;

    function initGL(canvas) {
        try {
            gl = canvas.getContext("webgl");
            gl.viewportWidth = canvas.width;
            gl.viewportHeight = canvas.height;
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
			gl.enable(gl.BLEND);
			gl.disable(gl.DEPTH_TEST);
        } catch (e) {
        }
        if (!gl) {
            alert("Could not initialise WebGL, sorry :-(");
        }
    }

    function getShader(gl, id) {
        var shaderScript = document.getElementById(id);
        if (!shaderScript) {
            return null;
        }

        var str = "";
        var k = shaderScript.firstChild;
        while (k) {
            if (k.nodeType == 3) {
                str += k.textContent;
            }
            k = k.nextSibling;
        }

        var shader;
        if (shaderScript.type == "x-shader/x-fragment") {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else if (shaderScript.type == "x-shader/x-vertex") {
            shader = gl.createShader(gl.VERTEX_SHADER);
        } else {
            return null;
        }

        gl.shaderSource(shader, str);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    }

    var shaderProgram;

    function initShaders() {
        var fragmentShader = getShader(gl, "shader-fs");
        var vertexShader = getShader(gl, "shader-vs");

        shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert("Could not initialise shaders");
        }

        gl.useProgram(shaderProgram);

        shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
        gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

        shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
        gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

        shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
        gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

        shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
        shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
        shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
        shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
        shaderProgram.useLightingUniform = gl.getUniformLocation(shaderProgram, "uUseLighting");
        shaderProgram.ambientColorUniform = gl.getUniformLocation(shaderProgram, "uAmbientColor");
        shaderProgram.lightingDirectionUniform = gl.getUniformLocation(shaderProgram, "uLightingDirection");
        shaderProgram.directionalColorUniform = gl.getUniformLocation(shaderProgram, "uDirectionalColor");
    }

    function handleLoadedTexture(texture, textureCanvas) {
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureCanvas);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);

        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    var canvasTexture;

    function initTexture() {
        canvasTexture = gl.createTexture();
        handleLoadedTexture(canvasTexture, document.getElementById('textureCanvas'));
    }

    var mvMatrix = mat4.create();
    var mvMatrixStack = [];
    var pMatrix = mat4.create();

    function mvPushMatrix() {
        var copy = mat4.create();
        mat4.set(mvMatrix, copy);
        mvMatrixStack.push(copy);
    }

    function mvPopMatrix() {
        if (mvMatrixStack.length == 0) {
            throw "Invalid popMatrix!";
        }
        mvMatrix = mvMatrixStack.pop();
    }

    function setMatrixUniforms() {
        gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
        gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);

        var normalMatrix = mat3.create();
        mat4.toInverseMat3(mvMatrix, normalMatrix);
        mat3.transpose(normalMatrix);
        gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);
    }

    function degToRad(degrees) {
        return degrees * Math.PI / 180;
    }

    var xRot = 0;
    var xSpeed = 10;

    var yRot = 0;
    var ySpeed = -10;

    var z = -5.0;

    var cubeVertexPositionBuffer;
    var cubeVertexNormalBuffer;
    var cubeVertexTextureCoordBuffer;
    var cubeVertexIndexBuffer;

    function initBuffers() {
        cubeVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
        vertices = [
            // Front face
            -1.0, -1.0,  1.0,
             1.0, -1.0,  1.0,
             1.0,  1.0,  1.0,
            -1.0,  1.0,  1.0,

            // Back face
            -1.0, -1.0, -1.0,
            -1.0,  1.0, -1.0,
             1.0,  1.0, -1.0,
             1.0, -1.0, -1.0,

            // Top face
            -1.0,  1.0, -1.0,
            -1.0,  1.0,  1.0,
             1.0,  1.0,  1.0,
             1.0,  1.0, -1.0,

            // Bottom face
            -1.0, -1.0, -1.0,
             1.0, -1.0, -1.0,
             1.0, -1.0,  1.0,
            -1.0, -1.0,  1.0,

            // Right face
             1.0, -1.0, -1.0,
             1.0,  1.0, -1.0,
             1.0,  1.0,  1.0,
             1.0, -1.0,  1.0,

            // Left face
            -1.0, -1.0, -1.0,
            -1.0, -1.0,  1.0,
            -1.0,  1.0,  1.0,
            -1.0,  1.0, -1.0,
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        cubeVertexPositionBuffer.itemSize = 3;
        cubeVertexPositionBuffer.numItems = 24;

        cubeVertexNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexNormalBuffer);
        var vertexNormals = [
            // Front face
             0.0,  0.0,  1.0,
             0.0,  0.0,  1.0,
             0.0,  0.0,  1.0,
             0.0,  0.0,  1.0,

            // Back face
             0.0,  0.0, -1.0,
             0.0,  0.0, -1.0,
             0.0,  0.0, -1.0,
             0.0,  0.0, -1.0,

            // Top face
             0.0,  1.0,  0.0,
             0.0,  1.0,  0.0,
             0.0,  1.0,  0.0,
             0.0,  1.0,  0.0,

            // Bottom face
             0.0, -1.0,  0.0,
             0.0, -1.0,  0.0,
             0.0, -1.0,  0.0,
             0.0, -1.0,  0.0,

            // Right face
             1.0,  0.0,  0.0,
             1.0,  0.0,  0.0,
             1.0,  0.0,  0.0,
             1.0,  0.0,  0.0,

            // Left face
            -1.0,  0.0,  0.0,
            -1.0,  0.0,  0.0,
            -1.0,  0.0,  0.0,
            -1.0,  0.0,  0.0
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW);
        cubeVertexNormalBuffer.itemSize = 3;
        cubeVertexNormalBuffer.numItems = 24;

        cubeVertexTextureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
        var textureCoords = [
            // Front face
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,

            // Back face
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
            0.0, 0.0,

            // Top face
            0.0, 1.0,
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,

            // Bottom face
            1.0, 1.0,
            0.0, 1.0,
            0.0, 0.0,
            1.0, 0.0,

            // Right face
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
            0.0, 0.0,

            // Left face
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
        cubeVertexTextureCoordBuffer.itemSize = 2;
        cubeVertexTextureCoordBuffer.numItems = 24;

        cubeVertexIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
        var cubeVertexIndices = [
            0, 1, 2,      0, 2, 3,    // Front face
            4, 5, 6,      4, 6, 7,    // Back face
            8, 9, 10,     8, 10, 11,  // Top face
            12, 13, 14,   12, 14, 15, // Bottom face
            16, 17, 18,   16, 18, 19, // Right face
            20, 21, 22,   20, 22, 23  // Left face
        ];
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
        cubeVertexIndexBuffer.itemSize = 1;
        cubeVertexIndexBuffer.numItems = 36;
    }

    function drawScene() {
        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

        mat4.identity(mvMatrix);

        mat4.translate(mvMatrix, [0.0, 0.0, z]);

        mat4.rotate(mvMatrix, degToRad(xRot), [1, 0, 0]);
        mat4.rotate(mvMatrix, degToRad(yRot), [0, 1, 0]);

        gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexNormalBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, cubeVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
        gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, cubeVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, canvasTexture);
        gl.uniform1i(shaderProgram.samplerUniform, 0);
        var lighting = true;
        gl.uniform1i(shaderProgram.useLightingUniform, lighting);
        if (lighting) {
            gl.uniform3f(shaderProgram.ambientColorUniform, 0.2, 0.2, 0.2);

            var lightingDirection = [ -0.25, -0.25, -1 ];
            var adjustedLD = vec3.create();
            vec3.normalize(lightingDirection, adjustedLD);
            vec3.scale(adjustedLD, -1);
            gl.uniform3fv(shaderProgram.lightingDirectionUniform, adjustedLD);
            gl.uniform3f(shaderProgram.directionalColorUniform, 0.8, 0.8, 0.8);
        }

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
        setMatrixUniforms();
        gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    }

    var lastTime = 0;

    function animate() {
        var timeNow = new Date().getTime();
        if (lastTime != 0) {
            var elapsed = timeNow - lastTime;

            xRot += (xSpeed * elapsed) / 1000.0;
            yRot += (ySpeed * elapsed) / 1000.0;
        }
        lastTime = timeNow;
    }


    function tick() {
        requestAnimFrame(tick);
        drawScene();
        animate();
    }


    function webGLStart() {
        var canvas = document.getElementById("webglCanvas");
        initGL(canvas);
        initShaders();
        initBuffers();
        initTexture();

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);

        tick();
    }

		webGLStart();
	</script>
	<p>I hope this tutorial was helpful! If you have any comments or feedback you can contact me via twitter <a href="http://www.twitter.com/_delph/">@_delph</a>.</p>
</div>

		</div>
	</body>
</html>
