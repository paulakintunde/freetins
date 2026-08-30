---
slug: "skyrim-console-commands"
---

Skyrim's developer console is powerful because it can act on the player, a selected reference, a quest or the world. It is also easy to misuse: `player.additem` needs a base ID, while moving or resurrecting an existing NPC needs that specific object's reference ID.

This guide starts with safe, reversible commands and puts quest-changing commands last. Make a new manual save before changing a quest stage, faction, essential character or global variable.

## Platform support and how to open the console

The console is available in the Windows PC versions of Skyrim, Skyrim Special Edition and Skyrim Anniversary Edition. Press the key below Esc, usually tilde or grave. Regional layouts may use apostrophe, section or another key in that physical position.

PlayStation, Xbox and Nintendo Switch do not expose the developer console. Creations and platform-approved mods are separate systems and do not make PC commands available.

Commands are not case sensitive. Brackets in this guide describe a value you replace; do not type the brackets.

## The safest commands to learn first

| Command | Result | Reversible? |
|---|---|---|
| `tgm` | Toggle god mode, unlimited health, magicka and stamina | Yes, enter again |
| `tcl` | Toggle collision and move through geometry | Yes, enter again |
| `tfc` | Toggle free camera | Yes, enter again |
| `tfc 1` | Free camera and freeze action | Yes, enter again |
| `tm` | Hide or show interface menus | Yes, but the console also becomes invisible |
| `tcai` | Toggle combat AI | Yes, enter again |
| `tdetect` | Toggle NPC detection | Yes, enter again |
| `unlock` | Unlock the selected door or container | Not automatically |
| `fov 90` | Set field of view to 90 | Use `fov 0` to reset |
| `set timescale to 20` | Set normal world-time scale | Change the number again |

When using `tcl`, make sure no object is selected. If a reference ID appears at the top of the console, click empty space first. Otherwise the command may be directed at the selected object instead of the player state.

## Gold, items, carry weight and levels

| Goal | Command | Example or note |
|---|---|---|
| Add gold | `player.additem 0000000f [amount]` | `player.additem 0000000f 5000` |
| Add lockpicks | `player.additem 0000000a [amount]` | `player.additem 0000000a 100` |
| Add any item | `player.additem [BaseID] [amount]` | Requires the item's base form ID |
| Remove an item | `player.removeitem [BaseID] [amount]` | Use with care on quest items |
| Change carry weight | `player.modav carryweight [amount]` | Adds the amount to the current value |
| Set carry weight | `player.setav carryweight [value]` | Replaces the actor value |
| Set player level | `player.setlevel [level]` | Does not automatically distribute perks |
| Add perk | `player.addperk [PerkID]` | Prerequisites are not always enforced cleanly |
| Remove perk | `player.removeperk [PerkID]` | Can leave dependent perks inconsistent |
| Add dragon souls | `player.modav dragonsouls [amount]` | Adds spendable souls |

`modav` changes a value relative to its current state. `setav` replaces it. If you only want 100 more carry weight, use `player.modav carryweight 100`; setting carry weight to 100 could make the character weaker than before.

## Finding item, NPC and quest IDs

Use the console itself instead of trusting an ID copied without context.

| Need | Method |
|---|---|
| Search an item by name | `help "ebony sword" 4` |
| Search a quest by name | `help "quest name" 4` and inspect QUST rows |
| Identify a visible NPC or object | Open the console and click it |
| Scroll search output | Page Up and Page Down |
| Clear the current target | Click empty space in the world |

A base ID identifies the template used to create an object. A reference ID identifies one placed instance. `player.additem` expects the base ID; `moveto player` expects a selected or specified reference.

Anniversary Edition and Creation Club forms can begin with a load-order prefix that differs between installations. Search by name on the current installation rather than hardcoding someone else's first two digits.

## Skills, attributes and perk points

| Goal | Command | Note |
|---|---|---|
| Add skill experience | `player.advskill [skill] [amount]` | Uses experience, not desired level |
| Set a skill value | `player.setav [skill] [value]` | Changes displayed actor value but may bypass leveling |
| Add perk points | `cgf "Game.AddPerkPoints" [amount]` | Special and Anniversary Edition |
| Set health | `player.setav health [value]` | Save first before lowering |
| Set stamina | `player.setav stamina [value]` | Replaces base actor value |
| Set magicka | `player.setav magicka [value]` | Replaces base actor value |

