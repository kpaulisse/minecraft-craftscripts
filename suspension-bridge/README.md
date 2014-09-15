# Suspension Bridge craft script

## Introduction

This craft script creates a suspension bridge.

There are numerous parameters that are configurable by the user, including:

* The length of the bridge
* The number of towers
* The width of the bridge deck
* Whether or not to put a wall or other barrier on each edge of the bridge
* The materials used to construct the bridge, towers, cables, etc.

When describing the various parameters, I have attempted to use actual bridge terminology as per this document: http://www.dot.state.oh.us/Divisions/Communications/BridgingtheGap/Pages/BridgeTermDefinitions.aspx

## Basic usage instructions

The point where the player is standing defines the **center of the bridge deck** (both horizontally and vertically) and the **first block of the bridge length**.

The bridge is drawn in the direction the player is facing. If the player is not facing in a cardinal direction, an error will be presented.

The only required parameter is the length of the bridge, specified with `len=###` in the terminal command. The bridge must be at least 25 blocks long.

So to draw your first bridge:

1. Stand on a block and face in a cardinal direction (due north, due east, due west, or due south)
2. Hit "t" to bring up the command prompt
3. Type this: `/cs suspensionbridge.js len=100`

This will draw a bridge 100 blocks long and you'll probably notice you get pushed back a little bit (since a block was placed where you were standing). You will also get a warning about the height of the parabola being adjusted down, which you can ignore for now.

Remember that with WorldEdit, you can always undo by typing `/undo` at the command prompt.

## Additional parameters

This section describes additional parameters that you can supply (in addition to length) to customize your bridge. Just add these parameters after the `len=###` in your command. Separate parameters with spaces.

### Width of bridge deck

Description: The width of the bridge deck, in blocks.

Parameter: `width=#`

Default value: 5

Allowable values: 1 to ???. This must be an *odd number* so that the bridge is drawn symmetrically around you.

### Tower controls

#### Number of towers

Description: The number of towers (not including the anchorages at either end).

Parameter: `towers=#`

Default value: Auto-calculated based on the length of the bridge.

Allowable values: 1 to ((length of bridge)/25)

Notes:

