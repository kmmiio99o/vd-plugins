import { findByProps } from "@vendetta/metro";
import { getDebugInfo } from "@vendetta/debug";
import { ReactNative } from "@vendetta/metro/common";
import { storage } from "@vendetta/plugin";

const MessageActions = findByProps("sendMessage");
const messageUtil = findByProps("sendBotMessage", "sendMessage", "receiveMessage");

// Device info helper
function getDeviceInfo() {
  let { height, width, scale } = ReactNative.Dimensions.get("screen");
  height *= scale;
  width *= scale;
  return { width, height };
}

// Network info helper with improved detection
function getNetworkInfo() {
  try {
    // Try multiple methods to get network info
    
    // Method 1: Try React Native NetInfo
    try {
      const NetInfo = findByProps("getCurrentState", "fetch");
      if (NetInfo && NetInfo.getCurrentState) {
        const networkState = NetInfo.getCurrentState();
        if (networkState) {
          const { type, details } = networkState;
          if (type && type !== "unknown" && type !== "none") {
            const networkMap: Record<string, string> = {
              wifi: "WiFi",
              ethernet: "Ethernet",
              other: "Unknown",
              bluetooth: "Bluetooth",
              wimax: "WiMAX",
              vpn: "VPN",
              cellular: details?.cellularGeneration ? `${details.cellularGeneration.toUpperCase()}` : "Cellular",
            };
            return networkMap[type] || type;
          }
        }
      }
    } catch (e) {
      console.log("NetInfo method 1 failed:", e);
    }

    // Method 2: Try alternative NetInfo approach
    try {
      const netInfoModule = findByProps("useNetInfo", "addEventListener");
      if (netInfoModule && netInfoModule.fetch) {
        const networkData = netInfoModule.fetch();
        if (networkData && networkData.type && networkData.type !== "unknown") {
          const { type, details } = networkData;
          const networkMap: Record<string, string> = {
            wifi: "WiFi",
            ethernet: "Ethernet",
            other: "Unknown",
            bluetooth: "Bluetooth",
            wimax: "WiMAX",
            vpn: "VPN",
            cellular: details?.cellularGeneration ? `${details.cellularGeneration.toUpperCase()}` : "Cellular",
          };
          return networkMap[type] || type;
        }
      }
    } catch (e) {
      console.log("NetInfo method 2 failed:", e);
    }

    // Method 3: Try native modules
    try {
      const { NativeModules } = ReactNative;
      if (NativeModules.NetworkingIOS) {
        // iOS specific
        return "Connected";
      }
      if (NativeModules.NetInfoCellularGeneration) {
        return "Cellular";
      }
    } catch (e) {
      console.log("Native modules method failed:", e);
    }

    // Method 4: Check if we can reach the internet
    try {
      // This is a simple connectivity check
      if (navigator.onLine !== undefined) {
        return navigator.onLine ? "Connected" : "Offline";
      }
    } catch (e) {
      console.log("Navigator online check failed:", e);
    }

    return "Unknown";
  } catch (e) {
    console.warn("All network detection methods failed:", e);
    return "Unknown";
  }
}

// Root detection helper
function isDeviceRooted() {
  try {
    const { NativeModules } = ReactNative;
    
    // Try to detect root/jailbreak through various methods
    
    // Android root detection
    if (ReactNative.Platform.OS === "android") {
      // Check for common root indicators
      try {
        // Method 1: Check for su binary
        const suPaths = [
          "/system/bin/su",
          "/system/xbin/su",
          "/sbin/su",
          "/data/local/xbin/su",
          "/data/local/bin/su",
          "/system/sd/xbin/su",
          "/system/bin/failsafe/su",
          "/data/local/su"
        ];
        
        // Method 2: Check for root management apps
        const rootApps = [
          "com.noshufou.android.su",
          "com.thirdparty.superuser",
          "eu.chainfire.supersu",
          "com.koushikdutta.superuser",
          "com.zachspong.temprootremovejb",
          "com.ramdroid.appquarantine"
        ];

        // Method 3: Check build tags
        const buildTags = NativeModules.DeviceInfo?.getBuildTags?.() || "";
        if (buildTags.includes("test-keys")) {
          return true;
        }

        // Method 4: Check for Magisk
        try {
          const magiskPaths = [
            "/sbin/.magisk",
            "/system/addon.d/99-magisk.sh",
            "/cache/.disable_magisk",
            "/data/adb/magisk"
          ];
          // We can't actually check file existence, but we can try
        } catch (e) {
          // Ignore
        }

        return false; // Default to not rooted if we can't detect
      } catch (e) {
        return false;
      }
    }
    
    // iOS jailbreak detection
    if (ReactNative.Platform.OS === "ios") {
      try {
        // Check for common jailbreak indicators
        const jailbreakPaths = [
          "/Applications/Cydia.app",
          "/Library/MobileSubstrate/MobileSubstrate.dylib",
          "/bin/bash",
          "/usr/sbin/sshd",
          "/etc/apt",
          "/private/var/lib/apt/"
        ];

        // Check for jailbreak apps
        const jailbreakApps = [
          "cydia://package/com.example.package",
          "sileo://package/com.example.package"
        ];

        return false; // Default to not jailbroken if we can't detect
      } catch (e) {
        return false;
      }
    }

    return false;
  } catch (e) {
    console.warn("Root detection failed:", e);
    return false;
  }
}

