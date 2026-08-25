---
slug: "minecraft-commands"
---

Minecraft cheat codes are typed commands: open the chat, type a forward slash, then a command like `/gamemode creative` or `/give @s diamond 64`, and press Enter. They work in Java Edition, Bedrock Edition, and on PS5, Xbox, and Switch (which all run Bedrock), as long as cheats are enabled in your world. This guide covers how to switch them on, every command worth knowing, and the syntax differences between editions.

## How to enable cheats in Minecraft

Commands only work if cheats are active in your world. The steps differ by edition.

### Java Edition

- **New world:** on the world creation screen, open the **Game** tab and set **Allow Commands** (older versions call it Allow Cheats) to **ON**.
- **Existing world:** press Esc, choose **Open to LAN**, set **Allow Cheats: ON**, then click **Start LAN World**. This enables commands for the current session only; repeat it each time you load the world. Changes you make with commands (items, gamerules, builds) stay saved.
- **Servers:** you need operator status. The server owner grants it from the server console with `op YourUsername`.

### Bedrock Edition (PC and mobile)

- Open your world settings (the pencil icon next to the world name, or Settings while playing).
- Under the **Game** section, toggle **Activate Cheats** to on.
- You can flip this on or off at any time, but see the achievements warning below before you do.

### PS5, Xbox and Switch

Consoles run Bedrock Edition, so the process is identical: edit the world, scroll to **Activate Cheats** under Game settings, and toggle it on. Every Bedrock command in this guide works on PS5, Xbox Series X|S, and Switch. Typing long commands on a controller is slow, so plug in a USB keyboard (PS5 and Xbox both support one) or use your platform's on-screen keyboard shortcuts. Java Edition is not available on consoles, so Java-only commands will not work there.

## Warning: cheats and achievements

On Bedrock (including all consoles), the moment you activate cheats the world is flagged and **achievements are permanently disabled in that world**, even if you turn cheats back off. If you care about achievements, make a copy of the world first and cheat in the copy. Java Edition has no achievement system; advancements keep working normally with cheats on.

## How to use commands and target selectors

Open chat with T (keyboard), right on the d-pad (console), or the chat icon (touch). Every command starts with `/`. On Java you can also press `/` to open chat with the slash already typed, and Tab autocompletes commands and coordinates on both editions.

Target selectors let you point a command at players or mobs:

- `@s` = yourself
- `@p` = nearest player
- `@a` = all players
- `@e` = all entities (add filters like `@e[type=zombie]`)
- `@r` = a random player

Coordinates accept `~` for "current position" (`~ ~10 ~` means 10 blocks above you) and `^` for directional offsets relative to where you are facing.

## Player and game mode commands

| Command | What it does | Edition |
|---|---|---|
| `/gamemode creative` | Switches you to Creative mode (flight, unlimited blocks) | Both |
| `/gamemode survival` | Back to Survival mode | Both |
| `/gamemode adventure` | Adventure mode: no breaking or placing blocks | Both |
| `/gamemode spectator` | Spectator mode: fly through blocks, invisible | Both |
| `/defaultgamemode creative` | Sets the mode new players spawn into | Java |
| `/difficulty peaceful` | Sets difficulty (peaceful, easy, normal, hard) | Both |
| `/effect give @s speed 300 2` | Gives you Speed III for 300 seconds | Java |
| `/effect @s speed 300 2` | Same effect, Bedrock syntax (no "give") | Bedrock |
| `/effect clear @s` | Removes all your status effects (Bedrock: `/effect @s clear`) | Both |
| `/xp add @s 30 levels` | Adds 30 XP levels (use `points` for raw XP) | Java |
| `/xp 30L @s` | Adds 30 XP levels (drop the L for points) | Bedrock |
| `/kill @s` | Kills you instantly (respawn without walking home) | Both |
| `/spawnpoint @s ~ ~ ~` | Sets your personal respawn point where you stand | Both |
| `/clearspawnpoint @s` | Removes your spawn point, sending you back to world spawn | Bedrock |
| `/ability @s mayfly true` | Lets you fly in Survival (needs the Education toggle on) | Bedrock |

## Items and inventory commands

The minecraft give command is the one most players search for, and it is simple: `/give <target> <item> <amount>`.

