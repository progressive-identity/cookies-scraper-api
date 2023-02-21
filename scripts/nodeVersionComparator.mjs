import chalk from "chalk";
import fs from "fs";

/* CONSTANTS */
const SOURCES = Object.freeze({
  engines: "engines", nvmrc: "nvmrc", volta: "volta"
});
const FLAGS = Object.freeze({ help: "help", version: "version", source: "source", empty: "" });
/* CONSTANTS */

/* PACKAGE.JSON */
const pathPackageJson = `${process.cwd()}/package.json`;
const packageJson = JSON.parse(fs.readFileSync(pathPackageJson, "utf8"));
/* PACKAGE.JSON */

/* NVMRC */
const pathNvmrc = `${process.cwd()}/.nvmrc`;
const nodeNvmrc = (fs.existsSync(pathNvmrc) && fs.readFileSync(pathNvmrc, "utf8").replace(/(\r\n|\n|\r|v)/gm, "")) || undefined;
/* NVMRC */

const nodeEngines = packageJson.engines?.node?.replace(">=", "") || undefined;
const nodeVolta = packageJson.volta?.node || undefined;

const sameVersionEverywhere = nodeNvmrc === nodeEngines && nodeNvmrc === nodeVolta;

/* UTILS */
const logErrorAndExit = error => {
  console.error(`${chalk.red("ERROR:")} ${error.message}`);
  process.exit(1);
};
const setNodeVersion = (version) => {
  try {
    if (!version) {
      throw new Error("No version defined");
    }
    packageJson.engines = { node: version };
    packageJson.volta = { node: version };
    fs.writeFileSync(pathPackageJson, JSON.stringify(packageJson, null, 2));
    fs.writeFileSync(pathNvmrc, "v" + version);
  } catch (error) {
    logErrorAndExit(error);
  }
};
/* UTILS */

/* ARGUMENTS */
const flagEqualSub = process.argv[2] || "";
const flagAndSub = flagEqualSub.split("=");
const flag = flagAndSub[0];
/* ARGUMENTS */

/* HELP FLAG */
const isFlagHelp = flag === FLAGS.help;
if (isFlagHelp) {
  console.info(`${chalk.yellow("USAGE:")}
    ${chalk.blue("npm run compare-node-versions")} [FLAGS]=[SUBCOMMAND]

${chalk.yellow("FLAGS:")}
    ${chalk.green(FLAGS.version)}   Set the node version to use
    ${chalk.green(FLAGS.source)}    Set the source of truth to sync node versions from
    ${chalk.green(FLAGS.help)}      Prints help information

${chalk.yellow("SOURCE FLAG SUBCOMMANDS:")}
    ${chalk.green(SOURCES.engines)}       Synchronises the node version with the ${SOURCES.engines} field in package.json
    ${chalk.green(SOURCES.volta)}         Synchronises the node version with the ${SOURCES.volta} field in package.json
    ${chalk.green(SOURCES.nvmrc)}         Synchronises the node version with the .${SOURCES.nvmrc} file
    
${chalk.yellow("VERSION FLAG SUBCOMMANDS:")}
    ${chalk.green("X.X.X")}         Sets the node version to X.X.X
    `);

}
/* HELP FLAG */

/* SOURCE FLAG */
const isFlagSource = flag === FLAGS.source;
if (isFlagSource) {
  try {
    const source = flagAndSub[1];
    const allowedSources = [SOURCES.volta, SOURCES.engines, SOURCES.nvmrc];
    if (!allowedSources.includes(source)) {
      throw new Error(`Source should be one of the following: ${SOURCES.engines}|${SOURCES.nvmrc}|${SOURCES.volta}`);
    }
    const reader = {
      volta: () => packageJson.volta.node,
      engines: () => packageJson.engines.node,
      nvmrc: () => fs.readFileSync(pathNvmrc, "utf8").replace(/(\r\n|\n|\r|v)/gm, "")
    };
    const version = reader[source]();
    setNodeVersion(version);
    console.info(`${chalk.yellow("INFO:")} Node version set to ${chalk.green(version)} as per ${chalk.green(source)}`);
    process.exit(0);
  } catch (error) {
    logErrorAndExit(error);
  }


}
/* SOURCE FLAG */