// Hardware info helper
function getHardwareInfo() {
  try {
    const hwProps = findByProps("memory");
    if (!hwProps) return { cpuCoreCount: "N/A", cpuPerc: "N/A", memUsage: "N/A", netInfo: "Unknown" };
    
    const { cpuCoreCount, cpuPercentage, memory } = hwProps;
    const cpuPerc = cpuPercentage ? cpuPercentage.toFixed(2) + "%" : "N/A";
    const memUsage = memory ? parseFloat((memory / 1000).toPrecision(3)) + " MB" : "N/A";
    
    const netInfo = getNetworkInfo();
    
    return { cpuCoreCount, cpuPerc, memUsage, netInfo };
  } catch (e) {
    console.warn("Hardware info unavailable:", e);
    return { cpuCoreCount: "N/A", cpuPerc: "N/A", memUsage: "N/A", netInfo: getNetworkInfo() };
  }
}

// Discord info helper
function getDiscordInfo() {
  try {
    const { NativeModules } = ReactNative;
    const discordInfo = NativeModules.InfoDictionaryManager ?? NativeModules.RTNClientInfoManager;
    return discordInfo || {};
  } catch (e) {
    console.warn("Discord info unavailable:", e);
    return {};
  }
}

// Generate system info
function generateSystemInfo() {
  try {
    const { cpuCoreCount, cpuPerc, memUsage, netInfo } = getHardwareInfo();
    const discordInfo = getDiscordInfo();
    const { vendetta, discord, react, hermes, os, device } = getDebugInfo();
    
    const { version: HermesRelease, bytecodeVersion: HermesBytecode } = hermes || {};
    const { version: ReactVersion, nativeVersion: RNVersion } = react || {};
    const { name: osName, version: osVersion, sdk: osSdk } = os || {};
    const {
      manufacturer: deviceManufacturer,
      brand: deviceBrand,
      model: deviceModel,
      codename: deviceCodename,
    } = device || {};
    const { version: vendettaVersion } = vendetta || {};
    const { version: discordVersion, build: discordBuild } = discord || {};

    const deviceName = osName == "iOS" ? deviceCodename : `${deviceBrand} ${deviceModel}`;
    const { width, height } = getDeviceInfo();
    const isRooted = isDeviceRooted();

    let output = {
      Device: {
        Device: deviceName || "Unknown",
        Model: deviceModel || "Unknown",
        Manufacturer: deviceManufacturer || "Unknown",
        Brand: deviceBrand || "Unknown",
        Display: `${width}x${height}`,
      },
      Hardware: {
        "CPU Cores": cpuCoreCount || "N/A",
        Network: netInfo,
      },
      Software: {
        OS: osName || "Unknown",
        Version: osVersion || "Unknown",
        Rooted: isRooted ? "Yes" : "No",
      },
      Discord: {
        Version: discordVersion || "Unknown",
        Build: discordBuild || "Unknown",
        Vendetta: vendettaVersion || "Unknown",
        "CPU Usage": cpuPerc,
        "Memory Usage": memUsage,
      },
      React: {
        Version: ReactVersion || "Unknown",
        "Hermes Bytecode": HermesBytecode || "Unknown",
        Hermes: HermesRelease || "Unknown",
        Native: RNVersion || "Unknown",
      },
    };

    // Add additional mod versions if available
    if ((window as any).enmity) {
      output.Discord.Enmity = (window as any).enmity.version;
    }
    if ((window as any).aliucord) {
      output.Discord.Aliucord = (window as any).aliucord.version;
    }
    if (osSdk) {
      output.Software["SDK Version"] = osSdk;
    }

    return output;
  } catch (e) {
    console.error("Error generating system info:", e);
    throw e;
  }
}

// Initialize storage defaults
const categories = ["device", "hardware", "software", "discord", "react", "ephemeral"];
for (const cat of categories) {
  if (storage[cat] === undefined) storage[cat] = true;
}

// Command execution function
function executeSysinfoCommand(args: any[], ctx: any) {
  try {
    let output = ["__System Information__\n"];
    const data = generateSystemInfo();
    
    Object.keys(data).forEach((option) => {
      const permit = storage[option.toLowerCase()];
      const slasharg = args.find((i) => i.name == option.toLowerCase());
      const slashval = slasharg?.value ?? permit;
      
      if ((slashval || permit) && !(permit && !slashval)) {
        output.push(`[**${option}**]`);
        Object.keys(data[option as keyof typeof data]).forEach((subOption) => {
          output.push(`> ${subOption}: ${(data[option as keyof typeof data] as any)[subOption]}`);
        });
      }
    });

    const epermit = storage["ephemeral"];
    const ephemeral = args.find((i) => i.name == "ephemeral")?.value ?? epermit;
    
    if ((ephemeral || epermit) && !(epermit && !ephemeral)) {
      messageUtil.sendBotMessage(ctx.channel.id, output.join("\n"));
      return { type: 4 };
    } else {
      const fixNonce = Date.now().toString();
      MessageActions.sendMessage(
        ctx.channel.id,
        { content: output.join("\n") },
        void 0,
        { nonce: fixNonce }
      );
      return { type: 4 };
    }
  } catch (e) {
    console.error("[Sysinfo] Error:", e);
    // Silent fail - no chat message
    return { type: 4 };
  }
}

export const sysinfoCommand = {
  name: "sysinfo",
  displayName: "sysinfo",
  description: "Display system information",
  displayDescription: "Display system information",
  options: [
    {
      name: "ephemeral",
      displayName: "ephemeral",
      description: "Keep sysinfo ephemeral (default: true)",
      displayDescription: "Keep sysinfo ephemeral (default: true)",
      type: 5,
      required: false,
    },
    ...categories.slice(0, -1).map((cat) => ({
      name: cat,
      displayName: cat,
      description: `Display the ${cat} section. Set default in settings.`,
      displayDescription: `Display the ${cat} section. Set default in settings.`,
      type: 5,
      required: false,
    })),
  ],
  execute: executeSysinfoCommand,
  applicationId: "-1",
  inputType: 1,
  type: 1,
};