Skill names mostly match the menu. Two common exceptions are `marksman` for Archery and `speechcraft` for Speech. Advancing a skill with experience follows the leveling system more naturally than forcing its actor value.

## Travel and location commands

| Command | Result |
|---|---|
| `coc qasmoke` | Move to the developer test cell containing item chests |
| `coc Riverwood` | Move to a named cell when the editor ID is known |
| `cow Tamriel [x] [y]` | Move to exterior world coordinates |
| `player.moveto [RefID]` | Move the player to an existing reference |
| `moveto player` | Move the selected reference to the player |
| `coc Riverwood` after qasmoke | A practical route back to the world |

The test cell is not a normal store. Taking large numbers of quest, DLC or debug objects can bloat or destabilize a save. Use direct `player.additem` commands for the few items you actually need.

## NPC and object commands

Open the console and click the target before using commands without an explicit ID.

| Command | Effect | Risk |
|---|---|---|
| `resurrect` | Rebuild the selected dead actor | Can reset inventory or quest state |
| `resurrect 1` | Revive while retaining more state | Still unsafe for scripted deaths |
| `disable` | Hide and disable the selected reference | Use `enable` to reverse |
| `enable` | Re-enable a disabled reference | Requires the same reference |
| `kill` | Kill the selected actor | Essential actors may only kneel |
| `resetai` | Reset the selected actor's AI | Useful for stuck behavior |
| `recycleactor` | Rebuild the selected actor | Can reset inventory, placement and quest state |
| `setessential [BaseID] 1` | Mark an actor essential | Uses base ID, not reference ID |
| `setrelationshiprank player 4` | Make selected NPC an ally | Does not create missing follower dialogue |

Do not resurrect a character whose death is part of a completed quest. The actor may return visually while the quest remains in the post-death state.

## Quest diagnosis before quest repair

Use read-only commands first:

| Command | Purpose |
|---|---|
| `sqt` | Show active quest targets and quest IDs |
| `showquesttargets` | Show current quest target data |
| `getstage [QuestID]` | Display the current stage |
| `sqs [QuestID]` | Show stages and whether each has run |
| `showquestvars [QuestID]` | Show quest variables |

Only after identifying the correct quest and stage should you consider:

| Command | Purpose | Warning |
|---|---|---|
| `setstage [QuestID] [Stage]` | Run a specific quest stage | Can skip scripts attached to earlier stages |
| `resetquest [QuestID]` | Reset quest state | Often leaves world objects inconsistent |
| `completequest [QuestID]` | Mark a quest complete | May not grant rewards or run cleanup |
| `caqs` | Attempt to complete every quest | Do not use on a real save |

`caqs` is frequently listed as a convenient finish-game command. It is better understood as a destructive test command: it attempts to fire stages across unrelated and mutually exclusive quests, often creating a broken save.

## Do console commands disable achievements?

Bethesda support warns that developer-console mode can interfere with Steam achievements. The cautious workflow is to make a manual save, use commands in a separate session, close Skyrim completely, restart, and load the clean save before achievement play.

Mods have a separate and clearer rule: Bethesda states that a save with mods enabled cannot earn achievements or trophies without an unsupported workaround.

## Common reasons commands fail

- The wrong object is selected.
- A base ID was used where a reference ID is required, or the reverse.
- A Creation Club form has a different load-order prefix.
- Brackets were typed literally.
- A quest command used the displayed journal title instead of the internal quest ID.
- The console key differs because of the keyboard layout.
- The player is on console hardware, where the developer console does not exist.

For related Creation Engine syntax, continue to [Fallout 4 console commands](/cheats/fallout-4/). For a game with official platform cheats rather than a developer console, see [Red Dead Redemption 2 cheats](/cheats/red-dead-redemption-2/).

## How this guide was reviewed

Command syntax was checked against the UESP console reference and a current Special and Anniversary Edition guide. Achievement wording follows Bethesda support rather than assuming that every command has identical persistence across launchers and builds.
