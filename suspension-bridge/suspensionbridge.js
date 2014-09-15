// $Id$
/*
 * Suspension bridge creator craftscript for Minecraft WorldEdit plugin
 * Copyright (C) 2014 Kevin W. Paulisse <http://www.paulisse.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

importPackage(Packages.com.sk89q.worldedit);
importPackage(Packages.com.sk89q.worldedit.blocks);

function getblock(material_input) {
	var colon_arr = material_input.toString().match(/^(\d+):(\d+)$/);
	if (colon_arr != null) {
		return new BaseBlock(parseInt(RegExp.$1), parseInt(RegExp.$2));
	}
	var integer_arr = material_input.toString().match(/^(\d+)$/);
	if (integer_arr != null) {
		return new BaseBlock(parseInt(RegExp.$1), 0x0);
	}
	context.error("Invalid material value '" + material_input + "'");
	return null;	
}

function suspension_bridge(pos, dir, args) {

	/*
	 * Define materials
	 */

	var AIR = BlockID.AIR;
	var BEDROCK = BlockID.BEDROCK;
	var COBBLESTONE = BlockID.COBBLESTONE;
	var STONE = BlockID.STONE;
	
	var materials = [];
	materials.push(['TOWER', BlockID.QUARTZ_BLOCK + ":2"]);
	materials.push(['TORCH', BlockID.TORCH]);
	materials.push(['XC', "44:7"]);
	materials.push(['GLOWSTONE', BlockID.LIGHTSTONE]);
	materials.push(['GLASS_BLOCK', BlockID.GLASS]);
	materials.push(['REDSTONE_TORCH', BlockID.REDSTONE_TORCH_ON]);
	materials.push(['SURFACE', BlockID.COBBLESTONE]);
	materials.push(['CT', BlockID.QUARTZ_BLOCK + ":2"]);
	materials.push(['CABLE', "35:8"]);
	materials.push(['WALL', BlockID.COBBLESTONE_WALL]);
	materials.push(['VERT', BlockID.FENCE]);
	
	for (var i = 0; i < materials.length; i++) {
		var k = getblock(materials[i][1]);
		if (materials[i][0] in args) {
			k = getblock(args[materials[i][0]]);
		}
		if (k == null) {
			context.error("Illegal value for " + args[materials[i][0]]);
			return null;
		}
		args["_" + materials[i][0]] = k;
	}
	
	if (!('tch' in args)) {
		args['tch'] = 8;
	}
	if (!('ccl' in args)) {
		args['ccl'] = 6;
	}
	if (!('tor' in args)) {
		args['tor'] = 0;
	}
	if (!('wall' in args)) {
		args['wall'] = 0;
	}
	if (!('wator' in args)) {
		args['wator'] = 0;
	}
	if (!('vcf' in args)) {
		args['vcf'] = 3;
	}

	/*
	 * Initialize the block changer
	 */
	var blocks = context.remember();

	/*
	 * Calculate movement vectors
	 */
	var vec = movement_vectors(dir);
	var moveLeft = vec['moveLeft'];
	var moveUp = vec['moveUp'];
	var moveForward = vec['moveForward'];
	var moveRight = vectorMultiply(moveLeft, -1);
	var moveDown = vectorMultiply(moveUp, -1);
	var moveBack = vectorMultiply(moveForward, -1);

	args['moveLeft'] = moveLeft;
	args['moveUp'] = moveUp;
	args['moveForward'] = moveForward;

	/*
	 * Calculate placement of towers
	 */
	var towers = [];
	if (args['towers'] == 1) {
		towers.push(Math.floor(args['len'] / 2));
	} else {
		var l = args['len'] - (2 * args['ft']);
		var p = args['towers'] - 2;
		var d = l / (1 + p);
		towers.push(args['ft']);
		for (var i = 1; i <= p; i++) {
			towers.push(Math.round(args['ft'] + (i * d)));
		}
		towers.push(args['len'] - args['ft']);
	}
	towers.sort(function(a, b) {
		return a - b
	});

	/*
	 * Place towers
	 */

	for (var j = -1; j <= 1; j += 2) {
		var p0 = pos.add(vectorMultiply(moveLeft, j * (args['tw'] + (args['width'] + 1) / 2)));
		var p0build = build_tower(args, blocks, p0, 2);
		if (p0build == 0) {
			return 0;
		}

		var p1 = pos.add(vectorMultiply(moveForward, args['len'])).add(vectorMultiply(moveLeft, j * (args['tw'] + (args['width'] + 1) / 2)));
		var p1build = build_tower(args, blocks, p1, 2);
		if (p1build == 0) {
			return 0;
		}
	}

	for (var i = 0; i < towers.length; i++) {
		for (var j = -1; j <= 1; j += 2) {
			var start = pos.add(vectorMultiply(moveForward, towers[i])).add(vectorMultiply(moveLeft, j * (args['tw'] + (args['width'] + 1) / 2)));
			var b = build_tower(args, blocks, start, args['th']);
			if (b == 0) {
				return 0;
			}

			var g2 = start.add(vectorMultiply(moveUp, args['th'] - 2));
			blocks.setBlock(g2, args['_GLOWSTONE']);

			var g1 = start.add(vectorMultiply(moveUp, args['th'] - 1));
			blocks.setBlock(g1, args['_GLASS_BLOCK']);

			if (args['planes'] == 1) {
				var g0 = start.add(vectorMultiply(moveUp, args['th']));
				blocks.setBlock(g0, args['_REDSTONE_TORCH']);
			}
		}
	}

	/*
	 * Build the cable tie support
	 */

	var xArray = towers.slice(0);
	xArray.push(args['len']);
	xArray.unshift(0);
	for (var i = 0; i < (xArray.length - 1); i++) {
		cable_support(args, blocks, pos.add(vectorMultiply(moveForward, xArray[i] + args['tl'])), xArray[i + 1] - xArray[i] - 2 * args['tl']);
	}

	/*
	 * Surface the bridge
	 */
	bridge_surface(args, blocks, pos);

	/*
	 * Place tower cross-connects
	 */
	for (var i = 0; i < towers.length; i++) {
		cross_connect_towers(args, blocks, pos.add(vectorMultiply(moveForward, towers[i])));
	}

	/*
	 * Keep track of suspension cables for later drawing of vertical cables
	 */

	var cArray = [];
	var point1 = pos;
	var point2 = pos.add(vectorMultiply(moveForward, args['len']));
	if (point1.getX() == point2.getX()) {
		for (var i = Math.min(point1.getZ(), point2.getZ()); i <= Math.max(point1.getZ(), point2.getZ()); i++) {
			cArray[":" + i] = 0;
		}
	} else {
		for (var i = Math.min(point1.getX(), point2.getX()); i <= Math.max(point1.getX(), point2.getX()); i++) {
			cArray[":" + i] = 0;
		}
	}

	/*
	 * Create the linear connection between the origin and the first tower
	 * and between the last tower and the termination.
	 */

	var CABLE = args['_CABLE'];
	if (args['ft'] >= 10) {
		for (var j = -1; j <= 1; j += 2) {
			var pt1 = pos.add(vectorMultiply(moveLeft, j * ((args['width'] + 1) / 2 + args['tw']))).add(moveUp).add(vectorMultiply(moveForward, args['tl']));
			var pt2 = pos.add(vectorMultiply(moveLeft, j * ((args['width'] + 1) / 2 + args['tw']))).add(vectorMultiply(moveUp, args['th'] - 1)).add(vectorMultiply(moveForward, towers[0] - args['tl']));
			if (! draw_line(args, blocks, pt1, pt2, CABLE, cArray)) {
				return 0;
			}

			var pt1b = pos.add(vectorMultiply(moveLeft, j * ((args['width'] + 1) / 2 + args['tw']))).add(moveUp).add(vectorMultiply(moveForward, args['len'] - args['tl']));
			var pt2b = pos.add(vectorMultiply(moveLeft, j * ((args['width'] + 1) / 2 + args['tw']))).add(vectorMultiply(moveUp, args['th'] - 1)).add(vectorMultiply(moveForward, towers[towers.length - 1] + args['tl']));
			if (! draw_line(args, blocks, pt1b, pt2b, CABLE, cArray)) {
				return 0;
			}
		}
	}

	/*
	 * Create the connections between the towers (parabolas).
	 */

	for (var j = -1; j <= 1; j += 2) {
		for (var i = 0; i < towers.length - 1; i++) {
			var pt1 = pos.add(vectorMultiply(moveLeft, j * ((args['width'] + 1) / 2 + args['tw']))).add(vectorMultiply(moveUp, args['th'] - 1)).add(vectorMultiply(moveForward, 1 + towers[i] + args['tl']));
			var pt2 = pos.add(vectorMultiply(moveLeft, j * ((args['width'] + 1) / 2 + args['tw']))).add(vectorMultiply(moveUp, args['th'] - 1)).add(vectorMultiply(moveForward, towers[i + 1] - args['tl'] - 1));
			if (! draw_parabola(args, blocks, pt1, pt2, args['ccl'], CABLE, cArray)) {
				context.error("Draw parabola failed (" + pt1 + "->" + pt2 + ")");
				return 0;
			}
		}
	}

	/*
	 * Add support cables between the cable tie support and the suspension cables
	 */
	draw_support_cables(args, blocks, pos, towers, cArray);

	return 1;
}

