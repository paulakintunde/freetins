---
slug: "baldurs-gate-3-cheats"
---

**Baldur's Gate 3 has no player-facing built-in cheat console.** There is no retail `player.additem` equivalent to type. The practical routes are curated mods, the unsupported Script Extender console on PC, or direct save editing.

Two of those three are PC only. On PS5 and Xbox you get official mods and nothing else.

And the first thing to know before you touch any of it: **mods automatically disable achievements**, on every platform, including mods installed through Larian's own in-game manager.

## Baldur's Gate 3 cheat mods: what each one actually gives you

The table records options from the reviewed source snapshot, not a promise that every mod remains available after the next patch. Confirm the current platform badge and compatibility note in the in-game Browse tab or on the mod page before installing.

| Mod | What it does | Platform | Breaks achievements |
|---|---|---|---|
| **Tutorial Chest Summoning** | Grants an ability that summons the tutorial chest anywhere, holding every item in the game plus anything your mods added. The closest thing BG3 has to an item spawner. | PC (Nexus) | Yes |
| **Cheaters Spell Scroll** | Spawns chests containing all in-game equipment, delivered as a castable scroll | PC, PS5, Xbox (mod.io) | Yes |
| **Adjustable Party Limit** | Sets your party cap to any number from **1 to 16**. Also patches the Act 1 boat and long rest bugs that big parties used to cause. Multiplayer stays capped at 4. | PC, PS5, Xbox (mod.io) | Yes |
| **Weightless Gold** | Removes carry weight from gold, so you can hoard without going Encumbered | PC, PS5, Xbox (mod.io) | Yes |
| **Double XP** | Doubles experience gain for the whole party | PC, PS5, Xbox (mod.io) | Yes |
| **Unlock Level Curve** | Raises the cap from 12 to **level 20**, unlocking the spells and class features Larian cut | PC (Nexus) | Yes |
| **Ultimate Cheat Spell Collection** | Cheats delivered as castable spells: gold, healing, teleports, instant kills | PC (Nexus) | Yes |
| **Native Camera Tweaks** | Unlocks camera pitch, zoom and field of view. Needs Native Mod Loader. | PC (Nexus) | Yes |
| **Respec Illithid Powers** | Refunds spent illithid points so you can rebuild the tadpole tree | PC (Nexus) | Yes |
| **Achievement Enabler** | Re-enables Steam and GOG achievements while other mods are active. Version 1.3, updated 11 August 2025 for Patch 8. | PC only (`bin\NativeMods`) | No, it reverses it |

Larian vets console mods in batches, so the console list grows and occasionally shifts. The most recent batch landed on **7 May 2026** and added over 20 new vetted mods including the Shadar-Kai race and new Barbarian, Bard and Monk subclasses. Always confirm in the in-game Browse tab before you plan a build around a mod.

### You do not need a mod for respec or multiclass

Withers charges a flat **100 gold** to respec, the price never rises, and you can do it as many times as you like. Baldur's Gate 3 also drops the D&D 5e ability score prerequisites for multiclassing entirely, so any class can take a level in any other class at level-up with no minimum stat check.

Mods marketed as "free respec" or "free multiclass" are mostly removing a cost that is already trivial. Skip them.

## How to enable the developer console on PC

The commonly used PC console is the Lua console bundled with **Norbyte's Baldur's Gate 3 Script Extender (BG3SE)**. It is an unsupported community tool whose compatibility can change after a game patch.

1. Download the current Script Extender release from Norbyte's GitHub releases or the Nexus page, or install it through BG3 Mod Manager's tools menu.
2. Open your game's `bin` folder. On Steam that is usually `steamapps\common\Baldurs Gate 3\bin`.
3. Create a file called exactly **`ScriptExtenderSettings.json`** in that folder, or open the existing one.
4. Add the line `"CreateConsole": true` inside the braces. If the file already had entries, watch your commas: one too many or too few and the file will not load at all.
5. Launch the game. A second window that looks like a command prompt opens alongside it.
6. Load a save first. Commands do nothing at the main menu.
7. Click the console window and press **Enter**. The prompt changes to **`S >>`**, which means it is accepting server-side input.

### What the console can actually do

| Command | What it does |
|---|---|
| `AddGold(GetHostCharacter(), 10000)` | Adds **10,000 gold** to your main character |
| `TemplateAddTo("UUID", GetHostCharacter(), 1)` | Spawns one copy of an item, using that item's UUID |
| `Osi.AddExplorationExperience(GetHostCharacter(), 10000)` | Adds XP. Run it once per party member, it does not share. |
| `Osi.GiveInspirationPoints(GetHostCharacter(), 4, "", "")` | Adds inspiration points for reroll fuel |

The item spawner is the weak point. `TemplateAddTo` needs the exact UUID for the item you want, and there is no complete public list. Community UUID sheets on Nexus cover weapons, armour and consumables but are openly incomplete on arrows, camp clothing, alchemy ingredients and camp supplies. For pure item grabbing, **Tutorial Chest Summoning is faster than the console** because it hands you the whole loot table in one container.

