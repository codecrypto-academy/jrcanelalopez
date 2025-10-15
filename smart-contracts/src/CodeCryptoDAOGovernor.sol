// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";

/**
 * @title CodeCryptoDAOGovernor
 * @dev Contrato principal de gobernanza de la DAO
 *
 * Este contrato maneja todo el sistema de propuestas y votación:
 * - Crear propuestas (con descripción, destinatario, monto, función a ejecutar)
 * - Votar propuestas (a favor, en contra, abstención)
 * - Ejecutar propuestas aprobadas
 * - Cancelar propuestas
 *
 * Parámetros de gobernanza:
 * - Voting Delay: 1 bloque (tiempo antes de que empiece la votación)
 * - Voting Period: 50400 bloques (~1 semana con bloques de 12 seg)
 * - Proposal Threshold: 1000 tokens (mínimo para crear propuestas)
 * - Quorum: 4% del total supply (mínimo para que sea válida)
 * - Timelock: 2 días (delay antes de ejecutar propuesta aprobada)
 */
contract CodeCryptoDAOGovernor is
    Governor,
    GovernorSettings,
    GovernorCountingSimple,
    GovernorVotes,
    GovernorVotesQuorumFraction,
    GovernorTimelockControl
{
    /// @notice Estructura de una propuesta extendida con metadata
    struct ProposalMetadata {
        string description; // Descripción de la propuesta
        address proposer; // Quien creó la propuesta
        uint256 createdAt; // Timestamp de creación
        bool executed; // Si ya fue ejecutada
        bool canceled; // Si fue cancelada
    }

    /// @notice Mapping de ID de propuesta a su metadata
    mapping(uint256 => ProposalMetadata) public proposalMetadata;

    /// @notice Evento cuando se crea una nueva propuesta
    event ProposalCreatedWithMetadata(
        uint256 indexed proposalId,
        address indexed proposer,
        string description,
        uint256 createdAt
    );

    /**
     * @dev Constructor del Governor
     * @param _token Dirección del token de votación (DAOToken)
     * @param _timelock Dirección del contrato Timelock
     */
    constructor(
        IVotes _token,
        TimelockController _timelock
    )
        Governor("CodeCrypto DAO Governor")
        GovernorSettings(
            1, // voting delay: 1 bloque
            50400, // voting period: ~1 semana
            1000e18 // proposal threshold: 1000 tokens
        )
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(4) // 4% quorum
        GovernorTimelockControl(_timelock)
    {}

    /**
     * @notice Crear una propuesta con metadata extendida
     * @param targets Array de contratos a llamar
     * @param values Array de valores de ETH a enviar
     * @param calldatas Array de calldatas a ejecutar
     * @param description Descripción de la propuesta
     * @return proposalId ID de la propuesta creada
     */
    function propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) public override(Governor) returns (uint256) {
        uint256 proposalId = super.propose(
            targets,
            values,
            calldatas,
            description
        );

        // Guardar metadata
        proposalMetadata[proposalId] = ProposalMetadata({
            description: description,
            proposer: msg.sender,
            createdAt: block.timestamp,
            executed: false,
            canceled: false
        });

        emit ProposalCreatedWithMetadata(
            proposalId,
            msg.sender,
            description,
            block.timestamp
        );

        return proposalId;
    }

    /**
     * @notice Crear una propuesta simple (transferencia de ETH)
     * @param recipient Destinatario de los fondos
     * @param amount Monto a transferir (en wei)
     * @param description Descripción de la propuesta
     * @return proposalId ID de la propuesta creada
     */
    function proposeTransfer(
        address recipient,
        uint256 amount,
        string memory description
    ) external returns (uint256) {
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be greater than 0");

        address[] memory targets = new address[](1);
        uint256[] memory values = new uint256[](1);
        bytes[] memory calldatas = new bytes[](1);

        targets[0] = recipient;
        values[0] = amount;
        calldatas[0] = ""; // Transferencia simple, sin calldata

        return propose(targets, values, calldatas, description);
    }

    /**
     * @notice Obtener el estado de una propuesta con metadata
     * @param proposalId ID de la propuesta
     * @return ProposalState Estado de la propuesta
     */
    function getProposalState(
        uint256 proposalId
    ) external view returns (ProposalState) {
        return state(proposalId);
    }

    /**
     * @notice Obtener metadata de una propuesta
     * @param proposalId ID de la propuesta
     * @return Metadata de la propuesta
     */
    function getProposalMetadata(
        uint256 proposalId
    ) external view returns (ProposalMetadata memory) {
        return proposalMetadata[proposalId];
    }

    // Funciones override requeridas por Solidity

    function votingDelay()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.votingDelay();
    }

    function votingPeriod()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.votingPeriod();
    }

    function quorum(
        uint256 blockNumber
    )
        public
        view
        override(Governor, GovernorVotesQuorumFraction)
        returns (uint256)
    {
        return super.quorum(blockNumber);
    }

    function state(
        uint256 proposalId
    )
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (ProposalState)
    {
        return super.state(proposalId);
    }

    function proposalNeedsQueuing(
        uint256 proposalId
    ) public view override(Governor, GovernorTimelockControl) returns (bool) {
        return super.proposalNeedsQueuing(proposalId);
    }

    function proposalThreshold()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.proposalThreshold();
    }

    function _queueOperations(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) returns (uint48) {
        return
            super._queueOperations(
                proposalId,
                targets,
                values,
                calldatas,
                descriptionHash
            );
    }

    function _executeOperations(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) {
        proposalMetadata[proposalId].executed = true;
        super._executeOperations(
            proposalId,
            targets,
            values,
            calldatas,
            descriptionHash
        );
    }

    function _cancel(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) returns (uint256) {
        uint256 proposalId = super._cancel(
            targets,
            values,
            calldatas,
            descriptionHash
        );
        proposalMetadata[proposalId].canceled = true;
        return proposalId;
    }

    function _executor()
        internal
        view
        override(Governor, GovernorTimelockControl)
        returns (address)
    {
        return super._executor();
    }

    /**
     * @notice Recibir ETH en el contrato
     */
    receive() external payable virtual override {}
}
