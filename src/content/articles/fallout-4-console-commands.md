---
slug: "fallout-4-console-commands"
---

Fallout 4's developer console is a Windows PC tool. It can add items, move actors, change settlements and repair quest stages, but it can also make a bad quest state permanent. Start with a new manual save and identify whether a command expects the player, a selected reference or a base form ID.

The console is unavailable on PlayStation, Xbox and Nintendo Switch. Approved Creations on those platforms are not the same thing as console commands. Survival mode also disables normal console access.

## How to open the Fallout 4 console

Press the key below Esc during gameplay. On a US keyboard this is usually tilde or grave. Regional layouts may use apostrophe or another symbol in the same position.

Type a command, press Enter, then press the console key again to return to play. Commands are not case sensitive. Replace bracketed examples with your value and leave the brackets out.

If the console will not open:

1. leave Survival mode;
2. test the physical key below Esc;
3. switch temporarily to a US keyboard layout;
4. disconnect controller-only overlays that capture the key;
5. confirm you are using the Windows PC release.

## Essential toggle and camera commands

| Command | Effect | Reset |
|---|---|---|
| `tgm` | God mode, unlimited health, ammo and carry capacity | Enter again |
| `tim` | Immortal mode, health can fall but the player does not die | Enter again |
| `tcl` | Toggle collision and noclip | Enter again |
| `tfc` | Toggle free camera | Enter again |
| `tfc 1` | Free camera with action frozen | Enter again |
| `tm` | Hide or show interface menus | Enter again, even though the console is hidden |
| `tai` | Toggle all AI | Enter again |
| `tcai` | Toggle combat AI | Enter again |
| `tdetect` | Toggle AI detection of the player | Enter again |
| `csb` | Clear blood and explosion screen effects | Immediate cleanup |
| `fov 90 90` | Set first- and third-person field of view | `fov 0 0` |
| `set timescale to 20` | Restore the standard passage of game time | Change the number |

For `tcl`, click empty space first so no object reference is selected. A selected object can receive a target command when you intended to change the player state.

## Caps, bobby pins, items and equipment

| Goal | Command | Example |
|---|---|---|
| Add caps | `player.additem 0000000f [amount]` | `player.additem 0000000f 5000` |
| Add bobby pins | `player.additem 0000000a [amount]` | `player.additem 0000000a 100` |
| Add an item | `player.additem [BaseID] [amount]` | Search the base ID first |
| Remove an item | `player.removeitem [BaseID] [amount]` | Avoid quest items |
| Equip an item | `player.equipitem [BaseID]` | Item should already be present |
| Unequip an item | `player.unequipitem [BaseID]` | Does not remove it |
| Show player inventory IDs | `player.showinventory` | Useful when names are ambiguous |
| Search forms by name | `help "combat armor" 4` | Use Page Up and Page Down |

DLC and Creation Club item IDs can start with a load-order prefix that changes between installations. Search by name on your own build instead of copying the first two digits from another player's load order.

## SPECIAL, levels, health and carry weight

| Goal | Command | Important distinction |
|---|---|---|
| Set level | `player.setlevel [level]` | Does not simulate every normal level-up event |
| Add to an actor value | `player.modav [value] [amount]` | Relative change |
| Set an actor value | `player.setav [value] [number]` | Absolute replacement |
| Restore health | `player.resethealth` | Resets current health state |
| Add carry capacity | `player.modav carryweight 100` | Adds 100 to current capacity |
| Set Strength | `player.setav strength 10` | Replaces the base actor value |
| Set movement speed | `player.setav speedmult 100` | 100 is the normal baseline |
| Change jump height | `setgs fJumpHeightMin [number]` | Use god mode before testing high values |

Use `modav` when you want more of something and `setav` when you know the intended final value. Setting speed or jump height far outside normal ranges can break animation, physics and interiors.

## Common item IDs

| Item | Base ID | Example |
|---|---|---|
| Bottlecap | `0000000f` | `player.additem 0000000f 1000` |
| Bobby pin | `0000000a` | `player.additem 0000000a 50` |
| Stimpak | `00023736` | `player.additem 00023736 20` |
| RadAway | `00023742` | `player.additem 00023742 10` |
| Fusion core | `00075fe4` | `player.additem 00075fe4 10` |
| Mini nuke | `000e6b2e` | `player.additem 000e6b2e 5` |

Use these for convenience, not as proof that every item shares a fixed prefix. Add-on content is load-order dependent.

## Finding NPC, object, quest and location IDs

| Need | Method |
|---|---|
| Identify an object in front of you | Open console and click it |
| Search a form by name | `help "name" 4` |
| Search all matching record types | `help "name" 0` |
| Show selected reference ID | Read the ID at the top of the console |
| Move through search results | Page Up and Page Down |
| Find active quest targets | `sqt` |

