// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ProposalImplementation
 * @dev Contrato base que representa una propuesta ejecutable
 *
 * Este contrato actúa como template para crear propuestas dinámicas usando el patrón Clone.
 * Cada propuesta clonada puede tener su propia lógica de ejecución.
 *
 * Casos de uso:
 * - Transferencias de fondos con condiciones específicas
 * - Cambios en parámetros de la DAO
 * - Integración con contratos externos
 * - Ejecución de lógica personalizada post-aprobación
 */
contract ProposalImplementation {
    /// @notice Struct que define los datos de una propuesta
    struct ProposalData {
        address proposer; // Quien creó la propuesta
        string description; // Descripción
        address target; // Contrato/dirección destino
        uint256 value; // Valor en ETH
        bytes data; // Calldata a ejecutar
        uint256 createdAt; // Timestamp de creación
        bool executed; // Si ya fue ejecutada
        address executor; // Quien la ejecutó
    }

    /// @notice Datos de esta propuesta
    ProposalData public proposal;

    /// @notice Dirección del Governor que puede ejecutar esta propuesta
    address public governor;

    /// @notice Indica si el contrato ya fue inicializado
    bool public initialized;

    /// @notice Evento cuando se ejecuta la propuesta
    event ProposalExecuted(
        address indexed executor,
        address indexed target,
        uint256 value,
        bytes data,
        uint256 timestamp
    );

    /// @notice Evento cuando se inicializa la propuesta
    event ProposalInitialized(
        address indexed proposer,
        address indexed target,
        string description
    );

    /**
     * @dev Modificador para asegurar que solo el governor puede ejecutar
     */
    modifier onlyGovernor() {
        require(
            msg.sender == governor,
            "ProposalImplementation: only governor"
        );
        _;
    }

    /**
     * @dev Modificador para asegurar que no se inicialice dos veces
     */
    modifier notInitialized() {
        require(!initialized, "ProposalImplementation: already initialized");
        _;
        initialized = true;
    }

    /**
     * @notice Inicializar la propuesta (llamado por el factory)
     * @param _governor Dirección del contrato Governor
     * @param _proposer Dirección del creador de la propuesta
     * @param _description Descripción de la propuesta
     * @param _target Dirección destino
     * @param _value Valor en ETH
     * @param _data Calldata a ejecutar
     */
    function initialize(
        address _governor,
        address _proposer,
        string memory _description,
        address _target,
        uint256 _value,
        bytes memory _data
    ) external notInitialized {
        require(_governor != address(0), "Invalid governor");
        require(_proposer != address(0), "Invalid proposer");
        require(_target != address(0), "Invalid target");

        governor = _governor;

        proposal = ProposalData({
            proposer: _proposer,
            description: _description,
            target: _target,
            value: _value,
            data: _data,
            createdAt: block.timestamp,
            executed: false,
            executor: address(0)
        });

        emit ProposalInitialized(_proposer, _target, _description);
    }

    /**
     * @notice Ejecutar la propuesta
     * @dev Solo puede ser llamada por el Governor
     * @return success Si la ejecución fue exitosa
     * @return returndata Datos retornados por la llamada
     */
    function execute()
        external
        onlyGovernor
        returns (bool success, bytes memory returndata)
    {
        require(!proposal.executed, "ProposalImplementation: already executed");

        proposal.executed = true;
        proposal.executor = msg.sender;

        // Ejecutar la llamada al target
        (success, returndata) = proposal.target.call{value: proposal.value}(
            proposal.data
        );

        require(success, "ProposalImplementation: execution failed");

        emit ProposalExecuted(
            msg.sender,
            proposal.target,
            proposal.value,
            proposal.data,
            block.timestamp
        );

        return (success, returndata);
    }

    /**
     * @notice Obtener los datos completos de la propuesta
     * @return ProposalData struct con toda la información
     */
    function getProposalData() external view returns (ProposalData memory) {
        return proposal;
    }

    /**
     * @notice Verificar si la propuesta está lista para ejecutar
     * @return Si puede ser ejecutada
     */
    function canExecute() external view returns (bool) {
        return initialized && !proposal.executed;
    }

    /**
     * @notice Recibir ETH
     */
    receive() external payable {}
}