/*
 * Support cables
 */

function draw_support_cables(args, blocks, pos, towers, cArray) {
	if (args['vcf'] == 0) {
		return 1;
	}
	var moveLeft = args['moveLeft'];
	var moveForward = args['moveForward'];
	var moveUp = args['moveUp'];
	var dX = moveForward.getX();
	var dZ = moveForward.getZ();

	var xArray = towers.slice(0);
	xArray.push(args['len']);
	xArray.unshift(0);

	for (var i = 0; i < xArray.length - 1; i++) {
		var mdpt = xArray[i] + ((xArray[i + 1] - xArray[i]) / 2);
		for (var k = 0; k < Math.floor((xArray[i + 1] - xArray[i]) / 2); k += args['vcf']) {
			for (var j = -1; j <= Math.min(k, 1); j += 2) {
				var pt = pos.add(vectorMultiply(moveForward, Math.round(mdpt + j * k)));
				var key = ":" + (pt.getX() * Math.abs(dX) + pt.getZ() * Math.abs(dZ));
				if ( key in cArray) {
					for (var yy = pt.getY() + 1; yy < cArray[key]; yy++) {
						var pt2 = new Vector(pt.getX(), yy, pt.getZ());
						for (var w = -1; w <= 1; w += 2) {
							var pt3 = pt2.add(vectorMultiply(moveLeft, w * ((1 + args['width']) / 2 + args['tw'])));
							blocks.setBlock(pt3, args['_VERT']);
						}
					}
				}
			}
		}
	}
	return 1;
}

