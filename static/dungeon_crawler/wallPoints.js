{
	let style = document.documentElement;
	let widthInc = style.clientWidth / 100;
	let wallPointsCompressed = [
		[10, 0, 480, 10],
		[0, 0, 10, 500],
		[10, 490, 480, 10],
		[490, 0, 10, 500]
	];

	// decompressor
	function decompress() {
		wallPointsCompressed.forEach((element, index) => {
			element.forEach((e, i) => {
				wallPointsCompressed[index][i] *= widthInc;
			});
		});
	}
	decompress();
	window.wallPoints = wallPointsCompressed;
}
