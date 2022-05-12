function loadObj(text, offset=0) {
	var lst = text.split("\n");
	var verts = [];
	var idx = [];
	for (let i=0; i<lst.length; i++) {
		var line = lst[i];
		if (line.startsWith("v " )) {
			var a = line.split(" ");
			verts = verts.concat([parseFloat(a[1]), parseFloat(a[2]), parseFloat(a[3])]);
		} else if (line.startsWith("f")) {
			var a = line.slice(2, line.length).split(" ");
			var b = a.map(x=>{ return parseInt(x.split("/")[0])+offset; });
			if (a.length == 3) {
				idx = idx.concat(b);
			} else {
				idx = idx.concat([b[0], b[1], b[3], b[1], b[2], b[3]]);
			}
		}
	}
	return {"index": idx, "position": verts};
}