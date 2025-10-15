// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/DAOToken.sol";
import "../src/CodeCryptoDAOGovernor.sol";
import "@openzeppelin/contracts/governance/TimelockController.sol";

contract CodeCryptoDAOGovernorTest is Test {
    DAOToken public token;
    TimelockController public timelock;
    CodeCryptoDAOGovernor public governor;

    address public owner = address(1);
    address public proposer1 = address(2);
    address public proposer2 = address(3);
    address public voter1 = address(4);
    address public voter2 = address(5);
    address public voter3 = address(6);
    address public executor = address(7);

    uint256 constant PROPOSER_TOKENS = 1_000 * 10 ** 18; // Para pasar el threshold
    uint256 constant VOTER_TOKENS = 100_000 * 10 ** 18;

    // Parámetros del Governor
    uint256 constant VOTING_DELAY = 1; // 1 block
    uint256 constant VOTING_PERIOD = 50400; // ~1 semana
    uint256 constant PROPOSAL_THRESHOLD = 1000 * 10 ** 18; // 1000 tokens mínimo

    // Parámetros del Timelock
    uint256 constant MIN_DELAY = 2 days;

    function setUp() public {
        vm.startPrank(owner);

        // 1. Desplegar token
        token = new DAOToken(owner);

        // 2. Crear accionistas con poder de voto
        token.createShareholder(proposer1, PROPOSER_TOKENS);
        token.createShareholder(voter1, VOTER_TOKENS);
        token.createShareholder(voter2, VOTER_TOKENS);
        token.createShareholder(voter3, VOTER_TOKENS);

        vm.stopPrank();

        // 3. Delegar votos (necesario para ERC20Votes)
        vm.prank(proposer1);
        token.delegate(proposer1);

        vm.prank(voter1);
        token.delegate(voter1);

        vm.prank(voter2);
        token.delegate(voter2);

        vm.prank(voter3);
        token.delegate(voter3);

        // 4. Preparar roles para Timelock
        address[] memory proposers = new address[](1);
        proposers[0] = address(0); // Cualquiera puede proponer a través del Governor

        address[] memory executors = new address[](1);
        executors[0] = address(0); // Cualquiera puede ejecutar

        // 5. Desplegar Timelock
        vm.prank(owner);
        timelock = new TimelockController(
            MIN_DELAY,
            proposers,
            executors,
            owner
        );

        // 6. Desplegar Governor
        vm.prank(owner);
        governor = new CodeCryptoDAOGovernor(token, timelock);

        // 7. Dar rol de proposer al Governor en el Timelock
        vm.startPrank(owner);
        bytes32 proposerRole = timelock.PROPOSER_ROLE();
        bytes32 executorRole = timelock.EXECUTOR_ROLE();
        bytes32 adminRole = timelock.DEFAULT_ADMIN_ROLE();

        timelock.grantRole(proposerRole, address(governor));
        timelock.grantRole(executorRole, address(governor));

        // Revocar el admin role del owner (el timelock se auto-gobierna)
        timelock.revokeRole(adminRole, owner);

        vm.stopPrank();

        // Avanzar 1 bloque para que las delegaciones tomen efecto
        vm.roll(block.number + 1);
        vm.warp(block.timestamp + 12);
    }

    /* ========== ESTADO INICIAL ========== */

    function test_InitialState() public view {
        assertEq(governor.name(), "CodeCrypto DAO Governor");
        assertEq(address(governor.token()), address(token));
        assertEq(address(governor.timelock()), address(timelock));
        assertEq(governor.votingDelay(), VOTING_DELAY);
        assertEq(governor.votingPeriod(), VOTING_PERIOD);
        assertEq(governor.proposalThreshold(), PROPOSAL_THRESHOLD);
        assertEq(
            governor.quorum(block.timestamp - 1),
            ((PROPOSER_TOKENS + VOTER_TOKENS * 3) * 4) / 100
        );
    }

    /* ========== CREAR PROPUESTAS ========== */

    function test_CreateProposal() public {
        address[] memory targets = new address[](1);
        targets[0] = address(timelock);

        uint256[] memory values = new uint256[](1);
        values[0] = 0;

        bytes[] memory calldatas = new bytes[](1);
        calldatas[0] = "";

        string memory description = "Propuesta de prueba #1";

        vm.prank(proposer1);
        uint256 proposalId = governor.propose(
            targets,
            values,
            calldatas,
            description
        );

        assertTrue(proposalId > 0);
        assertEq(uint8(governor.state(proposalId)), uint8(0)); // Pending
    }

    function test_RevertWhen_ProposalThresholdNotMet() public {
        // proposer2 no tiene tokens suficientes
        vm.prank(owner);
        token.createShareholder(proposer2, 100 * 10 ** 18); // Solo 100 tokens

        vm.prank(proposer2);
        token.delegate(proposer2);

        vm.roll(block.number + 1);

        address[] memory targets = new address[](1);
        targets[0] = address(timelock);

        uint256[] memory values = new uint256[](1);
        values[0] = 0;

        bytes[] memory calldatas = new bytes[](1);
        calldatas[0] = "";

        vm.prank(proposer2);
        vm.expectRevert();
        governor.propose(targets, values, calldatas, "Propuesta sin threshold");
    }

    /* ========== PROPUESTA CON METADATA ========== */

    function test_ProposeWithMetadata() public {
        address[] memory targets = new address[](1);
        targets[0] = voter1;

        uint256[] memory values = new uint256[](1);
        values[0] = 0;

        bytes[] memory calldatas = new bytes[](1);
        calldatas[0] = "";

        string memory description = "Propuesta con metadata completa";

        vm.prank(proposer1);
        uint256 proposalId = governor.propose(
            targets,
            values,
            calldatas,
            description
        );

        // Verificar que se guardó la metadata
        (
            string memory desc,
            address proposer,
            uint256 createdAt,
            bool executed,
            bool canceled
        ) = governor.proposalMetadata(proposalId);

        assertEq(proposer, proposer1);
        assertEq(desc, description);
        assertTrue(createdAt > 0);
        assertFalse(executed);
        assertFalse(canceled);
    }

    /* ========== HELPER: PROPUESTA DE TRANSFERENCIA ========== */

    function test_ProposeTransfer() public {
        // Primero enviar ETH al timelock
        vm.deal(address(timelock), 10 ether);

        vm.prank(proposer1);
        uint256 proposalId = governor.proposeTransfer(
            voter1,
            1 ether,
            "Transferir 1 ETH a voter1"
        );

        assertTrue(proposalId > 0);
    }

    /* ========== VOTACIÓN ========== */

    function test_VoteFor() public {
        // Crear propuesta
        vm.prank(proposer1);
        uint256 proposalId = _createSimpleProposal();

        // Esperar al voting delay
        vm.roll(block.number + VOTING_DELAY + 1);
        vm.warp(block.timestamp + 12 * (VOTING_DELAY + 1));

        // Verificar que está Active
        assertEq(uint8(governor.state(proposalId)), uint8(1)); // Active

        // Votar a favor
        vm.prank(voter1);
        governor.castVote(proposalId, 1); // 1 = For

        (
            uint256 againstVotes,
            uint256 forVotes,
            uint256 abstainVotes
        ) = governor.proposalVotes(proposalId);

        assertEq(forVotes, VOTER_TOKENS);
        assertEq(againstVotes, 0);
        assertEq(abstainVotes, 0);
    }

    function test_VoteAgainst() public {
        vm.prank(proposer1);
        uint256 proposalId = _createSimpleProposal();

        vm.roll(block.number + VOTING_DELAY + 1);
        vm.warp(block.timestamp + 12 * (VOTING_DELAY + 1));

        vm.prank(voter1);
        governor.castVote(proposalId, 0); // 0 = Against

        (
            uint256 againstVotes,
            uint256 forVotes,
            uint256 abstainVotes
        ) = governor.proposalVotes(proposalId);

        assertEq(forVotes, 0);
        assertEq(againstVotes, VOTER_TOKENS);
        assertEq(abstainVotes, 0);
    }

    function test_VoteAbstain() public {
        vm.prank(proposer1);
        uint256 proposalId = _createSimpleProposal();

        vm.roll(block.number + VOTING_DELAY + 1);
        vm.warp(block.timestamp + 12 * (VOTING_DELAY + 1));

        vm.prank(voter1);
        governor.castVote(proposalId, 2); // 2 = Abstain

        (
            uint256 againstVotes,
            uint256 forVotes,
            uint256 abstainVotes
        ) = governor.proposalVotes(proposalId);

        assertEq(forVotes, 0);
        assertEq(againstVotes, 0);
        assertEq(abstainVotes, VOTER_TOKENS);
    }

    function test_MultipleVotes() public {
        vm.prank(proposer1);
        uint256 proposalId = _createSimpleProposal();

        vm.roll(block.number + VOTING_DELAY + 1);
        vm.warp(block.timestamp + 12 * (VOTING_DELAY + 1));

        // Varios votantes
        vm.prank(voter1);
        governor.castVote(proposalId, 1); // For

        vm.prank(voter2);
        governor.castVote(proposalId, 1); // For

        vm.prank(voter3);
        governor.castVote(proposalId, 0); // Against

        (
            uint256 againstVotes,
            uint256 forVotes,
            uint256 abstainVotes
        ) = governor.proposalVotes(proposalId);

        assertEq(forVotes, VOTER_TOKENS * 2);
        assertEq(againstVotes, VOTER_TOKENS);
        assertEq(abstainVotes, 0);
    }

    function test_RevertWhen_DoubleVote() public {
        vm.prank(proposer1);
        uint256 proposalId = _createSimpleProposal();

        vm.roll(block.number + VOTING_DELAY + 1);
        vm.warp(block.timestamp + 12 * (VOTING_DELAY + 1));

        vm.prank(voter1);
        governor.castVote(proposalId, 1);

        // Intentar votar de nuevo
        vm.prank(voter1);
        vm.expectRevert();
        governor.castVote(proposalId, 1);
    }

    /* ========== QUORUM ========== */

    function test_QuorumReached() public {
        vm.prank(proposer1);
        uint256 proposalId = _createSimpleProposal();

        vm.roll(block.number + VOTING_DELAY + 1);
        vm.warp(block.timestamp + 12 * (VOTING_DELAY + 1));

        // voter1 tiene suficientes votos para alcanzar el quorum (4%)
        vm.prank(voter1);
        governor.castVote(proposalId, 1);

        // Terminar el período de votación
        vm.roll(block.number + VOTING_PERIOD + 1);
        vm.warp(block.timestamp + 12 * (VOTING_PERIOD + 1));

        // Debe estar en estado Succeeded
        assertEq(uint8(governor.state(proposalId)), uint8(4)); // Succeeded
    }

    function test_QuorumNotReached() public {
        // Crear un votante con muy pocos tokens
        vm.prank(owner);
        token.createShareholder(address(10), 1000 * 10 ** 18);

        vm.prank(address(10));
        token.delegate(address(10));

        vm.roll(block.number + 1);

        vm.prank(proposer1);
        uint256 proposalId = _createSimpleProposal();

        vm.roll(block.number + VOTING_DELAY + 1);
        vm.warp(block.timestamp + 12 * (VOTING_DELAY + 1));

        // Solo vota el de pocos tokens
        vm.prank(address(10));
        governor.castVote(proposalId, 1);

        // Terminar votación
        vm.roll(block.number + VOTING_PERIOD + 1);
        vm.warp(block.timestamp + 12 * (VOTING_PERIOD + 1));

        // Debe estar Defeated (no alcanzó quorum)
        assertEq(uint8(governor.state(proposalId)), uint8(3)); // Defeated
    }

    /* ========== EJECUCIÓN ========== */

    function test_ExecuteProposal() public {
        // Enviar ETH al timelock
        vm.deal(address(timelock), 10 ether);

        vm.prank(proposer1);
        uint256 proposalId = governor.proposeTransfer(
            voter1,
            1 ether,
            "Transferir 1 ETH"
        );

        // Votar
        vm.roll(block.number + VOTING_DELAY + 1);
        vm.warp(block.timestamp + 12 * (VOTING_DELAY + 1));

        vm.prank(voter1);
        governor.castVote(proposalId, 1);

        vm.prank(voter2);
        governor.castVote(proposalId, 1);

        // Terminar votación
        vm.roll(block.number + VOTING_PERIOD + 1);
        vm.warp(block.timestamp + 12 * (VOTING_PERIOD + 1));

        // Queue
        address[] memory targets = new address[](1);
        targets[0] = voter1;
        uint256[] memory values = new uint256[](1);
        values[0] = 1 ether;
        bytes[] memory calldatas = new bytes[](1);
        calldatas[0] = "";
        bytes32 descriptionHash = keccak256(bytes("Transferir 1 ETH"));

        governor.queue(targets, values, calldatas, descriptionHash);

        // Esperar el timelock
        vm.warp(block.timestamp + MIN_DELAY + 1);

        // Ejecutar
        uint256 voter1BalanceBefore = voter1.balance;
        governor.execute(targets, values, calldatas, descriptionHash);

        assertEq(voter1.balance, voter1BalanceBefore + 1 ether);
    }

    /* ========== HELPERS ========== */

    function _createSimpleProposal() internal returns (uint256) {
        address[] memory targets = new address[](1);
        targets[0] = address(timelock);

        uint256[] memory values = new uint256[](1);
        values[0] = 0;

        bytes[] memory calldatas = new bytes[](1);
        calldatas[0] = "";

        return governor.propose(targets, values, calldatas, "Simple proposal");
    }
}
