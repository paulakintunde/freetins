---
slug: iphone-dial-codes-carrier-limits
---

iPhone dial codes are short sequences entered in the Phone app. Some display device or account information, while others change carrier services such as call forwarding or caller ID. They are not universal iPhone commands. Support depends on the carrier, country, plan, network type, and sometimes the SIM used for the call.

## Use Settings before a dial code

For common tasks, Apple’s Settings interface is clearer because it shows the current state and reduces the chance of changing the wrong service. Use Settings to find identifiers, manage call forwarding when the carrier exposes it, and control caller ID where supported.

| Task | Preferred route | Why |
|---|---|---|
| Find IMEI or serial number | Settings, General, About | Displays identifiers without entering a carrier command |
| Forward calls | Settings, Apps, Phone, Call Forwarding, when available | Shows the destination and current switch state |
| Change caller ID display | Settings, Apps, Phone, Show My Caller ID, when available | Makes the setting visible and reversible |
| Check carrier account use | Carrier app or account website | Uses the carrier’s current account data |
| Open diagnostic information | Apple Support or carrier instructions for the specific device and network | Diagnostic screens can expose private network details |

Apple’s [device identifier instructions](https://support.apple.com/en-us/108037) describe several ways to locate the serial number, IMEI, EID, and related identifiers. These values should be redacted from screenshots and support posts.

## One informational example: display the IMEI

T-Mobile’s current [self-service and short-code reference](https://www.t-mobile.com/support/plans-features/self-service-short-codes/) documents `*#06#` as a way to display a device’s IMEI. Enter the sequence in the Phone keypad. On supported devices and service configurations, the identifier screen appears without placing an ordinary call.

The same information is available under Settings, General, About. Use the Settings route when preparing a screenshot because it is easier to confirm which identifier is shown. Never publish the full IMEI, EID, ICCID, phone number, or SIM details.

This example is informational. It does not unlock the phone, improve reception, reveal a password, or detect surveillance.

## Carrier service codes can change account behavior

Codes for forwarding, call waiting, caller ID, voicemail, balances, and spam controls belong to the carrier service layer. A sequence copied from another country or carrier may fail, return an error, call an unrelated service, or change a different setting.

Before using a service-changing code:

1. Open the support page for the carrier and country attached to the active line.
2. Confirm the code applies to the plan and network type.
3. Record the current setting in the carrier app or iPhone Settings.
4. Find the carrier’s reversal or reset instruction before making the change.
5. Test on a line you are authorized to manage.
6. Confirm the result with a controlled incoming or outgoing call.

Do not experiment with a work phone, emergency line, shared family line, or a number used for account recovery. A forwarding change can redirect calls that contain private information or one-time codes.

## Call forwarding is not evidence of phone monitoring

Apple’s [call-forwarding guide](https://support.apple.com/guide/iphone/set-up-call-forwarding-iph7405291c4/ios) says the Settings option depends on cellular service and network support. On some networks, Apple directs the user to the carrier.

A forwarding status or destination can reflect voicemail, conditional forwarding when the line is busy, or another carrier feature. It does not by itself prove that someone is intercepting calls. Viral lists that label every forwarding response as spyware evidence omit the carrier configuration needed to interpret the result.

If forwarding appears wrong, use the carrier’s account tools or contact its support team. Ask which forwarding conditions are active and how voicemail is represented. Do not reset network or account features with an unattributed code.

## Why a documented code may not work

| Symptom | Likely explanation | Next action |
|---|---|---|
| “Invalid code” or no response | Carrier, plan, or network does not support it | Use the carrier app or contact support |
| Code works on one SIM only | Dual-SIM lines use different carriers or service profiles | Confirm which line the Phone app used |
| Setting returns after being disabled | Voicemail or account provisioning restores conditional forwarding | Ask the carrier how voicemail routing is configured |
| Result differs while roaming | The visited network handles the request differently | Wait for the home network or use account support |
| A web list gives a different sequence | The list may cover another carrier or country | Prefer a current carrier-owned source |

Restarting the iPhone does not necessarily reverse a carrier-side change. The setting may live on the network rather than only on the device.

## Dual SIM requires an extra check

An iPhone with a physical SIM and eSIM, or two eSIMs, can have separate carrier features for each line. Before dialing a code, confirm the selected outgoing line in the Phone app. Then verify the result against the same line’s carrier account.

When documenting a test, record the iPhone model, iOS version, country, carrier, plan type, selected line, code source, expected result, observed result, and restoration step. Do not generalize one line’s response to all iPhones.

## Avoid copied “secret code” lists

Large lists commonly mix Android manufacturer menus, old GSM commands, carrier billing shortcuts, and codes that change services. The presence of asterisks and number signs does not make a sequence an Apple feature.

Reject a list when it lacks:

- A current Apple or carrier source
- A named country and carrier
- A description of whether the code displays or changes information
- A reversal step for service changes
- Privacy guidance for the result

Use Apple Settings for device information and visible controls. Use the carrier’s current support page for network services. That approach provides fewer codes, but each instruction has a defined owner, scope, and recovery path.
