export type Tool = {
  slug: string;
  title: string;
  desc: string;
  tag: string;
  content: string;
};

const tools: Tool[] = [
  {
    slug: "network-reset-checklist",
    title: "Network Reset Checklist",
    desc: "Step-by-step quick checklist for no internet or DNS issues.",
    tag: "Network",
    content: `
Quick Network Reset Steps:

1. Restart your modem and router (turn off for 30 seconds)
2. Open Command Prompt (Win+R → cmd)
3. Run these commands in order:
   - ipconfig /release
   - ipconfig /renew
   - ipconfig /flushdns
4. If issues persist, run advanced reset:
   - netsh int ip reset
   - netsh winsock reset
5. Restart your computer
6. If still no internet, manually set DNS to 8.8.8.8 (Google)

Verification:
- Open Command Prompt (cmd)
- Type: ping google.com
- If you see replies, internet is working

Common Causes:
- Router issues: Try restarting it
- DNS cache corrupted: Use /flushdns command
- Network adapter driver outdated: Update from Device Manager
    `.trim(),
  },
  {
    slug: "wifi-troubleshooter",
    title: "Wi-Fi Troubleshooter",
    desc: "Select your symptom and get targeted solutions.",
    tag: "Wi-Fi",
    content: `
Wi-Fi Troubleshooting Guide:

SYMPTOM: Connected to Wi-Fi but no internet access
Solution:
1. Restart your router (unplug for 30 seconds)
2. Open Command Prompt and run: ipconfig /flushdns
3. Manually set DNS to 8.8.8.8 in Network Settings
4. Test connection to google.com
5. If still down, restart your computer

SYMPTOM: Wi-Fi network not appearing
Solution:
1. Turn off Airplane Mode (check system tray)
2. Open Device Manager (Win+R → devmgmt.msc)
3. Find your Wi-Fi adapter under Network adapters
4. Right-click → Disable, wait 10 seconds
5. Right-click → Enable
6. Update Wi-Fi driver if issue persists

SYMPTOM: Connected but keeps disconnecting
Solution:
1. Move closer to your router or switch to 2.4GHz band in settings
2. In Device Manager, right-click Wi-Fi adapter → Properties
3. Go to Power Management tab
4. Uncheck "Allow this device to turn off to save power"
5. Apply and restart

SYMPTOM: Very slow Wi-Fi speed
Solution:
1. Check signal strength (should be strong)
2. Reduce interference from other devices
3. Switch Wi-Fi channel in router settings
4. Update router firmware from manufacturer website
5. Consider 5GHz band for better speed
    `.trim(),
  },
  {
    slug: "system-info-template",
    title: "System Info Template",
    desc: "Copy and paste template for support requests.",
    tag: "Support",
    content: `
SYSTEM INFORMATION TEMPLATE
(Use this when asking for technical support)

Operating System Information:
- OS: Windows __ (e.g., Windows 11 Pro 23H2)
- Build: [From Settings → About → Windows specifications]
- Installation Date: [When did you install Windows?]

Hardware Specifications:
- CPU: [Processor name and model]
- RAM: [Amount in GB]
- GPU: [Graphics card name]
- Storage: [Type (SSD/HDD) and capacity]

Problem Description:
[Describe what's happening. What were you doing when the problem started?]

Error Message:
[Copy the exact error message here, if any]

When Did This Start:
[Specific date? After a Windows update? After installing a program?]

Solutions Already Attempted:
1. [What have you already tried?]
2. [List each step you took]
3. [Include any results or changes]

Additional Details:
- Is this the first time this happened?
- Does it happen every time or randomly?
- Have you checked your antivirus or firewall settings?
    `.trim(),
  },
  {
    slug: "registry-editor-launcher",
    title: "Registry Editor Safe Launcher",
    desc: "Access Registry Editor safely with backup and danger warnings.",
    tag: "Registry",
    content: `
Safe Registry Editor Access Guide:

WARNING: Incorrect Registry changes can damage your system!
ALWAYS create a backup before making any changes.

Step 1: Create a Registry Backup
1. Press Win+R and type: regedit
2. In Registry Editor, click File menu
3. Select Export
4. Save the file to Desktop with name: Registry_Backup_[Date]
5. Keep this backup file safe for recovery

Step 2: Safely Access the Registry
1. Open Registry Editor (Win+R → regedit)
2. Before making any change, search for it on Google first
3. Read multiple sources to understand what you're doing
4. Make only one small change at a time
5. Restart your computer to see if the change works
6. If problems occur, restore from your backup

Areas to AVOID (Do Not Modify):
- HKEY_LOCAL_MACHINE\SYSTEM
- HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion
- HKEY_CLASSES_ROOT
- Any registry paths you're unfamiliar with

Safe Areas (User Preferences):
- HKEY_CURRENT_USER\Software\
- HKEY_CURRENT_USER\Control Panel\
- Program-specific folders under HKEY_CURRENT_USER\Software\

Recovery Steps if Something Goes Wrong:
1. Restart Windows in Safe Mode (Shift+Restart at login)
2. Open Registry Editor
3. Go to File → Import
4. Select your Registry_Backup file
5. Wait for confirmation that import completed
    `.trim(),
  },
  {
    slug: "event-viewer-error-tracker",
    title: "Event Viewer Error Tracker",
    desc: "Find and analyze system errors using Windows Event Viewer.",
    tag: "Diagnostic",
    content: `
Event Viewer Error Diagnosis Guide:

Opening Event Viewer:
1. Press Win+R and type: eventvwr.msc
2. Or: Search for "Event Viewer" in Start menu
3. Click on the application when found

Main Log Categories:

Windows Logs → System:
- System-level errors and hardware issues
- Important for diagnosing crashes

Windows Logs → Application:
- Software crashes and program errors
- Most application errors appear here

Windows Logs → Security:
- Login attempts and permission issues

Finding Specific Errors:
1. Open the log category you need
2. Look for entries with red X icon (Errors)
3. Click on an error to see full details
4. Note the Event ID number
5. Search "Event ID [number]" + your error on Google
6. Read the detailed description for solutions

Common Event IDs and What They Mean:
- Event ID 41: System shut down unexpectedly
- Event ID 1000: Application crashed
- Event ID 6008: System shutdown abnormally
- Event ID 10005: COM Server registration error
- Event ID 1074: System restarted or shut down

Step by Step Error Investigation:
1. System crashes recently? Check Event ID 41
2. Specific program crashing? Search for that program name
3. See time of error in Event Viewer
4. Look at what else happened around that time
5. Search the Event ID number online for solutions
    `.trim(),
  },
  {
    slug: "disk-cleanup-guide",
    title: "Disk Cleanup Guide",
    desc: "Remove temporary files and free up disk space safely.",
    tag: "Performance",
    content: `
Disk Cleanup and Space Management:

Method 1: Windows Disk Cleanup Tool (Safest)
1. Press Win+R and type: cleanmgr
2. Select the drive to clean (usually C:)
3. Check these items for deletion:
   - Temporary files
   - Recycle Bin
   - System cache
   - Downloaded program files
4. Click OK to delete
5. Restart your computer when done

Method 2: Storage Settings (Modern Approach)
1. Open Settings (Win+I)
2. Go to System → Storage
3. Click on "Temporary files"
4. Select items to delete
5. Click Remove files

Method 3: Manual Cleanup (Advanced Users)
Safe folders to empty:
- C:\Windows\Temp\ (Temporary files)
- C:\Users\[YourName]\AppData\Local\Temp\ (App cache)
- %TEMP% (Win+R, type this path)

NEVER Delete:
- Program Files folders
- Documents, Pictures, Desktop
- Windows system folders
- AppData\Roaming (user settings)

Method 4: Storage Sense (Automatic Cleanup)
1. Open Settings → System → Storage
2. Turn ON "Storage Sense"
3. Configure how often to automatically clean
4. Choose what types of files to delete

After Cleanup:
1. Restart your computer
2. Check available disk space (right-click drive → Properties)
3. Run antivirus scan if you deleted many files
4. Monitor disk usage over next few days

Target Disk Space:
- Keep at least 10-15% free on C: drive
- If below 10%, your system performance will slow down
    `.trim(),
  },
  {
    slug: "graphics-driver-checker",
    title: "Graphics Driver Health Check",
    desc: "Check GPU driver status and diagnose graphics issues.",
    tag: "Hardware",
    content: `
Graphics Driver Diagnostic Checklist:

Check If Driver Is Installed:
1. Open Device Manager (Win+R → devmgmt.msc)
2. Expand "Display adapters"
3. Look for your GPU (NVIDIA/AMD/Intel)
4. If you see a question mark (?) = Driver missing
5. If no question mark = Driver is installed

View Driver Details:
1. Device Manager → Display adapters
2. Right-click your GPU → Properties
3. Switch to "Driver" tab
4. Check:
   - Driver Version (for research online)
   - Driver Date (when it was released)
   - Device Status (should say "working properly")

Check DirectX and GPU Capabilities:
1. Press Win+R and type: dxdiag
2. Click "Display" tab
3. You'll see:
   - GPU name and memory
   - Driver version
   - DirectX version support
4. Note these details for troubleshooting

Diagnose Graphics Performance Issues:
1. Open Task Manager (Ctrl+Shift+Esc)
2. Go to Performance tab
3. Click on GPU in the left sidebar
4. Monitor usage while gaming or running graphics app
5. If GPU usage is stuck at high % during idle:
   - Driver might need update
   - Background app using GPU

Update Graphics Driver:
For NVIDIA GPUs:
1. Visit nvidia.com/Download/driverDetails.html
2. Enter your GPU model number
3. Download latest driver
4. Run installer and follow prompts

For AMD GPUs:
1. Visit amd.com/drivers
2. Select your GPU model
3. Download and install latest driver

For Intel Graphics:
1. Visit intel.com/en-us/products/graphics/
2. Find your iGPU model
3. Download driver from Intel

After Driver Update:
1. Restart computer
2. Test graphics performance
3. If problems persist, check Event Viewer for errors
    `.trim(),
  },
  {
    slug: "task-manager-resource-monitor",
    title: "Task Manager Resource Guide",
    desc: "Master Task Manager to find CPU, RAM, Disk, and Network issues.",
    tag: "Performance",
    content: `
Complete Task Manager Guide:

Opening Task Manager:
- Ctrl+Shift+Esc (fastest)
- Ctrl+Alt+Delete → Task Manager
- Right-click taskbar → Task Manager
- Search "Task Manager" in Start menu

Performance Tab - System-Wide Monitoring:
1. CPU Section:
   - Shows processor usage percentage (0-100%)
   - Each core shown separately for multi-core CPUs
   - If consistently high: Find the culprit in Processes tab

2. Memory (RAM) Section:
   - Shows how much RAM is currently used
   - If over 80% and not using anything = background bloat

3. Disk Section:
   - Shows read/write activity speed
   - High activity constantly = Check running processes

4. GPU Section:
   - Shows graphics card usage
   - Important for gaming and video editing

Processes Tab - Find What's Using Resources:

Finding High CPU Usage:
1. Click "CPU" column header to sort
2. Highest % appears first
3. Unknown process? Right-click → Google name
4. If it's malware or unwanted: right-click → End Task
5. To stop it from restarting: Find it in Settings → Startup

Finding High RAM Usage:
1. Click "Memory" column to sort by RAM
2. See which programs are memory hogs
3. Close programs you don't need
4. If something is using too much: End Task

Fixing High Disk Usage (100% Problem):
1. Go to Performance → Disk
2. If constantly at 100%:
   - Windows Update might be running (wait)
   - Antivirus scanning (wait or modify scan schedule)
   - Windows Search indexing (disable if not needed)
3. Check Processes tab → Disk column
4. Find the process using 100% disk
5. Research it before terminating

Network Troubleshooting:
1. Performance tab → Ethernet/WiFi
2. If speed is lower than expected:
   - Check if other programs are downloading
   - Restart router if no improvement
   - Run speedtest.net to verify

Startup Impact Tab:
- Shows programs that run at startup
- High impact programs slow down boot time
- Disable unnecessary startup programs here

System Processes You Can Safely End:
- Update programs you're not actively using
- Background apps for services you disabled
- Program helper processes

System Processes to NEVER End:
- Anything with name "System", "Kernel", "Windows"
- Services related to running Windows
- Always research before ending unknown processes
    `.trim(),
  },
];

export function getTool(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}

export function getAllTools(): Tool[] {
  return tools;
}
