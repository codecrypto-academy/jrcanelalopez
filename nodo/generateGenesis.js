const fs = require("fs");
function generateGenesis(
  NETWORK_CHAINID,
  CUENTA,
  BALANCE,
  CUENTAS_ALLOC,
  NETWORK_DIR
) {
  const timestamp = Math.round(new Date().getTime() / 1000).toString(16);
  // leemos la plantilla del genesis
  let genesis = JSON.parse(fs.readFileSync("genesisbase.json").toString());

  // genesis.timestamp = `0x${timestamp}`
  genesis.config.chainId = NETWORK_CHAINID;
  genesis.extraData = `0x${"0".repeat(64)}${CUENTA}${"0".repeat(130)}`;

  genesis.alloc = CUENTAS_ALLOC.reduce((acc, item) => {
    acc[item] = { balance: BALANCE };
    return acc;
  }, {});

  fs.writeFileSync(`${NETWORK_DIR}/genesis.json`, JSON.stringify(genesis));
}
const BALANCE =
  "0x200000000000000000000000000000000000000000000000000000000000000";
generateGenesis(
  3333,
  "7e50fa8509af04b463f519ea673f580a5b93ff76",
  BALANCE,
  [
    "7e50fa8509af04b463f519ea673f580a5b93ff76",
    "0xB30AA576E7777200Aac443cD072f2356d4C0c29b",
    "0x318E4E8a30e2ba06E27097c37e8212905835E140",
  ],
  "."
);