/*
 * Draw a parabola
 */

function draw_parabola(args, blocks, start, end, height, mat, cArray) {
	var dX = start.getX() == end.getX() ? 0 : start.getX() > end.getX() ? -1 : 1;
	var dZ = start.getZ() == end.getZ() ? 0 : start.getZ() > end.getZ() ? -1 : 1;
	var ht = args['th'] - height;
	var AIR = new BaseBlock(BlockID.AIR, 0x0);
	var moveUp = args['moveUp'];
	
	// For reasonableness...
	if (height >= args['th']) {
		context.error("Warning: height of parabola (" + height + ") was adjusted down to tower height (" + args['th'] + ")");
		height = args['th'] - 1;
	}

	// Find the midpoint
	var mdpt = Math.abs(start.getX() + start.getZ() - end.getX() - end.getZ()) / 2;
	var z = Math.floor(mdpt);
	var xv = new Vector(start.getX() + z * dX, 0, start.getZ() + z * dZ);
	var mkey = ":" + (xv.getX() * Math.abs(dX) + xv.getZ() * Math.abs(dZ));
	cArray[mkey] = start.getY() - args['th'] + height;
	
	// Build the parabolas
	for (var j = -1; j <= 1; j += 2) {
		var z = Math.floor(mdpt);
		if (j == -1) {
			// Center blocks
			var xv = new Vector(start.getX() + z * dX, start.getY() - args['th'] + 1, start.getZ() + z * dZ);
			var key = ":" + (xv.getX() * Math.abs(dX) + xv.getZ() * Math.abs(dZ));
			cArray[key] = start.getY() - args['th'] + 1 + height;
			for (var i = 1; i <= height; i++) {
				var pt = xv.add(vectorMultiply(moveUp, i));
				blocks.setBlock(pt, mat);
			}
			for (var i = 1; i < height; i++) {
				var pt = xv.add(vectorMultiply(moveUp, i));
				blocks.setBlock(pt, AIR);
			}
		}

		// Coefficient for parabolic equation : y = a*x^2
		var a = (args['th'] - height - 1) / (z * z);
		var dY = start.getY() - args['th'] + height + 1;
		var curY = height;
		for (var i = 0; i <= Math.ceil(mdpt); i++) {
			var y = Math.floor(0.5 + a * i * i);
			if (y >= (args['th'] - height)) {
				y = args['th'] - height - 1;
			}
			
			var pt = new Vector(xv.getX() + i * dX * j, y, xv.getZ() + i * dZ * j);
			var key = ":" + (pt.getX() * Math.abs(dX) + pt.getZ() * Math.abs(dZ));

			//
			// Prevent the parabola from overwriting the tower
			//
			var flag = 0;
			if (start.getX() == pt.getX()) {
				if (start.getZ() < end.getZ() && (pt.getZ() < start.getZ() || pt.getZ() > end.getZ())) { flag = 1; }
				if (start.getZ() > end.getZ() && (pt.getZ() > start.getZ() || pt.getZ() < end.getZ())) { flag = 2; }
			} else {
				if (start.getX() < end.getX() && (pt.getX() < start.getX() || pt.getX() > end.getX())) { flag = 3; }
				if (start.getX() > end.getX() && (pt.getX() > start.getX() || pt.getX() < end.getX())) { flag = 4; }
			}
			if (flag > 0) {
					continue;
					// context.error("flag = " + flag + " for pt = " + pt + " ( start = " + start + ", end = " + end + ")");
			} else {
				if (key != mkey) {
					cArray[key] = curY + dY;
				}
				for (yy = curY; yy <= y; yy++) {
					var pt = new Vector(xv.getX() + i * dX * j, yy + dY, xv.getZ() + i * dZ * j);
					blocks.setBlock(pt, mat);
				}
				if (y != curY) {
					var pt = new Vector(xv.getX() + i * dX * j, curY + dY, xv.getZ() + i * dZ * j);
					blocks.setBlock(pt, AIR);
					if (key != mkey) {
						cArray[key] += 1;
					}
				}
				curY = y;
				if (args['tor'] == 1) {
					var pt = new Vector(xv.getX() + i * dX * j, 1 + curY + dY, xv.getZ() + i * dZ * j);
					blocks.setBlock(pt, args['_TORCH']);
				}
			}
		}
	}
	return 1;
}

