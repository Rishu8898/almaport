// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AlumniVerification
 * @dev Smart contract for storing and verifying alumni credentials on blockchain
 * @author Blockchain-Based Alumni Verification Portal
 */
contract AlumniVerification {
    // ============================================
    // STATE VARIABLES
    // ============================================

    /// @dev Owner of the contract (deployer)
    address public owner;

    /// @dev Mapping to track authorized issuers (college admins)
    mapping(address => bool) public authorizedIssuers;

    /// @dev Mapping to track authorized issuer names
    mapping(address => string) public issuerNames;

    /// @dev Structure to store alumni record
    struct AlumniRecord {
        string certId; // Certificate ID (unique)
        bytes32 dataHash; // Hash of alumni data
        address issuer; // Address of the issuer
        uint256 timestamp; // Block timestamp when added
        uint256 blockNumber; // Block number when added
        bool exists; // Flag to check if record exists
        string issuerName; // Name of the issuing institution
        bool isRevoked; // Flag to check if record is revoked
    }

    /// @dev Mapping from certId to AlumniRecord
    mapping(string => AlumniRecord) public records;

    /// @dev Array to store all certificate IDs
    string[] public certificateIds;

    /// @dev Counter for total records
    uint256 public totalRecords;

    // ============================================
    // EVENTS
    // ============================================

    /// @dev Emitted when a new alumni record is added
    event AlumniRecordAdded(
        string indexed certId,
        bytes32 dataHash,
        address indexed issuer,
        string issuerName,
        uint256 timestamp,
        uint256 blockNumber
    );

    /// @dev Emitted when an issuer is authorized
    event IssuerAuthorized(address indexed issuer, string name);

    /// @dev Emitted when an issuer is revoked
    event IssuerRevoked(address indexed issuer);

    /// @dev Emitted when a record is verified
    event RecordVerified(string indexed certId, bool isValid);

    /// @dev Emitted when a record is revoked
    event RecordRevoked(string indexed certId, address indexed revokedBy, uint256 timestamp);

    // ============================================
    // MODIFIERS
    // ============================================

    /// @dev Modifier to check if caller is owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    /// @dev Modifier to check if caller is authorized issuer
    modifier onlyAuthorizedIssuer() {
        require(authorizedIssuers[msg.sender], "Not an authorized issuer");
        _;
    }

    /// @dev Modifier to check if certificate ID doesn't already exist
    modifier certIdNotExists(string memory _certId) {
        require(!records[_certId].exists, "Certificate ID already exists");
        _;
    }

    /// @dev Modifier to check if certificate ID exists
    modifier certIdExists(string memory _certId) {
        require(records[_certId].exists, "Certificate ID does not exist");
        _;
    }

    // ============================================
    // CONSTRUCTOR
    // ============================================

    /**
     * @dev Constructor sets the contract deployer as owner and first authorized issuer
     * @param _institutionName Name of the institution deploying the contract
     */
    constructor(string memory _institutionName) {
        owner = msg.sender;
        authorizedIssuers[msg.sender] = true;
        issuerNames[msg.sender] = _institutionName;
        emit IssuerAuthorized(msg.sender, _institutionName);
    }

    // ============================================
    // ADMIN FUNCTIONS
    // ============================================

    /**
     * @dev Authorize a new issuer (college admin)
     * @param _issuer Address of the issuer to authorize
     * @param _name Name of the institution
     */
    function authorizeIssuer(address _issuer, string memory _name) external onlyOwner {
        require(_issuer != address(0), "Invalid issuer address");
        require(!authorizedIssuers[_issuer], "Issuer already authorized");

        authorizedIssuers[_issuer] = true;
        issuerNames[_issuer] = _name;

        emit IssuerAuthorized(_issuer, _name);
    }

    /**
     * @dev Revoke an issuer's authorization
     * @param _issuer Address of the issuer to revoke
     */
    function revokeIssuer(address _issuer) external onlyOwner {
        require(authorizedIssuers[_issuer], "Issuer not authorized");
        require(_issuer != owner, "Cannot revoke owner");

        authorizedIssuers[_issuer] = false;

        emit IssuerRevoked(_issuer);
    }

    /**
     * @dev Transfer ownership to a new address
     * @param _newOwner Address of the new owner
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid new owner address");
        require(_newOwner != owner, "Already the owner");

        owner = _newOwner;

        // Authorize new owner as issuer if not already
        if (!authorizedIssuers[_newOwner]) {
            authorizedIssuers[_newOwner] = true;
        }
    }

    // ============================================
    // CORE FUNCTIONS
    // ============================================

    /**
     * @dev Add a new alumni record to the blockchain
     * @param _certId Unique certificate ID
     * @param _dataHash Hash of alumni data (name, roll, degree, branch, year)
     * @return success Boolean indicating success
     * @return timestamp Timestamp when record was added
     * @return blockNumber Block number when record was added
     */
    function addAlumniRecord(string memory _certId, bytes32 _dataHash)
        external
        onlyAuthorizedIssuer
        certIdNotExists(_certId)
        returns (bool success, uint256 timestamp, uint256 blockNumber)
    {
        require(bytes(_certId).length > 0, "Certificate ID cannot be empty");
        require(_dataHash != bytes32(0), "Data hash cannot be empty");

        // Create new record
        AlumniRecord memory newRecord = AlumniRecord({
            certId: _certId,
            dataHash: _dataHash,
            issuer: msg.sender,
            timestamp: block.timestamp,
            blockNumber: block.number,
            exists: true,
            issuerName: issuerNames[msg.sender],
            isRevoked: false
        });

        // Store record
        records[_certId] = newRecord;
        certificateIds.push(_certId);
        totalRecords++;

        // Emit event
        emit AlumniRecordAdded(_certId, _dataHash, msg.sender, issuerNames[msg.sender], block.timestamp, block.number);

        return (true, block.timestamp, block.number);
    }

    /**
     * @dev Revoke an alumni record by certificate ID
     * @param _certId Unique certificate ID
     */
    function revokeAlumniRecord(string memory _certId) external onlyAuthorizedIssuer certIdExists(_certId) {
        require(!records[_certId].isRevoked, "Record is already revoked");
        records[_certId].isRevoked = true;
        emit RecordRevoked(_certId, msg.sender, block.timestamp);
    }

    /**
     * @dev Verify an alumni record by certificate ID
     * @param _certId Certificate ID to verify
     * @param _dataHash Hash to verify against stored hash
     * @return isValid Boolean indicating if record is valid
     * @return issuer Address of the issuer
     * @return issuerName Name of the issuing institution
     * @return timestamp When the record was added
     * @return blockNumber Block number when record was added
     * @return isRevoked Boolean indicating if record is revoked
     */
    function verifyRecord(string memory _certId, bytes32 _dataHash)
        external
        certIdExists(_certId)
        returns (bool isValid, address issuer, string memory issuerName, uint256 timestamp, uint256 blockNumber, bool isRevoked)
    {
        AlumniRecord memory record = records[_certId];

        // Check if provided hash matches stored hash
        isValid = (record.dataHash == _dataHash);

        emit RecordVerified(_certId, isValid);

        return (isValid, record.issuer, record.issuerName, record.timestamp, record.blockNumber, record.isRevoked);
    }

    /**
     * @dev Get record details by certificate ID (without hash verification)
     * @param _certId Certificate ID to query
     * @return dataHash Stored hash of the record
     * @return issuer Address of the issuer
     * @return issuerName Name of the issuing institution
     * @return timestamp When the record was added
     * @return blockNumber Block number when record was added
     * @return exists Boolean indicating if record exists
     * @return isRevoked Boolean indicating if record is revoked
     */
    function getRecord(string memory _certId)
        external
        view
        returns (
            bytes32 dataHash,
            address issuer,
            string memory issuerName,
            uint256 timestamp,
            uint256 blockNumber,
            bool exists,
            bool isRevoked
        )
    {
        AlumniRecord memory record = records[_certId];

        return (record.dataHash, record.issuer, record.issuerName, record.timestamp, record.blockNumber, record.exists, record.isRevoked);
    }

    /**
     * @dev Check if a certificate ID exists
     * @param _certId Certificate ID to check
     * @return exists Boolean indicating existence
     */
    function recordExists(string memory _certId) external view returns (bool exists) {
        return records[_certId].exists;
    }

    /**
     * @dev Get all certificate IDs
     * @return Array of all certificate IDs
     */
    function getAllCertificateIds() external view returns (string[] memory) {
        return certificateIds;
    }

    /**
     * @dev Get total number of records
     * @return Total number of records
     */
    function getTotalRecords() external view returns (uint256) {
        return totalRecords;
    }

    /**
     * @dev Check if an address is authorized issuer
     * @param _address Address to check
     * @return Boolean indicating if address is authorized
     */
    function isAuthorizedIssuer(address _address) external view returns (bool) {
        return authorizedIssuers[_address];
    }

    /**
     * @dev Get issuer name by address
     * @param _issuer Address of the issuer
     * @return Name of the institution
     */
    function getIssuerName(address _issuer) external view returns (string memory) {
        return issuerNames[_issuer];
    }

    // ============================================
    // HELPER FUNCTIONS FOR FRONTEND/BACKEND
    // ============================================

    /**
     * @dev Generate hash from alumni data (to be called by backend)
     * @param _name Alumni name
     * @param _rollNumber Roll number
     * @param _degree Degree
     * @param _branch Branch
     * @param _graduationYear Graduation year
     * @param _certId Certificate ID
     * @return Hash of the data
     */
    function generateDataHash(
        string memory _name,
        string memory _rollNumber,
        string memory _degree,
        string memory _branch,
        string memory _graduationYear,
        string memory _certId
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_name, _rollNumber, _degree, _branch, _graduationYear, _certId));
    }
}
