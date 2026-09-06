<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<meta name="design_doc_mode" content="canvas">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=block" rel="stylesheet">
<style>
  body { margin:0; background:#070C0E; }
  a { color:#6BD69B; text-decoration:none; }
  a:hover { color:#93E4B8; }
  *::-webkit-scrollbar { width:0; height:0; }
</style>
</helmet>

<section style="background:radial-gradient(1200px 700px at 10% -10%, #1A2620 0%, #070C0E 55%, #070C0E 100%);padding:64px 52px 88px;font-family:Manrope,-apple-system,sans-serif;box-sizing:border-box">

  <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:16px">
    <div style="display:flex;align-items:center;gap:12px">
      <span style="height:24px;padding:0 10px;border-radius:8px;background:#E8B15A;color:#1A1206;display:flex;align-items:center;font-size:12px;font-weight:800;letter-spacing:0.02em">3</span>
      <div style="font-size:30px;font-weight:700;color:#E9F0EE;letter-spacing:-0.03em">The first ten minutes</div>
    </div>
    <div style="font-size:15px;color:#8A9A96;letter-spacing:-0.01em;max-width:800px;text-wrap:pretty">The fix for a first-time user is to stop asking them what they don't know. Show the deal, teach the three buttons in five taps, then make session zero a <b style="color:#B4C2BE;font-weight:600">diagnostic</b> — ten balls, no score — and let the app be the one that names their miss. The plan is the reward for finishing, not a form to fill in first.</div>
  </div>
  <div style="display:flex;gap:22px;flex-wrap:wrap;align-items:center;margin-bottom:44px;font-size:13px;color:#687773">
    <span>4 screens, ~90 seconds</span><span>·</span><span>no account, no typing</span><span>·</span><span>10 balls to first insight</span><span>·</span><span>quiz is now the fallback, not the door</span>
  </div>

  <div style="display:flex;flex-wrap:wrap;gap:60px;align-items:flex-start">

    <!-- ===== 3a · THE DEAL ===== -->
    <div id="3a" style="display:flex;flex-direction:column;gap:14px;width:390px">
      <div style="display:flex;align-items:center;gap:9px;font-size:13px;font-weight:700;color:#E9F0EE;letter-spacing:-0.01em"><span style="height:20px;padding:0 8px;border-radius:7px;background:#141B1F;border:1px solid #263237;color:#8A9A96;display:flex;align-items:center;font-size:11px;font-weight:800">3a</span>Answer “what am I signing up for?”</div>
      <div style="font-size:13px;line-height:1.5;color:#687773;text-wrap:pretty">Before any question: the shape of the commitment and the thing you get at the end. Ten balls is a small enough ask that nobody bounces.</div>
      <div style="width:390px;height:844px;background:#0B1013;border:1px solid #263237;border-radius:40px;overflow:hidden;display:flex;flex-direction:column;color:#E9F0EE;font-variant-numeric:tabular-nums;box-shadow:inset 0 1px 0 rgba(255,255,255,0.05), 0 40px 80px -40px rgba(0,0,0,0.9)">
        <div style="flex:none;display:flex;align-items:center;justify-content:space-between;padding:18px 28px 6px;font-size:13px;font-weight:700"><span>9:41</span><span style="display:flex;align-items:center;gap:5px;font-family:'Material Symbols Rounded';font-size:15px;color:#B4C2BE" aria-hidden="true"><span>network_wifi</span><span>battery_full</span></span></div>

        <div style="flex:1;overflow:auto;padding:28px 26px 26px;display:flex;flex-direction:column;gap:22px">
          <div style="flex:none;display:flex;flex-direction:column;gap:14px">
            <div style="width:52px;height:52px;border-radius:17px;background:#6BD69B;color:#08120D;display:flex;align-items:center;justify-content:center;font-family:'Material Symbols Rounded';font-size:27px;font-variation-settings:'FILL' 1" aria-hidden="true">sports_golf</div>
            <div style="font-size:32px;font-weight:800;letter-spacing:-0.04em;line-height:1.1;text-wrap:pretty">Ten balls tonight, and I'll tell you what you're doing.</div>
            <div style="font-size:16px;line-height:1.55;color:#B4C2BE;text-wrap:pretty">No swing video, no sensors. Just log where each one goes — the pattern is the diagnosis.</div>
          </div>

          <div style="flex:none;display:flex;flex-direction:column;gap:0;background:#141B1F;border:1px solid #3A4A50;border-radius:22px;padding:18px">
            <div style="display:flex;gap:14px;padding-bottom:16px">
              <span style="flex:none;width:30px;height:30px;border-radius:10px;background:#6BD69B;color:#08120D;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800">1</span>
              <div style="display:flex;flex-direction:column;gap:3px"><span style="font-size:16px;font-weight:700">Tonight · 10 balls</span><span style="font-size:14px;line-height:1.45;color:#B4C2BE">Five minutes. You find out your miss.</span></div>
            </div>
            <div style="display:flex;gap:14px;padding-bottom:16px;border-top:1px solid #263237;padding-top:16px">
              <span style="flex:none;width:30px;height:30px;border-radius:10px;background:#1F292E;border:1px solid #3A4A50;color:#B4C2BE;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800">2</span>
              <div style="display:flex;flex-direction:column;gap:3px"><span style="font-size:16px;font-weight:700">Four weeks · 8 sessions</span><span style="font-size:14px;line-height:1.45;color:#B4C2BE">35 minutes each, built around that miss.</span></div>
            </div>
            <div style="display:flex;gap:14px;border-top:1px solid #263237;padding-top:16px">
              <span style="flex:none;width:30px;height:30px;border-radius:10px;background:#1F292E;border:1px solid #3A4A50;color:#B4C2BE;display:flex;align-items:center;justify-content:center;font-family:'Material Symbols Rounded';font-size:17px" aria-hidden="true">workspace_premium</span>
              <div style="display:flex;flex-direction:column;gap:3px"><span style="font-size:16px;font-weight:700">Then we re-test</span><span style="font-size:14px;line-height:1.45;color:#B4C2BE">Same ten balls. You see the number move — or we change the plan.</span></div>
            </div>
          </div>

          <div style="flex:none;display:flex;flex-direction:column;gap:9px">
            <div style="font-size:12px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:#8A9A96">What you'll have in four weeks</div>
            <div style="background:linear-gradient(158deg,#1B2E26 0%,#141B1F 62%);border:1px solid #2C4238;border-radius:20px;padding:18px;display:flex;align-items:center;gap:16px">
              <span style="font-size:46px;font-weight:800;line-height:0.85;letter-spacing:-0.05em;color:#6BD69B">+8</span>
              <div style="font-size:14px;line-height:1.45;color:#B4C2BE;text-wrap:pretty">points of solid strike, and the reason it happened written down.</div>
            </div>
          </div>

          <div style="flex:none;display:flex;flex-direction:column;gap:12px;margin-top:auto">
            <button style="min-height:72px;border:none;border-radius:22px;background:#6BD69B;color:#08120D;font-family:inherit;font-size:18px;font-weight:800;letter-spacing:-0.01em;display:flex;align-items:center;justify-content:space-between;padding:0 10px 0 22px;cursor:pointer" style-hover="background:#8AE0B0" style-focus="outline:3px solid #E9F0EE;outline-offset:3px">
              <span style="display:flex;flex-direction:column;align-items:flex-start;gap:2px"><span>Hit ten balls</span><span style="font-size:13px;font-weight:600;opacity:0.66">About five minutes</span></span>
              <span style="width:52px;height:52px;border-radius:16px;background:rgba(8,18,13,0.14);display:flex;align-items:center;justify-content:center;font-family:'Material Symbols Rounded';font-size:26px;font-variation-settings:'FILL' 1" aria-hidden="true">play_arrow</span>
            </button>
            <button style="min-height:56px;border-radius:18px;background:transparent;border:1px solid #3A4A50;color:#E9F0EE;font-family:inherit;font-size:15px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer" style-hover="background:#141B1F" style-focus="outline:3px solid #6BD69B;outline-offset:3px">I already know my miss</button>
            <div style="display:flex;align-items:center;gap:9px;font-size:13px;line-height:1.45;color:#8A9A96"><span style="font-family:'Material Symbols Rounded';font-size:17px;color:#8CB8DC" aria-hidden="true">lock</span>No account. Nothing leaves this phone.</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== 3b · TEACH THE BUTTONS ===== -->
    <div id="3b" style="display:flex;flex-direction:column;gap:14px;width:390px">
      <div style="display:flex;align-items:center;gap:9px;font-size:13px;font-weight:700;color:#E9F0EE;letter-spacing:-0.01em"><span style="height:20px;padding:0 8px;border-radius:7px;background:#141B1F;border:1px solid #263237;color:#8A9A96;display:flex;align-items:center;font-size:11px;font-weight:800">3b</span>Teach it, don't explain it</div>
      <div style="font-size:13px;line-height:1.5;color:#687773;text-wrap:pretty">Three coach marks, each cleared by <b style="color:#8A9A96;font-weight:600">doing the tap</b> — including the undo, so a mis-tap never feels final. No carousel, no “Got it” buttons.</div>
      <div style="width:390px;height:844px;background:#0B1013;border:1px solid #263237;border-radius:40px;overflow:hidden;display:flex;flex-direction:column;color:#E9F0EE;font-variant-numeric:tabular-nums;position:relative;box-shadow:inset 0 1px 0 rgba(255,255,255,0.05), 0 40px 80px -40px rgba(0,0,0,0.9)">
        <div style="flex:none;display:flex;align-items:center;justify-content:space-between;padding:18px 28px 6px;font-size:13px;font-weight:700;opacity:0.4"><span>9:41</span><span style="display:flex;align-items:center;gap:5px;font-family:'Material Symbols Rounded';font-size:15px;color:#B4C2BE" aria-hidden="true"><span>network_wifi</span><span>battery_full</span></span></div>

        <div style="flex:1;display:flex;flex-direction:column;padding:20px 22px 24px;gap:18px">
          <div style="flex:none;display:flex;flex-direction:column;gap:10px;opacity:0.32">
            <div style="font-size:14px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#687773">Practice run · ball 1 of 3</div>
            <div style="font-size:22px;font-weight:700;letter-spacing:-0.03em;line-height:1.25">Where did it start?</div>
            <div style="display:flex;gap:6px;padding-top:4px">
              <span style="width:32px;height:32px;border-radius:10px;background:#11181B;border:1.5px solid #3A4A50"></span>
              <span style="width:32px;height:32px;border-radius:10px;background:#11181B;border:1.5px solid #3A4A50"></span>
              <span style="width:32px;height:32px;border-radius:10px;background:#11181B;border:1.5px solid #3A4A50"></span>
            </div>
          </div>

          <div style="flex:none;display:flex;flex-direction:column;gap:12px;background:#141B1F;border:1px solid #6BD69B;border-radius:22px;padding:20px 18px;box-shadow:0 0 0 6px rgba(107,214,155,0.10)">
            <div style="display:flex;align-items:center;justify-content:space-between">
              <div style="display:flex;align-items:center;gap:8px;font-size:12px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:#6BD69B"><span style="font-family:'Material Symbols Rounded';font-size:17px" aria-hidden="true">touch_app</span>Step 1 of 3</div>
              <div style="display:flex;gap:5px"><span style="width:20px;height:4px;border-radius:2px;background:#6BD69B"></span><span style="width:20px;height:4px;border-radius:2px;background:#2C4238"></span><span style="width:20px;height:4px;border-radius:2px;background:#1F292E"></span></div>
            </div>
            <div style="font-size:21px;font-weight:800;letter-spacing:-0.03em;line-height:1.25;text-wrap:pretty">Say that one started at the flag.</div>
            <div style="font-size:15px;line-height:1.5;color:#B4C2BE;text-wrap:pretty">Tap the big green button below. That's the whole app, really.</div>
          </div>

          <div style="flex:none;display:flex;flex-direction:column;gap:12px;margin-top:auto">
            <button style="height:112px;border-radius:22px;border:2px solid #6BD69B;background:rgba(107,214,155,0.2);display:flex;align-items:center;justify-content:space-between;padding:0 22px;font-family:inherit;cursor:pointer;box-shadow:0 0 0 8px rgba(107,214,155,0.10)" style-hover="background:rgba(107,214,155,0.3)" style-focus="outline:3px solid #E9F0EE;outline-offset:3px">
              <span style="display:flex;flex-direction:column;align-items:flex-start;gap:4px">
                <span style="display:flex;align-items:center;gap:9px;font-size:22px;font-weight:800;letter-spacing:-0.02em"><span style="font-family:'Material Symbols Rounded';font-size:26px;color:#6BD69B" aria-hidden="true">check_circle</span>On my line</span>
                <span style="font-size:15px;font-weight:600;color:#B4C2BE">Tap me</span>
              </span>
              <span style="width:46px;height:46px;border-radius:15px;background:rgba(107,214,155,0.22);display:flex;align-items:center;justify-content:center;font-family:'Material Symbols Rounded';font-size:26px;color:#6BD69B" aria-hidden="true">arrow_back</span>
            </button>
            <div style="display:flex;gap:12px;opacity:0.3">
              <div style="flex:1;height:104px;border-radius:20px;border:2px solid #3A4A50;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px"><span style="font-size:36px;font-weight:800;color:#8A9A96;line-height:0.9">0</span><span style="font-size:16px;font-weight:800;color:#8A9A96">Left</span></div>
              <div style="flex:1;height:104px;border-radius:20px;border:2px solid #3A4A50;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px"><span style="font-size:36px;font-weight:800;color:#8A9A96;line-height:0.9">0</span><span style="font-size:16px;font-weight:800;color:#8A9A96">Right</span></div>
            </div>
            <div style="height:60px;border-radius:18px;background:#141B1F;border:1px solid #3A4A50;display:flex;align-items:center;justify-content:center;gap:9px;font-size:16px;font-weight:700;color:#8A9A96;opacity:0.4"><span style="font-family:'Material Symbols Rounded';font-size:20px" aria-hidden="true">undo</span>Undo last ball</div>
            <div style="display:flex;align-items:center;justify-content:center;min-height:44px;font-size:15px;font-weight:600;color:#8A9A96;cursor:pointer" style-hover="color:#E9F0EE">Skip the practice run</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== 3c · SESSION ZERO ===== -->
    <div id="3c" style="display:flex;flex-direction:column;gap:14px;width:390px">
      <div style="display:flex;align-items:center;gap:9px;font-size:13px;font-weight:700;color:#E9F0EE;letter-spacing:-0.01em"><span style="height:20px;padding:0 8px;border-radius:7px;background:#141B1F;border:1px solid #263237;color:#8A9A96;display:flex;align-items:center;font-size:11px;font-weight:800">3c</span>Session zero has no score</div>
      <div style="font-size:13px;line-height:1.5;color:#687773;text-wrap:pretty">A beginner logging their first ten balls does not need a percentage. Say out loud that <b style="color:#8A9A96;font-weight:600">nothing is being judged</b> — and show the strip filling, because that's the part that feels good.</div>
      <div style="width:390px;height:844px;background:#0B1013;border:1px solid #263237;border-radius:40px;overflow:hidden;display:flex;flex-direction:column;color:#E9F0EE;font-variant-numeric:tabular-nums;box-shadow:inset 0 1px 0 rgba(255,255,255,0.05), 0 40px 80px -40px rgba(0,0,0,0.9)">
        <div style="flex:none;display:flex;align-items:center;justify-content:space-between;padding:18px 28px 6px;font-size:13px;font-weight:700"><span>9:41</span><span style="display:flex;align-items:center;gap:5px;font-family:'Material Symbols Rounded';font-size:15px;color:#B4C2BE" aria-hidden="true"><span>network_wifi</span><span>battery_full</span></span></div>

        <div style="flex:none;padding:12px 18px 14px;border-bottom:1px solid #1B2429;display:flex;align-items:center;gap:12px">
          <button aria-label="Leave the read" style="width:56px;height:56px;border-radius:18px;background:#141B1F;border:1px solid #3A4A50;display:flex;align-items:center;justify-content:center;font-family:'Material Symbols Rounded';font-size:24px;color:#E9F0EE;cursor:pointer" style-focus="outline:3px solid #6BD69B;outline-offset:3px">close</button>
          <div style="flex:1;display:flex;flex-direction:column;gap:4px">
            <div style="font-size:16px;font-weight:700;letter-spacing:-0.02em">The read · your first ten</div>
            <div style="font-size:14px;font-weight:600;color:#B4C2BE">Ball 7 of 10 · any club you like</div>
          </div>
        </div>

        <div style="flex:1;overflow:auto;padding:18px 22px 22px;display:flex;flex-direction:column;gap:16px">
          <div style="flex:none;display:flex;gap:11px;background:#11181B;border:1px solid #2A4A63;border-radius:18px;padding:14px 16px">
            <span style="font-family:'Material Symbols Rounded';font-size:19px;color:#8CB8DC;margin-top:1px" aria-hidden="true">visibility</span>
            <div style="font-size:14px;line-height:1.5;color:#C6D2CE;text-wrap:pretty">No score tonight. Bad ones are the useful ones — they're what builds your plan.</div>
          </div>

          <div style="flex:none;font-size:24px;font-weight:700;letter-spacing:-0.03em;line-height:1.25;text-wrap:pretty">Where did it <span style="color:#6BD69B">start</span>?</div>

          <div style="flex:none;background:#141B1F;border:1px solid #3A4A50;border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:12px">
            <div style="font-size:14px;font-weight:600;color:#B4C2BE">Six logged, four to go</div>
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              <span style="width:32px;height:32px;border-radius:10px;background:rgba(210,114,107,0.16);border:1.5px solid rgba(210,114,107,0.5);color:#D2726B;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800">R</span>
              <span style="width:32px;height:32px;border-radius:10px;background:rgba(107,214,155,0.18);border:1.5px solid rgba(107,214,155,0.5);color:#6BD69B;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800">✓</span>
              <span style="width:32px;height:32px;border-radius:10px;background:rgba(210,114,107,0.16);border:1.5px solid rgba(210,114,107,0.5);color:#D2726B;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800">R</span>
              <span style="width:32px;height:32px;border-radius:10px;background:rgba(210,114,107,0.16);border:1.5px solid rgba(210,114,107,0.5);color:#D2726B;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800">R</span>
              <span style="width:32px;height:32px;border-radius:10px;background:rgba(232,177,90,0.16);border:1.5px solid rgba(232,177,90,0.5);color:#E8B15A;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800">L</span>
              <span style="width:32px;height:32px;border-radius:10px;background:rgba(210,114,107,0.16);border:1.5px solid rgba(210,114,107,0.5);color:#D2726B;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800">R</span>
              <span style="width:32px;height:32px;border-radius:10px;background:#11181B;border:1.5px solid #6BD69B"></span>
              <span style="width:32px;height:32px;border-radius:10px;background:#11181B;border:1.5px solid #3A4A50"></span>
              <span style="width:32px;height:32px;border-radius:10px;background:#11181B;border:1.5px solid #3A4A50"></span>
              <span style="width:32px;height:32px;border-radius:10px;background:#11181B;border:1.5px solid #3A4A50"></span>
            </div>
          </div>

          <div style="flex:none;display:flex;flex-direction:column;gap:12px;margin-top:auto">
            <button style="height:112px;border-radius:22px;border:2px solid #6BD69B;background:rgba(107,214,155,0.16);display:flex;align-items:center;justify-content:space-between;padding:0 22px;font-family:inherit;cursor:pointer" style-active="background:rgba(107,214,155,0.34)" style-focus="outline:3px solid #E9F0EE;outline-offset:3px">
              <span style="display:flex;align-items:center;gap:9px;font-size:22px;font-weight:800;letter-spacing:-0.02em"><span style="font-family:'Material Symbols Rounded';font-size:26px;color:#6BD69B" aria-hidden="true">check_circle</span>On my line</span>
              <span style="font-size:48px;font-weight:800;line-height:0.9;letter-spacing:-0.05em;color:#6BD69B">1</span>
            </button>
            <div style="display:flex;gap:12px">
              <button style="flex:1;height:104px;border-radius:20px;border:2px solid #E8B15A;background:rgba(232,177,90,0.14);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;font-family:inherit;cursor:pointer" style-focus="outline:3px solid #E9F0EE;outline-offset:3px"><span style="font-size:36px;font-weight:800;line-height:0.9;color:#E8B15A">1</span><span style="font-size:16px;font-weight:800;color:#F0CF9C">Left</span></button>
              <button style="flex:1;height:104px;border-radius:20px;border:2px solid #D2726B;background:rgba(210,114,107,0.14);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;font-family:inherit;cursor:pointer" style-focus="outline:3px solid #E9F0EE;outline-offset:3px"><span style="font-size:36px;font-weight:800;line-height:0.9;color:#D2726B">4</span><span style="font-size:16px;font-weight:800;color:#E6ADA8">Right</span></button>
            </div>
            <div style="display:flex;gap:12px">
              <button aria-label="Undo the last logged ball" style="flex:1;height:60px;border-radius:18px;background:#141B1F;border:1px solid #3A4A50;display:flex;align-items:center;justify-content:center;gap:9px;font-family:inherit;font-size:16px;font-weight:700;color:#E9F0EE;cursor:pointer" style-hover="background:#1C2529" style-focus="outline:3px solid #6BD69B;outline-offset:3px"><span style="font-family:'Material Symbols Rounded';font-size:20px" aria-hidden="true">undo</span>Undo</button>
              <button style="flex:1;height:60px;border-radius:18px;background:#141B1F;border:1px solid #3A4A50;display:flex;align-items:center;justify-content:center;gap:9px;font-family:inherit;font-size:16px;font-weight:700;color:#E9F0EE;cursor:pointer" style-hover="background:#1C2529" style-focus="outline:3px solid #6BD69B;outline-offset:3px">Stop here<span style="font-family:'Material Symbols Rounded';font-size:20px" aria-hidden="true">arrow_forward</span></button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== 3d · THE REVEAL ===== -->
    <div id="3d" style="display:flex;flex-direction:column;gap:14px;width:390px">
      <div style="display:flex;align-items:center;gap:9px;font-size:13px;font-weight:700;color:#E9F0EE;letter-spacing:-0.01em"><span style="height:20px;padding:0 8px;border-radius:7px;background:#141B1F;border:1px solid #263237;color:#8A9A96;display:flex;align-items:center;font-size:11px;font-weight:800">3d</span>The payoff, on night one</div>
      <div style="font-size:13px;line-height:1.5;color:#687773;text-wrap:pretty">Ten balls buys a sentence you couldn't have written yourself, the page number it comes from, and a plan already built. This is the screen that makes someone come back on Saturday.</div>
      <div style="width:390px;height:844px;background:#0B1013;border:1px solid #263237;border-radius:40px;overflow:hidden;display:flex;flex-direction:column;color:#E9F0EE;font-variant-numeric:tabular-nums;box-shadow:inset 0 1px 0 rgba(255,255,255,0.05), 0 40px 80px -40px rgba(0,0,0,0.9)">
        <div style="flex:none;display:flex;align-items:center;justify-content:space-between;padding:18px 28px 6px;font-size:13px;font-weight:700"><span>9:41</span><span style="display:flex;align-items:center;gap:5px;font-family:'Material Symbols Rounded';font-size:15px;color:#B4C2BE" aria-hidden="true"><span>network_wifi</span><span>battery_full</span></span></div>

        <div style="flex:1;overflow:auto;padding:24px 22px 24px;display:flex;flex-direction:column;gap:16px">
          <div style="flex:none;display:flex;flex-direction:column;gap:6px">
            <div style="font-size:12px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:#8A9A96">Your read · 10 balls</div>
            <div style="font-size:34px;font-weight:800;letter-spacing:-0.04em;line-height:1.1;text-wrap:pretty">You lose it right.</div>
          </div>

          <div style="flex:none;background:linear-gradient(158deg,#2A1E1D 0%,#141B1F 62%);border:1px solid #43302E;border-radius:24px;padding:20px 18px;display:flex;flex-direction:column;gap:14px">
            <div style="display:flex;flex-direction:column;gap:9px">
              <div style="display:flex;align-items:center;gap:10px">
                <span style="width:52px;font-size:13px;font-weight:700;color:#B4C2BE">Right</span>
                <span style="flex:1;height:14px;border-radius:7px;background:#1F292E;overflow:hidden;display:block"><span style="display:block;width:60%;height:100%;background:#D2726B;border-radius:7px"></span></span>
                <span style="width:44px;text-align:right;font-size:15px;font-weight:800;color:#D2726B">6/10</span>
              </div>
              <div style="display:flex;align-items:center;gap:10px">
                <span style="width:52px;font-size:13px;font-weight:700;color:#B4C2BE">Left</span>
                <span style="flex:1;height:14px;border-radius:7px;background:#1F292E;overflow:hidden;display:block"><span style="display:block;width:10%;height:100%;background:#E8B15A;border-radius:7px"></span></span>
                <span style="width:44px;text-align:right;font-size:15px;font-weight:800;color:#E8B15A">1/10</span>
              </div>
              <div style="display:flex;align-items:center;gap:10px">
                <span style="width:52px;font-size:13px;font-weight:700;color:#B4C2BE">On line</span>
                <span style="flex:1;height:14px;border-radius:7px;background:#1F292E;overflow:hidden;display:block"><span style="display:block;width:30%;height:100%;background:#6BD69B;border-radius:7px"></span></span>
                <span style="width:44px;text-align:right;font-size:15px;font-weight:800;color:#6BD69B">3/10</span>
              </div>
            </div>
            <div style="font-size:16px;line-height:1.5;color:#E9F0EE;text-wrap:pretty;border-top:1px solid #3A2A28;padding-top:14px">Six of ten leaked right, and the last three were the worst — a slice that gets stronger as you tire. <b style="font-weight:800">One fault, not five.</b></div>
            <div style="font-size:13px;font-weight:600;color:#8A9A96">Field guide p.162 · slice</div>
          </div>

          <div style="flex:none;background:linear-gradient(158deg,#1B2E26 0%,#141B1F 62%);border:1px solid #2C4238;border-radius:24px;padding:20px 18px;display:flex;flex-direction:column;gap:12px">
            <div style="display:flex;align-items:center;gap:8px;font-size:12px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:#6BD69B"><span style="font-family:'Material Symbols Rounded';font-size:17px" aria-hidden="true">flag</span>So here's your four weeks</div>
            <div style="font-size:19px;font-weight:700;letter-spacing:-0.02em;line-height:1.35;text-wrap:pretty">Square the start line, then hold it when you're tired.</div>
            <div style="display:flex;flex-direction:column;gap:9px;border-top:1px solid #24332C;padding-top:14px">
              <div style="display:flex;align-items:center;justify-content:space-between;font-size:15px"><span style="color:#B4C2BE">Weeks 1–2 · Aim</span><span style="font-weight:700">4 sessions</span></div>
              <div style="display:flex;align-items:center;justify-content:space-between;font-size:15px"><span style="color:#B4C2BE">Week 3 · Path</span><span style="font-weight:700">2 sessions</span></div>
              <div style="display:flex;align-items:center;justify-content:space-between;font-size:15px"><span style="color:#B4C2BE">Week 4 · Re-test</span><span style="font-weight:700">Same ten balls</span></div>
            </div>
          </div>

          <div style="flex:none;display:flex;flex-direction:column;gap:11px;margin-top:auto">
            <button style="min-height:68px;border:none;border-radius:20px;background:#6BD69B;color:#08120D;font-family:inherit;font-size:18px;font-weight:800;display:flex;align-items:center;justify-content:center;gap:10px;cursor:pointer" style-hover="background:#8AE0B0" style-focus="outline:3px solid #E9F0EE;outline-offset:3px"><span style="font-family:'Material Symbols Rounded';font-size:23px" aria-hidden="true">check</span>Use this plan</button>
            <button style="min-height:56px;border-radius:18px;background:transparent;border:1px solid #3A4A50;color:#E9F0EE;font-family:inherit;font-size:15px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer" style-hover="background:#141B1F" style-focus="outline:3px solid #6BD69B;outline-offset:3px">That's not my usual miss — adjust</button>
            <div style="display:flex;align-items:center;justify-content:center;gap:8px;min-height:44px;font-size:14px;font-weight:600;color:#8A9A96;text-align:center;text-wrap:pretty">Practise when you can. The plan waits for you, it doesn't expire.</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== SPEC ===== -->
    <div style="display:flex;flex-direction:column;gap:16px;width:420px;padding-top:2px">
      <div style="font-size:20px;font-weight:700;color:#E9F0EE;letter-spacing:-0.025em">The four fixes underneath</div>
      <div style="display:flex;flex-direction:column;gap:12px">
        <div style="background:#0F1518;border:1px solid #263237;border-radius:18px;padding:16px 18px;display:flex;flex-direction:column;gap:7px">
          <div style="font-size:15px;font-weight:700;color:#E9F0EE">The quiz stops being the door</div>
          <div style="font-size:14px;line-height:1.55;color:#8A9A96;text-wrap:pretty">Your existing miss picker survives as “I already know my miss” on <a href="#3a">3a</a> — great for the golfer who does, no longer a wall for the beginner who doesn't. Session zero writes the same field on the profile, so the plan builder needs no changes.</div>
        </div>
        <div style="background:#0F1518;border:1px solid #263237;border-radius:18px;padding:16px 18px;display:flex;flex-direction:column;gap:7px">
          <div style="font-size:15px;font-weight:700;color:#E9F0EE">First value in five minutes</div>
          <div style="font-size:14px;line-height:1.55;color:#8A9A96;text-wrap:pretty">Ten taps, one sentence back. Everything the reveal on <a href="#3d">3d</a> needs is already computed by your miss-pattern code — it just runs on one session instead of three.</div>
        </div>
        <div style="background:#0F1518;border:1px solid #263237;border-radius:18px;padding:16px 18px;display:flex;flex-direction:column;gap:7px">
          <div style="font-size:15px;font-weight:700;color:#E9F0EE">Streaks become resilience</div>
          <div style="font-size:14px;line-height:1.55;color:#8A9A96;text-wrap:pretty">“3 wks” on the Plan header is a debt you can default on. Show <b style="color:#B4C2BE">sessions this month</b> instead, and on a return after a gap open with “Welcome back — picking up at Week 2, Session 2”, never a broken flame.</div>
        </div>
        <div style="background:#0F1518;border:1px solid #263237;border-radius:18px;padding:16px 18px;display:flex;flex-direction:column;gap:7px">
          <div style="font-size:15px;font-weight:700;color:#E9F0EE">Not everyone has a range</div>
          <div style="font-size:14px;line-height:1.55;color:#8A9A96;text-wrap:pretty">One line under the start button — “I've only got a putting green / a net / the garden” — reorders tonight's areas instead of leaving the session unlogged. Pairs with the areas toggle on <a href="#2c">2c</a>.</div>
        </div>
      </div>
    </div>

  </div>
</section>

<section style="background:radial-gradient(1200px 700px at 12% -10%, #12211E 0%, #070C0E 55%, #070C0E 100%);padding:64px 52px 88px;font-family:Manrope,-apple-system,sans-serif;box-sizing:border-box">

  <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:16px">
    <div style="display:flex;align-items:center;gap:12px">
      <span style="height:24px;padding:0 10px;border-radius:8px;background:#6BD69B;color:#08120D;display:flex;align-items:center;font-size:12px;font-weight:800;letter-spacing:0.02em">2</span>
      <div style="font-size:30px;font-weight:700;color:#E9F0EE;letter-spacing:-0.03em">Usable by everyone</div>
    </div>
    <div style="font-size:15px;color:#8A9A96;letter-spacing:-0.01em;max-width:800px;text-wrap:pretty">A range is the worst environment an app can live in: bright sun, gloves on, one hand free, standing up, no signal. Design for that and you also cover low vision, colour blindness, tremor, one-handed and seated play. Nothing below is a separate "accessible version" — it's the same four screens with the barriers taken out.</div>
  </div>
  <div style="display:flex;gap:22px;flex-wrap:wrap;align-items:center;margin-bottom:44px;font-size:13px;color:#687773">
    <span>WCAG 2.2 AA targeted</span><span>·</span><span>4.5:1 text, 3:1 UI</span><span>·</span><span>56px minimum target</span><span>·</span><span>200% text without clipping</span><span>·</span><span>never colour alone</span>
  </div>

  <div style="display:flex;flex-wrap:wrap;gap:60px;align-items:flex-start">

    <!-- ===== 2a · ACCESSIBLE LOGGING ===== -->
    <div id="2a" style="display:flex;flex-direction:column;gap:14px;width:390px">
      <div style="display:flex;align-items:center;gap:9px;font-size:13px;font-weight:700;color:#E9F0EE;letter-spacing:-0.01em"><span style="height:20px;padding:0 8px;border-radius:7px;background:#141B1F;border:1px solid #263237;color:#8A9A96;display:flex;align-items:center;font-size:11px;font-weight:800">2a</span>Logging, gloves on</div>
      <div style="font-size:13px;line-height:1.5;color:#687773;text-wrap:pretty">Every outcome is readable three ways — <b style="color:#8A9A96;font-weight:600">letter, icon and position</b> — so the strip survives red-green colour blindness and direct sun. Targets sit in the bottom third for one thumb, and the volume keys log without looking. Try the buttons.</div>
      <div style="width:390px;height:844px;background:#0B1013;border:1px solid #263237;border-radius:40px;overflow:hidden;display:flex;flex-direction:column;color:#E9F0EE;font-variant-numeric:tabular-nums;box-shadow:inset 0 1px 0 rgba(255,255,255,0.05), 0 40px 80px -40px rgba(0,0,0,0.9)">

        <div style="flex:none;display:flex;align-items:center;justify-content:space-between;padding:18px 28px 6px;font-size:13px;font-weight:700">
          <span>9:41</span>
          <span style="display:flex;align-items:center;gap:5px;font-family:'Material Symbols Rounded';font-size:15px;color:#B4C2BE" aria-hidden="true"><span>network_wifi</span><span>battery_full</span></span>
        </div>

        <div style="flex:none;padding:12px 18px 14px;border-bottom:1px solid #1B2429;display:flex;align-items:center;gap:12px">
          <button aria-label="End session" style="width:56px;height:56px;border-radius:18px;background:#141B1F;border:1px solid #3A4A50;display:flex;align-items:center;justify-content:center;font-family:'Material Symbols Rounded';font-size:24px;color:#E9F0EE;cursor:pointer" style-focus="outline:3px solid #6BD69B;outline-offset:3px">close</button>
          <div style="flex:1;display:flex;flex-direction:column;gap:4px">
            <div style="font-size:16px;font-weight:700;letter-spacing:-0.02em">Driving · Positional Drive</div>
            <div style="font-size:14px;font-weight:600;color:#B4C2BE">Area 3 of 5 · ball {{ ballNo }} of 10</div>
          </div>
          <button aria-label="How this drill works" style="width:56px;height:56px;border-radius:18px;background:#141B1F;border:1px solid #3A4A50;display:flex;align-items:center;justify-content:center;font-family:'Material Symbols Rounded';font-size:24px;color:#E9F0EE;cursor:pointer" style-focus="outline:3px solid #6BD69B;outline-offset:3px">help</button>
        </div>

        <div style="flex:1;overflow:auto;padding:18px 22px 22px;display:flex;flex-direction:column;gap:16px">

          <div style="flex:none;font-size:24px;font-weight:700;letter-spacing:-0.03em;line-height:1.25;text-wrap:pretty">Where did it <span style="color:#6BD69B">start</span>?</div>

          <div style="flex:none;background:#141B1F;border:1px solid #3A4A50;border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:12px">
            <div style="display:flex;align-items:center;justify-content:space-between">
              <div style="font-size:14px;font-weight:600;color:#B4C2BE">This session</div>
              <div style="font-size:15px;font-weight:800;color:#E9F0EE">{{ ratePct }}% on line</div>
            </div>
            <div role="list" aria-label="Shots logged this session" style="display:flex;gap:6px;flex-wrap:wrap">
              <sc-for list="{{ a11yStrip }}" as="dot" hint-placeholder-count="10">
                <span role="listitem" aria-label="{{ dot.label }}" style="width:32px;height:32px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;background:{{ dot.bg }};border:1.5px solid {{ dot.br }};color:{{ dot.fg }}">{{ dot.letter }}</span>
              </sc-for>
            </div>
            <div style="display:flex;gap:14px;font-size:13px;font-weight:600;color:#B4C2BE;border-top:1px solid #263237;padding-top:11px">
              <span>✓ on line</span><span>L left</span><span>R right</span>
            </div>
          </div>

          <div style="flex:none;background:#11181B;border:1px solid #2A4A63;border-radius:18px;padding:14px 16px;display:flex;gap:11px" aria-hidden="true">
            <span style="font-family:'Material Symbols Rounded';font-size:19px;color:#8CB8DC;margin-top:1px">record_voice_over</span>
            <div style="display:flex;flex-direction:column;gap:4px">
              <div style="font-size:11px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:#8CB8DC">Screen reader says</div>
              <div style="font-size:14px;line-height:1.5;color:#C6D2CE;text-wrap:pretty">“{{ announce }}”</div>
            </div>
          </div>

          <div style="flex:none;display:flex;flex-direction:column;gap:12px;margin-top:auto">
            <button onClick="{{ tapFairway }}" aria-label="Log this ball as on my line" style="height:112px;border-radius:22px;border:2px solid #6BD69B;background:rgba(107,214,155,0.16);display:flex;align-items:center;justify-content:space-between;padding:0 22px;font-family:inherit;cursor:pointer" style-active="background:rgba(107,214,155,0.34)" style-focus="outline:3px solid #E9F0EE;outline-offset:3px">
              <span style="display:flex;flex-direction:column;align-items:flex-start;gap:4px">
                <span style="display:flex;align-items:center;gap:9px;font-size:22px;font-weight:800;letter-spacing:-0.02em;color:#E9F0EE"><span style="font-family:'Material Symbols Rounded';font-size:26px;color:#6BD69B" aria-hidden="true">check_circle</span>On my line</span>
                <span style="font-size:15px;font-weight:600;color:#B4C2BE">Volume up logs this</span>
              </span>
              <span style="font-size:48px;font-weight:800;line-height:0.9;letter-spacing:-0.05em;color:#6BD69B">{{ fairway }}</span>
            </button>
            <div style="display:flex;gap:12px">
              <button onClick="{{ tapLeft }}" aria-label="Log a miss to the left" style="flex:1;height:104px;border-radius:20px;border:2px solid #E8B15A;background:rgba(232,177,90,0.14);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;font-family:inherit;cursor:pointer" style-active="background:rgba(232,177,90,0.3)" style-focus="outline:3px solid #E9F0EE;outline-offset:3px">
                <span style="font-size:36px;font-weight:800;line-height:0.9;letter-spacing:-0.05em;color:#E8B15A">{{ left }}</span>
                <span style="display:flex;align-items:center;gap:5px;font-size:16px;font-weight:800;color:#F0CF9C"><span style="font-family:'Material Symbols Rounded';font-size:19px" aria-hidden="true">west</span>Left</span>
              </button>
              <button onClick="{{ tapRight }}" aria-label="Log a miss to the right" style="flex:1;height:104px;border-radius:20px;border:2px solid #D2726B;background:rgba(210,114,107,0.14);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;font-family:inherit;cursor:pointer" style-active="background:rgba(210,114,107,0.3)" style-focus="outline:3px solid #E9F0EE;outline-offset:3px">
                <span style="font-size:36px;font-weight:800;line-height:0.9;letter-spacing:-0.05em;color:#D2726B">{{ right }}</span>
                <span style="display:flex;align-items:center;gap:5px;font-size:16px;font-weight:800;color:#E6ADA8">Right<span style="font-family:'Material Symbols Rounded';font-size:19px" aria-hidden="true">east</span></span>
              </button>
            </div>
            <button onClick="{{ undo }}" aria-label="Undo the last logged ball" style="height:60px;border-radius:18px;background:#141B1F;border:1px solid #3A4A50;display:flex;align-items:center;justify-content:center;gap:9px;font-family:inherit;font-size:16px;font-weight:700;color:#E9F0EE;cursor:pointer" style-hover="background:#1C2529" style-focus="outline:3px solid #6BD69B;outline-offset:3px"><span style="font-family:'Material Symbols Rounded';font-size:20px" aria-hidden="true">undo</span>Undo last ball</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== 2b · SUN & LARGE TEXT ===== -->
    <div id="2b" style="display:flex;flex-direction:column;gap:14px;width:390px">
      <div style="display:flex;align-items:center;gap:9px;font-size:13px;font-weight:700;color:#E9F0EE;letter-spacing:-0.01em"><span style="height:20px;padding:0 8px;border-radius:7px;background:#141B1F;border:1px solid #263237;color:#8A9A96;display:flex;align-items:center;font-size:11px;font-weight:800">2b</span>Sunlight &amp; 200% text</div>
      <div style="font-size:13px;line-height:1.5;color:#687773;text-wrap:pretty">The same Plan screen at the system's largest text size, in the light theme people actually need outdoors. Nothing truncates: cards grow, the plan rail becomes a list, secondary text is <b style="color:#8A9A96;font-weight:600">dropped rather than shrunk</b>.</div>
      <div style="width:390px;height:844px;background:#FFFFFF;border:1px solid #C9D4D0;border-radius:40px;overflow:hidden;display:flex;flex-direction:column;color:#06110C;font-variant-numeric:tabular-nums;box-shadow:0 40px 80px -40px rgba(0,0,0,0.9)">

        <div style="flex:none;display:flex;align-items:center;justify-content:space-between;padding:18px 28px 6px;font-size:14px;font-weight:800;color:#06110C">
          <span>9:41</span>
          <span style="display:flex;align-items:center;gap:5px;font-family:'Material Symbols Rounded';font-size:16px" aria-hidden="true"><span>network_wifi</span><span>battery_full</span></span>
        </div>

        <div style="flex:none;padding:14px 22px 16px;border-bottom:2px solid #DEE6E3;display:flex;flex-direction:column;gap:6px">
          <div style="font-size:15px;font-weight:800;letter-spacing:0.04em;text-transform:uppercase;color:#4A5A55">Thursday · Week 2</div>
          <div style="font-size:32px;font-weight:800;letter-spacing:-0.03em;line-height:1.1">Control</div>
        </div>

        <div style="flex:1;overflow:auto;padding:18px 22px 24px;display:flex;flex-direction:column;gap:18px">
          <div style="flex:none;display:flex;flex-direction:column;gap:14px;background:#EBF7F0;border:2px solid #0F6B3E;border-radius:24px;padding:20px 18px">
            <div style="display:flex;align-items:center;gap:9px;font-size:15px;font-weight:800;letter-spacing:0.04em;text-transform:uppercase;color:#0B5531"><span style="font-family:'Material Symbols Rounded';font-size:21px" aria-hidden="true">target</span>Today's one thing</div>
            <div style="font-size:30px;font-weight:800;letter-spacing:-0.03em;line-height:1.25;text-wrap:pretty">Stop the ball leaking right off the tee.</div>
            <div style="font-size:20px;line-height:1.5;color:#22332C;text-wrap:pretty">Only count a drive as good if it <b style="font-weight:800;color:#06110C">starts left of the flag</b>.</div>
          </div>

          <div style="flex:none;display:flex;flex-direction:column;gap:10px">
            <div style="font-size:20px;font-weight:800;letter-spacing:-0.01em">Solid rate 63%</div>
            <div style="font-size:19px;line-height:1.45;color:#22332C;text-wrap:pretty">Up for three sessions in a row. <b style="font-weight:800">It's working.</b></div>
          </div>

          <div style="flex:none;display:flex;flex-direction:column;gap:10px;border-top:2px solid #DEE6E3;padding-top:16px">
            <div style="font-size:19px;font-weight:800">Session 4 of 8</div>
            <div style="height:16px;border-radius:8px;background:#DEE6E3;overflow:hidden"><span style="display:block;width:44%;height:100%;background:#0F6B3E;border-radius:8px"></span></div>
            <div style="font-size:18px;font-weight:600;color:#3A4A44">3 logged · 5 to go · test in week 4</div>
          </div>

          <div style="flex:none;display:flex;flex-direction:column;gap:12px;margin-top:auto">
            <button style="min-height:84px;border:none;border-radius:22px;background:#0F6B3E;color:#FFFFFF;font-family:inherit;font-size:24px;font-weight:800;letter-spacing:-0.01em;display:flex;align-items:center;justify-content:center;gap:12px;padding:14px 20px;cursor:pointer;text-wrap:pretty" style-hover="background:#0B5531" style-focus="outline:3px solid #06110C;outline-offset:3px"><span style="font-family:'Material Symbols Rounded';font-size:28px" aria-hidden="true">play_arrow</span>Start Session 2</button>
            <button style="min-height:72px;border-radius:20px;background:#FFFFFF;border:2px solid #06110C;color:#06110C;font-family:inherit;font-size:21px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:10px;padding:12px 18px;cursor:pointer" style-hover="background:#F0F4F2" style-focus="outline:3px solid #0F6B3E;outline-offset:3px">Just 10 minutes</button>
          </div>
        </div>

        <div style="flex:none;display:grid;grid-template-columns:repeat(4,1fr);border-top:2px solid #DEE6E3;padding:6px 0 16px">
          <div style="height:66px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;color:#0F6B3E"><span style="font-family:'Material Symbols Rounded';font-size:26px;font-variation-settings:'FILL' 1" aria-hidden="true">flag</span><span style="font-size:13px;font-weight:800">Plan</span></div>
          <div style="height:66px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;color:#3A4A44"><span style="font-family:'Material Symbols Rounded';font-size:26px" aria-hidden="true">sports_golf</span><span style="font-size:13px;font-weight:600">Log</span></div>
          <div style="height:66px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;color:#3A4A44"><span style="font-family:'Material Symbols Rounded';font-size:26px" aria-hidden="true">show_chart</span><span style="font-size:13px;font-weight:600">Trends</span></div>
          <div style="height:66px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;color:#3A4A44"><span style="font-family:'Material Symbols Rounded';font-size:26px" aria-hidden="true">more_horiz</span><span style="font-size:13px;font-weight:600">More</span></div>
        </div>
      </div>
    </div>

    <!-- ===== 2c · ACCESS SETTINGS ===== -->
    <div id="2c" style="display:flex;flex-direction:column;gap:14px;width:390px">
      <div style="display:flex;align-items:center;gap:9px;font-size:13px;font-weight:700;color:#E9F0EE;letter-spacing:-0.01em"><span style="height:20px;padding:0 8px;border-radius:7px;background:#141B1F;border:1px solid #263237;color:#8A9A96;display:flex;align-items:center;font-size:11px;font-weight:800">2c</span>Set it up once</div>
      <div style="font-size:13px;line-height:1.5;color:#687773;text-wrap:pretty">Defaults follow the phone's own settings, so most people never open this. What's here is what a phone can't know: gloves, one hand, plain language instead of golf jargon, and how you'd rather log.</div>
      <div style="width:390px;height:844px;background:#0B1013;border:1px solid #263237;border-radius:40px;overflow:hidden;display:flex;flex-direction:column;color:#E9F0EE;box-shadow:inset 0 1px 0 rgba(255,255,255,0.05), 0 40px 80px -40px rgba(0,0,0,0.9)">

        <div style="flex:none;display:flex;align-items:center;justify-content:space-between;padding:18px 28px 6px;font-size:13px;font-weight:700">
          <span>9:41</span>
          <span style="display:flex;align-items:center;gap:5px;font-family:'Material Symbols Rounded';font-size:15px;color:#B4C2BE" aria-hidden="true"><span>network_wifi</span><span>battery_full</span></span>
        </div>

        <div style="flex:none;padding:14px 22px 16px;border-bottom:1px solid #1B2429;display:flex;align-items:center;gap:12px">
          <button aria-label="Back to More" style="width:56px;height:56px;border-radius:18px;background:#141B1F;border:1px solid #3A4A50;display:flex;align-items:center;justify-content:center;font-family:'Material Symbols Rounded';font-size:24px;color:#E9F0EE;cursor:pointer" style-focus="outline:3px solid #6BD69B;outline-offset:3px">arrow_back</button>
          <div style="display:flex;flex-direction:column;gap:3px">
            <div style="font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#8A9A96">More</div>
            <div style="font-size:22px;font-weight:700;letter-spacing:-0.03em">Ease of use</div>
          </div>
        </div>

        <div style="flex:1;overflow:auto;padding:18px 22px 24px;display:flex;flex-direction:column;gap:20px">

          <div style="flex:none;display:flex;gap:11px;background:#11181B;border:1px solid #2A4A63;border-radius:18px;padding:14px 16px">
            <span style="font-family:'Material Symbols Rounded';font-size:19px;color:#8CB8DC;margin-top:1px" aria-hidden="true">settings_accessibility</span>
            <div style="font-size:14px;line-height:1.5;color:#C6D2CE;text-wrap:pretty">Text size, bold text, contrast and reduced motion already follow your phone. These only add what it can't guess.</div>
          </div>

          <div style="flex:none;display:flex;flex-direction:column;gap:10px">
            <div style="font-size:12px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:#8A9A96">At the range</div>
            <div style="background:#141B1F;border:1px solid #3A4A50;border-radius:20px;overflow:hidden">
              <div style="display:flex;align-items:center;gap:14px;min-height:76px;padding:14px 18px;border-bottom:1px solid #263237">
                <div style="flex:1;display:flex;flex-direction:column;gap:3px"><span style="font-size:16px;font-weight:700">Glove mode</span><span style="font-size:14px;color:#B4C2BE;text-wrap:pretty">Fewer, bigger buttons</span></div>
                <span role="switch" aria-checked="true" aria-label="Glove mode" style="width:56px;height:34px;border-radius:17px;background:#6BD69B;display:flex;align-items:center;justify-content:flex-end;padding:0 4px;box-sizing:border-box;cursor:pointer"><span style="width:26px;height:26px;border-radius:13px;background:#08120D;display:block"></span></span>
              </div>
              <div style="display:flex;align-items:center;gap:14px;min-height:76px;padding:14px 18px;border-bottom:1px solid #263237">
                <div style="flex:1;display:flex;flex-direction:column;gap:3px"><span style="font-size:16px;font-weight:700">Log with volume keys</span><span style="font-size:14px;color:#B4C2BE;text-wrap:pretty">Up = on line, down = miss</span></div>
                <span role="switch" aria-checked="true" aria-label="Log with volume keys" style="width:56px;height:34px;border-radius:17px;background:#6BD69B;display:flex;align-items:center;justify-content:flex-end;padding:0 4px;box-sizing:border-box;cursor:pointer"><span style="width:26px;height:26px;border-radius:13px;background:#08120D;display:block"></span></span>
              </div>
              <div style="display:flex;align-items:center;gap:14px;min-height:76px;padding:14px 18px">
                <div style="flex:1;display:flex;flex-direction:column;gap:3px"><span style="font-size:16px;font-weight:700">Buttons on the left</span><span style="font-size:14px;color:#B4C2BE;text-wrap:pretty">For a left thumb</span></div>
                <span role="switch" aria-checked="false" aria-label="Buttons on the left" style="width:56px;height:34px;border-radius:17px;background:#2C383D;border:1px solid #3A4A50;display:flex;align-items:center;padding:0 4px;box-sizing:border-box;cursor:pointer"><span style="width:26px;height:26px;border-radius:13px;background:#8A9A96;display:block"></span></span>
              </div>
            </div>
          </div>

          <div style="flex:none;display:flex;flex-direction:column;gap:10px">
            <div style="font-size:12px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:#8A9A96">Reading it</div>
            <div style="background:#141B1F;border:1px solid #3A4A50;border-radius:20px;overflow:hidden">
              <div style="display:flex;align-items:center;gap:14px;min-height:76px;padding:14px 18px;border-bottom:1px solid #263237">
                <div style="flex:1;display:flex;flex-direction:column;gap:3px"><span style="font-size:16px;font-weight:700">Letters on shot dots</span><span style="font-size:14px;color:#B4C2BE;text-wrap:pretty">Never colour on its own</span></div>
                <span role="switch" aria-checked="true" aria-label="Letters on shot dots" style="width:56px;height:34px;border-radius:17px;background:#6BD69B;display:flex;align-items:center;justify-content:flex-end;padding:0 4px;box-sizing:border-box;cursor:pointer"><span style="width:26px;height:26px;border-radius:13px;background:#08120D;display:block"></span></span>
              </div>
              <div style="display:flex;align-items:center;gap:14px;min-height:76px;padding:14px 18px;border-bottom:1px solid #263237">
                <div style="flex:1;display:flex;flex-direction:column;gap:3px"><span style="font-size:16px;font-weight:700">Plain language</span><span style="font-size:14px;color:#B4C2BE;text-wrap:pretty">“Good hits out of 10”, not “solid rate”</span></div>
                <span role="switch" aria-checked="true" aria-label="Plain language" style="width:56px;height:34px;border-radius:17px;background:#6BD69B;display:flex;align-items:center;justify-content:flex-end;padding:0 4px;box-sizing:border-box;cursor:pointer"><span style="width:26px;height:26px;border-radius:13px;background:#08120D;display:block"></span></span>
              </div>
              <div style="display:flex;align-items:center;gap:14px;min-height:76px;padding:14px 18px">
                <div style="flex:1;display:flex;flex-direction:column;gap:3px"><span style="font-size:16px;font-weight:700">Read my session back</span><span style="font-size:14px;color:#B4C2BE;text-wrap:pretty">Spoken summary at the end</span></div>
                <span role="switch" aria-checked="false" aria-label="Read my session back" style="width:56px;height:34px;border-radius:17px;background:#2C383D;border:1px solid #3A4A50;display:flex;align-items:center;padding:0 4px;box-sizing:border-box;cursor:pointer"><span style="width:26px;height:26px;border-radius:13px;background:#8A9A96;display:block"></span></span>
              </div>
            </div>
          </div>

          <div style="flex:none;display:flex;flex-direction:column;gap:10px">
            <div style="font-size:12px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:#8A9A96">The plan</div>
            <div style="background:#141B1F;border:1px solid #3A4A50;border-radius:20px;padding:16px 18px;display:flex;flex-direction:column;gap:12px">
              <div style="font-size:16px;font-weight:700">Areas I can practise</div>
              <div style="font-size:14px;line-height:1.5;color:#B4C2BE;text-wrap:pretty">Turn off what you can't do — seated, no bunker, no full swing — and the plan rebuilds around what's left instead of scoring you zero.</div>
              <div style="display:flex;flex-wrap:wrap;gap:8px">
                <span style="display:flex;align-items:center;gap:6px;min-height:40px;padding:0 14px;border-radius:13px;background:rgba(107,214,155,0.12);border:1px solid rgba(107,214,155,0.45);font-size:14px;font-weight:700;color:#9FD9BB"><span style="font-family:'Material Symbols Rounded';font-size:17px" aria-hidden="true">check</span>Putting</span>
                <span style="display:flex;align-items:center;gap:6px;min-height:40px;padding:0 14px;border-radius:13px;background:rgba(107,214,155,0.12);border:1px solid rgba(107,214,155,0.45);font-size:14px;font-weight:700;color:#9FD9BB"><span style="font-family:'Material Symbols Rounded';font-size:17px" aria-hidden="true">check</span>Chipping</span>
                <span style="display:flex;align-items:center;gap:6px;min-height:40px;padding:0 14px;border-radius:13px;background:#11181B;border:1px solid #3A4A50;font-size:14px;font-weight:600;color:#8A9A96">Bunker</span>
                <span style="display:flex;align-items:center;gap:6px;min-height:40px;padding:0 14px;border-radius:13px;background:rgba(107,214,155,0.12);border:1px solid rgba(107,214,155,0.45);font-size:14px;font-weight:700;color:#9FD9BB"><span style="font-family:'Material Symbols Rounded';font-size:17px" aria-hidden="true">check</span>Irons</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== SPEC ===== -->
    <div style="display:flex;flex-direction:column;gap:16px;width:420px;padding-top:2px">
      <div style="font-size:20px;font-weight:700;color:#E9F0EE;letter-spacing:-0.025em">What changes in the build</div>

      <div style="display:flex;flex-direction:column;gap:12px">
        <div style="background:#0F1518;border:1px solid #263237;border-radius:18px;padding:16px 18px;display:flex;flex-direction:column;gap:7px">
          <div style="font-size:15px;font-weight:700;color:#E9F0EE">Let people zoom</div>
          <div style="font-size:14px;line-height:1.55;color:#8A9A96;text-wrap:pretty">Drop <span style="color:#B4C2BE">maximum-scale</span> and <span style="color:#B4C2BE">user-scalable=no</span> from the viewport meta — the one change that fixes the most users at once.</div>
        </div>
        <div style="background:#0F1518;border:1px solid #263237;border-radius:18px;padding:16px 18px;display:flex;flex-direction:column;gap:7px">
          <div style="font-size:15px;font-weight:700;color:#E9F0EE">Real buttons, real labels</div>
          <div style="font-size:14px;line-height:1.55;color:#8A9A96;text-wrap:pretty">Every tappable div becomes a <span style="color:#B4C2BE">&lt;button&gt;</span> with an aria-label; icons get <span style="color:#B4C2BE">aria-hidden</span>. Keyboard and switch control then work for free.</div>
        </div>
        <div style="background:#0F1518;border:1px solid #263237;border-radius:18px;padding:16px 18px;display:flex;flex-direction:column;gap:7px">
          <div style="font-size:15px;font-weight:700;color:#E9F0EE">One live region, not ten</div>
          <div style="font-size:14px;line-height:1.55;color:#8A9A96;text-wrap:pretty">A single <span style="color:#B4C2BE">aria-live="polite"</span> node announces “Ball 7, right miss, 4 of 7 on line”. The dot strip itself stays silent.</div>
        </div>
        <div style="background:#0F1518;border:1px solid #263237;border-radius:18px;padding:16px 18px;display:flex;flex-direction:column;gap:7px">
          <div style="font-size:15px;font-weight:700;color:#E9F0EE">Visible focus everywhere</div>
          <div style="font-size:14px;line-height:1.55;color:#8A9A96;text-wrap:pretty">A 3px light ring at 3:1 against both themes, never <span style="color:#B4C2BE">outline:none</span>.</div>
        </div>
        <div style="background:#0F1518;border:1px solid #263237;border-radius:18px;padding:16px 18px;display:flex;flex-direction:column;gap:7px">
          <div style="font-size:15px;font-weight:700;color:#E9F0EE">Motion is decoration</div>
          <div style="font-size:14px;line-height:1.55;color:#8A9A96;text-wrap:pretty">Under <span style="color:#B4C2BE">prefers-reduced-motion</span> the dot-fly and count roll become instant state changes. Haptics stay — they're the confirmation.</div>
        </div>
        <div style="background:#0F1518;border:1px solid #263237;border-radius:18px;padding:16px 18px;display:flex;flex-direction:column;gap:7px">
          <div style="font-size:15px;font-weight:700;color:#E9F0EE">Contrast floor</div>
          <div style="font-size:14px;line-height:1.55;color:#8A9A96;text-wrap:pretty">Body text moves from <span style="color:#B4C2BE">#8A9A96</span> to <span style="color:#B4C2BE">#B4C2BE</span> inside cards, borders from <span style="color:#B4C2BE">#263237</span> to <span style="color:#B4C2BE">#3A4A50</span>. Nothing meaningful is carried by hue alone.</div>
        </div>
        <div style="background:#0F1518;border:1px solid #263237;border-radius:18px;padding:16px 18px;display:flex;flex-direction:column;gap:7px">
          <div style="font-size:15px;font-weight:700;color:#E9F0EE">Errors that undo</div>
          <div style="font-size:14px;line-height:1.55;color:#8A9A96;text-wrap:pretty">A tremor mis-tap costs one press of a 60px Undo — no confirm dialogs, no long-press-only actions anywhere.</div>
        </div>
      </div>
    </div>

  </div>
</section>

<section style="background:radial-gradient(1200px 700px at 12% -10%, #12211E 0%, #070C0E 55%, #070C0E 100%);padding:64px 52px 96px;font-family:Manrope,-apple-system,sans-serif;box-sizing:border-box">

  <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:14px">
    <div style="font-size:30px;font-weight:700;color:#E9F0EE;letter-spacing:-0.03em">RangeCard v2 — the award-winning pass</div>
    <div style="font-size:15px;color:#8A9A96;letter-spacing:-0.01em;max-width:760px;text-wrap:pretty">Same data model, same five areas, same three-counter logging you picked. What changes: the app takes a position. It says one thing to do today, shows the shot pattern forming as you tap, and answers "is this working?" instead of drawing lines.</div>
  </div>
  <div style="display:flex;gap:10px;align-items:center;margin-bottom:44px;font-size:13px;color:#687773">
    <span style="width:22px;height:22px;border-radius:7px;background:#6BD69B"></span>
    <span style="width:22px;height:22px;border-radius:7px;background:#E8B15A"></span>
    <span style="width:22px;height:22px;border-radius:7px;background:#D2726B"></span>
    <span style="width:22px;height:22px;border-radius:7px;background:#5B93C4"></span>
    <span style="margin-left:6px">unchanged palette · Manrope · Material Symbols Rounded</span>
  </div>

  <div style="display:flex;flex-wrap:wrap;gap:60px;align-items:flex-start">

    <!-- ========== 1. COACH HOME ========== -->
    <div style="display:flex;flex-direction:column;gap:14px;width:390px">
      <div style="display:flex;align-items:center;gap:8px;font-size:13px;font-weight:700;color:#E9F0EE;letter-spacing:-0.01em"><span style="width:6px;height:6px;border-radius:4px;background:#6BD69B;display:block"></span>1 · Plan becomes a coach</div>
      <div style="font-size:13px;line-height:1.5;color:#687773;text-wrap:pretty">Today's <b style="color:#8A9A96;font-weight:600">one thing</b> replaces the stat tiles at the top — a single instruction derived from your last session's worst area. The plan grid moves below it. Tiles become one quiet form line.</div>
      <div style="width:390px;height:844px;background:#0B1013;border:1px solid #263237;border-radius:40px;overflow:hidden;display:flex;flex-direction:column;color:#E9F0EE;font-variant-numeric:tabular-nums;box-shadow:inset 0 1px 0 rgba(255,255,255,0.05), 0 40px 80px -40px rgba(0,0,0,0.9)">

        <div style="flex:none;display:flex;align-items:center;justify-content:space-between;padding:18px 28px 6px;font-size:13px;font-weight:700">
          <span>9:41</span>
          <span style="display:flex;align-items:center;gap:5px;font-family:'Material Symbols Rounded';font-size:15px;color:#B4C2BE"><span>network_wifi</span><span>battery_full</span></span>
        </div>

        <div style="flex:none;padding:14px 22px 18px;border-bottom:1px solid #1B2429;display:flex;align-items:flex-end;justify-content:space-between;gap:12px">
          <div style="display:flex;flex-direction:column;gap:5px">
            <div style="font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#687773">Thursday · Week 2</div>
            <div style="font-size:24px;font-weight:700;letter-spacing:-0.035em;line-height:1.05">Control</div>
          </div>
          <div style="display:flex;align-items:center;gap:7px;height:34px;padding:0 12px;border-radius:12px;background:#141B1F;border:1px solid #263237;font-size:13px;font-weight:700;color:#E8B15A"><span style="font-family:'Material Symbols Rounded';font-size:17px;font-variation-settings:'FILL' 1">local_fire_department</span>3 wks</div>
        </div>

        <div style="flex:1;overflow:auto;padding:18px 22px 24px;display:flex;flex-direction:column;gap:18px">

          <div style="flex:none;display:flex;flex-direction:column;gap:14px;background:linear-gradient(158deg,#1B2E26 0%,#141B1F 62%);border:1px solid #2C4238;border-radius:24px;padding:22px 20px">
            <div style="display:flex;align-items:center;gap:8px;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#6BD69B"><span style="font-family:'Material Symbols Rounded';font-size:17px">target</span>Today's one thing</div>
            <div style="font-size:25px;font-weight:700;letter-spacing:-0.035em;line-height:1.25;text-wrap:pretty">Stop the ball leaking right off the tee.</div>
            <div style="font-size:15px;line-height:1.5;color:#B4C2BE;text-wrap:pretty">Two-thirds of your misses last session went right. Today, only count a drive as good if it <b style="font-weight:700;color:#E9F0EE">starts left of the flag</b>.</div>
            <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:#8A9A96;padding-top:2px;border-top:1px solid #24332C;margin-top:2px;padding-top:12px">
              <span style="font-family:'Material Symbols Rounded';font-size:16px;color:#687773">auto_awesome</span>From your last 3 sessions
            </div>
          </div>

          <div style="flex:none;display:flex;flex-direction:column;gap:12px">
            <div style="display:flex;align-items:baseline;justify-content:space-between">
              <div style="font-size:13px;font-weight:600;color:#8A9A96">Form</div>
              <div style="font-size:13px;font-weight:600;color:#6BD69B">Solid rate 63% · up 3 sessions</div>
            </div>
            <div style="background:#141B1F;border:1px solid #263237;border-radius:20px;padding:16px 16px 12px">
              <svg viewBox="0 0 300 54" style="width:100%;height:54px;display:block;overflow:visible">
                <defs><linearGradient id="v2f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6BD69B" stop-opacity="0.3"></stop><stop offset="1" stop-color="#6BD69B" stop-opacity="0"></stop></linearGradient></defs>
                <path d="M4 44 L45 36 L86 39 L127 27 L168 22 L209 17 L250 20 L291 9 L291 50 L4 50 Z" fill="url(#v2f)"></path>
                <path d="M4 44 L45 36 L86 39 L127 27 L168 22 L209 17 L250 20 L291 9" fill="none" stroke="#6BD69B" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"></path>
                <circle cx="291" cy="9" r="4.5" fill="#0B1013" stroke="#6BD69B" stroke-width="2.5"></circle>
              </svg>
            </div>
          </div>

          <div style="flex:none;display:flex;flex-direction:column;gap:12px">
            <div style="display:flex;align-items:center;justify-content:space-between">
              <div style="font-size:13px;font-weight:600;color:#8A9A96">The 4-week plan</div>
              <div style="font-size:13px;font-weight:600;color:#687773">3 of 8 logged</div>
            </div>
            <div style="display:flex;align-items:center;gap:0">
              <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:7px"><span style="width:26px;height:26px;border-radius:9px;background:rgba(107,214,155,0.16);border:1px solid rgba(107,214,155,0.4);color:#6BD69B;display:flex;align-items:center;justify-content:center;font-family:'Material Symbols Rounded';font-size:16px;font-variation-settings:'FILL' 1">check</span><span style="font-size:11px;font-weight:600;color:#687773">W1·1</span></div>
              <div style="width:14px;height:2px;background:#1F292E;margin-top:-18px"></div>
              <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:7px"><span style="width:26px;height:26px;border-radius:9px;background:rgba(107,214,155,0.16);border:1px solid rgba(107,214,155,0.4);color:#6BD69B;display:flex;align-items:center;justify-content:center;font-family:'Material Symbols Rounded';font-size:16px;font-variation-settings:'FILL' 1">check</span><span style="font-size:11px;font-weight:600;color:#687773">W1·2</span></div>
              <div style="width:14px;height:2px;background:#1F292E;margin-top:-18px"></div>
              <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:7px"><span style="width:26px;height:26px;border-radius:9px;background:rgba(107,214,155,0.16);border:1px solid rgba(107,214,155,0.4);color:#6BD69B;display:flex;align-items:center;justify-content:center;font-family:'Material Symbols Rounded';font-size:16px;font-variation-settings:'FILL' 1">check</span><span style="font-size:11px;font-weight:600;color:#687773">W2·1</span></div>
              <div style="width:14px;height:2px;background:#1F292E;margin-top:-18px"></div>
              <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:7px"><span style="width:34px;height:34px;border-radius:11px;background:#6BD69B;color:#08120D;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;box-shadow:0 0 0 4px rgba(107,214,155,0.14)">2·2</span><span style="font-size:11px;font-weight:700;color:#6BD69B">Now</span></div>
              <div style="width:14px;height:2px;background:#1F292E;margin-top:-18px"></div>
              <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:7px"><span style="width:26px;height:26px;border-radius:9px;background:#141B1F;border:1px solid #263237;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;color:#8A9A96">3·1</span><span style="font-size:11px;font-weight:600;color:#687773"> </span></div>
              <div style="width:14px;height:2px;background:#1F292E;margin-top:-18px"></div>
              <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:7px"><span style="width:26px;height:26px;border-radius:9px;background:#141B1F;border:1px solid #263237;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;color:#8A9A96">3·2</span><span style="font-size:11px;font-weight:600;color:#687773"> </span></div>
              <div style="width:14px;height:2px;background:#1F292E;margin-top:-18px"></div>
              <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:7px"><span style="width:26px;height:26px;border-radius:9px;background:#141B1F;border:1px solid #263237;display:flex;align-items:center;justify-content:center;font-family:'Material Symbols Rounded';font-size:15px;color:#5B93C4">workspace_premium</span><span style="font-size:11px;font-weight:600;color:#687773">Test</span></div>
            </div>
          </div>

          <div style="flex:none;display:flex;flex-direction:column;gap:10px;margin-top:auto;padding-top:6px">
            <button style="height:64px;border:none;border-radius:20px;background:#6BD69B;color:#08120D;font-family:inherit;font-size:17px;font-weight:800;letter-spacing:-0.01em;display:flex;align-items:center;justify-content:space-between;padding:0 8px 0 22px;cursor:pointer" style-hover="background:#8AE0B0">
              <span style="display:flex;flex-direction:column;align-items:flex-start;gap:2px"><span>Start Session 2</span><span style="font-size:12px;font-weight:600;opacity:0.62">42 balls · about 35 min</span></span>
              <span style="width:48px;height:48px;border-radius:15px;background:rgba(8,18,13,0.14);display:flex;align-items:center;justify-content:center;font-family:'Material Symbols Rounded';font-size:24px;font-variation-settings:'FILL' 1">play_arrow</span>
            </button>
            <div style="display:flex;align-items:center;justify-content:center;gap:7px;height:44px;font-size:14px;font-weight:600;color:#8A9A96;cursor:pointer" style-hover="color:#E9F0EE"><span style="font-family:'Material Symbols Rounded';font-size:18px">bolt</span>Just 10 minutes instead</div>
          </div>
        </div>

        <div style="flex:none;display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid #1B2429;padding:6px 0 16px">
          <div style="height:60px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;color:#6BD69B"><span style="font-family:'Material Symbols Rounded';font-size:24px;font-variation-settings:'FILL' 1">flag</span><span style="font-size:11px;font-weight:700">Plan</span></div>
          <div style="height:60px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;color:#687773"><span style="font-family:'Material Symbols Rounded';font-size:24px">sports_golf</span><span style="font-size:11px;font-weight:600">Log</span></div>
          <div style="height:60px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;color:#687773"><span style="font-family:'Material Symbols Rounded';font-size:24px">show_chart</span><span style="font-size:11px;font-weight:600">Trends</span></div>
          <div style="height:60px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;color:#687773"><span style="font-family:'Material Symbols Rounded';font-size:24px">more_horiz</span><span style="font-size:11px;font-weight:600">More</span></div>
        </div>
      </div>
    </div>

    <!-- ========== 2. LOG · SHOT STRIP ========== -->
    <div style="display:flex;flex-direction:column;gap:14px;width:390px">
      <div style="display:flex;align-items:center;gap:8px;font-size:13px;font-weight:700;color:#E9F0EE;letter-spacing:-0.01em"><span style="width:6px;height:6px;border-radius:4px;background:#6BD69B;display:block"></span>2 · The signature interaction</div>
      <div style="font-size:13px;line-height:1.5;color:#687773;text-wrap:pretty">Your three counters stay — but each tap also <b style="color:#8A9A96;font-weight:600">appends a dot to the shot strip</b>, so the pattern of the session builds in front of you and the app knows which ball you're on. Tap the buttons below to try it.</div>
      <div style="width:390px;height:844px;background:#0B1013;border:1px solid #263237;border-radius:40px;overflow:hidden;display:flex;flex-direction:column;color:#E9F0EE;font-variant-numeric:tabular-nums;box-shadow:inset 0 1px 0 rgba(255,255,255,0.05), 0 40px 80px -40px rgba(0,0,0,0.9)">

        <div style="flex:none;display:flex;align-items:center;justify-content:space-between;padding:18px 28px 6px;font-size:13px;font-weight:700">
          <span>9:41</span>
          <span style="display:flex;align-items:center;gap:5px;font-family:'Material Symbols Rounded';font-size:15px;color:#B4C2BE"><span>network_wifi</span><span>battery_full</span></span>
        </div>

        <div style="flex:none;padding:12px 18px 14px;border-bottom:1px solid #1B2429;display:flex;align-items:center;gap:12px">
          <div style="width:44px;height:44px;border-radius:14px;background:#141B1F;border:1px solid #263237;display:flex;align-items:center;justify-content:center;font-family:'Material Symbols Rounded';font-size:21px;color:#B4C2BE;cursor:pointer">close</div>
          <div style="flex:1;display:flex;flex-direction:column;gap:5px">
            <div style="font-size:15px;font-weight:700;letter-spacing:-0.02em">Driving · Positional Drive</div>
            <div style="display:flex;gap:5px">
              <span style="flex:1;height:3px;border-radius:2px;background:#6BD69B"></span>
              <span style="flex:1;height:3px;border-radius:2px;background:#6BD69B"></span>
              <span style="flex:1;height:3px;border-radius:2px;background:#2C4238"></span>
              <span style="flex:1;height:3px;border-radius:2px;background:#1F292E"></span>
              <span style="flex:1;height:3px;border-radius:2px;background:#1F292E"></span>
            </div>
          </div>
          <div style="width:44px;height:44px;border-radius:14px;background:#141B1F;border:1px solid #263237;display:flex;align-items:center;justify-content:center;font-family:'Material Symbols Rounded';font-size:21px;color:#B4C2BE;cursor:pointer">help</div>
        </div>

        <div style="flex:1;overflow:auto;padding:20px 22px 20px;display:flex;flex-direction:column;gap:20px">

          <div style="flex:none;display:flex;flex-direction:column;gap:14px;align-items:center;text-align:center">
            <div style="font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#687773">Ball {{ ballNo }} of 10</div>
            <div style="font-size:22px;font-weight:700;letter-spacing:-0.03em;line-height:1.3;text-wrap:pretty;max-width:300px">Where did it <span style="color:#6BD69B">start</span>?</div>
          </div>

          <div style="flex:none;background:#141B1F;border:1px solid #263237;border-radius:22px;padding:18px 16px;display:flex;flex-direction:column;gap:14px">
            <div style="display:flex;align-items:center;justify-content:space-between">
              <div style="font-size:13px;font-weight:600;color:#8A9A96">This session's shots</div>
              <div style="display:flex;align-items:center;gap:6px;font-size:13px;font-weight:700;color:{{ rateColor }}"><span style="font-family:'Material Symbols Rounded';font-size:16px">insights</span>{{ ratePct }}% on line</div>
            </div>
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              <sc-for list="{{ strip }}" as="dot" hint-placeholder-count="10">
                <span style="width:26px;height:26px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-family:'Material Symbols Rounded';font-size:15px;background:{{ dot.bg }};border:1px solid {{ dot.br }};color:{{ dot.fg }}">{{ dot.icon }}</span>
              </sc-for>
            </div>
            <div style="display:flex;align-items:center;gap:8px;font-size:13px;line-height:1.45;color:#8A9A96;text-wrap:pretty;border-top:1px solid #1F292E;padding-top:12px">
              <span style="font-family:'Material Symbols Rounded';font-size:17px;color:#5B93C4">lightbulb</span>{{ liveNote }}
            </div>
          </div>

          <div style="flex:none;display:flex;flex-direction:column;gap:10px">
            <button onClick="{{ tapFairway }}" style="height:104px;border-radius:22px;border:1px solid rgba(107,214,155,0.42);background:linear-gradient(180deg,rgba(107,214,155,0.2),rgba(107,214,155,0.08));display:flex;align-items:center;justify-content:space-between;padding:0 22px;font-family:inherit;cursor:pointer" style-active="background:rgba(107,214,155,0.3)">
              <span style="display:flex;flex-direction:column;align-items:flex-start;gap:3px">
                <span style="display:flex;align-items:center;gap:8px;font-size:19px;font-weight:700;letter-spacing:-0.02em;color:#E9F0EE"><span style="font-family:'Material Symbols Rounded';font-size:21px;color:#6BD69B">check_circle</span>On my line</span>
                <span style="font-size:13px;font-weight:600;color:#9FD9BB">Started at the target</span>
              </span>
              <span style="font-size:44px;font-weight:800;line-height:0.9;letter-spacing:-0.05em;color:#6BD69B;font-variant-numeric:tabular-nums">{{ fairway }}</span>
            </button>
            <div style="display:flex;gap:10px">
              <button onClick="{{ tapLeft }}" style="flex:1;height:96px;border-radius:20px;border:1px solid rgba(232,177,90,0.36);background:linear-gradient(180deg,rgba(232,177,90,0.16),rgba(232,177,90,0.05));display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;font-family:inherit;cursor:pointer" style-active="background:rgba(232,177,90,0.26)">
                <span style="font-size:34px;font-weight:800;line-height:0.9;letter-spacing:-0.05em;color:#E8B15A;font-variant-numeric:tabular-nums">{{ left }}</span>
                <span style="display:flex;align-items:center;gap:4px;font-size:13px;font-weight:700;color:#D2B588"><span style="font-family:'Material Symbols Rounded';font-size:16px">west</span>Left</span>
              </button>
              <button onClick="{{ tapRight }}" style="flex:1;height:96px;border-radius:20px;border:1px solid rgba(210,114,107,0.36);background:linear-gradient(180deg,rgba(210,114,107,0.16),rgba(210,114,107,0.05));display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;font-family:inherit;cursor:pointer" style-active="background:rgba(210,114,107,0.26)">
                <span style="font-size:34px;font-weight:800;line-height:0.9;letter-spacing:-0.05em;color:#D2726B;font-variant-numeric:tabular-nums">{{ right }}</span>
                <span style="display:flex;align-items:center;gap:4px;font-size:13px;font-weight:700;color:#CE9B97"><span style="font-family:'Material Symbols Rounded';font-size:16px">east</span>Right</span>
              </button>
            </div>
            <div style="display:flex;gap:10px">
              <div onClick="{{ undo }}" style="flex:1;height:48px;border-radius:15px;background:#141B1F;border:1px solid #263237;display:flex;align-items:center;justify-content:center;gap:7px;font-size:14px;font-weight:600;color:#B4C2BE;cursor:pointer" style-hover="background:#1C2529"><span style="font-family:'Material Symbols Rounded';font-size:18px">undo</span>Undo last</div>
              <div style="flex:1;height:48px;border-radius:15px;background:#141B1F;border:1px solid #263237;display:flex;align-items:center;justify-content:center;gap:7px;font-size:14px;font-weight:600;color:#B4C2BE;cursor:pointer" style-hover="background:#1C2529">Skip area<span style="font-family:'Material Symbols Rounded';font-size:18px">arrow_forward</span></div>
            </div>
          </div>

          <sc-if value="{{ showDrill }}" hint-placeholder-val="{{ true }}">
            <div style="flex:none;background:#1C2529;border:1px solid #263237;border-radius:18px;padding:16px;display:flex;flex-direction:column;gap:9px">
              <div style="display:flex;align-items:center;gap:8px;font-size:15px;font-weight:700;letter-spacing:-0.01em"><span style="font-family:'Material Symbols Rounded';font-size:18px;color:#6BD69B">bolt</span>Focus drill</div>
              <div style="font-size:14px;line-height:1.55;color:#B4C2BE;text-wrap:pretty">One target for all ten balls. Set your feet, name it out loud, swing at 80%. Off the line is a miss even if it finishes long.</div>
            </div>
          </sc-if>
        </div>
      </div>
    </div>

    <!-- ========== 3. TRENDS · VERDICT ========== -->
    <div style="display:flex;flex-direction:column;gap:14px;width:390px">
      <div style="display:flex;align-items:center;gap:8px;font-size:13px;font-weight:700;color:#E9F0EE;letter-spacing:-0.01em"><span style="width:6px;height:6px;border-radius:4px;background:#6BD69B;display:block"></span>3 · Trends answer a question</div>
      <div style="font-size:13px;line-height:1.5;color:#687773;text-wrap:pretty">Charts don't tell you if you're improving — they make you decide. So lead with the <b style="color:#8A9A96;font-weight:600">verdict</b>, name what's driving it, and only then show the line as evidence.</div>
      <div style="width:390px;height:844px;background:#0B1013;border:1px solid #263237;border-radius:40px;overflow:hidden;display:flex;flex-direction:column;color:#E9F0EE;font-variant-numeric:tabular-nums;box-shadow:inset 0 1px 0 rgba(255,255,255,0.05), 0 40px 80px -40px rgba(0,0,0,0.9)">

        <div style="flex:none;display:flex;align-items:center;justify-content:space-between;padding:18px 28px 6px;font-size:13px;font-weight:700">
          <span>9:41</span>
          <span style="display:flex;align-items:center;gap:5px;font-family:'Material Symbols Rounded';font-size:15px;color:#B4C2BE"><span>network_wifi</span><span>battery_full</span></span>
        </div>

        <div style="flex:none;padding:14px 22px 18px;border-bottom:1px solid #1B2429;display:flex;align-items:flex-end;justify-content:space-between;gap:12px">
          <div style="display:flex;flex-direction:column;gap:5px">
            <div style="font-size:24px;font-weight:700;letter-spacing:-0.035em;line-height:1.05">Progress</div>
            <div style="font-size:14px;color:#8A9A96">8 sessions · 4 weeks</div>
          </div>
          <div style="display:flex;gap:8px">
            <div style="width:44px;height:44px;border-radius:14px;background:#141B1F;border:1px solid #263237;display:flex;align-items:center;justify-content:center;font-family:'Material Symbols Rounded';font-size:20px;color:#B4C2BE">ios_share</div>
            <div style="width:44px;height:44px;border-radius:14px;background:#141B1F;border:1px solid #263237;display:flex;align-items:center;justify-content:center;font-family:'Material Symbols Rounded';font-size:20px;color:#B4C2BE">tune</div>
          </div>
        </div>

        <div style="flex:1;overflow:auto;padding:18px 22px 24px;display:flex;flex-direction:column;gap:14px">

          <div style="flex:none;background:linear-gradient(158deg,#1B2E26 0%,#141B1F 62%);border:1px solid #2C4238;border-radius:24px;padding:22px 20px;display:flex;flex-direction:column;gap:12px">
            <div style="display:flex;align-items:center;gap:8px;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#6BD69B"><span style="font-family:'Material Symbols Rounded';font-size:17px">verified</span>Verdict</div>
            <div style="font-size:30px;font-weight:800;letter-spacing:-0.04em;line-height:1.1">It's working.</div>
            <div style="font-size:15px;line-height:1.5;color:#B4C2BE;text-wrap:pretty">Your solid rate has climbed <b style="color:#6BD69B;font-weight:700">8 points</b> over four sessions — past the noise in your own numbers. Keep the plan.</div>
            <div style="display:flex;gap:5px;padding-top:6px">
              <span style="flex:1;height:5px;border-radius:3px;background:#6BD69B"></span>
              <span style="flex:1;height:5px;border-radius:3px;background:#6BD69B"></span>
              <span style="flex:1;height:5px;border-radius:3px;background:#6BD69B"></span>
              <span style="flex:1;height:5px;border-radius:3px;background:#2C4238"></span>
            </div>
            <div style="font-size:12px;font-weight:600;color:#687773">Confidence: 3 of 4 · needs one more session to be certain</div>
          </div>

          <div style="flex:none;display:flex;gap:12px">
            <div style="flex:1;background:#141B1F;border:1px solid #263237;border-radius:20px;padding:16px;display:flex;flex-direction:column;gap:10px">
              <div style="display:flex;align-items:center;gap:6px;font-size:12px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:#6BD69B"><span style="font-family:'Material Symbols Rounded';font-size:16px">arrow_upward</span>Gaining</div>
              <div style="font-size:17px;font-weight:700;letter-spacing:-0.02em">Chipping</div>
              <div style="font-size:13px;color:#8A9A96;line-height:1.4">7 in 10 on the towel, up from 4</div>
            </div>
            <div style="flex:1;background:#141B1F;border:1px solid #263237;border-radius:20px;padding:16px;display:flex;flex-direction:column;gap:10px">
              <div style="display:flex;align-items:center;gap:6px;font-size:12px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:#D2726B"><span style="font-family:'Material Symbols Rounded';font-size:16px">arrow_downward</span>Slipping</div>
              <div style="font-size:17px;font-weight:700;letter-spacing:-0.02em">Putting</div>
              <div style="font-size:13px;color:#8A9A96;line-height:1.4">Down 9 points across 3 sessions</div>
            </div>
          </div>

          <div style="flex:none;background:#141B1F;border:1px solid #263237;border-radius:22px;padding:20px 18px;display:flex;flex-direction:column;gap:14px">
            <div style="display:flex;align-items:center;gap:8px;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#8A9A96"><span style="font-family:'Material Symbols Rounded';font-size:17px;color:#5B93C4">radar</span>Your miss pattern</div>
            <div style="display:flex;align-items:center;gap:16px">
              <div style="display:flex;flex-direction:column;gap:6px;flex:1">
                <div style="display:flex;align-items:center;gap:8px">
                  <span style="width:44px;font-size:12px;font-weight:600;color:#8A9A96">Left</span>
                  <span style="flex:1;height:12px;border-radius:6px;background:#1F292E;overflow:hidden;display:block"><span style="display:block;width:32%;height:100%;background:#E8B15A;border-radius:6px"></span></span>
                  <span style="width:32px;text-align:right;font-size:13px;font-weight:700;color:#E8B15A">32%</span>
                </div>
                <div style="display:flex;align-items:center;gap:8px">
                  <span style="width:44px;font-size:12px;font-weight:600;color:#8A9A96">Right</span>
                  <span style="flex:1;height:12px;border-radius:6px;background:#1F292E;overflow:hidden;display:block"><span style="display:block;width:68%;height:100%;background:#D2726B;border-radius:6px"></span></span>
                  <span style="width:32px;text-align:right;font-size:13px;font-weight:700;color:#D2726B">68%</span>
                </div>
              </div>
            </div>
            <div style="font-size:15px;line-height:1.5;color:#B4C2BE;text-wrap:pretty">Two in three misses go right, and it's worse late in a session — a tiring, quickening transition. That's one fix, not two.</div>
            <div style="display:flex;align-items:center;justify-content:space-between;height:52px;padding:0 8px 0 16px;border-radius:16px;background:rgba(91,147,196,0.10);border:1px solid rgba(91,147,196,0.3);cursor:pointer" style-hover="background:rgba(91,147,196,0.16)">
              <span style="display:flex;align-items:center;gap:9px;font-size:14px;font-weight:700;color:#A9C2D6"><span style="font-family:'Material Symbols Rounded';font-size:18px;color:#7FB0D8">build</span>Open the fix for a right miss</span>
              <span style="font-family:'Material Symbols Rounded';font-size:20px;color:#7FB0D8">chevron_right</span>
            </div>
          </div>

          <div style="flex:none;background:#141B1F;border:1px solid #263237;border-radius:22px;padding:18px 16px 14px;display:flex;flex-direction:column;gap:12px">
            <div style="display:flex;align-items:flex-end;justify-content:space-between;padding:0 2px">
              <div style="display:flex;flex-direction:column;gap:5px">
                <div style="font-size:15px;font-weight:700;letter-spacing:-0.01em">Solid strike %</div>
                <div style="font-size:13px;color:#687773">The evidence behind the verdict</div>
              </div>
              <div style="font-size:40px;font-weight:800;line-height:0.9;letter-spacing:-0.05em;color:#6BD69B">63<span style="font-size:20px;letter-spacing:-0.02em">%</span></div>
            </div>
            <svg viewBox="0 0 300 86" style="width:100%;height:86px;display:block;overflow:visible">
              <defs><linearGradient id="v2t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6BD69B" stop-opacity="0.28"></stop><stop offset="1" stop-color="#6BD69B" stop-opacity="0"></stop></linearGradient></defs>
              <rect x="130" y="8" width="160" height="70" fill="rgba(107,214,155,0.05)" rx="6"></rect>
              <line x1="10" y1="78" x2="290" y2="78" stroke="#1F292E" stroke-width="1"></line>
              <path d="M10 68 L50 57 L90 61 L130 44 L170 37 L210 30 L250 33 L290 19 L290 78 L10 78 Z" fill="url(#v2t)"></path>
              <path d="M10 68 L50 57 L90 61 L130 44 L170 37 L210 30 L250 33 L290 19" fill="none" stroke="#6BD69B" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"></path>
              <circle cx="290" cy="19" r="4.5" fill="#0B1013" stroke="#6BD69B" stroke-width="2.5"></circle>
              <text x="134" y="20" font-size="9" font-family="Manrope" font-weight="700" fill="#6BD69B">THE GAIN</text>
            </svg>
            <div style="display:flex;justify-content:space-between;font-size:11px;font-weight:600;color:#5D6C68;padding:0 6px"><span>S1</span><span>S8</span></div>
          </div>
        </div>

        <div style="flex:none;display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid #1B2429;padding:6px 0 16px">
          <div style="height:60px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;color:#687773"><span style="font-family:'Material Symbols Rounded';font-size:24px">flag</span><span style="font-size:11px;font-weight:600">Plan</span></div>
          <div style="height:60px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;color:#687773"><span style="font-family:'Material Symbols Rounded';font-size:24px">sports_golf</span><span style="font-size:11px;font-weight:600">Log</span></div>
          <div style="height:60px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;color:#6BD69B"><span style="font-family:'Material Symbols Rounded';font-size:24px;font-variation-settings:'FILL' 1">show_chart</span><span style="font-size:11px;font-weight:700">Trends</span></div>
          <div style="height:60px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;color:#687773"><span style="font-family:'Material Symbols Rounded';font-size:24px">more_horiz</span><span style="font-size:11px;font-weight:600">More</span></div>
        </div>
      </div>
    </div>

    <!-- ========== 4. SESSION RECEIPT ========== -->
    <div style="display:flex;flex-direction:column;gap:14px;width:390px">
      <div style="display:flex;align-items:center;gap:8px;font-size:13px;font-weight:700;color:#E9F0EE;letter-spacing:-0.01em"><span style="width:6px;height:6px;border-radius:4px;background:#E8B15A;display:block"></span>4 · The reason to come back</div>
      <div style="font-size:13px;line-height:1.5;color:#687773;text-wrap:pretty">Finishing currently fires a toast. Instead: a <b style="color:#8A9A96;font-weight:600">card worth looking at</b> — what changed, the one thing that moved, and the next session already framed. Shareable, so the app travels.</div>
      <div style="width:390px;height:844px;background:#0B1013;border:1px solid #263237;border-radius:40px;overflow:hidden;display:flex;flex-direction:column;color:#E9F0EE;font-variant-numeric:tabular-nums;box-shadow:inset 0 1px 0 rgba(255,255,255,0.05), 0 40px 80px -40px rgba(0,0,0,0.9)">

        <div style="flex:none;display:flex;align-items:center;justify-content:space-between;padding:18px 28px 6px;font-size:13px;font-weight:700">
          <span>9:41</span>
          <span style="display:flex;align-items:center;gap:5px;font-family:'Material Symbols Rounded';font-size:15px;color:#B4C2BE"><span>network_wifi</span><span>battery_full</span></span>
        </div>

        <div style="flex:1;overflow:auto;padding:26px 22px 24px;display:flex;flex-direction:column;gap:18px">

          <div style="flex:none;display:flex;flex-direction:column;gap:8px;align-items:center;text-align:center;padding:10px 0 4px">
            <div style="width:56px;height:56px;border-radius:19px;background:rgba(107,214,155,0.14);border:1px solid rgba(107,214,155,0.4);display:flex;align-items:center;justify-content:center;font-family:'Material Symbols Rounded';font-size:28px;color:#6BD69B;font-variation-settings:'FILL' 1">check</div>
            <div style="font-size:26px;font-weight:800;letter-spacing:-0.04em;line-height:1.15;padding-top:6px">Session 2 logged</div>
            <div style="font-size:14px;color:#8A9A96">Week 2 · Control · 42 balls · 38 min</div>
          </div>

          <div style="flex:none;background:linear-gradient(158deg,#1B2E26 0%,#141B1F 62%);border:1px solid #2C4238;border-radius:24px;padding:22px 20px;display:flex;flex-direction:column;gap:16px">
            <div style="display:flex;align-items:center;gap:8px;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#6BD69B"><span style="font-family:'Material Symbols Rounded';font-size:17px">trending_up</span>What moved</div>
            <div style="display:flex;align-items:flex-end;gap:12px">
              <div style="font-size:60px;font-weight:800;line-height:0.85;letter-spacing:-0.05em;color:#6BD69B">+6</div>
              <div style="font-size:15px;line-height:1.4;color:#B4C2BE;padding-bottom:6px">points of solid rate<br>your best session yet</div>
            </div>
            <div style="display:flex;flex-direction:column;gap:9px;border-top:1px solid #24332C;padding-top:16px">
              <div style="display:flex;align-items:center;justify-content:space-between;font-size:14px"><span style="color:#B4C2BE">Driving · on line</span><span style="font-weight:700">7 of 10</span></div>
              <div style="display:flex;align-items:center;justify-content:space-between;font-size:14px"><span style="color:#B4C2BE">Irons · solid</span><span style="font-weight:700">7 of 9</span></div>
              <div style="display:flex;align-items:center;justify-content:space-between;font-size:14px"><span style="color:#B4C2BE">Chipping · on towel</span><span style="font-weight:700">7 of 10</span></div>
              <div style="display:flex;align-items:center;justify-content:space-between;font-size:14px"><span style="color:#B4C2BE">Putting · made</span><span style="font-weight:700;color:#D2726B">5 of 10</span></div>
            </div>
          </div>

          <div style="flex:none;background:#141B1F;border:1px solid #263237;border-radius:22px;padding:20px 18px;display:flex;flex-direction:column;gap:10px">
            <div style="display:flex;align-items:center;gap:8px;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#8A9A96"><span style="font-family:'Material Symbols Rounded';font-size:17px;color:#5B93C4">bookmark</span>Remember this</div>
            <div style="font-size:16px;line-height:1.5;color:#E9F0EE;text-wrap:pretty">"Start line was better once I slowed the transition."</div>
            <div style="font-size:13px;color:#687773">Your note — we'll show it at the top of your next session.</div>
          </div>

          <div style="flex:none;display:flex;flex-direction:column;gap:10px;margin-top:auto">
            <button style="height:62px;border:none;border-radius:20px;background:#6BD69B;color:#08120D;font-family:inherit;font-size:17px;font-weight:800;letter-spacing:-0.01em;display:flex;align-items:center;justify-content:center;gap:10px;cursor:pointer" style-hover="background:#8AE0B0"><span style="font-family:'Material Symbols Rounded';font-size:22px">ios_share</span>Share this card</button>
            <div style="display:flex;align-items:center;justify-content:space-between;height:60px;padding:0 8px 0 18px;border-radius:20px;background:#141B1F;border:1px solid #263237;cursor:pointer" style-hover="background:#1C2529">
              <span style="display:flex;flex-direction:column;gap:2px"><span style="font-size:15px;font-weight:700;letter-spacing:-0.01em">Next: Week 3 · Session 1</span><span style="font-size:13px;color:#8A9A96">Putting gets the extra block</span></span>
              <span style="width:44px;height:44px;border-radius:14px;background:#1C2529;display:flex;align-items:center;justify-content:center;font-family:'Material Symbols Rounded';font-size:21px;color:#B4C2BE">event</span>
            </div>
            <div style="display:flex;align-items:center;justify-content:center;height:44px;font-size:14px;font-weight:600;color:#8A9A96;cursor:pointer" style-hover="color:#E9F0EE">Done</div>
          </div>
        </div>
      </div>
    </div>

  </div>
</section>

<section style="background:#070C0E;padding:8px 52px 96px;font-family:Manrope,-apple-system,sans-serif;box-sizing:border-box">

  <div style="display:flex;align-items:center;gap:16px;margin-bottom:40px">
    <div style="font-size:22px;font-weight:700;color:#E9F0EE;letter-spacing:-0.025em">The other pages</div>
    <div style="font-size:14px;color:#687773;max-width:620px;text-wrap:pretty">Welcome, Warm-up, Prep, Library and Fixes — the five screens that exist in the app but carry none of the coach voice. Same treatment: one clear job per screen, content from your own <span style="color:#8A9A96">prep.ts</span>, <span style="color:#8A9A96">library.ts</span> and <span style="color:#8A9A96">faults.ts</span>.</div>
    <div style="flex:1;height:1px;background:#141B1F"></div>
  </div>

  <div style="display:flex;flex-wrap:wrap;gap:60px;align-items:flex-start">

    <!-- ===== 5 · WELCOME ===== -->
    <div style="display:flex;flex-direction:column;gap:14px;width:390px">
      <div style="display:flex;align-items:center;gap:8px;font-size:13px;font-weight:700;color:#E9F0EE;letter-spacing:-0.01em"><span style="width:6px;height:6px;border-radius:4px;background:#6BD69B;display:block"></span>5 · Welcome</div>
      <div style="font-size:13px;line-height:1.5;color:#687773;text-wrap:pretty">A name field is a weak first impression. Ask the one question that <b style="color:#8A9A96;font-weight:600">changes the plan</b> — your miss — and the app starts personal on session one. Name comes after, optional as it already is.</div>
      <div style="width:390px;height:844px;background:#0B1013;border:1px solid #263237;border-radius:40px;overflow:hidden;display:flex;flex-direction:column;color:#E9F0EE;font-variant-numeric:tabular-nums;box-shadow:inset 0 1px 0 rgba(255,255,255,0.05), 0 40px 80px -40px rgba(0,0,0,0.9)">
        <div style="flex:none;display:flex;align-items:center;justify-content:space-between;padding:18px 28px 6px;font-size:13px;font-weight:700"><span>9:41</span><span style="display:flex;align-items:center;gap:5px;font-family:'Material Symbols Rounded';font-size:15px;color:#B4C2BE"><span>network_wifi</span><span>battery_full</span></span></div>

        <div style="flex:1;overflow:auto;padding:30px 26px 26px;display:flex;flex-direction:column;gap:22px">
          <div style="flex:none;display:flex;flex-direction:column;gap:14px">
            <div style="width:52px;height:52px;border-radius:17px;background:#6BD69B;color:#08120D;display:flex;align-items:center;justify-content:center;font-family:'Material Symbols Rounded';font-size:27px;font-variation-settings:'FILL' 1">sports_golf</div>
            <div style="font-size:31px;font-weight:800;letter-spacing:-0.04em;line-height:1.1;text-wrap:pretty">Where does your bad one go?</div>
            <div style="font-size:15px;line-height:1.55;color:#8A9A96;text-wrap:pretty">One tap and your first four weeks are built around it. Everything stays on this device.</div>
          </div>

          <div style="flex:none;display:flex;flex-direction:column;gap:10px">
            <div style="display:flex;align-items:center;justify-content:space-between;height:76px;padding:0 20px;border-radius:20px;background:linear-gradient(180deg,rgba(210,114,107,0.16),rgba(210,114,107,0.05));border:1px solid rgba(210,114,107,0.42);cursor:pointer" style-hover="background:rgba(210,114,107,0.22)">
              <span style="display:flex;flex-direction:column;gap:3px"><span style="font-size:18px;font-weight:700;letter-spacing:-0.02em">Right — a slice</span><span style="font-size:13px;color:#CE9B97">Starts right or curves away late</span></span>
              <span style="font-family:'Material Symbols Rounded';font-size:26px;color:#D2726B">east</span>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;height:76px;padding:0 20px;border-radius:20px;background:#141B1F;border:1px solid #263237;cursor:pointer" style-hover="background:#1C2529">
              <span style="display:flex;flex-direction:column;gap:3px"><span style="font-size:18px;font-weight:700;letter-spacing:-0.02em">Left — a hook</span><span style="font-size:13px;color:#8A9A96">Pulls left, sometimes hard</span></span>
              <span style="font-family:'Material Symbols Rounded';font-size:26px;color:#687773">west</span>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;height:76px;padding:0 20px;border-radius:20px;background:#141B1F;border:1px solid #263237;cursor:pointer" style-hover="background:#1C2529">
              <span style="display:flex;flex-direction:column;gap:3px"><span style="font-size:18px;font-weight:700;letter-spacing:-0.02em">Fat or thin</span><span style="font-size:13px;color:#8A9A96">Strike is the problem, not the line</span></span>
              <span style="font-family:'Material Symbols Rounded';font-size:26px;color:#687773">height</span>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;height:76px;padding:0 20px;border-radius:20px;background:#141B1F;border:1px solid #263237;cursor:pointer" style-hover="background:#1C2529">
              <span style="display:flex;flex-direction:column;gap:3px"><span style="font-size:18px;font-weight:700;letter-spacing:-0.02em">It varies</span><span style="font-size:13px;color:#8A9A96">Start with the balanced plan</span></span>
              <span style="font-family:'Material Symbols Rounded';font-size:26px;color:#687773">shuffle</span>
            </div>
          </div>

          <div style="flex:none;display:flex;flex-direction:column;gap:12px;margin-top:auto">
            <div style="display:flex;align-items:center;gap:12px;height:58px;padding:0 18px;border-radius:18px;background:#11181B;border:1px solid #1F292E">
              <span style="font-family:'Material Symbols Rounded';font-size:19px;color:#687773">person</span>
              <span style="font-size:15px;color:#5D6C68">Your name — optional</span>
            </div>
            <div style="display:flex;align-items:center;gap:9px;font-size:13px;line-height:1.45;color:#687773"><span style="font-family:'Material Symbols Rounded';font-size:17px;color:#5B93C4">lock</span>No account, no upload. Works with the phone in your pocket and no signal.</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== 6 · WARM-UP ===== -->
    <div style="display:flex;flex-direction:column;gap:14px;width:390px">
      <div style="display:flex;align-items:center;gap:8px;font-size:13px;font-weight:700;color:#E9F0EE;letter-spacing:-0.01em"><span style="width:6px;height:6px;border-radius:4px;background:#E8B15A;display:block"></span>6 · Warm-up</div>
      <div style="font-size:13px;line-height:1.5;color:#687773;text-wrap:pretty">Seven checkboxes read like homework. Make it a <b style="color:#8A9A96;font-weight:600">guided run</b> — one movement at a time, big enough to read at arm's length, with the rest waiting below. Skip stays a first-class option.</div>
      <div style="width:390px;height:844px;background:#0B1013;border:1px solid #263237;border-radius:40px;overflow:hidden;display:flex;flex-direction:column;color:#E9F0EE;font-variant-numeric:tabular-nums;box-shadow:inset 0 1px 0 rgba(255,255,255,0.05), 0 40px 80px -40px rgba(0,0,0,0.9)">
        <div style="flex:none;display:flex;align-items:center;justify-content:space-between;padding:18px 28px 6px;font-size:13px;font-weight:700"><span>9:41</span><span style="display:flex;align-items:center;gap:5px;font-family:'Material Symbols Rounded';font-size:15px;color:#B4C2BE"><span>network_wifi</span><span>battery_full</span></span></div>

        <div style="flex:none;padding:12px 20px 14px;border-bottom:1px solid #1B2429;display:flex;align-items:center;gap:12px">
          <div style="flex:1;display:flex;flex-direction:column;gap:6px">
            <div style="font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#687773">Warm-up · 3 of 7</div>
            <div style="display:flex;gap:4px">
              <span style="flex:1;height:3px;border-radius:2px;background:#6BD69B"></span>
              <span style="flex:1;height:3px;border-radius:2px;background:#6BD69B"></span>
              <span style="flex:1;height:3px;border-radius:2px;background:#6BD69B"></span>
              <span style="flex:1;height:3px;border-radius:2px;background:#2C4238"></span>
              <span style="flex:1;height:3px;border-radius:2px;background:#1F292E"></span>
              <span style="flex:1;height:3px;border-radius:2px;background:#1F292E"></span>
              <span style="flex:1;height:3px;border-radius:2px;background:#1F292E"></span>
            </div>
          </div>
          <div style="height:44px;padding:0 16px;border-radius:14px;background:#141B1F;border:1px solid #263237;display:flex;align-items:center;font-size:14px;font-weight:600;color:#B4C2BE;cursor:pointer" style-hover="background:#1C2529">Skip</div>
        </div>

        <div style="flex:1;overflow:auto;padding:22px 22px 24px;display:flex;flex-direction:column;gap:18px">
          <div style="flex:none;background:linear-gradient(158deg,#1B2E26 0%,#141B1F 62%);border:1px solid #2C4238;border-radius:24px;padding:24px 20px;display:flex;flex-direction:column;gap:16px">
            <div style="display:flex;align-items:center;justify-content:space-between">
              <div style="display:flex;align-items:center;gap:8px;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#6BD69B"><span style="font-family:'Material Symbols Rounded';font-size:17px">self_improvement</span>Now</div>
              <div style="font-size:13px;font-weight:700;color:#8A9A96">4 of 7</div>
            </div>
            <div style="font-size:27px;font-weight:800;letter-spacing:-0.04em;line-height:1.1">Legs</div>
            <div style="font-size:16px;line-height:1.55;color:#B4C2BE;text-wrap:pretty">One leg in front of the other, front knee bent and back leg straight; let the back heel gently touch down. Both sides.</div>
            <div style="display:flex;gap:10px;padding-top:4px">
              <button style="flex:1;height:58px;border:none;border-radius:18px;background:#6BD69B;color:#08120D;font-family:inherit;font-size:16px;font-weight:800;display:flex;align-items:center;justify-content:center;gap:9px;cursor:pointer" style-hover="background:#8AE0B0"><span style="font-family:'Material Symbols Rounded';font-size:21px">check</span>Done</button>
              <div style="width:58px;height:58px;border-radius:18px;background:#141B1F;border:1px solid #2C4238;display:flex;align-items:center;justify-content:center;font-family:'Material Symbols Rounded';font-size:22px;color:#B4C2BE;cursor:pointer" style-hover="background:#1C2529">redo</div>
            </div>
          </div>

          <div style="flex:none;display:flex;flex-direction:column;gap:8px">
            <div style="font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#687773">Still to come</div>
            <div style="background:#141B1F;border:1px solid #263237;border-radius:20px;overflow:hidden">
              <div style="display:flex;align-items:center;gap:14px;height:60px;padding:0 18px;border-bottom:1px solid #1B2429"><span style="font-family:'Material Symbols Rounded';font-size:19px;color:#687773">radio_button_unchecked</span><span style="font-size:15px;font-weight:600">Ankles &amp; calves</span></div>
              <div style="display:flex;align-items:center;gap:14px;height:60px;padding:0 18px;border-bottom:1px solid #1B2429"><span style="font-family:'Material Symbols Rounded';font-size:19px;color:#687773">radio_button_unchecked</span><span style="font-size:15px;font-weight:600">Body turn</span></div>
              <div style="display:flex;align-items:center;gap:14px;height:60px;padding:0 18px"><span style="font-family:'Material Symbols Rounded';font-size:19px;color:#687773">radio_button_unchecked</span><span style="font-size:15px;font-weight:600">Forearms</span></div>
            </div>
          </div>

          <div style="flex:none;display:flex;flex-direction:column;gap:8px">
            <div style="font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#687773">Done</div>
            <div style="display:flex;flex-wrap:wrap;gap:8px">
              <span style="display:flex;align-items:center;gap:6px;height:38px;padding:0 14px;border-radius:13px;background:rgba(107,214,155,0.10);border:1px solid rgba(107,214,155,0.32);font-size:14px;font-weight:600;color:#9FD9BB"><span style="font-family:'Material Symbols Rounded';font-size:16px">check</span>Shoulders</span>
              <span style="display:flex;align-items:center;gap:6px;height:38px;padding:0 14px;border-radius:13px;background:rgba(107,214,155,0.10);border:1px solid rgba(107,214,155,0.32);font-size:14px;font-weight:600;color:#9FD9BB"><span style="font-family:'Material Symbols Rounded';font-size:16px">check</span>Arms &amp; sides</span>
              <span style="display:flex;align-items:center;gap:6px;height:38px;padding:0 14px;border-radius:13px;background:rgba(107,214,155,0.10);border:1px solid rgba(107,214,155,0.32);font-size:14px;font-weight:600;color:#9FD9BB"><span style="font-family:'Material Symbols Rounded';font-size:16px">check</span>Back</span>
            </div>
          </div>

          <div style="flex:none;display:flex;gap:11px;border-left:2px solid #5B93C4;background:rgba(91,147,196,0.10);border-radius:0 14px 14px 0;padding:14px 16px;margin-top:auto">
            <span style="font-family:'Material Symbols Rounded';font-size:18px;color:#7FB0D8;margin-top:1px">health_and_safety</span>
            <div style="font-size:13px;line-height:1.5;color:#A9C2D6"><b style="color:#8CB8DC">Safety</b> Know where you're hitting and who's around you before you swing.</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== 7 · PREP ===== -->
    <div style="display:flex;flex-direction:column;gap:14px;width:390px">
      <div style="display:flex;align-items:center;gap:8px;font-size:13px;font-weight:700;color:#E9F0EE;letter-spacing:-0.01em"><span style="width:6px;height:6px;border-radius:4px;background:#5B93C4;display:block"></span>7 · Prep</div>
      <div style="font-size:13px;line-height:1.5;color:#687773;text-wrap:pretty">Three stacked lists of reference text nobody reads at the range. Split by <b style="color:#8A9A96;font-weight:600">when you need it</b>: setup you check before hitting, flow you follow during, principles you read at home.</div>
      <div style="width:390px;height:844px;background:#0B1013;border:1px solid #263237;border-radius:40px;overflow:hidden;display:flex;flex-direction:column;color:#E9F0EE;font-variant-numeric:tabular-nums;box-shadow:inset 0 1px 0 rgba(255,255,255,0.05), 0 40px 80px -40px rgba(0,0,0,0.9)">
        <div style="flex:none;display:flex;align-items:center;justify-content:space-between;padding:18px 28px 6px;font-size:13px;font-weight:700"><span>9:41</span><span style="display:flex;align-items:center;gap:5px;font-family:'Material Symbols Rounded';font-size:15px;color:#B4C2BE"><span>network_wifi</span><span>battery_full</span></span></div>

        <div style="flex:none;padding:14px 22px 16px;border-bottom:1px solid #1B2429;display:flex;flex-direction:column;gap:14px">
          <div style="display:flex;align-items:center;gap:12px">
            <div style="width:44px;height:44px;border-radius:14px;background:#141B1F;border:1px solid #263237;display:flex;align-items:center;justify-content:center;font-family:'Material Symbols Rounded';font-size:21px;color:#B4C2BE;cursor:pointer">arrow_back</div>
            <div style="display:flex;flex-direction:column;gap:3px">
              <div style="font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#687773">Protocol</div>
              <div style="font-size:22px;font-weight:700;letter-spacing:-0.035em;line-height:1.05">Prep</div>
            </div>
          </div>
          <div style="display:flex;gap:6px;background:#11181B;border:1px solid #1F292E;border-radius:15px;padding:4px">
            <span style="flex:1;height:40px;border-radius:11px;background:#6BD69B;color:#08120D;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700">Before</span>
            <span style="flex:1;height:40px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:600;color:#8A9A96;cursor:pointer">During</span>
            <span style="flex:1;height:40px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:600;color:#8A9A96;cursor:pointer">At home</span>
          </div>
        </div>

        <div style="flex:1;overflow:auto;padding:18px 22px 24px;display:flex;flex-direction:column;gap:14px">
          <div style="flex:none;font-size:15px;line-height:1.5;color:#8A9A96;text-wrap:pretty">Five things to check before the first ball. Tap one to expand.</div>

          <div style="flex:none;background:#141B1F;border:1px solid #263237;border-radius:22px;padding:20px 18px;display:flex;flex-direction:column;gap:12px">
            <div style="display:flex;align-items:center;justify-content:space-between">
              <div style="display:flex;align-items:center;gap:10px;font-size:18px;font-weight:700;letter-spacing:-0.02em"><span style="font-family:'Material Symbols Rounded';font-size:20px;color:#6BD69B">target</span>Aim</div>
              <span style="font-family:'Material Symbols Rounded';font-size:22px;color:#687773">expand_less</span>
            </div>
            <div style="font-size:15px;line-height:1.55;color:#B4C2BE;text-wrap:pretty">Feet parallel to the ball-to-target line. Pick a spot up to a metre ahead of the ball on that line and align to it. Leading edge square to the target.</div>
            <div style="display:flex;align-items:center;gap:8px;height:46px;padding:0 14px;border-radius:14px;background:rgba(91,147,196,0.10);border:1px solid rgba(91,147,196,0.28);font-size:13px;font-weight:600;color:#A9C2D6"><span style="font-family:'Material Symbols Rounded';font-size:17px;color:#7FB0D8">straighten</span>Use an alignment stick if you have one</div>
          </div>

          <div style="flex:none;display:flex;align-items:center;justify-content:space-between;height:66px;padding:0 18px;background:#11181B;border:1px solid #1F292E;border-radius:22px">
            <span style="display:flex;align-items:center;gap:10px;font-size:17px;font-weight:600;letter-spacing:-0.02em;color:#C6D2CE"><span style="font-family:'Material Symbols Rounded';font-size:20px;color:#687773">back_hand</span>Grip</span>
            <span style="font-family:'Material Symbols Rounded';font-size:22px;color:#687773">expand_more</span>
          </div>
          <div style="flex:none;display:flex;align-items:center;justify-content:space-between;height:66px;padding:0 18px;background:#11181B;border:1px solid #1F292E;border-radius:22px">
            <span style="display:flex;align-items:center;gap:10px;font-size:17px;font-weight:600;letter-spacing:-0.02em;color:#C6D2CE"><span style="font-family:'Material Symbols Rounded';font-size:20px;color:#687773">accessibility_new</span>Shoulders</span>
            <span style="font-family:'Material Symbols Rounded';font-size:22px;color:#687773">expand_more</span>
          </div>
          <div style="flex:none;display:flex;align-items:center;justify-content:space-between;height:66px;padding:0 18px;background:#11181B;border:1px solid #1F292E;border-radius:22px">
            <span style="display:flex;align-items:center;gap:10px;font-size:17px;font-weight:600;letter-spacing:-0.02em;color:#C6D2CE"><span style="font-family:'Material Symbols Rounded';font-size:20px;color:#687773">balance</span>Balance</span>
            <span style="font-family:'Material Symbols Rounded';font-size:22px;color:#687773">expand_more</span>
          </div>
          <div style="flex:none;display:flex;align-items:center;justify-content:space-between;height:66px;padding:0 18px;background:#11181B;border:1px solid #1F292E;border-radius:22px">
            <span style="display:flex;align-items:center;gap:10px;font-size:17px;font-weight:600;letter-spacing:-0.02em;color:#C6D2CE"><span style="font-family:'Material Symbols Rounded';font-size:20px;color:#687773">visibility</span>Watch the ball</span>
            <span style="font-family:'Material Symbols Rounded';font-size:22px;color:#687773">expand_more</span>
          </div>

          <div style="flex:none;background:linear-gradient(158deg,#1B2E26 0%,#141B1F 62%);border:1px solid #2C4238;border-radius:22px;padding:20px 18px;display:flex;flex-direction:column;gap:10px;margin-top:6px">
            <div style="display:flex;align-items:center;gap:8px;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#6BD69B"><span style="font-family:'Material Symbols Rounded';font-size:17px">format_quote</span>The one that matters</div>
            <div style="font-size:17px;line-height:1.5;text-wrap:pretty">With so much to think about, the thing most often forgotten is simply watching the ball.</div>
          </div>
        </div>

        <div style="flex:none;display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid #1B2429;padding:6px 0 16px">
          <div style="height:60px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;color:#687773"><span style="font-family:'Material Symbols Rounded';font-size:24px">flag</span><span style="font-size:11px;font-weight:600">Plan</span></div>
          <div style="height:60px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;color:#687773"><span style="font-family:'Material Symbols Rounded';font-size:24px">sports_golf</span><span style="font-size:11px;font-weight:600">Log</span></div>
          <div style="height:60px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;color:#687773"><span style="font-family:'Material Symbols Rounded';font-size:24px">show_chart</span><span style="font-size:11px;font-weight:600">Trends</span></div>
          <div style="height:60px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;color:#6BD69B"><span style="font-family:'Material Symbols Rounded';font-size:24px;font-variation-settings:'FILL' 1">more_horiz</span><span style="font-size:11px;font-weight:700">More</span></div>
        </div>
      </div>
    </div>

    <!-- ===== 8 · LIBRARY ===== -->
    <div style="display:flex;flex-direction:column;gap:14px;width:390px">
      <div style="display:flex;align-items:center;gap:8px;font-size:13px;font-weight:700;color:#E9F0EE;letter-spacing:-0.01em"><span style="width:6px;height:6px;border-radius:4px;background:#6BD69B;display:block"></span>8 · Drill library</div>
      <div style="font-size:13px;line-height:1.5;color:#687773;text-wrap:pretty">Right now it's a searchable list with no reason to search. Give every drill a <b style="color:#8A9A96;font-weight:600">swap action</b> and put the ones that fit today's miss on top — the library becomes part of the session, not a reference tab.</div>
      <div style="width:390px;height:844px;background:#0B1013;border:1px solid #263237;border-radius:40px;overflow:hidden;display:flex;flex-direction:column;color:#E9F0EE;font-variant-numeric:tabular-nums;box-shadow:inset 0 1px 0 rgba(255,255,255,0.05), 0 40px 80px -40px rgba(0,0,0,0.9)">
        <div style="flex:none;display:flex;align-items:center;justify-content:space-between;padding:18px 28px 6px;font-size:13px;font-weight:700"><span>9:41</span><span style="display:flex;align-items:center;gap:5px;font-family:'Material Symbols Rounded';font-size:15px;color:#B4C2BE"><span>network_wifi</span><span>battery_full</span></span></div>

        <div style="flex:none;padding:14px 22px 16px;border-bottom:1px solid #1B2429;display:flex;flex-direction:column;gap:14px">
          <div style="display:flex;align-items:center;gap:12px">
            <div style="width:44px;height:44px;border-radius:14px;background:#141B1F;border:1px solid #263237;display:flex;align-items:center;justify-content:center;font-family:'Material Symbols Rounded';font-size:21px;color:#B4C2BE;cursor:pointer">arrow_back</div>
            <div style="display:flex;flex-direction:column;gap:3px">
              <div style="font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#687773">Bench · 46 drills</div>
              <div style="font-size:22px;font-weight:700;letter-spacing:-0.035em;line-height:1.05">Swap a drill</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:11px;height:52px;padding:0 16px;border-radius:16px;background:#11181B;border:1px solid #1F292E">
            <span style="font-family:'Material Symbols Rounded';font-size:19px;color:#687773">search</span>
            <span style="font-size:15px;color:#5D6C68">Search drills, cues, focus points…</span>
          </div>
          <div style="display:flex;gap:8px">
            <span style="height:38px;padding:0 15px;border-radius:13px;background:#6BD69B;color:#08120D;display:flex;align-items:center;font-size:14px;font-weight:700">For my miss</span>
            <span style="height:38px;padding:0 15px;border-radius:13px;background:#141B1F;border:1px solid #263237;color:#B4C2BE;display:flex;align-items:center;font-size:14px;font-weight:600;cursor:pointer">Driving</span>
            <span style="height:38px;padding:0 15px;border-radius:13px;background:#141B1F;border:1px solid #263237;color:#B4C2BE;display:flex;align-items:center;font-size:14px;font-weight:600;cursor:pointer">Irons</span>
            <span style="height:38px;padding:0 15px;border-radius:13px;background:#141B1F;border:1px solid #263237;color:#B4C2BE;display:flex;align-items:center;font-size:14px;font-weight:600;cursor:pointer">Pitch</span>
          </div>
        </div>

        <div style="flex:1;overflow:auto;padding:18px 22px 24px;display:flex;flex-direction:column;gap:12px">
          <div style="flex:none;display:flex;align-items:center;gap:9px;font-size:13px;line-height:1.45;color:#8A9A96;text-wrap:pretty"><span style="font-family:'Material Symbols Rounded';font-size:17px;color:#5B93C4">filter_alt</span>Matched to your right miss, hardest first.</div>

          <div style="flex:none;background:linear-gradient(158deg,#1B2E26 0%,#141B1F 62%);border:1px solid #2C4238;border-radius:22px;padding:20px 18px;display:flex;flex-direction:column;gap:12px">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px">
              <div style="display:flex;flex-direction:column;gap:5px">
                <div style="display:flex;align-items:center;gap:8px;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#6BD69B"><span style="font-family:'Material Symbols Rounded';font-size:16px">recommend</span>Best match</div>
                <div style="font-size:19px;font-weight:700;letter-spacing:-0.025em">Sync arm-swing with body-turn</div>
              </div>
              <span style="height:30px;padding:0 11px;border-radius:10px;background:rgba(107,214,155,0.14);border:1px solid rgba(107,214,155,0.36);color:#6BD69B;display:flex;align-items:center;font-size:12px;font-weight:700">Driving · p.43</span>
            </div>
            <div style="font-size:14px;line-height:1.55;color:#B4C2BE;text-wrap:pretty">Drop your hands to hip height before the shoulders unwind. The book files this one as the anti-slice move — it is the drill for a right miss.</div>
            <div style="display:flex;gap:10px;padding-top:2px">
              <button style="flex:1;height:52px;border:none;border-radius:16px;background:#6BD69B;color:#08120D;font-family:inherit;font-size:15px;font-weight:800;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer" style-hover="background:#8AE0B0"><span style="font-family:'Material Symbols Rounded';font-size:19px">swap_horiz</span>Use in today's session</button>
              <div style="width:52px;height:52px;border-radius:16px;background:#141B1F;border:1px solid #2C4238;display:flex;align-items:center;justify-content:center;font-family:'Material Symbols Rounded';font-size:20px;color:#B4C2BE;cursor:pointer" style-hover="background:#1C2529">bookmark_add</div>
            </div>
          </div>

          <div style="flex:none;background:#141B1F;border:1px solid #263237;border-radius:22px;padding:18px;display:flex;flex-direction:column;gap:10px">
            <div style="display:flex;align-items:center;justify-content:space-between">
              <div style="font-size:17px;font-weight:700;letter-spacing:-0.02em">Swing through the tees</div>
              <span style="font-family:'Material Symbols Rounded';font-size:21px;color:#687773">swap_horiz</span>
            </div>
            <div style="font-size:14px;line-height:1.5;color:#8A9A96;text-wrap:pretty">Two sticks a clubhead-width apart; swing through without clipping a side.</div>
          </div>
          <div style="flex:none;background:#141B1F;border:1px solid #263237;border-radius:22px;padding:18px;display:flex;flex-direction:column;gap:10px">
            <div style="display:flex;align-items:center;justify-content:space-between">
              <div style="font-size:17px;font-weight:700;letter-spacing:-0.02em">Turn your back on the target</div>
              <span style="font-family:'Material Symbols Rounded';font-size:21px;color:#687773">swap_horiz</span>
            </div>
            <div style="font-size:14px;line-height:1.5;color:#8A9A96;text-wrap:pretty">Feel your back turn to the target; point the club at it at the top.</div>
          </div>
          <div style="flex:none;background:#141B1F;border:1px solid #263237;border-radius:22px;padding:18px;display:flex;flex-direction:column;gap:10px">
            <div style="display:flex;align-items:center;justify-content:space-between">
              <div style="font-size:17px;font-weight:700;letter-spacing:-0.02em">Choke down for control</div>
              <span style="font-family:'Material Symbols Rounded';font-size:21px;color:#687773">swap_horiz</span>
            </div>
            <div style="font-size:14px;line-height:1.5;color:#8A9A96;text-wrap:pretty">Grip down an inch; trade a little length for a fairway found.</div>
          </div>

          <div style="flex:none;height:56px;display:flex;align-items:center;justify-content:center;gap:7px;font-size:14px;font-weight:600;color:#8A9A96;cursor:pointer" style-hover="color:#E9F0EE">All 46 drills by area<span style="font-family:'Material Symbols Rounded';font-size:18px">expand_more</span></div>
        </div>
      </div>
    </div>

    <!-- ===== 9 · FIXES ===== -->
    <div style="display:flex;flex-direction:column;gap:14px;width:390px">
      <div style="display:flex;align-items:center;gap:8px;font-size:13px;font-weight:700;color:#E9F0EE;letter-spacing:-0.01em"><span style="width:6px;height:6px;border-radius:4px;background:#D2726B;display:block"></span>9 · Fixes</div>
      <div style="font-size:13px;line-height:1.5;color:#687773;text-wrap:pretty">A pattern/likely/fix table asks you to diagnose yourself — but the app already logged the pattern. Open on <b style="color:#8A9A96;font-weight:600">your</b> miss with the fix ready, and keep the full guide underneath.</div>
      <div style="width:390px;height:844px;background:#0B1013;border:1px solid #263237;border-radius:40px;overflow:hidden;display:flex;flex-direction:column;color:#E9F0EE;font-variant-numeric:tabular-nums;box-shadow:inset 0 1px 0 rgba(255,255,255,0.05), 0 40px 80px -40px rgba(0,0,0,0.9)">
        <div style="flex:none;display:flex;align-items:center;justify-content:space-between;padding:18px 28px 6px;font-size:13px;font-weight:700"><span>9:41</span><span style="display:flex;align-items:center;gap:5px;font-family:'Material Symbols Rounded';font-size:15px;color:#B4C2BE"><span>network_wifi</span><span>battery_full</span></span></div>

        <div style="flex:none;padding:14px 22px 16px;border-bottom:1px solid #1B2429;display:flex;align-items:center;gap:12px">
          <div style="width:44px;height:44px;border-radius:14px;background:#141B1F;border:1px solid #263237;display:flex;align-items:center;justify-content:center;font-family:'Material Symbols Rounded';font-size:21px;color:#B4C2BE;cursor:pointer">arrow_back</div>
          <div style="display:flex;flex-direction:column;gap:3px">
            <div style="font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#687773">Field guide</div>
            <div style="font-size:22px;font-weight:700;letter-spacing:-0.035em;line-height:1.05">Fixes</div>
          </div>
        </div>

        <div style="flex:1;overflow:auto;padding:18px 22px 24px;display:flex;flex-direction:column;gap:14px">

          <div style="flex:none;background:linear-gradient(158deg,#2A1E1D 0%,#141B1F 62%);border:1px solid #43302E;border-radius:24px;padding:22px 20px;display:flex;flex-direction:column;gap:14px">
            <div style="display:flex;align-items:center;gap:8px;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#D2726B"><span style="font-family:'Material Symbols Rounded';font-size:17px">my_location</span>6 of 10 tee shots missed right · p.162</div>
            <div style="font-size:24px;font-weight:800;letter-spacing:-0.035em;line-height:1.15;text-wrap:pretty">Starts left, curves hard right</div>
            <div style="display:flex;flex-direction:column;gap:12px;border-top:1px solid #3A2A28;padding-top:14px">
              <div style="display:flex;gap:12px">
                <span style="flex:none;width:52px;font-size:11px;font-weight:800;letter-spacing:0.05em;text-transform:uppercase;color:#8A9A96;padding-top:2px">Likely</span>
                <span style="font-size:15px;line-height:1.5;color:#B4C2BE;text-wrap:pretty">Slice — out-to-in path from an address aimed left, with an open clubface.</span>
              </div>
              <div style="display:flex;gap:12px">
                <span style="flex:none;width:52px;font-size:11px;font-weight:800;letter-spacing:0.05em;text-transform:uppercase;color:#6BD69B;padding-top:2px">Fix</span>
                <span style="font-size:15px;line-height:1.5;color:#E9F0EE;text-wrap:pretty">Square your stance and shoulders to the target line, then feel the ball start right of target on an inside path into impact. Soften grip pressure for a free release.</span>
              </div>
            </div>
            <button style="height:56px;border:none;border-radius:18px;background:#6BD69B;color:#08120D;font-family:inherit;font-size:16px;font-weight:800;display:flex;align-items:center;justify-content:center;gap:9px;cursor:pointer;margin-top:4px" style-hover="background:#8AE0B0"><span style="font-family:'Material Symbols Rounded';font-size:21px">sports_golf</span>Practice this fix now</button>
          </div>

          <div style="flex:none;display:flex;gap:11px;border-left:2px solid #5B93C4;background:rgba(91,147,196,0.10);border-radius:0 14px 14px 0;padding:14px 16px">
            <span style="font-family:'Material Symbols Rounded';font-size:18px;color:#7FB0D8;margin-top:1px">info</span>
            <div style="font-size:13px;line-height:1.5;color:#A9C2D6">A miss pattern points to the most likely fault, not a certain one. Try it first — but a lesson beats a table.</div>
          </div>

          <div style="flex:none;display:flex;align-items:center;justify-content:space-between;padding-top:4px">
            <div style="font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#687773">Everything else</div>
            <div style="font-size:13px;font-weight:600;color:#687773">8 patterns</div>
          </div>

          <div style="flex:none;background:#141B1F;border:1px solid #263237;border-radius:22px;overflow:hidden">
            <div style="display:flex;align-items:center;justify-content:space-between;height:66px;padding:0 18px;border-bottom:1px solid #1B2429">
              <span style="display:flex;flex-direction:column;gap:3px"><span style="font-size:15px;font-weight:700">Starts right, stays right</span><span style="font-size:13px;color:#8A9A96">Push · in-to-out path</span></span>
              <span style="font-family:'Material Symbols Rounded';font-size:20px;color:#687773">chevron_right</span>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;height:66px;padding:0 18px;border-bottom:1px solid #1B2429">
              <span style="display:flex;flex-direction:column;gap:3px"><span style="font-size:15px;font-weight:700">Starts right, then curves left</span><span style="font-size:13px;color:#8A9A96">Hook · closed face</span></span>
              <span style="font-family:'Material Symbols Rounded';font-size:20px;color:#687773">chevron_right</span>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;height:66px;padding:0 18px;border-bottom:1px solid #1B2429">
              <span style="display:flex;flex-direction:column;gap:3px"><span style="font-size:15px;font-weight:700">Straight but very short</span><span style="font-size:13px;color:#8A9A96">Skied · steep, narrow takeaway</span></span>
              <span style="font-family:'Material Symbols Rounded';font-size:20px;color:#687773">chevron_right</span>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;height:66px;padding:0 18px">
              <span style="display:flex;flex-direction:column;gap:3px"><span style="font-size:15px;font-weight:700">Ball shoots 45° sideways</span><span style="font-size:13px;color:#8A9A96">Shank · struck from the hosel</span></span>
              <span style="font-family:'Material Symbols Rounded';font-size:20px;color:#687773">chevron_right</span>
            </div>
          </div>
        </div>

        <div style="flex:none;display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid #1B2429;padding:6px 0 16px">
          <div style="height:60px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;color:#687773"><span style="font-family:'Material Symbols Rounded';font-size:24px">flag</span><span style="font-size:11px;font-weight:600">Plan</span></div>
          <div style="height:60px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;color:#687773"><span style="font-family:'Material Symbols Rounded';font-size:24px">sports_golf</span><span style="font-size:11px;font-weight:600">Log</span></div>
          <div style="height:60px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;color:#687773"><span style="font-family:'Material Symbols Rounded';font-size:24px">show_chart</span><span style="font-size:11px;font-weight:600">Trends</span></div>
          <div style="height:60px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;color:#6BD69B"><span style="font-family:'Material Symbols Rounded';font-size:24px;font-variation-settings:'FILL' 1">more_horiz</span><span style="font-size:11px;font-weight:700">More</span></div>
        </div>
      </div>
    </div>

  </div>
</section></x-dc>
<script type="text/x-dc" data-dc-script data-props="{&quot;showDrill&quot;:{&quot;editor&quot;:&quot;boolean&quot;,&quot;default&quot;:true,&quot;tsType&quot;:&quot;boolean&quot;,&quot;section&quot;:&quot;Log&quot;}}">
const TONE = {
  fairway: { bg: "rgba(107,214,155,0.18)", br: "rgba(107,214,155,0.45)", fg: "#6BD69B", icon: "check" },
  left: { bg: "rgba(232,177,90,0.16)", br: "rgba(232,177,90,0.4)", fg: "#E8B15A", icon: "west" },
  right: { bg: "rgba(210,114,107,0.16)", br: "rgba(210,114,107,0.4)", fg: "#D2726B", icon: "east" },
  empty: { bg: "#11181B", br: "#1F292E", fg: "#2C383D", icon: "circle" }
};

class Component extends DCLogic {
  state = { shots: ["fairway", "right", "fairway", "right", "left", "fairway"] };

  tap(kind) {
    return () => this.setState(s => ({ shots: s.shots.length >= 10 ? s.shots : s.shots.concat(kind) }));
  }

  renderVals() {
    const shots = this.state.shots;
    const count = k => shots.filter(x => x === k).length;
    const fairway = count("fairway"), left = count("left"), right = count("right");
    const pct = shots.length ? Math.round((fairway / shots.length) * 100) : 0;

    const strip = [];
    for (let i = 0; i < 10; i++) {
      const t = TONE[shots[i]] || TONE.empty;
      strip.push({ bg: t.bg, br: t.br, fg: t.fg, icon: shots[i] ? t.icon : "" });
    }

    let liveNote = "Ten balls, one target — the pattern tells you more than the total.";
    if (shots.length >= 3) {
      if (right >= left + 2) liveNote = "Three of your last misses leaked right. Aim your feet, not your hands.";
      else if (left >= right + 2) liveNote = "You're pulling it left — your shoulders are probably closed at address.";
      else if (pct >= 70) liveNote = "Best start-line run of the week. Don't change anything.";
      else liveNote = "Misses are spread both ways — that's timing, not aim.";
    }

    const LETTER = { fairway: "✓", left: "L", right: "R" };
    const WORD = { fairway: "on line", left: "miss left", right: "miss right" };
    const a11yStrip = [];
    for (let i = 0; i < 10; i++) {
      const k = shots[i];
      const t = TONE[k] || TONE.empty;
      a11yStrip.push({
        bg: k ? t.bg : "#11181B",
        br: k ? t.br : "#3A4A50",
        fg: k ? t.fg : "#3A4A50",
        letter: k ? LETTER[k] : "",
        label: k ? "Ball " + (i + 1) + ", " + WORD[k] : "Ball " + (i + 1) + ", not logged yet"
      });
    }

    const last = shots[shots.length - 1];
    const announce = shots.length
      ? "Ball " + shots.length + ", " + WORD[last] + ". " + fairway + " of " + shots.length + " on line."
      : "No balls logged yet. Ten to go.";

    return {
      strip, a11yStrip, announce, fairway, left, right,
      ballNo: Math.min(10, shots.length + 1),
      ratePct: pct,
      rateColor: pct >= 60 ? "#6BD69B" : pct >= 40 ? "#E8B15A" : "#D2726B",
      liveNote,
      showDrill: this.props.showDrill ?? true,
      tapFairway: this.tap("fairway"),
      tapLeft: this.tap("left"),
      tapRight: this.tap("right"),
      undo: () => this.setState(s => ({ shots: s.shots.slice(0, -1) }))
    };
  }
}
</script>
</body>
</html>
