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

// Network info helper with comprehensive detection
function getNetworkInfo() {
  try {
    // Method 1: Try @react-native-community/netinfo if available
    try {
      const NetInfo = findByProps("fetch", "addEventListener", "configure");
      if (NetInfo && typeof NetInfo.fetch === "function") {
        const networkState = NetInfo.fetch();
        if (networkState && typeof networkState.then === "function") {
          // It's a promise, we can't wait for it in this context
          console.log("NetInfo.fetch returned a promise, trying sync approach");
        } else if (networkState && networkState.type) {
          const { type, details } = networkState;
          if (type !== "unknown" && type !== "none") {
            return formatNetworkType(type, details);
          }
        }
      }
    } catch (e) {
      console.log("NetInfo method 1 failed:", e);
    }

    // Method 2: Try legacy NetInfo
    try {
      const LegacyNetInfo = findByProps("isConnected", "getConnectionInfo");
      if (LegacyNetInfo) {
        const connectionInfo = LegacyNetInfo.getConnectionInfo?.();
        if (connectionInfo && connectionInfo.type) {
          return formatNetworkType(connectionInfo.type, connectionInfo);
        }
      }
    } catch (e) {
      console.log("Legacy NetInfo failed:", e);
    }

    // Method 3: Try React Native's built-in NetInfo
    try {
      const RNNetInfo = ReactNative.NetInfo;
      if (RNNetInfo) {
        const info = RNNetInfo.fetch?.() || RNNetInfo.getConnectionInfo?.();
        if (info && info.type) {
          return formatNetworkType(info.type, info);
        }
      }
    } catch (e) {
      console.log("RN NetInfo failed:", e);
    }

    // Method 4: Check native modules for connectivity
    try {
      const { NativeModules } = ReactNative;
      
      // Check for Android connectivity
      if (ReactNative.Platform.OS === "android") {
        const connectivityModule = NativeModules.NetInfoCellularGeneration || 
                                 NativeModules.ConnectivityModule ||
                                 NativeModules.NetworkingAndroid;
        if (connectivityModule) {
          return "Cellular"; // Generic cellular if we can detect the module
        }
      }
      
      // Check for iOS connectivity
      if (ReactNative.Platform.OS === "ios") {
        const reachability = NativeModules.ReachabilityStateManager || 
                           NativeModules.NetworkingIOS;
        if (reachability) {
          return "Connected"; // Generic connected for iOS
        }
      }
    } catch (e) {
      console.log("Native modules check failed:", e);
    }

    // Method 5: Use navigator.connection if available (for web-like environments)
    try {
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection;
      if (connection) {
        const effectiveType = connection.effectiveType;
        if (effectiveType) {
          const typeMap: Record<string, string> = {
            "slow-2g": "2G",
            "2g": "2G", 
            "3g": "3G",
            "4g": "4G"
          };
          return typeMap[effectiveType] || "Cellular";
        }
        if (connection.type) {
          return formatNetworkType(connection.type, connection);
        }
      }
    } catch (e) {
      console.log("Navigator.connection failed:", e);
    }

    // Method 6: Basic online/offline check
    try {
      if (typeof navigator !== "undefined" && navigator.onLine !== undefined) {
        return navigator.onLine ? "Connected" : "Offline";
      }
    } catch (e) {
      console.log("Navigator.onLine failed:", e);
    }

    return "Unknown";
  } catch (e) {
    console.warn("All network detection methods failed:", e);
    return "Unknown";
  }
}

function formatNetworkType(type: string, details?: any) {
  const typeMap: Record<string, string> = {
    wifi: "WiFi",
    ethernet: "Ethernet",
    cellular: details?.cellularGeneration ? `${details.cellularGeneration.toUpperCase()}` : "Cellular",
    mobile: details?.subtype ? details.subtype.toUpperCase() : "Cellular",
    bluetooth: "Bluetooth",
    wimax: "WiMAX",
    vpn: "VPN",
    other: "Other",
    none: "Offline",
    unknown: "Unknown"
  };
  
  return typeMap[type.toLowerCase()] || type;
}

// Root/Jailbreak detection helper
function detectRootJailbreak() {
  try {
    const { NativeModules, Platform } = ReactNative;
    
    if (Platform.OS === "android") {
      // Android root detection through available indicators
      try {
        // Check if we can access any root-related native modules or properties
        const buildInfo = NativeModules.DeviceInfo || NativeModules.RNDeviceInfo;
        if (buildInfo) {
          // Check build tags
          const buildTags = buildInfo.getBuildTags?.();
          if (buildTags && buildTags.includes("test-keys")) {
            return "Yes (test-keys)";
          }
          
          // Check if bootloader is unlocked
          const bootloader = buildInfo.getBootloader?.();
          if (bootloader && bootloader.toLowerCase().includes("unlocked")) {
            return "Yes (unlocked)";
          }
        }
        
        // Check for Magisk through system properties if accessible
        const systemProps = NativeModules.SystemProperties;
        if (systemProps) {
          const magiskVersion = systemProps.get?.("ro.magisk.version");
          if (magiskVersion) {
            return `Yes (Magisk ${magiskVersion})`;
          }
        }
        
        // Check for SuperSU or other root managers through package manager
        const packageManager = NativeModules.PackageManager;
        if (packageManager) {
          const rootApps = [
            "com.topjohnwu.magisk",
            "eu.chainfire.supersu",
            "com.noshufou.android.su",
            "com.koushikdutta.superuser",
            "com.thirdparty.superuser"
          ];
          
          for (const app of rootApps) {
            const isInstalled = packageManager.isPackageInstalled?.(app);
            if (isInstalled) {
              return "Yes (root app detected)";
            }
          }
        }
        
        return "Unknown";
      } catch (e) {
        return "Unknown";
      }
    }
    
    if (Platform.OS === "ios") {
      // iOS jailbreak detection
      try {
        const fileManager = NativeModules.FileManager || NativeModules.NSFileManager;
        if (fileManager) {
          // Check for common jailbreak files
          const jailbreakPaths = [
            "/Applications/Cydia.app",
            "/Applications/Sileo.app", 
            "/usr/sbin/sshd",
            "/bin/bash",
            "/usr/bin/ssh"
          ];
          
          for (const path of jailbreakPaths) {
            const exists = fileManager.fileExistsAtPath?.(path);
            if (exists) {
              return "Yes (jailbreak detected)";
            }
          }
        }
        
        // Check for jailbreak tweaks
        const bundleManager = NativeModules.NSBundle;
        if (bundleManager) {
          const substrate = bundleManager.pathForResource?.("MobileSubstrate", "dylib");
          if (substrate) {
            return "Yes (Substrate detected)";
          }
        }
        
        return "Unknown";
      } catch (e) {
        return "Unknown";
      }
    }
    
    return "Unknown";
  } catch (e) {
    console.warn("Root/Jailbreak detection failed:", e);
    return "Unknown";
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
    const rootStatus = detectRootJailbreak();

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
        Rooted: rootStatus,
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
