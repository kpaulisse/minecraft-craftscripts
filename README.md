minecraft-craftscripts
======================

# Background

The inspiration for me to get started with CraftScripts was my son wanting to construct a rather elaborate subway system throughout his world. Hours upon hours of clearing blocks and laying tracks is not my idea of fun, especially when my day job as a DevOps engineer is pretty much defined as "automate everything." Knowing there must be a better way, I discovered the WorldEdit plugin to Craftbukkit.

# General Instructions - Install

You have to have a Bukkit server already -- and that does take some work beyond simply installing Minecraft on your computer. Here's how to do it -> http://wiki.bukkit.org/Setting_up_a_server

Once your server is running, you need to install the WorldEdit plugin. When installing any plugin, make sure the version of the plugin matches the version of the server. In other words, suppose you've downloaded Bukkit 1.7.10. Make sure you download the version of the plugin that is written for Bukkit 1.7.10.

The plugin you need to install is WorldEdit. Download the jar file, drop it into the "plugins" directory of your craftbukkit install, and restart craftbukkit. This will expand the jar file into a directory called "WorldEdit" within the "plugins" directory. Here's the link to WorldEdit -> http://dev.bukkit.org/bukkit-plugins/worldedit/

Once you've installed WorldEdit and restarted the server, navigate into that WorldEdit directory and you'll find a directory called "craftscripts". It is into that directory where you will place the *.js files that you download from my repository.

Note: I've organized my repository into one directory per script, mainly so I can put a README file in there, and keep things logically organized. However, when you're installing the scripts, drop the desired *.js file directly into that "craftscripts" directory. Don't create a separate subdirectory there, and don't copy the README file there.

Final Note: Make sure you are downloading the RAW file from GitHub -- it will be a plain text file with no colors etc. If you download a formatted HTML page, where all the code is (hopefully) color coded very prettily, that simply won't work.

# General Instructions - Using

In Minecraft, you'll press "t" to get the command line and then type something like this:

`/cs nameofscript.js foo=bar baz=buzz`

In that example:

`/cs` stands for CraftScript -- you always type that
`nameofscript.js` is the name of the script you put in the "craftbukkit" directory
`foo=bar baz=buzz` are arguments you give to the script - see the README files for what these arguments are

# Version Compatibility Notes

I am using CraftBukkit 1.7.9-R0.2 and WorldEdit 5.6.3.

Your mileage may vary with other versions.
