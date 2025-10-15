// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ProposalImplementation.sol";

/**
 * @title ProposalFactory
 * @dev Factory para crear propuestas dinámicas usando el patrón Clone (EIP-1167)
 *
 * Este contrato permite crear smart contracts de propuestas de forma económica
 * usando el patrón Minimal Proxy (Clone). Cada propuesta es un contrato independiente
 * pero comparte la lógica del implementation contract.
 *
 * Ventajas del patrón Clone:
 * - Gas eficiente: ~10x más barato que deployar un contrato completo
 * - Cada propuesta tiene su propia dirección y estado
 * - Comparte la misma lógica del implementation
 * - Ideal para crear múltiples instancias del mismo contrato
 *
 * Flujo de uso:
 * 1. El Governor llama a createProposal()
 * 2. Se crea un clone del implementation
 * 3. Se inicializa con los datos de la propuesta
 * 4. Se retorna la dirección del nuevo contrato
 */
contract ProposalFactory is Ownable {
    using Clones for address;

    /// @notice Dirección del contrato implementation (template)
    address public immutable proposalImplementation;

    /// @notice Dirección del contrato Governor autorizado
    address public governor;

    /// @notice Array con todas las propuestas creadas
    address[] public proposals;

    /// @notice Mapping de ID de propuesta a su dirección de contrato
    mapping(uint256 => address) public proposalContracts;

    /// @notice Contador de propuestas
    uint256 public proposalCount;

    /// @notice Evento cuando se crea una nueva propuesta
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposalContract,
        address indexed proposer,
        string description,
        address target
    );

    /// @notice Evento cuando se actualiza el Governor
    event GovernorUpdated(
        address indexed oldGovernor,
        address indexed newGovernor
    );

    /**
     * @dev Constructor del Factory
     * @param _proposalImplementation Dirección del contrato implementation
     * @param _initialOwner Dirección del owner inicial
     */
    constructor(
        address _proposalImplementation,
        address _initialOwner
    ) Ownable(_initialOwner) {
        require(
            _proposalImplementation != address(0),
            "Invalid implementation"
        );
        proposalImplementation = _proposalImplementation;
    }

    /**
     * @notice Establecer la dirección del Governor
     * @param _governor Dirección del contrato Governor
     * @dev Solo el owner puede llamar esta función
     */
    function setGovernor(address _governor) external onlyOwner {
        require(_governor != address(0), "Invalid governor");

        address oldGovernor = governor;
        governor = _governor;

        emit GovernorUpdated(oldGovernor, _governor);
    }

    /**
     * @notice Crear una nueva propuesta usando el patrón Clone
     * @param proposer Dirección del creador de la propuesta
     * @param description Descripción de la propuesta
     * @param target Dirección destino de la ejecución
     * @param value Valor en ETH a enviar
     * @param data Calldata a ejecutar
     * @return proposalId ID de la propuesta creada
     * @return proposalContract Dirección del contrato de la propuesta
     */
    function createProposal(
        address proposer,
        string memory description,
        address target,
        uint256 value,
        bytes memory data
    ) external returns (uint256 proposalId, address proposalContract) {
        require(
            msg.sender == governor || msg.sender == owner(),
            "Unauthorized"
        );
        require(governor != address(0), "Governor not set");

        // Crear un clone del implementation
        proposalContract = proposalImplementation.clone();

        // Inicializar el clone con los datos de la propuesta
        ProposalImplementation(payable(proposalContract)).initialize(
            governor,
            proposer,
            description,
            target,
            value,
            data
        );

        // Asignar ID y guardar
        proposalId = proposalCount++;
        proposalContracts[proposalId] = proposalContract;
        proposals.push(proposalContract);

        emit ProposalCreated(
            proposalId,
            proposalContract,
            proposer,
            description,
            target
        );

        return (proposalId, proposalContract);
    }

    /**
     * @notice Crear una propuesta con salt predecible (para create2)
     * @param proposer Dirección del creador
     * @param description Descripción
     * @param target Dirección destino
     * @param value Valor en ETH
     * @param data Calldata
     * @param salt Salt para create2
     * @return proposalId ID de la propuesta
     * @return proposalContract Dirección del contrato
     */
    function createProposalDeterministic(
        address proposer,
        string memory description,
        address target,
        uint256 value,
        bytes memory data,
        bytes32 salt
    ) external returns (uint256 proposalId, address proposalContract) {
        require(
            msg.sender == governor || msg.sender == owner(),
            "Unauthorized"
        );
        require(governor != address(0), "Governor not set");

        // Crear un clone determinístico
        proposalContract = proposalImplementation.cloneDeterministic(salt);

        // Inicializar
        ProposalImplementation(payable(proposalContract)).initialize(
            governor,
            proposer,
            description,
            target,
            value,
            data
        );

        // Asignar ID y guardar
        proposalId = proposalCount++;
        proposalContracts[proposalId] = proposalContract;
        proposals.push(proposalContract);

        emit ProposalCreated(
            proposalId,
            proposalContract,
            proposer,
            description,
            target
        );

        return (proposalId, proposalContract);
    }

    /**
     * @notice Predecir la dirección de una propuesta con salt
     * @param salt Salt para create2
     * @return predicted Dirección predicha del clone
     */
    function predictProposalAddress(
        bytes32 salt
    ) external view returns (address predicted) {
        return proposalImplementation.predictDeterministicAddress(salt);
    }

    /**
     * @notice Obtener todas las propuestas creadas
     * @return Array con direcciones de todas las propuestas
     */
    function getAllProposals() external view returns (address[] memory) {
        return proposals;
    }

    /**
     * @notice Obtener la dirección de una propuesta por ID
     * @param proposalId ID de la propuesta
     * @return Dirección del contrato de la propuesta
     */
    function getProposalContract(
        uint256 proposalId
    ) external view returns (address) {
        return proposalContracts[proposalId];
    }

    /**
     * @notice Obtener el total de propuestas creadas
     * @return Número total de propuestas
     */
    function getTotalProposals() external view returns (uint256) {
        return proposals.length;
    }

    /**
     * @notice Obtener datos de una propuesta específica
     * @param proposalId ID de la propuesta
     * @return ProposalData struct con la información completa
     */
    function getProposalData(
        uint256 proposalId
    ) external view returns (ProposalImplementation.ProposalData memory) {
        address proposalContract = proposalContracts[proposalId];
        require(proposalContract != address(0), "Proposal not found");

        return
            ProposalImplementation(payable(proposalContract)).getProposalData();
    }

    /**
     * @notice Verificar si una propuesta puede ejecutarse
     * @param proposalId ID de la propuesta
     * @return Si la propuesta puede ejecutarse
     */
    function canExecuteProposal(
        uint256 proposalId
    ) external view returns (bool) {
        address proposalContract = proposalContracts[proposalId];
        if (proposalContract == address(0)) return false;

        return ProposalImplementation(payable(proposalContract)).canExecute();
    }
}
