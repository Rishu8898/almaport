// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {AlumniVerification} from "../src/AlumniVerification.sol";

/**
 * @title AlumniVerificationTest
 * @dev Comprehensive test suite for AlumniVerification contract
 */
contract AlumniVerificationTest is Test {
    AlumniVerification public alumniVerification;

    address public owner;
    address public issuer1;
    address public issuer2;
    address public unauthorized;

    string constant INSTITUTION_NAME = "Test University";
    string constant ISSUER1_NAME = "College of Engineering";
    string constant ISSUER2_NAME = "College of Science";

    // Sample alumni data
    string constant SAMPLE_NAME = "Saurabh Singh";
    string constant SAMPLE_ROLL = "2214094";
    string constant SAMPLE_DEGREE = "B.Tech";
    string constant SAMPLE_BRANCH = "Information Technology";
    string constant SAMPLE_YEAR = "2026";
    string constant SAMPLE_CERT_ID = "CERT-2025-TEST001";

    event AlumniRecordAdded(
        string indexed certId,
        bytes32 dataHash,
        address indexed issuer,
        string issuerName,
        uint256 timestamp,
        uint256 blockNumber
    );

    event IssuerAuthorized(address indexed issuer, string name);
    event IssuerRevoked(address indexed issuer);
    event RecordVerified(string indexed certId, bool isValid);

    function setUp() public {
        owner = address(this);
        issuer1 = makeAddr("issuer1");
        issuer2 = makeAddr("issuer2");
        unauthorized = makeAddr("unauthorized");

        // Deploy contract
        alumniVerification = new AlumniVerification(INSTITUTION_NAME);
    }

    // ============================================
    // DEPLOYMENT TESTS
    // ============================================

    function test_Deployment() public view {
        assertEq(alumniVerification.owner(), owner);
        assertTrue(alumniVerification.authorizedIssuers(owner));
        assertEq(alumniVerification.issuerNames(owner), INSTITUTION_NAME);
        assertEq(alumniVerification.totalRecords(), 0);
    }

    // ============================================
    // AUTHORIZATION TESTS
    // ============================================

    function test_AuthorizeIssuer() public {
        vm.expectEmit(true, false, false, true);
        emit IssuerAuthorized(issuer1, ISSUER1_NAME);

        alumniVerification.authorizeIssuer(issuer1, ISSUER1_NAME);

        assertTrue(alumniVerification.authorizedIssuers(issuer1));
        assertEq(alumniVerification.issuerNames(issuer1), ISSUER1_NAME);
    }

    function test_RevertWhen_NonOwnerAuthorizesIssuer() public {
        vm.prank(unauthorized);
        vm.expectRevert("Only owner can call this function");
        alumniVerification.authorizeIssuer(issuer1, ISSUER1_NAME);
    }

    function test_RevertWhen_AuthorizingZeroAddress() public {
        vm.expectRevert("Invalid issuer address");
        alumniVerification.authorizeIssuer(address(0), ISSUER1_NAME);
    }

    function test_RevertWhen_AuthorizingExistingIssuer() public {
        alumniVerification.authorizeIssuer(issuer1, ISSUER1_NAME);

        vm.expectRevert("Issuer already authorized");
        alumniVerification.authorizeIssuer(issuer1, "Another Name");
    }

    function test_RevokeIssuer() public {
        // First authorize
        alumniVerification.authorizeIssuer(issuer1, ISSUER1_NAME);
        assertTrue(alumniVerification.authorizedIssuers(issuer1));

        // Then revoke
        vm.expectEmit(true, false, false, false);
        emit IssuerRevoked(issuer1);

        alumniVerification.revokeIssuer(issuer1);
        assertFalse(alumniVerification.authorizedIssuers(issuer1));
    }

    function test_RevertWhen_RevokingUnauthorizedIssuer() public {
        vm.expectRevert("Issuer not authorized");
        alumniVerification.revokeIssuer(unauthorized);
    }

    function test_RevertWhen_RevokingOwner() public {
        vm.expectRevert("Cannot revoke owner");
        alumniVerification.revokeIssuer(owner);
    }

    // ============================================
    // OWNERSHIP TESTS
    // ============================================

    function test_TransferOwnership() public {
        address newOwner = makeAddr("newOwner");

        alumniVerification.transferOwnership(newOwner);

        assertEq(alumniVerification.owner(), newOwner);
        assertTrue(alumniVerification.authorizedIssuers(newOwner));
    }

    function test_RevertWhen_TransferringToZeroAddress() public {
        vm.expectRevert("Invalid new owner address");
        alumniVerification.transferOwnership(address(0));
    }

    function test_RevertWhen_TransferringToCurrentOwner() public {
        vm.expectRevert("Already the owner");
        alumniVerification.transferOwnership(owner);
    }

    // ============================================
    // ADD RECORD TESTS
    // ============================================

    function test_AddAlumniRecord() public {
        bytes32 dataHash = alumniVerification.generateDataHash(
            SAMPLE_NAME, SAMPLE_ROLL, SAMPLE_DEGREE, SAMPLE_BRANCH, SAMPLE_YEAR, SAMPLE_CERT_ID
        );

        vm.expectEmit(true, true, false, true);
        emit AlumniRecordAdded(SAMPLE_CERT_ID, dataHash, owner, INSTITUTION_NAME, block.timestamp, block.number);

        (bool success, uint256 timestamp, uint256 blockNumber) =
            alumniVerification.addAlumniRecord(SAMPLE_CERT_ID, dataHash);

        assertTrue(success);
        assertEq(timestamp, block.timestamp);
        assertEq(blockNumber, block.number);
        assertEq(alumniVerification.totalRecords(), 1);
        assertTrue(alumniVerification.recordExists(SAMPLE_CERT_ID));
    }

    function test_AddMultipleRecords() public {
        // Add first record
        bytes32 hash1 = alumniVerification.generateDataHash("Student One", "001", "B.Tech", "CS", "2025", "CERT-001");
        alumniVerification.addAlumniRecord("CERT-001", hash1);

        // Add second record
        bytes32 hash2 = alumniVerification.generateDataHash("Student Two", "002", "M.Tech", "IT", "2026", "CERT-002");
        alumniVerification.addAlumniRecord("CERT-002", hash2);

        assertEq(alumniVerification.totalRecords(), 2);

        string[] memory allCerts = alumniVerification.getAllCertificateIds();
        assertEq(allCerts.length, 2);
        assertEq(allCerts[0], "CERT-001");
        assertEq(allCerts[1], "CERT-002");
    }

    function test_RevertWhen_UnauthorizedAddsRecord() public {
        bytes32 dataHash = keccak256("test");

        vm.prank(unauthorized);
        vm.expectRevert("Not an authorized issuer");
        alumniVerification.addAlumniRecord("CERT-001", dataHash);
    }

    function test_RevertWhen_AddingDuplicateCertId() public {
        bytes32 dataHash = keccak256("test");

        alumniVerification.addAlumniRecord("CERT-001", dataHash);

        vm.expectRevert("Certificate ID already exists");
        alumniVerification.addAlumniRecord("CERT-001", dataHash);
    }

    function test_RevertWhen_AddingEmptyCertId() public {
        bytes32 dataHash = keccak256("test");

        vm.expectRevert("Certificate ID cannot be empty");
        alumniVerification.addAlumniRecord("", dataHash);
    }

    function test_RevertWhen_AddingEmptyHash() public {
        vm.expectRevert("Data hash cannot be empty");
        alumniVerification.addAlumniRecord("CERT-001", bytes32(0));
    }

    // ============================================
    // VERIFY RECORD TESTS
    // ============================================

    function test_VerifyRecord_Valid() public {
        bytes32 dataHash = alumniVerification.generateDataHash(
            SAMPLE_NAME, SAMPLE_ROLL, SAMPLE_DEGREE, SAMPLE_BRANCH, SAMPLE_YEAR, SAMPLE_CERT_ID
        );

        // Add record
        alumniVerification.addAlumniRecord(SAMPLE_CERT_ID, dataHash);

        // Verify with correct hash
        (bool isValid, address issuer, string memory issuerName, uint256 timestamp, uint256 blockNumber, bool isRevoked) =
            alumniVerification.verifyRecord(SAMPLE_CERT_ID, dataHash);

        assertTrue(isValid);
        assertEq(issuer, owner);
        assertEq(issuerName, INSTITUTION_NAME);
        assertEq(timestamp, block.timestamp);
        assertEq(blockNumber, block.number);
    }

    function test_VerifyRecord_Invalid() public {
        bytes32 dataHash = keccak256("correct");
        bytes32 wrongHash = keccak256("wrong");

        // Add record with correct hash
        alumniVerification.addAlumniRecord(SAMPLE_CERT_ID, dataHash);

        // Verify with wrong hash
        (bool isValid,,,,,) = alumniVerification.verifyRecord(SAMPLE_CERT_ID, wrongHash);

        assertFalse(isValid);
    }

    function test_RevertWhen_VerifyingNonExistentRecord() public {
        bytes32 dataHash = keccak256("test");

        vm.expectRevert("Certificate ID does not exist");
        alumniVerification.verifyRecord("NON-EXISTENT", dataHash);
    }

    // ============================================
    // GET RECORD TESTS
    // ============================================

    function test_GetRecord() public {
        bytes32 dataHash = alumniVerification.generateDataHash(
            SAMPLE_NAME, SAMPLE_ROLL, SAMPLE_DEGREE, SAMPLE_BRANCH, SAMPLE_YEAR, SAMPLE_CERT_ID
        );

        alumniVerification.addAlumniRecord(SAMPLE_CERT_ID, dataHash);

        (
            bytes32 storedHash,
            address issuer,
            string memory issuerName,
            uint256 timestamp,
            uint256 blockNumber,
            bool exists,
            bool isRevoked
        ) = alumniVerification.getRecord(SAMPLE_CERT_ID);

        assertEq(storedHash, dataHash);
        assertEq(issuer, owner);
        assertEq(issuerName, INSTITUTION_NAME);
        assertTrue(exists);
    }

    function test_GetRecord_NonExistent() public view {
        (
            bytes32 storedHash,
            address issuer,
            string memory issuerName,
            uint256 timestamp,
            uint256 blockNumber,
            bool exists,
            bool isRevoked
        ) = alumniVerification.getRecord("NON-EXISTENT");

        assertEq(storedHash, bytes32(0));
        assertEq(issuer, address(0));
        assertEq(issuerName, "");
        assertEq(timestamp, 0);
        assertEq(blockNumber, 0);
        assertFalse(exists);
    }

    // ============================================
    // HASH GENERATION TESTS
    // ============================================

    function test_GenerateDataHash() public view {
        bytes32 hash1 = alumniVerification.generateDataHash(
            SAMPLE_NAME, SAMPLE_ROLL, SAMPLE_DEGREE, SAMPLE_BRANCH, SAMPLE_YEAR, SAMPLE_CERT_ID
        );

        bytes32 hash2 = keccak256(
            abi.encodePacked(SAMPLE_NAME, SAMPLE_ROLL, SAMPLE_DEGREE, SAMPLE_BRANCH, SAMPLE_YEAR, SAMPLE_CERT_ID)
        );

        assertEq(hash1, hash2);
    }

    function test_GenerateDataHash_DifferentInputs() public view {
        bytes32 hash1 = alumniVerification.generateDataHash("Name1", "001", "B.Tech", "CS", "2025", "CERT-001");

        bytes32 hash2 = alumniVerification.generateDataHash("Name2", "002", "M.Tech", "IT", "2026", "CERT-002");

        assertTrue(hash1 != hash2);
    }

    // ============================================
    // VIEW FUNCTION TESTS
    // ============================================

    function test_GetAllCertificateIds() public {
        // Add multiple records
        for (uint256 i = 1; i <= 5; i++) {
            string memory certId = string(abi.encodePacked("CERT-", vm.toString(i)));
            bytes32 dataHash = keccak256(abi.encodePacked(i));
            alumniVerification.addAlumniRecord(certId, dataHash);
        }

        string[] memory allIds = alumniVerification.getAllCertificateIds();
        assertEq(allIds.length, 5);
    }

    function test_IsAuthorizedIssuer() public {
        assertTrue(alumniVerification.isAuthorizedIssuer(owner));
        assertFalse(alumniVerification.isAuthorizedIssuer(unauthorized));

        alumniVerification.authorizeIssuer(issuer1, ISSUER1_NAME);
        assertTrue(alumniVerification.isAuthorizedIssuer(issuer1));
    }

    function test_GetIssuerName() public {
        assertEq(alumniVerification.getIssuerName(owner), INSTITUTION_NAME);

        alumniVerification.authorizeIssuer(issuer1, ISSUER1_NAME);
        assertEq(alumniVerification.getIssuerName(issuer1), ISSUER1_NAME);
    }

    // ============================================
    // INTEGRATION TESTS
    // ============================================

    function test_CompleteWorkflow() public {
        // 1. Authorize a new issuer
        alumniVerification.authorizeIssuer(issuer1, ISSUER1_NAME);

        // 2. Add record as authorized issuer
        bytes32 dataHash = alumniVerification.generateDataHash(
            SAMPLE_NAME, SAMPLE_ROLL, SAMPLE_DEGREE, SAMPLE_BRANCH, SAMPLE_YEAR, SAMPLE_CERT_ID
        );

        vm.prank(issuer1);
        alumniVerification.addAlumniRecord(SAMPLE_CERT_ID, dataHash);

        // 3. Verify the record
        (bool isValid, address issuer,,,,) = alumniVerification.verifyRecord(SAMPLE_CERT_ID, dataHash);

        assertTrue(isValid);
        assertEq(issuer, issuer1);

        // 4. Check total records
        assertEq(alumniVerification.totalRecords(), 1);
    }
}
