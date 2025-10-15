// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DAOToken
 * @dev Token de gobernanza para la DAO con capacidades de votación
 *
 * Este token representa las acciones/shares de los miembros de la DAO.
 * Cada token = 1 voto en las propuestas de gobernanza.
 *
 * Características:
 * - ERC20Votes: Permite delegar votos y crear checkpoints para voting power
 * - Ownable: Solo el owner puede mintear nuevos tokens (añadir accionistas)
 * - Sin límite de supply: El owner puede crear nuevos accionistas cuando quiera
 */
contract DAOToken is ERC20, ERC20Permit, ERC20Votes, Ownable {
    /// @notice Evento cuando se crea un nuevo accionista
    event ShareholderCreated(address indexed shareholder, uint256 shares);

    /// @notice Evento cuando se queman shares de un accionista
    event ShareholderRemoved(address indexed shareholder, uint256 shares);

    /**
     * @dev Constructor del token
     * @param initialOwner Dirección del propietario inicial (será la DAO)
     */
    constructor(
        address initialOwner
    )
        ERC20("CodeCrypto DAO Token", "CCDAO")
        ERC20Permit("CodeCrypto DAO Token")
        Ownable(initialOwner)
    {
        // El constructor está vacío, los tokens se mintean después
    }

    /**
     * @notice Crear un nuevo accionista otorgándole shares (tokens)
     * @param shareholder Dirección del nuevo accionista
     * @param shares Cantidad de shares (tokens) a otorgar
     * @dev Solo el owner puede llamar esta función
     */
    function createShareholder(
        address shareholder,
        uint256 shares
    ) external onlyOwner {
        require(
            shareholder != address(0),
            "DAOToken: invalid shareholder address"
        );
        require(shares > 0, "DAOToken: shares must be greater than 0");

        _mint(shareholder, shares);

        emit ShareholderCreated(shareholder, shares);
    }

    /**
     * @notice Crear múltiples accionistas en una sola transacción
     * @param shareholders Array de direcciones de los nuevos accionistas
     * @param sharesArray Array de shares para cada accionista
     * @dev Solo el owner puede llamar esta función
     */
    function createShareholders(
        address[] calldata shareholders,
        uint256[] calldata sharesArray
    ) external onlyOwner {
        require(
            shareholders.length == sharesArray.length,
            "DAOToken: arrays length mismatch"
        );

        for (uint256 i = 0; i < shareholders.length; i++) {
            require(
                shareholders[i] != address(0),
                "DAOToken: invalid shareholder address"
            );
            require(
                sharesArray[i] > 0,
                "DAOToken: shares must be greater than 0"
            );

            _mint(shareholders[i], sharesArray[i]);

            emit ShareholderCreated(shareholders[i], sharesArray[i]);
        }
    }

    /**
     * @notice Remover shares de un accionista (burn tokens)
     * @param shareholder Dirección del accionista
     * @param shares Cantidad de shares a remover
     * @dev Solo el owner puede llamar esta función
     */
    function removeShareholder(
        address shareholder,
        uint256 shares
    ) external onlyOwner {
        require(
            shareholder != address(0),
            "DAOToken: invalid shareholder address"
        );
        require(shares > 0, "DAOToken: shares must be greater than 0");
        require(
            balanceOf(shareholder) >= shares,
            "DAOToken: insufficient shares"
        );

        _burn(shareholder, shares);

        emit ShareholderRemoved(shareholder, shares);
    }

    /**
     * @notice Obtener el voting power de una dirección en un momento específico
     * @param account Dirección a consultar
     * @param timepoint Momento en el tiempo (block number)
     * @return Voting power de la cuenta en ese momento
     */
    function getPastVotes(
        address account,
        uint256 timepoint
    ) public view override returns (uint256) {
        return super.getPastVotes(account, timepoint);
    }

    /**
     * @notice Obtener el total supply en un momento específico
     * @param timepoint Momento en el tiempo (block number)
     * @return Total supply en ese momento
     */
    function getPastTotalSupply(
        uint256 timepoint
    ) public view override returns (uint256) {
        return super.getPastTotalSupply(timepoint);
    }

    // Funciones override requeridas por Solidity

    function _update(
        address from,
        address to,
        uint256 value
    ) internal override(ERC20, ERC20Votes) {
        super._update(from, to, value);
    }

    function nonces(
        address owner
    ) public view override(ERC20Permit, Nonces) returns (uint256) {
        return super.nonces(owner);
    }

    function clock() public view override returns (uint48) {
        return uint48(block.timestamp);
    }

    // solhint-disable-next-line func-name-mixedcase
    function CLOCK_MODE() public pure override returns (string memory) {
        return "mode=timestamp";
    }
}