/*
 * Draw a line between two points
 */

function draw_line(args, blocks, start, end, material, cArray) {
	// We will draw from the low to the high point
	var low = start.getY() >= end.getY() ? end : start;
	var high = start.getY() >= end.getY() ? start : end;

	// Get the directional vector
	var dX = low.getX() == high.getX() ? 0 : low.getX() < high.getX() ? 1 : -1;
	var dZ = low.getZ() == high.getZ() ? 0 : low.getZ() < high.getZ() ? 1 : -1;
	var xz1 = Math.abs(dX) * low.getX() + Math.abs(dZ) * low.getZ();
	var xz2 = Math.abs(dX) * high.getX() + Math.abs(dZ) * high.getZ();
	var xz = Math.abs(xz2 - xz1);

	// Draw the connecting line
	var slope = (high.getY() - low.getY()) / xz;
	var curY = low.getY();
	for (var i = 0; i < xz; i++) {
		var y = Math.floor(0.5 + low.getY() + slope * i);
		var pt = new Vector(low.getX() + i * dX, y, low.getZ() + i * dZ);
		var key = ":" + (pt.getX() * Math.abs(dX) + pt.getZ() * Math.abs(dZ));
		cArray[key] = curY;
		if (curY < 30) {
			context.error("draw_line set curY to " + curY + " for point " + pt);
		}
		for ( yy = curY; yy <= y; yy++) {
			var pt = new Vector(low.getX() + i * dX, yy, low.getZ() + i * dZ);
			blocks.setBlock(pt, material);
		}
		if (y != curY) {
			var pt = new Vector(low.getX() + i * dX, curY, low.getZ() + i * dZ);
			blocks.setBlock(pt, new BaseBlock(BlockID.AIR, 0x0));
			cArray[key] += 1;
		}
		curY = y;
		if (args['tor'] == 1) {
			var pt = new Vector(low.getX() + i * dX, 1 + curY, low.getZ() + i * dZ);
			blocks.setBlock(pt, args['_TORCH']);
		}
	}
	return 1;
}

