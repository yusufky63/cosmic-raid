// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// OpenZeppelin v5 imports
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

/**
 * @title CosmosRaid
 * @notice Stores best scores for up to MAX_PLAYERS players with NO fees (free to play).
 * @dev Adds EIP-712 signed submission: player pays only gas, backend signs off-chain.
 */
contract CosmosRaid is Ownable, ReentrancyGuard, EIP712 {
    using ECDSA for bytes32;

    // -------------------- Types --------------------
    struct PlayerScore {
        uint256 bestScore;
        uint256 bestLevel;
        uint256 bestTime; // seconds
        bool exists;
    }

    // -------------------- Storage --------------------
    mapping(address => PlayerScore) public playerScores;
    address[] public players;

    // Fixed player cap (non-upgradeable by design)
    uint256 public constant MAX_PLAYERS = 100;

    // Fee system for future monetization
    uint256 public feeAmount;
    address public feeRecipient;

    // Authorized backend (signer; separate from owner)
    address public backend;

    // Nonce per player to prevent signature replay
    mapping(address => uint256) public nonces;

    // EIP-712 typehash for score submission
    // keccak256("Score(address player,uint256 score,uint256 level,uint256 time,uint256 nonce,uint256 deadline)")
    bytes32 private constant SCORE_TYPEHASH =
        0x331027cd4c2c23027f8b0afedaa6c9694c133f942bddb5eae743b47b6cf5ba4f;

    // -------------------- Events --------------------
    event ScoreSubmitted(
        address indexed player,
        uint256 score,
        uint256 level,
        uint256 time,
        uint256 feePaid
    );
    event FeeUpdated(uint256 newFeeAmount);
    event FeeRecipientUpdated(address newRecipient);
    event BackendUpdated(address newBackend);

    // -------------------- Errors --------------------
    error MaxPlayersReached();
    error InvalidScore();
    error InsufficientFee();
    error OnlyBackend();
    error InvalidAddress();
    error InvalidSigner();
    error SignatureExpired();
    error SenderMustBePlayer();

    // -------------------- Modifiers --------------------
    modifier onlyBackend() {
        if (msg.sender != backend) revert OnlyBackend();
        _;
    }

    // -------------------- Constructor --------------------
    /**
     * @param _feeAmount Fee (in wei) required per score submission (0 for free)
     * @param _feeRecipient Address to receive collected fees
     * @param _backend Authorized backend address that signs score payloads
     */
    constructor(
        uint256 _feeAmount,
        address _feeRecipient,
        address _backend
    )
        Ownable(msg.sender)
        EIP712("CosmosRaid", "1")
    {
        if (_backend == address(0))
            revert InvalidAddress();
        if (_feeRecipient == address(0))
            revert InvalidAddress();
        
        feeAmount = _feeAmount;
        feeRecipient = _feeRecipient;
        backend = _backend;
    }

    // -------------------- Core Logic --------------------
    /**
     * @notice Submit a new score using backend's EIP-712 signature.
     * @dev Player pays gas and optional fee; contract verifies backend signature.
     *      Tie-breakers when scores are equal: higher level, then lower time.
     */
    function submitScoreWithSig(
        address player,
        uint256 score,
        uint256 level,
        uint256 time,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external payable nonReentrant {
        if (msg.sender != player) revert SenderMustBePlayer();
        if (score == 0) revert InvalidScore();
        if (msg.value < feeAmount) revert InsufficientFee();
        if (block.timestamp > deadline) revert SignatureExpired();

        // Verify signature
        _verifySignature(player, score, level, time, deadline, v, r, s);

        // Consume nonce
        unchecked { nonces[player] = nonces[player] + 1; }

        // Update player score
        _updatePlayerScore(player, score, level, time);

        emit ScoreSubmitted(player, score, level, time, msg.value);
    }

    /**
     * @dev Internal function to verify EIP-712 signature
     */
    function _verifySignature(
        address player,
        uint256 score,
        uint256 level,
        uint256 time,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) internal view {
        bytes32 structHash = _buildStructHash(player, score, level, time, deadline);
        bytes32 digest = _hashTypedDataV4(structHash);
        _verifyRecoveredSigner(digest, v, r, s);
    }

    /**
     * @dev Build EIP-712 struct hash - separate function to reduce stack depth
     */
    function _buildStructHash(
        address player,
        uint256 score,
        uint256 level,
        uint256 time,
        uint256 deadline
    ) internal view returns (bytes32) {
        return keccak256(
            abi.encode(
                SCORE_TYPEHASH,
                player,
                score,
                level,
                time,
                nonces[player],
                deadline
            )
        );
    }

    /**
     * @dev Verify recovered signer matches backend
     */
    function _verifyRecoveredSigner(bytes32 digest, uint8 v, bytes32 r, bytes32 s) internal view {
        address signer = ECDSA.recover(digest, v, r, s);
        if (signer != backend) revert InvalidSigner();
    }

    /**
     * @dev Internal function to update player score
     */
    function _updatePlayerScore(
        address player,
        uint256 score,
        uint256 level,
        uint256 time
    ) internal {
        PlayerScore storage ps = playerScores[player];
        if (!ps.exists) {
            if (players.length >= MAX_PLAYERS) revert MaxPlayersReached();
            players.push(player);
            ps.exists = true;
        }

        if (score > ps.bestScore) {
            ps.bestScore = score;
            ps.bestLevel = level;
            ps.bestTime = time;
        } else if (score == ps.bestScore) {
            if (level > ps.bestLevel || (level == ps.bestLevel && time < ps.bestTime)) {
                ps.bestLevel = level;
                ps.bestTime = time;
            }
        }
    }

    /**
     * @notice Legacy: backend-submitted path (backend pays gas).
     * @dev Still available for maintenance; preferred path is submitScoreWithSig.
     */
    function submitScore(
        address player,
        uint256 score,
        uint256 level,
        uint256 time
    ) external payable onlyBackend nonReentrant {
        if (score == 0) revert InvalidScore();
        if (msg.value < feeAmount) revert InsufficientFee();

        // Update player score using internal function
        _updatePlayerScore(player, score, level, time);

        emit ScoreSubmitted(player, score, level, time, msg.value);
    }

    // -------------------- Views --------------------
    function getPlayerScore(
        address player
    ) external view returns (
        uint256 bestScore, 
        uint256 bestLevel, 
        uint256 bestTime, 
        bool exists
    ) {
        PlayerScore memory s = playerScores[player];
        return (s.bestScore, s.bestLevel, s.bestTime, s.exists);
    }

    function getAllPlayers()
        external
        view
        returns (
            address[] memory, 
            uint256[] memory, 
            uint256[] memory, 
            uint256[] memory
        )
    {
        uint256 length = players.length;
        address[] memory addrs = new address[](length);
        uint256[] memory scores = new uint256[](length);
        uint256[] memory levels = new uint256[](length);
        uint256[] memory times = new uint256[](length);

        for (uint256 i = 0; i < length; i++) {
            address p = players[i];
            PlayerScore memory s = playerScores[p];
            addrs[i] = p;
            scores[i] = s.bestScore;
            levels[i] = s.bestLevel;
            times[i] = s.bestTime;
        }
        return (addrs, scores, levels, times);
    }

    function getLeaderboard(uint256 limit)
        external
        view
        returns (
            address[] memory, 
            uint256[] memory, 
            uint256[] memory, 
            uint256[] memory
        )
    {
        uint256 length = players.length;
        if (limit > length) limit = length;
        
        if (length == 0) {
            // Return empty arrays
            return (
                new address[](0),
                new uint256[](0),
                new uint256[](0),
                new uint256[](0)
            );
        }

        // Get sorted indices to avoid creating multiple arrays
        uint256[] memory sortedIndices = _getSortedPlayerIndices();
        
        // Create result arrays with final limit
        return _createLeaderboardArrays(sortedIndices, limit);
    }

    /**
     * @dev Get sorted player indices based on scores (descending)
     */
    function _getSortedPlayerIndices() internal view returns (uint256[] memory) {
        uint256 length = players.length;
        uint256[] memory indices = new uint256[](length);
        
        // Initialize indices
        for (uint256 i = 0; i < length; i++) {
            indices[i] = i;
        }

        // Bubble sort indices based on player scores
        for (uint256 i = 0; i < length; i++) {
            for (uint256 j = 0; j + 1 < length - i; j++) {
                if (_comparePlayerScores(indices[j], indices[j + 1])) {
                    uint256 temp = indices[j];
                    indices[j] = indices[j + 1];
                    indices[j + 1] = temp;
                }
            }
        }
        
        return indices;
    }

    /**
     * @dev Compare two players by score (returns true if first player is worse)
     */
    function _comparePlayerScores(uint256 index1, uint256 index2) internal view returns (bool) {
        PlayerScore memory s1 = playerScores[players[index1]];
        PlayerScore memory s2 = playerScores[players[index2]];
        
        return (s1.bestScore < s2.bestScore) ||
               (s1.bestScore == s2.bestScore && s1.bestLevel < s2.bestLevel) ||
               (s1.bestScore == s2.bestScore && s1.bestLevel == s2.bestLevel && s1.bestTime > s2.bestTime);
    }

    /**
     * @dev Create final leaderboard arrays from sorted indices
     */
    function _createLeaderboardArrays(uint256[] memory sortedIndices, uint256 limit) 
        internal 
        view 
        returns (
            address[] memory,
            uint256[] memory,
            uint256[] memory,
            uint256[] memory
        ) 
    {
        address[] memory rPlayers = new address[](limit);
        uint256[] memory rScores = new uint256[](limit);
        uint256[] memory rLevels = new uint256[](limit);
        uint256[] memory rTimes = new uint256[](limit);

        // Fill arrays separately to reduce stack depth
        _fillPlayerAddresses(rPlayers, sortedIndices, limit);
        _fillScores(rScores, sortedIndices, limit);
        _fillLevels(rLevels, sortedIndices, limit);
        _fillTimes(rTimes, sortedIndices, limit);
        
        return (rPlayers, rScores, rLevels, rTimes);
    }

    /**
     * @dev Fill player addresses array
     */
    function _fillPlayerAddresses(
        address[] memory rPlayers, 
        uint256[] memory sortedIndices, 
        uint256 limit
    ) internal view {
        for (uint256 i = 0; i < limit; i++) {
            rPlayers[i] = players[sortedIndices[i]];
        }
    }

    /**
     * @dev Fill scores array
     */
    function _fillScores(uint256[] memory arr, uint256[] memory indices, uint256 limit) internal view {
        for (uint256 i = 0; i < limit; i++) {
            arr[i] = playerScores[players[indices[i]]].bestScore;
        }
    }

    /**
     * @dev Fill levels array
     */
    function _fillLevels(uint256[] memory arr, uint256[] memory indices, uint256 limit) internal view {
        for (uint256 i = 0; i < limit; i++) {
            arr[i] = playerScores[players[indices[i]]].bestLevel;
        }
    }

    /**
     * @dev Fill times array
     */
    function _fillTimes(uint256[] memory arr, uint256[] memory indices, uint256 limit) internal view {
        for (uint256 i = 0; i < limit; i++) {
            arr[i] = playerScores[players[indices[i]]].bestTime;
        }
    }


    /// @notice Returns summary stats of the contract.
    function getStats()
        external
        view
        returns (
            uint256 totalPlayers,
            uint256 currentFee,
            address currentFeeRecipient,
            address currentBackend,
            uint256 maxPlayersCap
        )
    {
        return (players.length, feeAmount, feeRecipient, backend, MAX_PLAYERS);
    }

    // -------------------- Admin --------------------
    function updateFeeAmount(uint256 _feeAmount) external onlyOwner {
        feeAmount = _feeAmount;
        emit FeeUpdated(_feeAmount);
    }

    function updateFeeRecipient(address _feeRecipient) external onlyOwner {
        if (_feeRecipient == address(0)) revert InvalidAddress();
        feeRecipient = _feeRecipient;
        emit FeeRecipientUpdated(_feeRecipient);
    }

    function updateBackend(address _backend) external onlyOwner {
        if (_backend == address(0)) revert InvalidAddress();
        backend = _backend;
        emit BackendUpdated(_backend);
    }

    /**
     * @notice Withdraw all collected fees to feeRecipient.
     */
    function withdrawFees() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        (bool ok, ) = feeRecipient.call{value: balance}("");
        require(ok, "Transfer failed");
    }

    // -------------------- Receive Ether --------------------
    receive() external payable {}
}