/* VERSION FLAG */
const isFlagVersion = flag === FLAGS.version;
if (isFlagVersion) {
  try {
    const version = flagAndSub[1];
    const versionRegexp = /^\d+\.\d+\.\d+$/;
    if (!versionRegexp.test(version)) {
      throw new Error("Version should be in the format x.x.x");
    }
    setNodeVersion(version);
    console.info(`${chalk.yellow("INFO:")} node version ${chalk.green(version)} applied on ${chalk.green("engines")}, ${chalk.green(".nvmrc")} and ${chalk.green("volta")}`);
    process.exit(0);
  } catch (error) {
    logErrorAndExit(error);
  }
}
/* VERSION FLAG */

/* UNKNOWN FLAG */
try {
  const allowedFlags = [FLAGS.help, FLAGS.version, FLAGS.source, FLAGS.empty];
  if (!allowedFlags.includes(flag)) {
    throw new Error(`Unknown flag ${chalk.yellow(flag)}, you must use one of the following: ${chalk.green(FLAGS.version)}|${chalk.green(FLAGS.source)}|${chalk.green(FLAGS.help)}`);
  }
} catch (error) {
  logErrorAndExit(error);
}
/* UNKNOWN FLAG */

/* NEED AT LEAST ONE VERSION DEFINED SOMEWHERE */
try {
  const isAtLeastOneVersionDefinedSomewhere = nodeNvmrc || nodeEngines || nodeVolta;
  if (!isAtLeastOneVersionDefinedSomewhere) {
    throw new Error(`At least one version should be defined in ${chalk.green(`.${SOURCES.nvmrc}`)} or ${chalk.green(SOURCES.engines)} or ${chalk.green(SOURCES.volta)}`);
  }
} catch (error) {
  logErrorAndExit(error);
}
/* NEED AT LEAST ONE VERSION DEFINED SOMEWHERE */

/* ONLY ONE VERSION DEFINED SOMEWHERE */
try {
  const definedVersions = [nodeNvmrc, nodeEngines, nodeVolta].filter(version => version);
  const onlyOneVersionDefined = definedVersions.length === 1;
  const definedVersionsIdentical = [...new Set(definedVersions)].length === 1;
  if (onlyOneVersionDefined || definedVersionsIdentical && !sameVersionEverywhere) {
    setNodeVersion(definedVersions[0]);
    console.info(`${chalk.yellow("INFO:")} node version ${chalk.green(definedVersions[0])} applied on ${chalk.green("engines")}, ${chalk.green(".nvmrc")} and ${chalk.green("volta")}`);
    process.exit(0);
  }
} catch (error) {
  logErrorAndExit(error);
}
/* ONLY ONE VERSION DEFINED SOMEWHERE */

/* NOT THE SAME VERSION EVERYWHERE */
try {
  if (!sameVersionEverywhere) {
    throw new Error(`The version are not the same on ${SOURCES.engines}, ${SOURCES.nvmrc} & ${SOURCES.volta}. 
    Please specify:
    - the single source of truth to sync with using ${chalk.green(`source=${SOURCES.engines}|${SOURCES.nvmrc}|${SOURCES.volta}`)}
    OR
    - the version to use with ${chalk.green("version=X.X.X")};
    
    You current versions:
    ${SOURCES.engines}: ${nodeEngines && chalk.yellow(nodeEngines) || chalk.red(undefined)}
    ${SOURCES.nvmrc}: ${nodeNvmrc && chalk.yellow(nodeNvmrc) || chalk.red(undefined)}
    ${SOURCES.volta}: ${nodeVolta && chalk.yellow(nodeVolta) || chalk.red(undefined)}`);
  }
} catch (error) {
  logErrorAndExit(error);
}
/* NOT THE SAME VERSION EVERYWHERE */

/* DEFAULT */
sameVersionEverywhere && console.info(`${chalk.yellow("INFO:")} Node versions are the same on ${SOURCES.engines}, ${SOURCES.nvmrc} & ${SOURCES.volta}`);
/* DEFAULT */

/* ERROR HANDLING */
["uncaughtException", "unhandledRejection"].forEach((event) => {
  process.on(event, (error) => {
    logErrorAndExit(error);
  });
});
/* ERROR HANDLING */