/*
 * This connects the towers along the edges of the bridge.
 * The individual cables will connect to this.
 */

function cable_support(args, blocks, start, num) {
	var moveLeft = args['moveLeft'];
	var moveForward = args['moveForward'];
	var moveUp = args['moveUp'];
	var AIR = new BaseBlock(BlockID.AIR, 0x0);

	for (var i = 1; i < num; i++) {
		for (var j = -1; j <= 1; j += 2) {
			var pt = start.add(vectorMultiply(moveLeft, j * ((args['width'] + 1) / 2 + args['tw']))).add(vectorMultiply(moveForward, i));
			blocks.setBlock(pt, args['_TOWER']);
			for (var yy = 1; yy <= args['th']; yy++) {
				var pt2 = pt.add(vectorMultiply(moveUp, yy));
				blocks.setBlock(pt2, AIR);
			}
			for (var k = -args['tw']; k <= args['tw']; k++) {
				if (k == 0) {
					continue;
				}
				pt = start.add(vectorMultiply(moveLeft, j * (k + (args['width'] + 1) / 2 + args['tw']))).add(vectorMultiply(moveForward, i));
				for (var yy = 0; yy <= args['th']; yy++) {
					var pt2 = pt.add(vectorMultiply(moveUp, yy));
					blocks.setBlock(pt2, AIR);
				}
			}
		}
	}
}

/*
 * This paves the bridge.
 */

function bridge_surface(args, blocks, start) {
	var moveLeft = args['moveLeft'];
	var moveForward = args['moveForward'];
	var moveUp = args['moveUp'];
	var AIR = new BaseBlock(BlockID.AIR, 0x0);
	for (var i = 0; i <= args['len']; i++) {
		for (var j = -(-1 + (args['width'] + 1) / 2); j < (args['width'] + 1) / 2; j += 1) {
			var pt = start.add(vectorMultiply(moveLeft, j)).add(vectorMultiply(moveForward, i));
			blocks.setBlock(pt, args['_SURFACE']);

			/*
			 * Clear any blocks above (up to the tower height)
			 */

			for (var yy = 1; yy <= args['th']; yy++) {
				var pt2 = pt.add(vectorMultiply(moveUp, yy));
				blocks.setBlock(pt2, AIR);
			}

			/*
			 * Install the wall and torch above if desired
			 */

			if (args['wall'] > 0 && (j == -(-1 + (args['width'] + 1) / 2) || j == -1 + (args['width'] + 1) / 2)) {
				for (var yy = 1; yy <= args['wall']; yy++) {
					var pt2 = pt.add(vectorMultiply(moveUp, yy));
					blocks.setBlock(pt2, args['_WALL']);
				}
				if (args['wator'] >= 1 && (i % args['wator']) == 0) {
					var pt2 = pt.add(vectorMultiply(moveUp, args['wall'] + 1));
					blocks.setBlock(pt2, args['_TORCH']);
				}
			}
		}
	}
}

