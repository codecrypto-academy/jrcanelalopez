// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/DAOToken.sol";
import "../src/CodeCryptoDAOGovernor.sol";

/**
 * @title InteractWithDAO
 * @notice Script helper para interactuar con el DAO desplegado
 * @dev Útil para operaciones comunes post-deployment
 *
 * Uso:
 * forge script script/InteractWithDAO.s.sol:CreateShareholder \
 *   --rpc-url $RPC_URL --broadcast
 */

/**
 * @notice Crear un nuevo shareholder
 */
contract CreateShareholder is Script {
    function run() public {
        // Configurar
        address tokenAddress = vm.envAddress("DAO_TOKEN_ADDRESS");
        address shareholderAddress = vm.envAddress("SHAREHOLDER_ADDRESS");
        uint256 shares = vm.envUint("SHARES_AMOUNT");
        uint256 privateKey = vm.envUint("PRIVATE_KEY");

        console.log("Creating shareholder...");
        console.log("Token:", tokenAddress);
        console.log("Shareholder:", shareholderAddress);
        console.log("Shares:", shares / 10 ** 18);

        vm.startBroadcast(privateKey);

        DAOToken token = DAOToken(tokenAddress);
        token.createShareholder(shareholderAddress, shares);

        console.log("Shareholder created successfully!");
        console.log("Balance:", token.balanceOf(shareholderAddress) / 10 ** 18);

        vm.stopBroadcast();
    }
}

/**
 * @notice Delegar votos
 */
contract DelegateVotes is Script {
    function run() public {
        address tokenAddress = vm.envAddress("DAO_TOKEN_ADDRESS");
        address delegatee = vm.envAddress("DELEGATE_TO");
        uint256 privateKey = vm.envUint("PRIVATE_KEY");

        console.log("Delegating votes...");
        console.log("Token:", tokenAddress);
        console.log("Delegating to:", delegatee);

        vm.startBroadcast(privateKey);

        DAOToken token = DAOToken(tokenAddress);
        token.delegate(delegatee);

        console.log("Votes delegated successfully!");
        console.log("Voting power:", token.getVotes(delegatee) / 10 ** 18);

        vm.stopBroadcast();
    }
}

/**
 * @notice Crear una propuesta simple
 */
contract CreateProposal is Script {
    function run() public {
        address governorAddress = vm.envAddress("DAO_GOVERNOR_ADDRESS");
        address target = vm.envAddress("PROPOSAL_TARGET");
        uint256 value = vm.envUint("PROPOSAL_VALUE");
        string memory description = vm.envString("PROPOSAL_DESCRIPTION");
        uint256 privateKey = vm.envUint("PRIVATE_KEY");

        console.log("Creating proposal...");
        console.log("Governor:", governorAddress);
        console.log("Target:", target);
        console.log("Value:", value);
        console.log("Description:", description);

        vm.startBroadcast(privateKey);

        CodeCryptoDAOGovernor governor = CodeCryptoDAOGovernor(
            payable(governorAddress)
        );

        address[] memory targets = new address[](1);
        targets[0] = target;

        uint256[] memory values = new uint256[](1);
        values[0] = value;

        bytes[] memory calldatas = new bytes[](1);
        calldatas[0] = "";

        uint256 proposalId = governor.propose(
            targets,
            values,
            calldatas,
            description
        );

        console.log("Proposal created successfully!");
        console.log("Proposal ID:", proposalId);

        vm.stopBroadcast();
    }
}

/**
 * @notice Votar en una propuesta
 */
contract VoteOnProposal is Script {
    function run() public {
        address governorAddress = vm.envAddress("DAO_GOVERNOR_ADDRESS");
        uint256 proposalId = vm.envUint("PROPOSAL_ID");
        uint8 support = uint8(vm.envUint("VOTE_SUPPORT")); // 0=Against, 1=For, 2=Abstain
        uint256 privateKey = vm.envUint("PRIVATE_KEY");

        console.log("Voting on proposal...");
        console.log("Governor:", governorAddress);
        console.log("Proposal ID:", proposalId);
        console.log(
            "Support:",
            support == 0
                ? "Against"
                : support == 1
                    ? "For"
                    : "Abstain"
        );

        vm.startBroadcast(privateKey);

        CodeCryptoDAOGovernor governor = CodeCryptoDAOGovernor(
            payable(governorAddress)
        );
        governor.castVote(proposalId, support);

        console.log("Vote cast successfully!");

        (
            uint256 againstVotes,
            uint256 forVotes,
            uint256 abstainVotes
        ) = governor.proposalVotes(proposalId);
        console.log("Current votes:");
        console.log("  Against:", againstVotes / 10 ** 18);
        console.log("  For:", forVotes / 10 ** 18);
        console.log("  Abstain:", abstainVotes / 10 ** 18);

        vm.stopBroadcast();
    }
}

/**
 * @notice Ver estado de una propuesta
 */
contract GetProposalState is Script {
    function run() public view {
        address governorAddress = vm.envAddress("DAO_GOVERNOR_ADDRESS");
        uint256 proposalId = vm.envUint("PROPOSAL_ID");

        CodeCryptoDAOGovernor governor = CodeCryptoDAOGovernor(
            payable(governorAddress)
        );

        console.log("Proposal State:");
        console.log("===============");
        console.log("Proposal ID:", proposalId);

        uint8 state = uint8(governor.state(proposalId));
        string memory stateName;

        if (state == 0) stateName = "Pending";
        else if (state == 1) stateName = "Active";
        else if (state == 2) stateName = "Canceled";
        else if (state == 3) stateName = "Defeated";
        else if (state == 4) stateName = "Succeeded";
        else if (state == 5) stateName = "Queued";
        else if (state == 6) stateName = "Expired";
        else if (state == 7) stateName = "Executed";

        console.log("State:", stateName);

        (
            uint256 againstVotes,
            uint256 forVotes,
            uint256 abstainVotes
        ) = governor.proposalVotes(proposalId);
        console.log("\nVotes:");
        console.log("  Against:", againstVotes / 10 ** 18);
        console.log("  For:", forVotes / 10 ** 18);
        console.log("  Abstain:", abstainVotes / 10 ** 18);

        // Metadata
        (
            string memory description,
            address proposer,
            uint256 createdAt,
            bool executed,
            bool canceled
        ) = governor.proposalMetadata(proposalId);

        console.log("\nMetadata:");
        console.log("  Proposer:", proposer);
        console.log("  Description:", description);
        console.log("  Created At:", createdAt);
        console.log("  Executed:", executed);
        console.log("  Canceled:", canceled);
    }
}

/**
 * @notice Ver información del token
 */
contract GetTokenInfo is Script {
    function run() public view {
        address tokenAddress = vm.envAddress("DAO_TOKEN_ADDRESS");

        DAOToken token = DAOToken(tokenAddress);

        console.log("DAO Token Information:");
        console.log("=====================");
        console.log("Address:", tokenAddress);
        console.log("Name:", token.name());
        console.log("Symbol:", token.symbol());
        console.log("Total Supply:", token.totalSupply() / 10 ** 18, "tokens");
        console.log("Owner:", token.owner());

        // Si quieres ver el balance de una dirección específica
        try vm.envAddress("CHECK_BALANCE_OF") returns (address account) {
            uint256 balance = token.balanceOf(account);
            uint256 votes = token.getVotes(account);

            console.log("\nAccount Info:");
            console.log("  Address:", account);
            console.log("  Balance:", balance / 10 ** 18, "tokens");
            console.log("  Voting Power:", votes / 10 ** 18, "votes");
        } catch {
            // No CHECK_BALANCE_OF configurado
        }
    }
}
