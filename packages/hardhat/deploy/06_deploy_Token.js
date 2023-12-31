const fs = require("fs");
const path = require("path");

let bbNode;
try {
  bbNode = JSON.parse(
    fs
      .readFileSync(path.join(__dirname, "../../buildbear/nodes.json"))
      .toString()
      .trim()
  );
} catch (e) {
  console.log("No buildbear node found");
}

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { BASE_URL } = await import("../../buildbear/constants.mjs");
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const Tokenaddress = await deploy("TokenFactory", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    log: true,
  });

  // if deploying on buildbear node print explorer link
  console.log(
    "Checkout Lending at: ",
    `https://explorer.${BASE_URL}/${bbNode.nodeId}/address/${Tokenaddress.address}`
  );
};

module.exports.tags = ["TokenFactory"];