/*
 * This creates the cross-connects between the towers
 */

function cross_connect_towers(args, blocks, start) {
	var h = args['tch'];
	if (h == 0) {
		return 1;
	}
	var moveLeft = args['moveLeft'];
	var moveForward = args['moveForward'];
	var moveUp = args['moveUp'];

	for (var y2 = h; y2 <= args['th']; y2 += h) {
		if (h > 4) {
			h--;
		}
		if (Math.abs(args['th'] - y2) <= 3) {
			return 1;
		}

		// Connect the innermost protrusion
		for (var w = -(-1 + (args['width'] + 1) / 2); w < (args['width'] + 1) / 2; w++) {
			var pt = start.add(vectorMultiply(moveLeft, -w)).add(vectorMultiply(moveUp, y2));
			blocks.setBlock(pt, args['_XC']);
		}

		// Connect the next (if args['tl'] > 0)
		if (args['tl'] > 0) {
			for (var j = -Math.floor(args['tl'] / 2); j <= Math.floor(args['tl'] / 2); j += 1) {
				if (j != 0) {
					for (var w = -(-1 + (args['width'] + 1) / 2 + args['tw']); w < ((args['width'] + 1) / 2) + args['tw']; w++) {
						var pt = start.add(vectorMultiply(moveLeft, -w)).add(vectorMultiply(moveUp, y2)).add(vectorMultiply(moveForward, j));
						blocks.setBlock(pt, args['_XC']);
					}
				}
			}
		}

		// Place the block with the torch right in the middle
		var pt1 = start.add(vectorMultiply(moveUp, y2 - 1));
		blocks.setBlock(pt1, args['_TOWER']);

		var pt2 = start.add(vectorMultiply(moveUp, y2));
		blocks.setBlock(pt2, args['_TOWER']);
	}
}

/*
 * Build a tower starting from the first "solid block"
 * up to the defined height. This will build an additional
 * args['tw'] blocks perpendicular to the bridge
 * and args['tl'] blocks parallel to it.
 */

function build_tower(args, blocks, start, height) {
	var z = [];
	for (var y = start.getY() - 1; y >= 1; y--) {
		var pt = new Vector(start.getX(), y, start.getZ());
		var bl = blocks.getBlockType(pt);
		if (bl == BlockID.BEDROCK || bl == BlockID.COBBLESTONE || bl == BlockID.STONE || bl == BlockID.DIRT) {
			return _build_tower(args, blocks, start, height, y);
		} else {
			z.push(bl);
		}
	}
	context.error("WARNING: Failed to locate solid bottom for tower at " + start);
	return _build_tower(args, blocks, start, height, 5);
}