Base IDs describe a form, such as a weapon template. Reference IDs identify one placed actor, door or object. `player.additem` needs a base ID; moving a particular companion needs that companion's reference.

## NPC and companion commands

Select the NPC in the world before using commands without an explicit ID.

| Command | Effect | Risk |
|---|---|---|
| `kill` | Kill selected non-essential actor | Quest actors may become unavailable |
| `resurrect` | Rebuild selected dead actor | Can reset inventory and quest state |
| `resetai` | Reset selected actor AI | Good first attempt for stuck behavior |
| `recycleactor` | Rebuild selected actor | More destructive than `resetai` |
| `disable` | Disable and hide selected reference | Reverse with `enable` while still targeted |
| `enable` | Re-enable selected reference | Requires the correct reference |
| `moveto player` | Move selected actor to the player | Safer than spawning a duplicate |
| `getav CA_affinity` | Read selected companion affinity | Diagnostic |
| `setav CA_affinity [number]` | Set selected companion affinity | Dialogue triggers may not fire automatically |
| `unequipall` | Unequip selected actor | Items remain in inventory |

If a companion is missing, move the existing reference to the player. Spawning a new copy creates a duplicate that may look correct but is not the quest-linked companion.

## Settlement building commands

Settlement objects are references. Click the exact object before changing it.

| Goal | Command | Note |
|---|---|---|
| Change object size | `setscale [number]` | 1 is normal scale |
| Move selected object | `setpos x [number]`, then y or z | Uses world coordinates |
| Rotate selected object | `setangle x [number]`, then y or z | Save before complex placement |
| Disable selected scrap object | `disable` | Do not use on the settlement workbench |
| Re-enable it | `enable` | Target must still be known |

Console placement bypasses workshop snapping and safety checks. Avoid disabling the workshop, settlement marker, invisible navmesh helpers or scripted resource objects.

## Quest diagnosis and repair

Read the quest state before changing it.

| Command | Purpose |
|---|---|
| `sqt` | Show current quest targets and IDs |
| `getstage [QuestID]` | Show the current stage |
| `sqs [QuestID]` | List stages and completion flags |
| `showquestvars [QuestID]` | Display quest variables |
| `movetoqt [QuestID]` | Move to the current quest target |

Repair commands should be the last step:

| Command | Effect | Warning |
|---|---|---|
| `setstage [QuestID] [Stage]` | Run a selected stage | Can skip scripts and rewards |
| `completeallobjectives [QuestID]` | Mark current objectives complete | Does not guarantee quest cleanup |
| `completequest [QuestID]` | Mark the quest complete | May skip consequences |
| `resetquest [QuestID]` | Reset quest state | World references may not reset with it |
| `caqs` | Attempt to complete the main quest chain | Can spoil and destabilize the save |

Do not use `caqs` as a routine finish-game shortcut. It is a developer test command that can fire incompatible quest stages and produce a save with contradictory faction outcomes.

## Useful location commands

| Command | Destination |
|---|---|
| `coc qasmoke` | Developer test cell with item containers |
| `coc SanctuaryExt` | Sanctuary exterior |
| `coc RedRocketExt` | Red Rocket exterior |
| `coc DiamondCityMarket` | Diamond City market |

The test cell is useful for identifying items, but taking entire containers can overload inventory and introduce quest objects. Add only the forms you need, then leave with a normal `coc` destination.

## Achievements, Survival mode and safe saves

Bethesda support warns that entering developer mode can flag further progress. Keep a clean manual save, avoid overwriting it, exit Fallout 4 completely after command use, and relaunch before continuing an achievement-focused run.

Survival mode intentionally blocks the normal console. Disabling Survival or using unsupported configuration changes can alter the save's rules and should not be presented as a harmless toggle.

## Common reasons a Fallout 4 command fails

- The command needs a selected reference and nothing is selected.
- A base form ID was used instead of a placed reference ID.
- A DLC prefix differs because the load order changed.
- Brackets were typed around a value.
- The item name contains spaces but was searched without quotation marks.
- The selected object is an invisible helper behind the object you meant to click.
- Survival mode or console hardware does not provide normal developer-console access.

For similar Bethesda syntax in a fantasy setting, see [Skyrim console commands](/cheats/skyrim/). For a platform-wide cheat menu that does not require developer tools, see [Red Dead Redemption 2 cheats](/cheats/red-dead-redemption-2/).

## How this guide was reviewed

Command behavior was compared across the Fallout Wiki, a current practical command guide and Bethesda's developer-mode support notice. High-risk commands are separated from reversible toggles, and load-order-dependent IDs are explained rather than presented as universal constants.