| Command | What it does | Edition |
|---|---|---|
| `/give @s minecraft:diamond 64` | Gives you a full stack of diamonds | Both |
| `/give @s netherite_sword 1` | Gives one netherite sword (the `minecraft:` prefix is optional) | Both |
| `/give @a golden_apple 8` | Gives every player 8 golden apples | Both |
| `/clear @s` | Empties your entire inventory | Both |
| `/clear @s dirt` | Removes only a specific item from your inventory | Both |
| `/enchant @s sharpness 5` | Applies Sharpness V to the item you are holding | Both |
| `/item replace entity @s weapon.mainhand with minecraft:trident` | Swaps whatever is in your main hand for a trident | Java |
| `/loot give @s loot minecraft:chests/end_city_treasure` | Hands you a random roll of a loot table | Both |
| `/recipe give @s *` | Unlocks every crafting recipe in the book | Java |

Enchant only accepts legal combinations (right item, level cap respected). For enchantments that go beyond vanilla limits, or to plan a full god-armor set, see our Minecraft enchantments guide.

## Teleport and world commands

| Command | What it does | Edition |
|---|---|---|
| `/tp 100 64 -200` | Teleports you to exact coordinates (x y z) | Both |
| `/tp Steve Alex` | Teleports player Steve to player Alex | Both |
| `/tp @s ~ ~100 ~` | Teleports you 100 blocks straight up | Both |
| `/locate structure village` | Prints the coordinates of the nearest village | Both |
| `/locate structure stronghold` | Finds the nearest stronghold (End portal) | Both |
| `/locate biome cherry_grove` | Finds the nearest biome of that type | Both |
| `/seed` | Shows the world seed (Bedrock: check world settings instead) | Java |
| `/setblock ~ ~ ~1 glowstone` | Places one block at the given position | Both |
| `/fill 0 64 0 20 74 20 stone` | Fills a region with a block (also great for clearing: use `air`) | Both |
| `/clone 0 64 0 10 74 10 100 64 100` | Copies a region of blocks to a new location | Both |
| `/place structure minecraft:ancient_city` | Generates a whole structure at your position | Java |
| `/setworldspawn ~ ~ ~` | Moves the world spawn point to where you stand | Both |
| `/worldborder set 1000` | Shrinks the playable world to a 1000-block border | Java |
| `/spreadplayers 0 0 50 500 true` | Scatters players randomly across an area | Both |
| `/tickingarea add ~ ~ ~ ~50 ~ ~50 myfarm` | Keeps a chunk area loaded and running while you are away | Bedrock |
| `/setmaxplayers 20` | Changes the player cap of your world or Realm session | Bedrock |

Locate pairs perfectly with a good starting seed. If you want a world that already spawns you next to the structures you are hunting, browse our best Minecraft seeds.

## Mobs and entities commands

| Command | What it does | Edition |
|---|---|---|
| `/summon wolf` | Spawns a mob at your position | Both |
| `/summon lightning_bolt` | Strikes lightning where you stand | Both |
| `/summon minecraft:warden ~ ~ ~5` | Spawns a Warden 5 blocks in front of you (good luck) | Both |
| `/kill @e[type=zombie]` | Kills every zombie in loaded chunks | Both |
| `/kill @e[type=item]` | Deletes all dropped items (lag cleaner) | Both |
| `/tp @e[type=cow] @s` | Teleports every cow to you | Both |
| `/ride @s start_riding @e[type=horse,c=1]` | Instantly mounts you on the nearest horse | Bedrock |
| `/tag @e[type=villager] add trader` | Tags entities so other commands can target them | Both |
| `/team add Red` | Creates a scoreboard team for minigames | Java |
| `/data get entity @s` | Dumps all NBT data for an entity | Java |
| `/attribute @s minecraft:max_health base set 40` | Doubles your max hearts | Java |
| `/damage @s 5` | Deals 5 damage (half-hearts x2) to a target | Both |
| `/mobevent minecraft:pillager_patrols_event false` | Turns off pillager patrols | Bedrock |

## Weather and time commands