* For `towers=1` a single tower will be placed in the middle of the bridge and the suspension cables will be linear from that tower to each anchorage block. This bridge will have a triangular look. An example is the Eastern span of the Oakland Bay Bridge (http://en.wikipedia.org/wiki/Eastern_span_replacement_of_the_San_Francisco%E2%80%93Oakland_Bay_Bridge#Lighting) although of course your Minecraft bridge will not have additional pillars into the water (unless you add them). The cables from the anchorage on either end to the top of the tower in the middle will be linear.

* For `towers=2` two towers are constructed, one of them 25 blocks from the starting point, and the other 25 blocks from the end. This is a classic suspension bridge such as the Golden Gate Bridge (http://en.wikipedia.org/wiki/Golden_Gate_Bridge) or the Mackinac Bridge (http://en.wikipedia.org/wiki/Mackinac_Bridge). The cables from each anchorage to the top of the closest tower will be linear, and the cable between the two towers will be parabolic.

* When `towers` is greater than 2, the first and last towers are constructed 25 blocks from the starting and ending points, respectively. Additional towers are placed equidistant between the first and last towers. The cables from each anchorage to the top of the closest tower, and cables between towers will be parabolic.

#### Height of towers

Description: The height of towers relative to the bridge deck.

Parameter: `th=##`

Default value: Auto-calculated on the length of the bridge and number of towers. Long bridge and few towers gives tall towers. Short bridge and many towers gives short towers.

Allowable values: 1 to unlimited - not a whole lot of checking so you can do some crazy things.

#### Placement of first (and last) towers

Description: The number of blocks from the origin point (where you're standing) to the first tower -- and, correspondingly, the number of blocks from the last tower to the other end of the bridge.

Parameter: `ft=##`

Default value: 25 (except when `towers=1`, then the midpoint of the bridge)

Allowable values: 1 - ((length of bridge)/(number of towers))

Notes:

* The script currently enforces symmetry. The distance from the origin point to the first tower always equals the distance from the last tower to the ending point.

* When `ft` is less than 10, no suspension cables are drawn from the anchorages to the first/last towers

#### Width and length of towers

Description: Each tower measures 1x1 (a single block) in a column to the defined height. The tower width and tower length settings allow you to specify more realistic looking towers. As you face the bridge and tower, *Width* is the left-and-right dimension, and *Length* is the forward-and-backward dimension.

Parameters: `tw=###` (width) ; `tl=###` (length)

Default values: 1 (width) ; 2 (length)

Allowable values: 0 - unlimited

Notes:

* The tower itself measures 1x1. Set tw to a positive number to add `tw` blocks to EACH SIDE of the tower perpendicular to the direction of travel. Set `tl` to a positive number to add `tl` blocks to EACH SIDE of the tower parallel to the direction of travel. By varying these parameters you can change the shape of each tower.

* Setting `tl` does not change the length of the bridge. However if `tl` is greater than the spacing between the towers, the bridge consists of one big tower, creating a tunnel effect. This is allowed because it doesn't crash anything, and it lets the user be more creative.

* Setting `tw` does not change the width of the bridge deck. However setting `tw` to any positive integer (and indeed, leaving `tw` at its default value of 1) creates a space between the bridge deck and the place where the suspenders hang down.

#### Cross-connect height

Description: Set the height of the first (lowest) cross-connect between two towers. 

Parameters: `tch=###`

Default value: 8

Allowable values: 0 - unlimited

Notes:

* Set `tch=0` if you don't want cross-connects between the towers.

* The relative height of each subsequent cross-connect will decrease by 1 for illusion, to a minimum of 4.

### Suspender and cable controls

Note: As per definition, the *suspender* connects the towers to the anchorages and to each other, and the *cable* runs vertically from the suspender to the bridge deck.

#### Vertical cable frequency

Description: Set the frequency of the vertical suspension cables, that run from the suspenders to the bridge deck.

Parameter: `vcf=##`

Default value: 3 (one cable every 3 blocks)

Allowable values: 0 (no cables at all) or 1 - unlimited

Notes:

* `vcf=0` disables cables entirely

* `vcf=1` places a cable every block, effectively enclosing the entire bridge

* If `vcf` is greater than the distance between the towers, then no cables will be drawn

#### Cable clearance

Description:  Set the distance from the bridge deck to the bottom of the parabola for suspenders that join two towers. The smaller this number, the lower the suspenders will "hang".

Parameter: `ccl=##`

Default value: 8

Allowable values: 0 (cables touch the bridge deck) - unlimited*

Note:

* If `ccl` is set higher than the tower height, the script adjusts the value down to the tower height. This causes a linear connection between the tops of the towers.

### Illumination controls

#### Airplane lights

Description: If enabled, "airplane lights" will be redstone torches placed at the top of each tower. This is for aesthetic purposes only, and serves no real practical purpose.

Parameter: `planes=0` (no airplane lights) or `planes=1` (airplane lights enabled)

Default value: 1 (airplane lights enabled)

Allowable values: 0 (no airplane lights) or 1 (airplane lights enabled)

Note:

* Placement of a redstone torch does nothing to prevent mob spawning. In an attempt to prevent mobs from spawning on the top of towers, glowstone and a glass block are placed at the top of each tower (this is not visible from below except when either the tower width or tower length settings are 0). 

#### Torches on suspenders

Description: If enabled, torches will be placed on top of suspenders. This lights up the bridge at night and also prevents mobs from spawning on the suspenders.

Parameter: `tor=0` (no torches on suspenders) or `tor=1` (torches on suspenders enabled)

Default value: 0 (no torches on suspenders)

Allowable values: 0 (no torches on suspenders) or 1 (airplane lights enabled)

### Bridge deck controls

#### Wall on edge of bridge deck

Description: If specified, a wall of the defined height will be added on each side of the bridge deck. The default material for this wall is the Cobblestone Wall (this can be changed in material selection).

Parameter: `wall=##`

Default value: 0 (no wall is drawn)

Allowable values: 0 (no wall is drawn) or 1 - unlimited (wall of the specified height is drawn)

Note:

* Specifying a wall draws the wall on the leftmost and rightmost block of the bridge deck, effectively narrowing the usable width of your bridge by 2 blocks.

#### Wall torches

Description: If you have enabled the `wall` setting, you can choose to put torches on top of that wall. *This setting does nothing if `wall=0`.*

Parameter: `wator=##`

Default value: 0 (no torches are placed)

Allowable values: 0 (no torches are placed) or 1 - unlimited

Notes:

* As previously noted, This setting does nothing if `wall=0`

* Setting `wator=1` will place a torch on every block, `wator=2` will place a torch every 2nd block, `wator=3` every 3rd block, and so on.

### Materials selection

You can change the materials used to construct various components of your bridge by supplying command line arguments.

The script does not provide validation on your material selections. However, some selections simply won't work (e.g. trying to construct a bridge deck out of arrows) and some don't make sense or may cause unexpected results (e.g. towers made of lava or a bridge deck made of sand).

This table lists the parameters that are adjustable. You can use integer (e.g. 4 for cobblestone) or integer:integer (e.g. 5:1 for spruce wood plank). You may NOT use words, like "COBBLESTONE" as arguments. Consult a reference such as: http://minecraft-ids.grahamedgecombe.com/

Parameter          | Description                                           | Default
-------------------|-------------------------------------------------------|-----------------
TOWER              | Tower construction material                           | Quartz (pillar)
SURFACE            | Bridge deck surface                                   | Cobblestone
CABLE              | Suspenders (tower-to-tower, tower-to-anchorage)       | Gray wool
VERTICAL           | Vertical cables (suspender to deck)                   | Wooden fence
WALL               | Walls constructed on bridge deck when `wall` >= 1     | Cobblestone wall
TOWER_CT           | Tower cable tie deck                                  | Quartz (pillar)

Example to use hardened clay (looks like the Golden Gate bridge):

`/cs suspensionbridge.js len=100 TOWER=172`

Example showing integer:integer notation - e.g. for towers made of purple clay and a bridge deck made of sandstone:

`/cs suspensionbridge.js len=100 TOWER=159:10 SURFACE=24`

## FAQ

### Failed to locate solid bottom for tower at ...

**THIS IS NOT A BUG - DO NOT REPORT THIS TO THE AUTHOR**

When building a tower the algorithm starts at the highest "solid" block (stone, cobblestone, bedrock, or dirt) below the bridge. If you're building over water, this makes the towers go all the way to the ocean floor (not mysteriously floating on the surface of the water). If the algorithm can't find such a block before y = 5, it will throw this warning and start building up from y=5. This error usually occurs because the place at which you are attempting to place the tower hasn't been generated yet or in the case of very long bridges, is not currently loaded. *There is some risk that this could mess up underground structures (explored or unexplored) so be aware of this limitation when using this script.*
