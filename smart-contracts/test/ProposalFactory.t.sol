// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/ProposalFactory.sol";
import "../src/ProposalImplementation.sol";

contract ProposalFactoryTest is Test {
    ProposalFactory public factory;
    ProposalImplementation public implementation;

    address public owner = address(1);
    address public governor = address(2);
    address public proposer = address(3);
    address public target = address(4);

    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposalContract,
        address indexed proposer
    );

    function setUp() public {
        vm.startPrank(owner);

        // Desplegar implementation template
        implementation = new ProposalImplementation();

        // Desplegar factory
        factory = new ProposalFactory(address(implementation), owner);

        // Set governor
        factory.setGovernor(governor);

        vm.stopPrank();
    }

    /* ========== ESTADO INICIAL ========== */

    function test_InitialState() public view {
        assertEq(factory.proposalImplementation(), address(implementation));
        assertEq(factory.governor(), governor);
        assertEq(factory.proposalCount(), 0);
        assertEq(factory.owner(), owner);
    }

    /* ========== SET GOVERNOR ========== */

    function test_SetGovernor() public {
        address newGovernor = address(100);

        vm.prank(owner);
        factory.setGovernor(newGovernor);

        assertEq(factory.governor(), newGovernor);
    }

    function test_RevertWhen_SetGovernor_NotOwner() public {
        vm.prank(proposer);
        vm.expectRevert();
        factory.setGovernor(address(100));
    }

    function test_RevertWhen_SetGovernor_ZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert("Invalid governor");
        factory.setGovernor(address(0));
    }

    /* ========== CREAR PROPUESTAS ========== */

    function test_CreateProposal() public {
        vm.prank(governor);

        (uint256 proposalId, address proposalContract) = factory.createProposal(
            proposer,
            "Test proposal",
            target,
            1 ether,
            ""
        );

        assertEq(proposalId, 0);
        assertTrue(proposalContract != address(0));
        assertEq(factory.proposalCount(), 1);
        assertEq(factory.proposalContracts(0), proposalContract);
    }
    function test_CreateMultipleProposals() public {
        vm.startPrank(governor);

        (uint256 id1, address addr1) = factory.createProposal(
            proposer,
            "Proposal 1",
            target,
            1 ether,
            ""
        );

        (uint256 id2, address addr2) = factory.createProposal(
            proposer,
            "Proposal 2",
            target,
            2 ether,
            ""
        );

        (uint256 id3, address addr3) = factory.createProposal(
            proposer,
            "Proposal 3",
            target,
            3 ether,
            ""
        );

        vm.stopPrank();

        assertEq(id1, 0);
        assertEq(id2, 1);
        assertEq(id3, 2);
        assertTrue(addr1 != addr2 && addr2 != addr3);
        assertEq(factory.proposalCount(), 3);
    }

    function test_RevertWhen_CreateProposal_NotGovernor() public {
        vm.prank(proposer);
        vm.expectRevert("Unauthorized");
        factory.createProposal(proposer, "Test", target, 1 ether, "");
    }

    /* ========== CREAR PROPUESTAS DETERMINÍSTICAS ========== */

    function test_CreateProposalDeterministic() public {
        bytes32 salt = keccak256("unique-salt-1");

        vm.prank(governor);
        (uint256 proposalId, address proposalContract) = factory
            .createProposalDeterministic(
                proposer,
                "Deterministic proposal",
                target,
                1 ether,
                "",
                salt
            );

        assertEq(proposalId, 0);
        assertTrue(proposalContract != address(0));
    }

    function test_PredictProposalAddress() public {
        bytes32 salt = keccak256("predictable-salt");

        // Predecir la dirección
        address predicted = factory.predictProposalAddress(salt);

        // Crear la propuesta
        vm.prank(governor);
        (, address actual) = factory.createProposalDeterministic(
            proposer,
            "Predictable",
            target,
            1 ether,
            "",
            salt
        );

        // La dirección debe coincidir
        assertEq(predicted, actual);
    }

    function test_RevertWhen_CreateProposalDeterministic_SameSalt() public {
        bytes32 salt = keccak256("duplicate-salt");

        vm.startPrank(governor);

        // Primera creación exitosa
        factory.createProposalDeterministic(
            proposer,
            "First",
            target,
            1 ether,
            "",
            salt
        );

        // Segunda creación con el mismo salt debe fallar
        vm.expectRevert();
        factory.createProposalDeterministic(
            proposer,
            "Second",
            target,
            2 ether,
            "",
            salt
        );

        vm.stopPrank();
    }

    /* ========== QUERY PROPUESTAS ========== */

    function test_GetAllProposals() public {
        vm.startPrank(governor);

        factory.createProposal(proposer, "P1", target, 1 ether, "");
        factory.createProposal(proposer, "P2", target, 2 ether, "");
        factory.createProposal(proposer, "P3", target, 3 ether, "");

        vm.stopPrank();

        address[] memory proposals = factory.getAllProposals();

        assertEq(proposals.length, 3);
        assertTrue(proposals[0] != address(0));
        assertTrue(proposals[1] != address(0));
        assertTrue(proposals[2] != address(0));
    }

    function test_GetProposalData() public {
        vm.prank(governor);
        (uint256 proposalId, ) = factory.createProposal(
            proposer,
            "Get data test",
            target,
            5 ether,
            abi.encodeWithSignature(
                "transfer(address,uint256)",
                address(10),
                100
            )
        );

        ProposalImplementation.ProposalData memory data = factory
            .getProposalData(proposalId);

        assertEq(data.proposer, proposer);
        assertEq(data.description, "Get data test");
        assertEq(data.target, target);
        assertEq(data.value, 5 ether);
        assertFalse(data.executed);
    }

    function test_RevertWhen_GetProposalData_InvalidId() public {
        vm.expectRevert("Proposal not found");
        factory.getProposalData(999);
    } /* ========== VERIFICAR SI PUEDE EJECUTARSE ========== */

    function test_CanExecute() public {
        vm.prank(governor);
        (uint256 proposalId, ) = factory.createProposal(
            proposer,
            "Execute test",
            target,
            1 ether,
            ""
        );

        // Inicialmente debe poder ejecutarse (si el governor aprueba)
        bool canExec = factory.canExecuteProposal(proposalId);
        assertTrue(canExec); // Porque no fue ejecutada aún
    }

    function test_CanExecute_InvalidProposal() public view {
        bool canExec = factory.canExecuteProposal(999);
        assertFalse(canExec); // Propuesta inexistente
    }

    /* ========== INTERACCIÓN CON IMPLEMENTATION ========== */

    function test_ProposalImplementation_Initialize() public {
        vm.prank(governor);
        (, address proposalAddr) = factory.createProposal(
            proposer,
            "Init test",
            target,
            1 ether,
            ""
        );

        ProposalImplementation proposal = ProposalImplementation(
            payable(proposalAddr)
        );

        ProposalImplementation.ProposalData memory data = proposal
            .getProposalData();

        assertEq(data.proposer, proposer);
        assertEq(data.description, "Init test");
        assertEq(data.target, target);
        assertEq(data.value, 1 ether);
        assertFalse(data.executed);
    }

    function test_ProposalImplementation_Execute() public {
        // Dar ETH al contrato de propuesta
        vm.deal(address(this), 10 ether);

        vm.prank(governor);
        (, address proposalAddr) = factory.createProposal(
            proposer,
            "Execute test",
            target,
            1 ether,
            ""
        );

        // Enviar ETH al contrato de propuesta
        payable(proposalAddr).transfer(2 ether);

        ProposalImplementation proposal = ProposalImplementation(
            payable(proposalAddr)
        );

        uint256 targetBalanceBefore = target.balance;

        // Solo el governor puede ejecutar
        vm.prank(governor);
        proposal.execute();

        assertEq(target.balance, targetBalanceBefore + 1 ether);

        ProposalImplementation.ProposalData memory data = proposal
            .getProposalData();
        assertTrue(data.executed);
    }

    function test_RevertWhen_Execute_NotGovernor() public {
        vm.prank(governor);
        (, address proposalAddr) = factory.createProposal(
            proposer,
            "Fail test",
            target,
            1 ether,
            ""
        );

        ProposalImplementation proposal = ProposalImplementation(
            payable(proposalAddr)
        );

        vm.prank(proposer); // No es el governor
        vm.expectRevert("ProposalImplementation: only governor");
        proposal.execute();
    }

    function test_RevertWhen_Execute_AlreadyExecuted() public {
        vm.deal(address(this), 10 ether);

        vm.prank(governor);
        (, address proposalAddr) = factory.createProposal(
            proposer,
            "Double exec",
            target,
            1 ether,
            ""
        );

        payable(proposalAddr).transfer(2 ether);

        ProposalImplementation proposal = ProposalImplementation(
            payable(proposalAddr)
        );

        // Primera ejecución
        vm.prank(governor);
        proposal.execute();

        // Segunda ejecución debe fallar
        vm.prank(governor);
        vm.expectRevert("ProposalImplementation: already executed");
        proposal.execute();
    }

    /* ========== GAS EFFICIENCY ========== */

    function test_GasComparison_Clone_vs_Deploy() public {
        // Medir gas de crear con clone
        vm.prank(governor);
        uint256 gasBefore = gasleft();
        factory.createProposal(proposer, "Clone", target, 1 ether, "");
        uint256 gasClone = gasBefore - gasleft();

        // Medir gas de deploy directo
        gasBefore = gasleft();
        new ProposalImplementation();
        uint256 gasDeploy = gasBefore - gasleft();

        // Clone debe usar menos gas
        assertTrue(gasClone < gasDeploy);

        console.log("Gas Clone:", gasClone);
        console.log("Gas Deploy:", gasDeploy);
        console.log("Ahorro:", gasDeploy - gasClone);
    }

    /* ========== EDGE CASES ========== */

    function testFuzz_CreateProposal(
        address _proposer,
        string memory _description,
        address _target,
        uint256 _value
    ) public {
        vm.assume(_proposer != address(0));
        vm.assume(_target != address(0));
        vm.assume(_value < type(uint128).max);

        vm.prank(governor);
        (uint256 proposalId, address proposalAddr) = factory.createProposal(
            _proposer,
            _description,
            _target,
            _value,
            ""
        );

        assertEq(proposalId, factory.proposalCount() - 1);
        assertTrue(proposalAddr != address(0));
    }

    receive() external payable {}
}