| Command | What it does | Edition |
|---|---|---|
| `/weather clear` | Stops rain and thunder | Both |
| `/weather rain` | Starts rain | Both |
| `/weather thunder` | Starts a thunderstorm (charged creepers, anyone?) | Both |
| `/weather clear 1000000` | Clear skies for a very long duration | Both |
| `/time set day` | Jumps to morning (tick 1000) | Both |
| `/time set night` | Jumps to night (tick 13000) | Both |
| `/time set noon` | Sun directly overhead | Both |
| `/time set sunrise` | Named sunrise/sunset times | Bedrock |
| `/time add 6000` | Advances time by a quarter of a day | Both |
| `/alwaysday` | Locks the world at daytime (alias: `/daylock`) | Bedrock |
| `/gamerule doDaylightCycle false` | Freezes the sun and moon where they are | Both |
| `/gamerule doWeatherCycle false` | Stops the weather from ever changing on its own | Both |

## Advanced commands and gamerules

| Command | What it does | Edition |
|---|---|---|
| `/gamerule keepInventory true` | You keep all items and XP when you die | Both |
| `/gamerule mobGriefing false` | Creepers, Endermen and Ghasts stop destroying blocks | Both |
| `/gamerule doMobSpawning false` | No new hostile or passive mobs spawn | Both |
| `/gamerule doImmediateRespawn true` | Skips the death screen entirely | Both |
| `/gamerule fallDamage false` | Disables fall damage (also: fireDamage, drownDamage) | Both |
| `/gamerule randomTickSpeed 300` | Crops and plants grow absurdly fast (default is 3, Bedrock 1) | Both |
| `/execute as @a at @s run summon lightning_bolt` | Runs a command as and at other entities; the backbone of map-making | Both |
| `/scoreboard objectives add deaths deathCount` | Tracks stats like deaths on a scoreboard | Both |
| `/function mypack:mycommands` | Runs a whole file of commands from a data or behavior pack | Both |
| `/schedule function mypack:reset 6000t` | Runs a function on a delay | Java |
| `/title @a title "Level Complete"` | Displays big text on every player's screen | Both |
| `/tellraw @a {"text":"Hello"}` | Sends formatted JSON chat messages (Bedrock uses `rawtext`) | Both |
| `/playsound minecraft:entity.ender_dragon.growl player @a` | Plays any game sound | Both |
| `/particle minecraft:heart ~ ~1 ~` | Spawns particle effects | Both |
| `/camera @s fade time 1 2 1` | Cinematic camera control for maps | Bedrock |
| `/fog @a push minecraft:fog_crimson_forest custom` | Applies custom fog | Bedrock |
| `/bossbar add timer "Time Left"` | Creates a custom boss bar display | Java |
| `/trigger` | Lets non-op players fire predefined scoreboard triggers | Java |
| `/tick freeze` | Pauses the entire game simulation (players still move) | Java |
| `/tick rate 40` | Doubles game speed (default 20; also try `/tick rate 10`) | Java |
| `/op PlayerName` / `/deop PlayerName` | Grants or removes operator permissions on servers | Both |
| `/whitelist add PlayerName` | Restricts server access (Bedrock: `/allowlist`) | Both |
| `/reload` | Reloads data packs, functions and scripts without restarting | Both |

## The most useful command combos

Single commands are handy; stacked together they solve real problems.

**The "never lose your stuff again" setup.** Run these once and dying becomes a minor inconvenience:

```
/gamerule keepInventory true
/gamerule doImmediateRespawn true
```

**Instant fresh morning.** Skip the night and the storm in one go:

```
/time set day
/weather clear 1000000
```

**Find and reach any structure.** Run `/locate structure ancient_city`, note the coordinates it prints, then `/tp 1200 -51 340` with those numbers. Works for villages, trial chambers, bastions, anything. On Java you can click the printed coordinates in chat to auto-fill the teleport.

**Enchanting on demand.** Give yourself levels, then spend them, no mob grinding:

```
/xp add @s 30 levels        (Java)
/xp 30L @s                  (Bedrock)
/enchant @s efficiency 5
```

**Build-mode toggle.** `/gamemode creative` to fly and place freely, `/gamemode survival` when you want the stakes back. Add `/gamerule doDaylightCycle false` while you build so night never interrupts. If you need inspiration for what to build once you are in creative, our Minecraft building ideas list is a good place to start.

**Superfarm accelerator.** `/gamerule randomTickSpeed 300` makes crops grow in seconds. Set it back to 3 (Java) or 1 (Bedrock) afterwards, because it also spreads fire and decays leaves at the same crazy rate.

