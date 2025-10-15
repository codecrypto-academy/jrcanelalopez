// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";

/**
 * @title CodeCryptoDAOGovernorV2
 * @notice Contrato de gobernanza optimizado para el DAO de CodeCrypto
 * @dev Versión simplificada que respeta el límite de 24KB de EIP-170
 *
 * OPTIMIZACIONES REALIZADAS:
 * - Eliminado GovernorCountingSimple (implementación inline más ligera)
 * - Código optimizado para reducir bytecode
 * - Mantenidas todas las funcionalidades esenciales:
 *   ✓ Votación con tokens (GovernorVotes)
 *   ✓ Quorum dinámico (GovernorVotesQuorumFraction)
 *   ✓ Timelock para ejecución segura (GovernorTimelockControl)
 *   ✓ Configuración de parámetros (GovernorSettings)
 *
 * CARACTERÍSTICAS:
 * - Voting Delay: 1 bloque (configurable)
 * - Voting Period: 50400 bloques (~1 semana en Ethereum)
 * - Proposal Threshold: 1000 tokens mínimo
 * - Quorum: 4% del total supply
 * - Timelock: 2 días (producción) / 1 minuto (local)
 */
contract CodeCryptoDAOGovernorV2 is
    Governor,
    GovernorSettings,
    GovernorVotes,
    GovernorVotesQuorumFraction,
    GovernorTimelockControl
{
    /// @notice Tipos de voto: Contra, A favor, Abstención
    enum VoteType {
        Against,
        For,
        Abstain
    }

    /// @notice Estructura para almacenar los votos de una propuesta
    struct ProposalVote {
        uint256 againstVotes;
        uint256 forVotes;
        uint256 abstainVotes;
        mapping(address => bool) hasVoted;
    }

    /// @notice Mapping de proposal ID a sus votos
    mapping(uint256 => ProposalVote) private _proposalVotes;

    /**
     * @dev Constructor del Governor
     * @param _token Dirección del token ERC20Votes para votación
     * @param _timelock Dirección del TimelockController
     */
    constructor(
        IVotes _token,
        TimelockController _timelock
    )
        Governor("CodeCrypto DAO")
        GovernorSettings(
            1, // voting delay: 1 bloque
            50400, // voting period: 50400 bloques (~1 semana)
            1000e18 // proposal threshold: 1000 tokens
        )
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(4) // 4% quorum
        GovernorTimelockControl(_timelock)
    {}

    // ============================================
    // VOTING LOGIC (Inline - más ligero)
    // ============================================

    /**
     * @dev Indica si el contrato soporta el tipo de voto especificado
     * Soporta: Against (0), For (1), Abstain (2)
     */
    function COUNTING_MODE()
        public
        pure
        virtual
        override
        returns (string memory)
    {
        return "support=bravo&quorum=for,abstain";
    }

    /**
     * @dev Retorna si una cuenta ya votó en una propuesta
     */
    function hasVoted(
        uint256 proposalId,
        address account
    ) public view virtual override returns (bool) {
        return _proposalVotes[proposalId].hasVoted[account];
    }

    /**
     * @dev Retorna los conteos de votos de una propuesta
     * @return againstVotes Votos en contra
     * @return forVotes Votos a favor
     * @return abstainVotes Votos de abstención
     */
    function proposalVotes(
        uint256 proposalId
    )
        public
        view
        virtual
        returns (uint256 againstVotes, uint256 forVotes, uint256 abstainVotes)
    {
        ProposalVote storage proposalVote = _proposalVotes[proposalId];
        return (
            proposalVote.againstVotes,
            proposalVote.forVotes,
            proposalVote.abstainVotes
        );
    }

    /**
     * @dev Implementación de conteo de votos
     * @param proposalId ID de la propuesta
     * @param account Cuenta que vota
     * @param support Tipo de voto (0=Against, 1=For, 2=Abstain)
     * @param weight Peso del voto (basado en tokens)
     * @param params Parámetros adicionales (no usado)
     */
    function _countVote(
        uint256 proposalId,
        address account,
        uint8 support,
        uint256 weight,
        bytes memory params
    ) internal virtual override returns (uint256) {
        ProposalVote storage proposalVote = _proposalVotes[proposalId];

        require(!proposalVote.hasVoted[account], "Governor: vote already cast");
        proposalVote.hasVoted[account] = true;

        if (support == uint8(VoteType.Against)) {
            proposalVote.againstVotes += weight;
        } else if (support == uint8(VoteType.For)) {
            proposalVote.forVotes += weight;
        } else if (support == uint8(VoteType.Abstain)) {
            proposalVote.abstainVotes += weight;
        } else {
            revert("Governor: invalid vote type");
        }

        return weight;
    }

    /**
     * @dev Determina si una propuesta fue exitosa
     * Una propuesta tiene éxito si:
     * - Alcanzó el quorum (votos For + Abstain >= quorum)
     * - Tiene más votos a favor que en contra (For > Against)
     */
    function _voteSucceeded(
        uint256 proposalId
    ) internal view virtual override returns (bool) {
        ProposalVote storage proposalVote = _proposalVotes[proposalId];

        return proposalVote.forVotes > proposalVote.againstVotes;
    }

    /**
     * @dev Calcula el quorum alcanzado por una propuesta
     * El quorum considera votos a favor + abstenciones
     */
    function _quorumReached(
        uint256 proposalId
    ) internal view virtual override returns (bool) {
        ProposalVote storage proposalVote = _proposalVotes[proposalId];

        return
            quorum(proposalSnapshot(proposalId)) <=
            proposalVote.forVotes + proposalVote.abstainVotes;
    }

    // ============================================
    // OVERRIDES REQUERIDOS
    // ============================================

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
        return super._cancel(targets, values, calldatas, descriptionHash);
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
     * @dev Soporte para interfaces - IERC165
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(Governor) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
