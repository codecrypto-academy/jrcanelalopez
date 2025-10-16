// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Supply Chain Tracker Contract
/// @author Supply Chain Team
/// @notice Manages traceability in supply chains using blockchain
/// @dev Implements role-based access control and token system for tracking
contract SupplyChain {
    // ============ Enums ============

    /// @notice User status in the system
    enum UserStatus {
        Pending,    // Awaiting admin approval
        Approved,   // Can operate in the system
        Rejected,   // Rejected by admin
        Canceled    // User canceled registration
    }

    /// @notice Transfer status
    enum TransferStatus {
        Pending,    // Awaiting acceptance
        Accepted,   // Transfer completed
        Rejected    // Transfer rejected by recipient
    }

    // ============ Structs ============

    /// @notice Token structure representing products or raw materials
    struct Token {
        uint256 id;
        address creator;
        string name;
        uint256 totalSupply;
        string features;        // JSON metadata
        uint256 parentId;       // 0 for raw materials
        uint256 dateCreated;
        mapping(address => uint256) balance;
    }

    /// @notice Transfer structure for pending transfers
    struct Transfer {
        uint256 id;
        address from;
        address to;
        uint256 tokenId;
        uint256 dateCreated;
        uint256 amount;
        TransferStatus status;
    }

    /// @notice User structure with role and status
    struct User {
        uint256 id;
        address userAddress;
        string role;            // Producer, Factory, Retailer, Consumer
        UserStatus status;
    }

    // ============ State Variables ============

    /// @notice Contract administrator (deployer)
    address public admin;

    /// @notice Counters for IDs
    uint256 public nextTokenId = 1;
    uint256 public nextTransferId = 1;
    uint256 public nextUserId = 1;

    /// @notice Mappings
    mapping(uint256 => Token) public tokens;
    mapping(uint256 => Transfer) public transfers;
    mapping(uint256 => User) public users;
    mapping(address => uint256) public addressToUserId;

    /// @notice Track user's tokens (for efficient querying)
    mapping(address => uint256[]) private userTokens;

    /// @notice Track user's transfers (for efficient querying)
    mapping(address => uint256[]) private userTransfers;

    // ============ Events ============

    /// @notice Emitted when a new token is created
    event TokenCreated(
        uint256 indexed tokenId,
        address indexed creator,
        string name,
        uint256 totalSupply
    );

    /// @notice Emitted when a transfer is requested
    event TransferRequested(
        uint256 indexed transferId,
        address indexed from,
        address indexed to,
        uint256 tokenId,
        uint256 amount
    );

    /// @notice Emitted when a transfer is accepted
    event TransferAccepted(uint256 indexed transferId);

    /// @notice Emitted when a transfer is rejected
    event TransferRejected(uint256 indexed transferId);

    /// @notice Emitted when a user requests a role
    event UserRoleRequested(address indexed user, string role);

    /// @notice Emitted when user status changes
    event UserStatusChanged(address indexed user, UserStatus status);

    // ============ Custom Errors ============

    error UserNotApproved();
    error InvalidParentId();
    error OnlyAdmin();
    error UserAlreadyRegistered();
    error InvalidRole();
    error InsufficientBalance();
    error InvalidAddress();
    error InvalidAmount();
    error TokenDoesNotExist();
    error TransferDoesNotExist();
    error InvalidRoleFlow();
    error TransferNotPending();
    error NotTransferRecipient();

    // ============ Modifiers ============

    /// @notice Only contract admin can call
    modifier onlyAdmin() {
        if (msg.sender != admin) revert OnlyAdmin();
        _;
    }

    /// @notice Only approved users can call
    modifier onlyApproved() {
        uint256 userId = addressToUserId[msg.sender];
        if (userId == 0 || users[userId].status != UserStatus.Approved) {
            revert UserNotApproved();
        }
        _;
    }

    // ============ Constructor ============

    /// @notice Initialize contract with deployer as admin
    constructor() {
        admin = msg.sender;
    }

    // ============ User Management Functions ============

    /// @notice Request a role in the system
    /// @dev Creates user with Pending status, awaiting admin approval
    /// @param role Role to request: "Producer", "Factory", "Retailer", or "Consumer"
    function requestUserRole(string calldata role) external {
        if (addressToUserId[msg.sender] != 0) revert UserAlreadyRegistered();

        // Validate role
        bytes32 roleHash = keccak256(bytes(role));
        if (
            roleHash != keccak256(bytes("Producer")) &&
            roleHash != keccak256(bytes("Factory")) &&
            roleHash != keccak256(bytes("Retailer")) &&
            roleHash != keccak256(bytes("Consumer"))
        ) {
            revert InvalidRole();
        }

        uint256 userId = nextUserId++;
        users[userId] = User({
            id: userId,
            userAddress: msg.sender,
            role: role,
            status: UserStatus.Pending
        });

        addressToUserId[msg.sender] = userId;

        emit UserRoleRequested(msg.sender, role);
    }

    /// @notice Change user status (admin only)
    /// @param userAddress Address of the user
    /// @param newStatus New status to set
    function changeStatusUser(address userAddress, UserStatus newStatus) external onlyAdmin {
        if (userAddress == address(0)) revert InvalidAddress();

        uint256 userId = addressToUserId[userAddress];
        if (userId == 0) revert UserNotApproved();

        users[userId].status = newStatus;

        emit UserStatusChanged(userAddress, newStatus);
    }

    /// @notice Get user information
    /// @param userAddress Address of the user
    /// @return user User struct with all information
    function getUserInfo(address userAddress) external view returns (User memory user) {
        uint256 userId = addressToUserId[userAddress];
        if (userId == 0) revert UserNotApproved();

        return users[userId];
    }

    /// @notice Check if address is admin
    /// @param userAddress Address to check
    /// @return True if address is admin
    function isAdmin(address userAddress) external view returns (bool) {
        return userAddress == admin;
    }

    // ============ Token Management Functions ============

    /// @notice Create a new token
    /// @dev Only approved users can create tokens
    /// @param name Token name
    /// @param totalSupply Total supply of tokens
    /// @param features JSON metadata
    /// @param parentId Parent token ID (0 for raw materials)
    /// @return tokenId ID of created token
    function createToken(
        string calldata name,
        uint256 totalSupply,
        string calldata features,
        uint256 parentId
    ) external onlyApproved returns (uint256) {
        if (totalSupply == 0) revert InvalidAmount();

        uint256 userId = addressToUserId[msg.sender];
        string memory userRole = users[userId].role;

        // Validate parentId based on role
        bytes32 roleHash = keccak256(bytes(userRole));
        if (roleHash == keccak256(bytes("Producer"))) {
            if (parentId != 0) revert InvalidParentId();
        } else {
            if (parentId == 0 || parentId >= nextTokenId) revert InvalidParentId();
        }

        uint256 tokenId = nextTokenId++;
        Token storage token = tokens[tokenId];
        token.id = tokenId;
        token.creator = msg.sender;
        token.name = name;
        token.totalSupply = totalSupply;
        token.features = features;
        token.parentId = parentId;
        token.dateCreated = block.timestamp;
        token.balance[msg.sender] = totalSupply;

        userTokens[msg.sender].push(tokenId);

        emit TokenCreated(tokenId, msg.sender, name, totalSupply);

        return tokenId;
    }

    /// @notice Get token information
    /// @param tokenId ID of the token
    /// @return id Token ID
    /// @return creator Token creator address
    /// @return name Token name
    /// @return totalSupply Total supply of tokens
    /// @return features JSON metadata
    /// @return parentId Parent token ID
    /// @return dateCreated Timestamp of creation
    function getToken(uint256 tokenId) external view returns (
        uint256 id,
        address creator,
        string memory name,
        uint256 totalSupply,
        string memory features,
        uint256 parentId,
        uint256 dateCreated
    ) {
        if (tokenId == 0 || tokenId >= nextTokenId) revert TokenDoesNotExist();

        Token storage token = tokens[tokenId];
        return (
            token.id,
            token.creator,
            token.name,
            token.totalSupply,
            token.features,
            token.parentId,
            token.dateCreated
        );
    }

    /// @notice Get token balance for a user
    /// @param tokenId ID of the token
    /// @param userAddress Address of the user
    /// @return Balance of the user for this token
    function getTokenBalance(uint256 tokenId, address userAddress) external view returns (uint256) {
        if (tokenId == 0 || tokenId >= nextTokenId) revert TokenDoesNotExist();
        return tokens[tokenId].balance[userAddress];
    }

    /// @notice Get all token IDs owned by a user
    /// @param userAddress Address of the user
    /// @return Array of token IDs
    function getUserTokens(address userAddress) external view returns (uint256[] memory) {
        return userTokens[userAddress];
    }

    // ============ Transfer Management Functions ============

    /// @notice Initiate a transfer to another user
    /// @dev Transfer requires acceptance from recipient
    /// @param to Recipient address
    /// @param tokenId Token ID to transfer
    /// @param amount Amount to transfer
    function transfer(address to, uint256 tokenId, uint256 amount) external onlyApproved {
        if (to == address(0) || to == msg.sender) revert InvalidAddress();
        if (amount == 0) revert InvalidAmount();
        if (tokenId == 0 || tokenId >= nextTokenId) revert TokenDoesNotExist();
        if (tokens[tokenId].balance[msg.sender] < amount) revert InsufficientBalance();

        // Validate role flow
        uint256 fromUserId = addressToUserId[msg.sender];
        uint256 toUserId = addressToUserId[to];

        if (toUserId == 0 || users[toUserId].status != UserStatus.Approved) {
            revert UserNotApproved();
        }

        string memory fromRole = users[fromUserId].role;
        string memory toRole = users[toUserId].role;

        _validateRoleFlow(fromRole, toRole);

        // Create pending transfer
        uint256 transferId = nextTransferId++;
        transfers[transferId] = Transfer({
            id: transferId,
            from: msg.sender,
            to: to,
            tokenId: tokenId,
            dateCreated: block.timestamp,
            amount: amount,
            status: TransferStatus.Pending
        });

        userTransfers[msg.sender].push(transferId);
        userTransfers[to].push(transferId);

        emit TransferRequested(transferId, msg.sender, to, tokenId, amount);
    }

    /// @notice Accept a pending transfer
    /// @param transferId ID of the transfer
    function acceptTransfer(uint256 transferId) external {
        if (transferId == 0 || transferId >= nextTransferId) revert TransferDoesNotExist();

        Transfer storage t = transfers[transferId];

        if (t.status != TransferStatus.Pending) revert TransferNotPending();
        if (t.to != msg.sender) revert NotTransferRecipient();

        // Execute transfer
        tokens[t.tokenId].balance[t.from] -= t.amount;
        tokens[t.tokenId].balance[t.to] += t.amount;

        // Add token to recipient's list if not already there
        if (tokens[t.tokenId].balance[t.to] == t.amount) {
            userTokens[t.to].push(t.tokenId);
        }

        t.status = TransferStatus.Accepted;

        emit TransferAccepted(transferId);
    }

    /// @notice Reject a pending transfer
    /// @param transferId ID of the transfer
    function rejectTransfer(uint256 transferId) external {
        if (transferId == 0 || transferId >= nextTransferId) revert TransferDoesNotExist();

        Transfer storage t = transfers[transferId];

        if (t.status != TransferStatus.Pending) revert TransferNotPending();
        if (t.to != msg.sender) revert NotTransferRecipient();

        t.status = TransferStatus.Rejected;

        emit TransferRejected(transferId);
    }

    /// @notice Get transfer information
    /// @param transferId ID of the transfer
    /// @return Transfer struct
    function getTransfer(uint256 transferId) external view returns (Transfer memory) {
        if (transferId == 0 || transferId >= nextTransferId) revert TransferDoesNotExist();
        return transfers[transferId];
    }

    /// @notice Get all transfer IDs for a user
    /// @param userAddress Address of the user
    /// @return Array of transfer IDs
    function getUserTransfers(address userAddress) external view returns (uint256[] memory) {
        return userTransfers[userAddress];
    }

    // ============ Internal Functions ============

    /// @notice Validate that transfer follows correct role flow
    /// @param fromRole Role of sender
    /// @param toRole Role of recipient
    function _validateRoleFlow(string memory fromRole, string memory toRole) internal pure {
        bytes32 fromHash = keccak256(bytes(fromRole));
        bytes32 toHash = keccak256(bytes(toRole));

        if (fromHash == keccak256(bytes("Producer"))) {
            if (toHash != keccak256(bytes("Factory"))) revert InvalidRoleFlow();
        } else if (fromHash == keccak256(bytes("Factory"))) {
            if (toHash != keccak256(bytes("Retailer"))) revert InvalidRoleFlow();
        } else if (fromHash == keccak256(bytes("Retailer"))) {
            if (toHash != keccak256(bytes("Consumer"))) revert InvalidRoleFlow();
        } else {
            // Consumer cannot transfer
            revert InvalidRoleFlow();
        }
    }
}
