// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {AlumniVerification} from "../src/AlumniVerification.sol";

/**
 * @title DeployAlumniVerification
 * @dev Deployment script for AlumniVerification contract
 * @notice Run with: forge script script/DeployAlumniVerification.s.sol --rpc-url <RPC_URL> --broadcast --verify
 */
contract DeployAlumniVerification is Script {
    // Default institution name
    string constant DEFAULT_INSTITUTION = "XYZ University";

    /**
     * @dev Main deployment function
     * @return alumniVerification Deployed contract instance
     */
    function run() external returns (AlumniVerification) {
        // Get institution name from environment variable or use default
        string memory institutionName = vm.envOr("INSTITUTION_NAME", DEFAULT_INSTITUTION);

        // Get deployer private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);

        // Deploy the contract
        AlumniVerification alumniVerification = new AlumniVerification(institutionName);

        // Stop broadcasting
        vm.stopBroadcast();

        // Log deployment details
        console.log("====================================");
        console.log("AlumniVerification Contract Deployed!");
        console.log("====================================");
        console.log("Contract Address:", address(alumniVerification));
        console.log("Owner Address:", alumniVerification.owner());
        console.log("Institution Name:", institutionName);
        console.log("Chain ID:", block.chainid);
        console.log("Block Number:", block.number);
        console.log("====================================");

        return alumniVerification;
    }

    /**
     * @dev Helper function to deploy with custom institution name
     * @param institutionName Name of the institution
     * @return alumniVerification Deployed contract instance
     */
    function deployWithCustomName(string memory institutionName) external returns (AlumniVerification) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);
        AlumniVerification alumniVerification = new AlumniVerification(institutionName);
        vm.stopBroadcast();

        console.log("Contract deployed at:", address(alumniVerification));
        console.log("Institution:", institutionName);

        return alumniVerification;
    }
}

/**
 * @title SetupAlumniVerification
 * @dev Script to setup additional issuers after deployment
 * @notice Run after deployment to add more authorized issuers
 */
contract SetupAlumniVerification is Script {
    /**
     * @dev Add multiple authorized issuers to existing contract
     * @param contractAddress Address of deployed AlumniVerification contract
     * @param issuers Array of issuer addresses to authorize
     * @param names Array of institution names corresponding to issuers
     */
    function addIssuers(address contractAddress, address[] memory issuers, string[] memory names) external {
        require(issuers.length == names.length, "Arrays length mismatch");

        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        AlumniVerification alumniVerification = AlumniVerification(contractAddress);

        vm.startBroadcast(deployerPrivateKey);

        for (uint256 i = 0; i < issuers.length; i++) {
            alumniVerification.authorizeIssuer(issuers[i], names[i]);
            console.log("Authorized issuer:", issuers[i]);
            console.log("Institution:", names[i]);
        }

        vm.stopBroadcast();

        console.log("====================================");
        console.log("Successfully added", issuers.length, "issuer(s)");
        console.log("====================================");
    }

    /**
     * @dev Add a single issuer
     * @param contractAddress Address of deployed AlumniVerification contract
     * @param issuer Issuer address to authorize
     * @param institutionName Name of the institution
     */
    function addSingleIssuer(address contractAddress, address issuer, string memory institutionName) external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        AlumniVerification alumniVerification = AlumniVerification(contractAddress);

        vm.startBroadcast(deployerPrivateKey);
        alumniVerification.authorizeIssuer(issuer, institutionName);
        vm.stopBroadcast();

        console.log("====================================");
        console.log("Issuer authorized successfully!");
        console.log("====================================");
        console.log("Issuer Address:", issuer);
        console.log("Institution:", institutionName);
        console.log("====================================");
    }
}

/**
 * @title TestAlumniVerification
 * @dev Script to test the deployed contract with sample data
 */
contract TestAlumniVerification is Script {
    /**
     * @dev Test the contract by adding a sample alumni record
     * @param contractAddress Address of deployed AlumniVerification contract
     */
    function testAddRecord(address contractAddress) external {
        AlumniVerification alumniVerification = AlumniVerification(contractAddress);

        // Sample data
        string memory name = "Saurabh Singh";
        string memory rollNumber = "2214094";
        string memory degree = "B.Tech";
        string memory branch = "Information Technology";
        string memory graduationYear = "2026";
        string memory certId = "CERT-2025-TEST001";

        // Generate hash
        bytes32 dataHash = alumniVerification.generateDataHash(name, rollNumber, degree, branch, graduationYear, certId);

        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        // Add record
        (bool success, uint256 timestamp, uint256 blockNumber) = alumniVerification.addAlumniRecord(certId, dataHash);

        vm.stopBroadcast();

        require(success, "Failed to add record");

        console.log("====================================");
        console.log("Test Record Added Successfully!");
        console.log("====================================");
        console.log("Certificate ID:", certId);
        console.log("Student Name:", name);
        console.log("Roll Number:", rollNumber);
        console.log("Data Hash:", vm.toString(dataHash));
        console.log("Timestamp:", timestamp);
        console.log("Block Number:", blockNumber);
        console.log("====================================");
    }

    /**
     * @dev Test verification of an existing record
     * @param contractAddress Address of deployed AlumniVerification contract
     * @param certId Certificate ID to verify
     */
    function testVerifyRecord(address contractAddress, string memory certId) external {
        AlumniVerification alumniVerification = AlumniVerification(contractAddress);

        // Get record first
        (
            bytes32 dataHash,
            address issuer,
            string memory issuerName,
            uint256 timestamp,
            uint256 blockNumber,
            bool exists,
            bool isRevoked
        ) = alumniVerification.getRecord(certId);

        require(exists, "Record does not exist");

        console.log("====================================");
        console.log("Record Details:");
        console.log("====================================");
        console.log("Certificate ID:", certId);
        console.log("Data Hash:", vm.toString(dataHash));
        console.log("Issuer:", issuer);
        console.log("Institution:", issuerName);
        console.log("Timestamp:", timestamp);
        console.log("Block Number:", blockNumber);
        console.log("====================================");
    }
}
