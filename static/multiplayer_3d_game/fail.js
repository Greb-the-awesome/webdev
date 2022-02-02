/* I gave up on indexing and just used drawArrays instead */

function addPositions(pos) {
	/**
	 * addPositions(Array pos)
	 * adds values to the position buffer. (if there is no value in buffer already)
	 * also modifies the element array buffer.
	 * seperate points in pos must be seperate arrays like [[x, y, z], [x, y, z], [x, y, z]]
	*/


	// here we go...
	var toAdd = [];
	var ctr = 0;
	for (let i=0;i<pos.length;i++) {
		var p = pos[i];
		var alreadyFound = false;

		for (let j=0;j<_positions.length;j++) {
			_p = _positions[j];
			if ((p[0] == _p[0] && p[1] == _p[1] && p[2] == _p[2]) && !alreadyFound) {
				indexes.push(j);
				alreadyFound = true;
				console.log("already found");
			} else {ctr += 1;}
		}
		if (!alreadyFound) {
			toAdd.push(pos[i])
			//indexes.push(i + _positions.length - 1);
		}
	}
	console.log("toAdd = "+toAdd+" indexes = "+indexes+" _positions = "+_positions+" length = "+_positions.length);

	_positions = _positions.concat(toAdd);
	for (let i=0;i<_positions.length;i++) {
		positions.push(_positions[i]);
	}
	

	// positions = positions.concat(pos);
	// positionsIterLen = positions.length / 3;
	// for (let i=0;i<positionsIterLen;i++) {
	// 	indexes.push(positionsIterLen - i - 1);
	// }

	// console.log("new positions: "+positions+"\nnew indexes: "+indexes+"\npositions.length: "+positions.length);

	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.DYNAMIC_DRAW);

	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexes), gl.DYNAMIC_DRAW);
}