function _build_tower(args, blocks, start, height, y) {
	var moveLeft = args['moveLeft'];
	var moveForward = args['moveForward'];
	var TOWER = args['_TOWER']
	var AIR = new BaseBlock(BlockID.AIR, 0x0);

	for (var w = 0; w <= args['tw']; w++) {
		for (var l = 0; l <= args['tl']; l++) {
			var pt1 = start.add(vectorMultiply(moveLeft, w)).add(vectorMultiply(moveForward, l));
			var pt2 = start.add(vectorMultiply(moveLeft, -w)).add(vectorMultiply(moveForward, l));
			var pt3 = start.add(vectorMultiply(moveLeft, w)).add(vectorMultiply(moveForward, -l));
			var pt4 = start.add(vectorMultiply(moveLeft, -w)).add(vectorMultiply(moveForward, -l));
			var mat = (l == 0 || w == 0) ? TOWER : AIR;
			var ymin = (l == 0 || w == 0) ? y : start.getY();
			for (var y2 = ymin; y2 < start.getY() + height; y2++) {
				var pt1b = new Vector(pt1.getX(), y2, pt1.getZ());
				blocks.setBlock(pt1b, mat);
				var pt2b = new Vector(pt2.getX(), y2, pt2.getZ());
				blocks.setBlock(pt2b, mat);
				var pt3b = new Vector(pt3.getX(), y2, pt3.getZ());
				blocks.setBlock(pt3b, mat);
				var pt4b = new Vector(pt4.getX(), y2, pt4.getZ());
				blocks.setBlock(pt4b, mat);
			}
		}
	}
	return 1;
}

function movement_vectors(dir) {
	var dx = dir.getX();
	var dz = dir.getZ();
	vec = [];
	vec['moveUp'] = new Vector(0, 1, 0);
	vec['moveForward'] = new Vector(dx, 0, dz);
	vec['moveLeft'] = new Vector(-dz, 0, dx);
	return vec;
}

function vectorMultiply(vector_in, scalar_in) {
	return new Vector(vector_in.getX() * scalar_in, vector_in.getY() * scalar_in, vector_in.getZ() * scalar_in);
}

function main() {

	/*
	 * Determine the direction the player is looking - this is the direction
	 * toward which the train tracks will be built.
	 */
	var dir = player.getCardinalDirection();
	if (! dir.isOrthogonal()) {
		context.error("You need to be facing at a right angle!");
		return;
	}

	/*
	 * Parse arguments
	 */
	var args = [];
	args['len'] = -1;
	args['width'] = 5;
	args['towers'] = 2;
	args['th'] = -1;
	args['ft'] = 25;
	args['tw'] = 1;
	args['tl'] = 2;
	args['planes'] = 1;
	args['cableSpacing'] = 5;

	context.checkArgs(1, -1, "len=<length> [width=X] [towers=X]");

	var i = 1;
	while (true) {
		if ( typeof argv[i] == 'object' && argv[i].length() > 0) {
			var x = argv[i].split('=', 2);
			i++;

			var c = x[1].match(/^(\d+):(\d+)$/);
			if (c != null) {
				args[x[0]] = RegExp.$1 + ":" + RegExp.$2;
				continue;
			}
			if (parseInt(x[1]) != NaN) {
				args[x[0]] = parseInt(x[1]);
			}
		} else {
			break;
		}
	}

	/*
	 * Validate arguments
	 */

	if (args['len'] < 25) {
		context.error("Bridge must be at least 25 blocks long");
		return 1;
	}
	if (args['width'] < 1) {
		context.error("Bridge must be at least 1 block wide");
		return 1;
	}
	if (args['width'] % 2 == 0) {
		context.error("Bridge width must be odd to support symmetric tower placement");
		return 1;
	}
	if (args['towers'] < 1) {
		context.error("Bridge must have at least 1 tower");
		return 1;
	}
	if (args['towers'] > (args['len'] / args['ft'])) {
		context.error("Bridge is too short to support the specified number of towers");
		return 1;
	}
	if (args['th'] == -1) {
		args['th'] = 5 + Math.abs(Math.floor((args['len'] - 50) / (2 * args['towers'])));
	}

	/*
	 * Get start position and direction
	 */
	var pos = player.getBlockIn();
	var direction = player.getCardinalDirection();
	if (! direction.isOrthogonal()) {
		context.error("You need to be facing at a right angle!");
		return;
	}
	var dir = direction.vector();

	/*
	 * Build a bridge!
	 */
	return suspension_bridge(pos, dir, args);
}

main();