## Command blocks: cheats that run themselves

A command block is a block that stores one command and runs it when powered by redstone. You cannot craft it; with cheats on, give yourself one:

```
/give @s command_block
```

Place it (you must be in Creative), open it, and paste any command from this page. Three types exist: **Impulse** (runs once per redstone pulse), **Repeat** (runs every tick), and **Chain** (runs after the block behind it). A Repeat command block set to Always Active with `/effect @a night_vision 12 0 true` gives everyone permanent night vision, no potion required. On Bedrock, make sure the `commandblocksenabled` gamerule is true. Command blocks are the gateway to adventure maps and minigames; if you would rather install finished creations, see our best Minecraft mods roundup.

## Why is my command not working?

- **Cheats are off.** The number one cause. Re-check the enable steps above; on Java LAN worlds, cheats reset every session.
- **Wrong edition syntax.** `/effect give` fails on Bedrock; `/ability` fails on Java. Check the Edition column in the tables.
- **Typos in item or entity IDs.** Use Tab autocomplete; the game only accepts exact IDs like `ender_pearl`, not "enderpearl".
- **Missing permission level.** On servers you need op. Some commands (like `/stop` or `/op`) need console-level access.
- **Version drift.** Old tutorials use pre-1.13 syntax (numeric item IDs, `/gamemode 1`). Those have been dead for years; everything on this page uses current syntax.

## How this guide was reviewed

The command families and Bedrock syntax were compared with Microsoft's current command documentation. Edition differences are kept visible because a valid Java command can still fail in Bedrock, and vice versa.

## FAQ: Minecraft cheat codes

### How do I enable cheats in Minecraft without creating a new world?

On Java, open the pause menu, choose Open to LAN, and set Allow Cheats to ON for the current session. On Bedrock (including consoles), edit the world settings and toggle Activate Cheats at any time.

### Does turning on cheats disable achievements in Minecraft?

On Bedrock Edition, yes: the world is flagged the moment cheats activate, and achievements stay disabled in that world permanently. Copy the world first if you want to keep earning them. Java Edition advancements are unaffected by cheats.

### What is the give command in Minecraft?

The syntax is `/give <target> <item> <amount>`, for example `/give @s minecraft:diamond 64` for a full stack of diamonds. It works identically on Java and Bedrock for standard items.

### How do I teleport to coordinates in Minecraft?

Type `/tp <x> <y> <z>`, for example `/tp 100 64 -200`. Use `~` for your current position on any axis, so `/tp ~ ~50 ~` moves you 50 blocks straight up. You can also teleport to a player with `/tp <yourname> <theirname>`.

### What is the keep inventory command?

`/gamerule keepInventory true`. After running it, you keep all items and XP when you die. It works on Java, Bedrock, and all consoles, and it persists until you set it back to false.

### Can you use cheat codes on Minecraft PS5, Xbox, or Switch?

Yes. Consoles run Bedrock Edition, so every Bedrock command in this guide works. Enable Activate Cheats in the world settings, open chat with the d-pad, and type commands (a USB keyboard makes this much faster on PS5 and Xbox).

### Are Minecraft commands the same on Java and Bedrock?

Mostly. Core commands (give, tp, gamemode, time, weather, summon, fill) are identical or near-identical. The main differences: effect and xp use different syntax, and each edition has exclusives, like `/alwaysday`, `/ride` and `/camera` on Bedrock, or `/data`, `/attribute` and `/tick` on Java.

### Why can't I fly in Survival with cheats on?

Flight is a Creative and Spectator feature. On Bedrock you can grant it in Survival with `/ability @s mayfly true` if the Education toggle is enabled in world settings. On Java there is no vanilla Survival flight command; use `/gamemode creative` or an elytra.

### What is the most powerful command in Minecraft?

`/execute`. It can run any other command as any entity, at any location, under any condition, which is why nearly every adventure map and command-block contraption is built on it. For raw convenience, `/give`, `/tp` and `/gamemode` cover 90 percent of everyday cheating.

### How do I turn cheats off?

On Bedrock, toggle Activate Cheats off in world settings (achievements stay disabled regardless). On Java, cheats enabled via Open to LAN turn off automatically when you exit the world; for a permanent change, open the world's edit screen or re-create it with Allow Commands off.
