---
name: testing-wedding-uploads
description: How to end-to-end test the wedding-uploads static site (GitHub Pages + Apps Script + Drive resumable upload), including Android emulator setup on the box.
---

# Testing wedding-uploads

## Site
- Live at https://mariostoump.github.io/wedding-uploads/ (deploys ~1 min after push to main). Source: index.html (single file).
- Backend: Google Apps Script URL in `BACKEND_URL` (index.html ~line 136). Flow: POST {action:'initiate',...} → JSON {ok, uploadUrl} → browser PUTs 8MB chunks to googleapis.com with Content-Range.
- Known failure mode: PUT to the resumable uploadUrl is blocked by CORS ("No 'Access-Control-Allow-Origin' header") when the Apps Script initiates the session without an `Origin: https://mariostoump.github.io` header on its UrlFetchApp call. The PUT can still return 200 server-side (file may land in Drive) while the browser reports failure. Check the couple's Drive folder to confirm.

## Test files
- Create jpg with Pillow; create ~20MB video with ffmpeg (`-b:v 5300k -minrate -maxrate` + `noise` filter; plain testsrc undershoots bitrate badly).

## Android emulator on this box
- KVM exists but ubuntu lacks perms: `sudo -n chmod 666 /dev/kvm` (needed after every reboot).
- SDK at ~/Android (cmdline-tools/latest, platform-tools, emulator, system-images;android-34;google_apis;x86_64). AVD "test" (pixel_6).
- Launch: `DISPLAY=:0 ~/Android/emulator/emulator -avd test -gpu swiftshader_indirect -no-snapshot -memory 3072`. Boot takes ~3-5 min (nested virt, 2 cores); poll `adb shell getprop sys.boot_completed`.
- Dismiss host-side "Nested Virtualization"/"Compatibility Warnings" dialogs and Android "System UI isn't responding" → Wait.
- Push test media: `adb push f.jpg /sdcard/Download/` + MEDIA_SCANNER_SCAN_FILE broadcast.
- Open page: `adb shell am start -a android.intent.action.VIEW -d URL com.android.chrome`.
- Host-window clicks on the emulator sometimes don't register on page elements; use `adb shell input tap X Y` with device coords (device 1080x2400; map from the emulator window geometry).
- Type text with `adb shell input text 'a%sb'` (%s = space).
- Chrome photo permission prompt: choose "Allow all", then tap the drop zone again to get the "Select images" picker.