## Official mod manager vs BG3 Mod Manager: which one breaks things

Since Patch 7 the game has its own mod manager built in, with a Browse tab and an Installed tab, backed by a curated mod.io catalogue and a linked Larian and mod.io account. It is the only option on console and the safest option on PC.

**BG3 Mod Manager** (the third-party tool by LaughingLeader) is still needed on PC for anything Nexus-only, for manual `.pak` files and for load order control the official manager does not give you.

The conflict is a file called `modsettings.lsx`. Both tools write to it, the game re-applies its own mod set at every launch, and whichever tool wrote last wins.

Neither manager corrupts saves on its own. What breaks saves is a mod list that no longer matches what the save expects: if your load order gets reverted and a mod silently drops out, the save can refuse to load or load stripped back.

**If you run both on PC:**

1. Subscribe to mod.io mods in the in-game manager first.
2. Drop Nexus-only `.pak` files into `%LOCALAPPDATA%\Larian Studios\Baldur's Gate 3\Mods`.
3. Open BG3 Mod Manager, refresh, set your load order, export to game.
4. Do not reopen the in-game manager before you play, or it will re-apply its own order.
5. Keep a screenshot of your active mod list. You will need it if a save stops loading.

## Do BG3 cheats work on PS5 and Xbox?

Yes, but only through official mods, and the selection is far narrower than PC.

- Console mods must be built with Larian's official **Toolkit**, and the Toolkit is PC only. Anything using Script Extender, Native Mod Loader or a `.dll` will never appear on console.
- There is a hard **100 active mod limit per save** on PS5 and Xbox, added in a console-only hotfix after players hit crashes and long load times. Go over it and the save becomes unloadable until you disable mods.
- Cross-save between PC and console only works if every mod on the save is one of the console-approved ones. A PC save carrying Nexus mods will not open on PS5.
- No Script Extender console. No save editing. No Achievement Enabler.

So on console the practical cheat list is: **Adjustable Party Limit, Double XP, Cheaters Spell Scroll and Weightless Gold**, plus whatever content mods are in the current vetted batch.

## Save editing: the no-mod route on PC

If you want one number changed and nothing else touched, edit the save. BG3 saves are `.lsv` archives.

