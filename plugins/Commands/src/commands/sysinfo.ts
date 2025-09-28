import { findByProps } from "@vendetta/metro";
import { getDebugInfo } from "@vendetta/debug";
import { ReactNative } from "@vendetta/metro/common";
import { NativeModules } from "@vendetta/metro/common/ReactNative";

const messageUtil = findByProps("sendBotMessage", "sendMessage", "receiveMessage");

// Hardware info function
const hwinfo = () => {
  const { cpuCoreCount, cpuPercentage, memory } = findByProps("memory");
  const cpuPerc = cpuPercentage.toFixed(2) + "%";
  const memUsage = parseFloat((memory / 1000).toPrecision(3)) + " MB";
  const { type, details } = Object.values(
    findByProps("useNetInfo").fetch(),
  ).filter((i) => i?.type)[0];
  let netInfo = "";
  const networkMap = {
    wifi: "WiFi",
    ethernet: "Ethernet",
    other: "Unknown",
    bluetooth: "Bluetooth",
    wimax: "WiMAX",
    vpn: "VPN",
    cellular: details.cellularGeneration?.toUpperCase() || "Cellular",
  };
  netInfo = networkMap[type] ?? type;
  return { cpuCoreCount, cpuPerc, memUsage, netInfo };
};

// Device info function
const deviceInfo = () => {
  let { height, width, scale } = ReactNative.Dimensions.get("screen");
  height *= scale;
  width *= scale;
  return {
    width,
    height,
  };
};

// Discord info function
const discordinfo = () => {
  return (
    NativeModules.InfoDictionaryManager ?? NativeModules.RTNClientInfoManager
  );
};

// Generate debug info
const genDebug = () => {
  try {
    const { cpuCoreCount, cpuPerc, memUsage, netInfo } = hwinfo();

    const { ReleaseChannel: discordBranch } = discordinfo();
    const { vendetta, discord, react, hermes, os, device } = getDebugInfo();
    const { version: HermesRelease, bytecodeVersion: HermesBytecode } = hermes;
    const { version: ReactVersion, nativeVersion: RNVersion } = react;
    const { name: osName, version: osVersion, sdk: osSdk } = os;
    const {
      manufacturer: deviceManufacturer,
      brand: deviceBrand,
      model: deviceModel,
      codename: deviceCodename,
    } = device;
    const { version: vendettaVersion } = vendetta;
    const { version: discordVersion, build: discordBuild } = discord;

    const deviceName =
      osName == "iOS" ? deviceCodename : `${deviceBrand} ${deviceModel}`;

    const { width, height } = deviceInfo();

    let output = {
      Device: {
        Device: deviceName,
        Model: deviceModel,
        Manufacturer: deviceManufacturer,
        Brand: deviceBrand,
        Display: width + "x" + height,
      },
      Hardware: {
        "CPU Cores": cpuCoreCount,
        Network: netInfo,
      },
      Software: {
        OS: osName,
        Version: osVersion,
      },
      Discord: {
        Branch: discordBranch,
        Version: discordVersion,
        Build: discordBuild,
        Vendetta: vendettaVersion,
        "CPU Usage": cpuPerc,
        "Memory Usage": memUsage,
      },
      React: {
        Version: ReactVersion,
        "Hermes Bytecode": HermesBytecode,
        Hermes: HermesRelease,
        Native: RNVersion,
      },
    };
    if (window.enmity) {
      output.Discord.Enmity = window.enmity.version;
    }
    if (window.aliucord) {
      output.Discord.Aliucord = window.aliucord.version;
    }
    if (osSdk) {
      output.Software["SDK Version"] = osSdk;
    }
    return output;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

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
      type: 5, // BOOLEAN type
      required: false,
    },
    {
      name: "device",
      displayName: "device",
      description: "Display the device section",
      displayDescription: "Display the device section",
      type: 5, // BOOLEAN type
      required: false,
    },
    {
      name: "hardware",
      displayName: "hardware",
      description: "Display the hardware section",
      displayDescription: "Display the hardware section",
      type: 5, // BOOLEAN type
      required: false,
    },
    {
      name: "software",
      displayName: "software",
      description: "Display the software section",
      displayDescription: "Display the software section",
      type: 5, // BOOLEAN type
      required: false,
    },
    {
      name: "discord",
      displayName: "discord",
      description: "Display the discord section",
      displayDescription: "Display the discord section",
      type: 5, // BOOLEAN type
      required: false,
    },
    {
      name: "react",
      displayName: "react",
      description: "Display the react section",
      displayDescription: "Display the react section",
      type: 5, // BOOLEAN type
      required: false,
    },
  ],
  execute: async (args: any, ctx: any) => {
    try {
      const options = new Map(args.map((option: any) => [option.name, option]));
      
      // Default settings - show all sections by default
      const defaultSettings = {
        device: true,
        hardware: true,
        software: true,
        discord: true,
        react: true,
        ephemeral: true,
      };

      let output = ["__System Information__\n"];
      const data = genDebug();
      
      Object.keys(data).forEach((section) => {
        const sectionKey = section.toLowerCase();
        const argValue = options.get(sectionKey)?.value;
        const shouldShow = argValue !== undefined ? argValue : defaultSettings[sectionKey];
        
        if (shouldShow) {
          output.push(`[**${section}**]`);
          Object.keys(data[section]).forEach((subOption) => {
            output.push(`> ${subOption}: ${data[section][subOption]}`);
          });
        }
      });

      const ephemeralArg = options.get("ephemeral")?.value;
      const isEphemeral = ephemeralArg !== undefined ? ephemeralArg : defaultSettings.ephemeral;
      
      if (isEphemeral) {
        messageUtil.sendBotMessage(ctx.channel.id, output.join("\n"));
        return { type: 4 };
      } else {
        return { 
          type: 4,
          data: {
            content: output.join("\n")
          }
        };
      }
    } catch (error) {
      console.error("[Sysinfo] Error:", error);
      messageUtil.sendBotMessage(ctx.channel.id, "Failed to generate system information. Please try again.");
      return { type: 4 };
    }
  },
  applicationId: "-1",
  inputType: 1,
  type: 1,
};