1. Back up the save folder first: `%LOCALAPPDATA%\Larian Studios\Baldur's Gate 3\PlayerProfiles\Public\Savegames\Story`.
2. Use **LSLib** (Norbyte's toolkit, the same author as the Script Extender) to unpack the `.lsv`.
3. Convert the LSF files inside to readable LSX.
4. Edit the values you want, repack, and load the save.

Community GUI front-ends on GitHub wrap this in a friendlier interface, but they are convenience layers over LSLib rather than separate tools.

Two honest warnings. Save edits sometimes revert on load, a long-standing known issue where the game re-derives your changed value from elsewhere in the file. And the launcher's data-mismatch check does not care that you avoided mods: an edited save can still flag.

## Baldur's Gate 3 exploits that need no mods at all

These are save and combat tactics recorded in the source draft, not supported cheat features. Patch behavior can change, so use a backup save and do not build an Honour Mode run around an exploit continuing to work.

- **Bench your fourth party member in Honour Mode.** The run only ends when your whole active party dies, and camp members still share XP. Three in the fight, one safe at camp.
- **Travel between regions to full-heal.** Crossing a region boundary restores missing HP for the whole party. It does not restore spell slots.
- **Split merchant gold before pickpocketing.** Large stacks have terrible steal odds. Split them small and lift one at a time, with a disposable hireling doing the stealing so a failure does not sour a real companion's merchant.
- **Attack before combat starts, then talk it down.** In some areas, including the Goblin Camp, you can land hits without triggering initiative and then pass a Persuasion check to defuse it.
- **Quicksave before every meaningful roll.** Standard save scumming. Not available in Honour Mode, which uses a single rolling save.

Feign Death on merchants no longer works. Larian patched that one out.

## What cheating in BG3 actually breaks

### Achievements

Larian is explicit: achievements are automatically disabled when you are using mods. That includes mods installed through the official in-game manager, and it includes purely cosmetic ones like hairstyles, dice skins and UI tweaks. Independent testing by outlets tracking the launcher's data-mismatch warning matches Larian's wording.

On PC the **Achievement Enabler** mod restores them. On PS5 and Xbox there is no equivalent, so a modded console run gets zero trophies.

### Multiplayer

Everyone in the session needs the **exact same mods at the exact same versions**. The game shows a verification window when you load a save or join a session and offers to download, enable, update or downgrade to match the host.

Third-party PC mods do not sync at all across platforms, so a PC host running Nexus mods cannot host a console player.

### Patch days

A mod built against an older game version can stop the game loading, or load and quietly drop the content your save depends on. This is not theoretical for BG3: the **16 February 2026 patch was itself a corrupted-save fix**, aimed at players stuck loading saves or moving from Act 2 into Act 3.

Note your mod list before any update. After it, launch once with mods disabled to confirm the base game is healthy, then re-enable in batches.

### Honour Mode

Honour Mode uses one save with no reloading, so it is the mode most exposed to everything above. Because mods kill achievements, a modded Honour run cannot earn the Foehammer achievement, which is the entire reason most people attempt it.

There is a well-known workaround where players hard-shut-down the machine before a death autosave writes. It works. It also risks the save file, which is the one thing you cannot replace in Honour Mode.

## Why are my BG3 cheats or console commands not working?

In order of how often it happens:

1. **You typed into the console at the main menu.** Load a save first. Nothing fires until a character exists.
2. **The prompt is not showing `S >>`.** Click the console window and press Enter to enter input mode.
3. **Script Extender did not update after a game patch.** New extender builds are only released for the current game version. Anything older than Patch 5 is unsupported outright.
4. **Your JSON is malformed.** A stray or missing comma in `ScriptExtenderSettings.json` stops the whole file loading, and the console simply never appears.
5. **The in-game manager overwrote your load order.** If you opened it after exporting from BG3 Mod Manager, the game re-applied its own set at launch.
6. **You are over the 100 mod console limit.** The save will not open until you drop below it, which on console means disabling mods from a linked PC or waiting for a fix.
7. **You are on console expecting a PC mod.** Nexus mods, Script Extender and Cheat Engine do not exist on PS5 or Xbox and never will.

## What to avoid

| Thing | Why | Verdict |
|---|---|---|
| Mod Fixer | Only needed before Patch 7 added official mod support. Mod authors now tell you to remove it. | Do not install |
| Cheat Engine tables from random forums | Unsigned executables aimed at an anti-cheat-free single-player game. The risk is your PC, not your save. | Skip |
| Paid trainer subscriptions | Everything they offer is free through the Script Extender console or a Nexus mod | Not worth paying for |
| Hand-editing `modsettings.lsx` | The game re-applies its own mod set at launch and wipes your edit | Does not stick |
| Loading 100+ mods on console | Hard cap. The save becomes unloadable. | Avoid |
| Cross-saving a Nexus-modded PC save to PS5 | Console only accepts approved mods, so the save will not open | Will not work |

## How this guide was reviewed

The supported-mod route and console restrictions were checked against Larian's modding guidance and the current mod.io catalogue. Script Extender and save editing are explicitly treated as unsupported PC tools whose compatibility can change after patches.

## FAQ: Baldur's Gate 3 cheats

**Does Baldur's Gate 3 have console commands?**
Not natively. Larian never enabled a debug console for players, so there is no command line built into the game. The only working console is the Lua console included with Norbyte's Script Extender mod, which is PC only. On PS5 and Xbox no console exists in any form.

**How do I open the developer console in BG3?**
Install a Script Extender release compatible with your current game build, then create `ScriptExtenderSettings.json` in the game's `bin` folder containing `"CreateConsole": true`. Launch the game and a second command-prompt window opens. Load a save, click that window, press Enter, and wait for the `S >>` prompt before typing.

**Do BG3 mods disable achievements?**
Yes. Larian confirms achievements are automatically switched off while mods are active, including cosmetic mods and mods installed through the official in-game manager. On PC the Achievement Enabler mod restores them. On PS5 and Xbox there is no workaround, so a modded console run earns no trophies.

**Can I use cheats on PS5 and Xbox?**
Only official mods from the in-game manager, capped at 100 active mods per save. Useful ones include Adjustable Party Limit, Double XP, Weightless Gold and Cheaters Spell Scroll. Script Extender, Nexus mods, save editing and Cheat Engine are all PC only and will not come to console.

**Is there an unlimited gold cheat in BG3?**
On PC, `AddGold(GetHostCharacter(), 10000)` in the Script Extender console gives you as much as you want, repeatable. On console, the closest option is pickpocketing merchants after splitting their gold into small stacks, which needs no mods and works on every platform.

**Do cheats work in Honour Mode?**
Mechanically yes, but you lose the point of it. Mods disable achievements, so a modded Honour run cannot earn Foehammer. The no-mod exploits still apply: bench a fourth companion at camp so a party wipe cannot happen, and cross region boundaries to full-heal between fights.

**Will mods break my save when the game updates?**
They can. A mod built for an older version may stop the save loading or silently remove content the save depends on. The February 2026 patch was specifically a fix for corrupted saves. After any update, launch once with all mods off, confirm the base game loads, then re-enable in small batches.

**Can I use mods in multiplayer?**
Yes, if every player has identical mods at identical versions. The game shows a verification window on load or join and offers to download, enable, update or downgrade to match. Third-party PC mods do not sync across platforms, so a Nexus-modded PC host cannot play with console players.

**How do I check whether a BG3 mod still supports my build?**
Check the mod's current game-version badge and recent update notes in the in-game Browse tab or its mod page. Script Extender, native plugins and save editors need extra care because a game hotfix can break them independently of curated mods.
